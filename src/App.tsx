import { useMemo, useState } from 'react'
import { InputForm } from './components/InputForm'
import { Summary } from './components/Summary'
import { ReadingCard } from './components/ReadingCard'
import { ShareCard } from './components/ShareCard'
import { Timeline } from './components/Timeline'
import { TodayCard } from './components/TodayCard'
import { buildConsensus } from './core/consensus'
import { fromQuery, toQuery } from './core/shareUrl'
import { computeDaeun } from './engines/daeun'
import { computeToday } from './engines/today'
import { runAll } from './engines'
import type { BirthInput } from './core/types'
import './App.css'

export default function App() {
  // 공유 링크로 들어온 경우 주소에 실린 값으로 바로 결과를 띄운다.
  const [input, setInput] = useState<BirthInput | null>(() =>
    fromQuery(window.location.search),
  )
  const [allOpen, setAllOpen] = useState(false)

  const submit = (next: BirthInput) => {
    setInput(next)
    // 새로고침하거나 링크를 복사해도 같은 결과가 열리도록 주소를 바꿔둔다.
    window.history.replaceState(null, '', toQuery(next))
    window.scrollTo({ top: 0 })
  }

  const reset = () => {
    setInput(null)
    setAllOpen(false)
    window.history.replaceState(null, '', window.location.pathname)
    window.scrollTo({ top: 0 })
  }

  const result = useMemo(() => {
    if (!input) return null
    const readings = runAll(input)
    const daeun = computeDaeun(input)
    return {
      readings,
      consensus: buildConsensus(readings),
      daeun,
      today: computeToday(input, daeun),
    }
  }, [input])

  return (
    <div className="page">
      <header className="header">
        <span className="header-mark">열한 가지를 한 번에</span>
        <h1>통합 점 사이트</h1>
        <span className="sub">
          오늘의 운세 · 대운 · 사주 · 십이지 띠 · 서양 별자리 · 태국 요일점 · 수비학 ·
          마야 촐킨 · MBTI · 혈액형 · 탄생석
        </span>
      </header>

      {!result && (
        <>
          <p className="lead">
            생년월일과 MBTI, 혈액형만 넣으면 열한 가지 점술이 한꺼번에 돌아갑니다.
            <br />
            그리고 <b>그것들이 서로 어디서 동의하고 어디서 싸우는지</b>를 보여줍니다.
          </p>
          <InputForm onSubmit={submit} />
        </>
      )}

      {result && (
        <>
          <TodayCard today={result.today} />

          <Summary consensus={result.consensus} readings={result.readings} />
          <ShareCard
            input={input!}
            consensus={result.consensus}
            readings={result.readings}
            daeun={result.daeun}
          />

          <Timeline daeun={result.daeun} />

          <div className="section-head">
            <h2 className="section-title">나머지 아홉 가지</h2>
            <button className="section-toggle" onClick={() => setAllOpen((v) => !v)}>
              {allOpen ? '전부 접기' : '전부 펼치기'}
            </button>
          </div>
          <div className="readings">
            {result.readings.map((r) => (
              <ReadingCard key={r.id} reading={r} forceOpen={allOpen} />
            ))}
          </div>

          <button className="submit ghost" onClick={reset}>
            다시 하기
          </button>
        </>
      )}

      <footer className="footer">
        <p>
          전부 재미로 보는 것입니다. 여기 있는 어떤 항목도 과학적으로 검증된 게 아닙니다.
          특히 혈액형 성격론은 여러 연구에서 반복적으로 부정됐습니다.
        </p>
        <p>
          계산은 전부 브라우저 안에서 끝나고 서버로 아무것도 보내지 않습니다.
          입력한 생년월일은 저장되지도 않습니다.
        </p>
      </footer>
    </div>
  )
}
