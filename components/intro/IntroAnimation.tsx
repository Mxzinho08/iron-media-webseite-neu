'use client'

import React, { useEffect, useRef, useCallback } from 'react'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface IntroAnimationProps {
  onComplete: () => void
}

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const COLORS = {
  skyBlue: '#56B8DE',
  oceanBlue: '#2E9AC4',
  deepTeal: '#1B7EA6',
  background: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#4A5568',
} as const

const TOTAL_DURATION = 2500
const IRON_LETTERS = ['I', 'R', 'O', 'N']

const EASE_OUT_EXPO = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const EASE_TEXT = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_MEDIA = 'cubic-bezier(0.25, 1, 0.5, 1)'
const EASE_FADE = 'cubic-bezier(0.4, 0, 0.2, 1)'

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const bar1Ref = useRef<HTMLDivElement>(null)
  const bar2Ref = useRef<HTMLDivElement>(null)
  const bar3Ref = useRef<HTMLDivElement>(null)
  const barsGroupRef = useRef<HTMLDivElement>(null)
  const ironLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mediaRef = useRef<HTMLDivElement>(null)
  const shimmerRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  const schedule = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(fn, delay)
    timersRef.current.push(id)
    return id
  }, [])

  const finish = useCallback(() => {
    if (completedRef.current) return
    completedRef.current = true
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []

    const overlay = overlayRef.current
    if (!overlay) { onComplete(); return }

    overlay.style.transition = `opacity 300ms ${EASE_FADE}`
    overlay.style.opacity = '0'

    setTimeout(() => {
      overlay.style.display = 'none'
      onComplete()
    }, 310)
  }, [onComplete])

  // Skip on click or keypress
  useEffect(() => {
    const handleSkip = () => finish()
    window.addEventListener('click', handleSkip, { once: true })
    window.addEventListener('keydown', handleSkip, { once: true })
    return () => {
      window.removeEventListener('click', handleSkip)
      window.removeEventListener('keydown', handleSkip)
    }
  }, [finish])

  // Main animation sequence
  useEffect(() => {
    const bar1 = bar1Ref.current
    const bar2 = bar2Ref.current
    const bar3 = bar3Ref.current
    const barsGroup = barsGroupRef.current
    const media = mediaRef.current
    const shimmer = shimmerRef.current
    const overlay = overlayRef.current

    if (!bar1 || !bar2 || !bar3 || !barsGroup || !media || !shimmer || !overlay) return

    // ── Initial states ──
    bar2.style.transform = 'translateY(-100vh) scaleY(1.15) scaleX(0.92)'
    bar1.style.transform = 'translateX(-60vw) rotate(-5deg)'
    bar1.style.opacity = '0'
    bar3.style.transform = 'translateX(60vw) rotate(5deg)'
    bar3.style.opacity = '0'

    ironLetterRefs.current.forEach(el => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(15px)'
      el.style.filter = 'blur(4px)'
    })

    media.style.opacity = '0'
    media.style.letterSpacing = '-0.2em'
    media.style.transform = 'scaleX(0.7)'

    shimmer.style.opacity = '0'

    // ── T=100-400ms: Bar 2 drops from top ──
    schedule(() => {
      bar2.style.transition = `transform 300ms ${EASE_OUT_EXPO}`
      bar2.style.transform = 'translateY(0) scaleY(1.0) scaleX(1.0)'

      // Background pulse
      overlay.style.transition = 'background-color 75ms ease-in'
      overlay.style.backgroundColor = 'rgba(46,154,196,0.03)'
      schedule(() => {
        overlay.style.transition = 'background-color 75ms ease-out'
        overlay.style.backgroundColor = '#FFFFFF'
      }, 75)
    }, 100)

    // ── T=400ms: Bar 2 squash & stretch on land ──
    schedule(() => {
      bar2.style.transition = `transform 80ms ${EASE_OVERSHOOT}`
      bar2.style.transform = 'scaleX(1.25) scaleY(0.78)'
    }, 400)

    schedule(() => {
      bar2.style.transition = `transform 80ms ${EASE_OVERSHOOT}`
      bar2.style.transform = 'scaleX(0.95) scaleY(1.06)'
    }, 480)

    schedule(() => {
      bar2.style.transition = `transform 80ms ${EASE_OVERSHOOT}`
      bar2.style.transform = 'scaleX(1.0) scaleY(1.0)'
    }, 560)

    // ── T=350-650ms: Bar 1 flies in from left ──
    schedule(() => {
      bar1.style.transition = `transform 300ms ${EASE_OUT_EXPO}, opacity 300ms ${EASE_OUT_EXPO}`
      bar1.style.transform = 'translateX(0) rotate(0deg)'
      bar1.style.opacity = '1'
    }, 350)

    // Bar 1 settle: scaleX bounce
    schedule(() => {
      bar1.style.transition = `transform 70ms ease-out`
      bar1.style.transform = 'scaleX(1.08)'
    }, 650)
    schedule(() => {
      bar1.style.transition = `transform 65ms ease-in-out`
      bar1.style.transform = 'scaleX(0.97)'
    }, 720)
    schedule(() => {
      bar1.style.transition = `transform 65ms ease-out`
      bar1.style.transform = 'scaleX(1.0)'
    }, 785)

    // ── T=500-800ms: Bar 3 flies in from right ──
    schedule(() => {
      bar3.style.transition = `transform 300ms ${EASE_OUT_EXPO}, opacity 300ms ${EASE_OUT_EXPO}`
      bar3.style.transform = 'translateX(0) rotate(0deg)'
      bar3.style.opacity = '1'
    }, 500)

    // Bar 3 settle
    schedule(() => {
      bar3.style.transition = `transform 70ms ease-out`
      bar3.style.transform = 'scaleX(1.08)'
    }, 800)
    schedule(() => {
      bar3.style.transition = `transform 65ms ease-in-out`
      bar3.style.transform = 'scaleX(0.97)'
    }, 870)
    schedule(() => {
      bar3.style.transition = `transform 65ms ease-out`
      bar3.style.transform = 'scaleX(1.0)'
    }, 935)

    // ── T=800-900ms: All bars sync pulse ──
    schedule(() => {
      barsGroup.style.transition = 'transform 50ms ease-in'
      barsGroup.style.transform = 'scale(1.03)'
    }, 800)
    schedule(() => {
      barsGroup.style.transition = 'transform 50ms ease-out'
      barsGroup.style.transform = 'scale(1.0)'
    }, 850)

    // ── T=900-1500ms: Text reveal ──
    // IRON letters, staggered
    IRON_LETTERS.forEach((_, i) => {
      schedule(() => {
        const el = ironLetterRefs.current[i]
        if (!el) return
        el.style.transition = `opacity 350ms ${EASE_TEXT}, transform 350ms ${EASE_TEXT}, filter 350ms ${EASE_TEXT}`
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        el.style.filter = 'blur(0px)'
      }, 900 + i * 50)
    })

    // MEDIA text at T=1050ms
    schedule(() => {
      media.style.transition = `opacity 500ms ${EASE_MEDIA}, letter-spacing 500ms ${EASE_MEDIA}, transform 500ms ${EASE_MEDIA}`
      media.style.opacity = '1'
      media.style.letterSpacing = '0.42em'
      media.style.transform = 'scaleX(1.0)'
    }, 1050)

    // ── T=1500-2000ms: Shimmer sweep across bars ──
    schedule(() => {
      shimmer.style.opacity = '1'
      shimmer.style.transition = 'none'
      shimmer.style.backgroundPosition = '200% center'

      requestAnimationFrame(() => {
        shimmer.style.transition = 'background-position 600ms linear'
        shimmer.style.backgroundPosition = '-200% center'
      })
    }, 1500)

    schedule(() => {
      shimmer.style.opacity = '0'
    }, 2100)

    // ── T=2000-2500ms: Fade out ──
    schedule(() => {
      if (completedRef.current) return
      completedRef.current = true

      const logoGroup = barsGroup.parentElement
      if (logoGroup) {
        logoGroup.style.transition = `transform 500ms ${EASE_FADE}`
        logoGroup.style.transform = 'scale(1.05)'
      }

      overlay.style.transition = `opacity 500ms ${EASE_FADE}`
      overlay.style.opacity = '0'
    }, 2000)

    schedule(() => {
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none'
      }
      onComplete()
    }, 2500)

    // Cleanup
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [schedule, onComplete, finish])

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'opacity',
      }}
    >
      {/* Logo group: bars + text, centered */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Bars container */}
        <div
          ref={barsGroupRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            willChange: 'transform',
            position: 'relative',
          }}
        >
          {/* Bar 1 - Sky Blue, shortest */}
          <div
            ref={bar1Ref}
            style={{
              width: '10px',
              height: '55px',
              backgroundColor: COLORS.skyBlue,
              borderRadius: '999px',
              willChange: 'transform, opacity',
            }}
          />
          {/* Bar 2 - Ocean Blue, tallest */}
          <div
            ref={bar2Ref}
            style={{
              width: '10px',
              height: '75px',
              backgroundColor: COLORS.oceanBlue,
              borderRadius: '999px',
              willChange: 'transform, opacity',
            }}
          />
          {/* Bar 3 - Deep Teal, medium */}
          <div
            ref={bar3Ref}
            style={{
              width: '10px',
              height: '60px',
              backgroundColor: COLORS.deepTeal,
              borderRadius: '999px',
              willChange: 'transform, opacity',
            }}
          />

          {/* Shimmer overlay on bars */}
          <div
            ref={shimmerRef}
            style={{
              position: 'absolute',
              inset: '-4px -2px',
              borderRadius: '999px',
              pointerEvents: 'none',
              opacity: 0,
              background:
                'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.4) 55%, transparent 65%)',
              backgroundSize: '200% 100%',
              backgroundPosition: '200% center',
              mixBlendMode: 'overlay',
              willChange: 'background-position, opacity',
            }}
          />
        </div>

        {/* IRON text */}
        <div
          style={{
            display: 'flex',
            gap: '0.08em',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: COLORS.textDark,
            letterSpacing: '0.08em',
            fontSize: 'clamp(24px, 4vw, 48px)',
            lineHeight: 1,
          }}
        >
          {IRON_LETTERS.map((letter, i) => (
            <span
              key={letter + i}
              ref={el => { ironLetterRefs.current[i] = el }}
              style={{
                display: 'inline-block',
                willChange: 'transform, opacity, filter',
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* MEDIA text */}
        <div
          ref={mediaRef}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            color: COLORS.textMuted,
            fontSize: 'clamp(10px, 1.5vw, 16px)',
            textTransform: 'uppercase',
            lineHeight: 1,
            willChange: 'transform, opacity, letter-spacing',
            marginTop: '-8px',
          }}
        >
          MEDIA
        </div>
      </div>
    </div>
  )
}

export default IntroAnimation
