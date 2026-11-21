import { useMemo } from 'react'

const COLORS = ['var(--accent)', 'var(--success)', 'var(--warn)', 'var(--accent-text)', 'var(--fg)']

/** CSS-only celebration: an expanding ring plus confetti. Mount it to play it once. */
export default function Confetti({ count = 26 }) {
  const pieces = useMemo(() => Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.3
    const dist = 90 + ((i * 37) % 90)
    return {
      '--dx': `${Math.cos(angle) * dist}px`,
      '--dy': `${Math.sin(angle) * dist - 30}px`,
      '--rot': `${(i * 83) % 540}deg`,
      background: COLORS[i % COLORS.length],
      animationDelay: `${(i % 6) * 20}ms`,
    }
  }), [count])

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center" aria-hidden="true">
      <span className="absolute size-24 rounded-full border-2 border-accent" style={{ animation: 'vv-ring .9s var(--ease-out) both' }} />
      {pieces.map((style, i) => (
        <i key={i} className="absolute block h-2 w-1.5 rounded-[1px]" style={{ ...style, animation: 'vv-confetti 1.1s var(--ease-out) both', animationDelay: style.animationDelay }} />
      ))}
    </div>
  )
}
