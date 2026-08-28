/**
 * 합의도 점수의 백분위 표를 만든다.
 * "78%"라는 숫자만으로는 높은 건지 낮은 건지 알 수 없다.
 * 실제로 많이 돌려보고 분포를 재야 "상위 몇 %"라고 말할 수 있다.
 * 결과는 src/data/percentile.ts 로 저장한다.
 */
import { writeFileSync } from 'node:fs'
import { runAll } from '../src/engines/index'
import { buildConsensus } from '../src/core/consensus'
import { buildPersona } from '../src/core/persona'
import type { BirthInput } from '../src/core/types'

const MBTIS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const BLOODS: BirthInput['blood'][] = ['A','B','O','AB']
const N = 50000

let seed = 987654321
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }

// 점수(0~100)별 등장 횟수
const counts = new Array(101).fill(0)

for (let i = 0; i < N; i += 1) {
  const input: BirthInput = {
    year: 1955 + Math.floor(rnd() * 60),
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
  // 화면과 같은 순서로 계산해야 분포가 맞는다.
  const first = buildConsensus(readings)
  const persona = buildPersona(input, first)
  const con = persona ? buildConsensus(readings, persona.axisId) : first
  counts[con.score] += 1
}

// CUMULATIVE[s] = 점수가 s 미만인 사람의 비율(0~1)
const cumulative: number[] = []
let running = 0
for (let s = 0; s <= 100; s += 1) {
  cumulative.push(Number((running / N).toFixed(4)))
  running += counts[s]
}

const body = `/**
 * 합의도 점수의 실제 분포. scripts/build-percentile.ts 가 만든다.
 * 무작위 생일 ${N.toLocaleString('en-US')}건을 돌려 나온 값이고, 손으로 고치지 않는다.
 * 점수만으로는 높은지 낮은지 알 수 없어서 "상위 몇 %"로 바꿔주기 위한 표다.
 */

/** BELOW[s] = 합의도가 s점 미만인 비율 (0~1) */
const BELOW: number[] = [
${cumulative.map((v, i) => `  ${v},`).join('\n')}
]

/** 이 점수가 상위 몇 %인지. 1이면 최상위 1%. */
export function topPercentFor(score: number): number {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  const top = (1 - BELOW[s]) * 100
  if (top < 1) return 1
  return Math.round(top)
}

/** 표를 만들 때 쓴 표본 수 */
export const SAMPLE_SIZE = ${N}
`

writeFileSync('src/data/percentile.ts', body)

// 확인용 출력
const show = [20, 35, 45, 55, 60, 65, 70, 78, 85, 90, 96]
console.log(`표본 ${N.toLocaleString('ko-KR')}건`)
for (const s of show) {
  const top = (1 - cumulative[s]) * 100
  console.log(`  ${String(s).padStart(3)}점 → 상위 ${top < 1 ? '1 미만' : Math.round(top)}%`)
}
