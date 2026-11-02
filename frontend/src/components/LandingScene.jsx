import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function LandingScene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return undefined

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20)
    camera.position.z = 4.2

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.setAttribute('aria-hidden', 'true')
    container.appendChild(renderer.domElement)

    const core = new THREE.Group()
    scene.add(core)

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x54d6b3,
      transparent: true,
      opacity: 0.72,
      wireframe: true,
    })
    const coreMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.82, 1), wireMaterial)
    core.add(coreMesh)

    const innerMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.43, 0),
      new THREE.MeshBasicMaterial({ color: 0x83e8d0, transparent: true, opacity: 0.5, wireframe: true }),
    )
    core.add(innerMesh)

    const orbitMaterial = new THREE.MeshBasicMaterial({
      color: 0x40b8b2,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    })
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.08, 0.012, 4, 96), orbitMaterial)
    orbit.rotation.set(0.85, 0.2, -0.3)
    core.add(orbit)

    const secondOrbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.18, 0.008, 4, 96),
      new THREE.MeshBasicMaterial({ color: 0x438e9b, transparent: true, opacity: 0.38, wireframe: true }),
    )
    secondOrbit.rotation.set(1.1, -0.7, 0.25)
    core.add(secondOrbit)

    const nodeGeometry = new THREE.SphereGeometry(0.035, 8, 8)
    const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x9ce8d1 })
    for (let index = 0; index < 8; index += 1) {
      const angle = (index / 8) * Math.PI * 2
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial)
      node.position.set(Math.cos(angle) * 1.12, Math.sin(angle) * 0.78, (index % 2 ? 0.35 : -0.35))
      core.add(node)
    }

    const particlePositions = []
    const particleCount = 34
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    for (let index = 0; index < particleCount; index += 1) {
      const y = 1 - (index / (particleCount - 1)) * 2
      const radius = Math.sqrt(1 - y * y)
      const angle = goldenAngle * index
      particlePositions.push(
        Math.cos(angle) * radius * 1.38,
        y * 1.38,
        Math.sin(angle) * radius * 1.38,
      )
    }

    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3))
    const particleField = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0x8be4d0,
        size: 0.035,
        transparent: true,
        opacity: 0.74,
        sizeAttenuation: true,
      }),
    )
    core.add(particleField)

    const linkPositions = []
    for (let index = 0; index < particleCount; index += 1) {
      const next = (index + 5) % particleCount
      linkPositions.push(
        particlePositions[index * 3],
        particlePositions[index * 3 + 1],
        particlePositions[index * 3 + 2],
        particlePositions[next * 3],
        particlePositions[next * 3 + 1],
        particlePositions[next * 3 + 2],
      )
    }
    const linkGeometry = new THREE.BufferGeometry()
    linkGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linkPositions, 3))
    core.add(new THREE.LineSegments(
      linkGeometry,
      new THREE.LineBasicMaterial({ color: 0x54d6b3, transparent: true, opacity: 0.2 }),
    ))

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const renderFrame = (time = 0) => {
      if (!prefersReducedMotion) {
        core.rotation.y = time * 0.00018
        core.rotation.x = Math.sin(time * 0.00022) * 0.12
      }
      renderer.render(scene, camera)
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      renderFrame()
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    resize()

    const updateAnimation = () => {
      renderer.setAnimationLoop(
        !prefersReducedMotion && document.visibilityState === 'visible' ? renderFrame : null,
      )
      if (prefersReducedMotion) renderFrame()
    }
    document.addEventListener('visibilitychange', updateAnimation)
    updateAnimation()

    return () => {
      document.removeEventListener('visibilitychange', updateAnimation)
      resizeObserver.disconnect()
      renderer.setAnimationLoop(null)
      scene.traverse((object) => {
        object.geometry?.dispose()
        if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
        else object.material?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={containerRef} />
}
