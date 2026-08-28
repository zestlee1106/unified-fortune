import { useRef, useState } from 'react'
import { AXIS_BY_ID } from '../core/axes'
import { josa } from '../core/josa'
import { computeRarity, rarityCompact, rarityKorea } from '../core/rarity'
import { shareUrlFor } from '../core/shareUrl'
import { topPercentFor } from '../data/percentile'
import type { Consensus } from '../core/consensus'
import type { BirthInput, Reading } from '../core/types'
import type { DaeunResult } from '../engines/daeun'

interface Props {
  input: BirthInput
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

function draw(
  canvas: HTMLCanvasElement,
  input: BirthInput,
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

  ctx.fillStyle = C.text
  ctx.font = font(180, '700', true)
  ctx.fillText(`${consensus.score}%`, W / 2, 316)
  ctx.fillStyle = C.dim
  ctx.font = font(28, '600')
  ctx.fillText('점술들이 서로 동의한 정도', W / 2, 372)

  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  ctx.beginPath()
  ctx.roundRect(gx, 424, gw, 10, 5)
  ctx.fill()
  ctx.fillStyle = C.gold
  ctx.beginPath()
  ctx.roundRect(gx, 424, (gw * consensus.score) / 100, 10, 5)
  ctx.fill()

  // 점수만으로는 높은지 낮은지 모른다. 백분위와 희귀도를 나란히 붙인다.
  const rarity = computeRarity(input)
  ctx.textAlign = 'center'
  ctx.fillStyle = C.gold
  ctx.font = font(30, '700', true)
  ctx.fillText(
    `상위 ${topPercentFor(consensus.score)}%   ·   ${rarityCompact(rarity)}`,
    W / 2, 500,
  )
  ctx.fillStyle = C.dim
  ctx.font = font(22, '600')
  ctx.fillText(rarityKorea(rarity), W / 2, 536)

  let y = 620

  if (consensus.agreement) {
    ctx.textAlign = 'left'
    ctx.fillStyle = C.jade
    ctx.font = font(26, '700')
    ctx.fillText(`✓ ${consensus.agreement.voters}가지가 동의`, gx, y)
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
    ctx.fillText('✗ 여기서 정면으로 갈림', gx, y)
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
    ctx.fillText('★ 인생의 전성기', gx, y)
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
  // 행 높이를 먼저 고정한다. 남는 자리에 맞춰 늘리면 위 블록이 길어졌을 때 글자가 겹친다.
  const ROW_H = 64
  const BOX_PAD = 52
  const cols = 2
  const available = H - 110 - y

  let shown = readings
  let rows = Math.ceil(shown.length / cols)
  let boxH = rows * ROW_H + BOX_PAD

  if (boxH > available) {
    // 자리가 모자라면 들어가는 만큼만 싣는다. 겹쳐 보이는 것보다 낫다.
    const fitRows = Math.max(2, Math.floor((available - BOX_PAD) / ROW_H))
    shown = readings.slice(0, fitRows * cols)
    rows = fitRows
    boxH = fitRows * ROW_H + BOX_PAD
  }

  const boxTop = y
  ctx.fillStyle = 'rgba(255,255,255,0.035)'
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.roundRect(gx - 26, boxTop, gw + 52, boxH, 22)
  ctx.fill()
  ctx.stroke()

  const colW = (gw - 24) / cols

  ctx.textAlign = 'left'
  shown.forEach((r, i) => {
    const col = Math.floor(i / rows)
    const row = i % rows
    const x = gx + col * (colW + 24)
    const cy = boxTop + BOX_PAD / 2 + row * ROW_H + 18

    ctx.fillStyle = C.dim
    ctx.font = font(19, '700')
    ctx.fillText(clip(ctx, r.name, colW), x, cy)
    ctx.fillStyle = C.text
    ctx.font = font(25, '700', true)
    ctx.fillText(clip(ctx, r.headline, colW), x, cy + 30)
  })

  // 자리가 모자라 잘렸으면 몇 개가 더 있는지 밝힌다.
  // 잘린 걸 숨기면 "다 들어있다"는 이 카드의 요점이 오히려 약해진다.
  const hidden = readings.length - shown.length
  ctx.textAlign = 'center'
  ctx.fillStyle = C.dim
  ctx.font = font(20, '600')
  ctx.fillText(
    hidden > 0
      ? `외 ${hidden}가지 더 · 전부 재미로 보는 것입니다`
      : '전부 재미로 보는 것입니다',
    W / 2, H - 48,
  )
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

async function renderFile(
  canvas: HTMLCanvasElement,
  input: BirthInput,
  consensus: Consensus,
  readings: Reading[],
  daeun: DaeunResult,
): Promise<File | null> {
  // 웹폰트가 아직 안 왔으면 canvas가 기본 폰트로 그려버린다.
  await document.fonts.ready
  draw(canvas, input, consensus, readings, daeun)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  )
  if (!blob) return null
  return new File([blob], '통합점사이트-결과.png', { type: 'image/png' })
}

export function ShareCard({ input, consensus, readings, daeun }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [toast, setToast] = useState('')

  const url = shareUrlFor(input)
  const rarity = computeRarity(input)
  const text = daeun.peak
    ? `열한 가지 점술이 ${consensus.score}% 동의. ${rarityCompact(rarity)} 조합이고 전성기는 ${daeun.peak.startAge}~${daeun.peak.endAge}세.`
    : `열한 가지 점술이 ${consensus.score}% 동의. ${rarityCompact(rarity)} 조합입니다.`

  const say = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2600)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      say('링크를 복사했습니다. 붙여넣으면 이 결과가 그대로 열립니다.')
    } catch {
      say('복사에 실패했습니다. 주소창의 주소를 그대로 쓰시면 됩니다.')
    }
  }

  /**
   * 모바일에서는 OS 공유 시트가 떠서 카톡을 고를 수 있고 이미지까지 같이 넘어간다.
   * 데스크톱 브라우저는 대부분 지원하지 않아서 링크 복사로 떨어진다.
   */
  const share = async () => {
    const canvas = ref.current
    if (!canvas) return

    const file = await renderFile(canvas, input, consensus, readings, daeun)

    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text, url })
        return
      } catch (e) {
        // 사용자가 공유 시트를 닫은 것은 실패가 아니다.
        if ((e as Error).name === 'AbortError') return
      }
    }

    if (navigator.share) {
      try {
        await navigator.share({ title: '통합 점 사이트', text, url })
        return
      } catch (e) {
        if ((e as Error).name === 'AbortError') return
      }
    }

    await copyLink()
  }

  const saveImage = async () => {
    const canvas = ref.current
    if (!canvas) return
    const file = await renderFile(canvas, input, consensus, readings, daeun)
    if (!file) return
    const href = URL.createObjectURL(file)
    const a = document.createElement('a')
    a.href = href
    a.download = file.name
    a.click()
    URL.revokeObjectURL(href)
    say('이미지를 저장했습니다.')
  }

  return (
    <div className="share">
      <button className="submit" onClick={share}>
        공유하기
      </button>
      <div className="share-sub">
        <button className="share-mini" onClick={copyLink}>
          링크 복사
        </button>
        <button className="share-mini" onClick={saveImage}>
          이미지 저장
        </button>
      </div>
      <p className="hint center share-note">
        {toast || '링크를 열면 이 결과가 그대로 나옵니다. 계산에 쓴 값만 주소에 담기고 서버로는 아무것도 가지 않습니다.'}
      </p>
      <canvas ref={ref} style={{ display: 'none' }} />
    </div>
  )
}
