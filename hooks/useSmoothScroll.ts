'use client'
import { useCallback } from 'react'

export function useSmoothScroll() {
  const scrollTo = useCallback((targetId: string) => {
    const element = document.getElementById(targetId.replace('#', ''))
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }, [])

  return { scrollTo }
}
