'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

/* ============================================
   IRON MEDIA — HERO v5.0
   Left: Text Content | Right: Three.js Glass Panels
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]

/* ---- Partner SVG Logos ---- */
function MetaLogo() {
  return (
    <svg viewBox="0 0 512 110" fill="currentColor" height="20">
      <path d="M81.8 9.4C73 1.6 62.2 0 55.5 0c-13 0-24.5 7.6-33.4 20.3C14.2 31.7 8.5 47.6 8.5 62.8c0 10.2 2.5 18.7 7.3 24.6 4.5 5.6 10.8 8.5 18.2 8.5 6.6 0 12.6-2.3 18.8-8.6 5.4-5.6 11-14 17.4-26.3l3.1-6c5-9.6 8.5-15.6 11.6-19.8 4-5.4 8.3-9.6 13.2-12.5C103.2 19.4 109 18 115.4 18c11.8 0 22.4 5.3 30 15C153.8 43.2 158 57.2 158 73.5c0 17-4.7 31-13.6 40.4-8.5 9-20 13.6-33.3 13.6v-22.7c16.2 0 24.2-12.2 24.2-31.1 0-10-2.3-18.1-6.6-23.5-3.8-4.8-8.8-7.1-15-7.1-7 0-13 3.7-19.4 13.4-3.5 5.3-7.1 12-12 21.7l-2.6 5.1c-6.6 12.9-11.4 21-15.8 26.8C56.8 100 48 104.8 36.3 104.8 23.3 104.8 13 99.7 6.3 90.2.8 82.4-1.5 72.2-1.5 61.5c0-18.2 6.5-37.2 16.2-50.5C25.8-4 40.3-12.8 56-12.8c10.5 0 19.7 3.5 26 9.5l-.2 12.7z" transform="translate(0 6) scale(.73)" />
      <path d="M226.1 78.3c-6.5 14.4-19.5 24.2-35 24.2-20.8 0-36.2-16.8-36.2-44.5 0-27.6 15.4-44.5 36.2-44.5 15.8 0 29 10.2 35.2 25v-2.7c0-32.2-14.2-49.3-37-49.3-14.6 0-26.5 6.6-35.8 19.5l-12-14.8C152.3 3.6 168.5-5 188.4-5c30.7 0 51.6 23 51.6 62.5v43.2h-13.9v-22.4zm-35-2c12.3 0 23-8 28-18V46.6c-5-10-15.7-18-28-18-14 0-23.3 12-23.3 26.8 0 14.9 9.3 26.9 23.3 26.9z" transform="translate(10 6) scale(.73)" />
      <path d="M280.7 13.5h-22.2V-2.8h22.2v-25.6l21.7-6.6v32.2h27v16.3h-27v46.2c0 13.7 4.3 19 14.6 19 4.7 0 9.2-1 13.3-3.2v17c-5.3 2.6-11 4-17.7 4-19.8 0-31.9-11.5-31.9-35.5V13.5z" transform="translate(10 6) scale(.73)" />
      <path d="M385.4 94.7c-7.7 5.8-17.5 9-28.3 9-27 0-45.5-19.2-45.5-47.4 0-27.2 18.8-45.3 44.5-45.3 23.8 0 40 16.7 40 42.3v9h-63c1.5 16.2 12.4 25.8 27 25.8 9.2 0 17-3.5 23.4-10l1.9 16.6zm-52.3-46.8H375c-1-14-9.5-22.5-22-22.5-12.2 0-21 8.7-20 22.5z" transform="translate(10 6) scale(.73)" />
    </svg>
  )
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 272 92" fill="currentColor" height="18">
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
    <svg viewBox="0 0 2859 814" fill="currentColor" height="16">
      <path d="M548.5 0h166.2v667.1H548.5V0zm443.3 180.6H825.7V0h-82v180.6H632v138h111.7v216.7c0 54 10.5 99.8 48 137.2 36.3 36.3 83.7 51 140.5 51 39 0 73.5-7.3 96-15.8V569.5c-16.5 7-40 12.3-63.2 12.3-62.5 0-89.5-42-89.5-94.5V318.6h166.3v-138zM0 180.6h114.2l5.3 73.5h.8c39-57.2 100-85 165.5-85 63.2 0 115.7 23.5 152.2 66.2 40.3 47 58.2 111.8 58.2 192v240h-166V443.5c0-70.5-26-120.2-85-120.2-42.8 0-72 25.3-85 62.5-3.8 11.5-6 26.7-6 42.5v239h-154V180.6zm1839 0h114l5.3 73.5h.8c39-57.2 100-85 165.5-85 63.2 0 115.7 23.5 152.2 66.2 40.3 47 58.2 111.8 58.2 192v240h-166V443.5c0-70.5-26-120.2-85-120.2-42.8 0-72 25.3-85 62.5-3.8 11.5-6 26.7-6 42.5v239h-154V180.6zm-534.3-3.8c-180 0-296.8 133-296.8 311s116.8 311 296.8 311 296.8-133 296.8-311-116.8-311-296.8-311zm0 481.7c-71.5 0-130.5-66-130.5-170.5s59-170.5 130.5-170.5 130.5 66 130.5 170.5-59 170.5-130.5 170.5z" transform="scale(.29)" />
    </svg>
  )
}

function PinterestLogo() {
  return (
    <svg viewBox="0 0 384 128" fill="currentColor" height="16">
      <text fontFamily="Arial, sans-serif" fontWeight="700" fontSize="96" y="92" x="0" letterSpacing="-2">Pinterest</text>
    </svg>
  )
}

function TaboolaLogo() {
  return (
    <svg viewBox="0 0 384 96" fill="currentColor" height="16">
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

/* ============================================
   THREE.JS GLASS PANELS — Right Side
   ============================================ */
function GlassPanels() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Dynamic import Three.js to avoid SSR issues
    let disposed = false

    async function init() {
      const THREE = await import('three')

      if (disposed || !container) return

      const width = container.clientWidth
      const height = container.clientHeight

      // ---- Renderer ----
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(width, height)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.2
      container.appendChild(renderer.domElement)

      // ---- Scene & Camera ----
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
      camera.position.set(0, 0, 8)
      camera.lookAt(0, 0, 0)

      // ---- Lighting ----
      const mainLight = new THREE.DirectionalLight('#FFFFFF', 1.5)
      mainLight.position.set(3, 4, 5)
      scene.add(mainLight)

      const fillLight = new THREE.DirectionalLight('#56B8DE', 0.4)
      fillLight.position.set(-3, 0, 3)
      scene.add(fillLight)

      const ambient = new THREE.AmbientLight('#FFFFFF', 0.15)
      scene.add(ambient)

      // ---- Panel Config ----
      const panelWidth = 1.8
      const panelHeight = 14
      const panelDepth = 0.08

      const panelGeometry = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth)

      const panelsConfig = [
        { x: -3.2, color: '#0E4D6E', emissiveIntensity: 0.6 },
        { x: -1.6, color: '#1B7EA6', emissiveIntensity: 0.7 },
        { x:  0.0, color: '#2E9AC4', emissiveIntensity: 0.85 },
        { x:  1.6, color: '#56B8DE', emissiveIntensity: 0.8 },
        { x:  3.2, color: '#3A8FB8', emissiveIntensity: 0.65 },
      ]

      const panelGroup = new THREE.Group()

      panelsConfig.forEach(({ x, color, emissiveIntensity }) => {
        // ---- Panel Material (Frosted Glowing Glass) ----
        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity,
          transmission: 0.3,
          roughness: 0.35,
          metalness: 0.0,
          thickness: 0.5,
          ior: 1.4,
          transparent: true,
          opacity: 0.85,
          side: THREE.DoubleSide,
          clearcoat: 0.3,
          clearcoatRoughness: 0.4,
        })

        const mesh = new THREE.Mesh(panelGeometry, material)
        mesh.position.x = x
        panelGroup.add(mesh)

        // ---- Edge Glow (bright neon edge on right side) ----
        const edgeGeometry = new THREE.BoxGeometry(0.04, panelHeight, panelDepth + 0.02)
        const edgeColor = new THREE.Color(color).lerp(new THREE.Color('#FFFFFF'), 0.6)
        const edgeMaterial = new THREE.MeshBasicMaterial({
          color: edgeColor,
          transparent: true,
          opacity: 0.7,
        })
        const edge = new THREE.Mesh(edgeGeometry, edgeMaterial)
        edge.position.x = x + panelWidth / 2 + 0.02
        panelGroup.add(edge)
      })

      // Diagonal tilt: rotate entire group ~50 degrees
      panelGroup.rotation.z = THREE.MathUtils.degToRad(-50)
      scene.add(panelGroup)

      // ---- Animation Constants ----
      const ROTATION_AMPLITUDE = THREE.MathUtils.degToRad(4)
      const ROTATION_PERIOD = 22

      // ---- Mouse tracking ----
      const handleMouseMove = (e: MouseEvent) => {
        mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
        mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
      }
      window.addEventListener('mousemove', handleMouseMove)

      // ---- Resize ----
      let resizeTimer: ReturnType<typeof setTimeout>
      const handleResize = () => {
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(() => {
          if (disposed || !container) return
          const w = container.clientWidth
          const h = container.clientHeight
          camera.aspect = w / h
          camera.updateProjectionMatrix()
          renderer.setSize(w, h)
        }, 100)
      }
      window.addEventListener('resize', handleResize)

      // ---- Render Loop ----
      let animId: number
      const clock = new THREE.Clock()

      function animate() {
        if (disposed) return
        animId = requestAnimationFrame(animate)

        const elapsed = clock.getElapsedTime()

        // Slow ping-pong rotation (sinus)
        const targetRotX =
          Math.sin(elapsed * (2 * Math.PI / ROTATION_PERIOD)) * ROTATION_AMPLITUDE +
          mouseRef.current.y * 0.02
        const targetRotY =
          Math.sin(elapsed * (2 * Math.PI / (ROTATION_PERIOD * 1.3))) * (ROTATION_AMPLITUDE * 0.3) +
          mouseRef.current.x * 0.03

        // Smooth lerp
        panelGroup.rotation.x += (targetRotX - panelGroup.rotation.x) * 0.03
        panelGroup.rotation.y += (targetRotY - panelGroup.rotation.y) * 0.03

        renderer.render(scene, camera)
      }
      animate()

      // ---- Cleanup ----
      return () => {
        disposed = true
        cancelAnimationFrame(animId)
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('resize', handleResize)
        clearTimeout(resizeTimer)

        // Dispose geometries and materials
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose()
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose())
            } else {
              obj.material.dispose()
            }
          }
        })
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
      disposed = true
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
        width: '60%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    >
      {/* CSS Glow Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          background: `
            radial-gradient(ellipse at 25% 50%, rgba(14, 77, 110, 0.07) 0%, transparent 50%),
            radial-gradient(ellipse at 38% 45%, rgba(27, 126, 166, 0.09) 0%, transparent 45%),
            radial-gradient(ellipse at 50% 50%, rgba(46, 154, 196, 0.11) 0%, transparent 40%),
            radial-gradient(ellipse at 62% 55%, rgba(86, 184, 222, 0.09) 0%, transparent 45%),
            radial-gradient(ellipse at 75% 50%, rgba(58, 143, 184, 0.07) 0%, transparent 50%)
          `,
          mixBlendMode: 'multiply',
        }}
      />
    </div>
  )
}

/* ============================================
   MAIN HERO COMPONENT
   ============================================ */
export default function Hero({ introComplete }: HeroProps) {
  const [show, setShow] = useState(false)
  const [ctaHovered, setCtaHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (introComplete) {
      const timer = setTimeout(() => setShow(true), 100)
      return () => clearTimeout(timer)
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
      {/* ====== 3D Glass Panels (right side, desktop only) ====== */}
      {!isMobile && <GlassPanels />}

      {/* ====== Mobile fallback glow ====== */}
      {isMobile && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: `
              radial-gradient(ellipse at 70% 30%, rgba(46, 154, 196, 0.12) 0%, transparent 60%),
              radial-gradient(ellipse at 60% 70%, rgba(86, 184, 222, 0.08) 0%, transparent 50%)
            `,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* ====== Text Content (left side) ====== */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          width: isMobile ? '100%' : '45%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile
            ? 'clamp(100px, 15vh, 140px) 24px 48px'
            : 'clamp(100px, 15vh, 140px) 0 48px clamp(40px, 8vw, 120px)',
        }}
      >
        {/* ---- Badge ---- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 0.15, ease: EASE_OUT_EXPO }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            gap: 8,
            padding: '6px 14px',
            background: 'rgba(46, 154, 196, 0.06)',
            border: '1px solid rgba(46, 154, 196, 0.15)',
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
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.6)',
            }}
          />
          E-Commerce Growth Agency
        </motion.div>

        {/* ---- Headline ---- */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 'clamp(36px, 5.5vw, 72px)',
            lineHeight: 1.0,
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

        {/* ---- Subline ---- */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4, ease: EASE_OUT_EXPO }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 'clamp(15px, 1.3vw, 18px)',
            lineHeight: 1.65,
            color: 'var(--text-medium)',
            maxWidth: 480,
            marginTop: 20,
            textAlign: isMobile ? 'center' : 'left',
          }}
        >
          Die führende DACH-Agentur für Performance Marketing, Shopify &amp; D2C-Wachstum.
          Datengetrieben. Ergebnis-besessen.
        </motion.p>

        {/* ---- CTAs ---- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.55, ease: EASE_OUT_EXPO }}
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 32,
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
              gap: 8,
              padding: '14px 28px',
              background: ctaHovered
                ? 'linear-gradient(135deg, #3AADD4, #2490B8)'
                : 'linear-gradient(135deg, #2E9AC4, #1B7EA6)',
              color: '#FFFFFF',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: 'none',
              boxShadow: ctaHovered
                ? '0 8px 30px rgba(46,154,196,0.35), 0 4px 12px rgba(0,0,0,0.08)'
                : '0 4px 20px rgba(46,154,196,0.2), 0 2px 8px rgba(0,0,0,0.04)',
              transform: ctaHovered ? 'translateY(-2px)' : 'translateY(0)',
              transition: 'all 250ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            Kostenloses Audit starten
          </a>

          <a
            href="#cases"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '14px 28px',
              background: 'transparent',
              color: 'var(--text-medium)',
              borderRadius: 10,
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1px solid var(--medium-gray)',
              transition: 'all 250ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(46,154,196,0.4)'
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

        {/* ---- Trusted By ---- */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.75, ease: EASE_OUT_EXPO }}
          style={{
            marginTop: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
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
              gap: 'clamp(16px, 2.5vw, 32px)',
              flexWrap: 'wrap',
            }}
          >
            {PARTNER_LOGOS.map(({ name, Logo }) => (
              <div
                key={name}
                title={name}
                style={{
                  color: 'var(--text-muted)',
                  opacity: 0.45,
                  transition: 'opacity 300ms ease, color 300ms ease',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8'
                  e.currentTarget.style.color = 'var(--text-medium)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '0.45'
                  e.currentTarget.style.color = 'var(--text-muted)'
                }}
              >
                <Logo />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
