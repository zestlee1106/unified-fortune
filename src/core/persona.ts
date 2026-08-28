import type { Element } from '../data/hanja'
import { computePillars } from '../engines/saju'
import { AXIS_BY_ID } from './axes'
import type { Consensus } from './consensus'
import type { AxisId, BirthInput } from './types'

/**
 * 열한 가지 결과를 한 줄로 합친다.
 * 사주 오행이 앞을 맡고, 점술들이 가장 세게 합의한 축이 뒤를 맡는다.
 * 어느 한 체계의 말이 아니라 전부를 겹쳐야만 나오는 문장이라는 게 요점이다.
 */

const ELEMENT_OPENING: Record<Element, string> = {
  목: '뻗어나가려는 기운을 안고',
  화: '속에 불을 품고',
  토: '흔들리지 않는 땅을 딛고',
  금: '날을 세운 채',
  수: '깊은 물을 담고',
}

const AXIS_CLOSING: Record<AxisId, { pos: string; neg: string }> = {
  energy: { pos: '사람들 한가운데로 걸어가는 사람', neg: '끝내 혼자인 자리로 걷는 사람' },
  temper: { pos: '끝까지 타오르고 마는 사람', neg: '표정이 좀처럼 안 바뀌는 사람' },
  plan: { pos: '길을 먼저 그려두는 사람', neg: '걸어보고 나서 정하는 사람' },
  ground: { pos: '손에 잡히는 것만 믿는 사람', neg: '남들이 못 보는 걸 보는 사람' },
  bond: { pos: '결국 사람에게로 돌아오는 사람', neg: '혼자서도 끝내 서 있는 사람' },
}

export interface Persona {
  line: string
  element: Element
  axisId: AxisId
  /** 이 축에서 같은 방향에 선 점술 수 */
  backing: number
}

export function buildPersona(
  input: BirthInput,
  consensus: Consensus,
): Persona | null {
  const pillars = computePillars(input)
  const element = pillars.dominant

  // 가장 확실하게 한쪽으로 쏠린 축을 고른다. 편차가 큰 축은 대표성이 없으니 뺀다.
  const strongest = [...consensus.axes]
    .filter((a) => a.voters >= 3)
    .sort((a, b) => Math.abs(b.mean) * (1 - b.spread) - Math.abs(a.mean) * (1 - a.spread))[0]

  if (!strongest) return null

  const dir = strongest.mean >= 0 ? 'pos' : 'neg'
  const backing = consensus.axes.find((a) => a.axisId === strongest.axisId)?.voters ?? 0

  return {
    line: `${ELEMENT_OPENING[element]} ${AXIS_CLOSING[strongest.axisId][dir]}`,
    element,
    axisId: strongest.axisId,
    backing,
  }
}

/** 그 축에서 어느 점술들이 같은 편에 섰는지 이름을 모은다. */
export function supportersOf(
  consensus: Consensus,
  axisId: AxisId,
  readings: { name: string; axes: Partial<Record<AxisId, number>> }[],
): string[] {
  const summary = consensus.axes.find((a) => a.axisId === axisId)
  if (!summary) return []
  const wantPositive = summary.mean >= 0
  return readings
    .filter((r) => {
      const v = r.axes[axisId]
      return typeof v === 'number' && (wantPositive ? v > 0 : v < 0)
    })
    .map((r) => r.name)
}

export { AXIS_BY_ID }
