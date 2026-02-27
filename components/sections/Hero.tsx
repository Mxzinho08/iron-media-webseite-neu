'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Spline from '@splinetool/react-spline'
import { PARTNERS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO
   Spline 3D BG + Title + CTA + Trusted By
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const SPLINE_SCENE_URL = 'https://prod.spline.design/9jQ7udEHftQjbDVL/scene.splinecode'

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---- Partner SVG Logos ---- */
function MetaLogo() {
  return (
    <svg viewBox="0 0 512 110" fill="currentColor" height="22">
      <path d="M81.8 9.4C73 1.6 62.2 0 55.5 0c-13 0-24.5 7.6-33.4 20.3C14.2 31.7 8.5 47.6 8.5 62.8c0 10.2 2.5 18.7 7.3 24.6 4.5 5.6 10.8 8.5 18.2 8.5 6.6 0 12.6-2.3 18.8-8.6 5.4-5.6 11-14 17.4-26.3l3.1-6c5-9.6 8.5-15.6 11.6-19.8 4-5.4 8.3-9.6 13.2-12.5C103.2 19.4 109 18 115.4 18c11.8 0 22.4 5.3 30 15C153.8 43.2 158 57.2 158 73.5c0 17-4.7 31-13.6 40.4-8.5 9-20 13.6-33.3 13.6v-22.7c16.2 0 24.2-12.2 24.2-31.1 0-10-2.3-18.1-6.6-23.5-3.8-4.8-8.8-7.1-15-7.1-7 0-13 3.7-19.4 13.4-3.5 5.3-7.1 12-12 21.7l-2.6 5.1c-6.6 12.9-11.4 21-15.8 26.8C56.8 100 48 104.8 36.3 104.8 23.3 104.8 13 99.7 6.3 90.2.8 82.4-1.5 72.2-1.5 61.5c0-18.2 6.5-37.2 16.2-50.5C25.8-4 40.3-12.8 56-12.8c10.5 0 19.7 3.5 26 9.5l-.2 12.7z" transform="translate(0 6) scale(.73)" />
      <path d="M226.1 78.3c-6.5 14.4-19.5 24.2-35 24.2-20.8 0-36.2-16.8-36.2-44.5 0-27.6 15.4-44.5 36.2-44.5 15.8 0 29 10.2 35.2 25v-2.7c0-32.2-14.2-49.3-37-49.3-14.6 0-26.5 6.6-35.8 19.5l-12-14.8C152.3 3.6 168.5-5 188.4-5c30.7 0 51.6 23 51.6 62.5v43.2h-13.9v-22.4zm-35-2c12.3 0 23-8 28-18V46.6c-5-10-15.7-18-28-18-14 0-23.3 12-23.3 26.8 0 14.9 9.3 26.9 23.3 26.9z" transform="translate(10 6) scale(.73)" />
      <path d="M280.7 13.5h-22.2V-2.8h22.2v-25.6l21.7-6.6v32.2h27v16.3h-27v46.2c0 13.7 4.3 19 14.6 19 4.7 0 9.2-1 13.3-3.2v17c-5.3 2.6-11 4-17.7 4-19.8 0-31.9-11.5-31.9-35.5V13.5z" transform="translate(10 6) scale(.73)" />
      <path d="M385.4 94.7c-7.7 5.8-17.5 9-28.3 9-27 0-45.5-19.2-45.5-47.4 0-27.2 18.8-45.3 44.5-45.3 23.8 0 40 16.7 40 42.3v9h-63c1.5 16.2 12.4 25.8 27 25.8 9.2 0 17-3.5 23.4-10l1.9 16.6zm-52.3-46.8H375c-1-14-9.5-22.5-22-22.5-12.2 0-21 8.7-20 22.5z" transform="translate(10 6) scale(.73)" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 272 92" fill="currentColor" height="20">
      <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" />
      <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" />
      <path d="M225 3v65h-9.5V3h9.5z" />
      <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" />
      <path d="M35.29 41.19V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49-.21z" />
    </svg>
  )
}

function TikTokLogo() {
  return (
    <svg viewBox="0 0 2859 814" fill="currentColor" height="18">
      <path d="M548.5 0h166.2v667.1H548.5V0zm443.3 180.6H825.7V0h-82v180.6H632v138h111.7v216.7c0 54 10.5 99.8 48 137.2 36.3 36.3 83.7 51 140.5 51 39 0 73.5-7.3 96-15.8V569.5c-16.5 7-40 12.3-63.2 12.3-62.5 0-89.5-42-89.5-94.5V318.6h166.3v-138zM0 180.6h114.2l5.3 73.5h.8c39-57.2 100-85 165.5-85 63.2 0 115.7 23.5 152.2 66.2 40.3 47 58.2 111.8 58.2 192v240h-166V443.5c0-70.5-26-120.2-85-120.2-42.8 0-72 25.3-85 62.5-3.8 11.5-6 26.7-6 42.5v239h-154V180.6zm1839 0h114l5.3 73.5h.8c39-57.2 100-85 165.5-85 63.2 0 115.7 23.5 152.2 66.2 40.3 47 58.2 111.8 58.2 192v240h-166V443.5c0-70.5-26-120.2-85-120.2-42.8 0-72 25.3-85 62.5-3.8 11.5-6 26.7-6 42.5v239h-154V180.6zm-534.3-3.8c-180 0-296.8 133-296.8 311s116.8 311 296.8 311 296.8-133 296.8-311-116.8-311-296.8-311zm0 481.7c-71.5 0-130.5-66-130.5-170.5s59-170.5 130.5-170.5 130.5 66 130.5 170.5-59 170.5-130.5 170.5z" transform="scale(.29)" />
    </svg>
  )
}

function PinterestLogo() {
  return (
    <svg viewBox="0 0 384 128" fill="currentColor" height="18">
      <text fontFamily="Arial, sans-serif" fontWeight="700" fontSize="96" y="92" x="0" letterSpacing="-2">Pinterest</text>
    </svg>
  )
}

function TaboolaLogo() {
  return (
    <svg viewBox="0 0 384 96" fill="currentColor" height="18">
      <text fontFamily="Arial, sans-serif" fontWeight="700" fontSize="80" y="74" x="0" letterSpacing="-1">Taboola</text>
    </svg>
  )
}

const PARTNER_LOGOS: { name: string; Logo: () => JSX.Element }[] = [
  { name: 'Meta', Logo: MetaLogo },
  { name: 'Google', Logo: GoogleLogo },
  { name: 'TikTok', Logo: TikTokLogo },
  { name: 'Pinterest', Logo: PinterestLogo },
  { name: 'Taboola', Logo: TaboolaLogo },
]

export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
    }
  }, [introComplete])

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* ====== LAYER 0 — Spline 3D Background ====== */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <Spline scene={SPLINE_SCENE_URL} />
      </div>

      {/* ====== LAYER 1 — Content ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          padding: 'clamp(20px, 5vw, 80px)',
          maxWidth: 900,
          textAlign: 'center',
        }}
      >
        {/* ---- Title ---- */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 6vw, 80px)',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            color: '#1A1A2E',
            margin: 0,
          }}
        >
          E-Commerce Brands
          <br />
          wachsen mit uns
          <br />
          <span className="text-blue-gradient">unaufhaltbar.</span>
        </motion.h1>

        {/* ---- Subline ---- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.35, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 'clamp(15px, 1.3vw, 19px)',
            lineHeight: 1.6,
            color: 'var(--text-medium)',
            maxWidth: 520,
            marginTop: 20,
          }}
        >
          Die führende DACH-Agentur für Performance Marketing, Shopify &amp; D2C-Wachstum.
        </motion.p>

        {/* ---- CTA ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5, ease: EASE_OUT_EXPO }}
          style={{ marginTop: 36 }}
        >
          <a
            href="#contact"
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 36px',
              background: ctaHovered
                ? 'linear-gradient(135deg, #3AADD4, #2490B8)'
                : 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
              color: '#FFFFFF',
              borderRadius: 12,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 16,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              boxShadow: ctaHovered
                ? '0 8px 30px rgba(46,154,196,0.4), 0 4px 12px rgba(0,0,0,0.1)'
                : '0 4px 20px rgba(46,154,196,0.25), 0 2px 8px rgba(0,0,0,0.06)',
              transform: ctaHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            Kostenloses Audit starten
          </a>
        </motion.div>
      </div>

      {/* ====== LAYER 2 — Trusted By ====== */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.7, ease: EASE_OUT_EXPO }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          paddingBottom: 48,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--text-light)',
          }}
        >
          Trusted by
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            flexWrap: 'wrap',
            padding: '0 24px',
          }}
        >
          {PARTNER_LOGOS.map(({ name, Logo }) => (
            <div
              key={name}
              title={name}
              style={{
                color: 'var(--text-muted)',
                opacity: 0.5,
                transition: 'opacity 300ms ease, color 300ms ease',
                display: 'flex',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85'
                e.currentTarget.style.color = 'var(--text-medium)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.5'
                e.currentTarget.style.color = 'var(--text-muted)'
              }}
            >
              <Logo />
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
