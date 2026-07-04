// ── DeepParticles — GPU marine snow lit by the ROV headlight ───────────
// ~1800 point sprites whose positions are computed IN THE VERTEX SHADER
// from static per-particle seeds + time (zero per-frame buffer uploads).
// Sitting just under the darkness layer, ambient particles are faint dust;
// inside the beam they brighten and swell — the light reveals swirling
// particulate, which is what sells the volume. Falls back to the CSS snow
// when WebGL2 or fine pointers are unavailable, or under reduced motion.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'

const COUNT = 1800

const VERT = `#version 300 es
layout(location = 0) in vec4 a_seed; // random 0..1: x, y, fall, kind
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_light;
uniform float u_lightOn;
out float v_bright;
void main() {
  float fall = 0.012 + a_seed.z * 0.030;
  float y = fract(a_seed.y + u_time * fall) * 1.08 - 0.04;
  float sway = sin(u_time * (0.3 + a_seed.w * 0.7) + a_seed.x * 6.2831) * 0.008;
  float x = fract(a_seed.x + u_time * 0.004 * (a_seed.w - 0.5)) + sway;
  vec2 px = vec2(x * u_res.x, y * u_res.y);

  float d = distance(px, u_light);
  float beam = smoothstep(340.0, 40.0, d) * u_lightOn;
  v_bright = 0.10 + beam * 0.85;
  gl_PointSize = (1.5 + a_seed.w * 2.5) * (1.0 + beam * 1.2);
  gl_Position = vec4(px.x / u_res.x * 2.0 - 1.0, 1.0 - px.y / u_res.y * 2.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision mediump float;
in float v_bright;
uniform float u_fade;
out vec4 o;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float m = smoothstep(0.5, 0.15, length(c));
  float a = v_bright * m * u_fade;
  o = vec4(vec3(0.75, 0.88, 1.0) * a, a); // premultiplied
}`

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
}

export function DeepParticles() {
  const canvasRef = useRef(null)
  const { depthRef } = useOceanDepthContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
    if (!gl || gl.isContextLost()) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const prog = gl.createProgram()
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uLight = gl.getUniformLocation(prog, 'u_light')
    const uLightOn = gl.getUniformLocation(prog, 'u_lightOn')
    const uFade = gl.getUniformLocation(prog, 'u_fade')

    // Static seeds — the shader does all the motion
    const seeds = new Float32Array(COUNT * 4)
    for (let i = 0; i < seeds.length; i++) seeds[i] = Math.random()
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 0, 0)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)

    // GPU snow replaces the CSS snow while this is alive
    document.documentElement.classList.add('gpu-snow')

    const light = { x: window.innerWidth / 2, y: window.innerHeight * 0.38 }
    const fine = window.matchMedia('(pointer: fine)').matches
    const onMove = (e) => { light.x = e.clientX; light.y = e.clientY }
    if (fine) window.addEventListener('mousemove', onMove, { passive: true })

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let rafId = 0
    let painted = false
    const start = performance.now()
    const frame = () => {
      rafId = requestAnimationFrame(frame)
      const depth = depthRef.current
      if (document.hidden) return
      if (depth < 0.40) {
        // Scrolled up out of the band — wipe the last frame once, or the
        // beam-lit snow stays frozen wherever the cursor was
        if (painted) {
          gl.clearColor(0, 0, 0, 0)
          gl.clear(gl.COLOR_BUFFER_BIT)
          painted = false
        }
        return
      }
      painted = true

      const fade = Math.min(0.9, Math.max(0, (depth - 0.42) / 0.15))
      const lightOn = document.documentElement.classList.contains('rov-off') ? 0 : 1

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.uniform2f(uLight, light.x, light.y)
      gl.uniform1f(uLightOn, lightOn)
      gl.uniform1f(uFade, fade)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.POINTS, 0, COUNT)
    }
    rafId = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('gpu-snow')
      window.removeEventListener('resize', resize)
      if (fine) window.removeEventListener('mousemove', onMove)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [depthRef])

  return <canvas ref={canvasRef} className="deep-canvas" aria-hidden="true" />
}
