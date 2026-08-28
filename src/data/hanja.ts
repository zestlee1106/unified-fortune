/** 干支 · 오행 · 띠 · 별자리 한글 매핑. lunar-javascript가 한자로 주는 값을 옮긴다. */

export const GAN_KO: Record<string, string> = {
  甲: '갑', 乙: '을', 丙: '병', 丁: '정', 戊: '무',
  己: '기', 庚: '경', 辛: '신', 壬: '임', 癸: '계',
}

export const JI_KO: Record<string, string> = {
  子: '자', 丑: '축', 寅: '인', 卯: '묘', 辰: '진', 巳: '사',
  午: '오', 未: '미', 申: '신', 酉: '유', 戌: '술', 亥: '해',
}

export type Element = '목' | '화' | '토' | '금' | '수'

export const GAN_ELEMENT: Record<string, Element> = {
  甲: '목', 乙: '목', 丙: '화', 丁: '화', 戊: '토',
  己: '토', 庚: '금', 辛: '금', 壬: '수', 癸: '수',
}

export const JI_ELEMENT: Record<string, Element> = {
  寅: '목', 卯: '목', 巳: '화', 午: '화',
  辰: '토', 戌: '토', 丑: '토', 未: '토',
  申: '금', 酉: '금', 亥: '수', 子: '수',
}

export const ELEMENT_HANJA: Record<Element, string> = {
  목: '木', 화: '火', 토: '土', 금: '金', 수: '水',
}

export const ELEMENT_COLOR: Record<Element, string> = {
  목: '#3f9c5a', 화: '#d9483f', 토: '#b0873a', 금: '#8f95a3', 수: '#2f6fb0',
}

export const ZODIAC_KO: Record<string, string> = {
  鼠: '쥐', 牛: '소', 虎: '호랑이', 兔: '토끼', 龙: '용', 蛇: '뱀',
  马: '말', 羊: '양', 猴: '원숭이', 鸡: '닭', 狗: '개', 猪: '돼지',
}

export const XINGZUO_KO: Record<string, string> = {
  白羊: '양자리', 金牛: '황소자리', 双子: '쌍둥이자리', 巨蟹: '게자리',
  狮子: '사자자리', 处女: '처녀자리', 天秤: '천칭자리', 天蝎: '전갈자리',
  射手: '궁수자리', 摩羯: '염소자리', 水瓶: '물병자리', 双鱼: '물고기자리',
}

/** 干支 두 글자를 한글 독음으로 (예: 己巳 -> 기사) */
export function ganZhiToKo(ganZhi: string): string {
  const gan = ganZhi[0] ?? ''
  const ji = ganZhi[1] ?? ''
  return `${GAN_KO[gan] ?? gan}${JI_KO[ji] ?? ji}`
}
