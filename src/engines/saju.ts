import { Solar } from 'lunar-javascript'
import type { Element } from '../data/hanja'
import {
  ELEMENT_HANJA,
  GAN_ELEMENT,
  GAN_KO,
  JI_ELEMENT,
  ganZhiToKo,
} from '../data/hanja'
import { DAY_GAN_TEXT, SEASON } from '../data/sajuText'
import { josa } from '../core/josa'
import type { AxisScores, BirthInput, Reading } from '../core/types'

export interface SajuPillars {
  year: string
  month: string
  day: string
  time: string | null
  dayGan: string
  elements: Record<Element, number>
  dominant: Element
  missing: Element[]
}

const ALL_ELEMENTS: Element[] = ['목', '화', '토', '금', '수']

/** 오행 하나가 성향 축에 미치는 방향. 사주 해석의 통상적인 상징에 맞춘 것. */
const ELEMENT_AXES: Record<Element, AxisScores> = {
  목: { plan: 0.5, energy: 0.3, ground: -0.2, bond: 0.3 },
  화: { temper: 0.9, energy: 0.7, plan: -0.3, bond: 0.4 },
  토: { ground: 0.8, plan: 0.5, temper: -0.4, bond: 0.2 },
  금: { plan: 0.7, ground: 0.4, bond: -0.6, temper: -0.2 },
  수: { energy: -0.7, ground: -0.6, temper: -0.5, bond: -0.2 },
}

const ELEMENT_TRAIT: Record<Element, string> = {
  목: '뻗어나가려는 기운. 멈춰 있는 상태를 답답해합니다.',
  화: '타오르는 기운. 감정이 빠르게 올라오고 그만큼 빨리 식습니다.',
  토: '버티는 기운. 주변이 흔들려도 자기 자리를 지킵니다.',
  금: '자르는 기운. 기준이 분명하고 아닌 건 아니라고 합니다.',
  수: '스며드는 기운. 겉으로 드러내기보다 안에서 오래 굴립니다.',
}

const ELEMENT_LACK: Record<Element, string> = {
  목: '새로 시작하는 일에 유난히 시동이 안 걸립니다.',
  화: '들뜨는 일이 잘 없어서 재미없다는 소리를 듣습니다.',
  토: '한자리에 오래 머무는 걸 답답해합니다.',
  금: '끊어내야 할 관계를 질질 끄는 편입니다.',
  수: '한 박자 쉬고 생각하는 게 잘 안 됩니다.',
}

export function computePillars(input: BirthInput): SajuPillars {
  // 시간을 모르면 정오로 잡아 계산하되 시주는 버린다.
  const hour = input.timeUnknown ? 12 : input.hour
  const minute = input.timeUnknown ? 0 : input.minute
  const solar = Solar.fromYmdHms(
    input.year,
    input.month,
    input.day,
    hour,
    minute,
    0,
  )
  const ec = solar.getLunar().getEightChar()

  const year = ec.getYear()
  const month = ec.getMonth()
  const day = ec.getDay()
  const time = input.timeUnknown ? null : ec.getTime()

  const elements: Record<Element, number> = {
    목: 0, 화: 0, 토: 0, 금: 0, 수: 0,
  }
  const pillars = [year, month, day, ...(time ? [time] : [])]
  for (const p of pillars) {
    const gan = GAN_ELEMENT[p[0]]
    const ji = JI_ELEMENT[p[1]]
    if (gan) elements[gan] += 1
    if (ji) elements[ji] += 1
  }

  const dominant = ALL_ELEMENTS.reduce((best, e) =>
    elements[e] > elements[best] ? e : best,
  )
  const missing = ALL_ELEMENTS.filter((e) => elements[e] === 0)

  return { year, month, day, time, dayGan: ec.getDayGan(), elements, dominant, missing }
}

export function sajuEngine(input: BirthInput): Reading {
  const p = computePillars(input)
  const total = Object.values(p.elements).reduce((a, b) => a + b, 0)

  // 단순 가중 평균을 쓰면 오행들이 서로 상쇄돼서 값이 0 근처로 뭉친다.
  // 그래서 균등 분포(각 20%) 대비 얼마나 치우쳤는지를 가중치로 쓴다.
  // 없는 오행은 음의 편차가 되어 그 성질의 반대쪽으로 밀리는데,
  // 이건 "빠진 오행의 결핍이 성격으로 드러난다"는 명리 해석과도 맞는다.
  const EVEN = 1 / ALL_ELEMENTS.length
  const SCALE = 3
  const axes: AxisScores = {}
  for (const el of ALL_ELEMENTS) {
    const deviation = p.elements[el] / total - EVEN
    for (const [axisId, value] of Object.entries(ELEMENT_AXES[el])) {
      const key = axisId as keyof AxisScores
      axes[key] = (axes[key] ?? 0) + value * deviation * SCALE
    }
  }
  for (const key of Object.keys(axes) as (keyof AxisScores)[]) {
    axes[key] = Math.max(-1, Math.min(1, axes[key] ?? 0))
  }

  const dominantCount = p.elements[p.dominant]
  const gan = DAY_GAN_TEXT[p.dayGan]
  const season = SEASON[p.month[1]]

  const body: string[] = []

  // 일간이 곧 본인이라 이걸 먼저 말한다.
  if (gan) {
    body.push(
      `일간이 ${p.dayGan}(${GAN_KO[p.dayGan]})입니다. 사주에서 일간은 나 자신을 가리키고, ${p.dayGan}${josa(GAN_KO[p.dayGan], '은는')} ${gan.image}에 비유합니다. ${gan.line}`,
    )
  }

  if (season) {
    body.push(`태어난 달은 ${season.name}입니다. ${season.line}`)
  }

  // 최다 오행이 여럿이면 "제일 많다"고만 하면 어색하다.
  const tied = ALL_ELEMENTS.filter(
    (e) => e !== p.dominant && p.elements[e] === dominantCount,
  )
  if (tied.length > 0) {
    const names = [p.dominant, ...tied]
      .map((e) => `${ELEMENT_HANJA[e]}(${e})`)
      .join('와 ')
    body.push(
      `여덟 글자를 오행으로 나눠보면 ${names}가 ${dominantCount}개씩으로 같이 제일 많습니다. 두 기운이 팽팽해서 상황에 따라 다른 사람처럼 보일 수 있습니다. ${ELEMENT_TRAIT[p.dominant]}`,
    )
  } else {
    body.push(
      `여덟 글자를 오행으로 나눠보면 ${ELEMENT_HANJA[p.dominant]}(${p.dominant})가 ${dominantCount}개로 제일 많습니다. ${ELEMENT_TRAIT[p.dominant]}`,
    )
  }

  if (p.missing.length > 0) {
    const lacked = p.missing[0]
    body.push(
      `대신 ${ELEMENT_HANJA[lacked]}(${lacked})가 하나도 없습니다. ${ELEMENT_LACK[lacked]} 이걸 채워주는 사람이 옆에 있으면 확실히 편해집니다.`,
    )
  } else {
    body.push(
      '다섯 기운이 하나도 빠짐없이 들어있습니다. 어디에 놔둬도 그럭저럭 굴러가는 대신, 뭐 하나 압도적으로 튀는 것도 없는 구성입니다.',
    )
  }

  // 오행이 몇 종류나 들어있는지로 균형을 한 줄 더 말한다.
  const kinds = ALL_ELEMENTS.filter((e) => p.elements[e] > 0).length
  if (kinds <= 2) {
    body.push(
      '오행이 두 종류 안에서만 놀고 있습니다. 이런 구성은 한 방향으로 확실히 밀어붙이는 힘이 있는 대신, 그 방향이 막히면 대안을 찾기가 어렵습니다.',
    )
  } else if (dominantCount >= 4) {
    body.push(
      `${ELEMENT_HANJA[p.dominant]} 하나가 절반 이상을 차지합니다. 잘 맞는 자리에서는 남들이 못 따라오는데, 안 맞는 자리에 놓이면 유난히 힘들어집니다.`,
    )
  }

  if (input.timeUnknown) {
    body.push('태어난 시각을 몰라서 시주는 뺐습니다. 시간을 넣으면 결과가 꽤 달라집니다.')
  }

  const facts = [
    { label: '년주', value: `${p.year} ${ganZhiToKo(p.year)}` },
    { label: '월주', value: `${p.month} ${ganZhiToKo(p.month)}` },
    { label: '일주', value: `${p.day} ${ganZhiToKo(p.day)}` },
    {
      label: '시주',
      value: p.time ? `${p.time} ${ganZhiToKo(p.time)}` : '시간 미상',
    },
    {
      label: '오행',
      value: ALL_ELEMENTS.map((e) => `${e}${p.elements[e]}`).join(' · '),
    },
  ]

  return {
    id: 'saju',
    name: '한국 사주',
    emoji: '🀄',
    headline: `${ELEMENT_HANJA[p.dominant]} 기운이 몰린 ${ganZhiToKo(p.day)}일주`,
    body,
    facts,
    axes,
  }
}
