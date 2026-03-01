'use client'

import { useState } from 'react'
import ScrollReveal from '@/components/ui/ScrollReveal'
import { MEDIA_APPEARANCES } from '@/lib/constants'

/* ============================================
   IRON MEDIA — FEATURED IN v5.5
   Podcast & Video Appearance Cards
   ============================================ */

/* ─── Platform badge color map ─── */
function getPlatformStyle(platform: string): { bg: string; color: string } {
  switch (platform) {
    case 'Spotify':
      return { bg: 'rgba(30,215,96,0.1)', color: '#1DB954' }
    case 'YouTube':
      return { bg: 'rgba(255,0,0,0.08)', color: '#FF0000' }
    case 'Podcast':
    default:
      return { bg: 'rgba(46,154,196,0.08)', color: '#2E9AC4' }
  }
}

/* ─── Play Button SVG ─── */
function PlayButton() {
  return (
    <div
      className="play-btn"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 56,
        height: 56,
        borderRadius: '50%',
        background: 'rgba(46,154,196,0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease',
        boxShadow: '0 4px 20px rgba(46,154,196,0.3)',
        zIndex: 5,
      }}
    >
      <svg width="20" height="22" viewBox="0 0 20 22" fill="none">
        <path
          d="M2 1.5L18 11L2 20.5V1.5Z"
          fill="#FFFFFF"
          stroke="#FFFFFF"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/* ─── Mini Decorative Bars ─── */
function MiniBars() {
  const bars = [
    { left: '18%', height: 24, opacity: 0.06 },
    { left: '32%', height: 40, opacity: 0.08 },
    { left: '50%', height: 56, opacity: 0.1 },
    { left: '68%', height: 36, opacity: 0.07 },
  ]

  return (
    <>
      {bars.map((bar, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: 0,
            left: bar.left,
            width: 12,
            height: bar.height,
            borderRadius: '4px 4px 0 0',
            background: `linear-gradient(180deg, rgba(46,154,196,${bar.opacity}), rgba(46,154,196,${bar.opacity * 0.3}))`,
            transform: 'translateX(-50%)',
            zIndex: 1,
          }}
        />
      ))}
    </>
  )
}

/* ─── Thumbnail Fallback ─── */
function ThumbnailFallback({ podcastName }: { podcastName: string }) {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(135deg, #F4F7FA 0%, rgba(46,154,196,0.08) 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      {/* Mini decorative bars */}
      <MiniBars />
      {/* Podcast name as large styled text */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 18,
        color: '#1A1A2E',
        textAlign: 'center',
        opacity: 0.15,
        letterSpacing: '-0.02em',
        lineHeight: 1.2,
        position: 'relative',
        zIndex: 2,
        maxWidth: '80%',
      }}>
        {podcastName}
      </span>
    </div>
  )
}

/* ─── Thumbnail Image with fallback ─── */
function ThumbnailImage({ src, alt, podcastName }: { src: string; alt: string; podcastName: string }) {
  const [failed, setFailed] = useState(false)

  if (failed) return <ThumbnailFallback podcastName={podcastName} />

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  )
}

/* ─── Background Growth Curve SVG ─── */
function BackgroundCurve() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{ overflow: 'hidden' }}
    >
      <svg
        viewBox="0 0 1200 600"
        fill="none"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          top: '10%',
          left: 0,
          width: '100%',
          height: '80%',
          opacity: 0.03,
        }}
      >
        <path
          d="M0 500 C200 480 400 420 600 300 C800 180 1000 80 1200 40"
          stroke="#2E9AC4"
          strokeWidth={3}
          fill="none"
        />
        <path
          d="M0 500 C200 480 400 420 600 300 C800 180 1000 80 1200 40 L1200 600 L0 600 Z"
          fill="url(#curveFill)"
        />
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E9AC4" stopOpacity={0.04} />
            <stop offset="100%" stopColor="#2E9AC4" stopOpacity={0} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

/* ─── Appearance Card ─── */
function AppearanceCard({
  item,
}: {
  item: {
    title: string
    podcast: string
    platform: string
    url?: string
    description: string
    thumbnail?: string
  }
}) {
  const platformStyle = getPlatformStyle(item.platform)

  const cardContent = (
    <div
      className="appearance-card"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: item.url ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow =
          '0 12px 40px rgba(46,154,196,0.12), 0 2px 8px rgba(0,0,0,0.04)'
        e.currentTarget.style.borderColor = 'rgba(46,154,196,0.2)'
        const playBtn = e.currentTarget.querySelector('.play-btn') as HTMLElement | null
        if (playBtn) {
          playBtn.style.background = '#2E9AC4'
          playBtn.style.transform = 'translate(-50%, -50%) scale(1.08)'
          playBtn.style.boxShadow = '0 6px 28px rgba(46,154,196,0.4)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#E2E8F0'
        const playBtn = e.currentTarget.querySelector('.play-btn') as HTMLElement | null
        if (playBtn) {
          playBtn.style.background = 'rgba(46,154,196,0.9)'
          playBtn.style.transform = 'translate(-50%, -50%) scale(1)'
          playBtn.style.boxShadow = '0 4px 20px rgba(46,154,196,0.3)'
        }
      }}
    >
      {/* Thumbnail area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #F4F7FA 0%, rgba(46,154,196,0.08) 100%)',
        }}
      >
        {/* Thumbnail image or styled fallback */}
        {item.thumbnail ? (
          <ThumbnailImage src={item.thumbnail} alt={item.title} podcastName={item.podcast} />
        ) : (
          <ThumbnailFallback podcastName={item.podcast} />
        )}

        {/* Play button */}
        <PlayButton />

        {/* Platform badge */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '4px 10px',
            borderRadius: 999,
            background: platformStyle.bg,
            color: platformStyle.color,
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            fontSize: 10,
            letterSpacing: '0.05em',
            zIndex: 5,
          }}
        >
          {item.platform}
        </div>
      </div>

      {/* Content area */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Podcast name */}
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.05em',
            color: '#94A3B8',
            margin: 0,
            marginBottom: 8,
          }}
        >
          {item.podcast}
        </p>

        {/* Episode title */}
        <h4
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 16,
            lineHeight: 1.35,
            color: '#1A1A2E',
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {item.title}
        </h4>

        {/* Description */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            lineHeight: 1.5,
            color: '#4A5568',
            margin: 0,
            marginTop: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const,
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>
      </div>
    </div>
  )

  if (item.url) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', display: 'block', height: '100%' }}
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
}

/* ============================================
   FEATURED IN — Main Section Component
   ============================================ */
export default function FeaturedIn() {
  return (
    <section
      id="featured"
      className="relative w-full overflow-hidden"
      style={{ background: '#FFFFFF' }}
    >
      {/* ── Background growth curve ── */}
      <BackgroundCurve />

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
              FEATURED IN
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
              Podcasts &amp; Auftritte
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
              Sebastian Szalinski als Speaker und Gast in f&uuml;hrenden Podcasts
              der Branche.
            </p>
          </div>
        </ScrollReveal>

        {/* ═══════════════════════════════════
            2. CARD GRID
            ═══════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MEDIA_APPEARANCES.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.1}>
              <AppearanceCard item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}
