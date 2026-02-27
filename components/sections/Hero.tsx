'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

/* ============================================
   IRON MEDIA — HERO v5.1
   Left: Text Content | Right: Three.js Glass Panels
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---- Partner Logos (text-based, clean) ---- */
const PARTNERS = ['Meta', 'Google', 'TikTok', 'Pinterest', 'Taboola']

/* ============================================
   THREE.JS GLASS PANELS
   5 diagonal frosted-glass slabs with inner glow
   ============================================ */
function GlassPanels() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const disposedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    disposedRef.current = false
    let animId = 0
    let renderer: any = null

    async function init() {
      const THREE = await import('three')
      if (disposedRef.current || !container) return

      const width = container.clientWidth
      const height = container.clientHeight
      if (width === 0 || height === 0) return

      // ---- Renderer (no alpha — we draw our own white bg) ----
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.setClearColor(0xFFFFFF, 1)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.4
      container.appendChild(renderer.domElement)

      // ---- Scene ----
      const scene = new THREE.Scene()
      scene.background = new THREE.Color(0xFFFFFF)

      // ---- Camera ----
      const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100)
      camera.position.set(0, 0, 7)
      camera.lookAt(0, 0, 0)

      // ---- Lighting ----
      // Main: strong directional from upper-right-front
      const mainLight = new THREE.DirectionalLight(0xFFFFFF, 2.0)
      mainLight.position.set(4, 5, 6)
      scene.add(mainLight)

      // Fill: colored from left
      const fillLight = new THREE.DirectionalLight(0x56B8DE, 0.6)
      fillLight.position.set(-4, 0, 4)
      scene.add(fillLight)

      // Back light: creates rim/edge highlight
      const backLight = new THREE.DirectionalLight(0xFFFFFF, 0.8)
      backLight.position.set(0, -2, -4)
      scene.add(backLight)

      // Ambient
      const ambient = new THREE.AmbientLight(0xFFFFFF, 0.3)
      scene.add(ambient)

      // ---- Panel Dimensions ----
      const panelW = 1.6
      const panelH = 16 // tall — extends beyond viewport
      const panelD = 0.06

      const geo = new THREE.BoxGeometry(panelW, panelH, panelD, 1, 1, 1)

      // ---- Panel Configs ----
      const panels = [
        { x: -3.0, color: 0x0E4D6E, emI: 0.8 },
        { x: -1.5, color: 0x1B7EA6, emI: 1.0 },
        { x:  0.0, color: 0x2E9AC4, emI: 1.2 },
        { x:  1.5, color: 0x56B8DE, emI: 1.1 },
        { x:  3.0, color: 0x3A8FB8, emI: 0.9 },
      ]

      const group = new THREE.Group()

      // Edge geometry (thin bright strip on right side of each panel)
      const edgeGeo = new THREE.BoxGeometry(0.035, panelH, panelD + 0.01)

      panels.forEach(({ x, color, emI }) => {
        // Panel material — frosted glowing glass
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity: emI,
          roughness: 0.3,
          metalness: 0.05,
          transparent: true,
          opacity: 0.78,
          side: THREE.FrontSide,
        })

        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.x = x
        group.add(mesh)

        // Bright edge (neon line on right side)
        const edgeColor = new THREE.Color(color).lerp(new THREE.Color(0xFFFFFF), 0.7)
        const edgeMat = new THREE.MeshBasicMaterial({
          color: edgeColor,
          transparent: true,
          opacity: 0.85,
        })
        const edge = new THREE.Mesh(edgeGeo, edgeMat)
        edge.position.x = x + panelW / 2 + 0.018
        group.add(edge)

        // Subtle dark gap on left side (shadow slit)
        const gapGeo = new THREE.BoxGeometry(0.02, panelH, panelD + 0.005)
        const gapMat = new THREE.MeshBasicMaterial({
          color: 0x0A3040,
          transparent: true,
          opacity: 0.12,
        })
        const gap = new THREE.Mesh(gapGeo, gapMat)
        gap.position.x = x - panelW / 2 - 0.01
        group.add(gap)
      })

      // Diagonal orientation: ~50° from vertical
      group.rotation.z = THREE.MathUtils.degToRad(-50)
      scene.add(group)

      // ---- Animation ----
      const AMP = THREE.MathUtils.degToRad(4)
      const PERIOD = 22
      const clock = new THREE.Clock()

      // ---- Mouse ----
      const onMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener('mousemove', onMouseMove)

      // ---- Resize ----
      let resizeTimer: ReturnType<typeof setTimeout>
      const onResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          if (disposedRef.current || !container || !renderer) return
          const w = container.clientWidth
          const h = container.clientHeight
          if (w === 0 || h === 0) return
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }, 150)
      }
      window.addEventListener('resize', onResize)

      // ---- Render Loop ----
      function tick() {
        if (disposedRef.current) return
        animId = requestAnimationFrame(tick)

        const t = clock.getElapsedTime()

        // Slow sinus ping-pong + subtle mouse influence
        const tgtX = Math.sin(t * (2 * Math.PI / PERIOD)) * AMP + mouseRef.current.y * 0.015
        const tgtY = Math.sin(t * (2 * Math.PI / (PERIOD * 1.3))) * AMP * 0.3 + mouseRef.current.x * 0.025

        group.rotation.x += (tgtX - group.rotation.x) * 0.035
        group.rotation.y += (tgtY - group.rotation.y) * 0.035

        renderer.render(scene, camera)
      }
      tick()

      // ---- Cleanup fn ----
      return () => {
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
        clearTimeout(resizeTimer)
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose()
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose())
            else obj.material.dispose()
          }
        })
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
      }}
    />
  )
}

/* ============================================
   MAIN HERO
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
      {/* 3D Panels — desktop only */}
      {!isMobile && <GlassPanels />}

      {/* Mobile: subtle gradient fallback */}
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

      {/* ====== Text Content (left) ====== */}
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
            className="hero-secondary-cta"
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
                className="hero-partner"
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
