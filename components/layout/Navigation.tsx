'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { NAV_ITEMS } from '@/lib/constants'

// ── Logo Bar Component ─────────────────────────────────────────
function LogoBars({ hovered }: { hovered: boolean }) {
  const bars = [
    { color: '#56B8DE', brightColor: '#7ACBE8', height: 14, delay: 0 },
    { color: '#2E9AC4', brightColor: '#4CB0D6', height: 20, delay: 0.04 },
    { color: '#1B7EA6', brightColor: '#2A96C2', height: 16, delay: 0.08 },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          animate={
            hovered
              ? { scale: 1.05, backgroundColor: bar.brightColor }
              : { scale: 1, backgroundColor: bar.color }
          }
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 25,
            delay: hovered ? bar.delay : 0,
          }}
          style={{
            width: 3,
            height: bar.height,
            backgroundColor: bar.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  )
}

// ── Nav Link with gradient underline ───────────────────────────
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
      transition={{ duration: 0.45, delay: 0.12 + index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        fontFamily: 'var(--font-display)',
        fontSize: 13,
        fontWeight: 500,
        color: hovered ? '#2E9AC4' : '#4A5568',
        textDecoration: 'none',
        letterSpacing: hovered ? '0.03em' : '0.01em',
        transition: 'color 200ms ease-out, letter-spacing 150ms ease-out',
        paddingBottom: 6,
        cursor: 'pointer',
      }}
    >
      {label}
      {/* Gradient underline */}
      <span
        style={{
          position: 'absolute',
          bottom: -4,
          left: 0,
          height: 2,
          width: hovered ? '100%' : '0%',
          background: 'linear-gradient(90deg, #56B8DE, #2E9AC4, #1B7EA6)',
          borderRadius: 1,
          transition: 'width 250ms ease-out',
          transformOrigin: hovered ? 'left' : 'right',
        }}
      />
    </motion.a>
  )
}

// ── CTA Button with magnetic effect + shimmer ──────────────────
function CTAButton({
  onClick,
  style: styleProp,
}: {
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [shimmerActive, setShimmerActive] = useState(false)
  const buttonRef = useRef<HTMLAnchorElement>(null)
  const [magnetOffset, setMagnetOffset] = useState({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const isDesktopRef = useRef(true)

  // Check if desktop
  useEffect(() => {
    const checkDesktop = () => {
      isDesktopRef.current = window.innerWidth >= 768
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop, { passive: true })
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Magnetic effect — track mouse relative to button
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDesktopRef.current || !buttonRef.current) return

      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const dist = Math.sqrt(distX * distX + distY * distY)

      if (dist < 100) {
        const factor = 0.15
        const maxTranslate = 6
        const rawX = distX * factor
        const rawY = distY * factor
        setMagnetOffset({
          x: Math.max(-maxTranslate, Math.min(maxTranslate, rawX)),
          y: Math.max(-maxTranslate, Math.min(maxTranslate, rawY)),
        })
      } else {
        setMagnetOffset((prev) => {
          if (prev.x === 0 && prev.y === 0) return prev
          return { x: prev.x * 0.9, y: prev.y * 0.9 }
        })
      }
    }

    // Use rAF-throttled mousemove
    const throttledHandler = (e: MouseEvent) => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        handleMouseMove(e)
        rafRef.current = null
      })
    }

    window.addEventListener('mousemove', throttledHandler, { passive: true })
    return () => {
      window.removeEventListener('mousemove', throttledHandler)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // Trigger shimmer on hover
  useEffect(() => {
    if (isHovered) {
      setShimmerActive(true)
      const timeout = setTimeout(() => setShimmerActive(false), 600)
      return () => clearTimeout(timeout)
    }
  }, [isHovered])

  return (
    <motion.a
      ref={buttonRef}
      href="#contact"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setMagnetOffset({ x: 0, y: 0 })
      }}
      animate={{
        x: magnetOffset.x,
        y: isHovered ? magnetOffset.y - 1 : magnetOffset.y,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 24px',
        background: '#1A1A2E',
        color: '#FFFFFF',
        borderRadius: 999,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 12,
        letterSpacing: '0.05em',
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        boxShadow: isHovered
          ? '0 6px 20px rgba(46,154,196,0.3)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 300ms ease-out',
        ...styleProp,
      }}
    >
      {/* Shimmer streak */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
          transform: shimmerActive ? 'translateX(100%)' : 'translateX(-100%)',
          transition: shimmerActive ? 'transform 600ms ease-out' : 'none',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>Kostenloses Audit</span>
    </motion.a>
  )
}

// ── Hamburger / Close Button ───────────────────────────────────
function HamburgerButton({
  isOpen,
  toggle,
}: {
  isOpen: boolean
  toggle: () => void
}) {
  const lineBase: React.CSSProperties = {
    display: 'block',
    width: 20,
    height: 1.5,
    background: '#1A1A2E',
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
            ? { rotate: 45, y: 6.5, background: '#1A1A2E' }
            : { rotate: 0, y: 0, background: '#1A1A2E' }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={lineBase}
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        style={lineBase}
      />
      <motion.span
        animate={
          isOpen
            ? { rotate: -45, y: -6.5, background: '#1A1A2E' }
            : { rotate: 0, y: 0, background: '#1A1A2E' }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={lineBase}
      />
    </button>
  )
}

// ── Main Navigation ────────────────────────────────────────────
export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  // Scroll detection (past 50px)
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
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
      {/* ── Fixed wrapper — positions the floating pill ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'center',
          padding: '16px 16px 0 16px',
          pointerEvents: 'none',
        }}
      >
        {/* ── Floating Pill Container ──────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: 800,
            borderRadius: 999,
            padding: '12px 8px 12px 20px',
            background: scrolled ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: scrolled
              ? '1px solid rgba(46,154,196,0.14)'
              : '1px solid rgba(46,154,196,0.08)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(27,126,166,0.1)'
              : '0 4px 24px rgba(27,126,166,0.06)',
            transition: 'background 300ms ease, box-shadow 300ms ease, border-color 300ms ease',
            pointerEvents: 'auto',
          }}
        >
          {/* ── Left: Logo ──────────────────────────────── */}
          <motion.a
            href="#"
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <LogoBars hovered={logoHovered} />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                color: '#1A1A2E',
                letterSpacing: '0.08em',
              }}
            >
              IRON
            </span>
          </motion.a>

          {/* ── Center: Nav Links (desktop) ────────────── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 32,
            }}
            className="hidden md:flex"
          >
            {NAV_ITEMS.map((item, i) => (
              <NavLink key={item.href} label={item.label} href={item.href} index={i} />
            ))}
          </div>

          {/* ── Right: CTA (desktop) + Hamburger (mobile) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div className="hidden md:block">
              <CTAButton />
            </div>
            <div className="md:hidden">
              <HamburgerButton
                isOpen={mobileOpen}
                toggle={() => setMobileOpen((v) => !v)}
              />
            </div>
          </div>
        </div>
      </motion.nav>

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
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
            }}
          >
            {/* Close button (X) — top right */}
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={closeMobile}
              aria-label="Close menu"
              style={{
                position: 'absolute',
                top: 24,
                right: 24,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 24,
                color: '#1A1A2E',
                fontWeight: 300,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="#1A1A2E"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </svg>
            </motion.button>

            {/* Staggered nav items */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 36,
                marginBottom: 48,
              }}
            >
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobile}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                    delay: 0.06 + i * 0.07,
                  }}
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 500,
                    color: '#1A1A2E',
                    textDecoration: 'none',
                    letterSpacing: '0.01em',
                    transition: 'color 200ms ease-out',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#2E9AC4'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#1A1A2E'
                  }}
                >
                  {item.label}
                </motion.a>
              ))}
            </div>

            {/* CTA at bottom */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
                delay: 0.06 + NAV_ITEMS.length * 0.07,
              }}
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
