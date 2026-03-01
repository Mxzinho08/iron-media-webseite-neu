'use client'

import { useRef, useEffect } from 'react'
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
const RED = '#ef4444'

const SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
const MONO = '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace'

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4)
}

/* ─────────────────────────────────────────────
   CaseVisual1 — Cocunat Turnaround Chart
   ───────────────────────────────────────────── */

export function CaseVisual1() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setupCanvas = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    setupCanvas()

    startTimeRef.current = performance.now()
    const draw = (now: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = container.getBoundingClientRect().width
      const h = container.getBoundingClientRect().height
      const progress = Math.min((now - startTimeRef.current) / 2500, 1)
      const eased = easeOutQuart(progress)

      ctx.clearRect(0, 0, w, h)

      const padTop = h * 0.14
      const padBottom = h * 0.22
      const padLeft = w * 0.06
      const padRight = w * 0.06
      const chartW = w - padLeft - padRight
      const chartH = h - padTop - padBottom
      const chartBottom = padTop + chartH

      // Title
      ctx.globalAlpha = Math.min(eased * 3, 1)
      ctx.fillStyle = TEXT
      ctx.font = `bold 14px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('Cocunat Beauty', w / 2, padTop * 0.25)
      ctx.globalAlpha = 1

      // Baseline
      ctx.strokeStyle = GRID
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padLeft, chartBottom)
      ctx.lineTo(w - padRight, chartBottom)
      ctx.stroke()

      // --- LEFT SECTION: Declining red bars ("Andere Agenturen") ---
      const leftSectionW = chartW * 0.3
      const leftBarCount = 4
      const leftBarGap = leftSectionW * 0.06
      const leftBarW = (leftSectionW - leftBarGap * (leftBarCount + 1)) / leftBarCount
      const leftBarHeights = [0.7, 0.55, 0.35, 0.15]

      // Phase 1: left bars draw in first 40% of animation
      const leftPhase = Math.min(eased / 0.4, 1)

      for (let i = 0; i < leftBarCount; i++) {
        const barDelay = i * 0.15
        const barProgress = Math.max(0, Math.min((leftPhase - barDelay) / 0.6, 1))
        const x = padLeft + leftBarGap + i * (leftBarW + leftBarGap)
        const fullH = leftBarHeights[i] * chartH
        const currentH = fullH * barProgress
        const y = chartBottom - currentH

        // Red gradient bar
        const grad = ctx.createLinearGradient(x, chartBottom, x, y)
        grad.addColorStop(0, '#fca5a5')
        grad.addColorStop(1, RED)
        ctx.fillStyle = grad
        ctx.beginPath()
        const r = 3
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + leftBarW - r, y)
        ctx.quadraticCurveTo(x + leftBarW, y, x + leftBarW, y + r)
        ctx.lineTo(x + leftBarW, chartBottom)
        ctx.lineTo(x, chartBottom)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()

        // Red X mark above bar
        if (barProgress > 0.7) {
          const xMarkAlpha = Math.min((barProgress - 0.7) / 0.3, 1)
          ctx.globalAlpha = xMarkAlpha
          ctx.strokeStyle = RED
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          const cx = x + leftBarW / 2
          const cy = y - 10
          const s = 4
          ctx.beginPath()
          ctx.moveTo(cx - s, cy - s)
          ctx.lineTo(cx + s, cy + s)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(cx + s, cy - s)
          ctx.lineTo(cx - s, cy + s)
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }

      // Left label
      if (leftPhase > 0.5) {
        const labelAlpha = Math.min((leftPhase - 0.5) / 0.5, 1)
        ctx.globalAlpha = labelAlpha
        ctx.fillStyle = RED
        ctx.font = `9px ${MONO}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('Andere Agenturen', padLeft + leftSectionW / 2, chartBottom + 12)
        ctx.globalAlpha = 1
      }

      // --- CENTER SECTION: Iron Media turning point (3 branded bars) ---
      const centerX = padLeft + chartW * 0.35
      const centerW = chartW * 0.18
      const centerBarCount = 3
      const centerBarGap = centerW * 0.08
      const centerBarW = (centerW - centerBarGap * (centerBarCount + 1)) / centerBarCount
      const centerBarHeights = [0.45, 0.55, 0.65]
      const centerColors = [PRIMARY, DARK, '#157A8C']

      // Phase 2: center bars draw at 30-70%
      const centerPhase = Math.max(0, Math.min((eased - 0.3) / 0.3, 1))

      for (let i = 0; i < centerBarCount; i++) {
        const barDelay = i * 0.2
        const barProgress = Math.max(0, Math.min((centerPhase - barDelay) / 0.6, 1))
        const x = centerX + centerBarGap + i * (centerBarW + centerBarGap)
        const fullH = centerBarHeights[i] * chartH
        const currentH = fullH * barProgress
        const y = chartBottom - currentH

        // Glow effect
        if (barProgress > 0.3) {
          const glowAlpha = Math.min((barProgress - 0.3) / 0.7, 1) * 0.15
          ctx.globalAlpha = glowAlpha
          ctx.fillStyle = centerColors[i]
          ctx.beginPath()
          ctx.arc(x + centerBarW / 2, y, centerBarW * 0.8, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1
        }

        // Bar
        const grad = ctx.createLinearGradient(x, chartBottom, x, y)
        grad.addColorStop(0, LIGHT)
        grad.addColorStop(1, centerColors[i])
        ctx.fillStyle = grad
        ctx.beginPath()
        const r = 3
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + centerBarW - r, y)
        ctx.quadraticCurveTo(x + centerBarW, y, x + centerBarW, y + r)
        ctx.lineTo(x + centerBarW, chartBottom)
        ctx.lineTo(x, chartBottom)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()
      }

      // --- Transition arrow from left to right ---
      if (centerPhase > 0.5) {
        const arrowAlpha = Math.min((centerPhase - 0.5) / 0.5, 1)
        ctx.globalAlpha = arrowAlpha * 0.6
        ctx.strokeStyle = PRIMARY
        ctx.lineWidth = 2
        ctx.setLineDash([4, 3])
        const arrowY = padTop + chartH * 0.15
        const arrowStartX = padLeft + leftSectionW * 0.3
        const arrowEndX = w - padRight - chartW * 0.3 * 0.3
        const arrowDrawEnd = arrowStartX + (arrowEndX - arrowStartX) * arrowAlpha
        ctx.beginPath()
        ctx.moveTo(arrowStartX, arrowY)
        ctx.lineTo(arrowDrawEnd, arrowY)
        ctx.stroke()
        ctx.setLineDash([])
        // Arrowhead
        if (arrowAlpha > 0.8) {
          ctx.fillStyle = PRIMARY
          ctx.beginPath()
          ctx.moveTo(arrowDrawEnd, arrowY)
          ctx.lineTo(arrowDrawEnd - 8, arrowY - 4)
          ctx.lineTo(arrowDrawEnd - 8, arrowY + 4)
          ctx.closePath()
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // --- RIGHT SECTION: Ascending blue/green bars ("Iron Media") ---
      const rightSectionStart = padLeft + chartW * 0.58
      const rightSectionW = chartW * 0.38
      const rightBarCount = 4
      const rightBarGap = rightSectionW * 0.06
      const rightBarW = (rightSectionW - rightBarGap * (rightBarCount + 1)) / rightBarCount
      const rightBarHeights = [0.35, 0.55, 0.75, 0.95]

      // Phase 3: right bars draw at 50-100%
      const rightPhase = Math.max(0, Math.min((eased - 0.5) / 0.4, 1))

      for (let i = 0; i < rightBarCount; i++) {
        const barDelay = i * 0.15
        const barProgress = Math.max(0, Math.min((rightPhase - barDelay) / 0.6, 1))
        const x = rightSectionStart + rightBarGap + i * (rightBarW + rightBarGap)
        const fullH = rightBarHeights[i] * chartH
        const currentH = fullH * barProgress
        const y = chartBottom - currentH

        // Green-blue gradient bar
        const grad = ctx.createLinearGradient(x, chartBottom, x, y)
        grad.addColorStop(0, LIGHT)
        grad.addColorStop(0.5, PRIMARY)
        grad.addColorStop(1, '#10B981')
        ctx.fillStyle = grad
        ctx.beginPath()
        const r = 3
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + rightBarW - r, y)
        ctx.quadraticCurveTo(x + rightBarW, y, x + rightBarW, y + r)
        ctx.lineTo(x + rightBarW, chartBottom)
        ctx.lineTo(x, chartBottom)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()
      }

      // Right label
      if (rightPhase > 0.3) {
        const labelAlpha = Math.min((rightPhase - 0.3) / 0.5, 1)
        ctx.globalAlpha = labelAlpha
        ctx.fillStyle = PRIMARY
        ctx.font = `bold 9px ${MONO}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('Iron Media', rightSectionStart + rightSectionW / 2, chartBottom + 12)
        ctx.globalAlpha = 1
      }

      // --- Bottom badge: "Sechsstellige Quartalsgewinne" ---
      if (eased > 0.8) {
        const badgeAlpha = Math.min((eased - 0.8) / 0.2, 1)
        ctx.globalAlpha = badgeAlpha

        const badgeText = 'Sechsstellige Quartalsgewinne'
        ctx.font = `bold 11px ${SANS}`
        const textMetrics = ctx.measureText(badgeText)
        const badgeW = textMetrics.width + 28
        const badgeH = 28
        const badgeX = w / 2 - badgeW / 2
        const badgeY = chartBottom + 32

        // Badge background
        ctx.fillStyle = '#F0F9FF'
        ctx.strokeStyle = PRIMARY
        ctx.lineWidth = 1
        ctx.beginPath()
        const br = 14
        ctx.moveTo(badgeX + br, badgeY)
        ctx.lineTo(badgeX + badgeW - br, badgeY)
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br)
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH)
        ctx.lineTo(badgeX + br, badgeY + badgeH)
        ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br)
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + br, badgeY)
        ctx.fill()
        ctx.stroke()

        // Badge text
        ctx.fillStyle = PRIMARY
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(badgeText, w / 2, badgeY + badgeH / 2)
        ctx.globalAlpha = 1
      }

      if (progress < 1) animFrameRef.current = requestAnimationFrame(draw)
    }
    animFrameRef.current = requestAnimationFrame(draw)

    window.addEventListener('resize', setupCanvas)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', setupCanvas)
    }
  }, [isInView])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual2 — Shape Labs Rocket Growth
   ───────────────────────────────────────────── */

export function CaseVisual2() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setupCanvas = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    setupCanvas()

    startTimeRef.current = performance.now()
    const draw = (now: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = container.getBoundingClientRect().width
      const h = container.getBoundingClientRect().height
      const progress = Math.min((now - startTimeRef.current) / 2500, 1)
      const eased = easeOutQuart(progress)

      ctx.clearRect(0, 0, w, h)

      const padTop = h * 0.16
      const padBottom = h * 0.18
      const padLeft = w * 0.1
      const padRight = w * 0.1
      const chartW = w - padLeft - padRight
      const chartH = h - padTop - padBottom
      const chartBottom = padTop + chartH

      // Title
      ctx.globalAlpha = Math.min(eased * 3, 1)
      ctx.fillStyle = TEXT
      ctx.font = `bold 14px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('Shape Labs', w / 2, padTop * 0.25)
      ctx.globalAlpha = 1

      // Grid lines
      ctx.strokeStyle = GRID
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      const gridLevels = [0, 0.25, 0.5, 0.75, 1.0]
      const gridLabels = ['€500K', '€375K', '€250K', '€125K', '€0']
      ctx.font = `9px ${MONO}`
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < gridLevels.length; i++) {
        const y = padTop + gridLevels[i] * chartH
        ctx.globalAlpha = Math.min(eased * 2, 1) * 0.6
        ctx.beginPath()
        ctx.moveTo(padLeft, y)
        ctx.lineTo(w - padRight, y)
        ctx.stroke()
        ctx.fillStyle = MUTED
        ctx.fillText(gridLabels[i], padLeft - 8, y)
      }
      ctx.setLineDash([])
      ctx.globalAlpha = 1

      // Baseline
      ctx.strokeStyle = GRID
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(padLeft, chartBottom)
      ctx.lineTo(w - padRight, chartBottom)
      ctx.stroke()

      // Bar data
      const months = ['Aug', 'Sep', 'Okt', 'Nov']
      const values = [0.1, 0.3, 0.6, 1.0] // Proportional to 50K, 150K, 300K, 500K
      const euroLabels = ['€50K', '€150K', '€300K', '€500K']
      const barCount = 4
      const barGap = chartW * 0.08
      const barW = (chartW - barGap * (barCount + 1)) / barCount

      // Phase 1: bars grow sequentially (0 -> 70%)
      const barPhase = Math.min(eased / 0.7, 1)

      const barTops: { x: number; y: number }[] = []

      for (let i = 0; i < barCount; i++) {
        const barDelay = i * 0.18
        const barProgress = Math.max(0, Math.min((barPhase - barDelay) / 0.5, 1))
        const x = padLeft + barGap + i * (barW + barGap)
        const fullH = values[i] * chartH
        const currentH = fullH * barProgress
        const y = chartBottom - currentH

        // Bar gradient
        const grad = ctx.createLinearGradient(x, chartBottom, x, chartBottom - fullH)
        grad.addColorStop(0, '#157A8C')
        grad.addColorStop(1, LIGHT)
        ctx.fillStyle = grad
        ctx.beginPath()
        const r = 4
        ctx.moveTo(x + r, y)
        ctx.lineTo(x + barW - r, y)
        ctx.quadraticCurveTo(x + barW, y, x + barW, y + r)
        ctx.lineTo(x + barW, chartBottom)
        ctx.lineTo(x, chartBottom)
        ctx.lineTo(x, y + r)
        ctx.quadraticCurveTo(x, y, x + r, y)
        ctx.fill()

        barTops.push({ x: x + barW / 2, y: chartBottom - fullH })

        // Month label
        ctx.globalAlpha = Math.min(barProgress * 2, 1)
        ctx.fillStyle = MUTED
        ctx.font = `10px ${MONO}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(months[i], x + barW / 2, chartBottom + 8)

        // Snowflake for August (off-season indicator)
        if (i === 0 && barProgress > 0.5) {
          ctx.globalAlpha = Math.min((barProgress - 0.5) / 0.5, 1) * 0.7
          ctx.fillStyle = LIGHT
          ctx.font = `13px ${SANS}`
          ctx.textAlign = 'center'
          ctx.fillText('\u2744', x + barW / 2, chartBottom + 22)
        }

        ctx.globalAlpha = 1
      }

      // Euro label above tallest bar
      if (barPhase > 0.7) {
        const labelAlpha = Math.min((barPhase - 0.7) / 0.3, 1)
        ctx.globalAlpha = labelAlpha
        ctx.fillStyle = TEXT
        ctx.font = `bold 13px ${SANS}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        const lastBar = barTops[barTops.length - 1]
        ctx.fillText('€500K', lastBar.x, lastBar.y - 8)
        ctx.globalAlpha = 1
      }

      // Phase 2: growth curve draws after bars (60% -> 100%)
      const curvePhase = Math.max(0, Math.min((eased - 0.55) / 0.35, 1))

      if (curvePhase > 0) {
        // Smooth bezier curve through bar tops
        ctx.strokeStyle = DARK
        ctx.lineWidth = 2.5
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(barTops[0].x, barTops[0].y)

        const totalSegs = barTops.length - 1
        const drawSegs = Math.floor(curvePhase * totalSegs) + 1

        for (let i = 0; i < Math.min(drawSegs, totalSegs); i++) {
          const segProgress = i < drawSegs - 1 ? 1 : (curvePhase * totalSegs) % 1
          const cp1x = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * 0.4
          const cp1y = barTops[i].y
          const cp2x = barTops[i + 1].x - (barTops[i + 1].x - barTops[i].x) * 0.4
          const cp2y = barTops[i + 1].y

          if (segProgress >= 1) {
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, barTops[i + 1].x, barTops[i + 1].y)
          } else {
            const endX = barTops[i].x + (barTops[i + 1].x - barTops[i].x) * segProgress
            const endY = barTops[i].y + (barTops[i + 1].y - barTops[i].y) * segProgress
            const pcp1x = barTops[i].x + (cp1x - barTops[i].x) * segProgress
            const pcp1y = barTops[i].y + (cp1y - barTops[i].y) * segProgress
            ctx.quadraticCurveTo(pcp1x, pcp1y, endX, endY)
          }
        }
        ctx.stroke()

        // White dots at data points
        for (let i = 0; i < barTops.length; i++) {
          const dotProgress = Math.max(0, Math.min((curvePhase - i * 0.15) / 0.3, 1))
          if (dotProgress > 0) {
            ctx.globalAlpha = dotProgress
            // Outer dot
            ctx.fillStyle = DARK
            ctx.beginPath()
            ctx.arc(barTops[i].x, barTops[i].y, 5, 0, Math.PI * 2)
            ctx.fill()
            // Inner white dot
            ctx.fillStyle = '#FFFFFF'
            ctx.beginPath()
            ctx.arc(barTops[i].x, barTops[i].y, 2.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.globalAlpha = 1
          }
        }
      }

      // +40% CM3 badge (top-right)
      if (eased > 0.75) {
        const badgeAlpha = Math.min((eased - 0.75) / 0.25, 1)
        ctx.globalAlpha = badgeAlpha

        const badgeText = '+40% CM3'
        ctx.font = `bold 11px ${SANS}`
        const tm = ctx.measureText(badgeText)
        const badgeW = tm.width + 32
        const badgeH = 26
        const badgeX = w - padRight - badgeW
        const badgeY = padTop - 4

        // Badge bg
        ctx.fillStyle = '#ECFDF5'
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 1
        ctx.beginPath()
        const br = 13
        ctx.moveTo(badgeX + br, badgeY)
        ctx.lineTo(badgeX + badgeW - br, badgeY)
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + br)
        ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - br, badgeY + badgeH)
        ctx.lineTo(badgeX + br, badgeY + badgeH)
        ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - br)
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + br, badgeY)
        ctx.fill()
        ctx.stroke()

        // Checkmark
        ctx.strokeStyle = '#10B981'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        const checkX = badgeX + 12
        const checkY = badgeY + badgeH / 2
        ctx.beginPath()
        ctx.moveTo(checkX - 3, checkY)
        ctx.lineTo(checkX, checkY + 3)
        ctx.lineTo(checkX + 5, checkY - 3)
        ctx.stroke()

        // Badge text
        ctx.fillStyle = '#059669'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.font = `bold 10px ${SANS}`
        ctx.fillText(badgeText, checkX + 10, badgeY + badgeH / 2)

        ctx.globalAlpha = 1
      }

      if (progress < 1) animFrameRef.current = requestAnimationFrame(draw)
    }
    animFrameRef.current = requestAnimationFrame(draw)

    window.addEventListener('resize', setupCanvas)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', setupCanvas)
    }
  }, [isInView])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   CaseVisual3 — IM8 Global Reach Globe
   ───────────────────────────────────────────── */

export function CaseVisual3() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isInView = useInView(containerRef, { once: true, amount: 0.3 })
  const hasAnimated = useRef(false)
  const startTimeRef = useRef(0)
  const animFrameRef = useRef(0)

  useEffect(() => {
    if (!isInView || hasAnimated.current) return
    hasAnimated.current = true

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const setupCanvas = () => {
      const dpr = Math.min(devicePixelRatio, 2)
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    setupCanvas()

    startTimeRef.current = performance.now()
    const draw = (now: number) => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const w = container.getBoundingClientRect().width
      const h = container.getBoundingClientRect().height
      const progress = Math.min((now - startTimeRef.current) / 2500, 1)
      const eased = easeOutQuart(progress)

      ctx.clearRect(0, 0, w, h)

      // Title
      ctx.globalAlpha = Math.min(eased * 3, 1)
      ctx.fillStyle = TEXT
      ctx.font = `bold 14px ${SANS}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText('IM8 by David Beckham', w / 2, h * 0.04)
      ctx.globalAlpha = 1

      const cx = w / 2
      const cy = h * 0.42
      const radius = Math.min(w, h) * 0.24

      // Phase 1: Globe appears (0 -> 40%)
      const globePhase = Math.min(eased / 0.4, 1)

      // Dashed decorative outer ring
      if (globePhase > 0.3) {
        const ringAlpha = Math.min((globePhase - 0.3) / 0.7, 1) * 0.2
        ctx.globalAlpha = ringAlpha
        ctx.strokeStyle = MUTED
        ctx.lineWidth = 1
        ctx.setLineDash([3, 6])
        ctx.beginPath()
        ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // Globe outline
      if (globePhase > 0) {
        ctx.globalAlpha = globePhase
        ctx.strokeStyle = GRID
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Subtle fill
        const globeGrad = ctx.createRadialGradient(cx - radius * 0.2, cy - radius * 0.2, 0, cx, cy, radius)
        globeGrad.addColorStop(0, 'rgba(46,154,196,0.04)')
        globeGrad.addColorStop(1, 'rgba(46,154,196,0.01)')
        ctx.fillStyle = globeGrad
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.fill()

        // Latitude ellipses (3)
        ctx.strokeStyle = GRID
        ctx.lineWidth = 1
        const latOffsets = [-0.35, 0, 0.35]
        for (let i = 0; i < latOffsets.length; i++) {
          const latY = cy + latOffsets[i] * radius
          const latRadius = Math.sqrt(Math.max(0, radius * radius - Math.pow(latOffsets[i] * radius, 2)))
          ctx.globalAlpha = globePhase * 0.5
          ctx.beginPath()
          ctx.ellipse(cx, latY, latRadius, latRadius * 0.15, 0, 0, Math.PI * 2)
          ctx.stroke()
        }

        // Meridian ellipses (2)
        const meridianTilts = [-0.4, 0.4]
        for (let i = 0; i < meridianTilts.length; i++) {
          ctx.globalAlpha = globePhase * 0.5
          ctx.beginPath()
          ctx.ellipse(cx, cy, radius * Math.abs(meridianTilts[i]), radius, 0, 0, Math.PI * 2)
          ctx.stroke()
        }

        ctx.globalAlpha = 1
      }

      // Phase 2: Dots and connections fade in (35% -> 75%)
      const dotPhase = Math.max(0, Math.min((eased - 0.35) / 0.35, 1))

      // Connection dots on globe surface
      const dots = [
        { angle: -0.5, lat: 0.3, size: 4, label: '' },           // Europe
        { angle: 0.8, lat: -0.1, size: 3.5, label: '' },         // Americas
        { angle: -1.5, lat: -0.3, size: 3, label: '' },          // Asia
        { angle: 2.0, lat: 0.4, size: 3, label: '' },            // South America
        { angle: -2.5, lat: 0.1, size: 3, label: '' },           // Middle East
        { angle: 0.3, lat: -0.45, size: 3.5, label: '' },        // Oceania
      ]

      // DACH region special dot (index 0 is Europe)
      const dachDotIdx = 0

      const dotPositions: { x: number; y: number }[] = []

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]
        const dotDelay = i * 0.1
        const dotProgress = Math.max(0, Math.min((dotPhase - dotDelay) / 0.4, 1))
        if (dotProgress <= 0) {
          dotPositions.push({ x: cx, y: cy })
          continue
        }

        const x = cx + Math.cos(dot.angle) * radius * 0.7
        const y = cy + dot.lat * radius
        dotPositions.push({ x, y })

        ctx.globalAlpha = dotProgress

        // DACH dot gets a glow
        if (i === dachDotIdx) {
          const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, dot.size * 4)
          glowGrad.addColorStop(0, 'rgba(46,154,196,0.3)')
          glowGrad.addColorStop(1, 'rgba(46,154,196,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(x, y, dot.size * 4, 0, Math.PI * 2)
          ctx.fill()

          // Larger dot for DACH
          ctx.fillStyle = PRIMARY
          ctx.beginPath()
          ctx.arc(x, y, dot.size * 1.6, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(x, y, dot.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillStyle = LIGHT
          ctx.beginPath()
          ctx.arc(x, y, dot.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.globalAlpha = 1
      }

      // Connection lines between dots (hub-spoke from DACH)
      if (dotPhase > 0.3) {
        const lineAlpha = Math.min((dotPhase - 0.3) / 0.5, 1) * 0.3
        ctx.globalAlpha = lineAlpha
        ctx.strokeStyle = PRIMARY
        ctx.lineWidth = 1
        ctx.setLineDash([2, 3])
        for (let i = 1; i < dotPositions.length; i++) {
          if (dotPositions[i].x === cx && dotPositions[i].y === cy) continue
          ctx.beginPath()
          ctx.moveTo(dotPositions[0].x, dotPositions[0].y)
          ctx.lineTo(dotPositions[i].x, dotPositions[i].y)
          ctx.stroke()
        }
        ctx.setLineDash([])
        ctx.globalAlpha = 1
      }

      // Phase 3: Labels fade in (60% -> 100%)
      const labelPhase = Math.max(0, Math.min((eased - 0.6) / 0.35, 1))

      // "PREMIUM" label top-left
      if (labelPhase > 0) {
        ctx.globalAlpha = labelPhase
        ctx.fillStyle = MUTED
        ctx.font = `bold 9px ${MONO}`
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.letterSpacing = '0.15em'
        ctx.fillText('PREMIUM', w * 0.08, h * 0.12)

        // Small decorative line below
        ctx.strokeStyle = MUTED
        ctx.lineWidth = 1
        ctx.globalAlpha = labelPhase * 0.4
        ctx.beginPath()
        ctx.moveTo(w * 0.08, h * 0.12 + 14)
        ctx.lineTo(w * 0.08 + 40, h * 0.12 + 14)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // "INTERNATIONAL" label top-right
      if (labelPhase > 0.15) {
        const intlAlpha = Math.min((labelPhase - 0.15) / 0.85, 1)
        ctx.globalAlpha = intlAlpha
        ctx.fillStyle = MUTED
        ctx.font = `bold 9px ${MONO}`
        ctx.textAlign = 'right'
        ctx.textBaseline = 'top'
        ctx.fillText('INTERNATIONAL', w * 0.92, h * 0.12)

        // Small decorative line below
        ctx.strokeStyle = MUTED
        ctx.lineWidth = 1
        ctx.globalAlpha = intlAlpha * 0.4
        ctx.beginPath()
        ctx.moveTo(w * 0.92, h * 0.12 + 14)
        ctx.lineTo(w * 0.92 - 40, h * 0.12 + 14)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      // "IM8" large text below globe
      if (labelPhase > 0.3) {
        const im8Alpha = Math.min((labelPhase - 0.3) / 0.5, 1)
        ctx.globalAlpha = im8Alpha

        ctx.fillStyle = TEXT
        ctx.font = `bold ${Math.round(Math.min(w, h) * 0.09)}px ${SANS}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText('IM8', cx, cy + radius + radius * 0.25)

        // "David Beckham" smaller text
        ctx.fillStyle = MUTED
        ctx.font = `12px ${SANS}`
        ctx.fillText('David Beckham', cx, cy + radius + radius * 0.25 + Math.min(w, h) * 0.09 + 4)

        ctx.globalAlpha = 1
      }

      if (progress < 1) animFrameRef.current = requestAnimationFrame(draw)
    }
    animFrameRef.current = requestAnimationFrame(draw)

    window.addEventListener('resize', setupCanvas)
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', setupCanvas)
    }
  }, [isInView])

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
