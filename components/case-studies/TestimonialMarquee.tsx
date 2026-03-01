'use client'

import { TESTIMONIALS } from '@/lib/constants'

interface Testimonial {
  text: string
  author: string
  source: string
  context?: string
  rating?: number
}

function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-[#00B67A]">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="flex-shrink-0 max-w-[400px] p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(46,154,196,0.06)]">
      <div className="text-4xl text-[#2E9AC4]/20 font-serif mb-2">&ldquo;</div>
      <p className="italic text-[15px] leading-[1.7] text-white/70">
        {testimonial.text}
      </p>
      <div className="font-semibold text-[13px] text-white/90 mt-4">
        {testimonial.author}
      </div>
      <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-white/30 mt-1">
        {testimonial.source}
      </div>
      {testimonial.rating && (
        <div className="flex gap-0.5 mt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon key={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function TestimonialMarquee() {
  const testimonials = TESTIMONIALS as Testimonial[]

  return (
    <div className="w-full overflow-hidden border-t border-b border-[rgba(46,154,196,0.06)] py-16">
      <div
        className="flex gap-12 hover:[animation-play-state:paused]"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        {/* First set */}
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={`a-${index}`} testimonial={testimonial} />
        ))}
        {/* Duplicated set for seamless looping */}
        {testimonials.map((testimonial, index) => (
          <TestimonialCard key={`b-${index}`} testimonial={testimonial} />
        ))}
      </div>
    </div>
  )
}
