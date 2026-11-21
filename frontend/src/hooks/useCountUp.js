import { useEffect, useState } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** Counts from 0 to `target` with an ease-out curve. Returns the target immediately when motion is reduced. */
export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(() => (reduced() ? target : 0))
  useEffect(() => {
    if (reduced() || !Number.isFinite(target)) return undefined
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return Number.isFinite(target) ? value : target
}
