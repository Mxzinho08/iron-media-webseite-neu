'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { NAV_ITEMS } from '@/lib/constants'

// ── Transition presets ─────────────────────────────────────────
const springSnappy = { type: 'spring' as const, stiffness: 400, damping: 30 }
const springGentle = { type: 'spring' as const, stiffness: 300, damping: 25 }
const easeSmoothOut = [0.22, 1, 0.36, 1] as const

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

// ── Nav Link with animated underline ───────────────────────────
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
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.06, ease: easeSmoothOut }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        fontFamily: 'var(--font-display)',
        fontSize: 14,
        fontWeight: 400,
        color: hovered ? '#1A1A2E' : '#4A5568',
        textDecoration: 'none',
        transition: 'color 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        paddingBottom: 4,
      }}
    >
      {label}
      <span
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 1.5,
          background: '#2E9AC4',
          borderRadius: 1,
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: 'center',
          transition: 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
    </motion.a>
  )
}

// ── CTA Button ─────────────────────────────────────────────────
function CTAButton({
  onClick,
  style: styleProp,
}: {
  onClick?: () => void
  style?: React.CSSProperties
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.a
      href="#contact"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        y: isHovered ? -1 : 0,
      }}
      transition={{ duration: 0.25, ease: easeSmoothOut }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 20px',
        background: isHovered ? '#2E9AC4' : '#1A1A2E',
        color: '#FFFFFF',
        borderRadius: 8,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 13,
        textDecoration: 'none',
        border: 'none',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'background 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
        ...styleProp,
      }}
    >
      Kostenloses Audit
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
            ? { rotate: -45, y: -6.5, background: '#1A1A2E' }
            : { rotate: 0, y: 0, background: '#1A1A2E' }
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
      {/* ── Fixed Navigation Bar ──────────────────────── */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: scrolled ? 'rgba(255, 255, 255, 0.8)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(226, 232, 240, 0.5)'
            : '1px solid transparent',
          boxShadow: scrolled ? '0 1px 3px rgba(27, 126, 166, 0.04)' : 'none',
          padding: '16px clamp(24px, 5vw, 80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        className="max-md:!px-6"
      >
        {/* ── Left: Logo ──────────────────────────────── */}
        <motion.a
          href="#"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: easeSmoothOut }}
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
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 18,
                color: '#1A1A2E',
                letterSpacing: '-0.02em',
              }}
            >
              IRON
            </span>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 300,
                fontSize: 10,
                color: '#666666',
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
              delay: 0.2 + NAV_ITEMS.length * 0.06,
              ease: easeSmoothOut,
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
              background: 'rgba(255, 255, 255, 0.98)',
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
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 500,
                    color: '#1A1A2E',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease',
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
