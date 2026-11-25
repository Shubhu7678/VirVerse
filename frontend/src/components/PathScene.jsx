import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const cssColor = (name, fallback) => {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return new THREE.Color(v ? v.slice(0, 7) : fallback)
}

const LABELS = ['C', 'JS', 'Py', 'HTML']

function labelTexture(text, color, fg) {
  const c = document.createElement('canvas')
  c.width = 256; c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = 'rgba(0,0,0,0.55)'
  g.strokeStyle = `#${color.getHexString()}`
  g.lineWidth = 4
  g.beginPath(); g.roundRect(8, 24, 240, 80, 40); g.fill(); g.stroke()
  g.fillStyle = `#${fg.getHexString()}`
  g.font = '600 44px ui-monospace, SFMono-Regular, Menlo, monospace'
  g.textAlign = 'center'; g.textBaseline = 'middle'
  g.fillText(text, 128, 66)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

/**
 * A learning-path ribbon: a glowing curve winds through space and draws itself, passing
 * four milestone nodes (C, JS, Py, HTML) while a comet runs along it. Reacts to pointer and scroll.
 */
export default function PathScene({ className = '', scale = 1, offsetX = 0 }) {
  const host = useRef(null)

  useEffect(() => {
    const el = host.current
    if (!el) return undefined
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const small = window.innerWidth < 720

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75))
    el.appendChild(renderer.domElement)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 14)

    let accent = cssColor('--accent', '#3ecf8e')
    let fg = cssColor('--fg', '#f5f5f7')

    const group = new THREE.Group()
    group.scale.setScalar(scale)
    group.position.x = small ? 0 : offsetX
    scene.add(group)

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-8, -2.6, -2), new THREE.Vector3(-5, 0.4, 1), new THREE.Vector3(-2.4, -1.8, -1),
      new THREE.Vector3(0.6, 1.6, 1.2), new THREE.Vector3(3, -0.6, -1), new THREE.Vector3(5.2, 2.2, 0.6),
      new THREE.Vector3(8, 0.4, -1.5),
    ], false, 'catmullrom', 0.5)

    const tubeGeo = new THREE.TubeGeometry(curve, 320, 0.028, 8, false)
    const tubeMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.75 })
    const tube = new THREE.Mesh(tubeGeo, tubeMat)
    group.add(tube)
    const glowGeo = new THREE.TubeGeometry(curve, 160, 0.12, 6, false)
    const glowMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.08 })
    const glow = new THREE.Mesh(glowGeo, glowMat)
    group.add(glow)
    const tubeIndexCount = tubeGeo.index.count
    const glowIndexCount = glowGeo.index.count

    // Milestone nodes with labels
    const stops = [0.2, 0.42, 0.64, 0.86]
    const nodes = stops.map((t, i) => {
      const p = curve.getPoint(t)
      const g = new THREE.Group()
      g.position.copy(p)
      const wire = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), new THREE.MeshBasicMaterial({ color: accent, wireframe: true }))
      const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: accent }))
      const tex = labelTexture(LABELS[i], accent, fg)
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }))
      sprite.scale.set(1.5, 0.75, 1)
      sprite.position.set(0, 0.85, 0)
      g.add(wire, core, sprite)
      g.scale.setScalar(0)
      group.add(g)
      return { g, wire, core, sprite, t }
    })

    // Comet
    const trail = Array.from({ length: 18 }, (_, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.09 * (1 - i / 22), 10, 10), new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 1 - i / 18 }))
      group.add(m)
      return m
    })

    const recolor = () => {
      accent = cssColor('--accent', '#3ecf8e'); fg = cssColor('--fg', '#f5f5f7')
      tubeMat.color.copy(accent); glowMat.color.copy(accent)
      nodes.forEach(({ wire, core, sprite }, i) => {
        wire.material.color.copy(accent); core.material.color.copy(accent)
        sprite.material.map.dispose(); sprite.material.map = labelTexture(LABELS[i], accent, fg); sprite.material.needsUpdate = true
      })
      trail.forEach((m) => m.material.color.copy(accent))
    }
    const themeObserver = new MutationObserver(recolor)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      renderer.setSize(w, h, false)
      camera.aspect = w / Math.max(h, 1)
      camera.fov = w / h < 1 ? 62 : 45
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const target = { x: 0, y: 0 }
    const onMove = (e) => { target.x = (e.clientX / window.innerWidth - 0.5) * 2; target.y = (e.clientY / window.innerHeight - 0.5) * 2 }
    window.addEventListener('pointermove', onMove, { passive: true })

    let visible = true
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting })
    io.observe(el)

    const easeOut = (x) => 1 - (1 - x) ** 3
    const clock = new THREE.Clock()
    let raf = 0
    const render = () => {
      const t = clock.getElapsedTime()
      const draw = reduced ? 1 : easeOut(Math.min(t / 2.6, 1))
      tubeGeo.setDrawRange(0, Math.floor((tubeIndexCount * draw) / 3) * 3)
      glowGeo.setDrawRange(0, Math.floor((glowIndexCount * draw) / 3) * 3)
      nodes.forEach((n, i) => {
        const appear = reduced ? 1 : easeOut(Math.min(Math.max((draw - n.t + 0.04) / 0.1, 0), 1))
        n.g.scale.setScalar(appear * (1 + Math.sin(t * 2 + i) * 0.06))
        n.wire.rotation.y = t * 0.8 + i
        n.wire.rotation.x = t * 0.5
        n.g.position.y = curve.getPoint(n.t).y + Math.sin(t * 1.2 + i * 1.7) * 0.08
      })
      const head = (t * 0.07) % 1
      trail.forEach((m, i) => {
        const u = Math.max(0, Math.min(head * draw - i * 0.006, 1))
        m.position.copy(curve.getPoint(u))
        m.visible = u > 0.002
      })
      const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1.5)
      group.rotation.y += (target.x * 0.25 - 0.1 + scroll * 0.4 - group.rotation.y) * 0.05
      group.rotation.x += (-target.y * 0.15 - group.rotation.x) * 0.05
      group.position.y = scroll * 1.2
      renderer.render(scene, camera)
    }
    const loop = () => { raf = requestAnimationFrame(loop); if (visible && !document.hidden) render() }
    if (reduced) render(); else loop()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect(); io.disconnect(); themeObserver.disconnect()
      scene.traverse((o) => { o.geometry?.dispose(); o.material?.map?.dispose(); o.material?.dispose?.() })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [scale, offsetX])

  return <div ref={host} className={className} aria-hidden="true" />
}
