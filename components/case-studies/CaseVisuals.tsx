'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useInView } from 'framer-motion'

/* ─────────────────────────────────────────────
   Shared constants & helpers
   ───────────────────────────────────────────── */

const PRIMARY = '#2E9AC4'
const LIGHT = '#56B8DE'
const DARK = '#1B7EA6'
const TEXT = '#1A1A2E'
const MUTED = '#94A3B8'
const GRID = '#E2E8F0'
const BG = '#F8FAFC'
const GREEN = '#00B67A'

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO = '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace'

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

function setupCanvas(
  canvas: HTMLCanvasElement,
  container: HTMLDivElement
): { ctx: CanvasRenderingContext2D; w: number; h: number; dpr: number } | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const rect = container.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const w = rect.width
  const h = rect.height

  canvas.width = w * dpr
  canvas.height = h * dpr
  canvas.style.width = w + 'px'
  canvas.style.height = h + 'px'
  ctx.scale(dpr, dpr)

  return { ctx, w, h, dpr }
}

function clearCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)
}

/* ─────────────────────────────────────────────
   CaseVisual1 — Revenue Growth (Bar + Line Chart)
   ───────────────────────────────────────────── */

export function CaseVisual1() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 2000, 1)
    const easedProgress = easeOutCubic(progress)

    clearCanvas(ctx, w, h)

    // Paddings
    const padLeft = w * 0.12
    const padRight = w * 0.08
    const padTop = h * 0.12
    const padBottom = h * 0.18
    const chartW = w - padLeft - padRight
    const chartH = h - padTop - padBottom

    // Bar data (6 months, values represent revenue levels 0-1)
    const barValues = [0.12, 0.2, 0.35, 0.55, 0.75, 1.0]
    const barCount = barValues.length
    const barGap = chartW * 0.04
    const barWidth = (chartW - barGap * (barCount + 1)) / barCount

    // Y-axis labels
    const yLabels = ['€2M', '€1.5M', '€1M', '€500K']
    const yPositions = [0, 0.33, 0.66, 1.0]

    // Draw grid lines
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    for (let i = 0; i < yPositions.length; i++) {
      const y = padTop + yPositions[i] * chartH
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(padLeft, y)
      ctx.lineTo(w - padRight, y)
      ctx.stroke()
    }
    ctx.setLineDash([])

    // Y-axis labels
    ctx.fillStyle = MUTED
    ctx.font = `10px ${MONO}`
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < yLabels.length; i++) {
      const y = padTop + yPositions[i] * chartH
      const labelAlpha = Math.min(easedProgress * 3, 1)
      ctx.globalAlpha = labelAlpha
      ctx.fillText(yLabels[i], padLeft - 8, y)
    }
    ctx.globalAlpha = 1

    // X-axis labels
    const months = ['Mo 1', 'Mo 2', 'Mo 3', 'Mo 4', 'Mo 5', 'Mo 6']
    ctx.fillStyle = MUTED
    ctx.font = `10px ${MONO}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let i = 0; i < barCount; i++) {
      const x = padLeft + barGap + i * (barWidth + barGap) + barWidth / 2
      const labelAlpha = Math.min(easedProgress * 2.5, 1)
      ctx.globalAlpha = labelAlpha
      ctx.fillText(months[i], x, padTop + chartH + 8)
    }
    ctx.globalAlpha = 1

    // Draw bars
    const barTops: { x: number; y: number }[] = []
    for (let i = 0; i < barCount; i++) {
      const barProgress = Math.max(0, Math.min((easedProgress - i * 0.08) / 0.6, 1))
      const x = padLeft + barGap + i * (barWidth + barGap)
      const fullHeight = barValues[i] * chartH
      const currentHeight = fullHeight * barProgress
      const y = padTop + chartH - currentHeight

      // Bar gradient
      const grad = ctx.createLinearGradient(x, padTop + chartH, x, y)
      grad.addColorStop(0, LIGHT)
      grad.addColorStop(1, PRIMARY)

      ctx.fillStyle = grad
      ctx.beginPath()
      const radius = 4
      ctx.moveTo(x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, padTop + chartH)
      ctx.lineTo(x, padTop + chartH)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.fill()

      barTops.push({ x: x + barWidth / 2, y: padTop + chartH - fullHeight })
    }

    // Draw smooth growth curve
    if (easedProgress > 0.3) {
      const curveProgress = Math.min((easedProgress - 0.3) / 0.5, 1)

      // Area fill below curve (very subtle)
      ctx.globalAlpha = 0.08 * curveProgress
      ctx.fillStyle = PRIMARY
      ctx.beginPath()
      ctx.moveTo(barTops[0].x, barTops[0].y)
      for (let i = 0; i < barTops.length - 1; i++) {
        const cp1x = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp1y = barTops[i].y
        const cp2x = barTops[i + 1].x - (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp2y = barTops[i + 1].y
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, barTops[i + 1].x, barTops[i + 1].y)
      }
      ctx.lineTo(barTops[barTops.length - 1].x, padTop + chartH)
      ctx.lineTo(barTops[0].x, padTop + chartH)
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Curve line
      ctx.strokeStyle = DARK
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(barTops[0].x, barTops[0].y)

      const totalLen = barTops.length - 1
      const drawSegments = Math.floor(curveProgress * totalLen) + 1

      for (let i = 0; i < Math.min(drawSegments, totalLen); i++) {
        const segProgress = i < drawSegments - 1 ? 1 : (curveProgress * totalLen) % 1
        const cp1x = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp1y = barTops[i].y
        const cp2x = barTops[i + 1].x - (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp2y = barTops[i + 1].y

        if (segProgress >= 1) {
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, barTops[i + 1].x, barTops[i + 1].y)
        } else {
          // Approximate partial bezier
          const endX = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * segProgress
          const endY = barTops[i].y + (barTops[i + 1].y - barTops[i].y) * segProgress
          const pcp1x = barTops[i].x + (cp1x - barTops[i].x) * segProgress
          const pcp1y = barTops[i].y + (cp1y - barTops[i].y) * segProgress
          ctx.quadraticCurveTo(pcp1x, pcp1y, endX, endY)
        }
      }
      ctx.stroke()

      // Data points
      for (let i = 0; i < barTops.length; i++) {
        const dotProgress = Math.max(0, Math.min((curveProgress - i * 0.12) / 0.3, 1))
        if (dotProgress > 0) {
          ctx.globalAlpha = dotProgress
          ctx.fillStyle = DARK
          ctx.beginPath()
          ctx.arc(barTops[i].x, barTops[i].y, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(barTops[i].x, barTops[i].y, 1.5, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }
      }
    }

    // 4x Badge
    if (easedProgress > 0.7) {
      const badgeProgress = Math.min((easedProgress - 0.7) / 0.3, 1)
      ctx.globalAlpha = badgeProgress

      const badgeX = w - padRight - 60
      const badgeY = padTop - 5
      const badgeW = 52
      const badgeH = 28
      const badgeR = 8

      ctx.fillStyle = 'rgba(46, 154, 196, 0.1)'
      ctx.strokeStyle = 'rgba(46, 154, 196, 0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(badgeX + badgeR, badgeY)
      ctx.lineTo(badgeX + badgeW - badgeR, badgeY)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeR)
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - badgeR)
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeR, badgeY + badgeH)
      ctx.lineTo(badgeX + badgeR, badgeY + badgeH)
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - badgeR)
      ctx.lineTo(badgeX, badgeY + badgeR)
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeR, badgeY)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = TEXT
      ctx.font = `bold 16px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('4x', badgeX + badgeW / 2, badgeY + badgeH / 2)
      ctx.globalAlpha = 1
    }

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 2001
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual2 — Turnaround Comparison (Cocunat)
   ───────────────────────────────────────────── */

export function CaseVisual2() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 2500, 1)

    clearCanvas(ctx, w, h)

    const centerX = w / 2
    const topY = h * 0.15
    const bottomY = h * 0.72
    const midY = (topY + bottomY) / 2

    // Phase 1: Left decline (0-0.35)
    const leftProgress = Math.min(progress / 0.35, 1)
    const leftEased = easeOutCubic(leftProgress)

    // Phase 2: Center Iron Media bars (0.3-0.55)
    const centerProgress = Math.max(0, Math.min((progress - 0.3) / 0.25, 1))
    const centerEased = easeOutCubic(centerProgress)

    // Phase 3: Right growth (0.5-0.85)
    const rightProgress = Math.max(0, Math.min((progress - 0.5) / 0.35, 1))
    const rightEased = easeOutCubic(rightProgress)

    // Phase 4: Labels and badge (0.7-1.0)
    const labelProgress = Math.max(0, Math.min((progress - 0.7) / 0.3, 1))
    const labelEased = easeOutCubic(labelProgress)

    const leftX = w * 0.17
    const rightX = w * 0.83

    // Horizontal dashed connector
    ctx.globalAlpha = centerEased * 0.3
    ctx.strokeStyle = PRIMARY
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(leftX + 40, midY)
    ctx.lineTo(rightX - 40, midY)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Left: Red decline bars
    const leftBarCount = 4
    const leftBarWidth = 14
    const leftBarGap = 8
    const leftStartX = leftX - ((leftBarCount * leftBarWidth + (leftBarCount - 1) * leftBarGap) / 2)
    const leftBarHeights = [0.65, 0.5, 0.35, 0.2]

    for (let i = 0; i < leftBarCount; i++) {
      const barProgress = Math.max(0, Math.min((leftEased - i * 0.15) / 0.6, 1))
      const bx = leftStartX + i * (leftBarWidth + leftBarGap)
      const fullHeight = leftBarHeights[i] * (bottomY - topY) * 0.5
      const currentHeight = fullHeight * barProgress
      const by = midY - currentHeight / 2

      ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + i * 0.15})`
      ctx.beginPath()
      ctx.moveTo(bx + 3, by)
      ctx.lineTo(bx + leftBarWidth - 3, by)
      ctx.quadraticCurveTo(bx + leftBarWidth, by, bx + leftBarWidth, by + 3)
      ctx.lineTo(bx + leftBarWidth, by + currentHeight - 3)
      ctx.quadraticCurveTo(bx + leftBarWidth, by + currentHeight, bx + leftBarWidth - 3, by + currentHeight)
      ctx.lineTo(bx + 3, by + currentHeight)
      ctx.quadraticCurveTo(bx, by + currentHeight, bx, by + currentHeight - 3)
      ctx.lineTo(bx, by + 3)
      ctx.quadraticCurveTo(bx, by, bx + 3, by)
      ctx.fill()
    }

    // Decline arrow
    if (leftEased > 0.5) {
      const arrowAlpha = Math.min((leftEased - 0.5) / 0.5, 1)
      ctx.globalAlpha = arrowAlpha
      ctx.strokeStyle = '#ef4444'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const arrowStartY = midY - 30
      const arrowEndY = midY + 40 + 15

      ctx.beginPath()
      ctx.moveTo(leftX, arrowStartY)
      ctx.quadraticCurveTo(leftX + 5, midY, leftX, arrowEndY)
      ctx.stroke()

      // Arrowhead
      ctx.beginPath()
      ctx.moveTo(leftX - 5, arrowEndY - 8)
      ctx.lineTo(leftX, arrowEndY)
      ctx.lineTo(leftX + 5, arrowEndY - 8)
      ctx.stroke()

      ctx.globalAlpha = 1
    }

    // Center: Iron Media logo bars
    const barW = 6
    const barSpacing = 11
    const barCenterX = centerX - barSpacing
    const barHeights = [36, 48, 40]

    for (let i = 0; i < 3; i++) {
      const barEased2 = Math.max(0, Math.min((centerEased - i * 0.15) / 0.6, 1))
      const bx = barCenterX + i * barSpacing - barW / 2
      const currentH = barHeights[i] * barEased2
      const by = midY - currentH / 2

      // Glow
      ctx.globalAlpha = 0.2 * barEased2
      ctx.shadowColor = PRIMARY
      ctx.shadowBlur = 8
      ctx.fillStyle = PRIMARY
      ctx.fillRect(bx, by, barW, currentH)
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1

      // Solid bar
      ctx.fillStyle = PRIMARY
      ctx.globalAlpha = barEased2
      ctx.beginPath()
      ctx.moveTo(bx + 3, by)
      ctx.lineTo(bx + barW - 3, by)
      ctx.quadraticCurveTo(bx + barW, by, bx + barW, by + 3)
      ctx.lineTo(bx + barW, by + currentH - 3)
      ctx.quadraticCurveTo(bx + barW, by + currentH, bx + barW - 3, by + currentH)
      ctx.lineTo(bx + 3, by + currentH)
      ctx.quadraticCurveTo(bx, by + currentH, bx, by + currentH - 3)
      ctx.lineTo(bx, by + 3)
      ctx.quadraticCurveTo(bx, by, bx + 3, by)
      ctx.fill()
      ctx.globalAlpha = 1
    }

    // Right: Blue growth bars
    const rightBarCount = 4
    const rightBarWidth = 14
    const rightBarGap = 8
    const rightStartX = rightX - ((rightBarCount * rightBarWidth + (rightBarCount - 1) * rightBarGap) / 2)
    const rightBarHeights = [0.2, 0.35, 0.5, 0.7]

    for (let i = 0; i < rightBarCount; i++) {
      const barProgress = Math.max(0, Math.min((rightEased - i * 0.15) / 0.6, 1))
      const bx = rightStartX + i * (rightBarWidth + rightBarGap)
      const fullHeight = rightBarHeights[i] * (bottomY - topY) * 0.5
      const currentHeight = fullHeight * barProgress
      const by = midY - currentHeight / 2

      const grad = ctx.createLinearGradient(bx, by + currentHeight, bx, by)
      grad.addColorStop(0, DARK)
      grad.addColorStop(1, LIGHT)

      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.moveTo(bx + 3, by)
      ctx.lineTo(bx + rightBarWidth - 3, by)
      ctx.quadraticCurveTo(bx + rightBarWidth, by, bx + rightBarWidth, by + 3)
      ctx.lineTo(bx + rightBarWidth, by + currentHeight - 3)
      ctx.quadraticCurveTo(bx + rightBarWidth, by + currentHeight, bx + rightBarWidth - 3, by + currentHeight)
      ctx.lineTo(bx + 3, by + currentHeight)
      ctx.quadraticCurveTo(bx, by + currentHeight, bx, by + currentHeight - 3)
      ctx.lineTo(bx, by + 3)
      ctx.quadraticCurveTo(bx, by, bx + 3, by)
      ctx.fill()
    }

    // Growth arrow (right side)
    if (rightEased > 0.5) {
      const arrowAlpha = Math.min((rightEased - 0.5) / 0.5, 1)
      ctx.globalAlpha = arrowAlpha
      ctx.strokeStyle = PRIMARY
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const arrowStartY = midY + 40 + 15
      const arrowEndY = midY - 30

      ctx.beginPath()
      ctx.moveTo(rightX, arrowStartY)
      ctx.quadraticCurveTo(rightX - 5, midY, rightX, arrowEndY)
      ctx.stroke()

      // Arrowhead
      ctx.beginPath()
      ctx.moveTo(rightX - 5, arrowEndY + 8)
      ctx.lineTo(rightX, arrowEndY)
      ctx.lineTo(rightX + 5, arrowEndY + 8)
      ctx.stroke()

      ctx.globalAlpha = 1
    }

    // Labels
    ctx.globalAlpha = labelEased

    // Left label
    ctx.fillStyle = MUTED
    ctx.font = `11px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Agenturen', leftX, bottomY + 8)

    ctx.fillStyle = '#ef4444'
    ctx.font = `500 10px ${SANS}`
    ctx.fillText('Millionen verloren', leftX, bottomY + 24)

    // Right label
    ctx.fillStyle = MUTED
    ctx.font = `11px ${SANS}`
    ctx.fillText('Inhouse', rightX, bottomY + 8)

    ctx.fillStyle = LIGHT
    ctx.font = `500 10px ${SANS}`
    ctx.fillText('6-stellig / Quartal', rightX, bottomY + 24)

    // Bottom badge
    const badgeW = 200
    const badgeH = 28
    const badgeX = centerX - badgeW / 2
    const badgeY = h - 36

    ctx.fillStyle = 'rgba(46, 154, 196, 0.06)'
    ctx.strokeStyle = 'rgba(46, 154, 196, 0.2)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(badgeX + 6, badgeY)
    ctx.lineTo(badgeX + badgeW - 6, badgeY)
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + 6)
    ctx.lineTo(badgeX + badgeW, badgeY + badgeH - 6)
    ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - 6, badgeY + badgeH)
    ctx.lineTo(badgeX + 6, badgeY + badgeH)
    ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - 6)
    ctx.lineTo(badgeX, badgeY + 6)
    ctx.quadraticCurveTo(badgeX, badgeY, badgeX + 6, badgeY)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = PRIMARY
    ctx.font = `500 10px ${SANS}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Sechsstellige Quartalsgewinne', centerX, badgeY + badgeH / 2)

    ctx.globalAlpha = 1

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 2501
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual3 — Bar Chart Growth (Shape Labs)
   ───────────────────────────────────────────── */

export function CaseVisual3() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 2000, 1)
    const easedProgress = easeOutCubic(progress)

    clearCanvas(ctx, w, h)

    const padLeft = w * 0.1
    const padRight = w * 0.1
    const padTop = h * 0.14
    const padBottom = h * 0.18
    const chartW = w - padLeft - padRight
    const chartH = h - padTop - padBottom

    const bars = [
      { month: 'Aug', value: 0.15 },
      { month: 'Sep', value: 0.35 },
      { month: 'Okt', value: 0.65 },
      { month: 'Nov', value: 1.0 },
    ]
    const barCount = bars.length
    const barGap = chartW * 0.08
    const barWidth = (chartW - barGap * (barCount + 1)) / barCount

    // Baseline
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padLeft, padTop + chartH)
    ctx.lineTo(w - padRight, padTop + chartH)
    ctx.stroke()

    // Bars
    const barTops: { x: number; y: number }[] = []
    for (let i = 0; i < barCount; i++) {
      const barDelay = i * 0.12
      const barProgress = Math.max(0, Math.min((easedProgress - barDelay) / 0.5, 1))
      const x = padLeft + barGap + i * (barWidth + barGap)
      const fullHeight = bars[i].value * chartH
      const currentHeight = fullHeight * barProgress
      const y = padTop + chartH - currentHeight

      // Bar gradient
      const grad = ctx.createLinearGradient(x, padTop + chartH, x, y)
      grad.addColorStop(0, DARK)
      grad.addColorStop(1, LIGHT)

      ctx.fillStyle = grad
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      const r = 4
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + barWidth - r, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r)
      ctx.lineTo(x + barWidth, padTop + chartH)
      ctx.lineTo(x, padTop + chartH)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.fill()
      ctx.globalAlpha = 1

      barTops.push({ x: x + barWidth / 2, y: padTop + chartH - fullHeight })

      // Month label
      const labelAlpha = Math.min(barProgress * 2, 1)
      ctx.globalAlpha = labelAlpha
      ctx.fillStyle = MUTED
      ctx.font = `10px ${MONO}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(bars[i].month, x + barWidth / 2, padTop + chartH + 8)
      ctx.globalAlpha = 1
    }

    // Growth curve overlay
    if (easedProgress > 0.35) {
      const curveProgress = Math.min((easedProgress - 0.35) / 0.45, 1)

      ctx.strokeStyle = LIGHT
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(barTops[0].x, barTops[0].y)

      const totalSegs = barTops.length - 1
      const drawSegs = Math.floor(curveProgress * totalSegs) + 1

      for (let i = 0; i < Math.min(drawSegs, totalSegs); i++) {
        const cp1x = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp1y = barTops[i].y
        const cp2x = barTops[i + 1].x - (barTops[i + 1].x - barTops[i].x) * 0.4
        const cp2y = barTops[i + 1].y
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, barTops[i + 1].x, barTops[i + 1].y)
      }
      ctx.stroke()

      // Curve data points
      for (let i = 0; i < barTops.length; i++) {
        const dotP = Math.max(0, Math.min((curveProgress - i * 0.15) / 0.3, 1))
        if (dotP > 0) {
          ctx.globalAlpha = dotP
          ctx.fillStyle = '#FFFFFF'
          ctx.strokeStyle = DARK
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(barTops[i].x, barTops[i].y, 4, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    }

    // "€500K" label above last bar
    if (easedProgress > 0.7) {
      const labelP = Math.min((easedProgress - 0.7) / 0.2, 1)
      ctx.globalAlpha = labelP
      ctx.fillStyle = TEXT
      ctx.font = `bold 14px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'
      ctx.fillText('\u20AC500K', barTops[3].x, barTops[3].y - 12)
      ctx.globalAlpha = 1
    }

    // "+40% CM3" badge
    if (easedProgress > 0.75) {
      const badgeP = Math.min((easedProgress - 0.75) / 0.25, 1)
      ctx.globalAlpha = badgeP

      const bx = w - padRight - 90
      const by = padTop - 5
      const bw = 88
      const bh = 28
      const br = 14

      ctx.fillStyle = 'rgba(46, 154, 196, 0.08)'
      ctx.strokeStyle = 'rgba(46, 154, 196, 0.2)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(bx + br, by)
      ctx.lineTo(bx + bw - br, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
      ctx.lineTo(bx + bw, by + bh - br)
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
      ctx.lineTo(bx + br, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
      ctx.lineTo(bx, by + br)
      ctx.quadraticCurveTo(bx, by, bx + br, by)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Checkmark
      ctx.strokeStyle = PRIMARY
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(bx + 12, bh / 2 + by)
      ctx.lineTo(bx + 16, bh / 2 + by + 3)
      ctx.lineTo(bx + 22, bh / 2 + by - 4)
      ctx.stroke()

      ctx.fillStyle = TEXT
      ctx.font = `600 11px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('+40% CM3', bx + bw / 2 + 8, by + bh / 2)

      ctx.globalAlpha = 1
    }

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 2001
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual4 — Globe Visualization (IM8)
   ───────────────────────────────────────────── */

export function CaseVisual4() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 2200, 1)
    const easedProgress = easeOutCubic(progress)

    clearCanvas(ctx, w, h)

    const cx = w / 2
    const cy = h * 0.42
    const radius = Math.min(w, h) * 0.22

    // Subtle decorative ring
    const ringAlpha = Math.min(easedProgress * 2, 1) * 0.15
    ctx.globalAlpha = ringAlpha
    ctx.strokeStyle = PRIMARY
    ctx.lineWidth = 0.5
    ctx.setLineDash([3, 6])
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 1.15, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Globe circle
    const globeAlpha = Math.min(easedProgress * 2.5, 1)
    ctx.globalAlpha = globeAlpha
    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()

    // Latitude lines (3 ellipses)
    const latOffsets = [-0.3, 0, 0.3]
    for (let i = 0; i < latOffsets.length; i++) {
      const offsetY = latOffsets[i] * radius
      const latRadius = Math.sqrt(radius * radius - offsetY * offsetY)
      ctx.strokeStyle = GRID
      ctx.lineWidth = 0.8
      ctx.beginPath()
      ctx.ellipse(cx, cy + offsetY, latRadius, 8, 0, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Meridian (vertical ellipse)
    ctx.strokeStyle = GRID
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(cx, cy, 12, radius, 0, 0, Math.PI * 2)
    ctx.stroke()

    // Second meridian (wider)
    ctx.globalAlpha = globeAlpha * 0.5
    ctx.strokeStyle = GRID
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.ellipse(cx, cy, radius * 0.55, radius, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Connection dots on globe surface
    const dots = [
      { x: cx - 20, y: cy - 30, r: 3 },     // Europe
      { x: cx + 20, y: cy - 25, r: 3 },      // East Europe
      { x: cx, y: cy - 45, r: 3 },            // North
      { x: cx - 35, y: cy + 5, r: 3 },        // SW
      { x: cx + 35, y: cy + 10, r: 3 },       // SE
      { x: cx + 8, y: cy - 8, r: 5 },         // DACH region (larger)
    ]

    const connections = [
      [0, 5], [1, 5], [2, 5], [3, 5], [4, 5], [0, 2], [1, 4],
    ]

    // Draw connections
    if (easedProgress > 0.3) {
      const connProgress = Math.min((easedProgress - 0.3) / 0.4, 1)
      for (let i = 0; i < connections.length; i++) {
        const [from, to] = connections[i]
        const lineP = Math.max(0, Math.min((connProgress - i * 0.06) / 0.4, 1))
        if (lineP > 0) {
          ctx.globalAlpha = lineP * 0.4
          ctx.strokeStyle = PRIMARY
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(dots[from].x, dots[from].y)
          const endX = dots[from].x + (dots[to].x - dots[from].x) * lineP
          const endY = dots[from].y + (dots[to].y - dots[from].y) * lineP
          ctx.lineTo(endX, endY)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
    }

    // Draw dots
    if (easedProgress > 0.4) {
      const dotProgress = Math.min((easedProgress - 0.4) / 0.3, 1)
      for (let i = 0; i < dots.length; i++) {
        const dotP = Math.max(0, Math.min((dotProgress - i * 0.1) / 0.4, 1))
        if (dotP > 0) {
          const dot = dots[i]
          ctx.globalAlpha = dotP

          // Glow on DACH dot
          if (dot.r === 5) {
            ctx.globalAlpha = dotP * 0.2
            ctx.fillStyle = PRIMARY
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, 12, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = dotP
          }

          ctx.fillStyle = PRIMARY
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2)
          ctx.fill()

          if (dot.r === 5) {
            ctx.fillStyle = '#FFFFFF'
            ctx.globalAlpha = dotP * 0.7
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2)
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }
      }
    }

    // Labels
    if (easedProgress > 0.6) {
      const labelP = Math.min((easedProgress - 0.6) / 0.3, 1)
      ctx.globalAlpha = labelP

      // "PREMIUM" badge - top left
      ctx.fillStyle = PRIMARY
      ctx.font = `9px ${MONO}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('PREMIUM', w * 0.08, h * 0.08)

      // "INTERNATIONAL" badge - top right
      ctx.textAlign = 'right'
      ctx.fillText('INTERNATIONAL', w * 0.92, h * 0.08)

      ctx.globalAlpha = 1
    }

    // "IM8" text
    if (easedProgress > 0.7) {
      const textP = Math.min((easedProgress - 0.7) / 0.2, 1)
      ctx.globalAlpha = textP

      ctx.fillStyle = TEXT
      ctx.font = `bold 24px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('IM8', cx, cy + radius + 20)

      // "David Beckham" text
      ctx.fillStyle = MUTED
      ctx.font = `12px ${SANS}`
      ctx.fillText('David Beckham', cx, cy + radius + 48)

      ctx.globalAlpha = 1
    }

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 2201
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual5 — Giant "30x" Typography
   ───────────────────────────────────────────── */

export function CaseVisual5() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 1800, 1)
    const easedProgress = easeOutQuart(progress)

    clearCanvas(ctx, w, h)

    const cx = w / 2
    const cy = h * 0.44

    // Dashed border frame
    const frameAlpha = Math.min(easedProgress * 3, 1)
    ctx.globalAlpha = frameAlpha * 0.4
    ctx.strokeStyle = PRIMARY
    ctx.lineWidth = 1
    ctx.setLineDash([8, 4])
    const frameMargin = Math.min(w, h) * 0.06
    const frameR = 12
    const fx = frameMargin
    const fy = frameMargin
    const fw = w - frameMargin * 2
    const fh = h - frameMargin * 2

    ctx.beginPath()
    ctx.moveTo(fx + frameR, fy)
    ctx.lineTo(fx + fw - frameR, fy)
    ctx.quadraticCurveTo(fx + fw, fy, fx + fw, fy + frameR)
    ctx.lineTo(fx + fw, fy + fh - frameR)
    ctx.quadraticCurveTo(fx + fw, fy + fh, fx + fw - frameR, fy + fh)
    ctx.lineTo(fx + frameR, fy + fh)
    ctx.quadraticCurveTo(fx, fy + fh, fx, fy + fh - frameR)
    ctx.lineTo(fx, fy + frameR)
    ctx.quadraticCurveTo(fx, fy, fx + frameR, fy)
    ctx.closePath()
    ctx.stroke()
    ctx.setLineDash([])
    ctx.globalAlpha = 1

    // Decorative quote mark
    if (easedProgress > 0.1) {
      const quoteP = Math.min((easedProgress - 0.1) / 0.3, 1)
      ctx.globalAlpha = quoteP * 0.12
      ctx.fillStyle = PRIMARY
      ctx.font = `60px Georgia, serif`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.fillText('\u201C', frameMargin + 16, frameMargin + 12)
      ctx.globalAlpha = 1
    }

    // "30x" glow (behind)
    if (easedProgress > 0.2) {
      const glowP = Math.min((easedProgress - 0.2) / 0.4, 1)
      ctx.globalAlpha = glowP * 0.15
      ctx.fillStyle = PRIMARY
      ctx.shadowColor = PRIMARY
      ctx.shadowBlur = 30
      const fontSize = Math.min(w * 0.28, 120)
      ctx.font = `800 ${fontSize}px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('30x', cx, cy)
      ctx.shadowBlur = 0
      ctx.globalAlpha = 1
    }

    // "30x" main text
    if (easedProgress > 0.3) {
      const textP = Math.min((easedProgress - 0.3) / 0.4, 1)
      ctx.globalAlpha = textP
      ctx.fillStyle = TEXT
      const fontSize = Math.min(w * 0.28, 120)
      ctx.font = `800 ${fontSize}px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('30x', cx, cy)
      ctx.globalAlpha = 1
    }

    // 5 Trustpilot stars
    const starSize = 9
    const starGap = 22
    const starsY = cy + Math.min(w * 0.14, 60) + 15
    const starsStartX = cx - (4 * starGap) / 2

    for (let i = 0; i < 5; i++) {
      const starP = Math.max(0, Math.min((easedProgress - 0.55 - i * 0.04) / 0.2, 1))
      if (starP > 0) {
        ctx.globalAlpha = starP
        const sx = starsStartX + i * starGap
        const sy = starsY
        drawStar(ctx, sx, sy, starSize, starSize * 0.45, GREEN)
        ctx.globalAlpha = 1
      }
    }

    // "Trustpilot" label
    if (easedProgress > 0.8) {
      const tpP = Math.min((easedProgress - 0.8) / 0.2, 1)
      ctx.globalAlpha = tpP
      ctx.fillStyle = MUTED
      ctx.font = `10px ${SANS}`
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('Trustpilot', starsStartX + 4 * starGap + 16, starsY)
      ctx.globalAlpha = 1
    }

    // Subtle horizontal decorative line
    if (easedProgress > 0.6) {
      const lineP = Math.min((easedProgress - 0.6) / 0.3, 1)
      ctx.globalAlpha = lineP * 0.15
      ctx.strokeStyle = PRIMARY
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(frameMargin + 20, starsY + 30)
      ctx.lineTo(w - frameMargin - 20, starsY + 30)
      ctx.stroke()
      ctx.globalAlpha = 1
    }

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 1801
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/** Draw a 5-pointed star */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  fillColor: string
) {
  ctx.fillStyle = fillColor
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
}

/* ─────────────────────────────────────────────
   CaseVisual6 — Timeline ($50K -> $500K)
   ───────────────────────────────────────────── */

export function CaseVisual6() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  const draw = useCallback((now: number) => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setup = setupCanvas(canvas, container)
    if (!setup) return
    const { ctx, w, h } = setup

    const elapsed = now - startTimeRef.current
    const progress = Math.min(elapsed / 2200, 1)
    const easedProgress = easeOutCubic(progress)

    clearCanvas(ctx, w, h)

    const padLeft = w * 0.08
    const padRight = w * 0.08
    const padTop = h * 0.18
    const padBottom = h * 0.22
    const chartW = w - padLeft - padRight
    const chartH = h - padTop - padBottom

    const timelineY = padTop + chartH + 10
    const totalDots = 14
    const dotSpacing = chartW / (totalDots - 1)

    // Timeline base line
    const lineAlpha = Math.min(easedProgress * 3, 1)
    ctx.globalAlpha = lineAlpha
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padLeft, timelineY)
    ctx.lineTo(padLeft + chartW, timelineY)
    ctx.stroke()
    ctx.globalAlpha = 1

    // Timeline dots
    const dots: { cx: number; cy: number }[] = []
    for (let i = 0; i < totalDots; i++) {
      const dotX = padLeft + i * dotSpacing
      dots.push({ cx: dotX, cy: timelineY })

      const dotP = Math.max(0, Math.min((easedProgress - i * 0.03) / 0.3, 1))
      if (dotP > 0) {
        const isEndpoint = i === 0 || i === totalDots - 1
        ctx.globalAlpha = dotP

        if (isEndpoint) {
          // Glow
          ctx.globalAlpha = dotP * 0.15
          ctx.fillStyle = PRIMARY
          ctx.beginPath()
          ctx.arc(dotX, timelineY, 10, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = dotP

          ctx.fillStyle = PRIMARY
          ctx.beginPath()
          ctx.arc(dotX, timelineY, 5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = '#FFFFFF'
          ctx.globalAlpha = dotP * 0.6
          ctx.beginPath()
          ctx.arc(dotX, timelineY, 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = '#CBD5E1'
          ctx.beginPath()
          ctx.arc(dotX, timelineY, 2.5, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
    }

    // "$50K" label
    if (easedProgress > 0.25) {
      const lp = Math.min((easedProgress - 0.25) / 0.2, 1)
      ctx.globalAlpha = lp
      ctx.fillStyle = TEXT
      ctx.font = `600 11px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('$50K', dots[0].cx, timelineY + 14)
      ctx.globalAlpha = 1
    }

    // "$500K" label
    if (easedProgress > 0.25) {
      const lp = Math.min((easedProgress - 0.25) / 0.2, 1)
      ctx.globalAlpha = lp
      ctx.fillStyle = TEXT
      ctx.font = `600 11px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('$500K', dots[totalDots - 1].cx, timelineY + 14)
      ctx.globalAlpha = 1
    }

    // Month labels
    const monthLabels = [
      { index: 3, label: 'Mo 4' },
      { index: 7, label: 'Mo 8' },
      { index: 11, label: 'Mo 12' },
    ]
    for (const ml of monthLabels) {
      if (easedProgress > 0.35) {
        const mlp = Math.min((easedProgress - 0.35) / 0.2, 1)
        ctx.globalAlpha = mlp * 0.5
        ctx.fillStyle = MUTED
        ctx.font = `9px ${MONO}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(ml.label, dots[ml.index].cx, timelineY + 14)
        ctx.globalAlpha = 1
      }
    }

    // Growth curve
    if (easedProgress > 0.15) {
      const curveProgress = Math.min((easedProgress - 0.15) / 0.6, 1)

      // Curve control points
      const curveStartY = padTop + chartH * 0.85
      const curveEndY = padTop + chartH * 0.05

      // Build curve points
      const curvePoints: { x: number; y: number }[] = []
      const numPoints = 50
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = padLeft + t * chartW
        // Exponential curve shape
        const expo = Math.pow(t, 2.2)
        const y = curveStartY + (curveEndY - curveStartY) * expo
        curvePoints.push({ x, y })
      }

      // Draw to the partial progress point
      const drawCount = Math.floor(curveProgress * numPoints) + 1

      // Area fill
      ctx.globalAlpha = 0.06 * curveProgress
      ctx.fillStyle = PRIMARY
      ctx.beginPath()
      ctx.moveTo(curvePoints[0].x, timelineY)
      ctx.lineTo(curvePoints[0].x, curvePoints[0].y)
      for (let i = 1; i < drawCount && i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y)
      }
      if (drawCount > 0 && drawCount <= curvePoints.length) {
        ctx.lineTo(curvePoints[Math.min(drawCount - 1, curvePoints.length - 1)].x, timelineY)
      }
      ctx.closePath()
      ctx.fill()
      ctx.globalAlpha = 1

      // Curve line
      ctx.strokeStyle = PRIMARY
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(curvePoints[0].x, curvePoints[0].y)
      for (let i = 1; i < drawCount && i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x, curvePoints[i].y)
      }
      ctx.stroke()
    }

    // "10x in 14 Monaten" badge
    if (easedProgress > 0.75) {
      const badgeP = Math.min((easedProgress - 0.75) / 0.25, 1)
      ctx.globalAlpha = badgeP

      const bw = 130
      const bh = 30
      const bx = w - padRight - bw
      const by = padTop - 15
      const br = 8

      ctx.fillStyle = 'rgba(46, 154, 196, 0.08)'
      ctx.strokeStyle = 'rgba(46, 154, 196, 0.25)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(bx + br, by)
      ctx.lineTo(bx + bw - br, by)
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br)
      ctx.lineTo(bx + bw, by + bh - br)
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh)
      ctx.lineTo(bx + br, by + bh)
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br)
      ctx.lineTo(bx, by + br)
      ctx.quadraticCurveTo(bx, by, bx + br, by)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      ctx.fillStyle = TEXT
      ctx.font = `600 11px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('10x in 14 Monaten', bx + bw / 2, by + bh / 2)

      ctx.globalAlpha = 1
    }

    if (progress < 1) {
      animFrameRef.current = requestAnimationFrame(draw)
    }
  }, [])

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true
    startTimeRef.current = performance.now()
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isInView, draw])

  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated.current) {
        startTimeRef.current = performance.now() - 2201
        draw(performance.now())
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
