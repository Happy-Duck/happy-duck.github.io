// ── xrScene — the immersive VR dive ────────────────────────────────────
// Loaded ONLY via dynamic import when the user actually enters VR, so
// three.js lives in its own lazy chunk. A minimal but honest scene: foggy
// water column, the site's real creature photos as drifting billboards,
// sand floor with the wreck, and thumbstick descent that darkens the
// water as you sink.
import * as THREE from 'three'

const CREATURES = [
  { src: '/creatures/clownfish.webp',     w: 0.5,  y: -0.5, r: 3.0 },
  { src: '/creatures/GreenTurtle.png',    w: 1.6,  y: -1.5, r: 4.5 },
  { src: '/creatures/Jellyfish.png',      w: 1.0,  y: -4.0, r: 3.5 },
  { src: '/creatures/squid.jpg',          w: 0.8,  y: -5.5, r: 4.0 },
  { src: '/creatures/deepJellyfish.png',  w: 1.2,  y: -12,  r: 3.2 },
  { src: '/creatures/Anglerfish.webp',    w: 1.4,  y: -14,  r: 4.2 },
  { src: '/creatures/deepSeaFish.webp',   w: 1.1,  y: -16,  r: 3.6 },
  { src: '/creatures/jumboSquid.webp',    w: 2.6,  y: -20,  r: 5.0 },
  { src: '/creatures/Lizardfish.webp',    w: 1.3,  y: -23,  r: 3.4 },
  { src: '/creatures/blue-whale.png',     w: 9.0,  y: -9,   r: 14  },
]

const SURFACE_COLOR = new THREE.Color(0x2e8a90)
const ABYSS_COLOR = new THREE.Color(0x010508)
const FLOOR_Y = -26

export async function startXR() {
  if (!navigator.xr) return false
  const ok = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)
  if (!ok) return false

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.xr.enabled = true
  renderer.domElement.style.display = 'none'
  document.body.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = SURFACE_COLOR.clone()
  scene.fog = new THREE.FogExp2(SURFACE_COLOR.clone(), 0.10)

  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 120)
  const rig = new THREE.Group()
  rig.add(camera)
  scene.add(rig)

  // Sand floor + wreck backdrop
  const loader = new THREE.TextureLoader()
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(30, 40),
    new THREE.MeshBasicMaterial({ color: 0x1a2438 }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  scene.add(floor)

  const disposables = [floor.geometry, floor.material]

  const wreckTex = loader.load('/creatures/shipwreck.png')
  const wreck = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshBasicMaterial({ map: wreckTex, transparent: true, color: 0x4a5e70 }),
  )
  wreck.position.set(-7, FLOOR_Y + 2.6, -9)
  scene.add(wreck)
  disposables.push(wreck.geometry, wreck.material, wreckTex)

  // Creature billboards
  const sprites = []
  for (const c of CREATURES) {
    const tex = loader.load(c.src)
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true })
    const sp = new THREE.Sprite(mat)
    sp.scale.set(c.w, c.w * 0.6, 1)
    const angle = Math.random() * Math.PI * 2
    sp.userData = { angle, r: c.r, y: c.y, speed: 0.05 + Math.random() * 0.1, bob: Math.random() * 6 }
    sp.position.set(Math.cos(angle) * c.r, c.y, Math.sin(angle) * c.r)
    scene.add(sp)
    sprites.push(sp)
    disposables.push(mat, tex)
  }

  const session = await navigator.xr.requestSession('immersive-vr', {
    optionalFeatures: ['local-floor'],
  })
  renderer.xr.setReferenceSpaceType('local-floor')
  await renderer.xr.setSession(session)

  const clock = new THREE.Clock()
  renderer.setAnimationLoop(() => {
    const t = clock.getElapsedTime()
    const dt = Math.min(clock.getDelta(), 0.05)

    // Thumbstick descent (either controller, Y axis)
    for (const source of session.inputSources) {
      const axes = source.gamepad?.axes
      if (axes && axes.length >= 4 && Math.abs(axes[3]) > 0.15) {
        rig.position.y -= axes[3] * dt * 40 * -1 // push forward/down to descend
      }
    }
    rig.position.y = Math.max(FLOOR_Y + 1.2, Math.min(0, rig.position.y))

    // Water darkens as you sink
    const sink = Math.min(1, -rig.position.y / -FLOOR_Y)
    scene.background.copy(SURFACE_COLOR).lerp(ABYSS_COLOR, sink)
    scene.fog.color.copy(scene.background)

    // Creatures orbit and bob
    for (const sp of sprites) {
      const u = sp.userData
      u.angle += u.speed * dt
      sp.position.set(
        Math.cos(u.angle) * u.r,
        u.y + Math.sin(t * 0.5 + u.bob) * 0.3,
        Math.sin(u.angle) * u.r,
      )
    }

    renderer.render(scene, camera)
  })

  session.addEventListener('end', () => {
    renderer.setAnimationLoop(null)
    disposables.forEach(d => d.dispose?.())
    renderer.dispose()
    renderer.domElement.remove()
  })

  return true
}
