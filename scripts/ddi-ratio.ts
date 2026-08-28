import { Solar } from 'lunar-javascript'

// 음력설 기준 띠와 입춘 기준 띠가 갈리는 날이 실제로 몇 %인지 센다.
let total = 0
let disputed = 0
const perYear: number[] = []

for (let y = 1950; y <= 2050; y += 1) {
  let yearDisputed = 0
  for (let m = 1; m <= 12; m += 1) {
    for (let d = 1; d <= 31; d += 1) {
      const dt = new Date(y, m - 1, d)
      if (dt.getMonth() !== m - 1) continue // 존재하지 않는 날짜
      const lunar = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar()
      total += 1
      if (lunar.getYearShengXiao() !== lunar.getYearShengXiaoByLiChun()) {
        disputed += 1
        yearDisputed += 1
      }
    }
  }
  perYear.push(yearDisputed)
}

perYear.sort((a, b) => a - b)
console.log(`전체 ${total}일 중 갈리는 날 ${disputed}일 = ${(disputed / total * 100).toFixed(2)}%`)
console.log(`연간 갈리는 날수: 최소 ${perYear[0]}일, 중앙 ${perYear[Math.floor(perYear.length/2)]}일, 최대 ${perYear[perYear.length-1]}일`)
