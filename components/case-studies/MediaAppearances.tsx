'use client'

import { MEDIA_APPEARANCES } from '@/lib/constants'
import ScrollReveal from '@/components/ui/ScrollReveal'

interface MediaAppearance {
  title: string
  podcast: string
  platform: string
  url?: string
  description: string
}

function PlayButton() {
  return (
    <div className="w-14 h-14 rounded-full bg-[rgba(46,154,196,0.2)] border-2 border-[rgba(46,154,196,0.4)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2E9AC4]">
      <svg viewBox="0 0 24 24" className="w-6 h-6 ml-1">
        <path d="M8 5v14l11-7z" fill="rgba(255,255,255,0.8)" />
      </svg>
    </div>
  )
}

function MediaCard({ appearance, index }: { appearance: MediaAppearance; index: number }) {
  return (
    <ScrollReveal delay={index * 0.1}>
      <a
        href={appearance.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(46,154,196,0.06)] overflow-hidden transition-all duration-300 cursor-pointer hover:border-[rgba(46,154,196,0.2)] hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(46,154,196,0.1)]"
      >
        {/* Thumbnail area */}
        <div className="w-full aspect-video bg-[rgba(46,154,196,0.05)] flex items-center justify-center relative">
          <PlayButton />
        </div>

        {/* Content area */}
        <div className="p-5">
          <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-[#2E9AC4]">
            {appearance.platform}
          </div>
          <h3 className="font-display font-semibold text-[15px] text-white mt-2 leading-[1.4] line-clamp-2">
            {appearance.title}
          </h3>
          <p className="text-[13px] text-white/50 mt-1">
            {appearance.podcast}
          </p>
          <p className="text-[13px] text-white/40 mt-2 leading-[1.5] line-clamp-2">
            {appearance.description}
          </p>
        </div>
      </a>
    </ScrollReveal>
  )
}

export default function MediaAppearances() {
  const appearances = MEDIA_APPEARANCES as MediaAppearance[]

  return (
    <div className="max-w-[1440px] mx-auto mt-20 px-[clamp(24px,5vw,80px)]">
      {/* Sub-header */}
      <div className="text-center">
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#2E9AC4] mb-4">
          BEKANNT AUS
        </div>
        <h2 className="font-display font-bold text-3xl text-white mb-12">
          Featured In
        </h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appearances.map((appearance, index) => (
          <MediaCard
            key={index}
            appearance={appearance}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}
