import { Solar } from 'lunar-javascript'
import type { Element } from '../data/hanja'
import { GAN_ELEMENT, JI_ELEMENT, ganZhiToKo } from '../data/hanja'
import {
  GROUP_THEME,
  tenGodGroup,
  tenGodName,
  type TenGodGroup,
} from '../data/tenGods'
import type { BirthInput } from '../core/types'

/**
 * 십신 그룹이 얼마나 도움이 되는지. 신강·신약에 따라 뒤집힌다.
 * 도움/방해를 +1, -1 두 값으로만 주면 천간과 지지가 서로 상쇄돼서 점수가
 * 전부 0으로 뭉친다. 그러면 전성기를 고를 수가 없다. 그래서 그룹마다 세기를 나눈다.
 */
const FAVOR: Record<'strong' | 'weak', Record<TenGodGroup, number>> = {
  // 일간이 약하면 보태주는 쪽이 좋다. 나를 생하는 인성이 가장 반갑다.
  weak: { 인성: 1.0, 비겁: 0.8, 식상: -0.6, 재성: -0.7, 관성: -1.0 },
  // 일간이 강하면 덜어내는 쪽이 좋다. 힘을 쓸 대상인 재성이 가장 반갑다.
  strong: { 재성: 1.0, 식상: 0.8, 관성: 0.6, 인성: -0.8, 비겁: -1.0 },
}

/** 지지가 천간보다 실제 영향이 크다고 본다. */
const GAN_WEIGHT = 1.0
const JI_WEIGHT = 1.4

/** 전성기를 유년기 대운에서 뽑으면 말이 안 되므로 이 나이 이후에서만 고른다. */
const PEAK_MIN_AGE = 20

export interface DaeunPeriod {
  startAge: number
  endAge: number
  startYear: number
  endYear: number
  ganZhi: string
  ganZhiKo: string
  /** 천간 기준 십신 (예: 정재) */
  tenGod: string
  group: TenGodGroup
  keyword: string
  line: string
  /** -2.4 ~ +2.4. 이 시기가 사주에 도움이 되는 정도 */
  score: number
  /** 점수를 다섯 단계로 나눈 것. 화면에서 색과 문구에 쓴다. */
  grade: 'best' | 'good' | 'flat' | 'hard' | 'worst'
  isCurrent: boolean
  isPeak: boolean
}

export interface DaeunResult {
  /** 순행이면 true */
  forward: boolean
  /** 대운이 시작되는 나이 */
  startAge: number
  /** 신강이면 true */
  strong: boolean
  dayGan: string
  dayElement: Element
  /** 도움이 되는 십신 그룹 */
  favorable: TenGodGroup[]
  currentAge: number
  periods: DaeunPeriod[]
  current: DaeunPeriod | null
  peak: DaeunPeriod | null
  /** 다음 대운으로 넘어갈 때까지 남은 해 */
  yearsToNext: number | null
  next: DaeunPeriod | null
}

/**
 * 신강·신약을 간이로 판정한다.
 * 월지가 일간을 돕는지(득령)가 가장 무겁고, 나머지 글자는 하나씩 센다.
 * 실제 명리는 지장간·합충까지 보지만 여기서는 거기까지 가지 않는다.
 */
function judgeStrength(
  dayElement: Element,
  pillars: { gan: string; ji: string }[],
  monthJi: string,
): boolean {
  const helps = (el: Element | undefined) =>
    el ? tenGodGroup(dayElement, el) === '비겁' || tenGodGroup(dayElement, el) === '인성' : false

  let score = 0
  // 득령: 월지가 일간을 돕는지. 사주 전체에서 제일 큰 변수라 가중치를 크게 준다.
  score += helps(JI_ELEMENT[monthJi]) ? 3 : -3

  for (const [i, p] of pillars.entries()) {
    // 일간 자기 자신은 세지 않는다.
    if (i !== 2) score += helps(GAN_ELEMENT[p.gan]) ? 1 : -1
    if (p.ji !== monthJi) score += helps(JI_ELEMENT[p.ji]) ? 1 : -1
  }
  return score > 0
}

export function computeDaeun(input: BirthInput, today = new Date()): DaeunResult {
  const hour = input.timeUnknown ? 12 : input.hour
  const solar = Solar.fromYmdHms(
    input.year, input.month, input.day, hour, input.timeUnknown ? 0 : input.minute, 0,
  )
  const ec = solar.getLunar().getEightChar()

  const dayGan = ec.getDayGan()
  const dayElement = GAN_ELEMENT[dayGan]
  const pillars = [
    { gan: ec.getYearGan(), ji: ec.getYearZhi() },
    { gan: ec.getMonthGan(), ji: ec.getMonthZhi() },
    { gan: dayGan, ji: ec.getDayZhi() },
    ...(input.timeUnknown ? [] : [{ gan: ec.getTimeGan(), ji: ec.getTimeZhi() }]),
  ]
  const strong = judgeStrength(dayElement, pillars, ec.getMonthZhi())

  // 신강이면 기운을 덜어내는 쪽이, 신약이면 보태주는 쪽이 도움이 된다.
  const favorable: TenGodGroup[] = strong
    ? ['식상', '재성', '관성']
    : ['인성', '비겁']

  const yun = ec.getYun(input.gender === 'male' ? 1 : 0)
  const raw = yun.getDaYun()

  // 한국식 세는나이. lunar-javascript의 대운 나이도 1세부터 센다.
  const currentAge = today.getFullYear() - input.year + 1

  const periods: DaeunPeriod[] = []
  for (const d of raw) {
    const ganZhi = d.getGanZhi()
    // 첫 칸은 대운이 시작되기 전 구간이라 간지가 비어 있다. 건너뛴다.
    if (!ganZhi) continue

    const gan = ganZhi[0]
    const ji = ganZhi[1]
    const ganEl = GAN_ELEMENT[gan]
    const jiEl = JI_ELEMENT[ji]
    const group = tenGodGroup(dayElement, ganEl)

    // 천간과 지지 각각이 도움이 되는 쪽인지, 얼마나 그런지를 본다.
    const table = FAVOR[strong ? 'strong' : 'weak']
    const score =
      Math.round(
        (table[tenGodGroup(dayElement, ganEl)] * GAN_WEIGHT +
          table[tenGodGroup(dayElement, jiEl)] * JI_WEIGHT) *
          100,
      ) / 100

    const startAge = d.getStartAge()
    const endAge = d.getEndAge()
    const startYear = d.getStartYear()

    periods.push({
      startAge, endAge, startYear,
      endYear: startYear + (endAge - startAge),
      ganZhi,
      ganZhiKo: ganZhiToKo(ganZhi),
      tenGod: tenGodName(dayGan, dayElement, gan, ganEl),
      group,
      keyword: GROUP_THEME[group].keyword,
      line: GROUP_THEME[group].line,
      score,
      grade:
        score >= 1.5 ? 'best'
          : score >= 0.5 ? 'good'
            : score > -0.5 ? 'flat'
              : score > -1.5 ? 'hard'
                : 'worst',
      isCurrent: currentAge >= startAge && currentAge <= endAge,
      isPeak: false,
    })
  }

  // 전성기는 점수가 가장 높은 대운으로 본다.
  // 단 유년기는 후보에서 뺀다. 다섯 살이 인생의 전성기라는 결과는 아무 의미가 없다.
  const candidates = periods.filter((p) => p.endAge >= PEAK_MIN_AGE)
  let peak: DaeunPeriod | null = null
  for (const p of candidates) {
    if (!peak || p.score > peak.score) peak = p
  }
  if (peak) peak.isPeak = true

  const current = periods.find((p) => p.isCurrent) ?? null
  const currentIndex = current ? periods.indexOf(current) : -1
  const next = currentIndex >= 0 ? periods[currentIndex + 1] ?? null : periods[0] ?? null

  return {
    forward: yun.isForward(),
    startAge: periods[0]?.startAge ?? 0,
    strong,
    dayGan,
    dayElement,
    favorable,
    currentAge,
    periods,
    current,
    peak,
    yearsToNext: next ? next.startYear - today.getFullYear() : null,
    next,
  }
}
