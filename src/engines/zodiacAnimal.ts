import { Solar } from 'lunar-javascript'
import { ZODIAC_KO, ganZhiToKo } from '../data/hanja'
import { matchesFor } from '../data/ddiMatch'
import type { AxisScores, BirthInput, Reading } from '../core/types'

const TRAITS: Record<string, { line: string; axes: AxisScores }> = {
  쥐: { line: '눈치가 빠르고 상황 파악이 남보다 반 박자 먼저입니다. 손해 보는 선택을 잘 안 합니다.', axes: { plan: 0.5, energy: 0.4, ground: 0.6, bond: 0.2 } },
  소: { line: '느리지만 끝을 봅니다. 남들이 지쳐 나갈 때쯤 혼자 남아있는 쪽입니다.', axes: { plan: 0.7, ground: 0.8, temper: -0.5, energy: -0.3 } },
  호랑이: { line: '앞에 나서는 걸 겁내지 않습니다. 대신 참는 건 잘 못합니다.', axes: { energy: 0.8, temper: 0.8, bond: -0.2, plan: -0.3 } },
  토끼: { line: '분위기를 먼저 읽습니다. 부딪히느니 돌아가는 쪽을 택합니다.', axes: { bond: 0.7, temper: -0.5, energy: -0.2, ground: -0.2 } },
  용: { line: '스케일이 큽니다. 자잘한 계산보다 판을 통째로 보는 편입니다.', axes: { energy: 0.7, temper: 0.7, ground: -0.4, plan: -0.2 } },
  뱀: { line: '말수보다 생각이 많습니다. 다 알면서 모르는 척하는 순간이 있습니다.', axes: { energy: -0.7, ground: -0.3, temper: -0.4, plan: 0.4 } },
  말: { line: '가만히 있는 걸 못 견딥니다. 답답한 자리에서 제일 빨리 지칩니다.', axes: { energy: 0.8, temper: 0.6, plan: -0.6, bond: 0.3 } },
  양: { line: '남의 기분을 자기 기분처럼 느낍니다. 그래서 자주 피곤합니다.', axes: { bond: 0.8, ground: -0.5, energy: -0.3, temper: -0.2 } },
  원숭이: { line: '머리 회전이 빠르고 응용이 좋습니다. 대신 한 우물을 잘 못 팝니다.', axes: { energy: 0.6, plan: -0.5, ground: 0.3, bond: 0.3 } },
  닭: { line: '기준이 분명하고 흐트러진 걸 못 봅니다. 그래서 잔소리쟁이 소리를 듣습니다.', axes: { plan: 0.8, ground: 0.6, bond: -0.3, temper: 0.2 } },
  개: { line: '한번 내 편이면 끝까지 내 편입니다. 배신에 유난히 크게 무너집니다.', axes: { bond: 0.8, ground: 0.4, plan: 0.3, temper: 0.2 } },
  돼지: { line: '사람을 잘 믿습니다. 손해를 보고도 크게 따지지 않는 쪽입니다.', axes: { bond: 0.7, temper: -0.3, ground: 0.2, plan: -0.3 } },
}

export function zodiacAnimalEngine(input: BirthInput): Reading {
  const solar = Solar.fromYmdHms(input.year, input.month, input.day, 12, 0, 0)
  const lunar = solar.getLunar()

  const byNewYear = ZODIAC_KO[lunar.getYearShengXiao()] ?? '?'
  const byLiChun = ZODIAC_KO[lunar.getYearShengXiaoByLiChun()] ?? '?'
  const disputed = byNewYear !== byLiChun

  const trait = TRAITS[byNewYear] ?? TRAITS['쥐']
  const body: string[] = [trait.line]

  if (disputed) {
    body.push(
      `그런데 당신은 띠가 두 개로 갈리는 날에 태어났습니다. 음력 설 기준으로는 ${byNewYear}띠인데, 사주 명리에서 쓰는 입춘 기준으로는 ${byLiChun}띠입니다.`,
    )
    body.push(
      `평소에 말하는 띠는 ${byNewYear}띠가 맞고, 사주 볼 때는 ${byLiChun}띠로 봅니다. 어느 쪽이 더 자기 같은지는 직접 판단하시면 됩니다.`,
    )
    // 실측값이다. scripts/ddi-ratio.ts 로 1950~2050년을 전부 세었다.
    body.push(
      '흔한 일은 아닙니다. 1950년부터 2050년까지 날짜를 전부 세어보면 이렇게 갈리는 날은 2%뿐입니다. 해마다 일주일 안팎이고, 아예 하루도 없는 해도 있습니다.',
    )
  }

  // 삼합과 육충은 명리에서 쓰는 규칙 그대로다.
  const m = matchesFor(byNewYear)
  if (m.samhap.length === 2) {
    body.push(
      `${byNewYear}띠는 ${m.samhap[0]}띠, ${m.samhap[1]}띠와 삼합입니다. 이 셋은 한 조로 묶여서, 같이 있으면 서로 부족한 걸 메워줍니다. 일로 만나면 특히 손발이 맞습니다.`,
    )
  }
  if (m.chung) {
    body.push(
      `반대로 ${m.chung}띠와는 충입니다. 정면으로 부딪히는 짝이라 처음부터 삐걱대는 경우가 많습니다. 다만 충은 나쁘기만 한 게 아니라 서로를 움직이게 만들기도 해서, 오래 붙어 있으면 제일 많이 바꿔놓는 상대가 되기도 합니다.`,
    )
  }
  if (m.yukhap) {
    body.push(`${m.yukhap}띠와는 육합이라 편하게 붙는 사이입니다.`)
  }

  const facts = [
    { label: '음력설 기준', value: `${byNewYear}띠` },
    { label: '입춘 기준', value: `${byLiChun}띠` },
    { label: '간지', value: `${lunar.getYearInGanZhi()} ${ganZhiToKo(lunar.getYearInGanZhi())}` },
    { label: '삼합', value: m.samhap.map((d) => `${d}띠`).join(' · ') || '-' },
    { label: '육합', value: m.yukhap ? `${m.yukhap}띠` : '-' },
    { label: '충', value: m.chung ? `${m.chung}띠` : '-' },
  ]

  return {
    id: 'zodiacAnimal',
    name: '십이지 띠',
    emoji: '🐾',
    headline: disputed
      ? `${byNewYear}띠 · ${byLiChun}띠 (띠 논란 케이스)`
      : `${byNewYear}띠`,
    body,
    facts,
    axes: trait.axes,
  }
}
