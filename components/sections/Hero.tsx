'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS, TRUSTED_BRANDS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v3
   Centered text + floating glassy bar bubbles
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ============================================
   FLOATING GLASS BAR BUBBLES
   Pill-shaped like the Iron Media logo bars,
   with frosted glass appearance, autonomously
   drifting around the hero section.
   ============================================ */

interface BubbleConfig {
  id: number
  x: number        // start % from left
  y: number        // start % from top
  width: number    // px
  height: number   // px
  color: string    // one of the 3 brand blues
  opacity: number
  rotation: number // initial deg
  driftX: number   // px amplitude
  driftY: number   // px amplitude
  driftDuration: number // seconds
  rotateDuration: number // seconds
  delay: number    // animation delay seconds
  blur: number     // backdrop blur px
  scale: number
}

const BRAND_COLORS = ['#56B8DE', '#2E9AC4', '#1B7EA6']

function generateBubbles(): BubbleConfig[] {
  // Create ~18 bubbles of varying sizes scattered across the hero
  const configs: BubbleConfig[] = []

  const presets: Array<{
    x: number; y: number; w: number; h: number; colorIdx: number;
    opacity: number; rot: number; driftX: number; driftY: number;
    driftDur: number; rotDur: number; delay: number; blur: number; scale: number
  }> = [
    // Large accent bubbles
    { x: 8, y: 15, w: 28, h: 120, colorIdx: 0, opacity: 0.12, rot: -15, driftX: 30, driftY: 25, driftDur: 18, rotDur: 25, delay: 0, blur: 12, scale: 1 },
    { x: 85, y: 20, w: 24, h: 100, colorIdx: 1, opacity: 0.10, rot: 12, driftX: 25, driftY: 35, driftDur: 22, rotDur: 30, delay: 1, blur: 10, scale: 1 },
    { x: 75, y: 70, w: 30, h: 130, colorIdx: 2, opacity: 0.09, rot: -20, driftX: 35, driftY: 20, driftDur: 20, rotDur: 28, delay: 0.5, blur: 14, scale: 1 },

    // Medium bubbles
    { x: 20, y: 65, w: 20, h: 85, colorIdx: 1, opacity: 0.11, rot: 25, driftX: 40, driftY: 30, driftDur: 16, rotDur: 22, delay: 2, blur: 8, scale: 1 },
    { x: 55, y: 8, w: 18, h: 75, colorIdx: 0, opacity: 0.08, rot: -30, driftX: 25, driftY: 40, driftDur: 24, rotDur: 35, delay: 1.5, blur: 10, scale: 1 },
    { x: 92, y: 50, w: 22, h: 90, colorIdx: 2, opacity: 0.10, rot: 18, driftX: 20, driftY: 25, driftDur: 19, rotDur: 26, delay: 0.8, blur: 12, scale: 1 },
    { x: 35, y: 80, w: 16, h: 70, colorIdx: 0, opacity: 0.09, rot: -8, driftX: 30, driftY: 35, driftDur: 21, rotDur: 32, delay: 3, blur: 8, scale: 1 },
    { x: 5, y: 45, w: 14, h: 60, colorIdx: 2, opacity: 0.07, rot: 35, driftX: 20, driftY: 30, driftDur: 17, rotDur: 24, delay: 2.5, blur: 6, scale: 1 },

    // Small accent bubbles
    { x: 45, y: 25, w: 12, h: 50, colorIdx: 1, opacity: 0.06, rot: -22, driftX: 35, driftY: 45, driftDur: 15, rotDur: 20, delay: 1.2, blur: 6, scale: 1 },
    { x: 68, y: 40, w: 10, h: 45, colorIdx: 0, opacity: 0.07, rot: 14, driftX: 30, driftY: 25, driftDur: 23, rotDur: 28, delay: 4, blur: 4, scale: 1 },
    { x: 15, y: 85, w: 14, h: 55, colorIdx: 2, opacity: 0.08, rot: -35, driftX: 25, driftY: 30, driftDur: 18, rotDur: 30, delay: 1.8, blur: 8, scale: 1 },
    { x: 80, y: 5, w: 12, h: 48, colorIdx: 1, opacity: 0.06, rot: 28, driftX: 20, driftY: 35, driftDur: 26, rotDur: 34, delay: 3.5, blur: 6, scale: 1 },
    { x: 50, y: 90, w: 16, h: 65, colorIdx: 0, opacity: 0.07, rot: -12, driftX: 30, driftY: 20, driftDur: 20, rotDur: 25, delay: 2.2, blur: 8, scale: 1 },

    // Tiny subtle bubbles
    { x: 30, y: 35, w: 8, h: 35, colorIdx: 2, opacity: 0.05, rot: 40, driftX: 40, driftY: 50, driftDur: 14, rotDur: 18, delay: 5, blur: 4, scale: 1 },
    { x: 60, y: 60, w: 10, h: 40, colorIdx: 1, opacity: 0.05, rot: -18, driftX: 35, driftY: 30, driftDur: 25, rotDur: 22, delay: 4.5, blur: 4, scale: 1 },
    { x: 95, y: 85, w: 10, h: 42, colorIdx: 0, opacity: 0.06, rot: 22, driftX: 25, driftY: 35, driftDur: 19, rotDur: 27, delay: 2.8, blur: 6, scale: 1 },
    { x: 3, y: 75, w: 12, h: 52, colorIdx: 1, opacity: 0.07, rot: -25, driftX: 30, driftY: 25, driftDur: 22, rotDur: 30, delay: 1, blur: 6, scale: 1 },
    { x: 42, y: 5, w: 10, h: 38, colorIdx: 2, opacity: 0.05, rot: 10, driftX: 35, driftY: 40, driftDur: 16, rotDur: 20, delay: 3.2, blur: 4, scale: 1 },
  ]

  presets.forEach((p, i) => {
    configs.push({
      id: i,
      x: p.x,
      y: p.y,
      width: p.w,
      height: p.h,
      color: BRAND_COLORS[p.colorIdx],
      opacity: p.opacity,
      rotation: p.rot,
      driftX: p.driftX,
      driftY: p.driftY,
      driftDuration: p.driftDur,
      rotateDuration: p.rotDur,
      delay: p.delay,
      blur: p.blur,
      scale: p.scale,
    })
  })

  return configs
}

const BUBBLES = generateBubbles()

function GlassBarBubbles({ show }: { show: boolean }) {
  return (
    <>
      <style>{`
        @keyframes bubbleDrift {
          0%, 100% { transform: var(--drift-from); }
          25% { transform: var(--drift-q1); }
          50% { transform: var(--drift-to); }
          75% { transform: var(--drift-q3); }
        }
      `}</style>
      {BUBBLES.map((b) => {
        // Create a unique, organic drift path for each bubble
        const driftFrom = `translate(0px, 0px) rotate(${b.rotation}deg) scale(${b.scale})`
        const driftQ1 = `translate(${b.driftX * 0.7}px, ${-b.driftY}px) rotate(${b.rotation + 8}deg) scale(${b.scale * 1.02})`
        const driftTo = `translate(${b.driftX}px, ${b.driftY * 0.3}px) rotate(${b.rotation - 5}deg) scale(${b.scale})`
        const driftQ3 = `translate(${-b.driftX * 0.4}px, ${b.driftY}px) rotate(${b.rotation + 3}deg) scale(${b.scale * 0.98})`

        return (
          <div
            key={b.id}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.width,
              height: b.height,
              borderRadius: b.width / 2,
              // Frosted glass effect
              background: `linear-gradient(
                135deg,
                ${b.color}${Math.round(b.opacity * 255 * 1.5).toString(16).padStart(2, '0')} 0%,
                ${b.color}${Math.round(b.opacity * 255 * 0.6).toString(16).padStart(2, '0')} 40%,
                ${b.color}${Math.round(b.opacity * 255 * 1.2).toString(16).padStart(2, '0')} 100%
              )`,
              backdropFilter: `blur(${b.blur}px)`,
              WebkitBackdropFilter: `blur(${b.blur}px)`,
              border: `1px solid ${b.color}${Math.round(b.opacity * 255 * 0.8).toString(16).padStart(2, '0')}`,
              boxShadow: `
                inset 0 1px 1px rgba(255,255,255,${b.opacity * 3}),
                inset 0 -1px 1px ${b.color}${Math.round(b.opacity * 255 * 0.5).toString(16).padStart(2, '0')},
                0 4px ${b.blur * 2}px ${b.color}${Math.round(b.opacity * 255 * 0.4).toString(16).padStart(2, '0')}
              `,
              opacity: show ? 1 : 0,
              transition: `opacity 1.2s ease ${b.delay}s`,
              pointerEvents: 'none',
              willChange: 'transform',
              // Animation via CSS custom properties
              ['--drift-from' as string]: driftFrom,
              ['--drift-q1' as string]: driftQ1,
              ['--drift-to' as string]: driftTo,
              ['--drift-q3' as string]: driftQ3,
              animation: show
                ? `bubbleDrift ${b.driftDuration}s ease-in-out ${b.delay}s infinite`
                : 'none',
              zIndex: 0,
            }}
          />
        )
      })}
    </>
  )
}

/* ============================================
   METRIC ITEM COMPONENT
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
          const duration = 1500

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
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

  return (
    <div
      ref={ref}
      style={{
        borderLeft: index > 0 ? '1px solid rgba(226,232,240,0.8)' : 'none',
        paddingLeft: index > 0 ? 24 : 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 3vw, 44px)',
          color: '#1A1A2E',
          lineHeight: 1.1,
        }}
      >
        {counterDisplay}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#94A3B8',
          marginTop: 6,
        }}
      >
        {metric.label}
      </div>
    </div>
  )
}

/* ============================================
   MAGNETIC BUTTON COMPONENT
   ============================================ */

function MagneticButton({
  children,
  href,
  style: styleProp,
}: {
  children: React.ReactNode
  href: string
  style: React.CSSProperties
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [sweepX, setSweepX] = useState(-100)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.15 * rect.width
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.15 * rect.height
    setOffset({ x, y })
  }, [])

  return (
    <a
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setHovered(true)
        setSweepX(-100)
        requestAnimationFrame(() => setSweepX(200))
      }}
      onMouseLeave={() => {
        setHovered(false)
        setOffset({ x: 0, y: 0 })
      }}
      style={{
        ...styleProp,
        transform: hovered
          ? `translate(${offset.x}px, ${offset.y - 2}px)`
          : 'translate(0, 0)',
        boxShadow: hovered
          ? '0 8px 30px rgba(46,154,196,0.35)'
          : '0 4px 16px rgba(46,154,196,0.18)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
          transform: `translateX(${sweepX}%)`,
          transition: hovered ? 'transform 0.6s ease' : 'none',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
      </span>
    </a>
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
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { top: 4px; }
          50% { top: 28px; }
        }
      `}</style>
    </div>
  )
}

/* ============================================
   HERO COMPONENT
   ============================================ */

export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const headlineLines = ['E-Commerce Brands', 'wachsen mit uns', 'unaufhaltbar.']

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#FFFFFF',
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
      `}</style>

      {/* Floating Glass Bar Bubbles — behind everything */}
      <GlassBarBubbles show={show} />

      {/* Centered Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: isMobile ? '120px 24px 60px' : '0 48px',
          maxWidth: 960,
          width: '100%',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT_EXPO }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(46,154,196,0.06)',
            border: '1px solid rgba(46,154,196,0.12)',
            borderRadius: 999,
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#2E9AC4',
              flexShrink: 0,
              animation: 'pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#2E9AC4',
            }}
          >
            E-COMMERCE GROWTH AGENCY &middot; &euro;1B+ PORTFOLIO
          </span>
        </motion.div>

        {/* Headline — Centered */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 7vw, 88px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: '#1A1A2E',
            margin: 0,
          }}
        >
          {headlineLines.map((line, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.4 + i * 0.12,
                ease: EASE_OUT_EXPO,
              }}
              style={{ display: 'block' }}
            >
              {line === 'unaufhaltbar.' ? (
                <span className="text-blue-gradient text-shimmer">{line}</span>
              ) : (
                line
              )}
            </motion.span>
          ))}
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(16px, 1.5vw, 20px)',
            lineHeight: 1.65,
            color: '#4A5568',
            maxWidth: 520,
            marginTop: 24,
          }}
        >
          Wir sind der Growth-Partner f&uuml;r ambitionierte E-Commerce Brands, die bereit sind, Marktf&uuml;hrer zu werden.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 1.0, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 32,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <MagneticButton
            href="#contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              background: 'linear-gradient(135deg, #56B8DE 0%, #2E9AC4 50%, #1B7EA6 100%)',
              color: '#FFF',
              borderRadius: 12,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Kostenloses Audit
            <span style={{ marginLeft: 4, fontSize: 16 }}>&rarr;</span>
          </MagneticButton>

          <a
            href="#cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '16px 32px',
              background: 'transparent',
              color: '#1A1A2E',
              borderRadius: 12,
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1.5px solid rgba(26,26,46,0.15)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#2E9AC4'
              e.currentTarget.style.color = '#2E9AC4'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'
              e.currentTarget.style.color = '#1A1A2E'
            }}
          >
            Case Studies
          </a>
        </motion.div>

        {/* Metrics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2, ease: EASE_OUT_EXPO }}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 24,
            marginTop: 48,
            textAlign: 'left',
          }}
        >
          {HERO_METRICS.map((metric, i) => (
            <MetricItem
              key={metric.label}
              metric={metric}
              index={isMobile ? i % 2 : i}
              shouldAnimate={show}
              isMobile={isMobile}
            />
          ))}
        </motion.div>

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.4, ease: EASE_OUT_EXPO }}
          style={{
            marginTop: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 14,
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: '#94A3B8',
            }}
          >
            TRUSTED BY
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(20px, 3vw, 40px)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {TRUSTED_BRANDS.map((brand, i) => (
              <motion.span
                key={brand.name}
                initial={{ opacity: 0 }}
                animate={show ? { opacity: 0.7 } : {}}
                transition={{
                  duration: 0.4,
                  delay: 1.5 + i * 0.05,
                  ease: EASE_OUT_EXPO,
                }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.05em',
                  color: brand.color,
                  cursor: 'default',
                  transition: 'opacity 200ms ease',
                }}
                whileHover={{ opacity: 1 }}
              >
                {brand.name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
