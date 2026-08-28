import type { TodayFortune } from '../engines/today'

export function TodayCard({ today }: { today: TodayFortune }) {
  return (
    <section className="card today">
      <div className="today-head">
        <span className="today-date">{today.dateLabel} 운세</span>
        <span className="today-score">
          {today.score}
          <em>점 · {today.grade}</em>
        </span>
      </div>

      <p className="today-main">{today.main}</p>

      <div className="today-rows">
        {today.rows.map((r) => (
          <div className="today-row" key={r.label}>
            <span className="today-row-label">{r.label}</span>
            <p className="today-row-text">{r.text}</p>
          </div>
        ))}
        <div className="today-row">
          <span className="today-row-label">조심</span>
          <p className="today-row-text">{today.warning}</p>
        </div>
      </div>

      <dl className="today-lucky">
        {today.lucky.map((l) => (
          <div className="lucky" key={l.label}>
            <dt>행운의 {l.label}</dt>
            <dd>{l.value}</dd>
          </div>
        ))}
      </dl>

      <p className="today-quote">{today.quote}</p>

      {today.daeunNote && <p className="caveat">※ {today.daeunNote}</p>}
    </section>
  )
}
