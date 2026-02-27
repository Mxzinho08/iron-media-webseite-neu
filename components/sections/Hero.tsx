'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ============================================
   IRON MEDIA — HERO
   Left: Text | Right: GLSL Glowing Glass Panels
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
const PARTNERS = ['Meta', 'Google', 'TikTok', 'Pinterest', 'Taboola']

/* ============================================
   GLSL SHADER — Glowing Frosted Glass Panels
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

  // ── Value Noise ──
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
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p *= 2.0;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / uResolution.y;

    // ── Rotation animation ──
    float rotAngle = sin(uTime * 0.28) * 0.06;
    rotAngle += (uMouse.x - 0.5) * 0.02;
    float rotY = sin(uTime * 0.21) * 0.04 + (uMouse.y - 0.5) * 0.015;

    vec2 uvR = uv;
    uvR.x += rotAngle * (uv.y - 0.5) * 0.5;
    uvR.y += rotY * (uv.x - 0.5) * 0.3;

    // ── Diagonal transform (~50 deg) ──
    float diagAngle = -0.87;
    float cosA = cos(diagAngle);
    float sinA = sin(diagAngle);

    vec2 uvC = uvR - vec2(0.5);
    uvC.x *= aspect;

    float diagX = uvC.x * cosA - uvC.y * sinA;
    float diagY = uvC.x * sinA + uvC.y * cosA;

    // ── Panel config ──
    float panelWidth = 0.20;
    float gapWidth = 0.015;
    float totalStep = panelWidth + gapWidth;

    float pCenters[5];
    pCenters[0] = -2.0 * totalStep;
    pCenters[1] = -1.0 * totalStep;
    pCenters[2] =  0.0;
    pCenters[3] =  1.0 * totalStep;
    pCenters[4] =  2.0 * totalStep;

    vec3 cols[5];
    cols[0] = vec3(0.047, 0.208, 0.278); // #0C3547
    cols[1] = vec3(0.106, 0.420, 0.541); // #1B6B8A
    cols[2] = vec3(0.180, 0.604, 0.769); // #2E9AC4
    cols[3] = vec3(0.337, 0.722, 0.871); // #56B8DE
    cols[4] = vec3(0.106, 0.494, 0.651); // #1B7EA6

    float glows[5];
    glows[0] = 0.4;
    glows[1] = 0.6;
    glows[2] = 1.0;
    glows[3] = 0.9;
    glows[4] = 0.55;

    // ── Noise texture ──
    float grain = fbm(uvR * 250.0) * 0.12;
    float fineGrain = noise(uvR * 500.0) * 0.06;
    float totalGrain = grain + fineGrain;

    // ── Render panels back to front ──
    vec3 finalColor = vec3(1.0); // white bg

    for (int i = 0; i < 5; i++) {
      float dist = diagX - pCenters[i];
      float halfW = panelWidth * 0.5;

      float glowRadius = 0.08 + glows[i] * 0.04;
      float glowDist = max(0.0, abs(dist) - halfW);
      float halo = exp(-glowDist * glowDist / (glowRadius * glowRadius)) * glows[i] * 0.3;

      // Shadow from next panel
      float shadowFromNext = 0.0;
      if (i < 4) {
        shadowFromNext = smoothstep(halfW - gapWidth * 2.0, halfW, dist) * 0.4;
      }

      if (abs(dist) < halfW) {
        float t = (dist + halfW) / panelWidth; // 0=left 1=right

        // Cross-panel gradient: bright right, dark left
        float brightness = mix(0.15 + glows[i] * 0.1, 0.85 + glows[i] * 0.15, t) * glows[i];

        // Bright neon edge (right side)
        float edgeGlow = smoothstep(0.92, 1.0, t) * 1.5;
        brightness += edgeGlow;
        brightness -= shadowFromNext;
        brightness += totalGrain * brightness;

        vec3 panelColor = cols[i] * brightness;
        // Edge goes nearly white
        panelColor = mix(panelColor, vec3(1.0), edgeGlow * 0.4);

        finalColor = panelColor;
      } else if (halo > 0.01) {
        // Glow halo on background
        finalColor = mix(finalColor, cols[i] * 0.7, halo);
      }
    }

    // ── Shadow slits between panels ──
    for (int i = 0; i < 4; i++) {
      float gapCenter = pCenters[i] + panelWidth * 0.5 + gapWidth * 0.5;
      float gapDist = abs(diagX - gapCenter);
      float gapHalfW = gapWidth * 0.5;

      if (gapDist < gapHalfW * 2.5) {
        float shadowStrength = smoothstep(gapHalfW * 2.5, 0.0, gapDist) * 0.55;
        finalColor *= (1.0 - shadowStrength);
      }
    }

    // ── Soft vignette ──
    float vig = 1.0 - smoothstep(0.3, 0.9, length(uvC / vec2(aspect * 0.7, 0.7)));
    finalColor = mix(vec3(1.0), finalColor, vig * 0.3 + 0.7);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

/* ============================================
   GLOWING PANELS COMPONENT
   ============================================ */
function GlowingPanels() {
  const containerRef = useRef<HTMLDivElement>(null)
  const disposedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    disposedRef.current = false

    let animId = 0
    let renderer: any = null
    let mouseX = 0.5
    let mouseY = 0.5

    async function init() {
      const THREE = await import('three')
      if (disposedRef.current || !container) return

      const w = container.clientWidth
      const h = container.clientHeight
      if (w === 0 || h === 0) return

      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

      // Mouse
      const onMouse = (e: MouseEvent) => {
        mouseX = e.clientX / window.innerWidth
        mouseY = e.clientY / window.innerHeight
      }
      window.addEventListener('mousemove', onMouse)

      // Resize
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
        }, 150)
      }
      window.addEventListener('resize', onResize)

      // Render loop
      function tick(time: number) {
        if (disposedRef.current) return
        animId = requestAnimationFrame(tick)
        uniforms.uTime.value = time * 0.001
        uniforms.uMouse.value.x += (mouseX - uniforms.uMouse.value.x) * 0.02
        uniforms.uMouse.value.y += (mouseY - uniforms.uMouse.value.y) * 0.02
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
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '58%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}

/* ============================================
   HERO COMPONENT
   ============================================ */
export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const t = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(t)
    }
  }, [introComplete])

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
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
        alignItems: 'center',
      }}
    >
      {!isMobile && <GlowingPanels />}

      {isMobile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background:
              'radial-gradient(ellipse at 70% 40%, rgba(46,154,196,0.1) 0%, transparent 60%), radial-gradient(ellipse at 50% 80%, rgba(86,184,222,0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Text Content — left side */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: isMobile ? '100%' : '46%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile
            ? '120px 24px 60px'
            : '0 0 0 clamp(48px, 8vw, 120px)',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT_EXPO }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: isMobile ? 'center' : 'flex-start',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(46,154,196,0.05)',
            border: '1px solid rgba(46,154,196,0.12)',
            borderRadius: 999,
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            color: 'var(--text-medium)',
            marginBottom: 24,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#34D399',
              flexShrink: 0,
              boxShadow: '0 0 6px rgba(52,211,153,0.5)',
            }}
          />
          E-Commerce Growth Agency
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(34px, 5vw, 68px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: '#1A1A2E',
            margin: 0,
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          E-Commerce Brands
          <br />
          wachsen mit uns
          <br />
          <span className="text-blue-gradient">unaufhaltbar.</span>
        </motion.h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 'clamp(14px, 1.2vw, 17px)',
            lineHeight: 1.65,
            color: 'var(--text-medium)',
            maxWidth: 440,
            marginTop: 18,
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          Die führende DACH-Agentur für Performance Marketing, Shopify &amp;&nbsp;D2C-Wachstum.
          Datengetrieben. Ergebnis-besessen.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 28,
            flexWrap: 'wrap',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <a
            href="#contact"
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '13px 26px',
              background: ctaHovered
                ? 'linear-gradient(135deg, #3AADD4, #2490B8)'
                : 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
              color: '#FFF',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              boxShadow: ctaHovered
                ? '0 6px 24px rgba(46,154,196,0.35)'
                : '0 3px 14px rgba(46,154,196,0.18)',
              transform: ctaHovered ? 'translateY(-1px)' : 'translateY(0)',
              transition: 'all 200ms cubic-bezier(0.34,1.56,0.64,1)',
            }}
          >
            Kostenloses Audit starten
          </a>
          <a
            href="#cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '13px 26px',
              background: 'transparent',
              color: 'var(--text-medium)',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1px solid var(--medium-gray)',
              transition: 'all 200ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(46,154,196,0.35)'
              e.currentTarget.style.color = '#1B7EA6'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--medium-gray)'
              e.currentTarget.style.color = 'var(--text-medium)'
            }}
          >
            Erfolgsgeschichten →
          </a>
        </motion.div>

        {/* Trusted By */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.8, ease: EASE_OUT_EXPO }}
          style={{
            marginTop: 48,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: isMobile ? 'center' : 'flex-start',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
              color: 'var(--text-light)',
            }}
          >
            Trusted by
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(20px, 2.5vw, 36px)',
              flexWrap: 'wrap',
            }}
          >
            {PARTNERS.map((name) => (
              <span
                key={name}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 1vw, 14px)',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                  transition: 'color 200ms ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-medium)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)' }}
              >
                {name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
