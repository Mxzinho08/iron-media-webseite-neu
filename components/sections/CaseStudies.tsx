'use client'

import {
  CaseVisual1,
  CaseVisual2,
  CaseVisual3,
  CaseVisual4,
  CaseVisual5,
  CaseVisual6,
} from '@/components/case-studies/CaseVisuals'
import TestimonialMarquee from '@/components/case-studies/TestimonialMarquee'
import MediaAppearances from '@/components/case-studies/MediaAppearances'
import ScrollReveal from '@/components/ui/ScrollReveal'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { AGGREGATE_METRICS, CASE_STUDIES, AWARDS } from '@/lib/constants'
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

/* ─── Award icon SVGs ─── */
function AwardIcon({ icon }: { icon: string }) {
  const shared = 'w-10 h-10 stroke-[#2E9AC4]'
  switch (icon) {
    case 'trophy':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
        </svg>
      )
    case 'globe':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      )
    case 'mic':
      return (
        <svg className={shared} viewBox="0 0 24 24" fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      )
    default:
      return null
  }
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
        background:
          'linear-gradient(180deg, #FFFFFF 0%, #0A0E17 5%, #0A0E17 95%, #FFFFFF 100%)',
      }}
    >
      {/* ── Star-like dots overlay ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 30% 65%, rgba(255,255,255,0.1) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 55% 15%, rgba(255,255,255,0.12) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 70% 45%, rgba(255,255,255,0.08) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 85% 80%, rgba(255,255,255,0.1) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 20% 90%, rgba(255,255,255,0.07) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 45% 40%, rgba(255,255,255,0.09) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.11) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 60% 75%, rgba(255,255,255,0.06) 1px, transparent 0), ' +
            'radial-gradient(1px 1px at 5% 55%, rgba(255,255,255,0.08) 1px, transparent 0)',
          backgroundSize: '100% 100%',
        }}
      />

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
                color: '#FFFFFF',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Ergebnisse, die f&uuml;r sich{' '}
              <span
                style={{
                  fontFamily: 'var(--font-accent)',
                  fontSize: '110%',
                  color: '#56B8DE',
                }}
              >
                sprechen
              </span>
            </h2>

            {/* Subline */}
            <p
              className="mx-auto mt-6"
              style={{
                fontSize: '17px',
                color: 'rgba(255,255,255,0.6)',
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
            {AGGREGATE_METRICS.map((m, i) => (
              <ScrollReveal key={m.label} delay={i * 0.1}>
                <div
                  className="relative text-center p-10"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(46,154,196,0.08)',
                  }}
                >
                  {/* Top glow line */}
                  <div
                    aria-hidden="true"
                    className="absolute top-0 left-[20%] right-[20%] h-px"
                    style={{
                      background:
                        'linear-gradient(to right, transparent, #2E9AC4, transparent)',
                    }}
                  />

                  {/* Value */}
                  <div className="text-gradient-white-blue">
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
                      color: 'rgba(255,255,255,0.4)',
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
                        color: '#FFFFFF',
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
                        color: 'rgba(255,255,255,0.45)',
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
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      {cs.accentPhrase}{' '}
                      <span
                        style={{
                          fontFamily: 'var(--font-accent)',
                          fontSize: '110%',
                          color: '#56B8DE',
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
                        color: 'rgba(255,255,255,0.65)',
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
                          color: 'rgba(255,255,255,0.6)',
                          maxWidth: '480px',
                        }}
                      >
                        <p>&ldquo;{(cs as typeof CASE_STUDIES[4]).quote!.text}&rdquo;</p>
                        <footer
                          className="mt-2"
                          style={{
                            fontStyle: 'normal',
                            fontSize: '12px',
                            color: 'rgba(255,255,255,0.4)',
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
                          className="flex flex-col p-4 px-5 rounded-xl"
                          style={{
                            background: 'rgba(46,154,196,0.06)',
                            border: '1px solid rgba(46,154,196,0.1)',
                            minWidth: '100px',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontWeight: 800,
                              fontSize: '24px',
                              color: '#FFFFFF',
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
                              color: 'rgba(255,255,255,0.35)',
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
                        borderRadius: '16px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(46,154,196,0.08)',
                      }}
                    >
                      {/* Top glow line */}
                      <div
                        aria-hidden="true"
                        className="absolute top-0 left-[15%] right-[15%] h-px z-10"
                        style={{
                          background:
                            'linear-gradient(to right, transparent, #2E9AC4, transparent)',
                        }}
                      />

                      {/* Inner radial glow */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background:
                            'radial-gradient(ellipse at 50% 30%, rgba(46,154,196,0.05) 0%, transparent 70%)',
                        }}
                      />

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

        {/* ═══════════════════════════════════
            4. TESTIMONIAL MARQUEE
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div className="py-[clamp(48px,6vw,96px)]">
            <TestimonialMarquee />
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            5. MEDIA APPEARANCES
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div className="max-w-[1440px] mx-auto px-[clamp(24px,5vw,80px)] py-[clamp(48px,6vw,96px)]">
            <MediaAppearances />
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            6. AWARDS ROW
            ═══════════════════════════════════ */}
        <div className="max-w-[1200px] mx-auto px-[clamp(24px,5vw,80px)] py-[clamp(48px,6vw,96px)]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {AWARDS.map((award, i) => (
              <ScrollReveal key={award.title} delay={i * 0.15}>
                <div
                  className="p-8 rounded-2xl text-center"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(46,154,196,0.08)',
                  }}
                >
                  <div className="flex justify-center">
                    <AwardIcon icon={award.icon} />
                  </div>
                  <h4
                    className="mt-4"
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 700,
                      fontSize: '18px',
                      color: '#FFFFFF',
                    }}
                  >
                    {award.title}
                  </h4>
                  <p
                    className="mt-2"
                    style={{
                      fontSize: '14px',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {award.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════
            7. SECTION CTA
            ═══════════════════════════════════ */}
        <ScrollReveal>
          <div
            className="text-center mx-auto mt-24 px-[clamp(24px,5vw,80px)] pb-[clamp(48px,6vw,96px)]"
            style={{ maxWidth: '600px' }}
          >
            {/* Tagline */}
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#2E9AC4',
              }}
            >
              BEREIT F&Uuml;R DEIN N&Auml;CHSTES KAPITEL?
            </p>

            {/* Headline */}
            <h3
              className="mt-6"
              style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: 'clamp(32px, 4vw, 56px)',
                color: '#FFFFFF',
                lineHeight: 1.15,
                letterSpacing: '-0.03em',
              }}
            >
              Lass uns &uuml;ber{' '}
              <span
                style={{
                  fontFamily: 'var(--font-accent)',
                  fontSize: '115%',
                  color: '#56B8DE',
                }}
              >
                dein Wachstum
              </span>{' '}
              sprechen.
            </h3>

            {/* CTA Button */}
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 mt-8 px-8 py-4 rounded-full transition-all duration-300"
              style={{
                background: '#FFFFFF',
                color: '#0A0E17',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '15px',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget
                el.style.background =
                  'linear-gradient(to right, #56B8DE, #2E9AC4, #1B7EA6)'
                el.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget
                el.style.background = '#FFFFFF'
                el.style.color = '#0A0E17'
              }}
            >
              Jetzt Termin sichern
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
