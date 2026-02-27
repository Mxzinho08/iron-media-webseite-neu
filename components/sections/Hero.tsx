'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

/* ============================================
   IRON MEDIA — HERO v4.0
   3-layer architecture, micro-interactions,
   glassmorphism metrics, magnetic CTA
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const METRICS = [
  { value: 1, prefix: '€', suffix: 'B+', label: 'PORTFOLIO REVENUE' },
  { value: 150, suffix: '+', label: 'BRANDS SKALIERT' },
  { value: 12, suffix: 'x', label: 'Ø ROAS' },
  { value: 98, suffix: '%', label: 'CLIENT RETENTION' },
]

const HERO_PARTNERS = [
  'Shopify Partner',
  'Amazon SP Partner',
  'Google Partner',
  'Meta Partner',
  'Klaviyo',
]

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---- Animated Counter ---- */
function AnimatedNumber({
  end,
  prefix = '',
  suffix = '',
  duration = 1500,
  delay = 0,
  started,
}: {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  started: boolean
}) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!started) return
    const startTime = Date.now() + delay
    const animate = () => {
      const now = Date.now()
      if (now < startTime) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setCurrent(Math.round(end * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, end, duration, delay])

  return (
    <span>
      {prefix}
      {current}
      {suffix}
    </span>
  )
}

/* ---- Metric Card with spotlight ---- */
function MetricCard({
  metric,
  index,
  show,
  isMobile,
}: {
  metric: (typeof METRICS)[number]
  index: number
  show: boolean
  isMobile: boolean
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [spotX, setSpotX] = useState('50%')
  const [spotY, setSpotY] = useState('50%')
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return
      const rect = cardRef.current?.getBoundingClientRect()
      if (!rect) return
      setSpotX(`${e.clientX - rect.left}px`)
      setSpotY(`${e.clientY - rect.top}px`)
    },
    [isMobile]
  )

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: 1.3 + index * 0.1,
        ease: EASE_OUT_EXPO,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: isHovered
          ? 'rgba(255,255,255,0.10)'
          : 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px) saturate(1.1)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.1)',
        border: isHovered
          ? '1px solid rgba(86,184,222,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '24px 20px',
        textAlign: 'center',
        cursor: 'default',
        transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 8px 32px rgba(46,154,196,0.15)'
          : '0 0 0 transparent',
      }}
    >
      {/* Spotlight overlay */}
      {!isMobile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 16,
            background: `radial-gradient(circle 100px at ${spotX} ${spotY}, rgba(86,184,222,0.1), transparent)`,
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 300ms ease',
            pointerEvents: 'none',
          }}
        />
      )}
      <div
        style={{
          position: 'relative',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 3.5vw, 44px)',
          color: '#FFFFFF',
          lineHeight: 1.1,
        }}
      >
        <AnimatedNumber
          end={metric.value}
          prefix={metric.prefix || ''}
          suffix={metric.suffix || ''}
          started={show}
          delay={1300 + index * 100}
        />
      </div>
      <div
        style={{
          position: 'relative',
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.5)',
          marginTop: 8,
        }}
      >
        {metric.label}
      </div>
    </motion.div>
  )
}

/* ---- Magnetic Primary CTA ---- */
function MagneticCTA({
  show,
  isMobile,
}: {
  show: boolean
  isMobile: boolean
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [shinePos, setShinePos] = useState({ x: '50%', y: '50%' })
  const [isHovered, setIsHovered] = useState(false)

  const handleWrapperMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return
      const wrapper = wrapperRef.current
      const button = buttonRef.current
      if (!wrapper || !button) return

      const wRect = wrapper.getBoundingClientRect()
      const bRect = button.getBoundingClientRect()

      // Magnetic offset
      const centerX = bRect.left + bRect.width / 2
      const centerY = bRect.top + bRect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const dist = Math.sqrt(distX * distX + distY * distY)
      const maxDist = 120

      if (dist < maxDist) {
        const strength = 1 - dist / maxDist
        setOffset({
          x: distX * strength * 0.4,
          y: distY * strength * 0.4,
        })
      } else {
        setOffset({ x: 0, y: 0 })
      }

      // Shine position relative to button
      const relX = e.clientX - bRect.left
      const relY = e.clientY - bRect.top
      setShinePos({ x: `${relX}px`, y: `${relY}px` })
    },
    [isMobile]
  )

  const handleWrapperMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 })
    setIsHovered(false)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={show ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 1.1, ease: EASE_OUT_EXPO }}
    >
      <div
        ref={wrapperRef}
        onMouseMove={handleWrapperMouseMove}
        onMouseLeave={handleWrapperMouseLeave}
        style={{ padding: 24, margin: -24, display: 'inline-block' }}
      >
        <a
          ref={buttonRef}
          href="#contact"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '16px 32px',
            background: isHovered
              ? 'linear-gradient(135deg, #3AADD4, #2490B8)'
              : 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
            color: '#FFFFFF',
            borderRadius: 12,
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 15,
            textDecoration: 'none',
            cursor: 'pointer',
            border: 'none',
            overflow: 'hidden',
            boxShadow: isHovered
              ? '0 0 30px rgba(46,154,196,0.5), 0 6px 24px rgba(0,0,0,0.3)'
              : '0 0 20px rgba(46,154,196,0.3), 0 4px 16px rgba(0,0,0,0.2)',
            transform: `translate(${offset.x}px, ${offset.y}px) ${isHovered ? 'translateY(-2px) scale(1.03)' : ''}`,
            transition:
              'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease, background 300ms ease',
          }}
        >
          {/* Shiny spotlight overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(circle 60px at ${shinePos.x} ${shinePos.y}, rgba(255,255,255,0.25), transparent)`,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 200ms ease',
              pointerEvents: 'none',
            }}
          />
          <span style={{ position: 'relative', zIndex: 1 }}>🚀</span>
          <span style={{ position: 'relative', zIndex: 1 }}>
            Kostenloses Audit starten
          </span>
        </a>
      </div>
    </motion.div>
  )
}

/* ============================================
   MAIN HERO COMPONENT
   ============================================ */
export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const headlineRef = useRef<HTMLHeadingElement>(null)

  // Trigger show after intro
  useEffect(() => {
    if (introComplete) {
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
    }
  }, [introComplete])

  // Responsive breakpoints
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth <= 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Mouse tracking (RAF-throttled)
  useEffect(() => {
    let rafId: number
    const handleMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() =>
        setMousePos({ x: e.clientX, y: e.clientY })
      )
    }
    window.addEventListener('mousemove', handleMove)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  // Scroll tracking for scroll indicator fade
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Headline tilt (desktop only)
  const tiltX =
    !isMobile && !isTablet && typeof window !== 'undefined'
      ? ((mousePos.y / (window.innerHeight || 1)) - 0.5) * 1.5
      : 0
  const tiltY =
    !isMobile && !isTablet && typeof window !== 'undefined'
      ? ((mousePos.x / (window.innerWidth || 1)) - 0.5) * -2.0
      : 0

  // Scroll indicator opacity
  const scrollIndicatorOpacity = Math.max(0, 1 - scrollY / 200) * 0.35

  // Character stagger for "unaufhaltbar."
  const gradientWord = 'unaufhaltbar.'

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* ====== LAYER 0 — Background ====== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(86,184,222,0.15) 0%, transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(46,154,196,0.10) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(27,126,166,0.08) 0%, transparent 40%), linear-gradient(135deg, #0A0F1E 0%, #0D1B2A 100%)',
        }}
      >
        {/* TODO: Replace with Spline 3D scene when URL is provided */}

        {/* Mobile glow animation overlay */}
        {isMobile && (
          <div
            style={{
              position: 'absolute',
              top: '30%',
              left: '20%',
              width: '60%',
              height: '40%',
              borderRadius: '50%',
              background:
                'radial-gradient(circle, rgba(46,154,196,0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
              animation: 'mobileGlow 6s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* ====== LAYER 1 — Gradient Overlay ====== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(10,15,30,0.6) 0%, rgba(10,15,30,0.3) 50%, rgba(10,15,30,0.1) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* ====== LAYER 2 — DOM Content ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: `clamp(80px, 10vh, 120px) clamp(20px, 5vw, 80px)`,
        }}
      >
        {/* ---- 1. Badge ---- */}
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={show ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.2, ease: EASE_OUT_EXPO }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(86,184,222,0.2)',
            borderRadius: 999,
            color: 'rgba(255,255,255,0.8)',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 32,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#34D399',
              display: 'inline-block',
              flexShrink: 0,
              animation: 'badgePulse 2s ease-in-out infinite',
            }}
          />
          <span>E-COMMERCE GROWTH AGENCY — €1B+ PORTFOLIO REVENUE</span>
        </motion.div>

        {/* ---- 2. Headline ---- */}
        <h1
          ref={headlineRef}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(42px, 7vw, 96px)',
            lineHeight: 0.95,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            textAlign: 'center',
            margin: 0,
            transform:
              !isMobile && !isTablet
                ? `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
                : undefined,
            transition: 'transform 150ms ease-out',
          }}
        >
          {/* Line 1 */}
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT_EXPO }}
            style={{ display: 'block' }}
          >
            E-Commerce Brands
          </motion.span>

          {/* Line 2 */}
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.55, ease: EASE_OUT_EXPO }}
            style={{ display: 'block' }}
          >
            wachsen mit uns
          </motion.span>

          {/* Line 3 — character stagger with gradient shimmer */}
          <span
            style={{
              display: 'block',
              background:
                'linear-gradient(135deg, #56B8DE 0%, #2E9AC4 40%, #1B7EA6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              backgroundSize: '200% 100%',
              animation: show ? 'headlineShimmer 4s ease-in-out infinite' : 'none',
            }}
          >
            {gradientWord.split('').map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={show ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.3,
                  delay: 0.7 + i * 0.025,
                  ease: EASE_OUT_EXPO,
                }}
                style={{
                  display: 'inline-block',
                  // Preserve space for whitespace characters
                  ...(char === ' ' ? { width: '0.25em' } : {}),
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        </h1>

        {/* ---- 3. Subheadline ---- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.9, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            lineHeight: 1.65,
            color: 'rgba(255,255,255,0.7)',
            maxWidth: 600,
            textAlign: 'center',
            marginTop: 24,
          }}
        >
          Die führende DACH-Agentur für Shopify, Amazon &amp; D2C-Wachstum.
          Datengetrieben. Performance-fokussiert. Ergebnis-besessen.
        </motion.p>

        {/* ---- 4. CTA Buttons ---- */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            ...(isMobile
              ? { flexDirection: 'column', width: '100%' }
              : {}),
          }}
        >
          {/* Primary CTA (Magnetic) */}
          <MagneticCTA show={show} isMobile={isMobile || isTablet} />

          {/* Secondary CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.1, ease: EASE_OUT_EXPO }}
          >
            <SecondaryCTA isMobile={isMobile} />
          </motion.div>
        </div>

        {/* ---- 5. Metric Cards ---- */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              isMobile || isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: 16,
            maxWidth: 900,
            width: '100%',
            marginTop: 56,
          }}
        >
          {METRICS.map((metric, i) => (
            <MetricCard
              key={metric.label}
              metric={metric}
              index={i}
              show={show}
              isMobile={isMobile}
            />
          ))}
        </div>

        {/* ---- 6. Partner Badges ---- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.8, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 24,
            marginTop: 40,
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {HERO_PARTNERS.map((partner) => (
            <span
              key={partner}
              className="hero-partner-badge"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 9,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                transition: 'opacity 300ms ease',
                cursor: 'default',
              }}
            >
              {partner}
            </span>
          ))}
        </motion.div>
      </div>

      {/* ---- 7. Scroll Indicator ---- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: scrollIndicatorOpacity } : {}}
        transition={{ duration: 0.5, delay: 2.0, ease: EASE_OUT_EXPO }}
        style={{
          position: 'absolute',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          zIndex: 2,
          animation: 'scrollBounce 2s ease-in-out infinite',
        }}
      >
        <svg
          width={18}
          height={18}
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
          }}
        >
          SCROLL
        </span>
      </motion.div>

      {/* ====== Keyframe Animations (injected via style tag) ====== */}
      <style jsx global>{`
        @keyframes badgePulse {
          0%,
          100% {
            opacity: 1;
            box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
          }
          50% {
            opacity: 0.7;
            box-shadow: 0 0 12px rgba(52, 211, 153, 0.9);
          }
        }

        @keyframes headlineShimmer {
          0% {
            background-position: 100% center;
          }
          50% {
            background-position: 0% center;
          }
          100% {
            background-position: 100% center;
          }
        }

        @keyframes mobileGlow {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        @keyframes scrollBounce {
          0%,
          100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(6px);
          }
        }

        .hero-partner-badge:hover {
          opacity: 0.8 !important;
          color: rgba(255, 255, 255, 0.7) !important;
        }
      `}</style>
    </section>
  )
}

/* ---- Secondary CTA Button ---- */
function SecondaryCTA({ isMobile }: { isMobile: boolean }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <a
      href="#cases"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 32px',
        background: isHovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: 'rgba(255,255,255,0.85)',
        borderRadius: 12,
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
        fontSize: 15,
        textDecoration: 'none',
        cursor: 'pointer',
        border: isHovered
          ? '1px solid rgba(86,184,222,0.5)'
          : '1px solid rgba(255,255,255,0.2)',
        transition: 'all 300ms ease',
        ...(isMobile ? { width: '100%' } : {}),
      }}
    >
      Erfolgsgeschichten ansehen →
    </a>
  )
}
