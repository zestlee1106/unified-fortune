import { computeRarity, rarityHeadline, rarityKorea } from '../src/core/rarity'
import type { BirthInput } from '../src/core/types'

const base = {
  year: 1997, month: 11, day: 6, hour: 9, minute: 30,
  mbti: 'INFP', gender: 'female' as const,
}
const cases: BirthInput[] = [
  { ...base, timeUnknown: false, blood: 'A' },
  { ...base, timeUnknown: false, blood: 'AB' },
  { ...base, timeUnknown: true, blood: 'A' },
  { ...base, timeUnknown: true, blood: 'AB' },
]
for (const c of cases) {
  const r = computeRarity(c)
  console.log(
    `${c.blood}형 / ${c.timeUnknown ? '시간모름' : '시간있음'}  →  ${rarityHeadline(r)}  ·  ${rarityKorea(r)}`,
  )
}
