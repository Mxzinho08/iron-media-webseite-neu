'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v6
   Centered layout, fullscreen GLSL liquid glass
   16 floating SDF logo groups, no mouse interaction
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
   FRAGMENT SHADER — Liquid Glass Logo Groups
   Ultra-cheap: 1 global distortion, 16 groups x 3 bars
   No per-bar distortion, no fresnel, no specular
   ============================================ */
const FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;

float rrect(vec2 p, vec2 h, float r) {
  vec2 d = abs(p) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

vec4 logoGroup(vec2 uv, vec2 pos, float sc, float rot, float intensity) {
  vec2 p = uv - pos;
  float c = cos(rot), s = sin(rot);
  p = mat2(c, -s, s, c) * p;
  p /= sc;

  float bw = 0.012, gap = 0.005, r = bw * 0.5;
  // CORRECT logo colors: bright, saturated
  vec3 col1 = vec3(0.337, 0.722, 0.871); // #56B8DE sky-blue
  vec3 col2 = vec3(0.180, 0.604, 0.769); // #2E9AC4 ocean-blue
  vec3 col3 = vec3(0.106, 0.494, 0.651); // #1B7EA6 deep-teal
  float x1 = -(bw + gap), x3 = bw + gap;

  vec4 result = vec4(0.0);

  // Bar 1
  float d1 = rrect(p - vec2(x1, 0.0), vec2(bw*0.5, 0.0225), r);
  float f1 = smoothstep(0.001, -0.001, d1);
  if (f1 > 0.0) {
    float bright = mix(0.7, 1.1, smoothstep(-bw*0.5, bw*0.5, p.x - x1));
    result = vec4(col1 * bright * intensity, f1 * 0.7 * intensity);
  }
  // Thin bright edge (glass rim)
  float edge1 = smoothstep(0.003, 0.0, abs(d1)) * 0.4 * intensity;
  result.rgb += col1 * edge1; result.a = max(result.a, edge1);

  // Bar 2 (tallest)
  float d2 = rrect(p - vec2(0.0, 0.0), vec2(bw*0.5, 0.031), r);
  float f2 = smoothstep(0.001, -0.001, d2);
  if (f2 > 0.0) {
    float bright = mix(0.7, 1.1, smoothstep(-bw*0.5, bw*0.5, p.x));
    vec4 b2 = vec4(col2 * bright * intensity, f2 * 0.75 * intensity);
    result.rgb = mix(result.rgb, b2.rgb, b2.a); result.a = max(result.a, b2.a);
  }
  float edge2 = smoothstep(0.003, 0.0, abs(d2)) * 0.4 * intensity;
  result.rgb += col2 * edge2; result.a = max(result.a, edge2);

  // Bar 3
  float d3 = rrect(p - vec2(x3, 0.0), vec2(bw*0.5, 0.025), r);
  float f3 = smoothstep(0.001, -0.001, d3);
  if (f3 > 0.0) {
    float bright = mix(0.7, 1.1, smoothstep(-bw*0.5, bw*0.5, p.x - x3));
    vec4 b3 = vec4(col3 * bright * intensity, f3 * 0.65 * intensity);
    result.rgb = mix(result.rgb, b3.rgb, b3.a); result.a = max(result.a, b3.a);
  }
  float edge3 = smoothstep(0.003, 0.0, abs(d3)) * 0.4 * intensity;
  result.rgb += col3 * edge3; result.a = max(result.a, edge3);

  return result;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  // Single global liquid distortion (applied to all groups)
  vec2 globalDistort = vec2(
    sin(uv.y * 5.0 + uTime * 0.25) * 0.002 + sin(uv.y * 2.0 + uTime * 0.12) * 0.003,
    cos(uv.x * 4.0 + uTime * 0.20) * 0.002 + cos(uv.x * 1.8 + uTime * 0.10) * 0.003
  );
  p += globalDistort;

  // Subtle blue grid background
  float gridX = smoothstep(0.0, 0.001, abs(mod(uv.x * 40.0, 1.0) - 0.5) - 0.495);
  float gridY = smoothstep(0.0, 0.001, abs(mod(uv.y * 40.0, 1.0) - 0.5) - 0.495);
  float grid = min(gridX, gridY);
  vec3 finalColor = mix(vec3(1.0), vec3(0.92, 0.96, 1.0), (1.0 - grid) * 0.08);

  // 16 floating logo groups — fill entire viewport
  // Use hardcoded positions spread across -0.5 to +0.5
  vec2 positions[16];
  float scales[16];
  float rotSpeeds[16];
  float moveSpeeds[16];
  float glows[16];

  // Foreground (3) — large, bright
  positions[0]=vec2(0.20, 0.15);  scales[0]=1.6; rotSpeeds[0]=0.04;  moveSpeeds[0]=0.035; glows[0]=0.95;
  positions[1]=vec2(-0.25,-0.18); scales[1]=1.4; rotSpeeds[1]=-0.035;moveSpeeds[1]=0.03;  glows[1]=0.90;
  positions[2]=vec2(0.35,-0.05);  scales[2]=1.7; rotSpeeds[2]=0.03;  moveSpeeds[2]=0.032; glows[2]=1.0;

  // Midground (5) — medium
  positions[3]=vec2(-0.38, 0.25); scales[3]=1.0; rotSpeeds[3]=-0.06; moveSpeeds[3]=0.05;  glows[3]=0.7;
  positions[4]=vec2(0.42, 0.28);  scales[4]=0.95;rotSpeeds[4]=0.07;  moveSpeeds[4]=0.055; glows[4]=0.65;
  positions[5]=vec2(0.02,-0.35);  scales[5]=1.1; rotSpeeds[5]=-0.05; moveSpeeds[5]=0.04;  glows[5]=0.7;
  positions[6]=vec2(-0.42,-0.10); scales[6]=0.9; rotSpeeds[6]=0.08;  moveSpeeds[6]=0.06;  glows[6]=0.6;
  positions[7]=vec2(0.10, 0.38);  scales[7]=1.0; rotSpeeds[7]=-0.04; moveSpeeds[7]=0.045; glows[7]=0.65;

  // Background (8) — small, dimmer, fill gaps
  positions[8]=vec2(0.45, 0.05);   scales[8]=0.55; rotSpeeds[8]=-0.09;  moveSpeeds[8]=0.07;  glows[8]=0.4;
  positions[9]=vec2(-0.45, 0.18);  scales[9]=0.5;  rotSpeeds[9]=0.10;   moveSpeeds[9]=0.08;  glows[9]=0.35;
  positions[10]=vec2(0.22, 0.40);  scales[10]=0.5; rotSpeeds[10]=-0.08; moveSpeeds[10]=0.065; glows[10]=0.35;
  positions[11]=vec2(-0.18,-0.40); scales[11]=0.45;rotSpeeds[11]=0.11;  moveSpeeds[11]=0.09;  glows[11]=0.3;
  positions[12]=vec2(0.48,-0.25);  scales[12]=0.5; rotSpeeds[12]=-0.07; moveSpeeds[12]=0.075; glows[12]=0.35;
  positions[13]=vec2(-0.48, 0.35); scales[13]=0.45;rotSpeeds[13]=0.09;  moveSpeeds[13]=0.085; glows[13]=0.3;
  positions[14]=vec2(-0.10, 0.42); scales[14]=0.4; rotSpeeds[14]=-0.10; moveSpeeds[14]=0.09;  glows[14]=0.3;
  positions[15]=vec2(0.30,-0.38);  scales[15]=0.5; rotSpeeds[15]=0.08;  moveSpeeds[15]=0.07;  glows[15]=0.35;

  for (int i = 15; i >= 0; i--) {
    float t = uTime * moveSpeeds[i];
    vec2 moveOff = vec2(
      sin(t * 1.1 + float(i) * 1.7) * 0.035 + sin(t * 0.5 + float(i) * 0.8) * 0.02,
      cos(t * 0.9 + float(i) * 2.3) * 0.025 + cos(t * 0.35 + float(i) * 1.2) * 0.015
    );
    vec2 pos = positions[i] + moveOff;
    float cull = scales[i] * 0.05;
    if (abs(p.x - pos.x) < cull && abs(p.y - pos.y) < cull) {
      float rot = uTime * rotSpeeds[i];
      vec4 group = logoGroup(p, pos, scales[i], rot, glows[i]);
      finalColor = mix(finalColor, group.rgb, group.a * 0.9);
    }
  }

  gl_FragColor = vec4(finalColor, 1.0);
}
`

/* ============================================
   LIQUID GLASS — Three.js Shader Canvas
   No mouse interaction, autonomous Lissajous motion
   ============================================ */

function LiquidGlassCanvas({ show }: { show: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const disposedRef = useRef(false)

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
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobileDevice ? 1 : 1.5))
      renderer.setSize(width, height)
      renderer.setClearColor(0xFFFFFF, 1)
      container.appendChild(renderer.domElement)

      const scene = new THREE.Scene()

      const uniforms = {
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(width, height) },
      }

      const geometry = new THREE.PlaneGeometry(2, 2)
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms,
      })

      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)

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
      let lastRender = 0
      const animate = () => {
        if (disposedRef.current) return
        animationId = requestAnimationFrame(animate)
        const now = performance.now()
        if (now - lastRender < 33) return
        lastRender = now

        uniforms.uTime.value = (now - startTime) / 1000

        renderer.render(scene, camera)
      }
      animate()

      return () => {
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
   METRIC ITEM — Counter Animation
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
        padding: isMobile ? '16px 20px' : '20px 28px',
        borderLeft: showBorder ? '1px solid rgba(46,154,196,0.15)' : 'none',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 'clamp(32px, 3.5vw, 56px)',
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
          justifyContent: 'center',
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
   PRIMARY CTA — Charge-Up Effect
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
   HERO COMPONENT — Centered, Full Viewport
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
        backgroundImage: `
          linear-gradient(rgba(46,154,196,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(46,154,196,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
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

      {/* GLSL Shader — Fullscreen background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        <LiquidGlassCanvas show={show} />
      </div>

      {/* Content — Centered on top */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: 1100,
          padding: isMobile
            ? '120px 20px 80px'
            : isTablet
              ? '120px 40px 80px'
              : '140px 48px 100px',
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
            fontSize: 'clamp(40px, 6vw, 80px)',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#1A1A2E',
            margin: 0,
            maxWidth: 900,
          }}
        >
          {['Wir bringen Ecom Brands', 'aufs n\u00e4chste'].map((line, i) => (
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
              }}
            >
              {line}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 30 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.4 + 2 * 0.12,
              ease: EASE_OUT_EXPO,
            }}
            style={{
              display: 'block',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-accent)',
                fontWeight: 400,
                fontSize: '115%',
                background: 'linear-gradient(90deg, #56B8DE, #2E9AC4, #1B7EA6, #56B8DE, #2E9AC4)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'shimmer 4s linear infinite',
              }}
            >
              Level
            </span>
          </motion.span>
        </h1>

        {/* Subline */}
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
            maxWidth: 560,
            marginTop: 24,
            letterSpacing: '-0.01em',
          }}
        >
          Der Growth-Partner f&uuml;r ambitionierte E-Commerce Brands.
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
            justifyContent: 'center',
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

        {/* Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2, ease: EASE_OUT_EXPO }}
          style={{
            display: isMobile ? 'grid' : 'flex',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined,
            flexDirection: isMobile ? undefined : 'row',
            justifyContent: 'center',
            marginTop: 48,
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

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
