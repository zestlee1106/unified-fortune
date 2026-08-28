import type { BirthInput } from './types'

/**
 * 같은 조합을 가진 사람이 얼마나 드문지 어림한다.
 *
 * 점술 열한 가지를 나열해봐야 서로 겹치는 게 많아서 그걸 다 곱하면 안 된다.
 * 사주도 띠도 별자리도 태국 요일점도 전부 생일 하나에서 나오기 때문이다.
 * 그래서 실제로 독립인 것만 곱한다. 생일, 태어난 시진, MBTI, 혈액형, 성별.
 *
 * 생년은 뺐다. 넣으면 "동갑일 것"까지 요구하게 되어 조건이 달라진다.
 */

/** 대한민국 혈액형 분포. 널리 인용되는 대략치다. */
const BLOOD_SHARE: Record<BirthInput['blood'], number> = {
  A: 0.34,
  B: 0.27,
  O: 0.28,
  AB: 0.11,
}

const DAYS_IN_YEAR = 365.25
/** 사주에서 하루는 두 시간짜리 열두 시진으로 나뉜다. */
const SIJIN = 12
const MBTI_TYPES = 16
const GENDERS = 2

/** 대한민국 인구 어림수 */
const KOREA_POPULATION = 51_000_000

export interface Rarity {
  /** 몇 명 중 한 명인지 */
  oneIn: number
  /** 대한민국에 대략 몇 명일지 */
  inKorea: number
  /** 어떤 조건을 곱했는지 화면에 그대로 보여준다 */
  factors: { label: string; value: string }[]
  timeUnknown: boolean
}

function commas(n: number): string {
  return Math.round(n).toLocaleString('ko-KR')
}

export function computeRarity(input: BirthInput): Rarity {
  const bloodShare = BLOOD_SHARE[input.blood]

  const factors = [
    { label: '같은 날 태어날 확률', value: `365일 중 하루` },
    ...(input.timeUnknown
      ? []
      : [{ label: '같은 시진', value: '열두 시진 중 하나' }]),
    { label: '같은 MBTI', value: '열여섯 유형 중 하나' },
    {
      label: `같은 혈액형(${input.blood}형)`,
      value: `한국인의 ${Math.round(bloodShare * 100)}%`,
    },
    { label: '같은 성별', value: '둘 중 하나' },
  ]

  const denominator =
    DAYS_IN_YEAR *
    (input.timeUnknown ? 1 : SIJIN) *
    MBTI_TYPES *
    GENDERS *
    (1 / bloodShare)

  return {
    oneIn: denominator,
    inKorea: KOREA_POPULATION / denominator,
    factors,
    timeUnknown: input.timeUnknown,
  }
}

export function rarityHeadline(r: Rarity): string {
  return `${commas(r.oneIn)}명 중 한 명`
}

/** 공유 카드처럼 자리가 좁은 곳에서 쓴다. 412,518 -> 41만 */
export function rarityCompact(r: Rarity): string {
  const n = r.oneIn
  if (n >= 10000) {
    const man = n / 10000
    const label = man >= 10 ? String(Math.round(man)) : man.toFixed(1)
    return `${label}만 명 중 한 명`
  }
  return `${commas(n)}명 중 한 명`
}

export function rarityKorea(r: Rarity): string {
  const n = r.inKorea
  if (n < 1) return '전국에 당신 한 명뿐일 수도 있습니다'
  if (n < 10) return `대한민국에 ${Math.round(n)}명 남짓`
  return `대한민국에 약 ${commas(Math.round(n / 10) * 10)}명`
}
