import { runAll } from '../src/engines/index'
import { buildConsensus } from '../src/core/consensus'
import type { BirthInput } from '../src/core/types'

const MBTIS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const BLOODS: BirthInput['blood'][] = ['A','B','O','AB']

const scores: number[] = []
const conflictAxis: Record<string, number> = {}
const conflictPair: Record<string, number> = {}

let seed = 12345
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

for (let i = 0; i < 3000; i++) {
  const input: BirthInput = {
    year: 1960 + Math.floor(rnd() * 50),
    month: 1 + Math.floor(rnd() * 12),
    day: 1 + Math.floor(rnd() * 28),
    hour: Math.floor(rnd() * 24),
    minute: 0,
    timeUnknown: false,
    mbti: MBTIS[Math.floor(rnd() * 16)],
    blood: BLOODS[Math.floor(rnd() * 4)],
    gender: rnd() < 0.5 ? 'male' : 'female',
  }
  const readings = runAll(input)
  const con = buildConsensus(readings)
  scores.push(con.score)
  if (con.conflict) {
    conflictAxis[con.conflict.axisId] = (conflictAxis[con.conflict.axisId] ?? 0) + 1
    const pair = [con.conflict.lowest!.reading.name, con.conflict.highest!.reading.name].sort().join(' ↔ ')
    conflictPair[pair] = (conflictPair[pair] ?? 0) + 1
  }
}

scores.sort((a,b)=>a-b)
const pct = (p: number) => scores[Math.floor(scores.length * p)]
console.log(`합의도 분포 (n=${scores.length})`)
console.log(`  min ${scores[0]}  p10 ${pct(0.1)}  p25 ${pct(0.25)}  중앙 ${pct(0.5)}  p75 ${pct(0.75)}  p90 ${pct(0.9)}  max ${scores[scores.length-1]}`)

const buckets: Record<string, number> = {}
for (const s of scores) {
  const b = `${Math.floor(s/10)*10}~${Math.floor(s/10)*10+9}`
  buckets[b] = (buckets[b] ?? 0) + 1
}
console.log('\n구간별:')
for (const k of Object.keys(buckets).sort()) {
  const n = buckets[k]
  console.log(`  ${k.padStart(6)}  ${'█'.repeat(Math.round(n/scores.length*60)).padEnd(60)} ${(n/scores.length*100).toFixed(1)}%`)
}

console.log('\n최대충돌 축 분포:')
for (const [k,v] of Object.entries(conflictAxis).sort((a,b)=>b[1]-a[1])) {
  console.log(`  ${k.padEnd(8)} ${(v/scores.length*100).toFixed(1)}%`)
}
console.log('\n최대충돌 조합 상위 8:')
for (const [k,v] of Object.entries(conflictPair).sort((a,b)=>b[1]-a[1]).slice(0,8)) {
  console.log(`  ${(v/scores.length*100).toFixed(1).padStart(5)}%  ${k}`)
}
