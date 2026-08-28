import type { DaeunResult } from '../engines/daeun'
import { josa } from '../core/josa'

const GRADE_LABEL: Record<string, string> = {
  best: '활짝',
  good: '순함',
  flat: '무난',
  hard: '버팀',
  worst: '고비',
}

export function Timeline({ daeun }: { daeun: DaeunResult }) {
  const { current, peak, next, yearsToNext, periods } = daeun
  const shown = periods.filter((p) => p.endAge <= 92)

  return (
    <section className="card timeline">
      <p className="kicker">사주로 본 인생 시간표</p>

      <div className="daeun-now">
        {current ? (
          <>
            <p className="daeun-now-label">
              지금은 {current.startAge}~{current.endAge}세 · {current.ganZhi} {current.ganZhiKo} 대운
            </p>
            <p className="daeun-now-key">{current.keyword}</p>
            <p className="daeun-now-line">{current.line}</p>
          </>
        ) : (
          <p className="daeun-now-line">
            아직 첫 대운이 시작되기 전입니다. {daeun.startAge}세부터 시작합니다.
          </p>
        )}
      </div>

      {next && yearsToNext !== null && (
        <div className="block shift">
          <p className="block-head">
            <span className="mark">→</span>
            {yearsToNext <= 0
              ? '올해 대운이 바뀝니다'
              : `${yearsToNext}년 뒤, ${next.startYear}년에 대운이 바뀝니다`}
          </p>
          <p className="block-body">
            {next.ganZhi} {next.ganZhiKo} 대운으로 넘어가면서 화두가{' '}
            <b>{current?.keyword ?? '지금'}</b>에서 <b>{next.keyword}</b>
            {josa(next.keyword, '으로')} 옮겨갑니다.
            <br />
            {next.line}
          </p>
        </div>
      )}

      {peak && (
        <div className="block peak">
          <p className="block-head">
            <span className="mark">★</span>
            전성기는 {peak.startAge}~{peak.endAge}세, {peak.startYear}년부터입니다
          </p>
          <p className="block-body">
            {peak.ganZhi} {peak.ganZhiKo} 대운. {peak.tenGod}
            {josa(peak.tenGod, '이가')} 들어오는 시기라 <b>{peak.keyword}</b>
            {josa(peak.keyword, '이가')} 중심이 됩니다.
            {peak.isCurrent && ' 지금이 바로 그때입니다.'}
          </p>
        </div>
      )}

      <div className="daeun-list">
        {shown.map((p) => (
          <div
            className={`daeun-row ${p.grade} ${p.isCurrent ? 'now' : ''} ${p.isPeak ? 'peak' : ''}`}
            key={p.startAge}
          >
            <span className="daeun-age">
              {p.startAge}~{p.endAge}
              <em>{p.startYear}년~</em>
            </span>
            <span className="daeun-bar">
              <span
                className="daeun-fill"
                style={{ width: `${Math.min(100, Math.max(6, (p.score + 2.4) / 4.8 * 100))}%` }}
              />
            </span>
            <span className="daeun-info">
              <b>{p.ganZhiKo}</b>
              <em>{p.keyword}</em>
            </span>
            <span className="daeun-mark">
              {p.isCurrent ? '지금' : p.isPeak ? '전성기' : GRADE_LABEL[p.grade]}
            </span>
          </div>
        ))}
      </div>

      <p className="hint">
        일간 {daeun.dayGan}({daeun.dayElement})이 {daeun.strong ? '강한' : '약한'} 사주로 봤습니다.
        그래서 {daeun.favorable.join('·')} 기운이 들어오는 시기를 좋게 계산했습니다.
        {daeun.forward ? ' 대운은 순행합니다.' : ' 대운은 역행합니다.'}
      </p>
      <p className="caveat">
        ※ 신강·신약 판정과 좋은 기운을 고르는 방식은 유파마다 다릅니다.
        여기서는 월지를 가장 무겁게 보는 간이 방식을 씁니다. 지장간과 합충은 보지 않습니다.
      </p>
    </section>
  )
}
