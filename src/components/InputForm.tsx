import { useState } from 'react'
import type { BirthInput } from '../core/types'

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
]
const BLOODS: BirthInput['blood'][] = ['A', 'B', 'O', 'AB']
const GENDERS: { key: BirthInput['gender']; label: string }[] = [
  { key: 'male', label: '남성' },
  { key: 'female', label: '여성' },
]

interface Props {
  onSubmit: (input: BirthInput) => void
}

export function InputForm({ onSubmit }: Props) {
  const [birth, setBirth] = useState('1995-07-14')
  const [time, setTime] = useState('09:30')
  const [timeUnknown, setTimeUnknown] = useState(false)
  const [mbti, setMbti] = useState('')
  const [blood, setBlood] = useState<BirthInput['blood'] | ''>('')
  const [gender, setGender] = useState<BirthInput['gender'] | ''>('')
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const [y, m, d] = birth.split('-').map(Number)
    if (!y || !m || !d) return setError('생년월일을 확인해 주세요.')
    if (y < 1900 || y > 2100) return setError('1900년부터 2100년 사이만 계산할 수 있습니다.')
    if (!mbti) return setError('MBTI를 골라주세요. 모르면 검사 결과 없이도 됩니다만, 정확도가 떨어집니다.')
    if (!blood) return setError('혈액형을 골라주세요.')
    if (!gender) return setError('대운은 성별에 따라 방향이 갈려서 성별이 필요합니다.')

    const [hh, mm] = timeUnknown ? [12, 0] : time.split(':').map(Number)
    setError('')
    onSubmit({
      year: y, month: m, day: d,
      hour: hh ?? 12, minute: mm ?? 0,
      timeUnknown, mbti, blood, gender,
    })
  }

  return (
    <form className="card form" onSubmit={submit}>
      <label className="field">
        <span className="field-label">생년월일 <em>양력</em></span>
        <input
          type="date" value={birth} min="1900-01-01" max="2100-12-31"
          onChange={(e) => setBirth(e.target.value)}
        />
      </label>

      <label className="field">
        <span className="field-label">태어난 시각</span>
        <input
          type="time" value={time} disabled={timeUnknown}
          onChange={(e) => setTime(e.target.value)}
        />
      </label>

      <label className="checkbox">
        <input
          type="checkbox" checked={timeUnknown}
          onChange={(e) => setTimeUnknown(e.target.checked)}
        />
        <span>시간을 모릅니다</span>
      </label>
      <p className="hint">
        시각을 넣으면 사주 시주와 태국 수요일 낮/밤 구분까지 계산합니다.
      </p>

      <div className="field">
        <span className="field-label">MBTI</span>
        <div className="chip-grid mbti">
          {MBTI_TYPES.map((t) => (
            <button
              key={t} type="button"
              className={`chip ${mbti === t ? 'on' : ''}`}
              onClick={() => setMbti(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">혈액형</span>
        <div className="chip-grid blood">
          {BLOODS.map((b) => (
            <button
              key={b} type="button"
              className={`chip ${blood === b ? 'on' : ''}`}
              onClick={() => setBlood(b)}
            >
              {b}형
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label">
          성별 <em>대운 계산용</em>
        </span>
        <div className="chip-grid duo">
          {GENDERS.map((g) => (
            <button
              key={g.key} type="button"
              className={`chip ${gender === g.key ? 'on' : ''}`}
              onClick={() => setGender(g.key)}
            >
              {g.label}
            </button>
          ))}
        </div>
        <p className="hint">
          사주에서 대운은 양남음녀가 순행, 음남양녀가 역행이라 성별에 따라 인생 시간표가 반대로 갑니다.
        </p>
      </div>

      {error && <p className="error">{error}</p>}

      <button className="submit" type="submit">열한 가지 한꺼번에 보기</button>
      <p className="hint center">
        입력한 정보는 브라우저 밖으로 나가지 않습니다. 서버가 없어서 보낼 곳도 없습니다.
      </p>
    </form>
  )
}
