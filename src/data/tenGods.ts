import type { Element } from './hanja'

/** 오행 상생: 목→화→토→금→수→목 */
export const GENERATES: Record<Element, Element> = {
  목: '화', 화: '토', 토: '금', 금: '수', 수: '목',
}

/** 오행 상극: 목→토→수→화→금→목 */
export const CONTROLS: Record<Element, Element> = {
  목: '토', 토: '수', 수: '화', 화: '금', 금: '목',
}

/** 천간의 음양. 甲丙戊庚壬이 양이다. */
export const GAN_YANG: Record<string, boolean> = {
  甲: true, 乙: false, 丙: true, 丁: false, 戊: true,
  己: false, 庚: true, 辛: false, 壬: true, 癸: false,
}

export type TenGodGroup = '비겁' | '식상' | '재성' | '관성' | '인성'

/** 일간 오행 기준으로 상대 오행이 어느 십신 그룹인지 */
export function tenGodGroup(dayElement: Element, other: Element): TenGodGroup {
  if (other === dayElement) return '비겁'
  if (GENERATES[other] === dayElement) return '인성'
  if (GENERATES[dayElement] === other) return '식상'
  if (CONTROLS[dayElement] === other) return '재성'
  return '관성'
}

/** 음양까지 따진 십신 이름 */
export function tenGodName(
  dayGan: string,
  dayElement: Element,
  otherGan: string,
  otherElement: Element,
): string {
  const group = tenGodGroup(dayElement, otherElement)
  const same = GAN_YANG[dayGan] === GAN_YANG[otherGan]
  const table: Record<TenGodGroup, [string, string]> = {
    비겁: ['비견', '겁재'],
    식상: ['식신', '상관'],
    재성: ['편재', '정재'],
    관성: ['편관', '정관'],
    인성: ['편인', '정인'],
  }
  return table[group][same ? 0 : 1]
}

/** 십신 그룹별로 그 시기에 무엇이 화두가 되는지 */
export const GROUP_THEME: Record<TenGodGroup, { keyword: string; line: string }> = {
  비겁: {
    keyword: '경쟁과 독립',
    line: '내 몫을 챙겨야 하는 시기입니다. 동료가 늘어나는 만큼 나눠 가질 일도 늘어납니다. 남에게 기대기보다 스스로 서는 쪽으로 가게 됩니다.',
  },
  식상: {
    keyword: '표현과 발산',
    line: '안에 있던 게 밖으로 나오는 시기입니다. 만들고 말하고 보여주는 일이 잘 풀립니다. 대신 하고 싶은 말을 참기가 어려워져서 부딪히기도 합니다.',
  },
  재성: {
    keyword: '실리와 결과',
    line: '돈과 눈에 보이는 성과가 중심이 되는 시기입니다. 계산이 빨라지고 움직임이 많아집니다. 벌리는 만큼 나가는 것도 많아집니다.',
  },
  관성: {
    keyword: '책임과 자리',
    line: '역할이 무거워지는 시기입니다. 직함이 붙거나 맡는 일이 커집니다. 하고 싶은 것보다 해야 하는 것이 앞서서 답답할 수 있습니다.',
  },
  인성: {
    keyword: '배움과 정리',
    line: '한 발 물러서서 채우는 시기입니다. 공부나 자격, 혹은 그동안 벌여놓은 걸 정리하는 쪽으로 갑니다. 밖으로 뻗기보다 안이 단단해집니다.',
  },
}
