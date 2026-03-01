'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import { INTRO_BRANDS } from '@/lib/constants'

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

const EASE_BOUNCY = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_FADE = 'cubic-bezier(0.4, 0, 0.2, 1)'
const EASE_MEDIA = 'cubic-bezier(0.25, 1, 0.5, 1)'

const IRON_LETTERS = ['I', 'R', 'O', 'N']

const PHASE1_WORDS: { text: string; row: 1 | 2 }[] = [
  { text: 'We', row: 1 },
  { text: 'scale', row: 1 },
  { text: 'Ecom', row: 1 },
  { text: 'brands', row: 1 },
  { text: 'to', row: 2 },
  { text: 'the', row: 2 },
  { text: 'next', row: 2 },
  { text: 'level', row: 2 },
]

// Timings: start at 300ms, stagger 80ms apart
const WORD_TIMINGS = [300, 380, 460, 540, 620, 700, 780, 860]

const KEYFRAMES_CSS = `
@keyframes wordBounce {
  0%   { opacity: 0; transform: translateY(-20px); }
  65%  { opacity: 1; transform: translateY(2px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes bounceInChar {
  0%   { opacity: 0; transform: translateY(-12px); }
  65%  { opacity: 1; transform: translateY(1px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes logoBounceIn {
  0%   { opacity: 0; transform: translateY(8px) scale(0.96); }
  65%  { opacity: 1; transform: translateY(-1px) scale(1.01); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
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
  const textBlockRef = useRef<HTMLDivElement>(null)
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const levelUnderlineRef = useRef<HTMLSpanElement>(null)
  const logoRefs = useRef<(HTMLElement | null)[]>([])

  // Phase 2 refs (logo appears ABOVE the text)
  const logoGroupRef = useRef<HTMLDivElement>(null)
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
    const textBlock = textBlockRef.current
    const levelUnderline = levelUnderlineRef.current
    const logoGroup = logoGroupRef.current
    const bar1 = bar1Ref.current
    const bar2 = bar2Ref.current
    const bar3 = bar3Ref.current
    const barsGroup = barsGroupRef.current
    const media = mediaRef.current
    const ironContainer = ironContainerRef.current
    const radialPulse = radialPulseRef.current

    if (
      !phase1 || !textBlock || !levelUnderline || !logoGroup ||
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
      el.style.transform = 'translateY(-20px)'
    })

    levelUnderline.style.transform = 'scaleX(0)'
    levelUnderline.style.transformOrigin = 'left center'

    logoRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(8px) scale(0.96)'
    })

    // Logo group (Iron Media bars + text): hidden above
    logoGroup.style.opacity = '0'
    logoGroup.style.transform = 'translateY(-20px) scale(0.95)'

    bar1.style.opacity = '0'
    bar2.style.opacity = '0'
    bar3.style.opacity = '0'
    bar2.style.transform = 'translateY(-40px)'
    bar1.style.transform = 'translateX(-30px) rotate(-8deg)'
    bar3.style.transform = 'translateX(30px) rotate(8deg)'

    ironLetterRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(-12px) scale(0.97)'
    })
    media.style.opacity = '0'
    media.style.letterSpacing = '0.8em'
    ironContainer.style.opacity = '1'

    radialPulse.style.opacity = '0'
    radialPulse.style.transform = 'scale(0)'

    // ═══════════════════════════════════════════
    // PHASE 1: Statement + Brands (T=0 -> T=2200ms)
    // Words at 300ms, stagger 80ms
    // Underline at 900ms
    // Brand logos at 1300ms
    // Phase 1 fadeout at 2200ms
    // ═══════════════════════════════════════════

    // Word-by-word bounce
    PHASE1_WORDS.forEach((_, i) => {
      schedule(() => {
        const el = wordRefs.current[i]
        if (!el) return
        el.style.animation = `wordBounce 400ms ${EASE_BOUNCY} forwards`
      }, WORD_TIMINGS[i])
    })

    // T=900ms: Gradient underline on "level"
    schedule(() => {
      levelUnderline.style.transition = `transform 300ms ${EASE_BOUNCY}`
      levelUnderline.style.transform = 'scaleX(1)'
    }, 900)

    // T=1300ms: Brand logos bounce in with stagger (50ms apart)
    INTRO_BRANDS.forEach((_, i) => {
      schedule(() => {
        const el = logoRefs.current[i]
        if (!el) return
        el.style.animation = `logoBounceIn 350ms ${EASE_BOUNCY} forwards`
      }, 1300 + i * 50)
    })

    // ═══════════════════════════════════════════
    // PHASE 2: Iron Media logo appears ABOVE text (T=2500ms)
    // Text shifts down, logo group fades in above
    // ═══════════════════════════════════════════

    // T=2200ms: Shift text block down to make room
    schedule(() => {
      textBlock.style.transition = `transform 400ms ${EASE_BOUNCY}`
      textBlock.style.transform = 'translateY(40px)'
    }, 2200)

    // T=2500ms: Show logo group above text
    schedule(() => {
      logoGroup.style.transition = `opacity 350ms ${EASE_FADE}, transform 350ms ${EASE_BOUNCY}`
      logoGroup.style.opacity = '1'
      logoGroup.style.transform = 'translateY(0) scale(1)'
    }, 2500)

    // T=2550ms: Bar 2 (center, tallest) drops in
    schedule(() => {
      bar2.style.opacity = '1'
      bar2.style.transition = `transform 300ms ${EASE_BOUNCY}`
      bar2.style.transform = 'translateY(0)'
    }, 2550)

    // Bar 2 squash on landing
    schedule(() => {
      bar2.style.transition = 'transform 80ms ease-out'
      bar2.style.transform = 'scaleY(0.75) scaleX(1.25)'
    }, 2850)
    schedule(() => {
      bar2.style.transition = 'transform 70ms ease-in-out'
      bar2.style.transform = 'scaleY(1.1) scaleX(0.92)'
    }, 2930)
    schedule(() => {
      bar2.style.transition = 'transform 60ms ease-out'
      bar2.style.transform = 'scaleY(1) scaleX(1)'
    }, 3000)

    // T=2650ms: Bar 1 flies from left
    schedule(() => {
      bar1.style.opacity = '1'
      bar1.style.transition = `transform 280ms ${EASE_BOUNCY}, opacity 120ms ease-out`
      bar1.style.transform = 'translateX(0) rotate(0deg)'
    }, 2650)

    // T=2750ms: Bar 3 flies from right
    schedule(() => {
      bar3.style.opacity = '1'
      bar3.style.transition = `transform 280ms ${EASE_BOUNCY}, opacity 120ms ease-out`
      bar3.style.transform = 'translateX(0) rotate(0deg)'
    }, 2750)

    // T=2850ms: Sync pulse on bars
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = 'transform 100ms ease-in-out, box-shadow 100ms ease-in-out'
        bar.style.transform = 'scale(1.04)'
        bar.style.boxShadow = `0 0 20px ${COLORS.oceanBlue}40`
      })
    }, 2950)
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = 'transform 100ms ease-out, box-shadow 150ms ease-out'
        bar.style.transform = 'scale(1.0)'
        bar.style.boxShadow = '0 0 0px transparent'
      })
    }, 3050)

    // T=2900ms: "IRON" character stagger
    IRON_LETTERS.forEach((_, i) => {
      schedule(() => {
        const el = ironLetterRefs.current[i]
        if (!el) return
        el.style.animation = `bounceInChar 300ms ${EASE_BOUNCY} forwards`
      }, 2900 + i * 40)
    })

    // T=3050ms: "MEDIA" tracking animation
    schedule(() => {
      media.style.transition = `letter-spacing 350ms ${EASE_MEDIA}, opacity 350ms ${EASE_MEDIA}`
      media.style.opacity = '1'
      media.style.letterSpacing = '0.35em'
    }, 3050)

    // ═══════════════════════════════════════════
    // PHASE 3: Everything wipes away (T=3200ms -> T=4000ms)
    // ═══════════════════════════════════════════

    // T=3200ms: Fade out everything together
    schedule(() => {
      // Fade out text + logos
      phase1.style.transition = `opacity 250ms ${EASE_FADE}, transform 250ms ${EASE_FADE}`
      phase1.style.opacity = '0'
      phase1.style.transform = 'scale(0.97)'

      // Fade out Iron Media logo group
      logoGroup.style.transition = `opacity 250ms ${EASE_FADE}, transform 250ms ${EASE_FADE}`
      logoGroup.style.opacity = '0'
      logoGroup.style.transform = 'translateY(-10px) scale(0.97)'
    }, 3200)

    // T=3400ms: Bars blur + dissolve
    schedule(() => {
      bar1.style.transition = 'opacity 200ms ease-out, filter 300ms ease-out, transform 300ms ease-out'
      bar1.style.transform = 'rotate(4deg)'
      bar1.style.filter = 'blur(6px)'
      bar1.style.opacity = '0'
    }, 3350)

    schedule(() => {
      bar2.style.transition = 'opacity 200ms ease-out, filter 300ms ease-out, transform 300ms ease-out'
      bar2.style.transform = 'rotate(-2deg)'
      bar2.style.filter = 'blur(6px)'
      bar2.style.opacity = '0'
    }, 3400)

    schedule(() => {
      bar3.style.transition = 'opacity 200ms ease-out, filter 300ms ease-out, transform 300ms ease-out'
      bar3.style.transform = 'rotate(3deg)'
      bar3.style.filter = 'blur(6px)'
      bar3.style.opacity = '0'
    }, 3450)

    // T=3500ms: Radial pulse
    schedule(() => {
      radialPulse.style.animation = 'radialPulse 300ms ease-out forwards'
    }, 3500)

    // T=3600ms: Overlay fades to transparent
    schedule(() => {
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.transition = `opacity 300ms ${EASE_FADE}`
        overlay.style.opacity = '0'
      }
    }, 3600)

    // T=4000ms: Complete
    schedule(() => {
      if (completedRef.current) return
      completedRef.current = true
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.display = 'none'
      }
      onComplete()
    }, 4000)
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

  const baseFontSize = 'clamp(28px, 4.2vw, 52px)'

  const row1Words = PHASE1_WORDS.filter((w) => w.row === 1)
  const row2Words = PHASE1_WORDS.filter((w) => w.row === 2)

  const brandsRow1 = INTRO_BRANDS.slice(0, 6)
  const brandsRow2 = INTRO_BRANDS.slice(6, 12)

  const renderWord = (
    word: (typeof PHASE1_WORDS)[number],
    globalIndex: number,
  ) => {
    const isLastWord = globalIndex === PHASE1_WORDS.length - 1

    const wordStyle: React.CSSProperties = {
      display: 'inline-block',
      fontFamily: 'var(--font-display)',
      fontWeight: 900,
      position: isLastWord ? 'relative' : undefined,
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
        {isLastWord && (
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

  const renderBrandRow = (brands: typeof INTRO_BRANDS, startIndex: number) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '10px',
        flexWrap: 'wrap',
      }}
    >
      {brands.map((brand, i) => {
        const globalIndex = startIndex + i
        return (
          <div
            key={brand.name}
            ref={(el) => {
              logoRefs.current[globalIndex] = el as any
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 14px 7px 8px',
              borderRadius: '10px',
              background: `${brand.color}0D`,
              border: `1px solid ${brand.color}1A`,
              opacity: 0,
              willChange: 'transform, opacity',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=128`}
              alt=""
              width={32}
              height={32}
              style={{ borderRadius: '4px', display: 'block' }}
              loading="eager"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '14px',
                letterSpacing: '0.02em',
                color: brand.color,
                lineHeight: 1,
                whiteSpace: 'nowrap',
              }}
            >
              {brand.name}
            </span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: COLORS.background,
        backgroundImage: `
          linear-gradient(rgba(46,154,196,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,154,196,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        willChange: 'opacity',
        overflow: 'hidden',
      }}
    >
      {/* Global keyframes */}
      <style>{KEYFRAMES_CSS}</style>

      {/* ═══════ PHASE 1 container: text + brands ═══════ */}
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
        {/* Iron Media logo group — appears ABOVE text in phase 2 */}
        <div
          ref={logoGroupRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '32px',
            willChange: 'opacity, transform',
          }}
        >
          {/* Bars container */}
          <div
            ref={barsGroupRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              willChange: 'transform, opacity',
            }}
          >
            {/* Bar 1 - Sky Blue */}
            <div
              ref={bar1Ref}
              style={{
                width: '18px',
                height: '90px',
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
                width: '18px',
                height: '124px',
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
                width: '18px',
                height: '100px',
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
              fontSize: 'clamp(20px, 3.2vw, 38px)',
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
              fontSize: 'clamp(11px, 1.8vw, 20px)',
              textTransform: 'uppercase',
              lineHeight: 1,
              willChange: 'opacity, letter-spacing',
              marginTop: '-6px',
            }}
          >
            MEDIA
          </div>

          {/* Radial pulse div (for outro) */}
          <div
            ref={radialPulseRef}
            style={{
              position: 'absolute',
              width: '250px',
              height: '250px',
              borderRadius: '50%',
              background: `radial-gradient(circle, rgba(46,154,196,0.15), transparent 70%)`,
              pointerEvents: 'none',
              opacity: 0,
              willChange: 'transform, opacity',
            }}
          />
        </div>

        {/* Text block — shifts down in phase 2 */}
        <div
          ref={textBlockRef}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            willChange: 'transform',
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
            {/* Row 1: "We scale Ecom brands" */}
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

            {/* Row 2: "to the next level" */}
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

          {/* Brand logos - 2 rows of 6 */}
          <div
            style={{
              maxWidth: '850px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              marginTop: '28px',
            }}
          >
            {renderBrandRow(brandsRow1, 0)}
            {renderBrandRow(brandsRow2, 6)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntroAnimation
