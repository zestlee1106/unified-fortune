import type { AxisScores, BirthInput, Reading } from '../core/types'

/** 마스터 넘버(11·22·33)는 한 자리로 줄이지 않고 남긴다. */
function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n)
      .split('')
      .reduce((a, d) => a + Number(d), 0)
  }
  return n
}

const PATHS: Record<number, { title: string; line: string; axes: AxisScores }> = {
  1: { title: '개척자', line: '남 밑에서 오래 못 있습니다. 시키는 대로 하는 순간 흥미가 꺼집니다.', axes: { energy: 0.6, bond: -0.7, plan: 0.3, temper: 0.5 } },
  2: { title: '조율자', line: '둘 사이에 서서 균형을 맞춥니다. 그러다 자기가 어디 있는지 헷갈릴 때가 있습니다.', axes: { bond: 0.9, temper: -0.6, energy: -0.3 } },
  3: { title: '표현자', line: '떠오른 걸 담아두질 못합니다. 말이든 글이든 그림이든 밖으로 나와야 풀립니다.', axes: { energy: 0.8, temper: 0.5, plan: -0.6, ground: -0.3 } },
  4: { title: '축조자', line: '기초부터 쌓습니다. 남들이 지름길로 갈 때 혼자 정공법으로 가서 늦게 도착하지만 안 무너집니다.', axes: { plan: 0.9, ground: 0.8, temper: -0.4 } },
  5: { title: '유랑자', line: '같은 자리에 오래 못 앉아 있습니다. 자유를 뺏기면 그때부터 사람이 이상해집니다.', axes: { energy: 0.7, plan: -0.9, bond: -0.4, temper: 0.4 } },
  6: { title: '돌보는 사람', line: '주변 사람 챙기는 게 기본값입니다. 정작 자기가 힘들 때 말을 못 꺼냅니다.', axes: { bond: 0.9, ground: 0.4, plan: 0.3, temper: -0.3 } },
  7: { title: '파고드는 사람', line: '납득이 안 되면 안 움직입니다. 혼자 오래 생각하는 시간이 사치가 아니라 필수입니다.', axes: { energy: -0.9, ground: -0.5, plan: 0.4, bond: -0.5 } },
  8: { title: '장악하는 사람', line: '판을 쥐고 흔들고 싶어합니다. 숫자와 성과로 자기를 확인하는 편입니다.', axes: { ground: 0.8, plan: 0.6, temper: 0.5, bond: -0.2 } },
  9: { title: '품는 사람', line: '시야가 개인을 넘어갑니다. 그래서 가까운 사람이 서운해하는 일이 생깁니다.', axes: { bond: 0.6, ground: -0.7, temper: -0.2, energy: 0.2 } },
  11: { title: '직관 (마스터 11)', line: '설명 못 하는데 맞히는 순간들이 있습니다. 그만큼 예민해서 쉽게 지칩니다.', axes: { ground: -0.9, energy: -0.4, bond: 0.4, temper: 0.3 } },
  22: { title: '실현 (마스터 22)', line: '큰 그림을 실제로 세워냅니다. 스케일과 실행력이 같이 붙어 있는 드문 조합입니다.', axes: { plan: 0.9, ground: 0.6, energy: 0.3, temper: 0.3 } },
  33: { title: '헌신 (마스터 33)', line: '자기보다 남을 먼저 두는 게 몸에 배어 있습니다. 그게 미덕이자 함정입니다.', axes: { bond: 1, ground: -0.5, temper: -0.4 } },
}

/** 라이프패스끼리 잘 맞는 조합. 통상 쓰이는 배치를 따랐다. */
const MATCH: Record<number, number[]> = {
  1: [3, 5, 9], 2: [4, 6, 8], 3: [1, 5, 7], 4: [2, 6, 8], 5: [1, 3, 7],
  6: [2, 4, 9], 7: [3, 5, 9], 8: [2, 4, 6], 9: [1, 6, 7],
  11: [2, 6, 9], 22: [4, 8, 6], 33: [6, 9, 2],
}

export function numerologyEngine(input: BirthInput): Reading {
  const digits = `${input.year}${String(input.month).padStart(2, '0')}${String(input.day).padStart(2, '0')}`
  const sum = digits.split('').reduce((a, d) => a + Number(d), 0)
  const path = reduce(sum)
  const info = PATHS[path] ?? PATHS[1]

  return {
    id: 'numerology',
    name: '수비학 라이프패스',
    emoji: '🔢',
    headline: `${path}번 · ${info.title}`,
    body: [
      info.line,
      `${input.year}년 ${input.month}월 ${input.day}일의 숫자를 전부 더하면 ${sum}이고, 한 자리가 될 때까지 줄이면 ${path}입니다.${
        path === 11 || path === 22 || path === 33
          ? ' 11·22·33은 마스터 넘버라고 해서 한 자리로 더 줄이지 않습니다. 전체의 몇 퍼센트 안 되는 숫자입니다.'
          : ''
      } 이 숫자가 평생 반복해서 마주치는 과제를 가리킨다고 봅니다.`,
      `잘 맞는 숫자는 ${MATCH[path].join('번, ')}번입니다. 상대의 생일로도 같은 계산을 해보면 서로 어떤 식으로 부딪히거나 맞물릴지 대충 나옵니다.`,
      '수비학은 사주나 별자리처럼 하늘을 보는 게 아니라 숫자만 봅니다. 그래서 태어난 시각도 장소도 필요 없고, 생일만 알면 끝납니다. 여기 있는 항목 중 계산이 제일 간단합니다.',
    ],
    facts: [
      { label: '생년월일', value: `${input.year}. ${input.month}. ${input.day}` },
      { label: '자릿수 합', value: String(sum) },
      { label: '라이프패스', value: `${path}번` },
    ],
    axes: info.axes,
  }
}
