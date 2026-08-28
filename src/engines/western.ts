import { Solar } from 'lunar-javascript'
import { XINGZUO_KO } from '../data/hanja'
import type { AxisScores, BirthInput, Reading } from '../core/types'

const SIGNS: Record<
  string,
  { element: string; line: string; axes: AxisScores }
> = {
  양자리: { element: '불', line: '생각보다 몸이 먼저 나갑니다. 시작은 잘 하는데 마무리에서 자주 물립니다.', axes: { energy: 0.8, temper: 0.9, plan: -0.7, bond: -0.2 } },
  황소자리: { element: '흙', line: '한번 정한 건 잘 안 바꿉니다. 급하게 밀어붙이면 오히려 더 버팁니다.', axes: { ground: 0.9, plan: 0.6, temper: -0.6, energy: -0.3 } },
  쌍둥이자리: { element: '바람', line: '관심사가 자주 바뀝니다. 지루한 걸 세상에서 제일 못 견딥니다.', axes: { energy: 0.8, plan: -0.7, ground: -0.2, bond: 0.4 } },
  게자리: { element: '물', line: '내 사람과 남의 경계가 뚜렷합니다. 안으로 들어온 사람한테는 한없이 약합니다.', axes: { bond: 0.9, energy: -0.4, temper: -0.2, ground: 0.2, plan: 0.3 } },
  사자자리: { element: '불', line: '주목받는 자리가 잘 어울립니다. 무시당했다고 느끼면 그때부터 일이 커집니다.', axes: { energy: 0.9, temper: 0.7, bond: 0.4, ground: 0.2, plan: -0.2 } },
  처녀자리: { element: '흙', line: '남들이 안 보는 디테일이 눈에 밟힙니다. 그 기준을 자기한테 제일 세게 들이댑니다.', axes: { plan: 0.9, ground: 0.7, temper: -0.3, bond: -0.2 } },
  천칭자리: { element: '바람', line: '한쪽으로 기우는 걸 불편해합니다. 그래서 결정이 자주 늦습니다.', axes: { bond: 0.7, plan: -0.2, temper: -0.4, energy: 0.3 } },
  전갈자리: { element: '물', line: '겉으로는 조용한데 안에서 끝까지 갑니다. 잊는다는 말을 잘 못합니다.', axes: { energy: -0.6, temper: 0.7, plan: 0.5, bond: -0.3 } },
  궁수자리: { element: '불', line: '묶이는 걸 제일 싫어합니다. 답답해지면 그냥 떠납니다.', axes: { energy: 0.7, temper: 0.6, plan: -0.8, bond: -0.5 } },
  염소자리: { element: '흙', line: '멀리 보고 오래 갑니다. 지금 재미없는 걸 견디는 능력이 있습니다.', axes: { plan: 0.9, ground: 0.8, temper: -0.5, bond: -0.3 } },
  물병자리: { element: '바람', line: '남들과 같은 게 재미없습니다. 이상하다는 말을 칭찬으로 듣는 편입니다.', axes: { ground: -0.8, plan: -0.3, bond: -0.5, energy: 0.2 } },
  물고기자리: { element: '물', line: '경계가 흐립니다. 남의 감정이 그대로 들어와서 자주 젖습니다.', axes: { ground: -0.9, bond: 0.6, energy: -0.4, temper: -0.2, plan: -0.6 } },
}

/** 열두 별자리를 원으로 놓았을 때 정면으로 마주 보는 짝 */
const OPPOSITE: Record<string, string> = {
  양자리: '천칭자리', 천칭자리: '양자리',
  황소자리: '전갈자리', 전갈자리: '황소자리',
  쌍둥이자리: '궁수자리', 궁수자리: '쌍둥이자리',
  게자리: '염소자리', 염소자리: '게자리',
  사자자리: '물병자리', 물병자리: '사자자리',
  처녀자리: '물고기자리', 물고기자리: '처녀자리',
}

export function westernEngine(input: BirthInput): Reading {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0)
  const sign = XINGZUO_KO[solar.getXingZuo()] ?? '?'
  const info = SIGNS[sign]

  const sameElement = Object.entries(SIGNS)
    .filter(([name, v]) => v.element === info.element && name !== sign)
    .map(([name]) => name)
  const opposite = OPPOSITE[sign]

  return {
    id: 'western',
    name: '서양 별자리',
    emoji: '✨',
    headline: `${sign} · ${info.element}의 별자리`,
    body: [
      info.line,
      `${info.element} 원소에 속합니다. 같은 ${info.element}인 ${sameElement.join('와 ')}하고는 설명 없이도 말이 통합니다. 굳이 맞추려 애쓰지 않아도 되는 쪽입니다.`,
      `정반대에 있는 건 ${opposite}입니다. 열두 별자리를 원으로 놓았을 때 정확히 마주 보는 자리라, 서로 없는 걸 가지고 있습니다. 그래서 제일 안 맞는 상대이자 제일 끌리는 상대가 됩니다.`,
      `별자리는 태어난 날 태양이 하늘의 어디에 있었는지를 봅니다. ${input.month}월 ${input.day}일이면 ${sign} 구간입니다. 경계에 걸친 날이면 해마다 하루씩 밀리기도 합니다.`,
    ],
    facts: [
      { label: '별자리', value: sign },
      { label: '원소', value: info.element },
      { label: '생일', value: `${input.month}월 ${input.day}일` },
    ],
    axes: info.axes,
    caveat: '태양별자리만 봅니다. 달·상승궁까지 보려면 출생 차트가 따로 필요합니다.',
  }
}
