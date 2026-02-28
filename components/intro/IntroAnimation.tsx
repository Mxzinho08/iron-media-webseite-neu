'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { INTRO_LOGOS } from '@/lib/constants'

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
  textMuted: '#94A3B8',
} as const

const EASE_BOUNCY = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const EASE_FADE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const EASE_OUT_EXPO = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_MEDIA = 'cubic-bezier(0.25, 1, 0.5, 1)'

const IRON_LETTERS = ['I', 'R', 'O', 'N']

const PHASE1_WORDS: { text: string; row: 1 | 2; isLevel?: boolean }[] = [
  { text: 'We', row: 1 },
  { text: 'scale', row: 1 },
  { text: 'Ecom', row: 1 },
  { text: 'Brands', row: 1 },
  { text: 'aufs', row: 2 },
  { text: 'nächste', row: 2 },
  { text: 'Level', row: 2, isLevel: true },
]

const WORD_TIMINGS = [400, 500, 600, 700, 850, 950, 1050]

const KEYFRAMES_CSS = `
@keyframes wordBounce {
  0%   { opacity: 0; transform: translateY(-25px) scale(0.95); }
  50%  { opacity: 1; transform: translateY(5px) scale(1.02); }
  70%  { transform: translateY(-2px) scale(0.99); }
  85%  { transform: translateY(1px) scale(1.005); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes bounceInChar {
  0%   { opacity: 0; transform: translateY(-15px) scale(0.97); }
  60%  { opacity: 1; transform: translateY(2px) scale(1.01); }
  80%  { transform: translateY(-1px) scale(0.995); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes logoBounceIn {
  0%   { opacity: 0; transform: scale(0.4) translateY(10px); }
  60%  { opacity: 0.65; transform: scale(1.06) translateY(-1px); }
  80%  { transform: scale(0.97) translateY(0.5px); }
  100% { opacity: 0.65; transform: scale(1) translateY(0); }
}
@keyframes radialPulse {
  0%   { opacity: 1; transform: scale(0); }
  100% { opacity: 0; transform: scale(1.5); }
}
`

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Phase 1 refs
  const phase1Ref = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const levelUnderlineRef = useRef<HTMLSpanElement>(null)
  const trustedByRef = useRef<HTMLDivElement>(null)
  const logoRefs = useRef<(HTMLImageElement | null)[]>([])

  // Phase 2 refs
  const phase2Ref = useRef<HTMLDivElement>(null)
  const bar1Ref = useRef<HTMLDivElement>(null)
  const bar2Ref = useRef<HTMLDivElement>(null)
  const bar3Ref = useRef<HTMLDivElement>(null)
  const barsGroupRef = useRef<HTMLDivElement>(null)
  const ironLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mediaRef = useRef<HTMLDivElement>(null)
  const ironContainerRef = useRef<HTMLDivElement>(null)
  const radialPulseRef = useRef<HTMLDivElement>(null)

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
    if (!overlay) {
      onComplete()
      return
    }

    overlay.style.transition = `opacity 200ms ${EASE_FADE}`
    overlay.style.opacity = '0'

    const id = setTimeout(() => {
      overlay.style.display = 'none'
      onComplete()
    }, 210)
    timersRef.current.push(id)
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
    const phase1 = phase1Ref.current
    const phase2 = phase2Ref.current
    const levelUnderline = levelUnderlineRef.current
    const trustedBy = trustedByRef.current
    const bar1 = bar1Ref.current
    const bar2 = bar2Ref.current
    const bar3 = bar3Ref.current
    const barsGroup = barsGroupRef.current
    const media = mediaRef.current
    const ironContainer = ironContainerRef.current
    const radialPulse = radialPulseRef.current

    if (
      !phase1 || !phase2 || !levelUnderline || !trustedBy ||
      !bar1 || !bar2 || !bar3 || !barsGroup ||
      !media || !ironContainer || !radialPulse
    ) return

    // ═══════════════════════════════════════════
    // INITIAL STATES
    // ═══════════════════════════════════════════

    // Phase 1 words: hidden
    wordRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(-25px) scale(0.95)'
    })

    levelUnderline.style.transform = 'scaleX(0)'
    levelUnderline.style.transformOrigin = 'left center'
    trustedBy.style.opacity = '0'

    logoRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'scale(0.4) translateY(10px)'
    })

    // Phase 2: hidden
    phase2.style.opacity = '0'
    phase2.style.pointerEvents = 'none'
    bar1.style.opacity = '0'
    bar2.style.opacity = '0'
    bar3.style.opacity = '0'
    bar2.style.transform = 'translateY(-100vh)'
    bar1.style.transform = 'translateX(-50vw) rotate(-12deg)'
    bar3.style.transform = 'translateX(50vw) rotate(12deg)'

    ironLetterRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(-15px) scale(0.97)'
    })
    media.style.opacity = '0'
    media.style.letterSpacing = '0.8em'
    ironContainer.style.opacity = '1'

    radialPulse.style.opacity = '0'
    radialPulse.style.transform = 'scale(0)'

    // ═══════════════════════════════════════════
    // PHASE 1: Statement + Trusted By (T=0 -> T=2900ms)
    // ═══════════════════════════════════════════

    // Word-by-word Pixar bounce
    PHASE1_WORDS.forEach((_, i) => {
      schedule(() => {
        const el = wordRefs.current[i]
        if (!el) return
        el.style.animation = `wordBounce 500ms ${EASE_BOUNCY} forwards`
      }, WORD_TIMINGS[i])
    })

    // T=1200ms: Gradient underline on "Level" draws from left (300ms)
    schedule(() => {
      levelUnderline.style.transition = `transform 300ms ${EASE_BOUNCY}`
      levelUnderline.style.transform = 'scaleX(1)'
    }, 1200)

    // T=1600ms: "TRUSTED BY LEADING BRANDS" fades in
    schedule(() => {
      trustedBy.style.transition = 'opacity 400ms ease-out'
      trustedBy.style.opacity = '0.5'
    }, 1600)

    // T=1800ms: Brand logos bounce in with stagger (80ms apart)
    INTRO_LOGOS.forEach((_, i) => {
      schedule(() => {
        const el = logoRefs.current[i]
        if (!el) return
        el.style.animation = `logoBounceIn 450ms ${EASE_BOUNCY} forwards`
      }, 1800 + i * 80)
    })

    // T=2900ms: Everything fades out + scale(0.98)
    schedule(() => {
      phase1.style.transition = `opacity 300ms ${EASE_FADE}, transform 300ms ${EASE_FADE}`
      phase1.style.opacity = '0'
      phase1.style.transform = 'scale(0.98)'
    }, 2900)

    // ═══════════════════════════════════════════
    // PHASE 2: Logo Entrance (T=3200ms -> T=4700ms)
    // ═══════════════════════════════════════════

    // T=3200ms: Show phase 2 container
    schedule(() => {
      phase2.style.opacity = '1'
      phase2.style.pointerEvents = 'auto'
    }, 3200)

    // T=3400ms: Bar 2 (center, tallest) falls from top
    schedule(() => {
      bar2.style.opacity = '1'
      bar2.style.transition = `transform 400ms ${EASE_BOUNCY}`
      bar2.style.transform = 'translateY(0)'
    }, 3400)

    // Bar 2 squash & stretch on landing (T=3800)
    schedule(() => {
      bar2.style.transition = 'transform 120ms ease-out'
      bar2.style.transform = 'scaleY(0.65) scaleX(1.35)'
    }, 3800)
    schedule(() => {
      bar2.style.transition = 'transform 100ms ease-in-out'
      bar2.style.transform = 'scaleY(1.18) scaleX(0.88)'
    }, 3920)
    schedule(() => {
      bar2.style.transition = 'transform 80ms ease-in-out'
      bar2.style.transform = 'scaleY(0.94) scaleX(1.04)'
    }, 4020)
    schedule(() => {
      bar2.style.transition = 'transform 80ms ease-in-out'
      bar2.style.transform = 'scaleY(1.03) scaleX(0.98)'
    }, 4100)
    schedule(() => {
      bar2.style.transition = 'transform 80ms ease-out'
      bar2.style.transform = 'scaleY(1) scaleX(1)'
    }, 4180)

    // T=3650ms: Bar 1 flies from left with rotation
    schedule(() => {
      bar1.style.opacity = '1'
      bar1.style.transition = `transform 380ms ${EASE_BOUNCY}, opacity 150ms ease-out`
      bar1.style.transform = 'translateX(0) rotate(0deg)'
    }, 3650)

    // Bar 1 settle
    schedule(() => {
      bar1.style.transition = 'transform 80ms ease-out'
      bar1.style.transform = 'scaleX(1.08)'
    }, 4030)
    schedule(() => {
      bar1.style.transition = 'transform 70ms ease-in-out'
      bar1.style.transform = 'scaleX(0.97)'
    }, 4110)
    schedule(() => {
      bar1.style.transition = 'transform 60ms ease-out'
      bar1.style.transform = 'scaleX(1.0)'
    }, 4180)

    // T=3850ms: Bar 3 flies from right with rotation
    schedule(() => {
      bar3.style.opacity = '1'
      bar3.style.transition = `transform 380ms ${EASE_BOUNCY}, opacity 150ms ease-out`
      bar3.style.transform = 'translateX(0) rotate(0deg)'
    }, 3850)

    // Bar 3 settle
    schedule(() => {
      bar3.style.transition = 'transform 80ms ease-out'
      bar3.style.transform = 'scaleX(1.08)'
    }, 4230)
    schedule(() => {
      bar3.style.transition = 'transform 70ms ease-in-out'
      bar3.style.transform = 'scaleX(0.97)'
    }, 4310)
    schedule(() => {
      bar3.style.transition = 'transform 60ms ease-out'
      bar3.style.transform = 'scaleX(1.0)'
    }, 4380)

    // T=4100ms: Sync pulse on all bars
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = 'transform 125ms ease-in-out, box-shadow 125ms ease-in-out'
        bar.style.transform = 'scale(1.035)'
        bar.style.boxShadow = `0 0 24px ${COLORS.oceanBlue}40`
      })
    }, 4100)
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = 'transform 125ms ease-out, box-shadow 200ms ease-out'
        bar.style.transform = 'scale(1.0)'
        bar.style.boxShadow = '0 0 0px transparent'
      })
    }, 4225)

    // T=4200ms: "IRON" character stagger
    IRON_LETTERS.forEach((_, i) => {
      schedule(() => {
        const el = ironLetterRefs.current[i]
        if (!el) return
        el.style.animation = `bounceInChar 350ms ${EASE_BOUNCY} forwards`
      }, 4200 + i * 50)
    })

    // T=4400ms: "MEDIA" tracking animation
    schedule(() => {
      media.style.transition = `letter-spacing 400ms ${EASE_MEDIA}, opacity 400ms ${EASE_MEDIA}`
      media.style.opacity = '1'
      media.style.letterSpacing = '0.35em'
    }, 4400)

    // ═══════════════════════════════════════════
    // PHASE 3: Blur & Dissolve Outro (T=4700ms -> T=5500ms)
    // ═══════════════════════════════════════════

    // T=4700ms: "IRON" + "MEDIA" text fades out (200ms)
    schedule(() => {
      ironContainer.style.transition = `opacity 200ms ${EASE_FADE}`
      ironContainer.style.opacity = '0'
      media.style.transition = `opacity 200ms ${EASE_FADE}`
      media.style.opacity = '0'
    }, 4700)

    // T=4900ms: Bars gentle rotation + blur + staggered fade
    schedule(() => {
      bar1.style.transition = 'opacity 300ms ease-out, filter 400ms ease-out, transform 400ms ease-out'
      bar1.style.transform = 'rotate(5deg)'
      bar1.style.filter = 'blur(8px)'
      bar1.style.opacity = '0'
    }, 4900)

    schedule(() => {
      bar2.style.transition = 'opacity 300ms ease-out, filter 400ms ease-out, transform 400ms ease-out'
      bar2.style.transform = 'rotate(-3deg)'
      bar2.style.filter = 'blur(8px)'
      bar2.style.opacity = '0'
    }, 5000)

    schedule(() => {
      bar3.style.transition = 'opacity 300ms ease-out, filter 400ms ease-out, transform 400ms ease-out'
      bar3.style.transform = 'rotate(4deg)'
      bar3.style.filter = 'blur(8px)'
      bar3.style.opacity = '0'
    }, 5100)

    // T=5100ms: Subtle radial light pulse
    schedule(() => {
      radialPulse.style.animation = 'radialPulse 400ms ease-out forwards'
    }, 5100)

    // T=5200ms: Overlay background fades to transparent (300ms)
    schedule(() => {
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.transition = `opacity 300ms ${EASE_FADE}`
        overlay.style.opacity = '0'
      }
    }, 5200)

    // T=5500ms: onComplete, display: none
    schedule(() => {
      if (completedRef.current) return
      completedRef.current = true
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.display = 'none'
      }
      onComplete()
    }, 5500)
  }, [schedule, onComplete, finish])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────

  const baseFontSize = 'clamp(24px, 3.5vw, 44px)'

  const row1Words = PHASE1_WORDS.filter((w) => w.row === 1)
  const row2Words = PHASE1_WORDS.filter((w) => w.row === 2)

  const renderWord = (
    word: (typeof PHASE1_WORDS)[number],
    globalIndex: number,
  ) => {
    const isLevel = word.isLevel

    const wordStyle: React.CSSProperties = {
      display: 'inline-block',
      fontFamily: isLevel ? 'var(--font-accent)' : 'var(--font-display)',
      fontWeight: isLevel ? 400 : 700,
      fontSize: isLevel ? '130%' : undefined,
      position: isLevel ? 'relative' : undefined,
      opacity: 0,
      willChange: 'transform, opacity',
    }

    return (
      <span
        key={`word-${globalIndex}`}
        ref={(el) => {
          wordRefs.current[globalIndex] = el
        }}
        style={wordStyle}
      >
        {word.text}
        {isLevel && (
          <span
            ref={levelUnderlineRef}
            style={{
              position: 'absolute',
              bottom: '2px',
              left: 0,
              right: 0,
              height: '3px',
              borderRadius: '2px',
              background: `linear-gradient(90deg, ${COLORS.skyBlue}, ${COLORS.oceanBlue}, ${COLORS.deepTeal})`,
              willChange: 'transform',
            }}
          />
        )}
      </span>
    )
  }

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
        overflow: 'hidden',
      }}
    >
      {/* Global keyframes */}
      <style>{KEYFRAMES_CSS}</style>

      {/* ═══════ PHASE 1: Statement + Trusted By ═══════ */}
      <div
        ref={phase1Ref}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          willChange: 'opacity, transform',
        }}
      >
        {/* Word container - 2 rows */}
        <div
          style={{
            textAlign: 'center',
            fontSize: baseFontSize,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: COLORS.textDark,
          }}
        >
          {/* Row 1: "We scale Ecom Brands" */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'baseline',
              gap: '0.25em',
              flexWrap: 'wrap',
            }}
          >
            {row1Words.map((word) => {
              const globalIndex = PHASE1_WORDS.indexOf(word)
              return renderWord(word, globalIndex)
            })}
          </div>

          {/* Row 2: "aufs nächste Level" */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'baseline',
              gap: '0.25em',
              flexWrap: 'wrap',
              marginTop: '0.1em',
            }}
          >
            {row2Words.map((word) => {
              const globalIndex = PHASE1_WORDS.indexOf(word)
              return renderWord(word, globalIndex)
            })}
          </div>
        </div>

        {/* TRUSTED BY LEADING BRANDS */}
        <div
          ref={trustedByRef}
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: COLORS.textMuted,
            marginTop: '32px',
            willChange: 'opacity',
          }}
        >
          TRUSTED BY LEADING BRANDS
        </div>

        {/* Brand logos row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(20px, 3vw, 40px)',
            marginTop: '16px',
            flexWrap: 'wrap',
          }}
        >
          {INTRO_LOGOS.map((logo, i) => (
            <img
              key={logo.domain}
              ref={(el) => {
                logoRefs.current[i] = el
              }}
              src={`https://logo.clearbit.com/${logo.domain}`}
              alt={logo.name}
              style={{
                height: '22px',
                width: 'auto',
                opacity: 0,
                willChange: 'transform, opacity',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══════ PHASE 2 & 3: Logo Entrance + Blur Dissolve ═══════ */}
      <div
        ref={phase2Ref}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          willChange: 'opacity, transform',
        }}
      >
        {/* Bars container */}
        <div
          ref={barsGroupRef}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            willChange: 'transform, opacity',
          }}
        >
          {/* Bar 1 - Sky Blue */}
          <div
            ref={bar1Ref}
            style={{
              width: '22px',
              height: '120px',
              backgroundColor: COLORS.skyBlue,
              borderRadius: '999px',
              transformOrigin: 'center bottom',
              willChange: 'transform, opacity, filter',
            }}
          />
          {/* Bar 2 - Ocean Blue, tallest */}
          <div
            ref={bar2Ref}
            style={{
              width: '22px',
              height: '164px',
              backgroundColor: COLORS.oceanBlue,
              borderRadius: '999px',
              transformOrigin: 'center bottom',
              willChange: 'transform, opacity, filter',
            }}
          />
          {/* Bar 3 - Deep Teal */}
          <div
            ref={bar3Ref}
            style={{
              width: '22px',
              height: '132px',
              backgroundColor: COLORS.deepTeal,
              borderRadius: '999px',
              transformOrigin: 'center bottom',
              willChange: 'transform, opacity, filter',
            }}
          />
        </div>

        {/* IRON text */}
        <div
          ref={ironContainerRef}
          style={{
            display: 'flex',
            gap: '0.06em',
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            color: COLORS.textDark,
            fontSize: 'clamp(24px, 4vw, 48px)',
            lineHeight: 1,
            willChange: 'opacity',
          }}
        >
          {IRON_LETTERS.map((letter, i) => (
            <span
              key={`iron-${i}`}
              ref={(el) => {
                ironLetterRefs.current[i] = el
              }}
              style={{
                display: 'inline-block',
                willChange: 'transform, opacity',
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
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            color: COLORS.textMuted,
            fontSize: 'clamp(13px, 2.2vw, 26px)',
            textTransform: 'uppercase',
            lineHeight: 1,
            willChange: 'opacity, letter-spacing',
            marginTop: '-8px',
          }}
        >
          MEDIA
        </div>

        {/* Radial pulse div (for outro) */}
        <div
          ref={radialPulseRef}
          style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(46,154,196,0.15), transparent 70%)`,
            pointerEvents: 'none',
            opacity: 0,
            willChange: 'transform, opacity',
          }}
        />
      </div>
    </div>
  )
}

export default IntroAnimation
