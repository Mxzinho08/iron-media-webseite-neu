'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS, TRUSTED_BRANDS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v2
   Left 42%: Text | Right 58%: GLSL 3 Pill Bars
   Trusted By + Scroll Indicator at bottom
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ============================================
   GLSL SHADERS — 3 Vertical Pill-Shaped Bars
   ============================================ */

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
precision highp float;

varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

float roundedRectSDF(vec2 p, vec2 halfSize, float radius) {
  vec2 d = abs(p) - halfSize + vec2(radius);
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;

  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  float rotTime = uTime * 0.25;
  float rotX = sin(rotTime) * 0.05;
  float rotY = sin(rotTime * 0.77) * 0.035;

  rotX += (uMouse.y - 0.5) * 0.025;
  rotY += (uMouse.x - 0.5) * 0.04;

  p.x += rotY * p.y * 0.4;
  p.y += rotX * p.x * 0.3;
  float perspScale = 1.0 + rotX * p.y * 0.15;
  p *= perspScale;

  float barWidth = 0.075;
  float gap = 0.025;
  float radius = barWidth * 0.5;

  float bar1Height = 0.42;
  vec2 bar1Center = vec2(-(barWidth + gap), 0.0);
  vec3 bar1Color = vec3(0.337, 0.722, 0.871);
  float bar1Glow = 0.75;

  float bar2Height = 0.57;
  vec2 bar2Center = vec2(0.0, 0.0);
  vec3 bar2Color = vec3(0.180, 0.604, 0.769);
  float bar2Glow = 1.0;

  float bar3Height = 0.46;
  vec2 bar3Center = vec2(barWidth + gap, 0.0);
  vec3 bar3Color = vec3(0.106, 0.494, 0.651);
  float bar3Glow = 0.65;

  float grain = fbm(uv * 200.0) * 0.1;
  float fineGrain = noise(uv * 400.0) * 0.05;
  float totalGrain = grain + fineGrain;

  vec3 finalColor = vec3(1.0);

  // BAR 1
  {
    vec2 localP = p - bar1Center;
    vec2 halfSize = vec2(barWidth * 0.5, bar1Height * 0.5);
    float dist = roundedRectSDF(localP, halfSize, radius);
    float haloStrength = exp(-dist * dist / 0.003) * bar1Glow * 0.25;
    if (dist < 0.0) {
      float edgeDist = -dist;
      float gradientLR = smoothstep(-halfSize.x, halfSize.x, localP.x);
      float brightness = mix(0.25, 0.95, gradientLR) * bar1Glow;
      float edgeGlow = smoothstep(halfSize.x - barWidth * 0.12, halfSize.x, localP.x + dist * 0.5);
      edgeGlow *= smoothstep(0.0, 0.01, edgeDist);
      brightness += edgeGlow * 1.3;
      brightness += totalGrain * brightness * 0.5;
      float gradientTB = smoothstep(-halfSize.y, halfSize.y, localP.y);
      brightness *= mix(0.8, 1.1, gradientTB);
      vec3 barColor = bar1Color * brightness;
      barColor = mix(barColor, vec3(1.0), edgeGlow * 0.35);
      float alpha = smoothstep(0.0, 0.003, edgeDist);
      finalColor = mix(finalColor, barColor, alpha);
    } else {
      finalColor = mix(finalColor, bar1Color * 0.6, haloStrength);
    }
  }

  // BAR 2
  {
    vec2 localP = p - bar2Center;
    vec2 halfSize = vec2(barWidth * 0.5, bar2Height * 0.5);
    float dist = roundedRectSDF(localP, halfSize, radius);
    float haloStrength = exp(-dist * dist / 0.004) * bar2Glow * 0.3;
    if (dist < 0.015 && dist > 0.0) {
      float shadowStrength = smoothstep(0.015, 0.0, dist) * 0.3;
      finalColor *= (1.0 - shadowStrength);
    }
    if (dist < 0.0) {
      float edgeDist = -dist;
      float gradientLR = smoothstep(-halfSize.x, halfSize.x, localP.x);
      float brightness = mix(0.3, 1.0, gradientLR) * bar2Glow;
      float edgeGlow = smoothstep(halfSize.x - barWidth * 0.12, halfSize.x, localP.x + dist * 0.5);
      edgeGlow *= smoothstep(0.0, 0.01, edgeDist);
      brightness += edgeGlow * 1.5;
      brightness += totalGrain * brightness * 0.5;
      float gradientTB = smoothstep(-halfSize.y, halfSize.y, localP.y);
      brightness *= mix(0.85, 1.15, gradientTB);
      vec3 barColor = bar2Color * brightness;
      barColor = mix(barColor, vec3(1.0), edgeGlow * 0.45);
      float alpha = smoothstep(0.0, 0.003, edgeDist);
      finalColor = mix(finalColor, barColor, alpha);
    } else if (haloStrength > 0.005) {
      finalColor = mix(finalColor, bar2Color * 0.5, haloStrength);
    }
  }

  // BAR 3
  {
    vec2 localP = p - bar3Center;
    vec2 halfSize = vec2(barWidth * 0.5, bar3Height * 0.5);
    float dist = roundedRectSDF(localP, halfSize, radius);
    float haloStrength = exp(-dist * dist / 0.003) * bar3Glow * 0.25;
    if (dist < 0.015 && dist > 0.0) {
      float shadowStrength = smoothstep(0.015, 0.0, dist) * 0.25;
      finalColor *= (1.0 - shadowStrength);
    }
    if (dist < 0.0) {
      float edgeDist = -dist;
      float gradientLR = smoothstep(-halfSize.x, halfSize.x, localP.x);
      float brightness = mix(0.2, 0.9, gradientLR) * bar3Glow;
      float edgeGlow = smoothstep(halfSize.x - barWidth * 0.12, halfSize.x, localP.x + dist * 0.5);
      edgeGlow *= smoothstep(0.0, 0.01, edgeDist);
      brightness += edgeGlow * 1.3;
      brightness += totalGrain * brightness * 0.5;
      float gradientTB = smoothstep(-halfSize.y, halfSize.y, localP.y);
      brightness *= mix(0.8, 1.1, gradientTB);
      vec3 barColor = bar3Color * brightness;
      barColor = mix(barColor, vec3(1.0), edgeGlow * 0.3);
      float alpha = smoothstep(0.0, 0.003, edgeDist);
      finalColor = mix(finalColor, barColor, alpha);
    } else if (haloStrength > 0.005) {
      finalColor = mix(finalColor, bar3Color * 0.5, haloStrength);
    }
  }

  float vig = 1.0 - smoothstep(0.4, 1.0, length((uv - 0.5) * 1.8));
  finalColor = mix(vec3(1.0), finalColor, vig * 0.15 + 0.85);

  gl_FragColor = vec4(finalColor, 1.0);
}
`

/* ============================================
   GLOWING BARS 3D COMPONENT
   ============================================ */

function GlowingBars3D({ isMobile, isTablet }: { isMobile: boolean; isTablet: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const disposedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    disposedRef.current = false

    let animId = 0
    let renderer: any = null
    let targetMouseX = 0.5
    let targetMouseY = 0.5

    async function init() {
      const THREE = await import('three')
      if (disposedRef.current || !container) return

      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      const pixelRatio = isMobile ? 1 : Math.min(window.devicePixelRatio, 2)
      renderer.setPixelRatio(pixelRatio)
      renderer.setSize(w, h)
      renderer.setClearColor(0xFFFFFF, 1)
      container.appendChild(renderer.domElement)

      const uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      }

      const geo = new THREE.PlaneGeometry(2, 2)
      const mat = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms })
      scene.add(new THREE.Mesh(geo, mat))

      // Mouse tracking
      const onMouse = (e: MouseEvent) => {
        targetMouseX = e.clientX / window.innerWidth
        targetMouseY = e.clientY / window.innerHeight
      }
      window.addEventListener('mousemove', onMouse)

      // Debounced resize
      let resizeTimer: ReturnType<typeof setTimeout>
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          if (disposedRef.current || !container || !renderer) return
          const nw = container.clientWidth
          const nh = container.clientHeight
          if (nw === 0 || nh === 0) return
          renderer.setSize(nw, nh)
          uniforms.uResolution.value.set(nw, nh)
        }, 200)
      }
      window.addEventListener('resize', onResize)

      // Render loop
      function tick(time: number) {
        if (disposedRef.current) return
        animId = requestAnimationFrame(tick)
        uniforms.uTime.value = time * 0.001
        uniforms.uMouse.value.x += (targetMouseX - uniforms.uMouse.value.x) * 0.02
        uniforms.uMouse.value.y += (targetMouseY - uniforms.uMouse.value.y) * 0.02
        renderer.render(scene, camera)
      }
      animId = requestAnimationFrame(tick)

      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouse)
        window.removeEventListener('resize', onResize)
        clearTimeout(resizeTimer)
        geo.dispose()
        mat.dispose()
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
        renderer = null
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => { cleanup = fn })

    return () => {
      disposedRef.current = true
      cleanup?.()
    }
  }, [isMobile])

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: 'relative',
        width: '100%',
        height: '40vh',
        zIndex: 0,
        overflow: 'hidden',
      }
    : isTablet
    ? {
        position: 'relative',
        width: '100%',
        height: '50vh',
        zIndex: 0,
        overflow: 'hidden',
      }
    : {
        position: 'absolute',
        top: 0,
        right: 0,
        width: '58%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }

  return <div ref={containerRef} style={containerStyle} />
}

/* ============================================
   COUNTER ANIMATION HOOK
   ============================================ */

function useCounterAnimation(
  targetStr: string,
  shouldAnimate: boolean,
  duration: number = 1500
): string {
  const [display, setDisplay] = useState(targetStr)
  const hasAnimated = useRef(false)
  const elementRef = useRef<HTMLDivElement>(null)

  // Parse the numeric part and prefix/suffix
  const parsed = useMemo(() => {
    const match = targetStr.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
    if (!match) return null
    return {
      prefix: match[1],
      number: parseFloat(match[2]),
      suffix: match[3],
      isFloat: match[2].includes('.'),
    }
  }, [targetStr])

  useEffect(() => {
    if (!shouldAnimate || !parsed || hasAnimated.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          const startTime = performance.now()
          const target = parsed.number

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target

            if (parsed!.isFloat) {
              setDisplay(`${parsed!.prefix}${current.toFixed(1)}${parsed!.suffix}`)
            } else {
              setDisplay(`${parsed!.prefix}${Math.round(current)}${parsed!.suffix}`)
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setDisplay(targetStr)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    // We need to observe something — use a small delay to ensure ref is set
    const el = elementRef.current
    if (el) observer.observe(el)

    return () => observer.disconnect()
  }, [shouldAnimate, parsed, duration, targetStr])

  return display
}

/* ============================================
   METRIC ITEM COMPONENT
   ============================================ */

function MetricItem({
  metric,
  index,
  shouldAnimate,
  isMobile,
}: {
  metric: { value: string; label: string }
  index: number
  shouldAnimate: boolean
  isMobile: boolean
}) {
  const display = useCounterAnimation(metric.value, shouldAnimate)
  const ref = useRef<HTMLDivElement>(null)

  // Expose ref for IntersectionObserver in hook — we actually need to wire it differently
  // The hook uses its own internal ref, so let's inline the counter logic here instead

  const [counterDisplay, setCounterDisplay] = useState(metric.value)
  const hasAnimated = useRef(false)

  const parsed = useMemo(() => {
    const match = metric.value.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/)
    if (!match) return null
    return {
      prefix: match[1],
      number: parseFloat(match[2]),
      suffix: match[3],
      isFloat: match[2].includes('.'),
    }
  }, [metric.value])

  useEffect(() => {
    if (!shouldAnimate || !parsed || hasAnimated.current || !ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          observer.disconnect()

          const startTime = performance.now()
          const target = parsed.number
          const duration = 1500

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            const current = eased * target

            if (parsed!.isFloat) {
              setCounterDisplay(`${parsed!.prefix}${current.toFixed(1)}${parsed!.suffix}`)
            } else {
              setCounterDisplay(`${parsed!.prefix}${Math.round(current)}${parsed!.suffix}`)
            }

            if (progress < 1) {
              requestAnimationFrame(animate)
            } else {
              setCounterDisplay(metric.value)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [shouldAnimate, parsed, metric.value])

  return (
    <div
      ref={ref}
      style={{
        borderLeft: index > 0 ? '1px solid rgba(226,232,240,0.8)' : 'none',
        paddingLeft: index > 0 ? 24 : 0,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 'clamp(28px, 3vw, 44px)',
          color: '#1A1A2E',
          lineHeight: 1.1,
        }}
      >
        {counterDisplay}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase' as const,
          color: '#94A3B8',
          marginTop: 6,
        }}
      >
        {metric.label}
      </div>
    </div>
  )
}

/* ============================================
   MAGNETIC BUTTON COMPONENT
   ============================================ */

function MagneticButton({
  children,
  href,
  style,
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode
  href: string
  style: React.CSSProperties
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}) {
  const btnRef = useRef<HTMLAnchorElement>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)
  const [sweepX, setSweepX] = useState(-100)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.15 * rect.width
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.15 * rect.height
    setOffset({ x, y })
  }, [])

  const handleEnter = useCallback(() => {
    setHovered(true)
    setSweepX(-100)
    // Trigger sweep animation
    requestAnimationFrame(() => setSweepX(200))
    onMouseEnter?.()
  }, [onMouseEnter])

  const handleLeave = useCallback(() => {
    setHovered(false)
    setOffset({ x: 0, y: 0 })
    onMouseLeave?.()
  }, [onMouseLeave])

  return (
    <a
      ref={btnRef}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      style={{
        ...style,
        transform: hovered
          ? `translate(${offset.x}px, ${offset.y - 2}px)`
          : 'translate(0, 0)',
        boxShadow: hovered
          ? '0 8px 30px rgba(46,154,196,0.35)'
          : '0 4px 16px rgba(46,154,196,0.18)',
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shiny sweep overlay */}
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
          transform: `translateX(${sweepX}%)`,
          transition: hovered ? 'transform 0.6s ease' : 'none',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        {children}
      </span>
    </a>
  )
}

/* ============================================
   SCROLL INDICATOR COMPONENT
   ============================================ */

function ScrollIndicator({ show }: { show: boolean }) {
  const [opacity, setOpacity] = useState(0.5)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const newOpacity = Math.max(0, 0.5 - scrollY / 200)
      setOpacity(newOpacity)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!show) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity,
        transition: 'opacity 0.3s ease',
        zIndex: 3,
      }}
    >
      <div
        style={{
          width: 1,
          height: 40,
          background: 'rgba(148,163,184,0.3)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: 3,
            height: 8,
            background: '#2E9AC4',
            borderRadius: 2,
            position: 'absolute',
            left: -1,
            animation: 'scrollBounce 2s infinite',
          }}
        />
      </div>
      <style>{`
        @keyframes scrollBounce {
          0%, 100% { top: 4px; }
          50% { top: 28px; }
        }
      `}</style>
    </div>
  )
}

/* ============================================
   HERO COMPONENT
   ============================================ */

export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth
      setIsMobile(w < 768)
      setIsTablet(w >= 768 && w <= 1024)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Desktop mouse tilt for headline
  useEffect(() => {
    if (isMobile || isTablet) return
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [isMobile, isTablet])

  const isDesktop = !isMobile && !isTablet

  // Headline tilt transform
  const headlineTilt = isDesktop
    ? `perspective(1000px) rotateY(${(mousePos.x - 0.5) * 3}deg) rotateX(${(0.5 - mousePos.y) * 3}deg)`
    : undefined

  // Headline lines for stagger
  const headlineLines = ['E-Commerce Brands', 'wachsen mit uns', 'unaufhaltbar.']

  return (
    <section
      id="hero"
      ref={heroRef}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Pulse animation for badge dot */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
      `}</style>

      {/* Main hero area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: isMobile || isTablet ? 'column' : 'row',
          alignItems: isMobile || isTablet ? 'stretch' : 'center',
        }}
      >
        {/* Mobile gradient fallback behind 3D area */}
        {isMobile && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              background:
                'radial-gradient(ellipse at 70% 40%, rgba(46,154,196,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(86,184,222,0.05) 0%, transparent 50%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Left: Text Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: isMobile || isTablet ? '100%' : '42%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: isMobile
              ? '120px 24px 48px'
              : isTablet
              ? '120px 48px 48px'
              : '0 0 0 clamp(48px, 8vw, 120px)',
            minHeight: isMobile || isTablet ? 'auto' : '100vh',
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE_OUT_EXPO }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: isMobile ? 'center' : 'flex-start',
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(46,154,196,0.06)',
              border: '1px solid rgba(46,154,196,0.12)',
              borderRadius: 999,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#2E9AC4',
                flexShrink: 0,
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: '#2E9AC4',
              }}
            >
              E-COMMERCE GROWTH AGENCY &middot; &euro;1B+ PORTFOLIO
            </span>
          </motion.div>

          {/* Headline — line-by-line stagger */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(48px, 7vw, 96px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: '#1A1A2E',
              margin: 0,
              transform: headlineTilt,
              transition: 'transform 0.15s ease-out',
              willChange: isDesktop ? 'transform' : undefined,
            }}
          >
            {headlineLines.map((line, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={show ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + i * 0.12,
                  ease: EASE_OUT_EXPO,
                }}
                style={{ display: 'block' }}
              >
                {line === 'unaufhaltbar.' ? (
                  <span className="text-blue-gradient text-shimmer">{line}</span>
                ) : (
                  line
                )}
              </motion.span>
            ))}
          </h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={show ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8, ease: EASE_OUT_EXPO }}
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(16px, 1.5vw, 20px)',
              lineHeight: 1.65,
              color: '#4A5568',
              maxWidth: 480,
              marginTop: 20,
            }}
          >
            Wir sind der Growth-Partner f&uuml;r ambitionierte E-Commerce Brands, die bereit sind, Marktf&uuml;hrer zu werden.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.0, ease: EASE_OUT_EXPO }}
            style={{
              display: 'flex',
              gap: 12,
              marginTop: 28,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start',
            }}
          >
            <MagneticButton
              href="#contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, #56B8DE 0%, #2E9AC4 50%, #1B7EA6 100%)',
                color: '#FFF',
                borderRadius: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              Kostenloses Audit
              <span style={{ marginLeft: 4, fontSize: 16 }}>&rarr;</span>
            </MagneticButton>

            <a
              href="#cases"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'transparent',
                color: '#1A1A2E',
                borderRadius: 12,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                cursor: 'pointer',
                border: '1.5px solid rgba(26,26,46,0.15)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2E9AC4'
                e.currentTarget.style.color = '#2E9AC4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26,26,46,0.15)'
                e.currentTarget.style.color = '#1A1A2E'
              }}
            >
              Case Studies
            </a>
          </motion.div>

          {/* Metrics Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.2, ease: EASE_OUT_EXPO }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 24,
              marginTop: 48,
            }}
          >
            {HERO_METRICS.map((metric, i) => (
              <MetricItem
                key={metric.label}
                metric={metric}
                index={isMobile ? i % 2 : i}
                shouldAnimate={show}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </div>

        {/* Right: 3D Shader */}
        <GlowingBars3D isMobile={isMobile} isTablet={isTablet} />

        {/* Scroll Indicator */}
        <ScrollIndicator show={show} />
      </div>

      {/* Trusted By Section — Full Width */}
      <div
        style={{
          width: '100%',
          borderTop: '1px solid rgba(226,232,240,0.5)',
          padding: '32px clamp(24px, 5vw, 80px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          alignItems: isMobile ? 'center' : 'flex-start',
        }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 1.4, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            color: '#94A3B8',
          }}
        >
          TRUSTED BY
        </motion.span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          {TRUSTED_BRANDS.map((brand, i) => (
            <motion.span
              key={brand.name}
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 0.7 } : {}}
              transition={{
                duration: 0.4,
                delay: 1.5 + i * 0.05,
                ease: EASE_OUT_EXPO,
              }}
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 14,
                letterSpacing: '0.05em',
                color: brand.color,
                cursor: 'default',
                transition: 'opacity 200ms ease',
              }}
              whileHover={{ opacity: 1 }}
            >
              {brand.name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  )
}
