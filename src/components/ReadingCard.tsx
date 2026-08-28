import { useEffect, useState } from 'react'
import type { Reading } from '../core/types'

interface Props {
  reading: Reading
  /** 바깥에서 전부 펼치기를 누르면 이 값이 바뀐다 */
  forceOpen: boolean
}

export function ReadingCard({ reading, forceOpen }: Props) {
  const [open, setOpen] = useState(forceOpen)

  // 전부 펼치기/접기를 누른 순간에만 따라간다. 그 뒤 개별 토글은 그대로 둔다.
  useEffect(() => {
    setOpen(forceOpen)
  }, [forceOpen])

  return (
    <article className={`card reading ${open ? 'open' : ''}`}>
      <button className="reading-head" onClick={() => setOpen((v) => !v)}>
        <span className="reading-emoji">{reading.emoji}</span>
        <span className="reading-title">
          <span className="reading-name">{reading.name}</span>
          <span className="reading-headline">{reading.headline}</span>
        </span>
        <span className="reading-toggle">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="reading-body">
          {reading.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          <dl className="facts">
            {reading.facts.map((f) => (
              <div className="fact" key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>

          {reading.caveat && <p className="caveat">※ {reading.caveat}</p>}
        </div>
      )}
    </article>
  )
}
