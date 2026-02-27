'use client'

import Spline from '@splinetool/react-spline'

/* ============================================
   IRON MEDIA — HERO
   Fullscreen Spline 3D Background
   ============================================ */

interface HeroProps {
  introComplete: boolean
}

// Retrofuturism - BG animation (glowing glass refraction)
// To customize colors: Remix at https://app.spline.design/community/file/fba5a24b-a843-461d-b983-e5c140313420
// then change orange → Iron Media blues (#56B8DE, #2E9AC4, #1B7EA6) and re-export
const SPLINE_SCENE_URL = 'https://prod.spline.design/9jQ7udEHftQjbDVL/scene.splinecode'

export default function Hero({ introComplete }: HeroProps) {
  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        background: '#0A0F1E',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <Spline scene={SPLINE_SCENE_URL} />
      </div>
    </section>
  )
}
