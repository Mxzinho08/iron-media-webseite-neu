'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NAV_ITEMS } from '@/lib/constants'

// ── Spring transition presets ──────────────────────────────────
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 30 }
const springGentle = { type: 'spring' as const, stiffness: 300, damping: 25 }

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

// ── Nav Link with hover underline ──────────────────────────────
function NavLink({
  label,
  href,
  index,
  onClick,
}: {
  label: string
  href: string
  index: number
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.a
      href={href}
      onClick={onClick}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        fontWeight: 500,
        color: hovered ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        transition: 'color 0.25s ease',
        paddingBottom: 4,
      }}
    >
      {label}
      <motion.span
        animate={{ width: hovered ? '100%' : '0%' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          height: 2,
          background: '#56B8DE',
          borderRadius: 1,
        }}
      />
    </motion.a>
  )
}

// ── CTA Button with cursor-tracking spotlight + magnetic effect ─
function CTAButton({
  onClick,
  style: styleProp,
}: {
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      const rect = e.currentTarget.getBoundingClientRect()
      // Spotlight position
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
      // Magnetic offset (±4px within element bounds)
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const dist = Math.sqrt(distX * distX + distY * distY)
      if (dist < 80) {
        setMagnetOffset({
          x: (distX / 80) * 4,
          y: (distY / 80) * 4,
        })
      }
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
        setMagnetOffset({ x: 0, y: 0 })
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      animate={{
        scale: isPressed ? 0.97 : isHovered ? 1.03 : 1,
        x: magnetOffset.x,
        y: magnetOffset.y,
      }}
      transition={{ ...springSnappy, duration: isPressed ? 0.1 : undefined }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 24px',
        background: isHovered ? '#56B8DE' : '#2E9AC4',
        color: '#FFFFFF',
        borderRadius: 8,
        fontFamily: 'var(--font-body)',
        fontWeight: 500,
        fontSize: 13,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        transition: 'background 0.3s ease',
        ...styleProp,
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
      <span style={{ position: 'relative', zIndex: 1 }}>Projekt starten</span>
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

// ── Main Navigation ────────────────────────────────────────────
export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  // Glassmorphism on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    // Check initial state
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
      {/* ── Full-Width Navigation Bar ──────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          height: 72,
          background: scrolled ? 'rgba(10, 15, 30, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(255, 255, 255, 0.08)'
            : '1px solid transparent',
          transition: 'all 0.4s ease',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '0 48px',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
          }}
          className="max-md:!px-6"
        >
          {/* ── Left: Logo ──────────────────────────────── */}
          <motion.a
            href="#"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            whileHover={{ scale: 1.04 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
              cursor: 'pointer',
              flexShrink: 0,
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

          {/* ── Center: Nav Links (desktop only) ────────── */}
          <div
            className="hidden md:flex"
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
          >
            {NAV_ITEMS.map((item, i) => (
              <NavLink key={item.href} label={item.label} href={item.href} index={i} />
            ))}
          </div>

          {/* ── Right: CTA (desktop) + Hamburger (mobile) ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
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
        </div>
      </nav>

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
              gap: 0,
              background: 'rgba(10, 10, 20, 0.95)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Nav links */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 32,
                marginBottom: 48,
              }}
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ ...springGentle, delay: 0.05 + i * 0.07 }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 24,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.85)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>

            {/* CTA at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ ...springGentle, delay: 0.05 + NAV_ITEMS.length * 0.07 }}
            >
              <CTAButton
                onClick={closeMobile}
                style={{ fontSize: 15, padding: '14px 32px' }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
