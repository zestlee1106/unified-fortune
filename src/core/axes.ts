import type { Axis, AxisId } from './types'

export const AXES: Axis[] = [
  {
    id: 'energy',
    neg: '내향',
    pos: '외향',
    sentence: {
      neg: '혼자 있는 시간이 꼭 있어야 충전되는 사람',
      pos: '사람들 사이에 있을 때 오히려 살아나는 사람',
    },
  },
  {
    id: 'temper',
    neg: '침착',
    pos: '열정',
    sentence: {
      neg: '웬만한 일로는 표정이 안 바뀌는 사람',
      pos: '한번 꽂히면 끝까지 태우고 마는 사람',
    },
  },
  {
    id: 'plan',
    neg: '즉흥',
    pos: '계획',
    sentence: {
      neg: '일단 저지르고 나서 수습하는 쪽이 편한 사람',
      pos: '계획이 틀어지는 걸 유난히 못 견디는 사람',
    },
  },
  {
    id: 'ground',
    neg: '이상',
    pos: '현실',
    sentence: {
      neg: '남들이 그냥 지나치는 걸 혼자 오래 들여다보는 사람',
      pos: '뜬구름보다 손에 잡히는 걸 믿는 사람',
    },
  },
  {
    id: 'bond',
    neg: '독립',
    pos: '관계',
    sentence: {
      neg: '혼자서도 충분히 굴러가는 사람',
      pos: '결국 사람으로 채워져야 하는 사람',
    },
  },
]

export const AXIS_BY_ID: Record<AxisId, Axis> = Object.fromEntries(
  AXES.map((a) => [a.id, a]),
) as Record<AxisId, Axis>
