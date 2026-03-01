'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS, TRUSTED_LOGOS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v7
   Scaling Dashboard: Canvas chart + floating
   notification bubbles + glassmorphism card
   ============================================ */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

const NOTIFICATION_BUBBLES = [
  { text: '+142 Sales', subtext: 'Today', color: '#5CBB5C' },
  { text: '+€12,847', subtext: 'Revenue today', color: '#2E9AC4' },
  { text: '↑ 34%', subtext: 'vs. last month', color: '#5CBB5C' },
  { text: 'New Order', subtext: '€289.00', color: '#2E9AC4' },
  { text: '+87', subtext: 'New Customers', color: '#56B8DE' },
  { text: '4.9', subtext: 'Store Rating', color: '#F5A623' },
  { text: '€1.2M', subtext: 'Monthly Revenue', color: '#5CBB5C' },
  { text: 'ROAS 4.2x', subtext: 'Meta Ads', color: '#2E9AC4' },
  { text: '68%', subtext: 'Repeat Rate', color: '#1B7EA6' },
  { text: 'CPA €12', subtext: '↓ 23% optimiert', color: '#5CBB5C' },
  { text: '+3 Märkte', subtext: 'Expandiert', color: '#56B8DE' },
  { text: '€340K', subtext: 'Ad Spend/Mo', color: '#1877F2' },
  { text: 'ROAS 5.1x', subtext: 'Google Ads', color: '#34A853' },
  { text: '+2.1M', subtext: 'Views/Week', color: '#1A1A2E' },
]

/* ============================================
   SCALING CHART — Canvas 2D Revenue Chart
   ============================================ */

function roundedTopRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x, y + h)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h)
  ctx.closePath()
}

function ScalingChart({ show }: { show: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const dataPointsRef = useRef<number[]>([])
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!show || hasStartedRef.current) return
    hasStartedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return

    // Generate 24 data points with exponential growth + sine noise
    const points: number[] = []
    for (let i = 0; i < 24; i++) {
      const t = i / 23
      const base = Math.pow(t, 1.8) * 0.7 + t * 0.3
      const noise = Math.sin(i * 1.3) * 0.03 + Math.sin(i * 2.7) * 0.02
      points.push(Math.max(0, Math.min(1, base + noise)))
    }
    dataPointsRef.current = points

    startTimeRef.current = performance.now()

    let resizeTimeout: ReturnType<typeof setTimeout>

    const setupCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }

    setupCanvas()

    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(setupCanvas, 200)
    }
    window.addEventListener('resize', handleResize)

    const draw = (now: number) => {
      animationRef.current = requestAnimationFrame(draw)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      if (w === 0 || h === 0) return

      // Check if canvas dimensions need updating
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
      }

      const elapsed = now - startTimeRef.current
      const rawProgress = Math.min(elapsed / 2500, 1)
      // easeOutQuart: 1 - pow(1-t, 4)
      const progress = 1 - Math.pow(1 - rawProgress, 4)

      const data = dataPointsRef.current

      // Chart area
      const chartLeft = w * 0.08
      const chartRight = w * 0.92
      const chartTop = h * 0.15
      const chartBottom = h * 0.78
      const chartWidth = chartRight - chartLeft
      const chartHeight = chartBottom - chartTop

      ctx.clearRect(0, 0, w, h)

      // Y-axis labels
      const yLabels = ['€0', '€250K', '€500K', '€750K', '€1M']
      ctx.font = '10px "Geist Mono", monospace'
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(148,163,184,0.3)'
      for (let i = 0; i < yLabels.length; i++) {
        const y = chartBottom - (i / (yLabels.length - 1)) * chartHeight
        ctx.fillText(yLabels[i], chartLeft - 8, y)
      }

      // Dashed guide lines
      ctx.strokeStyle = 'rgba(148,163,184,0.06)'
      ctx.lineWidth = 0.5
      ctx.setLineDash([4, 4])
      for (let i = 0; i < yLabels.length; i++) {
        const y = chartBottom - (i / (yLabels.length - 1)) * chartHeight
        ctx.beginPath()
        ctx.moveTo(chartLeft, y)
        ctx.lineTo(chartRight, y)
        ctx.stroke()
      }
      ctx.setLineDash([])

      // Bars
      const barCount = 24
      const totalBarSpace = chartWidth
      const barGap = totalBarSpace * 0.02
      const barWidth = (totalBarSpace - barGap * (barCount - 1)) / barCount

      for (let i = 0; i < barCount; i++) {
        const barProgress = Math.max(0, Math.min(1, (progress * 24 - i) / 2))
        if (barProgress <= 0) continue

        const x = chartLeft + i * (barWidth + barGap)
        const barH = data[i] * chartHeight * barProgress
        const barY = chartBottom - barH
        const radius = Math.min(barWidth * 0.4, 6)

        // Vertical gradient for bar
        const grad = ctx.createLinearGradient(x, chartBottom, x, barY)
        grad.addColorStop(0, 'rgba(46,154,196,0.02)')
        grad.addColorStop(0.5, 'rgba(46,154,196,0.06)')
        grad.addColorStop(1, 'rgba(46,154,196,0.12)')

        ctx.fillStyle = grad
        if (barH > radius) {
          roundedTopRect(ctx, x, barY, barWidth, barH, radius)
          ctx.fill()
        } else if (barH > 0) {
          ctx.fillRect(x, barY, barWidth, barH)
        }
      }

      // Growth curve line
      const visibleCount = Math.floor(progress * 24)
      if (visibleCount > 0) {
        const curvePoints: { x: number; y: number }[] = []
        for (let i = 0; i <= Math.min(visibleCount, 23); i++) {
          const bp = Math.max(0, Math.min(1, (progress * 24 - i) / 2))
          const x = chartLeft + i * (barWidth + barGap) + barWidth / 2
          const barH = data[i] * chartHeight * bp
          const y = chartBottom - barH
          curvePoints.push({ x, y })
        }

        if (curvePoints.length > 1) {
          // Line
          ctx.beginPath()
          ctx.moveTo(curvePoints[0].x, curvePoints[0].y)
          for (let i = 1; i < curvePoints.length; i++) {
            ctx.lineTo(curvePoints[i].x, curvePoints[i].y)
          }
          ctx.strokeStyle = '#2E9AC4'
          ctx.lineWidth = 2.5
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctx.stroke()

          // Area fill below curve
          ctx.beginPath()
          ctx.moveTo(curvePoints[0].x, curvePoints[0].y)
          for (let i = 1; i < curvePoints.length; i++) {
            ctx.lineTo(curvePoints[i].x, curvePoints[i].y)
          }
          ctx.lineTo(curvePoints[curvePoints.length - 1].x, chartBottom)
          ctx.lineTo(curvePoints[0].x, chartBottom)
          ctx.closePath()

          const areaGrad = ctx.createLinearGradient(0, curvePoints[0].y, 0, chartBottom)
          areaGrad.addColorStop(0, 'rgba(46,154,196,0.08)')
          areaGrad.addColorStop(1, 'rgba(46,154,196,0.0)')
          ctx.fillStyle = areaGrad
          ctx.fill()

          // Glowing end point
          const lastPt = curvePoints[curvePoints.length - 1]
          const pulseOpacity = Math.sin(now * 0.003) * 0.15 + 0.3

          // Radial glow
          const glowGrad = ctx.createRadialGradient(
            lastPt.x, lastPt.y, 0,
            lastPt.x, lastPt.y, 20
          )
          glowGrad.addColorStop(0, `rgba(46,154,196,${pulseOpacity})`)
          glowGrad.addColorStop(1, 'rgba(46,154,196,0)')
          ctx.fillStyle = glowGrad
          ctx.beginPath()
          ctx.arc(lastPt.x, lastPt.y, 20, 0, Math.PI * 2)
          ctx.fill()

          // Solid dot
          ctx.fillStyle = '#2E9AC4'
          ctx.beginPath()
          ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2)
          ctx.fill()

          // White center
          ctx.fillStyle = '#FFFFFF'
          ctx.beginPath()
          ctx.arc(lastPt.x, lastPt.y, 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    animationRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationRef.current)
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [show])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

/* ============================================
   FLOATING BUBBLES — DOM-animated notifications
   ============================================ */

const BUBBLE_SIZES: ('sm' | 'md' | 'lg')[] = [
  'sm', 'md', 'lg', 'md', 'sm', 'lg', 'md', 'sm', 'lg', 'sm', 'md', 'lg', 'sm', 'md',
]

const BUBBLE_ZONES = [
  { x: [0.02, 0.22], y: [0.05, 0.35] },   // top-left
  { x: [0.78, 0.96], y: [0.05, 0.35] },   // top-right
  { x: [0.02, 0.22], y: [0.65, 0.92] },   // bottom-left
  { x: [0.78, 0.96], y: [0.65, 0.92] },   // bottom-right
  { x: [0.25, 0.42], y: [0.02, 0.18] },   // top-center-left
  { x: [0.58, 0.75], y: [0.02, 0.18] },   // top-center-right
  { x: [0.25, 0.42], y: [0.82, 0.96] },   // bottom-center-left
  { x: [0.58, 0.75], y: [0.82, 0.96] },   // bottom-center-right
]

interface BubbleState {
  baseX: number
  baseY: number
  speedX: number
  speedY: number
  phaseX: number
  phaseY: number
  amplitudeX: number
  amplitudeY: number
  entranceDelay: number
  visible: boolean
}

function FloatingBubbles({ show }: { show: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([])
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const statesRef = useRef<BubbleState[]>([])
  const animFrameRef = useRef<number>(0)
  const showTimeRef = useRef<number>(0)
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!show || initializedRef.current) return
    initializedRef.current = true
    showTimeRef.current = performance.now()

    const container = containerRef.current
    if (!container) return

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = (e.clientY - rect.top) / rect.height
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Initialize bubble states
    const states: BubbleState[] = []
    for (let i = 0; i < 14; i++) {
      const zone = BUBBLE_ZONES[i % BUBBLE_ZONES.length]
      const baseX = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0])
      const baseY = zone.y[0] + Math.random() * (zone.y[1] - zone.y[0])
      states.push({
        baseX,
        baseY,
        speedX: 0.3 + Math.random() * 0.5,
        speedY: 0.2 + Math.random() * 0.4,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amplitudeX: 8 + Math.random() * 16,
        amplitudeY: 6 + Math.random() * 12,
        entranceDelay: 800 + i * 150,
        visible: false,
      })
    }
    statesRef.current = states

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate)

      const elapsed = now - showTimeRef.current
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (w === 0 || h === 0) return

      // Determine how many to show based on viewport
      const viewportWidth = window.innerWidth
      let maxVisible = 14
      if (viewportWidth < 768) maxVisible = 6
      else if (viewportWidth <= 1024) maxVisible = 10

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < 14; i++) {
        const el = bubblesRef.current[i]
        if (!el) continue

        const st = statesRef.current[i]

        if (i >= maxVisible) {
          el.style.opacity = '0'
          continue
        }

        // Entrance timing
        if (elapsed < st.entranceDelay) {
          el.style.opacity = '0'
          continue
        }

        const fadeIn = Math.min(1, (elapsed - st.entranceDelay) / 600)

        // Lissajous offset
        const t = now * 0.001
        const lissX = Math.sin(t * st.speedX + st.phaseX) * st.amplitudeX
        const lissY = Math.cos(t * st.speedY + st.phaseY) * st.amplitudeY

        // Mouse parallax offset (subtle)
        const parallaxStrength = 15
        const parallaxX = (mx - 0.5) * parallaxStrength * (i % 2 === 0 ? 1 : -0.6)
        const parallaxY = (my - 0.5) * parallaxStrength * (i % 2 === 0 ? -0.6 : 1)

        const finalX = st.baseX * w + lissX + parallaxX
        const finalY = st.baseY * h + lissY + parallaxY

        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`
        el.style.opacity = String(fadeIn * 0.9)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [show])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 5,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {NOTIFICATION_BUBBLES.map((bubble, i) => {
        const size = BUBBLE_SIZES[i]
        return (
          <div
            key={i}
            ref={(el) => { bubblesRef.current[i] = el }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding:
                size === 'sm'
                  ? '8px 12px'
                  : size === 'lg'
                    ? '14px 20px'
                    : '10px 16px',
              borderRadius: size === 'sm' ? 12 : size === 'lg' ? 20 : 16,
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
              willChange: 'transform',
              pointerEvents: 'none',
              userSelect: 'none',
              opacity: 0,
              fontSize: size === 'sm' ? 11 : size === 'lg' ? 14 : 13,
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `${bubble.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: bubble.color,
                  boxShadow: `0 0 6px ${bubble.color}66`,
                }}
              />
            </div>
            {/* Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  color: '#1A1A2E',
                  lineHeight: 1.1,
                  letterSpacing: '-0.01em',
                }}
              >
                {bubble.text}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 10,
                  color: '#94A3B8',
                  lineHeight: 1.1,
                }}
              >
                {bubble.subtext}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ============================================
   METRIC ITEM — Counter Animation
   ============================================ */

function MetricItem({
  metric,
  index,
  shouldAnimate,
  isMobile,
}: {
  metric: { value: string; label: string }
  index: number
  shouldAnimate: boolean
  isMobile: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [counterDisplay, setCounterDisplay] = useState(metric.value)
  const hasAnimated = useRef(false)

  const parsed = useMemo(() => {
    const match = metric.value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
    if (!match) return null
    return {
      prefix: match[1],
      number: parseFloat(match[2]),
      suffix: match[3],
      isFloat: match[2].includes('.'),
    }
  }, [metric.value])

  useEffect(() => {
    if (!shouldAnimate || !parsed || hasAnimated.current || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          const startTime = performance.now()
          const target = parsed.number
          const duration = 2000

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            const current = eased * target

            if (parsed.isFloat) {
              setCounterDisplay(`${parsed.prefix}${current.toFixed(1)}${parsed.suffix}`)
            } else {
              setCounterDisplay(`${parsed.prefix}${Math.round(current)}${parsed.suffix}`)
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCounterDisplay(metric.value)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [shouldAnimate, parsed, metric.value])

  const showBorder = isMobile ? index % 2 !== 0 : index > 0

  return (
    <div
      ref={ref}
      style={{
        padding: isMobile ? '16px 20px' : '20px 28px',
        borderLeft: showBorder ? '1px solid rgba(46,154,196,0.15)' : 'none',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 3.5vw, 56px)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'linear-gradient(180deg, #1A1A2E 30%, #2E9AC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {counterDisplay}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color: '#94A3B8',
          marginTop: 8,
        }}
      >
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#5CBB5C',
            boxShadow: '0 0 6px rgba(92,187,92,0.6)',
            flexShrink: 0,
          }}
        />
        {metric.label}
      </div>
    </div>
  )
}

/* ============================================
   PRIMARY CTA — Charge-Up Effect
   ============================================ */

function PrimaryCTA({ children, href }: { children: React.ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 64,
          background: 'linear-gradient(135deg, #56B8DE, #2E9AC4, #1B7EA6)',
          filter: 'blur(8px)',
          opacity: hovered ? 0.5 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />
      <a
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '18px 36px',
          background: '#1A1A2E',
          color: '#FFF',
          borderRadius: 60,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          cursor: 'pointer',
          border: 'none',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 12px 32px rgba(46,154,196,0.4)'
            : '0 4px 16px rgba(26,26,46,0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          zIndex: 1,
        }}
      >
        {/* Charge-up gradient fill */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: hovered ? '100%' : '0%',
            background: 'linear-gradient(135deg, #56B8DE, #2E9AC4, #1B7EA6)',
            borderRadius: 60,
            transition: 'width 0.45s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {children}
        </span>
      </a>
    </div>
  )
}

/* ============================================
   SCROLL INDICATOR
   ============================================ */

function ScrollIndicator({ show }: { show: boolean }) {
  const [opacity, setOpacity] = useState(0.5)

  useEffect(() => {
    const handleScroll = () => {
      setOpacity(Math.max(0, 0.5 - window.scrollY / 200))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transition: 'opacity 0.3s ease',
        zIndex: 3,
      }}
    >
      <div
        style={{
          width: 1,
          height: 40,
          background: 'rgba(148,163,184,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 3,
            height: 8,
            background: '#2E9AC4',
            borderRadius: 2,
            position: 'absolute',
            left: -1,
            animation: 'scrollBounce 2s infinite',
          }}
        />
      </div>
    </div>
  )
}

/* ============================================
   HERO COMPONENT — Scaling Dashboard
   ============================================ */

export default function Hero({ introComplete }: { introComplete: boolean }) {
  const [show, setShow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w <= 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#FAFCFE',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes scrollBounce {
          0%, 100% { top: 4px; }
          50% { top: 28px; }
        }
      `}</style>

      {/* Layer 0 — Grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(46,154,196,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,154,196,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 55%, black 30%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 55%, black 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 1 — Canvas chart */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <ScalingChart show={show} />
      </div>

      {/* Layer 2 — Floating bubbles */}
      <FloatingBubbles show={show} />

      {/* Layer 3 — Content card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4, ease: EASE_OUT_EXPO }}
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: isMobile ? '95%' : isTablet ? '90%' : 720,
          width: '100%',
          padding: isMobile
            ? '32px 24px'
            : isTablet
              ? '40px 32px'
              : 'clamp(40px, 5vw, 64px) clamp(32px, 4vw, 56px)',
          textAlign: 'center',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(40px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
          borderRadius: isMobile ? 20 : isTablet ? 24 : 28,
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow:
            '0 4px 16px rgba(0,0,0,0.03), 0 16px 64px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT_EXPO }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(46,154,196,0.06)',
            border: '1px solid rgba(46,154,196,0.1)',
            borderRadius: 100,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#5CBB5C',
              flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 400,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#2E9AC4',
            }}
          >
            E-COMMERCE GROWTH PARTNER &middot; &euro;10M+ MONTHLY AD SPEND
          </span>
        </motion.div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 0.95,
            letterSpacing: '-0.035em',
            color: '#1A1A2E',
            margin: 0,
          }}
        >
          {[
            { text: 'Your next', delay: 0.7 },
            { text: null, delay: 0.85, accent: true },
            { text: 'growth chapter', delay: 1.0 },
            { text: 'starts here.', delay: 1.15 },
          ].map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: line.delay,
                ease: EASE_OUT_EXPO,
              }}
              style={{ display: 'block' }}
            >
              {line.accent ? (
                <span
                  style={{
                    fontFamily: 'var(--font-accent)',
                    fontWeight: 400,
                    fontSize: '115%',
                    background:
                      'linear-gradient(90deg, #56B8DE, #2E9AC4, #1B7EA6, #56B8DE, #2E9AC4)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    animation: 'shimmer 4s linear infinite',
                  }}
                >
                  satisfying
                </span>
              ) : (
                line.text
              )}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.4, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(15px, 1.3vw, 17px)',
            lineHeight: 1.7,
            color: '#4A5568',
            maxWidth: 520,
            margin: '24px auto 0',
            letterSpacing: '-0.01em',
          }}
        >
          Iron Media hilft etablierten E-Commerce Brands dabei, von solide zu
          spektakul&auml;r zu wachsen &mdash; mit datengetriebenem Performance
          Marketing und Inhouse-Teamaufbau.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.6, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 32,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <PrimaryCTA href="#contact">Kostenloses Audit &rarr;</PrimaryCTA>

          <a
            href="#cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '18px 36px',
              background: 'transparent',
              color: '#1A1A2E',
              borderRadius: 60,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.01em',
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1.5px solid rgba(26,26,46,0.12)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E9AC4'
              e.currentTarget.style.color = '#2E9AC4'
              e.currentTarget.style.background = 'rgba(46,154,196,0.04)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'
              e.currentTarget.style.color = '#1A1A2E'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            Case Studies ansehen
          </a>
        </motion.div>

        {/* Metrics row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.8, ease: EASE_OUT_EXPO }}
          style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
            flexDirection: isMobile ? undefined : 'row',
            justifyContent: 'center',
            marginTop: 36,
            paddingTop: 28,
            borderTop: '1px solid rgba(46,154,196,0.08)',
          }}
        >
          {HERO_METRICS.map((metric, i) => (
            <MetricItem
              key={metric.label}
              metric={metric}
              index={i}
              shouldAnimate={show}
              isMobile={isMobile}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Trusted By logos */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 2.0, ease: EASE_OUT_EXPO }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 40,
          gap: 16,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: '#94A3B8',
          }}
        >
          Trusted by leading brands
        </span>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {TRUSTED_LOGOS.map((logo) => (
            <img
              key={logo.name}
              src={`https://logo.clearbit.com/${logo.domain}`}
              alt={logo.name}
              style={{
                height: 20,
                opacity: 0.35,
                filter: 'grayscale(100%)',
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.filter = 'grayscale(0%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.35'
                e.currentTarget.style.filter = 'grayscale(100%)'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
