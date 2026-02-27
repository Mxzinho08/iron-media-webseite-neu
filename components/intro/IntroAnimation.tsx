'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
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
  textMuted: '#666666',
} as const

const EASE_WORD = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_OVERSHOOT = 'cubic-bezier(0.34, 1.56, 0.64, 1)'
const EASE_OUT_EXPO = 'cubic-bezier(0.22, 1, 0.36, 1)'
const EASE_TEXT = 'cubic-bezier(0.16, 1, 0.3, 1)'
const EASE_MEDIA = 'cubic-bezier(0.25, 1, 0.5, 1)'
const EASE_FADE = 'cubic-bezier(0.4, 0, 0.2, 1)'

const IRON_LETTERS = ['I', 'R', 'O', 'N']

const UPPER_WORDS = ['We', 'scale', 'eCom', 'brands']
const LOWER_WORDS = ['to', 'the', 'next', 'level']

/**
 * Compute positions for N items distributed evenly around an oval.
 * Returns array of { x, y } as percentage offsets from center.
 */
function getOvalPositions(
  count: number,
  radiusX: number,
  radiusY: number,
): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = []
  for (let i = 0; i < count; i++) {
    // Start from top (-PI/2) and go clockwise
    const angle = -Math.PI / 2 + (2 * Math.PI * i) / count
    positions.push({
      x: Math.cos(angle) * radiusX,
      y: Math.sin(angle) * radiusY,
    })
  }
  return positions
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const overlayRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Phase 1 refs
  const phase1Ref = useRef<HTMLDivElement>(null)
  const upperWordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const lowerWordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const underlineRef = useRef<HTMLSpanElement>(null)
  const brandLogoRefs = useRef<(HTMLDivElement | null)[]>([])

  // Phase 2 refs
  const phase2Ref = useRef<HTMLDivElement>(null)
  const bar1Ref = useRef<HTMLDivElement>(null)
  const bar2Ref = useRef<HTMLDivElement>(null)
  const bar3Ref = useRef<HTMLDivElement>(null)
  const barsGroupRef = useRef<HTMLDivElement>(null)
  const ironLetterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const mediaRef = useRef<HTMLDivElement>(null)

  // Phase tracking
  const [phase, setPhase] = useState<1 | 2 | 3>(1)

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

    setTimeout(() => {
      overlay.style.display = 'none'
      onComplete()
    }, 210)
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

  // ── PHASE 1: Statement + Brand Logos ──
  useEffect(() => {
    const phase1 = phase1Ref.current
    if (!phase1 || phase !== 1) return

    // Initial states for upper words
    upperWordRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.filter = 'blur(3px)'
    })

    // Initial states for lower words
    lowerWordRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(20px)'
      el.style.filter = 'blur(3px)'
    })

    // Underline initial
    const underline = underlineRef.current
    if (underline) {
      underline.style.width = '0%'
    }

    // Brand logos initial
    brandLogoRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'scale(0.3)'
    })

    // ── T=300ms: Upper line words stagger in ──
    UPPER_WORDS.forEach((_, i) => {
      schedule(() => {
        const el = upperWordRefs.current[i]
        if (!el) return
        el.style.transition = `opacity 400ms ${EASE_WORD}, transform 400ms ${EASE_WORD}, filter 400ms ${EASE_WORD}`
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        el.style.filter = 'blur(0px)'
      }, 300 + i * 80)
    })

    // ── T=700ms: Underline draws on "scale" ──
    schedule(() => {
      if (underline) {
        underline.style.transition = `width 350ms ${EASE_WORD}`
        underline.style.width = '100%'
      }
    }, 700)

    // ── T=800ms: Lower line words stagger in ──
    LOWER_WORDS.forEach((_, i) => {
      schedule(() => {
        const el = lowerWordRefs.current[i]
        if (!el) return
        el.style.transition = `opacity 400ms ${EASE_WORD}, transform 400ms ${EASE_WORD}, filter 400ms ${EASE_WORD}`
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        el.style.filter = 'blur(0px)'

        // "level" gets scale bounce
        if (i === LOWER_WORDS.length - 1) {
          el.style.transform = 'translateY(0) scale(0.9)'
          schedule(() => {
            el.style.transition = `transform 150ms ${EASE_OVERSHOOT}`
            el.style.transform = 'translateY(0) scale(1.05)'
          }, 800 + i * 70 + 400)
          schedule(() => {
            el.style.transition = `transform 120ms ease-out`
            el.style.transform = 'translateY(0) scale(1.0)'
          }, 800 + i * 70 + 550)
        }
      }, 800 + i * 70)
    })

    // ── T=1200ms: Brand logos appear in oval ──
    INTRO_BRANDS.forEach((_, i) => {
      schedule(() => {
        const el = brandLogoRefs.current[i]
        if (!el) return
        // Spring-like multi-step bounce: 0.3 → 1.15 → 0.95 → 1.02 → 1.0
        el.style.transition = `opacity 200ms ${EASE_OVERSHOOT}, transform 300ms ${EASE_OVERSHOOT}`
        el.style.opacity = '0.7'
        el.style.transform = 'scale(1.15)'

        schedule(() => {
          el.style.transition = `transform 120ms ease-in-out`
          el.style.transform = 'scale(0.95)'
        }, 1200 + i * 80 + 300)

        schedule(() => {
          el.style.transition = `transform 100ms ease-out`
          el.style.transform = 'scale(1.02)'
        }, 1200 + i * 80 + 420)

        schedule(() => {
          el.style.transition = `transform 80ms ease-out`
          el.style.transform = 'scale(1.0)'
        }, 1200 + i * 80 + 520)
      }, 1200 + i * 80)
    })

    // ── T=2800ms: Everything fades out ──
    schedule(() => {
      phase1.style.transition = `opacity 300ms ${EASE_FADE}, transform 300ms ${EASE_FADE}`
      phase1.style.opacity = '0'
      phase1.style.transform = 'scale(0.96)'
    }, 2800)

    // ── T=3100ms: Switch to Phase 2 ──
    schedule(() => {
      setPhase(2)
    }, 3100)
  }, [phase, schedule])

  // ── PHASE 2: Logo Entrance ──
  useEffect(() => {
    if (phase !== 2) return

    const bar1 = bar1Ref.current
    const bar2 = bar2Ref.current
    const bar3 = bar3Ref.current
    const barsGroup = barsGroupRef.current
    const media = mediaRef.current
    const phase2 = phase2Ref.current

    if (!bar1 || !bar2 || !bar3 || !barsGroup || !media || !phase2) return

    // Initial states
    phase2.style.opacity = '1'

    bar2.style.transform = 'translateY(-120vh)'
    bar2.style.opacity = '1'
    bar1.style.transform = 'translateX(-60vw) rotate(-8deg)'
    bar1.style.opacity = '0'
    bar3.style.transform = 'translateX(60vw) rotate(8deg)'
    bar3.style.opacity = '0'

    ironLetterRefs.current.forEach((el) => {
      if (!el) return
      el.style.opacity = '0'
      el.style.transform = 'translateY(12px)'
    })

    media.style.opacity = '0'
    media.style.letterSpacing = '1em'

    // Offset: Phase 2 starts at T=3000ms globally, but this effect fires at
    // phase switch (~3100ms). We use relative timing from here = 0ms base.
    // Bar 2 drops: relative T=0ms (global ~3100ms)
    schedule(() => {
      bar2.style.transition = `transform 380ms ${EASE_OVERSHOOT}`
      bar2.style.transform = 'translateY(0)'
    }, 0)

    // Bar 2 squash & stretch on land
    schedule(() => {
      bar2.style.transition = `transform 80ms ease-out`
      bar2.style.transform = 'scaleX(1.3) scaleY(0.72)'
    }, 380)
    schedule(() => {
      bar2.style.transition = `transform 80ms ease-in-out`
      bar2.style.transform = 'scaleX(0.92) scaleY(1.12)'
    }, 460)
    schedule(() => {
      bar2.style.transition = `transform 70ms ease-in-out`
      bar2.style.transform = 'scaleX(1.04) scaleY(0.97)'
    }, 540)
    schedule(() => {
      bar2.style.transition = `transform 60ms ease-out`
      bar2.style.transform = 'scaleX(1) scaleY(1)'
    }, 610)

    // Bar 1 flies from left: relative T=250ms (global ~3350ms)
    schedule(() => {
      bar1.style.transition = `transform 350ms ${EASE_OUT_EXPO}, opacity 200ms ${EASE_OUT_EXPO}`
      bar1.style.transform = 'translateX(0) rotate(0deg)'
      bar1.style.opacity = '1'
    }, 250)

    // Bar 1 settle
    schedule(() => {
      bar1.style.transition = `transform 70ms ease-out`
      bar1.style.transform = 'scaleX(1.1)'
    }, 600)
    schedule(() => {
      bar1.style.transition = `transform 65ms ease-in-out`
      bar1.style.transform = 'scaleX(0.96)'
    }, 670)
    schedule(() => {
      bar1.style.transition = `transform 60ms ease-out`
      bar1.style.transform = 'scaleX(1.0)'
    }, 730)

    // Bar 3 flies from right: relative T=450ms (global ~3550ms)
    schedule(() => {
      bar3.style.transition = `transform 350ms ${EASE_OUT_EXPO}, opacity 200ms ${EASE_OUT_EXPO}`
      bar3.style.transform = 'translateX(0) rotate(0deg)'
      bar3.style.opacity = '1'
    }, 450)

    // Bar 3 settle
    schedule(() => {
      bar3.style.transition = `transform 70ms ease-out`
      bar3.style.transform = 'scaleX(1.1)'
    }, 800)
    schedule(() => {
      bar3.style.transition = `transform 65ms ease-in-out`
      bar3.style.transform = 'scaleX(0.96)'
    }, 870)
    schedule(() => {
      bar3.style.transition = `transform 60ms ease-out`
      bar3.style.transform = 'scaleX(1.0)'
    }, 930)

    // Sync pulse all bars: relative T=700ms (global ~3800ms)
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = `transform 100ms ease-in-out, box-shadow 100ms ease-in-out`
        bar.style.transform = 'scale(1.04)'
        bar.style.boxShadow = `0 0 30px ${COLORS.oceanBlue}`
      })
    }, 700)
    schedule(() => {
      ;[bar1, bar2, bar3].forEach((bar) => {
        bar.style.transition = `transform 100ms ease-out, box-shadow 200ms ease-out`
        bar.style.transform = 'scale(1.0)'
        bar.style.boxShadow = '0 0 0px transparent'
      })
    }, 800)

    // "IRON" text: relative T=800ms (global ~3900ms)
    IRON_LETTERS.forEach((_, i) => {
      schedule(() => {
        const el = ironLetterRefs.current[i]
        if (!el) return
        el.style.transition = `opacity 300ms ${EASE_TEXT}, transform 300ms ${EASE_TEXT}`
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
      }, 800 + i * 60)
    })

    // "MEDIA" text: relative T=1000ms (global ~4100ms)
    schedule(() => {
      media.style.transition = `letter-spacing 400ms ${EASE_MEDIA}, opacity 400ms ${EASE_MEDIA}`
      media.style.opacity = '1'
      media.style.letterSpacing = '0.35em'
    }, 1000)

    // ── PHASE 3: Transition to Hero ──
    // relative T=1600ms (global ~4700ms): Text fades, bars scale out
    schedule(() => {
      // Fade out IRON and MEDIA text
      ironLetterRefs.current.forEach((el) => {
        if (!el) return
        el.style.transition = `opacity 200ms ${EASE_FADE}`
        el.style.opacity = '0'
      })
      media.style.transition = `opacity 200ms ${EASE_FADE}`
      media.style.opacity = '0'

      // Bars move right and scale up
      barsGroup.style.transition = `transform 400ms ${EASE_OUT_EXPO}`
      barsGroup.style.transform = 'translateX(25vw) scale(10)'

      // Overlay fades
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.transition = `opacity 400ms ${EASE_FADE}`
        overlay.style.opacity = '0'
      }
    }, 1600)

    // relative T=2200ms (global ~5300ms): Complete
    schedule(() => {
      if (completedRef.current) return
      completedRef.current = true
      const overlay = overlayRef.current
      if (overlay) {
        overlay.style.display = 'none'
      }
      onComplete()
    }, 2200)
  }, [phase, schedule, onComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
    }
  }, [])

  // Compute oval positions for brand logos
  const brandPositions = getOvalPositions(INTRO_BRANDS.length, 38, 42)

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
      {/* ═══════ PHASE 1: Statement + Brand Logos ═══════ */}
      {phase === 1 && (
        <div
          ref={phase1Ref}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            willChange: 'opacity, transform',
          }}
        >
          {/* Center text block */}
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 'clamp(28px, 4vw, 48px)',
              color: COLORS.textDark,
              lineHeight: 1.4,
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Upper line: "We scale eCom brands" */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.3em',
                flexWrap: 'wrap',
              }}
            >
              {UPPER_WORDS.map((word, i) => (
                <span
                  key={`upper-${i}`}
                  ref={(el) => {
                    upperWordRefs.current[i] = el
                  }}
                  style={{
                    display: 'inline-block',
                    willChange: 'transform, opacity, filter',
                    position: 'relative',
                  }}
                >
                  {word}
                  {/* Gradient underline on "scale" */}
                  {word === 'scale' && (
                    <span
                      ref={underlineRef}
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: 0,
                        height: '3px',
                        width: '0%',
                        borderRadius: '2px',
                        background: `linear-gradient(90deg, ${COLORS.skyBlue}, ${COLORS.oceanBlue}, ${COLORS.deepTeal})`,
                        willChange: 'width',
                      }}
                    />
                  )}
                </span>
              ))}
            </div>

            {/* Divider line */}
            <div
              style={{
                width: '60px',
                height: '2px',
                background: `linear-gradient(90deg, ${COLORS.skyBlue}, ${COLORS.deepTeal})`,
                margin: '12px auto',
                borderRadius: '1px',
                opacity: 0.5,
              }}
            />

            {/* Lower line: "to the next level" */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.3em',
                flexWrap: 'wrap',
              }}
            >
              {LOWER_WORDS.map((word, i) => (
                <span
                  key={`lower-${i}`}
                  ref={(el) => {
                    lowerWordRefs.current[i] = el
                  }}
                  style={{
                    display: 'inline-block',
                    willChange: 'transform, opacity, filter',
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Brand logos in oval arrangement */}
          {INTRO_BRANDS.map((brand, i) => {
            const pos = brandPositions[i]
            return (
              <div
                key={brand.name}
                ref={(el) => {
                  brandLogoRefs.current[i] = el
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'scale(0.3)',
                  marginLeft: `${pos.x}vw`,
                  marginTop: `${pos.y}vh`,
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 'clamp(16px, 2vw, 22px)',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: brand.color,
                  opacity: 0,
                  whiteSpace: 'nowrap',
                  willChange: 'transform, opacity',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              >
                {brand.name}
              </div>
            )
          })}
        </div>
      )}

      {/* ═══════ PHASE 2 & 3: Logo Entrance + Transition ═══════ */}
      {phase >= 2 && (
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
              gap: '5px',
              willChange: 'transform',
            }}
          >
            {/* Bar 1 - Sky Blue */}
            <div
              ref={bar1Ref}
              className="intro-bar"
              style={{
                width: '24px',
                height: '132px',
                backgroundColor: COLORS.skyBlue,
                borderRadius: '999px',
                willChange: 'transform, opacity',
              }}
            />
            {/* Bar 2 - Ocean Blue, tallest */}
            <div
              ref={bar2Ref}
              className="intro-bar"
              style={{
                width: '24px',
                height: '180px',
                backgroundColor: COLORS.oceanBlue,
                borderRadius: '999px',
                willChange: 'transform, opacity',
              }}
            />
            {/* Bar 3 - Deep Teal */}
            <div
              ref={bar3Ref}
              className="intro-bar"
              style={{
                width: '24px',
                height: '144px',
                backgroundColor: COLORS.deepTeal,
                borderRadius: '999px',
                willChange: 'transform, opacity',
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
              fontSize: 'clamp(10px, 1.5vw, 16px)',
              textTransform: 'uppercase',
              lineHeight: 1,
              willChange: 'opacity, letter-spacing',
              marginTop: '-8px',
            }}
          >
            MEDIA
          </div>
        </div>
      )}

      {/* Mobile responsive bar sizing via inline style tag */}
      <style>{`
        @media (max-width: 767px) {
          .intro-bar {
            width: 18px !important;
          }
          .intro-bar:nth-child(1) {
            height: 100px !important;
          }
          .intro-bar:nth-child(2) {
            height: 136px !important;
          }
          .intro-bar:nth-child(3) {
            height: 109px !important;
          }
        }
      `}</style>
    </div>
  )
}

export default IntroAnimation
