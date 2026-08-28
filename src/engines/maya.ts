import { seededPick } from '../core/rng'
import type { AxisScores, BirthInput, Reading } from '../core/types'

/**
 * 마야 촐킨 260일 주기.
 * GMT 상관계수 584283을 씁니다. 장기력 0.0.0.0.0 = 4 Ahau 8 Cumku = 율리우스일 584283.
 */
const CORRELATION = 584283

const SEALS = [
  '이믹스 (악어)', '이크 (바람)', '아크발 (밤)', '칸 (씨앗)', '치크찬 (뱀)',
  '시미 (죽음)', '마니크 (사슴)', '라마트 (별)', '물룩 (물)', '오크 (개)',
  '추엔 (원숭이)', '에브 (길)', '벤 (갈대)', '이슈 (재규어)', '멘 (독수리)',
  '킵 (전사)', '카반 (땅)', '에츠납 (거울)', '카왁 (폭풍)', '아하우 (태양)',
]

const SEAL_LINES = [
  '시작하는 힘이 있습니다. 남이 손 못 대는 초반을 맡으면 잘합니다.',
  '전하는 힘이 있습니다. 당신을 거치면 말이 정리돼서 나갑니다.',
  '안으로 파고듭니다. 답을 밖에서 찾는 타입이 아닙니다.',
  '가능성을 봅니다. 지금 아무것도 아닌 것에서 뭔가를 봅니다.',
  '본능이 예민합니다. 몸이 먼저 알아채는 순간이 잦습니다.',
  '놓을 줄 압니다. 끝난 걸 붙잡고 있지 않습니다.',
  '중심을 잡습니다. 흔들리는 상황에서 기준점 역할을 합니다.',
  '아름다운 걸 알아봅니다. 취향이 곧 무기입니다.',
  '감정이 흐릅니다. 담아두는 대신 흘려보내는 쪽입니다.',
  '충직합니다. 내 편이라고 정하면 계산을 멈춥니다.',
  '재미를 만듭니다. 어디 있든 판이 심심해지지 않습니다.',
  '길을 냅니다. 뒤에 오는 사람이 걸어올 수 있게 만듭니다.',
  '탐색합니다. 익숙한 데 오래 못 머뭅니다.',
  '마법 같은 순간을 만듭니다. 설명 안 되는 운이 붙습니다.',
  '멀리 봅니다. 지금이 아니라 나중을 기준으로 판단합니다.',
  '지혜를 모읍니다. 겪은 걸 그냥 흘려보내지 않습니다.',
  '흔듭니다. 가만한 판을 굳이 건드려서 움직이게 만듭니다.',
  '비춥니다. 남들이 안 보려는 걸 그대로 보여줍니다.',
  '변화를 몰고 옵니다. 조용한 곳에 있어도 뭔가 바뀝니다.',
  '밝힙니다. 결국 다 알게 되는 자리에 서 있습니다.',
]

const SEAL_AXES: AxisScores[] = [
  { energy: 0.4, plan: -0.3, ground: 0.3 }, { energy: 0.6, bond: 0.5, ground: -0.3 },
  { energy: -0.8, ground: -0.5 }, { plan: 0.5, ground: -0.3, bond: 0.2 },
  { temper: 0.7, ground: -0.2, energy: 0.3 }, { plan: -0.2, bond: -0.4, temper: -0.3 },
  { plan: 0.6, ground: 0.6, temper: -0.4 }, { ground: -0.5, bond: 0.4, energy: 0.3 },
  { temper: 0.4, bond: 0.6, ground: -0.5 }, { bond: 0.8, ground: 0.3 },
  { energy: 0.8, plan: -0.6, temper: 0.4 }, { bond: 0.6, plan: 0.4, ground: 0.3 },
  { energy: 0.5, plan: -0.7, bond: -0.3 }, { ground: -0.6, energy: -0.3, temper: 0.3 },
  { plan: 0.7, ground: -0.4, energy: -0.2 }, { plan: 0.5, ground: 0.4, energy: -0.5 },
  { temper: 0.6, bond: -0.3, plan: -0.4 }, { ground: 0.7, bond: -0.5, plan: 0.4 },
  { temper: 0.8, plan: -0.5, energy: 0.4 }, { energy: 0.6, ground: 0.2, bond: 0.3 },
]

const TONE_NAMES = [
  '자력', '양극', '전자', '자기', '방사', '율동', '공명', '은하',
  '태양', '행성', '분광', '수정', '우주',
]

function toJDN(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  return (
    d +
    Math.floor((153 * mm + 2) / 5) +
    365 * yy +
    Math.floor(yy / 4) -
    Math.floor(yy / 100) +
    Math.floor(yy / 400) -
    32045
  )
}

export function mayaEngine(input: BirthInput): Reading {
  const jdn = toJDN(input.year, input.month, input.day)
  const days = jdn - CORRELATION

  // 장기력 0일차가 4 Ahau이므로 톤은 +3, 인장은 아하우(20번째) 기준으로 맞춘다.
  const tone = (((days + 3) % 13) + 13) % 13 + 1
  const sealIndex = (((days + 19) % 20) + 20) % 20
  // 촐킨 260일 주기 내 위치
  const kin = (((days + 159) % 260) + 260) % 260 + 1

  const seal = SEALS[sealIndex]
  const lucky = seededPick(
    ['북', '남', '동', '서'],
    `maya-${input.year}${input.month}${input.day}`,
  )

  return {
    id: 'maya',
    name: '마야 촐킨',
    emoji: '🗿',
    headline: `KIN ${kin} · ${TONE_NAMES[tone - 1]}의 ${seal.split(' ')[1] ?? seal}`,
    body: [
      SEAL_LINES[sealIndex],
      `마야 사람들은 260일이 한 바퀴 도는 달력을 따로 썼습니다. 13개의 톤과 20개의 인장이 톱니처럼 맞물리면서 260개 조합이 나오고, 당신은 그중 ${kin}번째입니다.`,
      `톤은 그 인장을 어떤 세기로 쓰는지를 정합니다. 당신의 톤은 ${tone}번 ${TONE_NAMES[tone - 1]}입니다. 인장이 무엇을 하는지라면 톤은 어떻게 하는지에 가깝습니다.`,
      `같은 kin은 260일마다 한 번씩 돌아옵니다. 다음으로 당신의 날이 오는 건 대략 ${Math.round(260 / 30)}개월 주기입니다. 마야에서는 자기 kin이 도는 날을 한 해의 생일처럼 쳤습니다.`,
    ],
    facts: [
      { label: 'KIN', value: `${kin} / 260` },
      { label: '인장', value: seal },
      { label: '톤', value: `${tone} ${TONE_NAMES[tone - 1]}` },
      { label: '방향', value: lucky },
    ],
    axes: SEAL_AXES[sealIndex],
    caveat: '고고학에서 쓰는 GMT 상관계수(584283) 기준입니다. 국내에 흔한 드림스펠 방식과는 결과가 다를 수 있습니다.',
  }
}
