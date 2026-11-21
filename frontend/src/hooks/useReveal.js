import { useEffect, useRef } from 'react'

/** Adds `is-in` to every `[data-reveal]` descendant once it scrolls into view. */
export default function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const node = ref.current
    if (!node) return undefined
    const items = node.querySelectorAll('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-in'))
      return undefined
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12 })
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return ref
}
