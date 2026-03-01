'use client'

import {
  CaseVisual1,
  CaseVisual2,
  CaseVisual3,
  CaseVisual4,
  CaseVisual5,
  CaseVisual6,
} from '@/components/case-studies/CaseVisuals'
import ScrollReveal from '@/components/ui/ScrollReveal'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { AGGREGATE_METRICS, CASE_STUDIES } from '@/lib/constants'
import { ReactNode } from 'react'

/* ─── Visual component map ─── */
const CASE_VISUALS: Record<number, ReactNode> = {
  1: <CaseVisual1 />,
  2: <CaseVisual2 />,
  3: <CaseVisual3 />,
  4: <CaseVisual4 />,
  5: <CaseVisual5 />,
  6: <CaseVisual6 />,
}

/* ═══════════════════════════════════════════
   CASE STUDIES  — Main Section Component
   ═══════════════════════════════════════════ */
export default function CaseStudies() {
  return (
    <section
      id="cases"
      className="relative w-full overflow-hidden"
      style={{
        background: '#FFFFFF',
      }}
    >
      {/* ── Subtle ascending bars background (decorative) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ overflow: 'hidden' }}
      >
        {[0.15, 0.3, 0.45, 0.6, 0.75, 0.88].map((left, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${left * 100}%`,
              bottom: 0,
              width: '1px',
              height: `${30 + i * 12}%`,
              background: `linear-gradient(to top, rgba(46,154,196,0.03), transparent)`,
            }}
          />
        ))}
        {[0.2, 0.4, 0.6, 0.8].map((left, i) => (
          <div
            key={`bar-${i}`}
            style={{
              position: 'absolute',
              left: `${left * 100 - 2}%`,
              bottom: 0,
              width: '40px',
              height: `${20 + i * 15}%`,
              background: `linear-gradient(to top, rgba(46,154,196,0.015), transparent)`,
              borderRadius: '4px 4px 0 0',
            }}
          />
        ))}
      </div>

      {/* Content wrapper */}
      <div className="relative z-10 py-[clamp(80px,12vh,160px)]">
        {/* ═══════════════════════════════════
            1. SECTION HEADER
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div className="text-center px-[clamp(24px,5vw,80px)] mb-[clamp(64px,8vw,120px)]">
            {/* Tagline */}
            <p
              className="mb-5"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                color: '#2E9AC4',
              }}
            >
              CASE STUDIES
            </p>

            {/* Headline */}
            <h2
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: 'clamp(40px, 5vw, 72px)',
                color: '#1A1A2E',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Ergebnisse, die f&uuml;r sich sprechen
            </h2>

            {/* Subline */}
            <p
              className="mx-auto mt-6"
              style={{
                fontSize: '17px',
                color: '#4A5568',
                maxWidth: '700px',
                lineHeight: 1.7,
              }}
            >
              &euro;10M+ monatlich verwaltetes Werbebudget. Brands von David
              Beckham und Cristiano Ronaldo im Portfolio. Hier sind einige
              unserer Geschichten.
            </p>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            2. AGGREGATE METRICS ROW
            ═══════════════════════════════════ */}
        <div className="max-w-[1440px] mx-auto px-[clamp(24px,5vw,80px)] mb-[clamp(64px,8vw,120px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AGGREGATE_METRICS.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 0.1}>
                <div
                  className="relative text-center p-10 rounded-2xl"
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {/* Value with blue gradient text */}
                  <div
                    style={{
                      background: 'linear-gradient(180deg, #1B7EA6 0%, #56B8DE 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    <AnimatedCounter
                      end={m.value}
                      prefix={m.prefix}
                      suffix={m.suffix}
                      className="inline-block"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: 'clamp(40px, 5vw, 72px)',
                        lineHeight: 1,
                      }}
                    />
                  </div>

                  {/* Label */}
                  <p
                    className="mt-3"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.18em',
                      color: '#94A3B8',
                    }}
                  >
                    {m.label}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════
            3. CASE STUDY CARDS
            ═══════════════════════════════════ */}
        {CASE_STUDIES.map((cs, idx) => {
          const isEven = (idx + 1) % 2 === 0 // 1-based even: cards 2,4,6
          return (
            <ScrollReveal key={cs.id}>
              <div
                className="max-w-[1440px] mx-auto"
                style={{
                  padding:
                    'clamp(48px,6vw,96px) clamp(24px,5vw,80px)',
                }}
              >
                <div
                  className={`flex flex-col items-center gap-[clamp(40px,5vw,80px)] ${
                    isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                  }`}
                >
                  {/* ── Text Side ── */}
                  <div className="flex-1 w-full">
                    {/* Case number */}
                    <div className="flex items-center gap-4 mb-6">
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          letterSpacing: '0.15em',
                          color: '#2E9AC4',
                        }}
                      >
                        # 0{cs.id}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{
                          background:
                            'linear-gradient(to right, #2E9AC4, transparent)',
                          maxWidth: '100px',
                        }}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      style={{
                        fontFamily: 'var(--font-headline)',
                        fontWeight: 800,
                        fontSize: 'clamp(28px, 3.5vw, 48px)',
                        color: '#1A1A2E',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {cs.title}
                    </h3>

                    {/* Subtitle */}
                    <p
                      className="mt-2"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '13px',
                        color: '#94A3B8',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {cs.subtitle}
                    </p>

                    {/* Accent phrase */}
                    <p
                      className="mt-6"
                      style={{
                        fontStyle: 'italic',
                        fontSize: '20px',
                        color: '#4A5568',
                      }}
                    >
                      {cs.accentPhrase}{' '}
                      <span
                        style={{
                          color: '#2E9AC4',
                        }}
                      >
                        {cs.accentWord}
                      </span>
                    </p>

                    {/* Story */}
                    <p
                      className="mt-4"
                      style={{
                        fontSize: '15px',
                        lineHeight: 1.7,
                        color: '#4A5568',
                        maxWidth: '480px',
                      }}
                    >
                      {cs.story}
                    </p>

                    {/* Quote (if exists) */}
                    {'quote' in cs && cs.quote && (
                      <blockquote
                        className="mt-6 pl-4"
                        style={{
                          borderLeft: '2px solid #2E9AC4',
                          fontStyle: 'italic',
                          fontSize: '14px',
                          lineHeight: 1.7,
                          color: '#64748B',
                          maxWidth: '480px',
                        }}
                      >
                        <p>&ldquo;{(cs as typeof CASE_STUDIES[4]).quote!.text}&rdquo;</p>
                        <footer
                          className="mt-2"
                          style={{
                            fontStyle: 'normal',
                            fontSize: '12px',
                            color: '#94A3B8',
                          }}
                        >
                          &mdash; {(cs as typeof CASE_STUDIES[4]).quote!.author},{' '}
                          {(cs as typeof CASE_STUDIES[4]).quote!.platform}
                        </footer>
                      </blockquote>
                    )}

                    {/* Metric pills */}
                    <div className="flex gap-4 mt-8 flex-wrap">
                      {cs.metrics.map((metric) => (
                        <div
                          key={metric.label}
                          className="flex flex-col p-4 px-5"
                          style={{
                            background: '#F1F8FC',
                            border: '1px solid rgba(46,154,196,0.15)',
                            borderRadius: '14px',
                            minWidth: '100px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '24px',
                              color: '#1A1A2E',
                            }}
                          >
                            {metric.value}
                          </span>
                          <span
                            className="mt-1"
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '9px',
                              letterSpacing: '0.15em',
                              textTransform: 'uppercase',
                              color: '#94A3B8',
                            }}
                          >
                            {metric.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Visual Side ── */}
                  <ScrollReveal delay={0.2} className="flex-1 w-full">
                    <div
                      className="relative w-full overflow-hidden flex items-center justify-center"
                      style={{
                        aspectRatio: '4/3',
                        borderRadius: '24px',
                        background: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      {/* Visual component */}
                      <div className="relative z-10 w-full h-full flex items-center justify-center">
                        {CASE_VISUALS[cs.id]}
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </ScrollReveal>
          )
        })}
      </div>
    </section>
  )
}
