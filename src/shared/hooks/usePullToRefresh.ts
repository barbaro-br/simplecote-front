import { useEffect, useRef, useState } from 'react'

export function usePullToRefresh(onRefresh: () => Promise<any> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullY, setPullY] = useState(0)
  const startY = useRef(0)
  const isPulling = useRef(false)
  const MAX_PULL = 100

  useEffect(() => {
    function handleTouchStart(e: TouchEvent) {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY
        isPulling.current = true
      }
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isPulling.current) return
      
      const y = e.touches[0].clientY
      const delta = y - startY.current

      if (delta > 0 && window.scrollY === 0) {
        e.preventDefault() // prevent default scroll behavior
        setPullY(Math.min(delta * 0.4, MAX_PULL)) // Add friction
      } else {
        isPulling.current = false
        setPullY(0)
      }
    }

    async function handleTouchEnd() {
      if (!isPulling.current) return
      isPulling.current = false

      if (pullY > MAX_PULL * 0.8 && !isRefreshing) {
        setIsRefreshing(true)
        setPullY(MAX_PULL * 0.5) // keep it open a bit
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
          setPullY(0)
        }
      } else {
        setPullY(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: false })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullY, isRefreshing, onRefresh])

  return { isRefreshing, pullY }
}
