// ── WaterSim — edge-on splash line on the waterline ────────────────────
// The site is a side-on cross-section, so surface ripples are a 1D wave
// equation ALONG the waterline (not a top-down 2D field — wrong physics
// for a side view, same reason caustic webs were rejected):
//   next = 2·curr − prev + c²·(left + right − 2·curr), damped
// Clicks and drags AT the line splash it; the disturbance displaces the
// crest and propagates left/right along the surface. Calm water renders
// fully transparent — the SVG waves carry the resting look, this canvas
// paints only the disturbance. Quarter-res 1D sim on ping-pong float
// FBOs. Needs WebGL2 + renderable float textures — without them (or with
// reduced motion) the canvas stays transparent.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'

// Calm waterline, px from the top of the viewport — sits on the SVG wave
// band (.water-surface is 100px tall, wave midline ≈ 50–60px)
const BASELINE_PX = 58
// Clicks/drags this close to the line belong to the splash sim
const SPLASH_BAND_PX = 120
// SonarPing swallows surface clicks above this line so a splash never
// double-fires a ping — single source of truth for both systems
export const SPLASH_MAX_Y = BASELINE_PX + SPLASH_BAND_PX
// Fixed-height strip: tall enough for crest + spray, nothing more
const CANVAS_H = 150

const VERT = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 pos = vec2(float(gl_VertexID << 1 & 2), float(gl_VertexID & 2));
  v_uv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`

const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_curr;
uniform sampler2D u_prev;
uniform float u_texel;  // 1 / sim width
uniform vec2  u_drop;   // x in uv, y = strength (0 = none)
uniform float u_radius; // cells
in vec2 v_uv;
out vec4 o;
void main() {
  float c = texture(u_curr, v_uv).r;
  float p = texture(u_prev, v_uv).r;
  float l = texture(u_curr, vec2(v_uv.x - u_texel, 0.5)).r;
  float r = texture(u_curr, vec2(v_uv.x + u_texel, 0.5)).r;
  // 1D FDTD is stable up to c² = 1; run at 0.9 for margin + fast sweep
  float next = (c * 2.0 - p) + (l + r - 2.0 * c) * 0.9;
  next *= 0.9965;
  if (u_drop.y != 0.0) {
    float d = (v_uv.x - u_drop.x) / u_texel;
    next += u_drop.y * exp(-d * d / (u_radius * u_radius));
  }
  // Scrub NaN/Inf (uninitialized driver memory would otherwise persist
  // forever: NaN * damping = NaN) and clamp against half-float overflow
  if (!(next == next)) { next = 0.0; }
  next = clamp(next, -2.5, 2.5);
  o = vec4(next, 0.0, 0.0, 1.0);
}`

const DRAW_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_h;
uniform float u_texel;    // 1 / sim width
uniform float u_canvasH;  // px
uniform float u_baseline; // px from top of canvas
in vec2 v_uv;
out vec4 o;
void main() {
  float h  = texture(u_h, vec2(v_uv.x, 0.5)).r;
  float hl = texture(u_h, vec2(v_uv.x - u_texel, 0.5)).r;
  float hr = texture(u_h, vec2(v_uv.x + u_texel, 0.5)).r;
  float slope = (hr - hl) * 0.5;

  // Local wave energy gates everything — calm line = fully transparent
  float e = smoothstep(0.015, 0.28, abs(h) * 0.8 + abs(slope) * 2.4);

  float yPx = (1.0 - v_uv.y) * u_canvasH;      // px from top
  float lineY = u_baseline - h * 14.0;          // displaced crest
  float d = yPx - lineY;                        // + below, − above

  // Bright crest hugging the displaced line, wider where taller
  float w = 4.0 + abs(h) * 4.0;
  float crest = exp(-(d * d) / (w * w));

  // Soft body under the crest — displaced water, quickly fading
  float body = (1.0 - smoothstep(0.0, 26.0, d)) * step(0.0, d) * 0.22;

  float a = clamp((crest + body) * e, 0.0, 1.0) * 0.85;
  o = vec4(vec3(0.86, 0.97, 1.0) * a, a); // premultiplied
}`

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) return null
  return sh
}

function link(gl, vsSrc, fsSrc) {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  return prog
}

export function WaterSim() {
  const canvasRef = useRef(null)
  const { depthRef } = useOceanDepthContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
    if (!gl || gl.isContextLost()) return
    if (!gl.getExtension('EXT_color_buffer_float')) return

    const simProg = link(gl, VERT, SIM_FRAG)
    const drawProg = link(gl, VERT, DRAW_FRAG)
    if (!simProg || !drawProg) return

    const loc = {
      simCurr: gl.getUniformLocation(simProg, 'u_curr'),
      simPrev: gl.getUniformLocation(simProg, 'u_prev'),
      simTexel: gl.getUniformLocation(simProg, 'u_texel'),
      simDrop: gl.getUniformLocation(simProg, 'u_drop'),
      simRadius: gl.getUniformLocation(simProg, 'u_radius'),
      drawH: gl.getUniformLocation(drawProg, 'u_h'),
      drawTexel: gl.getUniformLocation(drawProg, 'u_texel'),
      drawCanvasH: gl.getUniformLocation(drawProg, 'u_canvasH'),
      drawBaseline: gl.getUniformLocation(drawProg, 'u_baseline'),
    }

    // 1D sim: N×1 cells, quarter horizontal res
    let simW = 0
    let texs = []
    let fbos = []

    const mkTex = () => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, simW, 1, 0, gl.RED, gl.HALF_FLOAT, null)
      // R16F is texture-filterable in core WebGL2 — LINEAR keeps the
      // upscaled display pass smooth instead of blocky
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      return t
    }

    const alloc = () => {
      texs.forEach(t => gl.deleteTexture(t))
      fbos.forEach(f => gl.deleteFramebuffer(f))
      texs = [mkTex(), mkTex(), mkTex()]
      fbos = texs.map(t => {
        const f = gl.createFramebuffer()
        gl.bindFramebuffer(gl.FRAMEBUFFER, f)
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0)
        // texImage2D(null) is NOT reliably zero-filled on every driver —
        // clear explicitly or garbage NaNs live in the sim forever
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        return f
      })
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = CANVAS_H
      simW = Math.max(256, canvas.width >> 2)
      alloc()
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    // prev, curr, next texture indices — rotate each step
    let iPrev = 0
    let iCurr = 1
    let iNext = 2

    const drops = []
    const queueDrop = (clientX, strength, radius) => {
      drops.push({ x: clientX / canvas.clientWidth, s: strength, r: radius })
      if (drops.length > 6) drops.shift()
    }
    const inBand = (clientY) => Math.abs(clientY - BASELINE_PX) < SPLASH_BAND_PX

    let lastX = -1e4
    let lastT = 0
    const onMove = (e) => {
      // Only dragging through the waterline itself makes a wake
      if (!inBand(e.clientY) || depthRef.current > 0.3) return
      const now = performance.now()
      if (now - lastT < 34 || Math.abs(e.clientX - lastX) < 8) return
      lastT = now
      lastX = e.clientX
      queueDrop(e.clientX, 0.32, 3.5)
    }
    const onClick = (e) => {
      if (e.target.closest('a,button,input,textarea,[data-no-ping]')) return
      if (!inBand(e.clientY) || depthRef.current > 0.3) return
      queueDrop(e.clientX, 2.2, 5.0)
    }
    const onPing = (e) => {
      if (!inBand(e.detail.y)) return
      queueDrop(e.detail.x, 2.2, 5.0)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    window.addEventListener('ocean:ping', onPing)

    // Ambient drips so calm water still lives — like stray raindrops
    const drip = setInterval(() => {
      if (document.hidden || depthRef.current > 0.3) return
      queueDrop(Math.random() * canvas.clientWidth, 0.35, 2.5)
    }, 2600)

    const simStep = () => {
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[iNext])
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[iCurr])
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, texs[iPrev])
      gl.uniform1i(loc.simCurr, 0)
      gl.uniform1i(loc.simPrev, 1)
      gl.uniform1f(loc.simTexel, 1 / simW)
      const d = drops.shift()
      gl.uniform2f(loc.simDrop, d ? d.x : 0, d ? d.s : 0)
      gl.uniform1f(loc.simRadius, d ? d.r : 1)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      const t = iPrev
      iPrev = iCurr
      iCurr = iNext
      iNext = t
    }

    let rafId = 0
    const frame = () => {
      rafId = requestAnimationFrame(frame)
      if (document.hidden || depthRef.current > 0.3) return

      // Two substeps per frame — waves sweep the line at a lively pace
      gl.useProgram(simProg)
      gl.viewport(0, 0, simW, 1)
      simStep()
      simStep()

      // Shade → screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(drawProg)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[iCurr])
      gl.uniform1i(loc.drawH, 0)
      gl.uniform1f(loc.drawTexel, 1 / simW)
      gl.uniform1f(loc.drawCanvasH, canvas.height)
      gl.uniform1f(loc.drawBaseline, BASELINE_PX)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      clearInterval(drip)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
      window.removeEventListener('ocean:ping', onPing)
      texs.forEach(t => gl.deleteTexture(t))
      fbos.forEach(f => gl.deleteFramebuffer(f))
      gl.deleteProgram(simProg)
      gl.deleteProgram(drawProg)
    }
  }, [depthRef])

  return <canvas ref={canvasRef} className="watersim-canvas" aria-hidden="true" />
}
