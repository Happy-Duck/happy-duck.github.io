// ── BoidSchool — WebGPU compute-shader fish school ─────────────────────
// ~380 baitfish flocking via classic boids (separation/alignment/cohesion)
// computed on the GPU each frame, rendered as instanced oriented triangles.
// The cursor repels the school; sonar pings scatter it. Purely additive:
// no navigator.gpu (or reduced motion) → the canvas stays transparent and
// the sprite creatures remain the whole experience.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../../context/OceanDepthContext'
import { useMouse } from '../../context/MouseContext'
import { creatureOpacity } from '../../constants/depthZones'
import { getPing } from '../../lib/sonar'

const COUNT = 384
const DEPTH_RANGE = { enter: 0.04, exit: 0.48 }

const WGSL = /* wgsl */ `
struct Boid { pos: vec2f, vel: vec2f }
struct Params {
  res:     vec2f,
  mouse:   vec2f,
  ping:    vec2f,
  pingStr: f32,
  count:   u32,
  _pad:    vec2f,
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

  var acc = sep * 0.55 + (ali - vel) * 0.05 + coh * 0.011;

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

  vel += acc;
  let speed = length(vel);
  if (speed > 2.4) { vel = vel / speed * 2.4; }
  if (speed < 0.7) { vel = vel / max(speed, 0.001) * 0.7; }
  pos += vel;

  // Horizontal wrap with a margin so fish don't pop at the edges
  if (pos.x < -24.0)          { pos.x += P.res.x + 48.0; }
  if (pos.x > P.res.x + 24.0) { pos.x -= P.res.x + 48.0; }

  boidsOut[i].pos = pos;
  boidsOut[i].vel = vel;
}

struct VSOut {
  @builtin(position) pos: vec4f,
  @location(0) alpha: f32,
}

@group(0) @binding(0) var<storage, read> boids: array<Boid>;
@group(0) @binding(1) var<uniform> RP: Params;

@vertex
fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VSOut {
  let b = boids[ii];
  let dir = normalize(b.vel + vec2f(0.0001, 0.0));
  let perp = vec2f(-dir.y, dir.x);
  let size = 4.5 + f32(ii % 5u) * 0.9;
  var local: vec2f;
  if (vi == 0u)      { local = dir * size; }
  else if (vi == 1u) { local = -dir * size * 0.85 + perp * size * 0.34; }
  else               { local = -dir * size * 0.85 - perp * size * 0.34; }
  let p = b.pos + local;
  var out: VSOut;
  out.pos = vec4f(p.x / RP.res.x * 2.0 - 1.0, 1.0 - p.y / RP.res.y * 2.0, 0.0, 1.0);
  out.alpha = 0.30 + f32(ii % 7u) * 0.045;
  return out;
}

@fragment
fn fs(in: VSOut) -> @location(0) vec4f {
  // Premultiplied dark-slate silhouette — reads as distant baitfish on
  // both the sunlit and twilight backgrounds
  return vec4f(vec3f(0.10, 0.19, 0.26) * in.alpha, in.alpha);
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
      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter || dead) return
      device = await adapter.requestDevice()
      if (dead) { device.destroy(); return }

      const ctx = canvas.getContext('webgpu')
      const format = navigator.gpu.getPreferredCanvasFormat()
      ctx.configure({ device, format, alphaMode: 'premultiplied' })

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
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
      const bufA = mkBuf()
      const bufB = mkBuf()
      device.queue.writeBuffer(bufA, 0, seed)
      device.queue.writeBuffer(bufB, 0, seed)

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
        primitive: { topology: 'triangle-list' },
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
        ],
      })
      const bindAB = { compute: mkComputeBind(bufA, bufB), render: mkRenderBind(bufB) }
      const bindBA = { compute: mkComputeBind(bufB, bufA), render: mkRenderBind(bufA) }
      let flip = false

      const resize = () => {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
      resize()
      window.addEventListener('resize', resize, { passive: true })

      const frame = () => {
        rafId = requestAnimationFrame(frame)
        if (document.hidden || opacityRef.current <= 0.01) return

        const ping = getPing()
        const pingAge = performance.now() - ping.t
        params[0] = canvas.width
        params[1] = canvas.height
        params[2] = mouseRef.current.x
        params[3] = mouseRef.current.y
        params[4] = ping.x
        params[5] = ping.y
        params[6] = pingAge < 600 ? 1 - pingAge / 600 : 0
        paramsU32[7] = COUNT
        device.queue.writeBuffer(paramBuf, 0, params)

        const bind = flip ? bindBA : bindAB
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
        rp.draw(3, COUNT)
        rp.end()
        device.queue.submit([encoder.finish()])
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
