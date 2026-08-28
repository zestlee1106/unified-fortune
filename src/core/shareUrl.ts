import type { BirthInput } from './types'

/**
 * 서버가 없어서 결과를 저장해둘 데가 없다.
 * 그래서 입력값을 통째로 주소에 실어 보낸다. 링크를 받은 사람은 같은 계산을 다시 돌린다.
 *
 * 예: ?d=19971106&t=0930&m=INFP&b=A&g=m
 * 태어난 시각을 모르면 t=x.
 */

const MBTI = new Set([
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP',
])
const BLOOD = new Set(['A', 'B', 'O', 'AB'])

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

export function toQuery(input: BirthInput): string {
  const params = new URLSearchParams({
    d: `${input.year}${pad(input.month)}${pad(input.day)}`,
    t: input.timeUnknown ? 'x' : `${pad(input.hour)}${pad(input.minute)}`,
    m: input.mbti,
    b: input.blood,
    g: input.gender === 'male' ? 'm' : 'f',
  })
  return `?${params.toString()}`
}

/** 주소에서 입력값을 읽는다. 하나라도 이상하면 통째로 버리고 null을 준다. */
export function fromQuery(search: string): BirthInput | null {
  const p = new URLSearchParams(search)
  const d = p.get('d')
  const t = p.get('t')
  const m = p.get('m')?.toUpperCase()
  const b = p.get('b')?.toUpperCase()
  const g = p.get('g')

  if (!d || !t || !m || !b || !g) return null
  if (!/^\d{8}$/.test(d)) return null
  if (t !== 'x' && !/^\d{4}$/.test(t)) return null
  if (!MBTI.has(m)) return null
  if (!BLOOD.has(b)) return null
  if (g !== 'm' && g !== 'f') return null

  const year = Number(d.slice(0, 4))
  const month = Number(d.slice(4, 6))
  const day = Number(d.slice(6, 8))
  if (year < 1900 || year > 2100) return null
  if (month < 1 || month > 12) return null
  if (day < 1 || day > 31) return null
  // 2월 30일 같은 날짜를 걸러낸다.
  const probe = new Date(year, month - 1, day)
  if (probe.getMonth() !== month - 1 || probe.getDate() !== day) return null

  const timeUnknown = t === 'x'
  const hour = timeUnknown ? 12 : Number(t.slice(0, 2))
  const minute = timeUnknown ? 0 : Number(t.slice(2, 4))
  if (hour > 23 || minute > 59) return null

  return {
    year, month, day, hour, minute, timeUnknown,
    mbti: m,
    blood: b as BirthInput['blood'],
    gender: g === 'm' ? 'male' : 'female',
  }
}

export function shareUrlFor(input: BirthInput): string {
  return `${location.origin}${location.pathname}${toQuery(input)}`
}
