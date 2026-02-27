'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface HeroProps {
  introComplete: boolean
}

const METRICS = [
  { value: 400, suffix: '+', label: 'Brands betreut' },
  { value: 1, prefix: '€', suffix: 'B+', label: 'Portfolio Revenue' },
  { value: 12, prefix: '€', suffix: 'M+', label: 'Monatlicher Adspend' },
]

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

function AnimatedNumber({
  end,
  prefix = '',
  suffix = '',
  duration = 2000,
  delay = 0,
  started,
}: {
  end: number
  prefix?: string
  suffix?: string
  duration?: number
  delay?: number
  started: boolean
}) {
  const [current, setCurrent] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (!started) return
    const startTime = Date.now() + delay
    const animate = () => {
      const now = Date.now()
      if (now < startTime) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out quart
      const eased = 1 - Math.pow(1 - progress, 4)
      setCurrent(Math.round(end * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [started, end, duration, delay])

  return (
    <span>
      {prefix}
      {current}
      {suffix}
    </span>
  )
}

export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)

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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: '#0a0a1a',
      }}
    >
      {/* Animated Gradient Background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'radial-gradient(ellipse at 20% 50%, rgba(46,154,196,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(86,184,222,0.1) 0%, transparent 40%), radial-gradient(ellipse at 50% 80%, rgba(27,126,166,0.12) 0%, transparent 45%), #0a0a1a',
        }}
      >
        {/* Floating orbs */}
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0], scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '20%',
            left: '15%',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(46,154,196,0.12) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{ x: [0, -25, 35, 0], y: [0, 30, -25, 0], scale: [1, 0.8, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            right: '10%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(86,184,222,0.1) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{ x: [0, 20, -15, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '40%',
            width: 350,
            height: 350,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(27,126,166,0.1) 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(46,154,196,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(46,154,196,0.03) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 900,
        }}
      >
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Wir Skalieren{' '}
          <span className="text-blue-gradient">deine brand!</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 0.6, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(1rem, 1.5vw, 1.25rem)',
            color: '#FFFFFF',
            marginTop: 16,
            maxWidth: 600,
          }}
        >
          Der Growth Partner für E-Commerce Brands im DACH-Raum
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {/* Primary CTA */}
          <motion.a
            href="#contact"
            whileHover={{
              scale: 1.04,
              boxShadow: '0 8px 32px rgba(46, 154, 196, 0.5)',
            }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              background: 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
              color: '#FFFFFF',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 24px rgba(46, 154, 196, 0.35)',
              transition: 'box-shadow 0.3s ease',
            }}
          >
            Erstgespräch vereinbaren
          </motion.a>

          {/* Secondary CTA */}
          <motion.a
            href="#cases"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 32px',
              background: 'transparent',
              color: '#56B8DE',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1px solid rgba(46, 154, 196, 0.4)',
              transition: 'border-color 0.3s ease, background 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(46, 154, 196, 0.12)'
              e.currentTarget.style.borderColor = 'rgba(46, 154, 196, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.borderColor = 'rgba(46, 154, 196, 0.4)'
            }}
          >
            Case Studies ansehen
          </motion.a>
        </motion.div>

        {/* Metrics Bubbles */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 60,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {METRICS.map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 40 }}
              animate={
                show
                  ? {
                      opacity: 1,
                      y: [0, -8, 0],
                    }
                  : {}
              }
              transition={
                show
                  ? {
                      opacity: { duration: 0.7, delay: 0.4 + i * 0.1, ease: EASE_OUT_EXPO },
                      y: {
                        duration: 4,
                        delay: 0.4 + i * 0.1 + 0.7,
                        repeat: Infinity,
                        repeatType: 'loop' as const,
                        ease: 'easeInOut',
                      },
                    }
                  : {}
              }
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 20,
                padding: '24px 32px',
                minWidth: 160,
                textAlign: 'center',
                cursor: 'default',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.1,
                }}
              >
                <AnimatedNumber
                  end={metric.value}
                  prefix={metric.prefix || ''}
                  suffix={metric.suffix}
                  started={show}
                  delay={400 + i * 100}
                />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 13,
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: 6,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
