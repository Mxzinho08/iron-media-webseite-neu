'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS, TRUSTED_LOGOS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v4
   Left 42% text + Right 58% GLSL shader
   12 floating SDF logo groups
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ============================================
   VERTEX SHADER
   ============================================ */
const VERTEX_SHADER = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

/* ============================================
   FRAGMENT SHADER — 12 Floating Logo Groups
   ============================================ */
const FRAGMENT_SHADER = `
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
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v=0.0, a=0.5;
  for(int i=0;i<3;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
  return v;
}

float rrect(vec2 p, vec2 h, float r) {
  vec2 d = abs(p)-h+r; return length(max(d,0.0))+min(max(d.x,d.y),0.0)-r;
}

vec4 logoGroup(vec2 uv, vec2 pos, float sc, float rot, float glowIntensity) {
  vec2 p = uv - pos;
  float c = cos(rot), s = sin(rot);
  p = mat2(c,-s,s,c) * p;
  p /= sc;

  float bw = 0.012;
  float gap = 0.005;
  float r = bw * 0.5;

  float h1 = 0.045;
  float h2 = 0.062;
  float h3 = 0.05;

  float x1 = -(bw + gap);
  float x2 = 0.0;
  float x3 = (bw + gap);

  vec3 col1 = vec3(0.337, 0.722, 0.871);
  vec3 col2 = vec3(0.180, 0.604, 0.769);
  vec3 col3 = vec3(0.106, 0.494, 0.651);

  vec4 result = vec4(0.0);

  // Bar 1
  float d1 = rrect(p - vec2(x1, 0.0), vec2(bw*0.5, h1*0.5), r);
  if (d1 < 0.0) {
    float edge = smoothstep(0.0, 0.003, -d1);
    float bright = mix(0.4, 0.9, smoothstep(-bw*0.5, bw*0.5, (p.x-x1)));
    vec3 col = col1 * bright * glowIntensity;
    col = mix(col, vec3(1.0), smoothstep(bw*0.3, bw*0.5, (p.x-x1)) * 0.3);
    result = vec4(col, edge * 0.7);
  }
  float glow1 = exp(-d1*d1*8000.0) * glowIntensity * 0.15;
  result.rgb += col1 * glow1;
  result.a = max(result.a, glow1);

  // Bar 2
  float d2 = rrect(p - vec2(x2, 0.0), vec2(bw*0.5, h2*0.5), r);
  if (d2 < 0.0) {
    float edge = smoothstep(0.0, 0.003, -d2);
    float bright = mix(0.45, 1.0, smoothstep(-bw*0.5, bw*0.5, (p.x-x2)));
    vec3 col = col2 * bright * glowIntensity;
    col = mix(col, vec3(1.0), smoothstep(bw*0.3, bw*0.5, (p.x-x2)) * 0.4);
    result = vec4(col, edge * 0.75);
  }
  float glow2 = exp(-d2*d2*8000.0) * glowIntensity * 0.2;
  result.rgb += col2 * glow2;
  result.a = max(result.a, glow2);

  // Bar 3
  float d3 = rrect(p - vec2(x3, 0.0), vec2(bw*0.5, h3*0.5), r);
  if (d3 < 0.0) {
    float edge = smoothstep(0.0, 0.003, -d3);
    float bright = mix(0.35, 0.85, smoothstep(-bw*0.5, bw*0.5, (p.x-x3)));
    vec3 col = col3 * bright * glowIntensity;
    col = mix(col, vec3(1.0), smoothstep(bw*0.3, bw*0.5, (p.x-x3)) * 0.3);
    result = vec4(col, edge * 0.65);
  }
  float glow3 = exp(-d3*d3*8000.0) * glowIntensity * 0.15;
  result.rgb += col3 * glow3;
  result.a = max(result.a, glow3);

  // Icy shimmer
  float icyNoise = fbm(p * 300.0 + uTime * 0.05) * 0.08;
  result.rgb += vec3(icyNoise) * result.a;

  return result;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 mouseOff = (uMouse - 0.5) * 0.03;

  vec3 finalColor = vec3(1.0);

  // 12 floating logo groups - hardcoded positions
  vec2 positions[12];
  float scales[12];
  float rotSpeeds[12];
  float moveSpeeds[12];
  float glows[12];

  // Foreground (large)
  positions[0] = vec2(0.15, 0.12);   scales[0]=1.8;  rotSpeeds[0]=0.15;  moveSpeeds[0]=0.08; glows[0]=0.9;
  positions[1] = vec2(-0.08, -0.15); scales[1]=1.5;  rotSpeeds[1]=-0.12; moveSpeeds[1]=0.06; glows[1]=0.8;
  positions[2] = vec2(0.22, -0.08);  scales[2]=2.0;  rotSpeeds[2]=0.1;   moveSpeeds[2]=0.07; glows[2]=1.0;

  // Midground
  positions[3] = vec2(-0.18, 0.2);   scales[3]=1.0;  rotSpeeds[3]=-0.18; moveSpeeds[3]=0.12; glows[3]=0.6;
  positions[4] = vec2(0.25, 0.22);   scales[4]=1.1;  rotSpeeds[4]=0.2;   moveSpeeds[4]=0.1;  glows[4]=0.65;
  positions[5] = vec2(0.0, -0.25);   scales[5]=1.2;  rotSpeeds[5]=-0.14; moveSpeeds[5]=0.09; glows[5]=0.7;
  positions[6] = vec2(-0.25, -0.05); scales[6]=0.9;  rotSpeeds[6]=0.22;  moveSpeeds[6]=0.11; glows[6]=0.55;

  // Background (small)
  positions[7] = vec2(0.3, 0.0);     scales[7]=0.6;  rotSpeeds[7]=-0.25; moveSpeeds[7]=0.15; glows[7]=0.35;
  positions[8] = vec2(-0.3, 0.15);   scales[8]=0.5;  rotSpeeds[8]=0.3;   moveSpeeds[8]=0.18; glows[8]=0.3;
  positions[9] = vec2(0.12, 0.3);    scales[9]=0.55; rotSpeeds[9]=-0.2;  moveSpeeds[9]=0.14; glows[9]=0.35;
  positions[10]= vec2(-0.12, -0.3);  scales[10]=0.45;rotSpeeds[10]=0.28; moveSpeeds[10]=0.2; glows[10]=0.25;
  positions[11]= vec2(0.35, -0.2);   scales[11]=0.5; rotSpeeds[11]=-0.15;moveSpeeds[11]=0.16;glows[11]=0.3;

  for (int i = 11; i >= 0; i--) {
    float t = uTime * moveSpeeds[i];
    vec2 moveOffset = vec2(
      sin(t * 1.1 + float(i) * 1.7) * 0.04,
      cos(t * 0.9 + float(i) * 2.3) * 0.03
    );
    vec2 parallax = mouseOff * scales[i] * 0.5;
    vec2 pos = positions[i] + moveOffset + parallax;
    float rot = uTime * rotSpeeds[i];
    vec4 group = logoGroup(p, pos, scales[i], rot, glows[i]);
    finalColor = mix(finalColor, group.rgb, group.a * 0.8);
  }

  float vig = 1.0 - smoothstep(0.5, 1.2, length((uv - 0.5) * 2.0));
  finalColor = mix(vec3(0.98), finalColor, vig * 0.1 + 0.9);

  gl_FragColor = vec4(finalColor, 1.0);
}
`

/* ============================================
   GLOWING BARS 3D — Three.js Shader Canvas
   ============================================ */

function GlowingBars3D({ show }: { show: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const disposedRef = useRef(false)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const mouseLerpRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (!containerRef.current || !show) return
    disposedRef.current = false

    let renderer: any
    let animationId: number
    let resizeTimeout: ReturnType<typeof setTimeout>

    const container = containerRef.current

    const init = async () => {
      if (disposedRef.current) return

      const THREE = await import('three')

      if (disposedRef.current) return

      const width = container.clientWidth
      const height = container.clientHeight
      const isMobileDevice = window.innerWidth < 768

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1 : 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0xFFFFFF, 1)
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()

      const uniforms = {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      }

      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

      // Mouse tracking
      const handleMouseMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect()
        mouseRef.current.x = (e.clientX - rect.left) / rect.width
        mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height
      }
      container.addEventListener('mousemove', handleMouseMove)

      // Debounced resize
      const handleResize = () => {
        clearTimeout(resizeTimeout)
        resizeTimeout = setTimeout(() => {
          if (disposedRef.current || !container) return
          const w = container.clientWidth
          const h = container.clientHeight
          renderer.setSize(w, h)
          uniforms.uResolution.value.set(w, h)
        }, 200)
      }
      window.addEventListener('resize', handleResize)

      // Animation loop
      const startTime = performance.now()
      const animate = () => {
        if (disposedRef.current) return
        animationId = requestAnimationFrame(animate)

        // Lerp mouse
        mouseLerpRef.current.x += (mouseRef.current.x - mouseLerpRef.current.x) * 0.02
        mouseLerpRef.current.y += (mouseRef.current.y - mouseLerpRef.current.y) * 0.02
        uniforms.uMouse.value.set(mouseLerpRef.current.x, mouseLerpRef.current.y)

        uniforms.uTime.value = (performance.now() - startTime) / 1000

        renderer.render(scene, camera)
      }
      animate()

      // Cleanup references for dispose
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        clearTimeout(resizeTimeout)
        cancelAnimationFrame(animationId)
        geometry.dispose()
        material.dispose()
        renderer.dispose()
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement)
        }
      }
    }

    let cleanup: (() => void) | undefined
    init().then((fn) => {
      cleanup = fn
    })

    return () => {
      disposedRef.current = true
      cleanup?.()
    }
  }, [show])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
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
  const ref = useRef<HTMLDivElement>(null)
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
          const duration = 2000

          const animate = (now: number) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out-quart: 1 - pow(1-t, 4)
            const eased = 1 - Math.pow(1 - progress, 4)
            const current = eased * target

            if (parsed.isFloat) {
              setCounterDisplay(`${parsed.prefix}${current.toFixed(1)}${parsed.suffix}`)
            } else {
              setCounterDisplay(`${parsed.prefix}${Math.round(current)}${parsed.suffix}`)
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

  const showBorder = isMobile ? index % 2 !== 0 : index > 0

  return (
    <div
      ref={ref}
      style={{
        padding: '20px 28px',
        borderLeft: showBorder ? '1px solid rgba(46,154,196,0.15)' : 'none',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(36px, 4vw, 64px)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          background: 'linear-gradient(180deg, #1A1A2E 30%, #2E9AC4 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {counterDisplay}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontWeight: 500,
          fontSize: 10,
          letterSpacing: '0.18em',
          textTransform: 'uppercase' as const,
          color: '#94A3B8',
          marginTop: 8,
        }}
      >
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#2E9AC4',
            boxShadow: '0 0 6px rgba(46,154,196,0.6)',
            flexShrink: 0,
          }}
        />
        {metric.label}
      </div>
    </div>
  )
}

/* ============================================
   PRIMARY CTA BUTTON — Charge-Up Effect
   ============================================ */

function PrimaryCTA({ children, href }: { children: React.ReactNode; href: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: 64,
          background: 'linear-gradient(135deg, #56B8DE, #2E9AC4, #1B7EA6)',
          filter: 'blur(8px)',
          opacity: hovered ? 0.5 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: 'none',
        }}
      />
      <a
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '18px 36px',
          background: '#1A1A2E',
          color: '#FFF',
          borderRadius: 60,
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 14,
          letterSpacing: '0.01em',
          textDecoration: 'none',
          cursor: 'pointer',
          border: 'none',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: hovered
            ? '0 12px 32px rgba(46,154,196,0.4)'
            : '0 4px 16px rgba(26,26,46,0.15)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          zIndex: 1,
        }}
      >
        {/* Charge-up gradient fill */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: hovered ? '100%' : '0%',
            background: 'linear-gradient(135deg, #56B8DE, #2E9AC4, #1B7EA6)',
            borderRadius: 60,
            transition: 'width 0.45s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          {children}
        </span>
      </a>
    </div>
  )
}

/* ============================================
   SCROLL INDICATOR
   ============================================ */

function ScrollIndicator({ show }: { show: boolean }) {
  const [opacity, setOpacity] = useState(0.5)

  useEffect(() => {
    const handleScroll = () => {
      setOpacity(Math.max(0, 0.5 - window.scrollY / 200))
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

  const headlineLines = ['Your next', 'satisfying', 'growth chapter', 'starts here.']
  const isStacked = isMobile || isTablet

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
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.4); }
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>

      {/* Main hero area: left text + right shader */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: isStacked ? 'auto' : '100vh',
          display: 'flex',
          flexDirection: isStacked ? 'column' : 'row',
          alignItems: isStacked ? 'center' : 'stretch',
        }}
      >
        {/* LEFT SIDE — Text Content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            width: isStacked ? '100%' : '42%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: isMobile
              ? '120px 24px 48px'
              : isTablet
                ? '120px 48px 48px'
                : '0 clamp(36px, 4vw, 72px)',
            textAlign: isStacked ? 'center' : 'left',
            alignItems: isStacked ? 'center' : 'flex-start',
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
              gap: 8,
              padding: '6px 14px',
              background: 'rgba(46,154,196,0.06)',
              border: '1px solid rgba(46,154,196,0.12)',
              borderRadius: 999,
              marginBottom: 28,
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
                fontWeight: 400,
                letterSpacing: '0.2em',
                textTransform: 'uppercase' as const,
                color: '#2E9AC4',
              }}
            >
              E-COMMERCE GROWTH AGENCY &middot; &euro;1B+ PORTFOLIO
            </span>
          </motion.div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 'clamp(52px, 7.5vw, 104px)',
              lineHeight: 0.92,
              letterSpacing: '-0.035em',
              color: '#1A1A2E',
              margin: 0,
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
                style={{
                  display: 'block',
                  ...(line === 'satisfying'
                    ? {
                        fontFamily: 'var(--font-accent)',
                        fontWeight: 400,
                        fontSize: '115%',
                        background: 'linear-gradient(90deg, #56B8DE, #2E9AC4, #1B7EA6, #56B8DE, #2E9AC4)',
                        backgroundSize: '200% auto',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        animation: 'shimmer 4s linear infinite',
                      }
                    : {}),
                }}
              >
                {line}
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
              fontSize: 'clamp(16px, 1.4vw, 19px)',
              lineHeight: 1.7,
              color: '#4A5568',
              maxWidth: 480,
              marginTop: 24,
              letterSpacing: '-0.01em',
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
              marginTop: 32,
              flexWrap: 'wrap',
              justifyContent: isStacked ? 'center' : 'flex-start',
            }}
          >
            <PrimaryCTA href="#contact">
              Kostenloses Audit &rarr;
            </PrimaryCTA>

            <a
              href="#cases"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '18px 36px',
                background: 'transparent',
                color: '#1A1A2E',
                borderRadius: 60,
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.01em',
                textDecoration: 'none',
                cursor: 'pointer',
                border: '1.5px solid rgba(26,26,46,0.12)',
                transition: 'all 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2E9AC4'
                e.currentTarget.style.color = '#2E9AC4'
                e.currentTarget.style.background = 'rgba(46,154,196,0.04)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(26,26,46,0.12)'
                e.currentTarget.style.color = '#1A1A2E'
                e.currentTarget.style.background = 'transparent'
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
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
              flexDirection: isMobile ? undefined : 'row',
              marginTop: 48,
              textAlign: 'left',
            }}
          >
            {HERO_METRICS.map((metric, i) => (
              <MetricItem
                key={metric.label}
                metric={metric}
                index={i}
                shouldAnimate={show}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </div>

        {/* RIGHT SIDE — 3D Shader */}
        <div
          style={
            isStacked
              ? {
                  position: 'relative',
                  width: '100%',
                  height: isMobile ? '40vh' : '50vh',
                }
              : {
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '58%',
                  height: '100%',
                }
          }
        >
          <GlowingBars3D show={show} />
        </div>
      </div>

      {/* Trusted By — Full Width Below */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.4, ease: EASE_OUT_EXPO }}
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          borderTop: '1px solid rgba(226,232,240,0.6)',
          padding: '28px 48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <span
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
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(24px, 4vw, 48px)',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {TRUSTED_LOGOS.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0 }}
              animate={show ? { opacity: 0.7 } : {}}
              transition={{
                duration: 0.4,
                delay: 1.5 + i * 0.05,
                ease: EASE_OUT_EXPO,
              }}
              style={{
                cursor: 'default',
                transition: 'opacity 200ms ease',
              }}
              whileHover={{ opacity: 1 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://logo.clearbit.com/${logo.domain}`}
                alt={logo.name}
                height={24}
                style={{
                  height: 24,
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
