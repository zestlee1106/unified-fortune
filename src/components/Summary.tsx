import { AXIS_BY_ID } from '../core/axes'
import { josa } from '../core/josa'
import { supportersOf } from '../core/persona'
import type { Persona } from '../core/persona'
import { computeRarity, rarityHeadline, rarityKorea } from '../core/rarity'
import type { Consensus } from '../core/consensus'
import type { BirthInput, Reading } from '../core/types'

interface Props {
  input: BirthInput
  persona: Persona | null
  consensus: Consensus
  readings: Reading[]
}

export function Summary({ input, persona, consensus, readings }: Props) {
  const { score, agreement, conflict } = consensus
  // 탄생석은 성향 축에 투표하지 않는다. 합의도는 나머지로만 계산한다.
  const voting = readings.filter((r) => Object.keys(r.axes).length > 0).length

  const rarity = computeRarity(input)
  // 페르소나 축을 지지한 점술과, 합의 문장을 지지한 점술은 서로 다른 축이라 따로 모은다.
  const personaBackers = persona ? supportersOf(consensus, persona.axisId, readings) : []
  const agreeBackers = agreement
    ? supportersOf(consensus, agreement.summary.axisId, readings)
    : []

  const verdict =
    score >= 75 ? '이례적으로 말이 맞는 편'
      : score >= 55 ? '대체로 같은 방향'
        : score >= 40 ? '반은 맞고 반은 갈림'
          : '서로 딴소리 중'

  return (
    <section className="card summary">
      <p className="kicker">{readings.length + 2}가지를 겹쳐본 결과</p>

      {persona && (
        <div className="persona">
          <p className="persona-line">{persona.line}</p>
          <p className="persona-note">
            사주의 {persona.element} 기운에, {personaBackers.length}가지 점술이 같은 편에 선
            {' '}{AXIS_BY_ID[persona.axisId].neg}·{AXIS_BY_ID[persona.axisId].pos} 축을 겹쳐서 나온 문장입니다.
            어느 한 점술도 혼자서는 이 말을 못 합니다.
          </p>
        </div>
      )}

      <div className="rarity">
        <p className="rarity-big">{rarityHeadline(rarity)}</p>
        <p className="rarity-sub">{rarityKorea(rarity)}</p>
        <div className="rarity-factors">
          {rarity.factors.map((f) => (
            <div className="rarity-factor" key={f.label}>
              <span>{f.label}</span>
              <b>{f.value}</b>
            </div>
          ))}
        </div>
        <p className="caveat">
          ※ 사주도 띠도 별자리도 결국 생일 하나에서 나오기 때문에 따로 곱하지 않았습니다.
          그렇게 하면 숫자만 부풀려집니다. 혈액형은 한국 실제 분포를, MBTI는 열여섯 유형이
          고르게 나온다고 가정한 어림값입니다.
          {rarity.timeUnknown && ' 태어난 시각을 넣으면 훨씬 희귀해집니다.'}
        </p>
      </div>

      <div className="divider" />

      <Dial score={score} />
      <p className="verdict">{verdict}</p>

      {agreement && (
        <div className="block agree">
          <p className="block-head">
            <span className="mark">✓</span>
            {agreement.voters}가지가 같은 말을 합니다
          </p>
          <p className="block-body">{agreement.sentence}</p>
          {agreeBackers.length > 0 && (
            <div className="chips">
              {agreeBackers.map((name) => (
                <span className="mini-chip" key={name}>{name}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {conflict && conflict.spread > 0.35 && conflict.lowest && conflict.highest && (
        <div className="block clash">
          <p className="block-head">
            <span className="mark">✗</span>
            {`${AXIS_BY_ID[conflict.axisId].neg} ↔ ${AXIS_BY_ID[conflict.axisId].pos}에서 정면으로 갈립니다`}
          </p>
          <p className="block-body">
            <b>{conflict.lowest.reading.name}</b>
            {josa(conflict.lowest.reading.name, '은는')} {AXIS_BY_ID[conflict.axisId].neg} 쪽으로,{' '}
            <b>{conflict.highest.reading.name}</b>
            {josa(conflict.highest.reading.name, '은는')} {AXIS_BY_ID[conflict.axisId].pos} 쪽으로 봅니다.
            <br />
            겉으로 보이는 모습과 실제로 편한 모습이 다를 가능성이 큽니다.
          </p>
        </div>
      )}

      <div className="axes">
        {consensus.axes.map((a) => {
          const axis = AXIS_BY_ID[a.axisId]
          const pct = (a.mean + 1) / 2 * 100
          return (
            <div className="axis" key={a.axisId}>
              <span className="axis-end left">{axis.neg}</span>
              <div className="axis-track">
                <div className="axis-mid" />
                <div
                  className={`axis-dot ${a.spread > 0.45 ? 'shaky' : ''}`}
                  style={{ left: `${pct}%` }}
                />
              </div>
              <span className="axis-end right">{axis.pos}</span>
            </div>
          )
        })}
      </div>
      <p className="hint center">
        붉은 점은 점술마다 의견이 갈린 축입니다.
        <br />
        합의도는 성향을 말하는 {voting}가지로만 계산했습니다. 탄생석과 오늘의 운세는 뺐습니다.
      </p>
    </section>
  )
}

/** 합의도를 원형 눈금으로 보여준다. */
function Dial({ score }: { score: number }) {
  const size = 190
  const stroke = 7
  const r = (size - stroke) / 2 - 10
  const c = 2 * Math.PI * r
  // 위쪽을 비워 말굽 모양으로 만든다. 전체의 4분의 3만 눈금으로 쓴다.
  const arc = c * 0.75
  const offset = arc - (arc * score) / 100

  return (
    <div className="dial">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          <circle
            className="dial-track"
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={stroke}
            strokeDasharray={`${arc} ${c}`}
            strokeLinecap="round"
          />
          <circle
            className="dial-fill"
            cx={size / 2} cy={size / 2} r={r}
            fill="none" strokeWidth={stroke}
            strokeDasharray={`${arc} ${c}`}
            strokeDashoffset={offset}
          />
        </g>
        <text className="dial-num" x="50%" y="50%" textAnchor="middle">
          {score}
          <tspan className="dial-unit">%</tspan>
        </text>
        <text className="dial-cap" x="50%" y="70%" textAnchor="middle">
          합의도
        </text>
      </svg>
    </div>
  )
}
