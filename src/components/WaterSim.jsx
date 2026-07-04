// ── WaterSim — interactive ripples on the surface band ─────────────────
// Classic height-field wave equation on ping-pong float FBOs:
//   next = 2·curr − prev + c²·∇²curr, damped
// Cursor movement over the band drags wakes, clicks (and sonar pings)
// drop ripples, and a soft ambient drip keeps calm water alive. Quarter-
// res sim, shaded into specular/fresnel highlights. Needs WebGL2 +
// renderable float textures — without them (or with reduced motion) the
// canvas stays transparent and the SVG waves carry the surface alone.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'

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
uniform vec2  u_texel;
uniform vec3  u_drop;   // x,y in uv, z = strength (0 = none)
uniform float u_radius; // px
in vec2 v_uv;
out vec4 o;
void main() {
  float c = texture(u_curr, v_uv).r;
  float p = texture(u_prev, v_uv).r;
  float sum =
      texture(u_curr, v_uv - vec2(u_texel.x, 0.0)).r
    + texture(u_curr, v_uv + vec2(u_texel.x, 0.0)).r
    + texture(u_curr, v_uv - vec2(0.0, u_texel.y)).r
    + texture(u_curr, v_uv + vec2(0.0, u_texel.y)).r;
  // c^2 = 0.42 stays safely under the 2D FDTD stability limit of 0.5 —
  // at the limit, rounding growth saturates the field with ringing
  float next = (c * 2.0 - p) + (sum - 4.0 * c) * 0.42;
  next *= 0.965;
  if (u_drop.z != 0.0) {
    vec2 dpx = (v_uv - u_drop.xy) / u_texel;
    float d2 = dot(dpx, dpx);
    next += u_drop.z * exp(-d2 / (u_radius * u_radius));
  }
  // Scrub NaN/Inf (uninitialized driver memory would otherwise persist
  // forever: NaN * damping = NaN) and clamp against half-float overflow
  if (!(next == next)) { next = 0.0; }
  next = clamp(next, -4.0, 4.0);
  o = vec4(next, 0.0, 0.0, 1.0);
}`

const DRAW_FRAG = `#version 300 es
precision highp float;
uniform sampler2D u_h;
uniform vec2 u_texel;
in vec2 v_uv;
out vec4 o;
void main() {
  float hl = texture(u_h, v_uv - vec2(u_texel.x, 0.0)).r;
  float hr = texture(u_h, v_uv + vec2(u_texel.x, 0.0)).r;
  float hd = texture(u_h, v_uv - vec2(0.0, u_texel.y)).r;
  float hu = texture(u_h, v_uv + vec2(0.0, u_texel.y)).r;
  vec3 n = normalize(vec3(hl - hr, hd - hu, 0.5));
  float spec = pow(max(dot(n, normalize(vec3(-0.3, 0.55, 0.78))), 0.0), 22.0);
  float fres = pow(1.0 - abs(n.z), 1.5);
  float a = clamp(spec * 0.55 + fres * 0.6, 0.0, 1.0);
  a *= smoothstep(0.0, 0.45, v_uv.y); // dissolve toward the band's bottom
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
    }

    // Quarter-res sim
    let simW = 0
    let simH = 0
    let texs = []
    let fbos = []

    const mkTex = () => {
      const t = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, t)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, simW, simH, 0, gl.RED, gl.HALF_FLOAT, null)
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
      canvas.height = Math.round(window.innerHeight * 0.22)
      simW = Math.max(128, canvas.width >> 1)
      simH = Math.max(48, canvas.height >> 1)
      alloc()
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    // prev, curr, next texture indices — rotate each step
    let iPrev = 0
    let iCurr = 1
    let iNext = 2

    const drops = []
    const queueDrop = (clientX, clientY, strength, radius) => {
      const r = canvas.getBoundingClientRect()
      if (clientY > r.bottom) return
      drops.push({
        x: clientX / r.width,
        y: 1 - Math.max(0, clientY - r.top) / r.height,
        s: strength,
        r: radius,
      })
      if (drops.length > 6) drops.shift()
    }

    let lastX = -1e4
    let lastT = 0
    const onMove = (e) => {
      const now = performance.now()
      if (now - lastT < 34 || Math.abs(e.clientX - lastX) < 8) return
      lastT = now
      lastX = e.clientX
      queueDrop(e.clientX, e.clientY, 0.55, 5.0)
    }
    const onClick = (e) => {
      if (e.target.closest('a,button,input,textarea,[data-no-ping]')) return
      queueDrop(e.clientX, e.clientY, 2.8, 7.0)
    }
    const onPing = (e) => queueDrop(e.detail.x, e.detail.y, 2.8, 7.0)
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    window.addEventListener('ocean:ping', onPing)

    // Ambient drip so calm water still lives
    const drip = setInterval(() => {
      if (document.hidden || depthRef.current > 0.3) return
      queueDrop(Math.random() * canvas.clientWidth, Math.random() * canvas.clientHeight * 0.7, 0.2, 4.5)
    }, 2600)

    let rafId = 0
    const frame = () => {
      rafId = requestAnimationFrame(frame)
      if (document.hidden || depthRef.current > 0.3) return

      // Sim step → next
      gl.useProgram(simProg)
      gl.viewport(0, 0, simW, simH)
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[iNext])
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[iCurr])
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, texs[iPrev])
      gl.uniform1i(loc.simCurr, 0)
      gl.uniform1i(loc.simPrev, 1)
      gl.uniform2f(loc.simTexel, 1 / simW, 1 / simH)
      const d = drops.shift()
      gl.uniform3f(loc.simDrop, d ? d.x : 0, d ? d.y : 0, d ? d.s : 0)
      gl.uniform1f(loc.simRadius, d ? d.r : 1)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      // Shade → screen
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.useProgram(drawProg)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texs[iNext])
      gl.uniform1i(loc.drawH, 0)
      gl.uniform2f(loc.drawTexel, 1 / simW, 1 / simH)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      // Rotate prev ← curr ← next
      const t = iPrev
      iPrev = iCurr
      iCurr = iNext
      iNext = t
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
