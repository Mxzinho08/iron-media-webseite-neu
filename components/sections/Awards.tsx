'use client'

import ScrollReveal from '@/components/ui/ScrollReveal'
import { useRef, useState, useEffect } from 'react'
import { useInView } from 'framer-motion'

/* ============================================
   IRON MEDIA — AWARDS v5.4
   ClickFunnels Two Comma Club C Milestones
   ============================================ */

const MILESTONES = [
  { amount: '$25M', label: 'Two Comma Club C', status: 'Achieved' },
  { amount: '$50M', label: 'Two Comma Club C', status: 'Achieved' },
  { amount: '$75M', label: 'Two Comma Club C', status: 'Achieved' },
  { amount: '$100M', label: 'Two Comma Club C', status: 'Achieved' },
]

/* ─── Checkmark SVG ─── */
function CheckmarkIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M7 14.5L11.5 19L21 9.5"
        stroke="#FFFFFF"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ─── Animated Progress Bar ─── */
function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (isInView) {
      // Small delay so the CSS transition is visible
      const t = setTimeout(() => setProgress(100), 100)
      return () => clearTimeout(t)
    }
  }, [isInView])

  return (
    <div ref={ref} style={{ width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      {/* Labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: '#94A3B8',
          }}
        >
          $0
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: '#94A3B8',
          }}
        >
          $100M+
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 999,
          background: '#E2E8F0',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Fill */}
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #56B8DE, #2E9AC4, #1B7EA6)',
            transition: 'width 1.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  )
}

/* ============================================
   AWARDS — Main Section Component
   ============================================ */
export default function Awards() {
  return (
    <section
      id="awards"
      className="relative w-full overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      {/* ── Subtle ascending decorative bars (background) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ overflow: 'hidden' }}
      >
        {[0.15, 0.3, 0.5, 0.68, 0.82].map((xPos, i) => {
          const height = 60 + i * 50
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${xPos * 100}%`,
                width: 40,
                height,
                borderRadius: '8px 8px 0 0',
                background: 'linear-gradient(180deg, rgba(46,154,196,0.04), rgba(46,154,196,0.01))',
                transform: 'translateX(-50%)',
              }}
            />
          )
        })}
      </div>

      {/* Content wrapper */}
      <div
        className="relative z-10"
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: 'clamp(80px, 10vh, 140px) clamp(24px, 5vw, 80px)',
        }}
      >
        {/* ═══════════════════════════════════
            1. SECTION HEADER
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div className="text-center" style={{ marginBottom: 'clamp(48px, 6vw, 80px)' }}>
            {/* Tagline */}
            <p
              className="mb-5"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#2E9AC4',
              }}
            >
              AWARDS &amp; MILESTONES
            </p>

            {/* Headline */}
            <h2
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: 'clamp(36px, 4.5vw, 64px)',
                color: '#1A1A2E',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              ClickFunnels Two Comma Club C
            </h2>

            {/* Subline */}
            <p
              className="mx-auto mt-6"
              style={{
                fontSize: 17,
                color: '#4A5568',
                maxWidth: 660,
                lineHeight: 1.7,
              }}
            >
              Die Two Comma Club C Awards werden von ClickFunnels an Unternehmen vergeben,
              die au&szlig;ergew&ouml;hnliche Umsatz-Meilensteine erreichen. Nur eine
              Handvoll Agenturen weltweit besitzen diese Auszeichnungen.
            </p>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            2. MILESTONE CARDS
            ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map((milestone, i) => (
            <ScrollReveal key={milestone.amount} delay={i * 0.12}>
              <div
                className="group"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 20,
                  padding: '36px 24px',
                  textAlign: 'center',
                  transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    '0 8px 32px rgba(46,154,196,0.12), 0 2px 8px rgba(0,0,0,0.04)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Gradient disc with checkmark */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #56B8DE, #2E9AC4, #1B7EA6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 4px 20px rgba(46,154,196,0.25)',
                  }}
                >
                  <CheckmarkIcon />
                </div>

                {/* Amount */}
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 32,
                    color: '#1A1A2E',
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {milestone.amount}
                </div>

                {/* Label */}
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase' as const,
                    color: '#94A3B8',
                    marginTop: 8,
                  }}
                >
                  {milestone.label}
                </div>

                {/* Status badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 16,
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(92,187,92,0.1)',
                    color: '#5CBB5C',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                >
                  {milestone.status} &#10003;
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* ═══════════════════════════════════
            3. PROGRESS BAR
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div style={{ marginTop: 'clamp(48px, 6vw, 80px)' }}>
            <ProgressBar />
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            4. FOOTNOTE
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <p
            className="text-center mx-auto"
            style={{
              marginTop: 40,
              fontSize: 14,
              color: '#94A3B8',
              maxWidth: 680,
              lineHeight: 1.7,
            }}
          >
            Diese Awards best&auml;tigen &uuml;ber &euro;100M+ Gesamtumsatz &uuml;ber
            ClickFunnels &mdash; nur wenige Agenturen weltweit erreichen dieses Level.
          </p>
        </ScrollReveal>
      </div>
    </section>
  )
}
