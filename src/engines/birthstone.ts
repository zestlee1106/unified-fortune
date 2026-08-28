import type { BirthInput, Reading } from '../core/types'

const STONES = [
  { stone: '가넷', flower: '수선화', word: '변치 않음', line: '한번 마음을 준 대상에는 이상하리만치 오래 갑니다.' },
  { stone: '자수정', flower: '앵초', word: '흔들리지 않음', line: '주변이 술렁여도 자기 판단을 잘 안 바꿉니다.' },
  { stone: '아쿠아마린', flower: '벚꽃', word: '침착', line: '급한 상황에서 오히려 목소리가 낮아지는 쪽입니다.' },
  { stone: '다이아몬드', flower: '데이지', word: '단단함', line: '겉으로는 부드러운데 핵심에서는 절대 안 밀립니다.' },
  { stone: '에메랄드', flower: '은방울꽃', word: '행운', line: '결정적인 순간에 이상하게 일이 풀리는 경험이 잦습니다.' },
  { stone: '진주', flower: '장미', word: '건강과 장수', line: '무리하지 않고 오래 가는 리듬을 몸이 알고 있습니다.' },
  { stone: '루비', flower: '수련', word: '열정', line: '한번 불이 붙으면 주변까지 같이 데웁니다.' },
  { stone: '페리도트', flower: '글라디올러스', word: '부부의 행복', line: '가까운 관계에서 안정감을 얻는 만큼 크게 흔들리기도 합니다.' },
  { stone: '사파이어', flower: '과꽃', word: '성실', line: '눈에 안 띄는 곳에서 할 일을 다 해두는 편입니다.' },
  { stone: '오팔', flower: '금잔화', word: '희망', line: '상황이 나빠도 다음 수를 먼저 생각합니다.' },
  { stone: '토파즈', flower: '국화', word: '우정', line: '오래된 관계를 놓지 않습니다. 연락은 뜸해도 끊기지 않습니다.' },
  { stone: '터키석', flower: '포인세티아', word: '성공', line: '목표를 정하면 소리 없이 거기까지 갑니다.' },
]

export function birthstoneEngine(input: BirthInput): Reading {
  const s = STONES[input.month - 1]
  return {
    id: 'birthstone',
    name: '탄생석 · 탄생화',
    emoji: '💎',
    headline: `${s.stone} · ${s.word}`,
    body: [
      s.line,
      `${input.month}월의 탄생석은 ${s.stone}, 탄생화는 ${s.flower}입니다. 보석말은 "${s.word}"입니다.`,
      '탄생석은 점술이라기보다 관습에 가깝습니다. 지금 쓰는 목록은 1912년에 미국 보석상 협회가 정한 게 퍼진 것이고, 그 전에는 나라마다 달랐습니다. 영국과 일본은 지금도 목록이 조금 다릅니다.',
      '그래서 이 항목은 성격을 말하는 축에는 넣지 않았습니다. 위쪽 합의도 계산에서도 빠져 있습니다.',
    ],
    facts: [
      { label: '탄생석', value: s.stone },
      { label: '탄생화', value: s.flower },
      { label: '보석말', value: s.word },
    ],
    // 성향 축에는 참여하지 않는다. 합의도 계산을 흐리지 않기 위해서.
    axes: {},
    caveat: '탄생석 목록은 나라와 협회마다 다릅니다. 여기서는 국내에서 가장 흔한 목록을 씁니다.',
  }
}
