'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Navigation from '@/components/layout/Navigation'
import Hero from '@/components/sections/Hero'

const IntroAnimation = dynamic(() => import('@/components/intro/IntroAnimation'), {
  ssr: false,
})

export default function Home() {
  const [introComplete, setIntroComplete] = useState(false)

  return (
    <>
      {!introComplete && (
        <IntroAnimation onComplete={() => setIntroComplete(true)} />
      )}
      <Navigation />
      <main className="relative">
        <Hero introComplete={introComplete} />
      </main>
    </>
  )
}
