'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { PARTNERS } from '@/lib/constants'

// ── Spring transition presets ──────────────────────────────────
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 30 }
const springGentle = { type: 'spring' as const, stiffness: 300, damping: 25 }

// ── Keyframe styles injected once ──────────────────────────────
const KEYFRAMES_ID = 'nav-keyframes'

function useInjectKeyframes() {
  useEffect(() => {
    if (document.getElementById(KEYFRAMES_ID)) return
    const style = document.createElement('style')
    style.id = KEYFRAMES_ID
    style.textContent = `
      @keyframes glowPulse {
        0%, 100% {
          box-shadow:
            0 0 20px rgba(46,154,196,0.12),
            0 0 40px rgba(46,154,196,0.06),
            inset 0 0 20px rgba(46,154,196,0.04);
        }
        50% {
          box-shadow:
            0 0 25px rgba(46,154,196,0.18),
            0 0 50px rgba(46,154,196,0.10),
            inset 0 0 25px rgba(46,154,196,0.06);
        }
      }
      @keyframes marquee {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `
    document.head.appendChild(style)
    return () => {
      style.remove()
    }
  }, [])
}

// ── Logo Bar Component ─────────────────────────────────────────
function LogoBars({ hovered }: { hovered: boolean }) {
  const bars = [
    { color: '#56B8DE', height: 22, delay: 0.04 },
    { color: '#2E9AC4', height: 30, delay: 0 },
    { color: '#1B7EA6', height: 24, delay: 0.04 },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={hovered ? { y: i === 1 ? -3 : -2 } : { y: 0 }}
          transition={{ ...springSnappy, delay: hovered ? bar.delay : 0 }}
          style={{
            width: 4,
            height: bar.height,
            background: bar.color,
            borderRadius: 999,
          }}
        />
      ))}
    </div>
  )
}

// ── CTA Button with cursor-tracking spotlight ─────────────────
function CTAButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    },
    []
  )

  return (
    <motion.a
      ref={buttonRef}
      href="#contact"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      whileHover={{ scale: 1.03 }}
      animate={isPressed ? { scale: 0.97 } : {}}
      transition={{ ...springSnappy, duration: isPressed ? 0.1 : undefined }}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 28px',
        background: 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
        color: '#FFFFFF',
        borderRadius: 8,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: 13,
        letterSpacing: '0.02em',
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        boxShadow: isHovered
          ? '0 8px 32px rgba(27,126,166,0.25), 0 2px 8px rgba(46,154,196,0.15)'
          : '0 4px 16px rgba(27,126,166,0.12)',
        transition: 'box-shadow 0.3s ease',
      }}
    >
      {/* Cursor-tracking spotlight */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(circle 80px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.25), transparent 70%)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>
        Erstgespr&auml;ch vereinbaren
      </span>
    </motion.a>
  )
}

// ── Hamburger Button ───────────────────────────────────────────
function HamburgerButton({
  isOpen,
  toggle,
}: {
  isOpen: boolean
  toggle: () => void
}) {
  const lineStyle: React.CSSProperties = {
    display: 'block',
    width: 20,
    height: 1.5,
    background: '#FFFFFF',
    borderRadius: 999,
  }

  return (
    <button
      onClick={toggle}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
      aria-expanded={isOpen}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        padding: 8,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <motion.span
        animate={
          isOpen
            ? { rotate: 45, y: 6.5, background: '#FFFFFF' }
            : { rotate: 0, y: 0, background: '#FFFFFF' }
        }
        transition={springSnappy}
        style={lineStyle}
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        style={lineStyle}
      />
      <motion.span
        animate={
          isOpen
            ? { rotate: -45, y: -6.5, background: '#FFFFFF' }
            : { rotate: 0, y: 0, background: '#FFFFFF' }
        }
        transition={springSnappy}
        style={lineStyle}
      />
    </button>
  )
}

// ── Partner Marquee Slider ─────────────────────────────────────
function PartnerSlider() {
  const doubled = [...PARTNERS, ...PARTNERS]

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        borderTop: '1px solid rgba(46, 154, 196, 0.1)',
        borderRadius: '0 0 16px 16px',
        padding: '8px 0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 24,
          whiteSpace: 'nowrap',
          animation: 'marquee 20s linear infinite',
          width: 'max-content',
        }}
      >
        {doubled.map((partner, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 11,
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            {partner.name}
            <span style={{ opacity: 0.6 }}>{partner.subtitle}</span>
            <span style={{ opacity: 0.3 }}>·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Main Navigation ────────────────────────────────────────────
export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  useInjectKeyframes()

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const closeMobile = useCallback(() => setMobileOpen(false), [])

  return (
    <>
      {/* ── Floating Pill Navigation ──────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'fixed',
          top: 16,
          left: 24,
          right: 24,
          zIndex: 100,
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {/* Main nav bar */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 32px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(46, 154, 196, 0.25)',
            borderBottom: 'none',
            borderRadius: '16px 16px 0 0',
            animation: 'glowPulse 4s ease-in-out infinite',
          }}
          className="max-md:!px-5"
        >
          {/* ── Left: Logo ──────────────────────────────── */}
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <LogoBars hovered={logoHovered} />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                lineHeight: 1,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                }}
              >
                IRON
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 400,
                  fontSize: 10,
                  color: 'rgba(255, 255, 255, 0.6)',
                  letterSpacing: '0.35em',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}
              >
                MEDIA
              </span>
            </div>
          </motion.a>

          {/* ── Right: CTA (desktop) + Hamburger (mobile) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <CTAButton />
            </motion.div>

            <div className="md:hidden">
              <HamburgerButton
                isOpen={mobileOpen}
                toggle={() => setMobileOpen((v) => !v)}
              />
            </div>
          </div>
        </nav>

        {/* ── Partner Showcase Slider ─────────────────── */}
        <PartnerSlider />
      </motion.div>

      {/* ── Mobile Menu Overlay ──────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10, 10, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* CTA centered */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ ...springGentle, delay: 0.05 }}
            >
              <CTAButton
                onClick={closeMobile}
                className="!text-[15px] !px-8 !py-3.5"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
