'use client'
import { useInView as useFramerInView } from 'framer-motion'
import { useRef, RefObject } from 'react'

interface UseInViewOptions {
  once?: boolean
  margin?: string
  threshold?: number
}

interface UseInViewReturn {
  ref: RefObject<HTMLDivElement | null>
  isInView: boolean
}

export function useInViewCustom(options: UseInViewOptions = {}): UseInViewReturn {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useFramerInView(ref, {
    once: options.once ?? true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    margin: (options.margin ?? '-100px') as any,
  })

  return { ref, isInView }
}
