// ── xrScene — the immersive VR dive ────────────────────────────────────
// Loaded ONLY via dynamic import when the user enters VR or runs the
// terminal's `vr preview`, so three.js stays in its own lazy chunk.
//
// A 26 m virtual water column stands in for the site's 0–6,000 m dive:
// each creature hangs at -COLUMN * depthAtMeters(its real metres), so the
// headset and the scroll agree about who lives where, and the HUD meter
// readout runs through the same piecewise zone mapping as the page gauge.
// Billboards are yaw-only planes — full sprite billboarding pitches fish
// flat when the wearer looks down — sized from each photo's true aspect
// ratio, and swimmers mirror smoothly to face their travel direction.
// Descent: thumbstick Y, or hold trigger/pinch to sink and grip to rise
// (hand tracking exposes no gamepad). Sinking darkens the water, thickens
// the fog, snows marine detritus, and drowns the surface light.
import * as THREE from 'three'
import { metersAt, depthAtMeters, getZone } from '../constants/depthZones'

const COLUMN  = 26                  // metres of virtual water column
const FLOOR_Y = -COLUMN
const RIG_TOP = -3                  // start just below the surface
const EYE     = 1.6                 // headset height above rig origin (local-floor)
const MAX_VY  = 2.4                 // m/s — a diver, not an elevator

const SURFACE_COLOR = new THREE.Color(0x2e8a90)
const MID_COLOR     = new THREE.Color(0x0d2b40)
const ABYSS_COLOR   = new THREE.Color(0x02060c)

// m: real-world metres (drives the y placement). faces: which way the
// photo's head points (-1 left, +1 right). additive: dark-background
// photo (the 2D site screens it) — additive blending sinks the backdrop
// and makes the body glow. creatures/xr/ holds full-resolution copies of
// sprites that were downsized for the page; VR fills far more of the eye.
const CREATURES = [
  { src: '/creatures/xr/clownfish.webp',   w: 0.42, m: 20,   kind: 'swim',  faces: -1, speed: 0.5,  count: 3 },
  { src: '/creatures/GreenTurtle.webp',    w: 1.5,  m: 90,   kind: 'swim',  faces: -1, speed: 0.3  },
  { src: '/creatures/xr/Jellyfish.webp',   w: 0.9,  m: 350,  kind: 'jelly', faces: 1,  count: 2 },
  { src: '/creatures/xr/jumboSquid.webp',  w: 2.2,  m: 700,  kind: 'swim',  faces: -1, speed: 0.4  },
  { src: '/creatures/blue-whale.webp',     w: 11,   m: 1200, kind: 'swim',  faces: -1, speed: 0.6, ring: [8.5, 14], wander: 0.25 },
  { src: '/creatures/Anglerfish.webp',     w: 1.0,  m: 2000, kind: 'swim',  faces: -1, speed: 0.22 },
  { src: '/creatures/xr/deepSeaFish.webp', w: 1.7,  m: 3000, kind: 'swim',  faces: -1, speed: 0.35 },
  { src: '/creatures/deepJellyfish.webp',  w: 1.1,  m: 4600, kind: 'jelly', faces: -1, additive: true, count: 2 },
  { src: '/creatures/xr/Lizardfish.webp',  w: 1.1,  m: 5600, kind: 'swim',  faces: -1, speed: 0.3  },
]

const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a))
const clamp01 = (v) => Math.max(0, Math.min(1, v))

function loadTexture(src) {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(
      src,
      (tex) => { tex.colorSpace = THREE.SRGBColorSpace; resolve(tex) },
      undefined,
      () => resolve(null), // a missing photo skips that creature, not the dive
    )
  })
}

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  draw(c.getContext('2d'), w, h)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// Soft radial disc — sun glow and round snow particles
function radialTexture(size, inner, outer) {
  return canvasTexture(size, size, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2)
    g.addColorStop(0, inner)
    g.addColorStop(1, outer)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  })
}

// Vertical light shaft — soft on every edge or it reads as a plank
function shaftTexture() {
  return canvasTexture(128, 256, (ctx, w, h) => {
    const v = ctx.createLinearGradient(0, 0, 0, h)
    v.addColorStop(0, 'rgba(210, 240, 240, 0)')
    v.addColorStop(0.12, 'rgba(210, 240, 240, 0.75)')
    v.addColorStop(0.55, 'rgba(190, 230, 235, 0.28)')
    v.addColorStop(1, 'rgba(190, 230, 235, 0)')
    ctx.fillStyle = v
    ctx.fillRect(0, 0, w, h)
    // multiply by a smooth horizontal falloff (destination-in keeps
    // alpha = beam × falloff — no kinks, unlike punching the sides out)
    const sides = ctx.createLinearGradient(0, 0, w, 0)
    sides.addColorStop(0, 'rgba(0,0,0,0)')
    sides.addColorStop(0.18, 'rgba(0,0,0,0.35)')
    sides.addColorStop(0.5, 'rgba(0,0,0,1)')
    sides.addColorStop(0.82, 'rgba(0,0,0,0.35)')
    sides.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = sides
    ctx.fillRect(0, 0, w, h)
  })
}

// Speckled abyssal sand
function sandTexture() {
  const tex = canvasTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#39445c'
    ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 2600; i++) {
      const shade = 40 + Math.floor(Math.random() * 50)
      ctx.fillStyle = `rgb(${shade}, ${shade + 8}, ${shade + 24})`
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.5, 1.5)
    }
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(9, 9)
  return tex
}

// ── shared scene builder (immersive session + desktop preview) ─────────
async function buildDiveScene() {
  const scene = new THREE.Scene()
  scene.background = SURFACE_COLOR.clone()
  scene.fog = new THREE.FogExp2(SURFACE_COLOR.clone(), 0.07)

  const camera = new THREE.PerspectiveCamera(70, 1, 0.05, 80)
  const rig = new THREE.Group()
  rig.position.y = RIG_TOP
  rig.add(camera)
  scene.add(rig)

  const disposables = []
  const track = (...items) => { disposables.push(...items); return items[0] }

  // Sand floor + wreck
  const sand = track(sandTexture())
  const floor = new THREE.Mesh(
    track(new THREE.CircleGeometry(30, 48)),
    track(new THREE.MeshBasicMaterial({ map: sand, color: 0x9aa8c0 })),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = FLOOR_Y
  scene.add(floor)

  const wreckTex = await loadTexture('/creatures/shipwreck.webp')
  if (wreckTex) {
    const aspect = wreckTex.image.width / wreckTex.image.height
    const wreck = new THREE.Mesh(
      track(new THREE.PlaneGeometry(9, 9 / aspect)),
      track(new THREE.MeshBasicMaterial({ map: track(wreckTex), transparent: true, color: 0x6b8298, depthWrite: false })),
    )
    // close enough to loom through the bottom fog instead of vanishing
    wreck.position.set(-5.5, FLOOR_Y + 4.5 / aspect + 0.1, -6.5)
    wreck.lookAt(0, wreck.position.y, 0)
    scene.add(wreck)
  }

  // Sun glow overhead — the reason to look up before you sink
  const sun = new THREE.Mesh(
    track(new THREE.CircleGeometry(3.2, 40)),
    track(new THREE.MeshBasicMaterial({
      map: track(radialTexture(128, 'rgba(255,252,235,0.95)', 'rgba(255,252,235,0)')),
      transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false,
    })),
  )
  sun.rotation.x = Math.PI / 2 // face down at the diver
  sun.position.set(1, 5.5, -2)
  scene.add(sun)

  // Light shafts near the surface
  const shaftTex = track(shaftTexture())
  const shaftGeo = track(new THREE.PlaneGeometry(1, 1))
  const shafts = []
  for (let i = 0; i < 7; i++) {
    const mat = track(new THREE.MeshBasicMaterial({
      map: shaftTex, transparent: true, blending: THREE.AdditiveBlending,
      depthWrite: false, fog: false, opacity: 0,
    }))
    const mesh = new THREE.Mesh(shaftGeo, mat)
    const az = (i / 7) * Math.PI * 2 + Math.random() * 0.5
    const r = 3.5 + Math.random() * 3.5
    mesh.position.set(Math.cos(az) * r, -7, Math.sin(az) * r) // 16 m tall → top at y≈+1
    mesh.scale.set(0.9 + Math.random() * 0.8, 16, 1)
    mesh.userData = { tilt: (Math.random() - 0.5) * 0.24, phase: Math.random() * Math.PI * 2 }
    scene.add(mesh)
    shafts.push(mesh)
  }

  // Marine snow — a column of slow-sinking motes, denser-looking at depth
  const SNOW_N = 700
  const snowPos = new Float32Array(SNOW_N * 3)
  const snowSpeed = new Float32Array(SNOW_N)
  for (let i = 0; i < SNOW_N; i++) {
    const az = Math.random() * Math.PI * 2
    const r = Math.sqrt(Math.random()) * 9
    snowPos[i * 3] = Math.cos(az) * r
    snowPos[i * 3 + 1] = FLOOR_Y + Math.random() * (COLUMN + 4)
    snowPos[i * 3 + 2] = Math.sin(az) * r
    snowSpeed[i] = 0.12 + Math.random() * 0.22
  }
  const snowGeo = track(new THREE.BufferGeometry())
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3))
  const snow = new THREE.Points(snowGeo, track(new THREE.PointsMaterial({
    map: track(radialTexture(32, 'rgba(220,235,240,0.9)', 'rgba(220,235,240,0)')),
    size: 0.05, transparent: true, blending: THREE.AdditiveBlending,
    depthWrite: false, fog: false, opacity: 0,
  })))
  scene.add(snow)

  // Creature billboards — plane per creature, real photo aspect
  const quadGeo = track(new THREE.PlaneGeometry(1, 1))
  const actors = []
  const textures = await Promise.all(CREATURES.map((c) => loadTexture(c.src)))
  CREATURES.forEach((c, ci) => {
    const tex = textures[ci]
    if (!tex) return
    track(tex)
    const aspect = tex.image.width / tex.image.height
    const mat = track(new THREE.MeshBasicMaterial({
      map: tex, transparent: true, depthWrite: false,
      ...(c.additive ? { blending: THREE.AdditiveBlending, fog: false } : {}),
    }))
    const baseY = -COLUMN * depthAtMeters(c.m)
    const [rMin, rMax] = c.ring ?? [2.4, 6.5]
    for (let n = 0; n < (c.count ?? 1); n++) {
      const mesh = new THREE.Mesh(quadGeo, mat)
      const az = Math.random() * Math.PI * 2
      const r = rMin + Math.random() * (rMax - rMin)
      mesh.position.set(Math.cos(az) * r, baseY, Math.sin(az) * r)
      scene.add(mesh)
      actors.push({
        mesh, ...c, aspect, baseY, rMin, rMax,
        h: Math.random() * Math.PI * 2,      // heading
        turn: 0, turnGoal: 0, turnT: 0,
        flip: 1, seed: Math.random() * Math.PI * 2,
      })
    }
  })

  // HUD — depth readout pinned to the bottom of the view
  const hudCanvas = document.createElement('canvas')
  hudCanvas.width = 768; hudCanvas.height = 80
  const hudCtx = hudCanvas.getContext('2d')
  const hudTex = track(new THREE.CanvasTexture(hudCanvas))
  hudTex.colorSpace = THREE.SRGBColorSpace
  const hud = new THREE.Mesh(
    track(new THREE.PlaneGeometry(0.36, 0.0375)),
    track(new THREE.MeshBasicMaterial({
      map: hudTex, transparent: true, depthTest: false, depthWrite: false, fog: false,
    })),
  )
  hud.position.set(0, -0.26, -0.8)
  hud.renderOrder = 999
  camera.add(hud)
  let hudText = ''
  const drawHud = (meters, zoneLabel) => {
    const text = `${Math.round(meters / 10) * 10} m  ·  ${zoneLabel.toLowerCase()}`
    if (text === hudText) return
    hudText = text
    hudCtx.clearRect(0, 0, 768, 80)
    hudCtx.font = '40px Consolas, monospace'
    hudCtx.textAlign = 'center'
    hudCtx.textBaseline = 'middle'
    hudCtx.fillStyle = 'rgba(126, 231, 217, 0.85)'
    hudCtx.fillText(text, 384, 40)
    hudTex.needsUpdate = true
  }

  const camWorld = new THREE.Vector3()

  function update(dt, t) {
    camera.getWorldPosition(camWorld)

    // Depth-driven water: colour, fog, snow, surface light
    const sink = clamp01((RIG_TOP + EYE - camWorld.y) / (RIG_TOP + EYE - (FLOOR_Y + EYE)))
    if (sink < 0.45) {
      scene.background.copy(SURFACE_COLOR).lerp(MID_COLOR, sink / 0.45)
    } else {
      scene.background.copy(MID_COLOR).lerp(ABYSS_COLOR, (sink - 0.45) / 0.55)
    }
    scene.fog.color.copy(scene.background)
    scene.fog.density = 0.07 + 0.10 * sink
    sun.material.opacity = clamp01(1 - sink * 2.8) * 0.9
    snow.material.opacity = 0.2 + 0.5 * sink
    snow.rotation.y += 0.015 * dt

    for (let i = 0; i < SNOW_N; i++) {
      let y = snowPos[i * 3 + 1] - snowSpeed[i] * dt
      if (y < FLOOR_Y + 0.2) y += COLUMN + 4
      snowPos[i * 3 + 1] = y
    }
    snowGeo.attributes.position.needsUpdate = true

    const shaftGlow = clamp01(1 - sink * 3.2)
    for (const s of shafts) {
      s.material.opacity = shaftGlow * (0.12 + 0.06 * Math.sin(t * 0.35 + s.userData.phase))
      if (shaftGlow > 0) {
        s.rotation.y = Math.atan2(camWorld.x - s.position.x, camWorld.z - s.position.z)
        s.rotation.z = s.userData.tilt
      }
    }

    // Creatures
    for (const a of actors) {
      const p = a.mesh.position

      if (a.kind === 'swim') {
        a.turnT -= dt
        if (a.turnT <= 0) {
          a.turnGoal = (Math.random() - 0.5) * (a.wander ?? 0.8)
          a.turnT = 2 + Math.random() * 4
        }
        a.turn += (a.turnGoal - a.turn) * (1 - Math.exp(-1.5 * dt))
        a.h += a.turn * dt
        // stay in the annulus around the diver
        const rr = Math.hypot(p.x, p.z)
        if (rr > a.rMax) a.h += wrapAngle(Math.atan2(-p.z, -p.x) - a.h) * Math.min(1, 1.5 * dt)
        else if (rr < a.rMin) a.h += wrapAngle(Math.atan2(p.z, p.x) - a.h) * Math.min(1, 1.5 * dt)
        p.x += Math.cos(a.h) * a.speed * dt
        p.z += Math.sin(a.h) * a.speed * dt
        p.y = a.baseY + Math.sin(t * 0.4 + a.seed) * 0.25
      } else { // jelly — pulse and drift, bell leading nowhere in a hurry
        a.h += Math.sin(t * 0.11 + a.seed) * 0.1 * dt
        p.x += Math.cos(a.h) * 0.1 * dt
        p.z += Math.sin(a.h) * 0.1 * dt
        const rr = Math.hypot(p.x, p.z)
        if (rr > a.rMax) { p.x *= a.rMax / rr; p.z *= a.rMax / rr; a.h += Math.PI }
        p.y = a.baseY + Math.sin(t * 0.13 + a.seed) * 1.1
        a.mesh.rotation.z = 0.12 * Math.sin(t * 0.33 + a.seed)
      }

      // Yaw-only billboard + mirror toward travel direction
      const ry = Math.atan2(camWorld.x - p.x, camWorld.z - p.z)
      a.mesh.rotation.y = ry
      let flipTarget = a.flip < 0 ? -1 : 1
      if (a.kind === 'swim') {
        const sv = Math.cos(a.h) * Math.cos(ry) - Math.sin(a.h) * Math.sin(ry) // velocity · screen-right
        if (Math.abs(sv) > 0.15) flipTarget = (sv > 0 ? 1 : -1) * a.faces
      }
      a.flip += (flipTarget - a.flip) * Math.min(1, 5 * dt)
      const pulse = a.kind === 'jelly' ? 1 + 0.06 * Math.sin(t * 1.5 + a.seed) : 1
      a.mesh.scale.set(a.w * a.flip, (a.w / a.aspect) * pulse, 1)
    }

    // HUD
    const meters = metersAt(sink)
    drawHud(meters, getZone(sink).label)
  }

  function dispose() {
    disposables.forEach((d) => d.dispose?.())
  }

  return { scene, rig, camera, update, dispose }
}

// ── immersive session ──────────────────────────────────────────────────
let xrActive = false

export async function startXR() {
  if (xrActive || !navigator.xr) return false
  const ok = await navigator.xr.isSessionSupported('immersive-vr').catch(() => false)
  if (!ok) return false
  xrActive = true

  let session
  try {
    // Request FIRST — user-activation expires if we await texture loads
    session = await navigator.xr.requestSession('immersive-vr', {
      optionalFeatures: ['local-floor'],
    })
  } catch {
    xrActive = false
    return false
  }

  try {
    const { scene, rig, camera, update, dispose } = await buildDiveScene()

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.xr.enabled = true
    renderer.xr.setReferenceSpaceType('local-floor')
    renderer.domElement.style.display = 'none'
    document.body.appendChild(renderer.domElement)
    await renderer.xr.setSession(session)

    // Hold trigger/pinch to sink, grip to rise — hand tracking has no stick
    let holdDown = 0, holdUp = 0, vy = 0
    session.addEventListener('selectstart', () => { holdDown++ })
    session.addEventListener('selectend', () => { holdDown = Math.max(0, holdDown - 1) })
    session.addEventListener('squeezestart', () => { holdUp++ })
    session.addEventListener('squeezeend', () => { holdUp = Math.max(0, holdUp - 1) })

    let prev = 0
    renderer.setAnimationLoop((time) => {
      const dt = prev ? Math.min((time - prev) / 1000, 0.05) : 1 / 72
      prev = time

      let target = 0
      for (const source of session.inputSources) {
        const axes = source.gamepad?.axes
        if (axes && axes.length >= 4 && Math.abs(axes[3]) > 0.15) {
          target += axes[3] * MAX_VY // stick forward (-1) dives, back surfaces
        }
      }
      if (holdDown) target -= 1.5
      if (holdUp) target += 1.5
      target = Math.max(-MAX_VY, Math.min(MAX_VY, target))
      vy += (target - vy) * (1 - Math.exp(-4 * dt))
      rig.position.y = Math.max(FLOOR_Y, Math.min(RIG_TOP, rig.position.y + vy * dt))

      update(dt, time / 1000)
      renderer.render(scene, camera)
    })

    session.addEventListener('end', () => {
      renderer.setAnimationLoop(null)
      dispose()
      renderer.dispose()
      renderer.domElement.remove()
      xrActive = false
    })
    return true
  } catch {
    session.end().catch(() => {})
    xrActive = false
    return false
  }
}

// ── desktop preview (terminal: `vr preview`) ───────────────────────────
// The exact scene without a headset: drag to look, scroll / W·S to dive,
// Esc to surface. Exposes window.__xrPreview for headless screenshots.
let previewOpen = false

export async function startPreview() {
  if (previewOpen) return false
  previewOpen = true

  const { scene, rig, camera, update, dispose } = await buildDiveScene()
  camera.position.set(0, EYE, 0)
  camera.rotation.order = 'YXZ'

  const root = document.createElement('div')
  root.id = 'xr-preview-root'
  root.setAttribute('data-no-ping', '')
  root.style.cssText = 'position:fixed;inset:0;z-index:95;background:#000;cursor:grab;'
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  root.appendChild(renderer.domElement)

  const hint = document.createElement('div')
  hint.textContent = 'vr scene preview — drag to look · scroll / W·S to dive · esc to surface'
  hint.style.cssText =
    'position:absolute;bottom:14px;left:50%;transform:translateX(-50%);' +
    'font:12px Consolas,monospace;color:rgba(126,231,217,0.75);' +
    'background:rgba(4,12,20,0.55);padding:6px 12px;border-radius:6px;pointer-events:none;'
  root.appendChild(hint)
  document.body.appendChild(root)

  let dragging = false, yaw = 0, pitch = 0, diveKey = 0
  const onDown = (e) => { dragging = true; root.style.cursor = 'grabbing'; e.preventDefault() }
  const onUp = () => { dragging = false; root.style.cursor = 'grab' }
  const onMove = (e) => {
    if (!dragging) return
    yaw -= e.movementX * 0.004
    pitch = Math.max(-1.4, Math.min(1.4, pitch - e.movementY * 0.004))
  }
  const onWheel = (e) => {
    e.preventDefault()
    rig.position.y = Math.max(FLOOR_Y, Math.min(RIG_TOP, rig.position.y - e.deltaY * 0.01))
  }
  const onKey = (e) => {
    if (e.key === 'Escape') { close(); return }
    if (e.key === 's' || e.key === 'ArrowDown') diveKey = e.type === 'keydown' ? -1 : 0
    if (e.key === 'w' || e.key === 'ArrowUp') diveKey = e.type === 'keydown' ? 1 : 0
  }
  const onResize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
  }
  root.addEventListener('pointerdown', onDown)
  window.addEventListener('pointerup', onUp)
  window.addEventListener('pointermove', onMove)
  root.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', onKey)
  window.addEventListener('resize', onResize)

  let prev = 0
  renderer.setAnimationLoop((time) => {
    const dt = prev ? Math.min((time - prev) / 1000, 0.05) : 1 / 60
    prev = time
    if (diveKey) rig.position.y = Math.max(FLOOR_Y, Math.min(RIG_TOP, rig.position.y + diveKey * MAX_VY * dt))
    camera.rotation.set(pitch, yaw, 0)
    update(dt, time / 1000)
    renderer.render(scene, camera)
  })

  function close() {
    renderer.setAnimationLoop(null)
    root.removeEventListener('pointerdown', onDown)
    window.removeEventListener('pointerup', onUp)
    window.removeEventListener('pointermove', onMove)
    root.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keyup', onKey)
    window.removeEventListener('resize', onResize)
    dispose()
    renderer.dispose()
    root.remove()
    delete window.__xrPreview
    previewOpen = false
  }

  // Headless-test hooks (see CLAUDE.md verification workflow)
  window.__xrPreview = {
    close,
    setSink: (f) => { rig.position.y = RIG_TOP + clamp01(f) * (FLOOR_Y - RIG_TOP) },
    setView: (y, p) => { yaw = y; pitch = p },
  }
  return true
}
