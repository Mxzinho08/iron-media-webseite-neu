'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

interface IntroAnimationProps {
  onComplete: () => void
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  color: string
  opacity: number
  life: number
  maxLife: number
  gravity: number
}

interface Splatter {
  x: number
  y: number
  radius: number
  targetRadius: number
  color: string
  opacity: number
  speed: number
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
  textMedium: '#666666',
} as const

const TOTAL_DURATION = 4500
const BAR_CONFIG = {
  width: 10,
  gap: 5,
  bar1: { height: 55, color: COLORS.skyBlue },
  bar2: { height: 75, color: COLORS.oceanBlue },
  bar3: { height: 60, color: COLORS.deepTeal },
} as const

// ─────────────────────────────────────────────
// SPRING PHYSICS
// ─────────────────────────────────────────────

class Spring {
  position: number
  velocity: number
  target: number
  stiffness: number
  damping: number
  mass: number

  constructor(
    initial: number,
    target: number,
    stiffness = 280,
    damping = 10,
    mass = 1.5
  ) {
    this.position = initial
    this.velocity = 0
    this.target = target
    this.stiffness = stiffness
    this.damping = damping
    this.mass = mass
  }

  step(dt: number): number {
    const displacement = this.position - this.target
    const springForce = -this.stiffness * displacement
    const dampingForce = -this.damping * this.velocity
    const acceleration = (springForce + dampingForce) / this.mass
    this.velocity += acceleration * dt
    this.position += this.velocity * dt
    return this.position
  }

  isSettled(threshold = 0.01): boolean {
    return (
      Math.abs(this.position - this.target) < threshold &&
      Math.abs(this.velocity) < threshold
    )
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bar1Ref = useRef<HTMLDivElement>(null)
  const bar2Ref = useRef<HTMLDivElement>(null)
  const bar3Ref = useRef<HTMLDivElement>(null)
  const logoGroupRef = useRef<HTMLDivElement>(null)
  const ironTextRef = useRef<HTMLDivElement>(null)
  const mediaTextRef = useRef<HTMLDivElement>(null)
  const curveContainerRef = useRef<HTMLDivElement>(null)
  const skipBtnRef = useRef<HTMLButtonElement>(null)
  const skipRingRef = useRef<SVGCircleElement>(null)
  const flashRef = useRef<HTMLDivElement>(null)
  const impactRingRef = useRef<SVGSVGElement>(null)
  const anticipationRef = useRef<HTMLDivElement>(null)
  const blueOverlayRef = useRef<HTMLDivElement>(null)
  const chartSvgRef = useRef<SVGSVGElement>(null)
  const chartPathRef = useRef<SVGPathElement>(null)
  const skalierungTextRef = useRef<HTMLDivElement>(null)

  // Animation state refs
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const rafIdRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const splattersRef = useRef<Splatter[]>([])
  const isCompletedRef = useRef(false)
  const startTimeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)

  // ─────────────────────────────────────────
  // PARTICLE SYSTEM
  // ─────────────────────────────────────────

  const spawnImpactParticles = useCallback(
    (cx: number, cy: number, count: number, intensity: number) => {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5
        const speed = (3 + Math.random() * 6) * intensity
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          radius: 1.5 + Math.random() * 3,
          color: [COLORS.skyBlue, COLORS.oceanBlue, COLORS.deepTeal][
            Math.floor(Math.random() * 3)
          ],
          opacity: 0.8 + Math.random() * 0.2,
          life: 0,
          maxLife: 600 + Math.random() * 400,
          gravity: 0.08,
        })
      }
    },
    []
  )

  const spawnSplatters = useCallback((cx: number, cy: number) => {
    const splatterColors = [COLORS.skyBlue, COLORS.oceanBlue, COLORS.deepTeal]
    for (let i = 0; i < 50; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 6
      const colorIdx = Math.floor(Math.random() * splatterColors.length)
      splattersRef.current.push({
        x: cx + Math.cos(angle) * (Math.random() * 30),
        y: cy + Math.sin(angle) * (Math.random() * 30),
        radius: 5 + Math.random() * 10,
        targetRadius: 200 + Math.random() * 400,
        color: splatterColors[colorIdx],
        opacity: 0.85 + Math.random() * 0.15,
        speed: speed,
      })
    }
  }, [])

  // ─────────────────────────────────────────
  // CANVAS RENDER LOOP
  // ─────────────────────────────────────────

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = performance.now()
    const dt = Math.min(now - lastFrameTimeRef.current, 33) // cap at ~30fps delta
    lastFrameTimeRef.current = now
    const dtNorm = dt / 16.67 // normalize to ~60fps

    canvas.width = window.innerWidth * window.devicePixelRatio
    canvas.height = window.innerHeight * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // Update & draw particles
    particlesRef.current = particlesRef.current.filter((p) => {
      p.life += dt
      if (p.life > p.maxLife) return false
      p.vy += p.gravity * dtNorm
      p.x += p.vx * dtNorm
      p.y += p.vy * dtNorm
      p.opacity = Math.max(0, 1 - p.life / p.maxLife)
      p.radius *= 0.995

      ctx.beginPath()
      ctx.arc(p.x, p.y, Math.max(0.5, p.radius), 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.opacity
      ctx.fill()
      ctx.globalAlpha = 1
      return true
    })

    // Update & draw splatters
    splattersRef.current.forEach((s) => {
      // Grow radius toward target
      const growSpeed = s.speed * dtNorm * 3
      if (s.radius < s.targetRadius) {
        s.radius = Math.min(s.radius + growSpeed, s.targetRadius)
      }

      ctx.beginPath()
      ctx.arc(s.x, s.y, Math.max(1, s.radius), 0, Math.PI * 2)
      ctx.fillStyle = s.color
      ctx.globalAlpha = s.opacity
      ctx.fill()
      ctx.globalAlpha = 1
    })

    rafIdRef.current = requestAnimationFrame(renderCanvas)
  }, [])

  // ─────────────────────────────────────────
  // SKIP HANDLER
  // ─────────────────────────────────────────

  const handleSkip = useCallback(() => {
    if (isCompletedRef.current) return
    isCompletedRef.current = true

    const tl = timelineRef.current
    if (tl) {
      tl.pause()
      tl.kill()
    }

    // Quick skip animation
    const skipTl = gsap.timeline({
      onComplete: () => {
        onComplete()
      },
    })

    skipTl
      .to(
        [bar1Ref.current, bar2Ref.current, bar3Ref.current],
        {
          scale: 0,
          opacity: 0,
          duration: 0.15,
          ease: 'power2.in',
        },
        0
      )
      .to(
        [ironTextRef.current, mediaTextRef.current, curveContainerRef.current],
        {
          opacity: 0,
          duration: 0.1,
        },
        0
      )
      .to(
        [blueOverlayRef.current, chartSvgRef.current, skalierungTextRef.current],
        {
          opacity: 0,
          duration: 0.1,
        },
        0
      )
      .to(
        containerRef.current,
        {
          opacity: 0,
          duration: 0.4,
          delay: 0.1,
        },
        0.1
      )
  }, [onComplete])

  // ─────────────────────────────────────────
  // MAIN ANIMATION SETUP
  // ─────────────────────────────────────────

  useEffect(() => {
    // Reduced motion check
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (prefersReduced) {
      onComplete()
      return
    }

    // Canvas setup
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
    }

    // Start canvas loop
    lastFrameTimeRef.current = performance.now()
    startTimeRef.current = performance.now()
    rafIdRef.current = requestAnimationFrame(renderCanvas)

    // Center coordinates
    const cx = window.innerWidth / 2
    const cy = window.innerHeight / 2

    // Bar positions (centered)
    const totalWidth = BAR_CONFIG.width * 3 + BAR_CONFIG.gap * 2
    const barsLeft = cx - totalWidth / 2

    // Initial state - hide everything
    gsap.set([bar1Ref.current, bar2Ref.current, bar3Ref.current], {
      opacity: 0,
    })
    gsap.set([ironTextRef.current, mediaTextRef.current], { opacity: 0 })
    gsap.set(curveContainerRef.current, { opacity: 0 })
    gsap.set(skipBtnRef.current, { opacity: 0, scale: 0.8 })
    gsap.set(flashRef.current, { opacity: 0 })
    gsap.set(impactRingRef.current, { opacity: 0 })
    gsap.set(blueOverlayRef.current, { opacity: 0 })
    gsap.set(chartSvgRef.current, { opacity: 0 })
    gsap.set(skalierungTextRef.current, { opacity: 0 })

    // Position bars at their targets (for reference)
    const bar2TargetY = cy - BAR_CONFIG.bar2.height / 2
    const bar1TargetX = barsLeft
    const bar2TargetX = barsLeft + BAR_CONFIG.width + BAR_CONFIG.gap
    const bar3TargetX =
      barsLeft + (BAR_CONFIG.width + BAR_CONFIG.gap) * 2

    // Set bars to their positions
    gsap.set(bar1Ref.current, {
      x: bar1TargetX,
      y: cy - BAR_CONFIG.bar1.height / 2,
    })
    gsap.set(bar2Ref.current, {
      x: bar2TargetX,
      y: bar2TargetY,
    })
    gsap.set(bar3Ref.current, {
      x: bar3TargetX,
      y: cy - BAR_CONFIG.bar3.height / 2,
    })

    // ─── BUILD MASTER TIMELINE ───

    const tl = gsap.timeline({
      onComplete: () => {
        if (!isCompletedRef.current) {
          isCompletedRef.current = true
          onComplete()
        }
      },
    })
    timelineRef.current = tl

    // ═══════════════════════════════════════
    // PHASE 1: ENTRANCE (0ms - 1500ms)
    // Original was 0-2500ms, compressed by 0.6x
    // ═══════════════════════════════════════

    // T=0-120ms: Anticipation pulse (was 0-200ms)
    tl.fromTo(
      anticipationRef.current,
      { scale: 0.5, opacity: 0 },
      {
        scale: 1.5,
        opacity: 0.6,
        duration: 0.12,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
      },
      0
    )

    // T=120-330ms: Bar 2 falls from above with gravity simulation (was 200-550ms)
    tl.set(bar2Ref.current, { opacity: 1, y: -100, scaleY: 1.3, scaleX: 0.85 }, 0.12)
    tl.to(
      bar2Ref.current,
      {
        y: bar2TargetY,
        scaleY: 1.0,
        scaleX: 1.0,
        duration: 0.21,
        ease: 'power2.in',
      },
      0.12
    )

    // Trailing ghost effect for bar 2 fall
    const ghost1 = document.createElement('div')
    const ghost2 = document.createElement('div')
    const ghost3 = document.createElement('div')
    const ghosts = [ghost1, ghost2, ghost3]
    ghosts.forEach((g, i) => {
      g.style.cssText = `
        position: absolute; top: 0; left: 0;
        width: ${BAR_CONFIG.width}px; height: ${BAR_CONFIG.bar2.height}px;
        background: ${COLORS.oceanBlue};
        border-radius: 999px;
        opacity: 0;
        pointer-events: none;
        will-change: transform, opacity;
      `
      containerRef.current?.appendChild(g)
      gsap.set(g, { x: bar2TargetX, opacity: 0 })
    })

    // Animate ghosts during bar2 fall
    tl.to(
      {},
      {
        duration: 0.21,
        onUpdate: function () {
          const progress = this.progress()
          if (bar2Ref.current) {
            const currentY = gsap.getProperty(bar2Ref.current, 'y') as number
            ghosts.forEach((g, i) => {
              const delay = (i + 1) * 0.12
              const ghostProgress = Math.max(0, progress - delay)
              if (ghostProgress > 0 && progress < 0.95) {
                const ghostY = -100 + (currentY - (-100)) * (ghostProgress / Math.max(0.01, progress))
                gsap.set(g, {
                  y: ghostY,
                  opacity: (0.4 - i * 0.12) * (1 - progress),
                  scaleY: 1.3 - (1.3 - 1.0) * (ghostProgress / Math.max(0.01, progress)),
                  scaleX: 0.85 + (1.0 - 0.85) * (ghostProgress / Math.max(0.01, progress)),
                })
              }
            })
          }
        },
      },
      0.12
    )

    // Clean ghosts after fall (was 0.55)
    tl.call(
      () => {
        ghosts.forEach((g) => {
          gsap.to(g, { opacity: 0, duration: 0.1, onComplete: () => g.remove() })
        })
      },
      [],
      0.33
    )

    // T=330ms: IMPACT! (was 550ms)
    // Squash
    tl.to(
      bar2Ref.current,
      {
        scaleX: 1.45,
        scaleY: 0.65,
        duration: 0.06,
        ease: 'power4.out',
      },
      0.33
    )

    // Impact ring
    tl.set(impactRingRef.current, { opacity: 1, scale: 0 }, 0.33)
    tl.to(
      impactRingRef.current,
      {
        scale: 2.5,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      },
      0.33
    )

    // Impact flash
    tl.to(
      flashRef.current,
      {
        opacity: 0.35,
        duration: 0.06,
        yoyo: true,
        repeat: 1,
        ease: 'power4.out',
      },
      0.33
    )

    // Particles on impact
    tl.call(
      () => {
        spawnImpactParticles(
          bar2TargetX + BAR_CONFIG.width / 2,
          cy + BAR_CONFIG.bar2.height / 2 - 5,
          14,
          1.0
        )
      },
      [],
      0.33
    )

    // Screen shake
    tl.to(
      containerRef.current,
      {
        x: -4,
        y: 2,
        duration: 0.03,
        yoyo: true,
        repeat: 3,
        ease: 'none',
      },
      0.33
    )
    tl.set(containerRef.current, { x: 0, y: 0 }, 0.40)

    // T=378-618ms: Spring bounce sequence (was 630-1030ms)
    tl.to(
      bar2Ref.current,
      {
        scaleX: 0.88,
        scaleY: 1.18,
        duration: 0.06,
        ease: 'power2.out',
      },
      0.378
    )
    tl.to(
      bar2Ref.current,
      {
        scaleX: 1.12,
        scaleY: 0.88,
        duration: 0.05,
        ease: 'power2.inOut',
      },
      0.438
    )
    tl.to(
      bar2Ref.current,
      {
        scaleX: 0.96,
        scaleY: 1.06,
        duration: 0.04,
        ease: 'power2.inOut',
      },
      0.486
    )
    tl.to(
      bar2Ref.current,
      {
        scaleX: 1.02,
        scaleY: 0.98,
        duration: 0.04,
        ease: 'power2.inOut',
      },
      0.528
    )
    tl.to(
      bar2Ref.current,
      {
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 0.07,
        ease: 'power2.out',
      },
      0.564
    )

    // T=540-900ms: Bar 1 flies from left on parabolic arc (was 900-1500ms)
    tl.set(
      bar1Ref.current,
      {
        opacity: 1,
        x: -60,
        y: cy - BAR_CONFIG.bar1.height / 2 - 80,
        rotation: -15,
        scale: 0.7,
      },
      0.54
    )
    tl.to(
      bar1Ref.current,
      {
        x: bar1TargetX,
        y: cy - BAR_CONFIG.bar1.height / 2,
        rotation: 0,
        scale: 1.0,
        duration: 0.36,
        ease: 'power2.in',
        motionPath: undefined,
      },
      0.54
    )

    // Bar 1 landing impact (was 1.5)
    tl.call(
      () => {
        spawnImpactParticles(
          bar1TargetX + BAR_CONFIG.width / 2,
          cy + BAR_CONFIG.bar1.height / 2 - 5,
          8,
          0.7
        )
      },
      [],
      0.9
    )
    // Bar 1 squash on landing
    tl.to(
      bar1Ref.current,
      {
        scaleX: 1.25,
        scaleY: 0.78,
        duration: 0.05,
        ease: 'power4.out',
      },
      0.9
    )
    tl.to(
      bar1Ref.current,
      {
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 0.12,
        ease: 'elastic.out(1, 0.4)',
      },
      0.93
    )
    // Bar 2 wobble reaction to bar 1 landing
    tl.to(
      bar2Ref.current,
      {
        x: bar2TargetX + 1.5,
        duration: 0.04,
        yoyo: true,
        repeat: 3,
        ease: 'none',
      },
      0.9
    )
    tl.set(bar2Ref.current, { x: bar2TargetX }, 1.0)

    // Screen shake for bar 1
    tl.to(
      containerRef.current,
      {
        x: -2,
        y: 1,
        duration: 0.03,
        yoyo: true,
        repeat: 1,
        ease: 'none',
      },
      0.9
    )
    tl.set(containerRef.current, { x: 0, y: 0 }, 0.95)

    // T=720-1080ms: Bar 3 flies from right-bottom (was 1200-1800ms)
    tl.set(
      bar3Ref.current,
      {
        opacity: 1,
        x: window.innerWidth + 40,
        y: cy - BAR_CONFIG.bar3.height / 2 + 60,
        rotation: 12,
        scale: 0.75,
      },
      0.72
    )
    tl.to(
      bar3Ref.current,
      {
        x: bar3TargetX,
        y: cy - BAR_CONFIG.bar3.height / 2,
        rotation: 0,
        scale: 1.0,
        duration: 0.36,
        ease: 'power2.in',
      },
      0.72
    )

    // Bar 3 landing impact (was 1.8)
    tl.call(
      () => {
        spawnImpactParticles(
          bar3TargetX + BAR_CONFIG.width / 2,
          cy + BAR_CONFIG.bar3.height / 2 - 5,
          6,
          0.5
        )
      },
      [],
      1.08
    )
    // Bar 3 squash on landing
    tl.to(
      bar3Ref.current,
      {
        scaleX: 1.18,
        scaleY: 0.82,
        duration: 0.05,
        ease: 'power4.out',
      },
      1.08
    )
    tl.to(
      bar3Ref.current,
      {
        scaleX: 1.0,
        scaleY: 1.0,
        duration: 0.12,
        ease: 'elastic.out(1, 0.4)',
      },
      1.11
    )
    // Other bars wobble
    tl.to(
      bar1Ref.current,
      {
        x: bar1TargetX - 1,
        duration: 0.04,
        yoyo: true,
        repeat: 2,
        ease: 'none',
      },
      1.08
    )
    tl.set(bar1Ref.current, { x: bar1TargetX }, 1.15)
    tl.to(
      bar2Ref.current,
      {
        x: bar2TargetX - 1,
        duration: 0.04,
        yoyo: true,
        repeat: 2,
        ease: 'none',
      },
      1.08
    )
    tl.set(bar2Ref.current, { x: bar2TargetX }, 1.15)

    // Screen shake for bar 3
    tl.to(
      containerRef.current,
      {
        x: 1.5,
        y: -1,
        duration: 0.03,
        yoyo: true,
        repeat: 1,
        ease: 'none',
      },
      1.08
    )
    tl.set(containerRef.current, { x: 0, y: 0 }, 1.13)

    // T=1110-1260ms: Residual vibration dies down (was 1800-2100ms)
    tl.to(
      [bar1Ref.current, bar2Ref.current, bar3Ref.current],
      {
        y: '+=0.5',
        duration: 0.05,
        yoyo: true,
        repeat: 2,
        ease: 'none',
        stagger: 0.012,
      },
      1.11
    )

    // T=1200ms: SYNC PULSE (was 2000ms)
    tl.to(
      [bar1Ref.current, bar2Ref.current, bar3Ref.current],
      {
        scale: 1.08,
        duration: 0.07,
        ease: 'power2.out',
        stagger: 0,
      },
      1.2
    )
    tl.to(
      [bar1Ref.current, bar2Ref.current, bar3Ref.current],
      {
        scale: 1.0,
        duration: 0.09,
        ease: 'power2.inOut',
        stagger: 0,
      },
      1.27
    )

    // Skip button appears at T=300ms (was 500ms)
    tl.to(
      skipBtnRef.current,
      {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.4)',
      },
      0.3
    )

    // Skip ring countdown
    if (skipRingRef.current) {
      const circumference = 2 * Math.PI * 24
      gsap.set(skipRingRef.current, {
        strokeDasharray: circumference,
        strokeDashoffset: 0,
      })
      tl.to(
        skipRingRef.current,
        {
          strokeDashoffset: circumference,
          duration: TOTAL_DURATION / 1000,
          ease: 'none',
        },
        0
      )
    }

    // ═══════════════════════════════════════
    // PHASE 2: TEXT REVEAL (1200ms - 2300ms)
    // Original was 2100-3800ms
    // ═══════════════════════════════════════

    // T=1200-1680ms: "IRON" letter-by-letter (was 2100-2800ms)
    tl.set(ironTextRef.current, { opacity: 1 }, 1.2)
    const ironLetters =
      ironTextRef.current?.querySelectorAll('.iron-letter') || []
    ironLetters.forEach((letter, i) => {
      tl.fromTo(
        letter,
        {
          opacity: 0,
          y: 25,
          rotation: -3 + Math.random() * 6,
          filter: 'blur(6px)',
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          filter: 'blur(0px)',
          scale: 1.0,
          duration: 0.3,
          ease: 'back.out(1.2)',
        },
        1.2 + i * 0.04
      )
    })

    // T=1680-2040ms: "MEDIA" with letter-spacing animation (was 2800-3400ms)
    tl.set(mediaTextRef.current, { opacity: 1 }, 1.68)
    tl.fromTo(
      mediaTextRef.current,
      {
        letterSpacing: '-0.35em',
        opacity: 0,
        y: 15,
        filter: 'blur(4px)',
      },
      {
        letterSpacing: '0.42em',
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.36,
        ease: 'power3.out',
      },
      1.68
    )

    // T=2040-2300ms: Logo hold + float + shimmer (was 3400-3800ms)
    // Float animation
    tl.to(
      logoGroupRef.current,
      {
        y: -3,
        duration: 0.72,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
      },
      2.04
    )

    // Metallic shimmer on IRON text
    const shimmerOverlay = ironTextRef.current?.querySelector('.shimmer-overlay')
    if (shimmerOverlay) {
      tl.fromTo(
        shimmerOverlay,
        { x: '-120%' },
        {
          x: '120%',
          duration: 0.48,
          ease: 'power2.inOut',
        },
        2.04
      )
    }

    // ═══════════════════════════════════════
    // PHASE 3: GROWTH CURVE (2300ms - 3000ms)
    // Original was 3800-5500ms
    // ═══════════════════════════════════════

    // T=2300-2900ms: SVG curve draws in (was 3800-5000ms)
    tl.to(curveContainerRef.current, { opacity: 1, duration: 0.18 }, 2.3)

    const curvePath =
      curveContainerRef.current?.querySelector('.growth-curve-path')
    const penPoint =
      curveContainerRef.current?.querySelector('.pen-point')
    const gridLines =
      curveContainerRef.current?.querySelectorAll('.grid-line') || []

    // Grid lines fade in
    gridLines.forEach((line, i) => {
      tl.fromTo(
        line,
        { opacity: 0 },
        { opacity: 0.15, duration: 0.18 },
        2.3 + i * 0.03
      )
    })

    // Curve stroke animation
    if (curvePath) {
      const pathLength = (curvePath as SVGPathElement).getTotalLength?.() || 400
      gsap.set(curvePath, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      })
      tl.to(
        curvePath,
        {
          strokeDashoffset: 0,
          duration: 0.6,
          ease: 'power1.inOut',
          onUpdate: function () {
            // Move pen point along the path
            if (penPoint && curvePath) {
              const progress = this.progress()
              const length =
                progress *
                ((curvePath as SVGPathElement).getTotalLength?.() || 400)
              const point = (
                curvePath as SVGPathElement
              ).getPointAtLength?.(length)
              if (point) {
                gsap.set(penPoint, {
                  cx: point.x,
                  cy: point.y,
                  opacity: progress > 0.02 && progress < 0.98 ? 1 : 0,
                })
              }
            }
          },
        },
        2.3
      )
    }

    // T=2520-2820ms: Data points pop in (was 4200-5200ms)
    const dataPoints =
      curveContainerRef.current?.querySelectorAll('.data-point') || []
    dataPoints.forEach((dp, i) => {
      tl.fromTo(
        dp,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.18,
          ease: 'back.out(2.5)',
        },
        2.52 + i * 0.12
      )
    })

    // Data labels
    const dataLabels =
      curveContainerRef.current?.querySelectorAll('.data-label') || []
    dataLabels.forEach((dl, i) => {
      tl.fromTo(
        dl,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          ease: 'power2.out',
        },
        2.58 + i * 0.12
      )
    })

    // ═══════════════════════════════════════
    // PHASE 4: NEW OUTRO (3000ms - 4500ms)
    // ═══════════════════════════════════════

    // Hide skip button at start of outro
    tl.to(
      skipBtnRef.current,
      {
        opacity: 0,
        scale: 0.8,
        duration: 0.15,
      },
      3.0
    )

    // T=3000-3200ms: Color Splatter Explosion
    // Bars scale to 0 and fade out quickly
    tl.to(
      [bar1Ref.current, bar2Ref.current, bar3Ref.current],
      {
        scale: 0,
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      },
      3.0
    )

    // Fade out curve container, IRON text, MEDIA text
    tl.to(
      [curveContainerRef.current, ironTextRef.current, mediaTextRef.current],
      {
        opacity: 0,
        duration: 0.15,
        ease: 'power2.in',
      },
      3.0
    )

    // Spawn splatters
    tl.call(
      () => {
        spawnSplatters(cx, cy)
      },
      [],
      3.0
    )

    // T=3200-3500ms: Screen fills blue
    tl.to(
      blueOverlayRef.current,
      {
        opacity: 1,
        duration: 0.3,
        ease: 'power2.inOut',
      },
      3.2
    )

    // T=3500-4000ms: Stock chart line (SVG)
    // Build the chart path dynamically
    tl.call(
      () => {
        const w = window.innerWidth
        const h = window.innerHeight
        const centerY = h / 2
        const pathData = `M 0,${centerY + 20} L ${w * 0.05},${centerY + 15} L ${w * 0.1},${centerY - 10} L ${w * 0.15},${centerY + 5} L ${w * 0.2},${centerY - 20} L ${w * 0.25},${centerY + 10} L ${w * 0.3},${centerY - 5} L ${w * 0.35},${centerY + 25} L ${w * 0.4},${centerY - 15} L ${w * 0.45},${centerY + 8} L ${w * 0.5},${centerY - 30} L ${w * 0.55},${centerY + 12} L ${w * 0.6},${centerY - 10} L ${w * 0.65},${centerY - 25} L ${w * 0.7},${centerY - 40} L ${w * 0.75},${centerY - 60} L ${w * 0.8},${centerY - 100} L ${w * 0.85},${centerY - 150} L ${w * 0.9},${centerY - 200} L ${w * 0.95},${centerY - 280} L ${w},${centerY - 350}`

        if (chartPathRef.current) {
          chartPathRef.current.setAttribute('d', pathData)
          const pathLength = chartPathRef.current.getTotalLength()
          gsap.set(chartPathRef.current, {
            strokeDasharray: pathLength,
            strokeDashoffset: pathLength,
          })
        }
      },
      [],
      3.45
    )

    // Show the chart SVG
    tl.to(
      chartSvgRef.current,
      {
        opacity: 1,
        duration: 0.05,
      },
      3.5
    )

    // Animate the stock chart line drawing
    tl.to(
      chartPathRef.current,
      {
        strokeDashoffset: 0,
        duration: 0.5,
        ease: 'power1.inOut',
      },
      3.5
    )

    // T=4000-4500ms: "Skalierung neu definiert" text
    // Fade out chart
    tl.to(
      chartSvgRef.current,
      {
        opacity: 0,
        duration: 0.15,
      },
      3.95
    )

    // Show the text with spring bounce
    tl.to(
      skalierungTextRef.current,
      {
        opacity: 1,
        duration: 0.05,
      },
      4.0
    )

    // Spring bounce entrance on the inner span
    const skalierungSpan = skalierungTextRef.current?.querySelector('span')
    if (skalierungSpan) {
      tl.fromTo(
        skalierungSpan,
        {
          scale: 0.5,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        },
        4.0
      )

      // Subtle white glow pulse
      tl.to(
        skalierungSpan,
        {
          textShadow: '0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.5)',
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'sine.inOut',
        },
        4.1
      )
    }

    // Hold for ~300ms, then fade out at T=4300ms
    tl.to(
      containerRef.current,
      {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      },
      4.3
    )

    // ─── CLEANUP ───

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      if (timelineRef.current) {
        timelineRef.current.kill()
      }
      gsap.killTweensOf([
        containerRef.current,
        bar1Ref.current,
        bar2Ref.current,
        bar3Ref.current,
        ironTextRef.current,
        mediaTextRef.current,
        curveContainerRef.current,
        skipBtnRef.current,
        flashRef.current,
        impactRingRef.current,
        anticipationRef.current,
        blueOverlayRef.current,
        chartSvgRef.current,
        chartPathRef.current,
        skalierungTextRef.current,
      ])
      // Remove any leftover ghost elements
      ghosts.forEach((g) => {
        try {
          g.remove()
        } catch (_) {}
      })
      particlesRef.current = []
      splattersRef.current = []
    }
  }, [onComplete, renderCanvas, spawnImpactParticles, spawnSplatters])

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  // SVG growth curve data
  const curveWidth = Math.min(500, typeof window !== 'undefined' ? window.innerWidth * 0.55 : 400)
  const curveHeight = 180
  // Exponential growth curve points
  const curvePoints = [
    { x: 0, y: curveHeight * 0.85 },
    { x: curveWidth * 0.25, y: curveHeight * 0.72 },
    { x: curveWidth * 0.5, y: curveHeight * 0.52 },
    { x: curveWidth * 0.75, y: curveHeight * 0.28 },
    { x: curveWidth, y: curveHeight * 0.05 },
  ]
  const curveSvgPath = `M ${curvePoints[0].x} ${curvePoints[0].y} C ${curveWidth * 0.1} ${curveHeight * 0.83}, ${curveWidth * 0.2} ${curveHeight * 0.75}, ${curvePoints[1].x} ${curvePoints[1].y} S ${curveWidth * 0.4} ${curveHeight * 0.58}, ${curvePoints[2].x} ${curvePoints[2].y} S ${curveWidth * 0.65} ${curveHeight * 0.35}, ${curvePoints[3].x} ${curvePoints[3].y} S ${curveWidth * 0.92} ${curveHeight * 0.08}, ${curvePoints[4].x} ${curvePoints[4].y}`

  const dataPointsData = [
    { x: curveWidth * 0.12, y: curveHeight * 0.78, label: '\u20AC300M', year: '2021' },
    { x: curveWidth * 0.37, y: curveHeight * 0.6, label: '\u20AC450M', year: '2022' },
    { x: curveWidth * 0.62, y: curveHeight * 0.38, label: '\u20AC700M', year: '2023' },
    { x: curveWidth * 0.88, y: curveHeight * 0.12, label: '\u20AC1B+', year: '2024', highlight: true },
  ]

  const skipRingCircumference = 2 * Math.PI * 24

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: COLORS.background,
        overflow: 'hidden',
        willChange: 'transform, opacity',
      }}
    >
      {/* Full-screen canvas for particles & splatters */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
        }}
      />

      {/* Anticipation pulse */}
      <div
        ref={anticipationRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${COLORS.oceanBlue}33 0%, transparent 70%)`,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Impact ring SVG */}
      <svg
        ref={impactRingRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 160,
          height: 160,
          pointerEvents: 'none',
          zIndex: 3,
          overflow: 'visible',
        }}
      >
        <circle
          cx="80"
          cy="80"
          r="40"
          fill="none"
          stroke={COLORS.oceanBlue}
          strokeWidth="2"
          opacity="0.6"
        />
        <circle
          cx="80"
          cy="80"
          r="25"
          fill="none"
          stroke={COLORS.oceanBlue}
          strokeWidth="1"
          opacity="0.3"
        />
      </svg>

      {/* White flash overlay */}
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          inset: 0,
          background: COLORS.background,
          pointerEvents: 'none',
          zIndex: 6,
        }}
      />

      {/* Blue overlay for Phase 4 */}
      <div
        ref={blueOverlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#2E9AC4',
          opacity: 0,
          zIndex: 8,
          pointerEvents: 'none',
        }}
      />

      {/* Stock chart SVG for Phase 4 */}
      <svg
        ref={chartSvgRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          opacity: 0,
          zIndex: 9,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter id="chartGlow">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFFFFF" floodOpacity="0.6" />
          </filter>
        </defs>
        <path
          ref={chartPathRef}
          d=""
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#chartGlow)"
        />
      </svg>

      {/* "Skalierung neu definiert" text for Phase 4 */}
      <div
        ref={skalierungTextRef}
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <span
          className="font-[family-name:var(--font-display)]"
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 3rem)',
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3)',
            transform: 'scale(0.5)',
          }}
        >
          Skalierung neu definiert
        </span>
      </div>

      {/* Logo group (bars + text) */}
      <div
        ref={logoGroupRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      >
        {/* Bar 1 - Sky Blue (left) */}
        <div
          ref={bar1Ref}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BAR_CONFIG.width,
            height: BAR_CONFIG.bar1.height,
            background: BAR_CONFIG.bar1.color,
            borderRadius: 999,
            willChange: 'transform, opacity',
            transformOrigin: 'center bottom',
          }}
        />

        {/* Bar 2 - Ocean Blue (center, tallest) */}
        <div
          ref={bar2Ref}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BAR_CONFIG.width,
            height: BAR_CONFIG.bar2.height,
            background: BAR_CONFIG.bar2.color,
            borderRadius: 999,
            willChange: 'transform, opacity',
            transformOrigin: 'center bottom',
          }}
        />

        {/* Bar 3 - Deep Teal (right) */}
        <div
          ref={bar3Ref}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: BAR_CONFIG.width,
            height: BAR_CONFIG.bar3.height,
            background: BAR_CONFIG.bar3.color,
            borderRadius: 999,
            willChange: 'transform, opacity',
            transformOrigin: 'center bottom',
          }}
        />

        {/* IRON text */}
        <div
          ref={ironTextRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: 55,
            display: 'flex',
            alignItems: 'baseline',
            gap: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
          className="font-[family-name:var(--font-body)]"
        >
          <span style={{ display: 'flex', position: 'relative' }}>
            {'IRON'.split('').map((char, i) => (
              <span
                key={i}
                className="iron-letter"
                style={{
                  display: 'inline-block',
                  fontSize: 48,
                  fontWeight: 800,
                  color: COLORS.textDark,
                  letterSpacing: '-0.02em',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {char}
              </span>
            ))}
            {/* Shimmer overlay */}
            <span
              className="shimmer-overlay"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.7) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.7) 52%, transparent 70%)',
                pointerEvents: 'none',
                willChange: 'transform',
              }}
            />
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              color: COLORS.textMedium,
              marginLeft: 2,
              verticalAlign: 'super',
              lineHeight: 1,
              position: 'relative',
              top: -16,
            }}
          >
            {'\u2122'}
          </span>
        </div>

        {/* MEDIA text */}
        <div
          ref={mediaTextRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            marginTop: 92,
            fontSize: 26,
            fontWeight: 400,
            color: COLORS.textMedium,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            willChange: 'transform, opacity, filter, letter-spacing',
          }}
          className="font-[family-name:var(--font-body)]"
        >
          MEDIA
        </div>
      </div>

      {/* Growth Curve Container */}
      <div
        ref={curveContainerRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          marginTop: 155,
          width: curveWidth + 60,
          height: curveHeight + 60,
          zIndex: 5,
        }}
      >
        <svg
          width={curveWidth + 60}
          height={curveHeight + 60}
          viewBox={`-30 -10 ${curveWidth + 60} ${curveHeight + 40}`}
          style={{ overflow: 'visible' }}
        >
          {/* Grid lines */}
          {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => (
            <line
              key={`h-${i}`}
              className="grid-line"
              x1={0}
              y1={curveHeight * ratio}
              x2={curveWidth}
              y2={curveHeight * ratio}
              stroke={COLORS.textMedium}
              strokeWidth="0.5"
              opacity="0"
            />
          ))}
          {[0.25, 0.5, 0.75].map((ratio, i) => (
            <line
              key={`v-${i}`}
              className="grid-line"
              x1={curveWidth * ratio}
              y1={0}
              x2={curveWidth * ratio}
              y2={curveHeight}
              stroke={COLORS.textMedium}
              strokeWidth="0.5"
              opacity="0"
            />
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient
              id="curveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor={COLORS.skyBlue} />
              <stop offset="100%" stopColor={COLORS.deepTeal} />
            </linearGradient>
            <filter id="penGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="pointGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Growth curve path */}
          <path
            className="growth-curve-path"
            d={curveSvgPath}
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Pen point (glowing tip) */}
          <circle
            className="pen-point"
            cx={0}
            cy={curveHeight * 0.85}
            r="4"
            fill={COLORS.oceanBlue}
            filter="url(#penGlow)"
            opacity="0"
          />

          {/* Data points */}
          {dataPointsData.map((dp, i) => (
            <g key={i}>
              <circle
                className="data-point"
                cx={dp.x}
                cy={dp.y}
                r={dp.highlight ? 6 : 4.5}
                fill={dp.highlight ? COLORS.oceanBlue : COLORS.skyBlue}
                filter={dp.highlight ? 'url(#pointGlow)' : undefined}
                style={{
                  transformOrigin: `${dp.x}px ${dp.y}px`,
                }}
              />
              {dp.highlight && (
                <circle
                  className="data-point"
                  cx={dp.x}
                  cy={dp.y}
                  r="10"
                  fill="none"
                  stroke={COLORS.oceanBlue}
                  strokeWidth="1"
                  opacity="0.4"
                  style={{
                    transformOrigin: `${dp.x}px ${dp.y}px`,
                  }}
                />
              )}
              <g className="data-label">
                <text
                  x={dp.x}
                  y={dp.y - 14}
                  textAnchor="middle"
                  fill={dp.highlight ? COLORS.textDark : COLORS.textMedium}
                  fontSize={dp.highlight ? 13 : 11}
                  fontWeight={dp.highlight ? 700 : 500}
                  fontFamily="var(--font-body), Plus Jakarta Sans, system-ui, sans-serif"
                  opacity="0"
                >
                  {dp.label}
                </text>
                <text
                  x={dp.x}
                  y={dp.y + curveHeight * 0.18}
                  textAnchor="middle"
                  fill={COLORS.textMedium}
                  fontSize="9"
                  fontWeight="400"
                  fontFamily="var(--font-mono), JetBrains Mono, monospace"
                  opacity="0"
                >
                  {dp.year}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>

      {/* Skip Button */}
      <button
        ref={skipBtnRef}
        onClick={handleSkip}
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          zIndex: 20,
          boxShadow:
            '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          pointerEvents: 'auto',
          padding: 0,
          outline: 'none',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow =
            '0 6px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow =
            '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
        }}
        aria-label="Skip intro animation"
      >
        {/* SVG countdown ring */}
        <svg
          width="56"
          height="56"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'rotate(-90deg)',
          }}
        >
          {/* Background track */}
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="2"
          />
          {/* Countdown ring */}
          <circle
            ref={skipRingRef}
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke={COLORS.oceanBlue}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={skipRingCircumference}
            strokeDashoffset={0}
          />
        </svg>
        {/* Fast-forward icon */}
        <svg
          width="16"
          height="14"
          viewBox="0 0 16 14"
          fill="none"
          style={{ marginTop: -2 }}
        >
          <path
            d="M1 1L6 7L1 13"
            stroke={COLORS.textDark}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 1L14 7L9 13"
            stroke={COLORS.textDark}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {/* SKIP label */}
        <span
          className="font-[family-name:var(--font-mono)]"
          style={{
            fontSize: 9,
            fontWeight: 500,
            color: COLORS.textMedium,
            letterSpacing: '0.08em',
            lineHeight: 1,
            marginTop: 0,
          }}
        >
          SKIP
        </span>
      </button>
    </div>
  )
}
