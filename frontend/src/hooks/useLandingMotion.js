import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)
// Keep intro timing wall-clock accurate even when a frame is slow (e.g. WebGL shader compile).
gsap.ticker.lagSmoothing(0)

/** Wraps each word of an element in a masked span so words can slide up individually. */
function splitWords(el) {
  if (!el || el.dataset.split) return []
  el.dataset.split = '1'
  const walk = (node) => {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment()
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return }
          const mask = document.createElement('span')
          mask.className = 'lp-word'
          const inner = document.createElement('span')
          inner.className = 'lp-word-in'
          inner.textContent = part
          mask.appendChild(inner)
          frag.appendChild(mask)
        })
        child.replaceWith(frag)
      } else if (child.nodeType === 1) walk(child)
    })
  }
  walk(el)
  return [...el.querySelectorAll('.lp-word-in')]
}

/** GSAP + ScrollTrigger choreography for the landing page. Skipped entirely under reduced motion. */
export default function useLandingMotion(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    root.classList.add('gsap-on')

    const ctx = gsap.context(() => {
      // ---- Hero intro timeline
      const words = splitWords(root.querySelector('.lp-hero h1'))
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.lp-hero .lp-eyebrow-pill', { y: 16, opacity: 0, duration: 0.6 })
        .from(words, { yPercent: 115, rotate: 4, opacity: 0, duration: 0.9, stagger: 0.07 }, '-=0.3')
        .from('.lp-hero .lp-lede', { y: 20, opacity: 0, duration: 0.7 }, '-=0.5')
        .from('.lp-hero .lp-cta-row > *', { y: 18, opacity: 0, scale: 0.94, duration: 0.6, stagger: 0.1 }, '-=0.45')
        .from('.lp-hero .lp-checks li', { y: 12, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.4')
        .from('.lp-hero-visual', { x: 80, y: 30, opacity: 0, rotateY: -14, transformPerspective: 1200, duration: 1.3, ease: 'expo.out' }, 0.25)
        .from('.lp-stats > div', { y: 30, opacity: 0, duration: 0.7, stagger: 0.1 }, '-=0.6')

      // ---- Hero scroll parallax
      gsap.to('.lp-hero-visual', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.lp-hero', start: 'top top', end: 'bottom top', scrub: 0.6 } })
      gsap.to('.lp-hero-copy', { yPercent: 10, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.lp-hero', start: '40% top', end: 'bottom top', scrub: true } })
      gsap.to('.lp-scene', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '.lp-hero', start: '55% top', end: 'bottom top', scrub: true } })

      // ---- Section headings: word mask reveal
      gsap.utils.toArray('.lp-heading h2, .lp-split h2, .lp-final h2').forEach((h) => {
        const w = splitWords(h)
        gsap.from(w, { yPercent: 110, opacity: 0, duration: 0.8, stagger: 0.04, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%', once: true } })
      })

      // ---- Batched card/step reveals with stagger
      ScrollTrigger.batch('[data-reveal]:not(.lp-heading):not(.lp-final)', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.fromTo(els, { y: 50, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', overwrite: true }),
      })
      gsap.utils.toArray('.lp-heading:not(h2), .lp-final').forEach((el) => {
        gsap.fromTo(el, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })

      // ---- Marquee skews with scroll velocity
      const track = root.querySelector('.lp-marquee-track')
      if (track) {
        const skew = gsap.quickTo(track, 'skewX', { duration: 0.4, ease: 'power3' })
        ScrollTrigger.create({ onUpdate: (self) => { skew(gsap.utils.clamp(-14, 14, self.getVelocity() / -120)) } })
      }

      // ---- Steps: connector line scrubbed across the row
      gsap.fromTo('.lp-steps', { '--progress': 0 }, { '--progress': 1, ease: 'none', scrollTrigger: { trigger: '.lp-steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.5 } })

      // ---- Teams panel tilts in 3D as it passes
      gsap.fromTo('.lp-panel', { rotateY: 14, rotateX: 6, transformPerspective: 1000 }, { rotateY: 0, rotateX: 0, ease: 'none', scrollTrigger: { trigger: '.lp-panel', start: 'top 90%', end: 'center 55%', scrub: 0.6 } })
    }, root)

    // ---- Magnetic primary buttons + card spotlight
    const cleanups = []
    root.querySelectorAll('.lp-btn-primary').forEach((btn) => {
      const x = gsap.quickTo(btn, 'x', { duration: 0.4, ease: 'power3' })
      const y = gsap.quickTo(btn, 'y', { duration: 0.4, ease: 'power3' })
      const move = (e) => {
        const r = btn.getBoundingClientRect()
        x((e.clientX - (r.left + r.width / 2)) * 0.25)
        y((e.clientY - (r.top + r.height / 2)) * 0.35)
      }
      const leave = () => { x(0); y(0) }
      btn.addEventListener('pointermove', move)
      btn.addEventListener('pointerleave', leave)
      cleanups.push(() => { btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerleave', leave) })
    })
    root.querySelectorAll('.lp-card').forEach((card) => {
      const move = (e) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--mx', `${e.clientX - r.left}px`)
        card.style.setProperty('--my', `${e.clientY - r.top}px`)
      }
      card.addEventListener('pointermove', move)
      cleanups.push(() => card.removeEventListener('pointermove', move))
    })

    const refresh = setTimeout(() => ScrollTrigger.refresh(), 400)
    return () => {
      clearTimeout(refresh)
      cleanups.forEach((fn) => fn())
      ctx.revert()
      root.classList.remove('gsap-on')
    }
  }, [rootRef])
}
