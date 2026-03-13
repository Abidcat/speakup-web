'use client'

import { useEffect, useRef } from 'react'

export default function CursorGlow() {
  const dotRef  = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let mx = -100, my = -100
    let rx = -100, ry = -100
    let raf: number

    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY }

    const tick = () => {
      rx += (mx - rx) * 0.1
      ry += (my - ry) * 0.1
      if (dotRef.current)  dotRef.current.style.transform  = `translate(${mx}px,${my}px)`
      if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px,${ry}px)`
      raf = requestAnimationFrame(tick)
    }

    document.addEventListener('mousemove', onMove)
    raf = requestAnimationFrame(tick)
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  return (
    <>
      {/* Recording dot */}
      <div ref={dotRef} style={{
        position: 'fixed', top: -4, left: -4, pointerEvents: 'none', zIndex: 9999,
        width: 8, height: 8, borderRadius: '50%',
        background: '#22c55e',
        animation: 'cursor-pulse 1.8s ease-in-out infinite',
        willChange: 'transform',
      }} />
      {/* Trailing ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: -12, left: -12, pointerEvents: 'none', zIndex: 9998,
        width: 24, height: 24, borderRadius: '50%',
        border: '1px solid rgba(34,197,94,0.3)',
        willChange: 'transform',
        transition: 'opacity .2s',
      }} />
    </>
  )
}
