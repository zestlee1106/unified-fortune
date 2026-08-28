import { hashString } from '../core/rng'
import type { BirthInput } from '../core/types'
import type { DaeunResult } from './daeun'

export interface TodayFortune {
  dateLabel: string
  score: number
  grade: string
  main: string
  rows: { label: string; text: string }[]
  lucky: { label: string; value: string }[]
  warning: string
  quote: string
  /** 대운을 점수에 반영했는지 */
  daeunNote: string | null
}

const MAIN = [
  '오늘은 굳이 앞에 나서지 않는 쪽이 낫습니다. 조용히 있는 게 이득인 날입니다.',
  '막혀 있던 게 하나 풀립니다. 기다리기보다 먼저 연락하는 쪽이 빠릅니다.',
  '결정을 하루만 미루세요. 오늘 내린 판단은 내일 보면 달라 보입니다.',
  '평소보다 말이 세게 나갑니다. 한 박자만 늦추면 아무 일도 안 생깁니다.',
  '오래 미뤄둔 걸 시작하기 좋습니다. 시작만 해도 절반은 됩니다.',
  '누가 부탁을 해옵니다. 다 받아주면 밤에 후회합니다.',
  '컨디션이 생각보다 안 따라줍니다. 일정을 하나쯤 덜어내세요.',
  '작은 인정을 받습니다. 대단한 건 아닌데 기분이 오래 갑니다.',
  '오늘 만나는 사람 중에 나중에 다시 볼 사람이 있습니다.',
  '정리하기 좋은 날입니다. 물건이든 관계든 안 쓰는 걸 덜어내세요.',
  '실수가 하나 나옵니다. 크지 않으니 바로 인정하고 넘어가는 게 낫습니다.',
  '평소 안 하던 걸 해보면 의외로 잘 맞습니다.',
]

const LOVE = [
  '먼저 연락해도 손해 안 봅니다.',
  '괜히 떠보지 마세요. 그냥 물어보는 게 빠릅니다.',
  '오늘 생긴 서운함은 오늘 푸는 게 좋습니다.',
  '기대를 조금 낮추면 오히려 편해집니다.',
  '뜻밖의 자리에서 뜻밖의 사람을 봅니다.',
  '혼자 있는 시간이 오히려 도움이 됩니다.',
  '말보다 같이 있는 시간이 통하는 날입니다.',
  '상대가 하는 말의 절반만 듣고 판단하지 마세요.',
]
const MONEY = [
  '충동구매 주의보입니다. 장바구니에 하루 재워두세요.',
  '들어올 돈이 하루 이틀 늦어집니다. 조급해할 일은 아닙니다.',
  '큰돈 나갈 일에 오늘 도장 찍지 마세요.',
  '작게 아끼면 티가 나는 날입니다.',
  '빌려준 돈 얘기를 꺼내기 좋은 타이밍입니다.',
  '예상 못 한 지출이 하나 생깁니다. 크지는 않습니다.',
  '오늘 쓴 돈은 나중에 아깝지 않을 쪽입니다.',
]
const WORK = [
  '하던 일을 끝내는 데 집중하세요. 새로 벌이면 둘 다 안 됩니다.',
  '위에서 한마디 들을 수 있는데 개인적인 게 아닙니다.',
  '숫자를 한 번 더 확인하세요. 놓친 게 하나 있습니다.',
  '오늘 낸 의견이 생각보다 멀리 갑니다.',
  '혼자 끌어안지 말고 나누세요. 도와줄 사람이 있습니다.',
  '속도보다 정확도가 중요한 날입니다.',
  '미뤄둔 연락 하나가 일을 풀어줍니다.',
]
const HEALTH = [
  '목과 어깨가 뻣뻣해집니다. 한 시간에 한 번은 일어나세요.',
  '잠이 부족한 게 오늘 다 티가 납니다. 일찍 누우세요.',
  '카페인을 평소보다 줄이는 게 좋습니다.',
  '가볍게라도 걷고 나면 머리가 정리됩니다.',
  '찬 음식이 안 받는 날입니다.',
  '눈이 피로합니다. 화면 보는 시간을 줄이세요.',
]
const WARNING = [
  '서두르다 두고 나오는 물건이 있습니다.',
  '단톡방에서 말 한마디 조심하세요.',
  '오늘 한 약속은 적어두세요. 잊어버립니다.',
  '지갑이나 휴대폰을 어딘가 두고 옵니다.',
  '확인 안 하고 누르는 버튼 하나를 조심하세요.',
  '남의 말을 옮기지 않는 게 좋습니다.',
]
const QUOTE = [
  '오늘 안 되는 건 내일도 안 됩니다. 붙잡지 마세요.',
  '지금 급해 보이는 일 대부분은 급하지 않습니다.',
  '잘하고 있는지 묻는 사람이 대체로 잘하고 있습니다.',
  '설명하지 않아도 되는 사람하고만 시간을 보내세요.',
  '어제보다 나은 하루면 충분합니다.',
  '기다리는 건 오지 않고, 잊고 있던 게 옵니다.',
  '오늘의 나쁜 기분은 대부분 잠이 부족해서입니다.',
]
const COLORS = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '흰색', '검정', '베이지', '하늘색', '분홍']
const DIRS = ['동', '서', '남', '북', '동남', '서남', '동북', '서북']
const ITEMS = ['이어폰', '텀블러', '손수건', '볼펜', '향수', '모자', '반지', '가방', '책 한 권', '껌']

export function computeToday(
  input: BirthInput,
  daeun?: DaeunResult,
  today = new Date(),
): TodayFortune {
  const dateKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`
  const base = `${input.year}${input.month}${input.day}${input.hour}${input.mbti}${input.blood}${input.gender}|${dateKey}`
  const pick = <T,>(arr: readonly T[], salt: string): T =>
    arr[hashString(base + salt) % arr.length]

  // 기본 점수에 현재 대운의 등급을 얹는다.
  // 사주에서 좋게 나온 시기를 지나는 중이면 하루 운도 조금 높게 잡는다.
  let score = 45 + (hashString(base + 'score') % 46) // 45~90
  let daeunNote: string | null = null
  const cur = daeun?.current
  if (cur) {
    const bonus =
      cur.grade === 'best' ? 8
        : cur.grade === 'good' ? 4
          : cur.grade === 'hard' ? -4
            : cur.grade === 'worst' ? -8
              : 0
    score = Math.max(20, Math.min(99, score + bonus))
    if (bonus !== 0) {
      daeunNote = `지금 지나는 ${cur.ganZhi} ${cur.ganZhiKo} 대운을 ${
        bonus > 0 ? '좋게' : '어렵게'
      } 봐서 ${bonus > 0 ? '+' : ''}${bonus}점 반영했습니다.`
    }
  }

  const grade =
    score >= 85 ? '아주 좋음'
      : score >= 70 ? '좋음'
        : score >= 55 ? '보통'
          : score >= 40 ? '조금 무거움'
            : '조심하는 날'

  return {
    dateLabel: `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`,
    score,
    grade,
    main: pick(MAIN, 'main'),
    rows: [
      { label: '애정', text: pick(LOVE, 'love') },
      { label: '금전', text: pick(MONEY, 'money') },
      { label: '일·학업', text: pick(WORK, 'work') },
      { label: '건강', text: pick(HEALTH, 'health') },
    ],
    lucky: [
      { label: '색', value: pick(COLORS, 'color') },
      { label: '숫자', value: String((hashString(base + 'num') % 45) + 1) },
      { label: '방향', value: pick(DIRS, 'dir') },
      { label: '소지품', value: pick(ITEMS, 'item') },
    ],
    warning: pick(WARNING, 'warn'),
    quote: pick(QUOTE, 'quote'),
    daeunNote,
  }
}
