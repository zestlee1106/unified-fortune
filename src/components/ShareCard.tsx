import { useRef, useState } from 'react'
import { AXIS_BY_ID } from '../core/axes'
import { josa } from '../core/josa'
import type { Consensus } from '../core/consensus'
import type { Reading } from '../core/types'
import type { DaeunResult } from '../engines/daeun'

interface Props {
  consensus: Consensus
  readings: Reading[]
  daeun: DaeunResult
}

const W = 1080
const H = 1350

/** 화면 CSS 토큰과 같은 값을 쓴다. 둘이 어긋나면 저장한 이미지만 딴 사이트처럼 보인다. */
const C = {
  bgTop: '#0e111a',
  bgBottom: '#161a26',
  gold: '#d4a24c',
  jade: '#4dbb96',
  coral: '#dd6f5f',
  text: '#edeff5',
  muted: '#a3aabd',
  dim: '#666e84',
}
const SERIF = "'Gowun Batang', 'Apple SD Gothic Neo', serif"
const SANS = "'Pretendard Variable', Pretendard, -apple-system, sans-serif"

/** 서버가 없어서 OG 이미지를 못 만든다. 대신 canvas로 카드를 그려 PNG로 저장시킨다. */
function draw(
  canvas: HTMLCanvasElement,
  consensus: Consensus,
  readings: Reading[],
  daeun: DaeunResult,
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  canvas.width = W
  canvas.height = H

  const grad = ctx.createLinearGradient(0, 0, 0, H)
  grad.addColorStop(0, C.bgTop)
  grad.addColorStop(1, C.bgBottom)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, H)

  // 위쪽에서 떨어지는 빛. 화면의 body::before와 같은 역할이다.
  const glow = ctx.createRadialGradient(W / 2, -120, 0, W / 2, -120, 780)
  glow.addColorStop(0, 'rgba(212,162,76,0.16)')
  glow.addColorStop(1, 'rgba(212,162,76,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  const font = (size: number, weight = '700', serif = false) =>
    `${weight} ${size}px ${serif ? SERIF : SANS}`

  const gx = 120
  const gw = W - 240

  ctx.textAlign = 'center'
  ctx.fillStyle = C.gold
  ctx.font = font(26, '600')
  ctx.fillText('열한 가지를 한 번에', W / 2, 108)

  // 합의도 숫자
  ctx.fillStyle = C.text
  ctx.font = font(180, '700', true)
  ctx.fillText(`${consensus.score}%`, W / 2, 316)
  ctx.fillStyle = C.dim
  ctx.font = font(28, '600')
  ctx.fillText('점술들이 서로 동의한 정도', W / 2, 372)

  // 게이지
  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.roundRect(gx, 424, gw, 10, 5)
  ctx.fill()
  ctx.fillStyle = C.gold
  ctx.beginPath()
  ctx.roundRect(gx, 424, (gw * consensus.score) / 100, 10, 5)
  ctx.fill()

  let y = 530

  if (consensus.agreement) {
    ctx.textAlign = 'left'
    ctx.fillStyle = C.jade
    ctx.font = font(26, '700')
    ctx.fillText(`\u2713 ${consensus.agreement.voters}가지가 동의`, gx, y)
    y += 52
    ctx.fillStyle = C.text
    ctx.font = font(42, '700', true)
    y = wrap(ctx, consensus.agreement.sentence, gx, y, gw, 56)
    y += 76
  }

  const c = consensus.conflict
  if (c && c.spread > 0.35 && c.lowest && c.highest) {
    const axis = AXIS_BY_ID[c.axisId]
    const lo = c.lowest.reading.name
    const hi = c.highest.reading.name
    ctx.textAlign = 'left'
    ctx.fillStyle = C.coral
    ctx.font = font(26, '700')
    ctx.fillText('\u2717 여기서 정면으로 갈림', gx, y)
    y += 50
    ctx.fillStyle = C.text
    ctx.font = font(36, '700', true)
    y = wrap(
      ctx,
      `${lo}${josa(lo, '은는')} ${axis.neg}, ${hi}${josa(hi, '은는')} ${axis.pos}`,
      gx, y, gw, 48,
    )
    y += 68
  }

  // 전성기는 이 카드에서 제일 공유하고 싶어질 한 줄이라 크게 넣는다.
  if (daeun.peak) {
    ctx.textAlign = 'left'
    ctx.fillStyle = C.gold
    ctx.font = font(26, '700')
    ctx.fillText('\u2605 인생의 전성기', gx, y)
    y += 50
    ctx.fillStyle = C.text
    ctx.font = font(38, '700', true)
    y = wrap(
      ctx,
      `${daeun.peak.startAge}~${daeun.peak.endAge}세 · ${daeun.peak.startYear}년부터`,
      gx, y, gw, 48,
    )
    y += 44
  }

  // 나머지를 2열로 깔아서 "다 들어있다"가 한눈에 보이게 한다.
  const boxTop = y
  const boxH = H - boxTop - 110
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(gx - 26, boxTop, gw + 52, boxH, 22)
  ctx.fill()
  ctx.stroke()

  const cols = 2
  const rows = Math.ceil(readings.length / cols)
  const colW = (gw - 24) / cols
  const rowH = (boxH - 56) / rows

  ctx.textAlign = 'left'
  readings.forEach((r, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    const x = gx + col * (colW + 24)
    const cy = boxTop + 34 + row * rowH + 22

    ctx.fillStyle = C.dim
    ctx.font = font(19, '700')
    ctx.fillText(clip(ctx, r.name, colW), x, cy)
    ctx.fillStyle = C.text
    ctx.font = font(25, '700', true)
    ctx.fillText(clip(ctx, r.headline, colW), x, cy + 32)
  })

  ctx.textAlign = 'center'
  ctx.fillStyle = C.dim
  ctx.font = font(22, '500')
  ctx.fillText('전부 재미로 보는 것입니다', W / 2, H - 48)
}

/** 줄바꿈하며 그리고, 마지막으로 그린 줄의 y를 돌려준다. */
function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number, y: number, maxW: number, lh: number,
): number {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y)
      y += lh
      line = w
    } else {
      line = test
    }
  }
  if (line) ctx.fillText(line, x, y)
  return y
}

function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  if (ctx.measureText(text).width <= maxW) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1)
  return `${t}…`
}

export function ShareCard({ consensus, readings, daeun }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [done, setDone] = useState(false)

  const save = async () => {
    const canvas = ref.current
    if (!canvas) return
    // 웹폰트가 아직 안 왔으면 canvas가 기본 폰트로 그려버린다.
    await document.fonts.ready
    draw(canvas, consensus, readings, daeun)
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = '통합점사이트-결과.png'
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
    }, 'image/png')
  }

  return (
    <div className="share">
      <button className="submit ghost" onClick={save}>
        결과 카드 이미지로 저장
      </button>
      {done && <p className="hint center">저장했습니다. 그대로 올리면 됩니다.</p>}
      <canvas ref={ref} style={{ display: 'none' }} />
    </div>
  )
}
