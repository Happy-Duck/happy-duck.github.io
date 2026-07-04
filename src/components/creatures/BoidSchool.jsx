// ── BoidSchool — WebGPU compute-shader fish school ─────────────────────
// ~380 baitfish flocking via classic boids (separation/alignment/cohesion)
// computed on the GPU each frame, rendered as instanced quads carrying a
// real anchovy photo cutout (Engraulis encrasicolus, Ebachiller /
// Wikimedia Commons, CC BY-SA 4.0), oriented along velocity. The cursor
// repels the school; sonar pings scatter it. Positions live only on the
// GPU, so the dive-log entry ('anchovy' — gated in species.js to match
// this component's render conditions) is earned via a tiny readback:
// every 4th frame the fresh positions are copied to a staging buffer and
// the nearest fish is scanned against the cursor / latest ping. Purely
// additive: no navigator.gpu (or reduced motion, or a failed sprite
// fetch) → the canvas stays transparent and the sprite creatures remain
// the whole experience.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { useMouse } from '../../context/MouseContext'
import { creatureOpacity } from '../../constants/depthZones'
import { inspectSeen } from '../../lib/diveLog'
import { getPing } from '../../lib/sonar'

const COUNT = 384
// ≈40–400 m: anchovies are epipelagic — surface schools that don't dive
// much past ~400 m (0.275 = depthAtMeters(400)), so the school is gone
// well before the twilight deep
const DEPTH_RANGE = { enter: 0.04, exit: 0.275 }

const WGSL = /* wgsl */ `
struct Boid { pos: vec2f, vel: vec2f }
struct Params {
  res:     vec2f,
  mouse:   vec2f,
  ping:    vec2f,
  pingStr: f32,
  count:   u32,
  time:    f32,
  step:    f32, // elapsed frame time in 60fps units — sim constants are
                // tuned per-60fps-step, so integration scales by this
}

@group(0) @binding(0) var<storage, read> boidsIn: array<Boid>;
@group(0) @binding(1) var<storage, read_write> boidsOut: array<Boid>;
@group(0) @binding(2) var<uniform> P: Params;

@compute @workgroup_size(64)
fn cs(@builtin(global_invocation_id) gid: vec3u) {
  let i = gid.x;
  if (i >= P.count) { return; }
  var pos = boidsIn[i].pos;
  var vel = boidsIn[i].vel;

  var sep = vec2f(0.0);
  var ali = vec2f(0.0);
  var coh = vec2f(0.0);
  var n = 0.0;
  for (var j = 0u; j < P.count; j++) {
    if (j == i) { continue; }
    let d = boidsIn[j].pos - pos;
    let dist = length(d);
    if (dist < 16.0 && dist > 0.001) { sep -= d / dist * (16.0 - dist) / 16.0; }
    if (dist < 52.0) { ali += boidsIn[j].vel; coh += d; n += 1.0; }
  }
  if (n > 0.0) { ali /= n; coh /= n; }

  // Isotropic cohesion relaxes schools into discs. Real baitfish shoals
  // are polarized streams, so cohesion pulls at full strength ALONG the
  // travel axis (follow / catch up) and only weakly sideways — clumps
  // stretch into ribbons instead of balls — and alignment is stronger
  // so groups polarize rather than mill.
  let head = normalize(vel + vec2f(0.0001, 0.0));
  let cohAlong = dot(coh, head);
  let cohSide = coh - head * cohAlong;
  var acc = sep * 0.55 + (ali - vel) * 0.09 + head * cohAlong * 0.011 + cohSide * 0.003;

  // Per-fish wander breaks the symmetry that rounds school edges off
  let wob = sin(P.time * 0.9 + f32(i) * 0.61) + sin(P.time * 1.7 + f32(i) * 2.3);
  acc += vec2f(-head.y, head.x) * wob * 0.012;

  // Cursor repel
  let md = pos - P.mouse;
  let mdist = length(md);
  if (mdist < 150.0 && mdist > 0.001) { acc += md / mdist * (150.0 - mdist) * 0.016; }

  // Sonar scatter
  if (P.pingStr > 0.0) {
    let pd = pos - P.ping;
    let pdist = length(pd);
    if (pdist < 340.0 && pdist > 0.001) {
      acc += pd / pdist * (340.0 - pdist) * 0.02 * P.pingStr;
    }
  }

  // Keep the school inside a comfortable vertical band
  let top = P.res.y * 0.10;
  let bot = P.res.y * 0.88;
  if (pos.y < top) { acc.y += (top - pos.y) * 0.008; }
  if (pos.y > bot) { acc.y -= (pos.y - bot) * 0.008; }

  vel += acc * P.step;
  let speed = length(vel);
  if (speed > 1.7) { vel = vel / speed * 1.7; }
  // High floor (relative to the cap): milling in place is what lets a
  // school collapse into a disc — everyone keeps swimming, so shapes
  // stay drawn out
  if (speed < 1.0) { vel = vel / max(speed, 0.001) * 1.0; }
  pos += vel * P.step;

  // Horizontal wrap with a margin so fish don't pop at the edges
  if (pos.x < -24.0)          { pos.x += P.res.x + 48.0; }
  if (pos.x > P.res.x + 24.0) { pos.x -= P.res.x + 48.0; }

  boidsOut[i].pos = pos;
  boidsOut[i].vel = vel;
}

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) alpha: f32,
  @location(1) uv: vec2f,
}

@group(0) @binding(0) var<storage, read> boids: array<Boid>;
@group(0) @binding(1) var<uniform> RP: Params;
@group(0) @binding(2) var fishSamp: sampler;
@group(0) @binding(3) var fishTex: texture_2d<f32>;

// Sprite aspect: anchovy.png is 192x30 — height/width
const FISH_ASPECT: f32 = 0.15625;

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  let b = boids[ii];
  let dir = normalize(b.vel + vec2f(0.0001, 0.0));
  let perp = vec2f(-dir.y, dir.x);
  // Quad corners: lx −1 = tail, +1 = nose; ly across the body
  let lx = select(-1.0, 1.0, (vi & 1u) == 1u);
  let ly = select(-1.0, 1.0, (vi & 2u) == 2u);
  let halfLen = 11.0 + f32(ii % 5u) * 2.0;
  // Tail wag — the quad can't bend, but skewing the tail corners across
  // the body axis (zero at the nose) reads as swimming at this distance
  let wag = sin(RP.time * 5.0 + f32(ii) * 1.7) * halfLen * 0.12 * (0.5 - lx * 0.5);
  let p = b.pos + dir * (lx * halfLen) + perp * (ly * halfLen * FISH_ASPECT + wag);
  // Photo faces left (head at u=0, dorsal at v=0): nose samples u=0, and
  // when swimming leftward the quad is rotated ~180° — flip v so the
  // fish is never belly-up
  var tv = (ly + 1.0) * 0.5;
  if (dir.x < 0.0) { tv = 1.0 - tv; }
  var out: VSOut;
  out.pos = vec4f(p.x / RP.res.x * 2.0 - 1.0, 1.0 - p.y / RP.res.y * 2.0, 0.0, 1.0);
  out.alpha = 0.34 + f32(ii % 7u) * 0.03;
  out.uv = vec2f((1.0 - lx) * 0.5, tv);
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  // Texture is premultiplied on upload; haze the silver toward the water
  // color so the school reads as distant baitfish, not foreground decals
  let t = textureSample(fishTex, fishSamp, in.uv);
  let haze = vec3f(0.24, 0.44, 0.52);
  let rgb = mix(t.rgb, haze * t.a, 0.42);
  return vec4f(rgb * in.alpha, t.a * in.alpha);
}
`

export function BoidSchool() {
  const canvasRef = useRef(null)
  const mouseRef = useMouse()
  const { subscribe } = useOceanDepthContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !navigator.gpu) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0
    let device = null
    let dead = false
    const cleanupFns = []

    // Band opacity on the canvas element — same fade discipline as sprites
    const opacityRef = { current: 0 }
    const unsubscribe = subscribe((depth) => {
      const o = creatureOpacity(depth, DEPTH_RANGE)
      opacityRef.current = o
      canvas.style.opacity = o.toFixed(3)
    })

    ;(async () => {
      // Sprite fetch races the adapter request; either failing = no school
      const spritePromise = fetch('/creatures/anchovy.png')
        .then(r => (r.ok ? r.blob() : Promise.reject(new Error('sprite fetch failed'))))
        .catch(() => null)

      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter || dead) return
      device = await adapter.requestDevice()
      if (dead) { device.destroy(); return }

      const spriteBlob = await spritePromise
      if (!spriteBlob || dead) return

      // Pre-scaled bitmaps as mip levels — the sprite renders at ~4–10×
      // minification, and WebGPU has no auto mipgen; without mips the
      // school shimmers
      const bmp0 = await createImageBitmap(spriteBlob)
      if (dead) return
      const mipCount = 6
      const bitmaps = [bmp0]
      for (let i = 1; i < mipCount; i++) {
        bitmaps.push(await createImageBitmap(spriteBlob, {
          resizeWidth: Math.max(1, bmp0.width >> i),
          resizeHeight: Math.max(1, bmp0.height >> i),
          resizeQuality: 'high',
        }))
      }
      if (dead) return

      const ctx = canvas.getContext('webgpu')
      const format = navigator.gpu.getPreferredCanvasFormat()
      ctx.configure({ device, format, alphaMode: 'premultiplied' })

      const fishTex = device.createTexture({
        size: [bmp0.width, bmp0.height],
        format: 'rgba8unorm',
        mipLevelCount: mipCount,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST |
               GPUTextureUsage.RENDER_ATTACHMENT,
      })
      bitmaps.forEach((bmp, i) => {
        device.queue.copyExternalImageToTexture(
          { source: bmp },
          { texture: fishTex, mipLevel: i, premultipliedAlpha: true },
          [bmp.width, bmp.height],
        )
      })
      const fishSamp = device.createSampler({
        magFilter: 'linear',
        minFilter: 'linear',
        mipmapFilter: 'linear',
      })

      const module = device.createShaderModule({ code: WGSL })

      // Seed: loose shoal left-of-center
      const seed = new Float32Array(COUNT * 4)
      for (let i = 0; i < COUNT; i++) {
        seed[i * 4 + 0] = Math.random() * window.innerWidth
        seed[i * 4 + 1] = window.innerHeight * (0.25 + Math.random() * 0.5)
        seed[i * 4 + 2] = 0.8 + Math.random() * 0.8
        seed[i * 4 + 3] = (Math.random() - 0.5) * 0.8
      }
      const bufSize = COUNT * 16
      const mkBuf = () => device.createBuffer({
        size: bufSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST |
               GPUBufferUsage.COPY_SRC,
      })
      const bufA = mkBuf()
      const bufB = mkBuf()
      device.queue.writeBuffer(bufA, 0, seed)
      device.queue.writeBuffer(bufB, 0, seed)

      // Dive-log readback target — 6 kB, mapped at most once in flight
      const staging = device.createBuffer({
        size: bufSize,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      })
      let stagingBusy = false
      let frameN = 0

      const paramBuf = device.createBuffer({
        size: 48,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })
      const params = new Float32Array(12)
      const paramsU32 = new Uint32Array(params.buffer)

      const computePipeline = device.createComputePipeline({
        layout: 'auto',
        compute: { module, entryPoint: 'cs' },
      })
      const renderPipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: { module, entryPoint: 'vs' },
        fragment: {
          module,
          entryPoint: 'fs',
          targets: [{
            format,
            blend: {
              color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
              alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
            },
          }],
        },
        primitive: { topology: 'triangle-strip' },
      })

      const mkComputeBind = (src, dst) => device.createBindGroup({
        layout: computePipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: src } },
          { binding: 1, resource: { buffer: dst } },
          { binding: 2, resource: { buffer: paramBuf } },
        ],
      })
      const mkRenderBind = (src) => device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: { buffer: src } },
          { binding: 1, resource: { buffer: paramBuf } },
          { binding: 2, resource: fishSamp },
          { binding: 3, resource: fishTex.createView() },
        ],
      })
      const bindAB = { compute: mkComputeBind(bufA, bufB), render: mkRenderBind(bufB) }
      const bindBA = { compute: mkComputeBind(bufB, bufA), render: mkRenderBind(bufA) }
      let flip = false

      const resize = () => {
        // DPR-scaled backing store keeps the photo sprites crisp; the sim
        // and NDC mapping stay in CSS px via P.res, so only sharpness
        // changes
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        canvas.width = Math.round(window.innerWidth * dpr)
        canvas.height = Math.round(window.innerHeight * dpr)
      }
      resize()
      window.addEventListener('resize', resize, { passive: true })

      let lastT = 0
      const frame = () => {
        rafId = requestAnimationFrame(frame)
        if (document.hidden || opacityRef.current <= 0.01) { lastT = 0; return }

        // The sim is stepped per rendered frame, so without dt-scaling a
        // 120/144 Hz display fast-forwards the school (and main-thread
        // jank while scrolling slows it). Normalize to 60 fps units,
        // clamped so tab-switch gaps don't teleport the fish.
        const now = performance.now()
        const step = lastT > 0 ? Math.min(2.5, Math.max(0.25, (now - lastT) / (1000 / 60))) : 1
        lastT = now

        const ping = getPing()
        const pingAge = now - ping.t
        params[0] = window.innerWidth
        params[1] = window.innerHeight
        params[2] = mouseRef.current.x
        params[3] = mouseRef.current.y
        params[4] = ping.x
        params[5] = ping.y
        params[6] = pingAge < 600 ? 1 - pingAge / 600 : 0
        paramsU32[7] = COUNT
        params[8] = now / 1000
        params[9] = step
        device.queue.writeBuffer(paramBuf, 0, params)

        const useAB = !flip
        const bind = useAB ? bindAB : bindBA
        const dstBuf = useAB ? bufB : bufA
        flip = !flip

        const encoder = device.createCommandEncoder()
        const cp = encoder.beginComputePass()
        cp.setPipeline(computePipeline)
        cp.setBindGroup(0, bind.compute)
        cp.dispatchWorkgroups(Math.ceil(COUNT / 64))
        cp.end()

        const rp = encoder.beginRenderPass({
          colorAttachments: [{
            view: ctx.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
          }],
        })
        rp.setPipeline(renderPipeline)
        rp.setBindGroup(0, bind.render)
        rp.draw(4, COUNT)
        rp.end()

        // Dive-log inspection — same deliberate-discovery contract as the
        // sprite creatures, fed by a position readback
        frameN++
        const inspect = !stagingBusy && frameN % 4 === 0 && opacityRef.current >= 0.5
        if (inspect) encoder.copyBufferToBuffer(dstBuf, 0, staging, 0, bufSize)
        device.queue.submit([encoder.finish()])
        if (inspect) {
          stagingBusy = true
          staging.mapAsync(GPUMapMode.READ).then(() => {
            const a = new Float32Array(staging.getMappedRange())
            const m = mouseRef.current
            const ping = getPing()
            let mi = 0, md = Infinity, pi = 0, pd = Infinity
            for (let i = 0; i < COUNT; i++) {
              const x = a[i * 4], y = a[i * 4 + 1]
              const dm = (x - m.x) ** 2 + (y - m.y) ** 2
              if (dm < md) { md = dm; mi = i }
              const dp = (x - ping.x) ** 2 + (y - ping.y) ** 2
              if (dp < pd) { pd = dp; pi = i }
            }
            // Generous radius + short dwell: the school actively flees
            // the cursor, so chasing CLOSE to it must count — a direct
            // hit on a 3 px fish would be nearly impossible
            inspectSeen('anchovy', a[mi * 4], a[mi * 4 + 1], 110, m, 5)
            if (pi !== mi) inspectSeen('anchovy', a[pi * 4], a[pi * 4 + 1], 110, m, 5)
            staging.unmap()
            stagingBusy = false
          }).catch(() => { stagingBusy = false })
        }
      }
      rafId = requestAnimationFrame(frame)

      cleanupFns.push(() => window.removeEventListener('resize', resize))
    })()

    return () => {
      dead = true
      cancelAnimationFrame(rafId)
      unsubscribe()
      cleanupFns.forEach(fn => fn())
      device?.destroy()
    }
  }, [subscribe, mouseRef])

  return (
    <canvas
      ref={canvasRef}
      className="boid-canvas"
      aria-hidden="true"
    />
  )
}
