export type AxisId = 'energy' | 'temper' | 'plan' | 'ground' | 'bond'

/** 모든 점술이 공유하는 성향 축. 값 범위는 -1 ~ +1. */
export interface Axis {
  id: AxisId
  neg: string
  pos: string
  /** 합의 판정이 났을 때 요약에 쓸 문장 */
  sentence: { neg: string; pos: string }
}

export type AxisScores = Partial<Record<AxisId, number>>

export interface Fact {
  label: string
  value: string
}

/** 점술 하나가 내놓는 결과 */
export interface Reading {
  id: string
  name: string
  emoji: string
  /** 카드 상단 한 줄 */
  headline: string
  /** 본문 문단 */
  body: string[]
  /** 계산 근거 (간지, kin 번호 등) */
  facts: Fact[]
  /** 공통 축 점수. 축을 안 내는 점술은 비워둔다 */
  axes: AxisScores
  /** 정확도가 낮거나 출처가 불분명한 항목에 붙이는 꼬리표 */
  caveat?: string
}

export interface BirthInput {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  /** 시간을 모르는 경우 시주를 계산하지 않는다 */
  timeUnknown: boolean
  mbti: string
  blood: 'A' | 'B' | 'O' | 'AB'
  /** 대운은 방향이 성별에 따라 갈린다. 양남음녀는 순행, 음남양녀는 역행. */
  gender: 'male' | 'female'
}

export type Engine = (input: BirthInput) => Reading
