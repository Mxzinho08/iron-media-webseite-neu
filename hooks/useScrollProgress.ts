'use client'
import { useScroll, useTransform, MotionValue } from 'framer-motion'
import { useRef, RefObject } from 'react'

interface UseScrollProgressReturn {
  ref: RefObject<HTMLDivElement | null>
  progress: MotionValue<number>
  opacity: MotionValue<number>
}

export function useScrollProgress(offset?: ['start end' | 'end start' | 'start start' | 'end end', 'start end' | 'end start' | 'start start' | 'end end']): UseScrollProgressReturn {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset || ['start end', 'end start'],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])

  return { ref, progress: scrollYProgress, opacity }
}
