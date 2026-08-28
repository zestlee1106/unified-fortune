import { Solar } from 'lunar-javascript'
import { XINGZUO_KO } from '../data/hanja'
import type { AxisScores, BirthInput, Reading } from '../core/types'

const BLOOD: Record<
  string,
  { nick: string; line: string; axes: AxisScores }
> = {
  A: {
    nick: '신경 쓰는 쪽',
    line: '남이 나를 어떻게 볼지가 계속 걸립니다. 그만큼 실수가 적고, 그만큼 피곤합니다.',
    axes: { plan: 0.6, bond: 0.5, energy: -0.4, temper: -0.4 },
  },
  B: {
    nick: '자기 페이스인 쪽',
    line: '남 눈치를 덜 봅니다. 그래서 오해도 사는데 본인은 별로 신경 안 씁니다.',
    axes: { plan: -0.7, energy: 0.5, bond: -0.4, temper: 0.5 },
  },
  O: {
    nick: '밀어붙이는 쪽',
    line: '목표가 생기면 단순해집니다. 복잡한 감정 정리보다 일단 하는 게 빠르다고 봅니다.',
    axes: { energy: 0.6, temper: 0.6, ground: 0.5, bond: 0.3 },
  },
  AB: {
    nick: '스위치가 있는 쪽',
    line: '상황에 따라 사람이 달라집니다. 본인은 일관적인데 보는 쪽이 헷갈려합니다.',
    axes: { ground: -0.6, energy: -0.2, plan: -0.2, bond: -0.3 },
  },
}

/** 별자리 원소 × 혈액형이 만나면 어떻게 되는지 */
const ELEMENT_MIX: Record<string, string> = {
  불: '불의 별자리라 시동은 확실히 걸립니다.',
  흙: '흙의 별자리라 한번 자리를 잡으면 잘 안 움직입니다.',
  바람: '바람의 별자리라 관심이 자주 옮겨 다닙니다.',
  물: '물의 별자리라 감정이 먼저 반응합니다.',
}

const SIGN_ELEMENT: Record<string, string> = {
  양자리: '불', 사자자리: '불', 궁수자리: '불',
  황소자리: '흙', 처녀자리: '흙', 염소자리: '흙',
  쌍둥이자리: '바람', 천칭자리: '바람', 물병자리: '바람',
  게자리: '물', 전갈자리: '물', 물고기자리: '물',
}

const SAME: Record<string, string> = {
  A: '서로 눈치를 보다가 아무도 말을 못 꺼내는 상황이 자주 생깁니다. 대신 한번 편해지면 제일 오래 갑니다.',
  B: '둘 다 자기 페이스라 부딪힐 일이 의외로 적습니다. 각자 알아서 하다가 필요할 때만 붙는 식입니다.',
  O: '방향이 같으면 굉장히 빠른데, 다르면 둘 다 안 물러섭니다.',
  AB: '설명을 안 해도 알아듣는 순간이 있습니다. 대신 둘 다 갑자기 조용해지는 날이 있습니다.',
}

export function bloodZodiacEngine(input: BirthInput): Reading {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0)
  const sign = XINGZUO_KO[solar.getXingZuo()] ?? '?'
  const element = SIGN_ELEMENT[sign] ?? '불'
  const b = BLOOD[input.blood]

  return {
    id: 'bloodZodiac',
    name: '혈액형 × 별자리',
    emoji: '🩸',
    headline: `${input.blood}형 ${sign} · ${b.nick}`,
    body: [
      b.line,
      `${ELEMENT_MIX[element]} 여기에 ${input.blood}형이 겹치면, ${
        (element === '불' || element === '바람') && (input.blood === 'A')
          ? '밖으로 나가려는 성질과 조심하려는 성질이 계속 부딪힙니다. 하고 싶은데 못 하는 상태가 자주 옵니다.'
          : (element === '흙' || element === '물') && (input.blood === 'B')
            ? '안정을 원하는 성질과 마음대로 하려는 성질이 같이 있습니다. 스스로도 자기가 뭘 원하는지 헷갈릴 때가 있습니다.'
            : '두 성질이 같은 방향을 봅니다. 어긋나는 게 없어서 편한 대신, 브레이크도 없습니다.'
      }`,
      `${input.blood}형끼리 만나면 ${SAME[input.blood]}`,
      '혈액형으로 성격을 나누는 건 1920년대 일본에서 시작해서 한국으로 넘어온 이야기입니다. 이후 여러 나라에서 반복해서 검증했는데 성격과의 상관관계가 나오지 않았습니다. 그래도 백 년 가까이 살아남은 걸 보면, 맞아서 남은 게 아니라 이야기하기 좋아서 남은 쪽에 가깝습니다.',
    ],
    facts: [
      { label: '혈액형', value: `${input.blood}형` },
      { label: '별자리', value: sign },
      { label: '원소', value: element },
    ],
    axes: b.axes,
    caveat: '혈액형과 성격의 상관관계는 여러 연구에서 반복적으로 부정됐습니다.',
  }
}
