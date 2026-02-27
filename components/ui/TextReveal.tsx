'use client'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

interface TextRevealProps {
  text: string
  className?: string
  delay?: number
  staggerDelay?: number
  mode?: 'word' | 'char'
}

export default function TextReveal({
  text, className = '', delay = 0, staggerDelay = 0.03, mode = 'word'
}: TextRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  const units = mode === 'word' ? text.split(' ') : text.split('')

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {units.map((unit, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            initial={{ y: '110%', opacity: 0 }}
            animate={isInView ? { y: '0%', opacity: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: delay + i * staggerDelay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {unit}{mode === 'word' ? '\u00A0' : ''}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
