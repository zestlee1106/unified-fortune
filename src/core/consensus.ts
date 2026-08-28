import { AXES, AXIS_BY_ID } from './axes'
import type { AxisId, Reading } from './types'

export interface AxisSummary {
  axisId: AxisId
  /** 참여한 점술들의 평균 (-1 ~ +1) */
  mean: number
  /** 표준편차. 0이면 완전 합의, 1에 가까울수록 정면 충돌 */
  spread: number
  /** 이 축에 점수를 낸 점술 수 */
  voters: number
  /** 축 양 끝을 대표하는 점술 */
  lowest: { reading: Reading; value: number } | null
  highest: { reading: Reading; value: number } | null
}

export interface Consensus {
  /** 0~100. 점술들이 서로 얼마나 같은 말을 하는지 */
  score: number
  /** 축별 상세 */
  axes: AxisSummary[]
  /** 가장 많이 동의한 축 */
  agreement: { summary: AxisSummary; sentence: string; voters: number } | null
  /** 가장 크게 갈린 축 */
  conflict: AxisSummary | null
}

function stddev(values: number[], mean: number): number {
  if (values.length < 2) return 0
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * @param excludeAxis 이미 다른 자리에서 쓴 축. 요약 화면이 같은 축을 두 번 말하지 않게 한다.
 */
export function buildConsensus(
  readings: Reading[],
  excludeAxis?: AxisId,
): Consensus {
  const summaries: AxisSummary[] = []

  for (const axis of AXES) {
    const voters = readings
      .map((r) => ({ reading: r, value: r.axes[axis.id] }))
      .filter((v): v is { reading: Reading; value: number } =>
        typeof v.value === 'number',
      )

    if (voters.length === 0) continue

    const values = voters.map((v) => v.value)
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const sorted = [...voters].sort((a, b) => a.value - b.value)

    summaries.push({
      axisId: axis.id,
      mean,
      spread: stddev(values, mean),
      voters: voters.length,
      lowest: sorted[0] ?? null,
      highest: sorted[sorted.length - 1] ?? null,
    })
  }

  // 축 전체의 평균 편차가 작을수록 합의도가 높다.
  const avgSpread =
    summaries.length === 0
      ? 0
      : summaries.reduce((a, s) => a + s.spread, 0) / summaries.length

  // 편차를 그대로 백분율로 쓰면 값이 전부 50% 근처로 뭉친다.
  // 서로 독립인 점술 열 가지를 평균 내면 중심극한정리대로 가운데로 몰리기 때문이다.
  // 실제로 3000건을 돌려보니 94%가 40~59 구간에 들어왔고, 그러면 게이지가
  // 아무 정보도 주지 못한다. 그래서 관측된 중앙값을 기준으로 눈금을 넓혀
  // 사람이 체감할 수 있는 범위로 편다. 순위는 그대로 보존된다.
  const OBSERVED_CENTER = 0.48 // 관측된 평균 편차의 중앙값
  const DISPLAY_CENTER = 60 // 그 지점을 몇 %로 보여줄지
  const STRETCH = 300 // 눈금 확대 배율
  const score = Math.round(
    Math.max(
      12,
      Math.min(96, DISPLAY_CENTER + (OBSERVED_CENTER - avgSpread) * STRETCH),
    ),
  )

  // 동의: 편차가 작으면서 한쪽으로 확실히 쏠린 축
  const agreementSummary = [...summaries]
    .filter((s) => s.voters >= 3 && s.axisId !== excludeAxis)
    .sort(
      (a, b) =>
        Math.abs(b.mean) * (1 - b.spread) - Math.abs(a.mean) * (1 - a.spread),
    )[0]

  let agreement: Consensus['agreement'] = null
  if (agreementSummary) {
    const axis = AXIS_BY_ID[agreementSummary.axisId]
    const dir = agreementSummary.mean >= 0 ? 'pos' : 'neg'
    // 평균과 같은 방향에 선 점술 수를 센다
    const sameSide = readings.filter((r) => {
      const v = r.axes[agreementSummary.axisId]
      return typeof v === 'number' && (dir === 'pos' ? v > 0 : v < 0)
    }).length
    agreement = {
      summary: agreementSummary,
      sentence: axis.sentence[dir],
      voters: sameSide,
    }
  }

  // 표본이 얇은 축은 편차가 쉽게 커진다. 그런 축이 매번 "최대 충돌"로 뽑히면
  // 결과가 뻔해지므로, 투표 수가 충분한 축을 우선한다.
  const maxVoters = Math.max(...summaries.map((s) => s.voters), 1)
  const conflict =
    [...summaries]
      .filter((s) => s.voters >= 3)
      .sort(
        (a, b) =>
          b.spread * (b.voters / maxVoters) - a.spread * (a.voters / maxVoters),
      )[0] ?? null

  return { score, axes: summaries, agreement, conflict }
}
