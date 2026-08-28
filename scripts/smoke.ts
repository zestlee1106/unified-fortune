import { runAll } from '../src/engines/index'
import { buildConsensus } from '../src/core/consensus'
import type { BirthInput } from '../src/core/types'

const cases: BirthInput[] = [
  { year: 1995, month: 7, day: 14, hour: 9, minute: 30, timeUnknown: false, mbti: 'INFP', blood: 'A', gender: 'male' },
  { year: 1990, month: 2, day: 3, hour: 23, minute: 40, timeUnknown: false, mbti: 'ESTJ', blood: 'O', gender: 'female' },
  { year: 2001, month: 11, day: 21, hour: 19, minute: 0, timeUnknown: false, mbti: 'ENTP', blood: 'B', gender: 'male' },
  { year: 1988, month: 6, day: 1, hour: 12, minute: 0, timeUnknown: true, mbti: 'ISFJ', blood: 'AB', gender: 'female' },
]

for (const c of cases) {
  const readings = runAll(c)
  const con = buildConsensus(readings)
  console.log('='.repeat(64))
  console.log(`${c.year}-${c.month}-${c.day} ${c.timeUnknown ? '(시간미상)' : `${c.hour}:${c.minute}`} / ${c.mbti} / ${c.blood}형`)
  console.log(`합의도 ${con.score}%`)
  if (con.agreement) console.log(`  ✓ ${con.agreement.voters}가지 동의: ${con.agreement.sentence}`)
  if (con.conflict) console.log(`  ✗ 최대충돌: ${con.conflict.axisId} (편차 ${con.conflict.spread.toFixed(2)}) ${con.conflict.lowest?.reading.name} ↔ ${con.conflict.highest?.reading.name}`)
  for (const r of readings) console.log(`   - ${r.name}: ${r.headline}`)
}
