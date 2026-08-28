/**
 * 한글 조사 선택. 점술 이름이 "수비학 라이프패스"처럼 받침 없이 끝나면
 * "은"이 아니라 "는"이 붙어야 한다.
 * 영문·숫자로 끝나면 받침 없는 형태를 쓴다 (MBTI는, 9번은 → 실제로는 발음 기준이라
 * 완벽하지 않지만 화면에 나오는 이름들에서는 이쪽이 자연스럽다).
 */
/** 종성 인덱스. 0이면 받침 없음, 8이면 ㄹ 받침. */
function jongseong(word: string): number {
  const code = word.charCodeAt(word.length - 1)
  if (Number.isNaN(code)) return 0
  if (code < 0xac00 || code > 0xd7a3) return 0
  return (code - 0xac00) % 28
}

export type JosaPair = '은는' | '이가' | '을를' | '와과' | '으로'

export function josa(word: string, pair: JosaPair): string {
  const jong = jongseong(word)
  // '(으)로'만 규칙이 다르다. ㄹ 받침은 받침 없는 것처럼 '로'를 쓴다.
  // "발산으로"는 맞지만 "서울으로"는 틀리고 "서울로"가 맞다.
  if (pair === '으로') return jong === 0 || jong === 8 ? '로' : '으로'

  const table = {
    은는: ['은', '는'],
    이가: ['이', '가'],
    을를: ['을', '를'],
    와과: ['과', '와'],
  } as const
  const [withB, withoutB] = table[pair]
  return jong > 0 ? withB : withoutB
}

/** 단어 + 조사를 붙여서 반환 */
export function withJosa(word: string, pair: JosaPair): string {
  return word + josa(word, pair)
}
