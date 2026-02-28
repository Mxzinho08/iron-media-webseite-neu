'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HERO_METRICS, TRUSTED_LOGOS } from '@/lib/constants'

/* ============================================
   IRON MEDIA — HERO v5
   Centered layout, fullscreen GLSL liquid glass
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
   FRAGMENT SHADER — Liquid Glass Logo Groups
   ============================================ */
const FRAGMENT_SHADER = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMouse;

/* --- Noise utilities --- */
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

/* --- Rounded rectangle SDF --- */
float rrect(vec2 p, vec2 h, float r) {
  vec2 d = abs(p) - h + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

/* --- Liquid glass UV distortion --- */
vec2 glassDistort(vec2 p, float t) {
  vec2 d = vec2(0.0);
  d += 0.04 * vec2(
    sin(fbm(p * 0.8 + vec2(t * 0.08, 0.0)) * 2.0),
    cos(fbm(p * 0.8 + vec2(0.0, t * 0.06)) * 2.0)
  );
  d += 0.02 * vec2(
    sin(fbm(p * 2.0 + t * 0.15) * 3.0),
    cos(fbm(p * 2.0 + t * 0.12) * 3.0)
  );
  return d;
}

/* --- Fresnel edge glow --- */
float fresnel(float d) {
  float edge = smoothstep(0.006, -0.006, abs(d));
  return pow(edge, 1.5);
}

/* --- Liquid flow field --- */
float liquidFlow(vec2 p, float t) {
  return 0.1 * sin(p.x * 3.0 + t * 0.3) * sin(p.y * 2.0 + t * 0.2)
       + 0.05 * sin(p.x * 5.0 - t * 0.5) * cos(p.y * 4.0 + t * 0.4);
}

/* --- Single bar with liquid glass effects --- */
vec4 glassBar(vec2 p, vec2 barPos, vec2 halfSize, float radius, vec3 barColor, float glowIntensity, float t) {
  vec4 result = vec4(0.0);

  // Apply UV distortion for liquid feel
  vec2 distorted = p + glassDistort(p, t) * 0.3;

  // Chromatic aberration - offset R/G/B channels
  float d_r = rrect(distorted + vec2(0.0003, 0.0) - barPos, halfSize, radius);
  float d_g = rrect(distorted - barPos, halfSize, radius);
  float d_b = rrect(distorted - vec2(0.0003, 0.0) - barPos, halfSize, radius);

  // Fresnel edge glow per channel
  float fr_r = fresnel(d_r);
  float fr_g = fresnel(d_g);
  float fr_b = fresnel(d_b);

  // Interior fill with transparency (0.4–0.6 alpha for glassy look)
  float fillR = smoothstep(0.001, -0.001, d_r);
  float fillG = smoothstep(0.001, -0.001, d_g);
  float fillB = smoothstep(0.001, -0.001, d_b);

  // Liquid flow modulation
  float flow = liquidFlow(p, t);

  // Interior color with gradient and flow
  float bright = mix(0.4, 0.9, smoothstep(-halfSize.x, halfSize.x, (p.x - barPos.x))) + flow * 0.2;
  vec3 interiorColor = barColor * bright * glowIntensity;

  // Specular highlight
  vec2 specPos = barPos + vec2(halfSize.x * 0.3, halfSize.y * 0.35);
  float spec = exp(-dot(p - specPos, p - specPos) * 15000.0);
  interiorColor += vec3(1.0) * spec * 0.8;

  // Combine fill with chromatic separation
  float fillAlpha = max(fillR, max(fillG, fillB));
  vec3 fillColor = vec3(
    interiorColor.r * fillR + barColor.r * 0.3 * (fillG + fillB) * 0.5,
    interiorColor.g * fillG + barColor.g * 0.3 * (fillR + fillB) * 0.5,
    interiorColor.b * fillB + barColor.b * 0.3 * (fillR + fillG) * 0.5
  );

  // Glass transparency (0.4–0.6)
  float glassAlpha = fillAlpha * mix(0.4, 0.6, glowIntensity);

  result = vec4(fillColor, glassAlpha);

  // Add fresnel edge glow (chromatic)
  vec3 fresnelColor = vec3(
    barColor.r * fr_r,
    barColor.g * fr_g,
    barColor.b * fr_b
  ) * glowIntensity * 1.2;
  float fresnelAlpha = max(fr_r, max(fr_g, fr_b)) * 0.7;
  result.rgb += fresnelColor;
  result.a = max(result.a, fresnelAlpha);

  // Soft wide glow (wider radius, softer falloff)
  float glowDist = rrect(p - barPos, halfSize, radius);
  float softGlow = exp(-glowDist * glowDist * 3000.0) * glowIntensity * 0.25;
  result.rgb += barColor * softGlow;
  result.a = max(result.a, softGlow);

  return result;
}

/* --- Logo group: 3 bars with liquid glass --- */
vec4 logoGroup(vec2 uv, vec2 pos, float sc, float rot, float glowIntensity) {
  vec2 p = uv - pos;
  float c = cos(rot), s = sin(rot);
  p = mat2(c, -s, s, c) * p;
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

  vec3 col1 = vec3(0.337, 0.722, 0.871); // sky-blue
  vec3 col2 = vec3(0.180, 0.604, 0.769); // ocean-blue
  vec3 col3 = vec3(0.106, 0.494, 0.651); // deep-teal

  float t = uTime;
  vec4 result = vec4(0.0);

  // Bar 1 - sky-blue
  vec4 bar1 = glassBar(p, vec2(x1, 0.0), vec2(bw * 0.5, h1 * 0.5), r, col1, glowIntensity, t);
  result.rgb = mix(result.rgb, bar1.rgb, bar1.a);
  result.a = max(result.a, bar1.a);

  // Bar 2 - ocean-blue (tallest)
  vec4 bar2 = glassBar(p, vec2(x2, 0.0), vec2(bw * 0.5, h2 * 0.5), r, col2, glowIntensity, t);
  result.rgb = mix(result.rgb, bar2.rgb, bar2.a);
  result.a = max(result.a, bar2.a);

  // Bar 3 - deep-teal
  vec4 bar3 = glassBar(p, vec2(x3, 0.0), vec2(bw * 0.5, h3 * 0.5), r, col3, glowIntensity, t);
  result.rgb = mix(result.rgb, bar3.rgb, bar3.a);
  result.a = max(result.a, bar3.a);

  // Subtle icy shimmer over the group
  float icyNoise = fbm(p * 200.0 + t * 0.04) * 0.05;
  result.rgb += vec3(icyNoise) * result.a;

  return result;
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 mouseOff = (uMouse - 0.5) * 0.03;

  vec3 finalColor = vec3(1.0);

  // 12 floating logo groups — distributed across entire viewport
  vec2 positions[12];
  float scales[12];
  float rotSpeeds[12];
  float moveSpeeds[12];
  float glows[12];

  // Foreground (3): scales 1.5–2.0, slow rotation, strong glow
  positions[0] = vec2(0.15, 0.12);    scales[0] = 1.8;  rotSpeeds[0] = 0.075;  moveSpeeds[0] = 0.048; glows[0] = 0.9;
  positions[1] = vec2(-0.25, -0.18);  scales[1] = 1.5;  rotSpeeds[1] = -0.06;  moveSpeeds[1] = 0.036; glows[1] = 0.8;
  positions[2] = vec2(0.30, -0.10);   scales[2] = 2.0;  rotSpeeds[2] = 0.05;   moveSpeeds[2] = 0.042; glows[2] = 1.0;

  // Midground (4): scales 0.8–1.2, medium speed
  positions[3] = vec2(-0.35, 0.25);   scales[3] = 1.0;  rotSpeeds[3] = -0.09;  moveSpeeds[3] = 0.072; glows[3] = 0.6;
  positions[4] = vec2(0.38, 0.28);    scales[4] = 1.1;  rotSpeeds[4] = 0.10;   moveSpeeds[4] = 0.060; glows[4] = 0.65;
  positions[5] = vec2(0.0, -0.32);    scales[5] = 1.2;  rotSpeeds[5] = -0.07;  moveSpeeds[5] = 0.054; glows[5] = 0.7;
  positions[6] = vec2(-0.38, -0.08);  scales[6] = 0.9;  rotSpeeds[6] = 0.11;   moveSpeeds[6] = 0.066; glows[6] = 0.55;

  // Background (5): scales 0.4–0.7, faster small movement, dimmer
  positions[7] = vec2(0.40, 0.05);    scales[7] = 0.6;  rotSpeeds[7] = -0.125; moveSpeeds[7] = 0.090; glows[7] = 0.35;
  positions[8] = vec2(-0.40, 0.18);   scales[8] = 0.5;  rotSpeeds[8] = 0.15;   moveSpeeds[8] = 0.108; glows[8] = 0.3;
  positions[9] = vec2(0.18, 0.35);    scales[9] = 0.55; rotSpeeds[9] = -0.10;  moveSpeeds[9] = 0.084; glows[9] = 0.35;
  positions[10] = vec2(-0.15, -0.38); scales[10] = 0.45; rotSpeeds[10] = 0.14;  moveSpeeds[10] = 0.120; glows[10] = 0.25;
  positions[11] = vec2(0.35, -0.28);  scales[11] = 0.5;  rotSpeeds[11] = -0.075; moveSpeeds[11] = 0.096; glows[11] = 0.3;

  // Render back-to-front
  for (int i = 11; i >= 0; i--) {
    float t = uTime * moveSpeeds[i];
    // Smoother Lissajous movement
    vec2 moveOffset = vec2(
      sin(t * 1.1 + float(i) * 1.7) * 0.04 + sin(t * 0.7 + float(i) * 0.9) * 0.02,
      cos(t * 0.9 + float(i) * 2.3) * 0.03 + cos(t * 0.5 + float(i) * 1.3) * 0.015
    );
    // Stronger parallax
    vec2 parallax = mouseOff * scales[i] * 1.0;
    vec2 pos = positions[i] + moveOffset + parallax;
    float rot = uTime * rotSpeeds[i];
    vec4 group = logoGroup(p, pos, scales[i], rot, glows[i]);
    finalColor = mix(finalColor, group.rgb, group.a * 0.8);
  }

  // Vignette
  float vig = 1.0 - smoothstep(0.6, 1.4, length((uv - 0.5) * 2.0));
  finalColor = mix(vec3(0.98), finalColor, vig * 0.12 + 0.88);

  gl_FragColor = vec4(finalColor, 1.0);
}
`

/* ============================================
   LIQUID GLASS — Three.js Shader Canvas
   ============================================ */

function LiquidGlassCanvas({ show }: { show: boolean }) {
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

      // Mouse tracking (on window, since canvas is pointer-events: none)
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = e.clientX / window.innerWidth
        mouseRef.current.y = 1.0 - e.clientY / window.innerHeight
      }
      window.addEventListener('mousemove', handleMouseMove)

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

        // Smoother mouse lerp (0.03)
        mouseLerpRef.current.x += (mouseRef.current.x - mouseLerpRef.current.x) * 0.03
        mouseLerpRef.current.y += (mouseRef.current.y - mouseLerpRef.current.y) * 0.03
        uniforms.uMouse.value.set(mouseLerpRef.current.x, mouseLerpRef.current.y)

        uniforms.uTime.value = (performance.now() - startTime) / 1000

        renderer.render(scene, camera)
      }
      animate()

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
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

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 1.4, ease: EASE_OUT_EXPO }}
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            borderTop: '1px solid rgba(226,232,240,0.6)',
            paddingTop: 28,
            width: '100%',
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
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator show={show} />
    </section>
  )
}
