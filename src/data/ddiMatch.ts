/**
 * 십이지 궁합. 명리에서 쓰는 삼합과 육충 규칙 그대로다.
 * 삼합은 세 띠가 한 조를 이뤄 잘 맞고, 육충은 정면으로 부딪히는 짝이다.
 */
export const SAMHAP: string[][] = [
  ['원숭이', '쥐', '용'],
  ['돼지', '토끼', '양'],
  ['호랑이', '말', '개'],
  ['뱀', '닭', '소'],
]

export const CHUNG: Record<string, string> = {
  쥐: '말', 말: '쥐',
  소: '양', 양: '소',
  호랑이: '원숭이', 원숭이: '호랑이',
  토끼: '닭', 닭: '토끼',
  용: '개', 개: '용',
  뱀: '돼지', 돼지: '뱀',
}

/** 육합. 삼합만큼은 아니어도 잘 붙는 짝이다. */
export const YUKHAP: Record<string, string> = {
  쥐: '소', 소: '쥐',
  호랑이: '돼지', 돼지: '호랑이',
  토끼: '개', 개: '토끼',
  용: '닭', 닭: '용',
  뱀: '원숭이', 원숭이: '뱀',
  말: '양', 양: '말',
}

export function matchesFor(ddi: string) {
  const group = SAMHAP.find((g) => g.includes(ddi)) ?? []
  return {
    samhap: group.filter((d) => d !== ddi),
    yukhap: YUKHAP[ddi],
    chung: CHUNG[ddi],
  }
}
