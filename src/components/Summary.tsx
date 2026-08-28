import { AXIS_BY_ID } from '../core/axes'
import { josa } from '../core/josa'
import type { Consensus } from '../core/consensus'
import type { Reading } from '../core/types'

interface Props {
  consensus: Consensus
  readings: Reading[]
}

export function Summary({ consensus, readings }: Props) {
  const { score, agreement, conflict } = consensus
  // 탄생석과 오늘의 운세는 성향 축에 투표하지 않는다. 합의도는 나머지로만 계산한다.
  const voting = readings.filter((r) => Object.keys(r.axes).length > 0).length

  const verdict =
    score >= 75 ? '이례적으로 말이 맞는 편'
      : score >= 55 ? '대체로 같은 방향'
        : score >= 40 ? '반은 맞고 반은 갈림'
          : '서로 딴소리 중'

  return (
    <section className="card summary">
      <p className="kicker">{readings.length + 2}가지가 본 당신</p>

      <Dial score={score} />
      <p className="verdict">{verdict}</p>

      {agreement && (
        <div className="block agree">
          <p className="block-head">
            <span className="mark">✓</span>
            {agreement.voters}가지가 같은 말을 합니다
          </p>
          <p className="block-body">{agreement.sentence}</p>
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

/** 합의도를 원형 눈금으로 보여준다. 이 화면에서 제일 먼저 눈에 들어와야 하는 숫자다. */
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
