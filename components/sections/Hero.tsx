'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TRUSTED_LOGOS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v5.4
   Animated bars + Shopify sale notifications
   + metric bubbles + floating text (no card)
   ============================================ */

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---------- Shopify sale notifications (LEFT upper half) ---------- */

const SHOPIFY_NOTIFICATIONS = [
  { text: '+100 Sales', subtext: 'Today' },
  { text: '+10k Revenue', subtext: 'Today' },
  { text: '+500', subtext: 'Today' },
  { text: '+20k Sales', subtext: 'This month' },
]

const SHOPIFY_ZONES = [
  { x: [0.02, 0.20], y: [0.03, 0.18] },
  { x: [0.24, 0.45], y: [0.05, 0.20] },
  { x: [0.04, 0.22], y: [0.22, 0.40] },
  { x: [0.26, 0.45], y: [0.24, 0.40] },
]

/* ---------- Metric bubbles (RIGHT upper half) ---------- */

const METRIC_BUBBLES = [
  { text: 'ROAS 4.2x', subtext: 'Meta Ads', color: '#2E9AC4' },
  { text: '+€12,847', subtext: 'Revenue today', color: '#2E9AC4' },
  { text: 'CPA €12', subtext: '↓ 23% optimiert', color: '#5CBB5C' },
  { text: '€1.2M', subtext: 'Monthly Revenue', color: '#5CBB5C' },
  { text: '68%', subtext: 'Repeat Rate', color: '#1B7EA6' },
  { text: 'ROAS 5.1x', subtext: 'Google Ads', color: '#34A853' },
  { text: '€340K', subtext: 'Ad Spend/Mo', color: '#1877F2' },
]

const METRIC_ZONES = [
  { x: [0.55, 0.72], y: [0.03, 0.16] },
  { x: [0.74, 0.96], y: [0.04, 0.18] },
  { x: [0.56, 0.70], y: [0.18, 0.30] },
  { x: [0.72, 0.96], y: [0.20, 0.32] },
  { x: [0.55, 0.68], y: [0.32, 0.40] },
  { x: [0.70, 0.88], y: [0.33, 0.40] },
  { x: [0.82, 0.96], y: [0.28, 0.40] },
]

const BUBBLE_SIZES: ('sm' | 'md' | 'lg')[] = [
  'md', 'lg', 'sm', 'md', 'sm', 'lg', 'md',
]

/* ---------- Shopify bag SVG icon ---------- */

function ShopifyBagIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.5 6.5C15.5 4.29 13.71 2.5 11.5 2.5C9.29 2.5 7.5 4.29 7.5 6.5"
        stroke="#5CBB5C"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M5.5 8.5H17.5L18.5 21.5H4.5L5.5 8.5Z"
        fill="#5CBB5C"
        stroke="#5CBB5C"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 6.5C15.5 4.29 13.71 2.5 11.5 2.5C9.29 2.5 7.5 4.29 7.5 6.5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================================
   ANIMATED ASCENDING BARS — Canvas 2D
   Continuous sine-wave loop
   ============================================ */

function AnimatedBars({ show }: { show: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const hasStartedRef = useRef(false)

  useEffect(() => {
    if (!show || hasStartedRef.current) return
    hasStartedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return

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

    const BAR_COUNT = 18

    const draw = (now: number) => {
      animationRef.current = requestAnimationFrame(draw)

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = Math.min(window.devicePixelRatio, 2)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      if (w === 0 || h === 0) return

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr
        canvas.height = h * dpr
        ctx.scale(dpr, dpr)
      }

      ctx.clearRect(0, 0, w, h)

      const t = now * 0.0004 // slow continuous time

      const chartLeft = w * 0.05
      const chartRight = w * 0.95
      const chartBottom = h * 0.92
      const chartTop = h * 0.15
      const chartWidth = chartRight - chartLeft
      const chartHeight = chartBottom - chartTop

      const totalBarSpace = chartWidth
      const barGap = totalBarSpace * 0.025
      const barWidth = (totalBarSpace - barGap * (BAR_COUNT - 1)) / BAR_COUNT

      for (let i = 0; i < BAR_COUNT; i++) {
        const x = chartLeft + i * (barWidth + barGap)

        // Sine wave pattern that continuously cycles
        // Each bar has a phase offset creating ascending left-to-right wave
        const phase = (i / BAR_COUNT) * Math.PI * 2
        const wave1 = Math.sin(t + phase) * 0.3
        const wave2 = Math.sin(t * 0.7 + phase * 1.3) * 0.15
        // Base ascending pattern (left low, right high)
        const ascending = (i / BAR_COUNT) * 0.5 + 0.2
        const normalizedHeight = Math.max(0.05, Math.min(1, ascending + wave1 + wave2))

        const barH = normalizedHeight * chartHeight
        const barY = chartBottom - barH
        const radius = Math.min(barWidth * 0.4, 6)

        // Blue gradient fill
        const grad = ctx.createLinearGradient(x, chartBottom, x, barY)
        grad.addColorStop(0, 'rgba(46,154,196,0.02)')
        grad.addColorStop(0.4, 'rgba(46,154,196,0.05)')
        grad.addColorStop(0.7, 'rgba(86,184,222,0.07)')
        grad.addColorStop(1, 'rgba(86,184,222,0.10)')

        ctx.fillStyle = grad

        if (barH > radius) {
          ctx.beginPath()
          ctx.moveTo(x, chartBottom)
          ctx.lineTo(x, barY + radius)
          ctx.quadraticCurveTo(x, barY, x + radius, barY)
          ctx.lineTo(x + barWidth - radius, barY)
          ctx.quadraticCurveTo(x + barWidth, barY, x + barWidth, barY + radius)
          ctx.lineTo(x + barWidth, chartBottom)
          ctx.closePath()
          ctx.fill()
        } else if (barH > 0) {
          ctx.fillRect(x, barY, barWidth, barH)
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
   FLOATING SHOPIFY NOTIFICATIONS (LEFT)
   ============================================ */

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
}

function ShopifyBubbles({ show }: { show: boolean }) {
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = (e.clientY - rect.top) / rect.height
    }
    window.addEventListener('mousemove', handleMouseMove)

    const states: BubbleState[] = []
    for (let i = 0; i < SHOPIFY_NOTIFICATIONS.length; i++) {
      const zone = SHOPIFY_ZONES[i]
      states.push({
        baseX: zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]),
        baseY: zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]),
        speedX: 0.25 + Math.random() * 0.4,
        speedY: 0.2 + Math.random() * 0.35,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amplitudeX: 6 + Math.random() * 12,
        amplitudeY: 5 + Math.random() * 10,
        entranceDelay: 800 + i * 200,
      })
    }
    statesRef.current = states

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate)

      const elapsed = now - showTimeRef.current
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (w === 0 || h === 0) return

      const viewportWidth = window.innerWidth
      if (viewportWidth < 768) {
        // Hide on mobile
        for (let i = 0; i < SHOPIFY_NOTIFICATIONS.length; i++) {
          const el = bubblesRef.current[i]
          if (el) el.style.opacity = '0'
        }
        return
      }

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < SHOPIFY_NOTIFICATIONS.length; i++) {
        const el = bubblesRef.current[i]
        if (!el) continue

        const st = statesRef.current[i]

        if (elapsed < st.entranceDelay) {
          el.style.opacity = '0'
          continue
        }

        const fadeIn = Math.min(1, (elapsed - st.entranceDelay) / 600)

        const t = now * 0.001
        const lissX = Math.sin(t * st.speedX + st.phaseX) * st.amplitudeX
        const lissY = Math.cos(t * st.speedY + st.phaseY) * st.amplitudeY

        const parallaxStrength = 12
        const parallaxX = (mx - 0.5) * parallaxStrength * (i % 2 === 0 ? 1 : -0.6)
        const parallaxY = (my - 0.5) * parallaxStrength * (i % 2 === 0 ? -0.6 : 1)

        const finalX = st.baseX * w + lissX + parallaxX
        const finalY = st.baseY * h + lissY + parallaxY

        el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`
        el.style.opacity = String(fadeIn * 0.92)
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
      {SHOPIFY_NOTIFICATIONS.map((notif, i) => (
        <div
          key={`shopify-${i}`}
          ref={(el) => { bubblesRef.current[i] = el }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            borderRadius: 16,
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.95)',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5)',
            willChange: 'transform',
            pointerEvents: 'none',
            userSelect: 'none',
            opacity: 0,
            fontSize: 13,
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(92,187,92,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShopifyBagIcon size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: '#1A1A2E',
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                fontSize: 14,
              }}
            >
              {notif.text}
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
              {notif.subtext}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ============================================
   FLOATING METRIC BUBBLES (RIGHT)
   ============================================ */

function MetricBubbles({ show }: { show: boolean }) {
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

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current.x = (e.clientX - rect.left) / rect.width
      mouseRef.current.y = (e.clientY - rect.top) / rect.height
    }
    window.addEventListener('mousemove', handleMouseMove)

    const states: BubbleState[] = []
    for (let i = 0; i < METRIC_BUBBLES.length; i++) {
      const zone = METRIC_ZONES[i]
      states.push({
        baseX: zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]),
        baseY: zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]),
        speedX: 0.3 + Math.random() * 0.5,
        speedY: 0.2 + Math.random() * 0.4,
        phaseX: Math.random() * Math.PI * 2,
        phaseY: Math.random() * Math.PI * 2,
        amplitudeX: 8 + Math.random() * 16,
        amplitudeY: 6 + Math.random() * 12,
        entranceDelay: 900 + i * 150,
      })
    }
    statesRef.current = states

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate)

      const elapsed = now - showTimeRef.current
      const w = container.offsetWidth
      const h = container.offsetHeight
      if (w === 0 || h === 0) return

      const viewportWidth = window.innerWidth
      let maxVisible = 7
      if (viewportWidth < 768) maxVisible = 0
      else if (viewportWidth <= 1024) maxVisible = 5

      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < METRIC_BUBBLES.length; i++) {
        const el = bubblesRef.current[i]
        if (!el) continue

        const st = statesRef.current[i]

        if (i >= maxVisible) {
          el.style.opacity = '0'
          continue
        }

        if (elapsed < st.entranceDelay) {
          el.style.opacity = '0'
          continue
        }

        const fadeIn = Math.min(1, (elapsed - st.entranceDelay) / 600)

        const t = now * 0.001
        const lissX = Math.sin(t * st.speedX + st.phaseX) * st.amplitudeX
        const lissY = Math.cos(t * st.speedY + st.phaseY) * st.amplitudeY

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
      {METRIC_BUBBLES.map((bubble, i) => {
        const size = BUBBLE_SIZES[i]
        return (
          <div
            key={`metric-${i}`}
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
   TRUSTED LOGO — with fallback text
   ============================================ */

function TrustedLogo({ logo }: { logo: { name: string; domain: string } }) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 12,
          letterSpacing: '0.04em',
          color: '#94A3B8',
          opacity: 0.5,
          transition: 'opacity 0.3s ease',
          cursor: 'default',
          userSelect: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.5'
        }}
      >
        {logo.name}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://logo.clearbit.com/${logo.domain}`}
      alt={logo.name}
      crossOrigin="anonymous"
      style={{
        height: 24,
        opacity: 0.4,
        filter: 'grayscale(100%)',
        transition: 'opacity 0.3s ease, filter 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.7'
        e.currentTarget.style.filter = 'grayscale(0%)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '0.4'
        e.currentTarget.style.filter = 'grayscale(100%)'
      }}
      onError={() => setFailed(true)}
    />
  )
}

/* ============================================
   HERO COMPONENT — v5.4
   ============================================ */

const HEADLINE_WORDS = ['Wir', 'skalieren', 'deine', 'E-Com-Marke']

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
        @keyframes scrollBounce {
          0%, 100% { top: 4px; }
          50% { top: 28px; }
        }
      `}</style>

      {/* Layer 0 — Striped/checkered grid background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(46,154,196,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,154,196,0.03) 1px, transparent 1px),
            linear-gradient(rgba(46,154,196,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46,154,196,0.015) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px, 60px 60px, 20px 20px, 20px 20px',
          WebkitMaskImage:
            'radial-gradient(ellipse 80% 70% at 50% 55%, black 30%, transparent 80%)',
          maskImage:
            'radial-gradient(ellipse 80% 70% at 50% 55%, black 30%, transparent 80%)',
          pointerEvents: 'none',
        }}
      />

      {/* Layer 1 — Animated ascending bars (Canvas) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <AnimatedBars show={show} />
      </div>

      {/* Layer 2a — Shopify sale notifications (LEFT upper half) */}
      <ShopifyBubbles show={show} />

      {/* Layer 2b — Metric bubbles (RIGHT upper half) */}
      <MetricBubbles show={show} />

      {/* Layer 3 — Content (NO card wrapper, directly on page) */}
      <div
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

        {/* Headline — "Wir skalieren deine E-Com-Marke" all same font */}
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
          {HEADLINE_WORDS.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.7 + i * 0.12,
                ease: EASE_OUT_EXPO,
              }}
              style={{
                display: 'inline-block',
                marginRight: '0.22em',
              }}
            >
              {word}
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
      </div>

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
            <TrustedLogo key={logo.name} logo={logo} />
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
