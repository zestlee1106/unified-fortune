import { computeDaeun } from '../src/engines/daeun'
import type { BirthInput } from '../src/core/types'

const base = { month: 7, day: 14, hour: 9, minute: 30, timeUnknown: false, mbti: 'INFP', blood: 'A' as const }
const cases: BirthInput[] = [
  { ...base, year: 1995, gender: 'male' },
  { ...base, year: 1995, gender: 'female' },
  { ...base, year: 1988, month: 3, day: 22, gender: 'male' },
]

for (const c of cases) {
  const r = computeDaeun(c)
  console.log('='.repeat(70))
  console.log(`${c.year}-${c.month}-${c.day} ${c.gender === 'male' ? '남' : '여'} | 일간 ${r.dayGan}(${r.dayElement}) | ${r.strong ? '신강' : '신약'} | ${r.forward ? '순행' : '역행'} | ${r.startAge}세 시작`)
  console.log(`도움되는 십신: ${r.favorable.join(', ')} | 현재 ${r.currentAge}세`)
  for (const p of r.periods.slice(0, 8)) {
    const mark = p.isCurrent ? '◀ 지금' : p.isPeak ? '★ 전성기' : ''
    console.log(`  ${String(p.startAge).padStart(2)}~${String(p.endAge).padStart(2)}세 (${p.startYear}~${p.endYear})  ${p.ganZhi} ${p.ganZhiKo}  ${p.tenGod.padEnd(3)} ${p.keyword.padEnd(8)} ${p.score >= 0 ? '+' : ''}${p.score}  ${mark}`)
  }
  if (r.next) console.log(`  → 다음 대운까지 ${r.yearsToNext}년`)
}
