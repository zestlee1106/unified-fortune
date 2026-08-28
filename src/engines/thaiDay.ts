import type { AxisScores, BirthInput, Reading } from '../core/types'

/**
 * 태국 요일점. 태국은 수요일을 낮/밤으로 나눠 여드레로 봅니다.
 * 요일 색은 널리 알려진 편이고(태국 국왕이 월요일생이라 노란색을 쓰는 식),
 * 불상 자세와 행성 배정은 자료마다 조금씩 다릅니다.
 */
interface ThaiDay {
  key: string
  name: string
  color: string
  colorHex: string
  buddha: string
  planet: string
  line: string
  axes: AxisScores
}

const DAYS: ThaiDay[] = [
  {
    key: 'sun', name: '일요일', color: '빨강', colorHex: '#d63a3a',
    buddha: '팡 타와이 넷 (눈을 뜨고 응시하는 자세)', planet: '태양',
    line: '자기 존재를 굳이 숨기지 않습니다. 어느 자리에 가도 있는지 없는지 티가 납니다.',
    axes: { energy: 0.8, temper: 0.7, bond: 0.2, ground: 0.3, plan: -0.2 },
  },
  {
    key: 'mon', name: '월요일', color: '노랑', colorHex: '#e5b62c',
    buddha: '팡 함 얏 (다툼을 말리는 자세)', planet: '달',
    line: '분위기가 험해지면 먼저 나서서 가라앉히는 쪽입니다. 그러느라 정작 자기 감정은 뒤로 밀립니다.',
    axes: { bond: 0.7, temper: -0.6, energy: -0.2, ground: -0.2, plan: 0.4 },
  },
  {
    key: 'tue', name: '화요일', color: '분홍', colorHex: '#e07ba0',
    buddha: '팡 사이얏 (누워 계신 자세)', planet: '화성',
    line: '겉은 부드러운데 결정적인 순간에 안 물러섭니다. 만만하게 봤다가 놀라는 사람이 꼭 나옵니다.',
    axes: { temper: 0.6, plan: 0.3, bond: 0.3, energy: 0.2 },
  },
  {
    key: 'wed-day', name: '수요일 낮', color: '초록', colorHex: '#3f9c5a',
    buddha: '팡 움 밧 (발우를 든 탁발 자세)', planet: '수성',
    line: '말로 푸는 재주가 있습니다. 협상이나 중재를 맡기면 어떻게든 그림을 만들어냅니다.',
    axes: { energy: 0.5, bond: 0.5, ground: 0.4, plan: 0.2 },
  },
  {
    key: 'wed-night', name: '수요일 밤', color: '진회색', colorHex: '#5a6270',
    buddha: '팡 빠레라이 (숲에서 코끼리와 원숭이의 시중을 받는 자세)', planet: '라후',
    line: '무리에서 한 발 떨어져 있습니다. 외롭다기보다 그 거리에서 더 잘 보이는 게 있는 쪽입니다.',
    axes: { energy: -0.8, bond: -0.6, ground: -0.4, plan: -0.2 },
  },
  {
    key: 'thu', name: '목요일', color: '주황', colorHex: '#e08a2c',
    buddha: '팡 사마티 (명상 자세)', planet: '목성',
    line: '판단이 무겁습니다. 남들이 조언을 구하러 오는데 정작 본인 일은 오래 끕니다.',
    axes: { plan: 0.6, ground: 0.3, temper: -0.5, energy: -0.3 },
  },
  {
    key: 'fri', name: '금요일', color: '하늘색', colorHex: '#4a9fd8',
    buddha: '팡 람 픙 (팔짱 끼고 사색하는 자세)', planet: '금성',
    line: '보기 좋은 것에 약합니다. 취향이 확고하고 그게 곧 자기 기준입니다.',
    axes: { bond: 0.6, ground: -0.3, energy: 0.4, temper: 0.2, plan: -0.3 },
  },
  {
    key: 'sat', name: '토요일', color: '보라', colorHex: '#7b5ab8',
    buddha: '팡 낙 쁘록 (나가가 감싸 보호하는 자세)', planet: '토성',
    line: '속을 잘 안 보여줍니다. 시간이 오래 걸리는 대신 한번 열면 잘 안 닫습니다.',
    axes: { energy: -0.7, plan: 0.6, bond: -0.4, temper: -0.3 },
  },
]

export function thaiDayEngine(input: BirthInput): Reading {
  const date = new Date(input.year, input.month - 1, input.day)
  const dow = date.getDay() // 0 = 일요일

  let day: ThaiDay
  if (dow === 3) {
    // 수요일은 낮/밤으로 갈린다. 통상 18시를 경계로 본다.
    const isNight = !input.timeUnknown && input.hour >= 18
    day = DAYS.find((d) => d.key === (isNight ? 'wed-night' : 'wed-day'))!
  } else {
    const map = ['sun', 'mon', 'tue', '', 'thu', 'fri', 'sat']
    day = DAYS.find((d) => d.key === map[dow])!
  }

  const body = [
    day.line,
    `수호색은 ${day.color}입니다. 태국에서는 중요한 날에 자기 요일 색을 입으면 기운이 붙는다고 봅니다. 시험이나 면접처럼 잘 되어야 하는 날에 ${day.color} 계열을 하나 걸치는 식입니다.`,
    `수호 행성은 ${day.planet}이고, 사원에 가면 ${day.buddha}를 모신 자리가 요일마다 따로 있습니다. 태국 사람들은 자기 요일 불상 앞에서 따로 기도합니다.`,
    '태국에서 요일은 한국의 띠 같은 위치입니다. 처음 만나면 무슨 요일에 태어났냐고 묻고, 그걸로 성격을 짐작합니다. 태국 국왕이 월요일생이라 월요일 색인 노란색이 왕실을 상징하는 색이 된 것도 이 체계에서 나왔습니다.',
  ]
  if (dow === 3) {
    body.push(
      input.timeUnknown
        ? '수요일생은 태국에서 낮과 밤을 다른 날로 칩니다. 태어난 시각을 몰라서 일단 낮으로 봤습니다.'
        : '수요일생은 태국에서 낮과 밤을 아예 다른 날로 칩니다. 그래서 요일은 여드레입니다.',
    )
  }

  return {
    id: 'thaiDay',
    name: '태국 요일점',
    emoji: '🛕',
    headline: `${day.name}생 · ${day.color}`,
    body,
    facts: [
      { label: '요일', value: day.name },
      { label: '수호색', value: day.color },
      { label: '수호 불상', value: day.buddha },
      { label: '행성', value: day.planet },
    ],
    axes: day.axes,
    caveat: '요일 색은 태국에서 널리 통용되지만, 불상 자세와 행성 배정은 자료마다 조금씩 다릅니다.',
  }
}

export const THAI_DAYS = DAYS
