import type { AxisScores, BirthInput, Reading } from '../core/types'

const LETTER_LINES: Record<string, string> = {
  E: '사람을 만나고 나면 오히려 기운이 차오릅니다.',
  I: '사람을 만나고 나면 혼자 있는 시간으로 회복해야 합니다.',
  N: '눈앞의 사실보다 그 너머의 의미가 먼저 보입니다.',
  S: '지금 손에 잡히는 것부터 확인하고 넘어갑니다.',
  T: '결론을 낼 때 감정을 일단 옆으로 치웁니다.',
  F: '결론을 낼 때 누가 어떻게 느낄지가 변수로 들어옵니다.',
  J: '정해지지 않은 상태가 오래 가면 불편해집니다.',
  P: '미리 정해두면 답답해서 여지를 남깁니다.',
}

const TYPE_NICK: Record<string, string> = {
  INTJ: '설계도부터 그리는 사람', INTP: '왜부터 묻는 사람',
  ENTJ: '판을 짜서 굴리는 사람', ENTP: '일단 뒤집어보는 사람',
  INFJ: '말없이 다 읽는 사람', INFP: '안에 세계가 하나 더 있는 사람',
  ENFJ: '사람을 끌고 가는 사람', ENFP: '불씨를 던지고 다니는 사람',
  ISTJ: '약속을 지키는 사람', ISFJ: '조용히 챙기는 사람',
  ESTJ: '기준을 세우는 사람', ESFJ: '자리를 데우는 사람',
  ISTP: '손으로 푸는 사람', ISFP: '자기 속도로 사는 사람',
  ESTP: '몸이 먼저 나가는 사람', ESFP: '지금을 사는 사람',
}

/** 인식(N/S)과 판단(T/F)을 묶은 네 갈래. MBTI에서 기질을 나눌 때 흔히 쓰는 구분이다. */
const PAIR_NOTE: Record<string, string> = {
  NT: '가능성을 보면서 논리로 검증하는 조합입니다. 납득이 안 되면 안 움직이고, 대신 납득하면 끝까지 갑니다.',
  NF: '가능성을 보면서 사람을 기준으로 판단하는 조합입니다. 의미 없는 일을 제일 못 견딥니다.',
  ST: '눈앞의 사실을 논리로 처리하는 조합입니다. 말이 짧고 결론이 빠릅니다.',
  SF: '눈앞의 사실을 사람 기준으로 다루는 조합입니다. 구체적으로 챙기는 데 강합니다.',
}

export function mbtiEngine(input: BirthInput): Reading {
  const t = input.mbti.toUpperCase()
  const [ei, ns, tf, jp] = t.split('')

  // MBTI만 네 축 전부에 최대값을 주면 항상 혼자 튀어서 매번 MBTI가 충돌 원인으로
  // 잡힌다. 다른 점술들과 비슷한 눈금에 맞춰 0.7로 낮춘다.
  const S = 0.7
  const axes: AxisScores = {
    energy: ei === 'E' ? S : -S,
    ground: ns === 'S' ? S : -S,
    bond: tf === 'F' ? S : -S,
    plan: jp === 'J' ? S : -S,
    // 열정 축은 한 글자로 안 나온다. E/P 조합이 강할수록 즉흥적 열기가 크다고 본다.
    temper: (ei === 'E' ? 0.4 : -0.4) + (jp === 'P' ? 0.25 : -0.25),
  }

  return {
    id: 'mbti',
    name: 'MBTI',
    emoji: '🧩',
    headline: `${t} · ${TYPE_NICK[t] ?? '드문 조합'}`,
    body: [
      [ei, ns, tf, jp].map((l) => LETTER_LINES[l]).join(' '),
      `${t}는 ${PAIR_NOTE[`${ns}${tf}`] ?? ''}`,
      'MBTI는 여기 있는 항목 중 유일하게 태어난 순간이 아니라 지금의 당신에게서 나온 값입니다. 나머지가 다 "타고난 것"을 말한다면 이건 "지금 이렇게 된 것"을 말합니다.',
      '그래서 MBTI가 다른 항목들과 어긋난다면, 그건 어느 쪽이 틀린 게 아니라 타고난 성질과 지금 살고 있는 방식이 다르다는 뜻으로 읽는 게 맞습니다. 위쪽 합의도 화면에서 MBTI가 혼자 반대편에 서 있다면 특히 그렇습니다.',
    ],
    facts: [
      { label: '유형', value: t },
      { label: '에너지', value: ei === 'E' ? '외향 E' : '내향 I' },
      { label: '인식', value: ns === 'S' ? '감각 S' : '직관 N' },
      { label: '판단', value: tf === 'T' ? '사고 T' : '감정 F' },
      { label: '생활', value: jp === 'J' ? '계획 J' : '탐색 P' },
    ],
    axes,
  }
}
