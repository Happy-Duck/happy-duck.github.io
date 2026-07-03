// ── WebGL god rays — volumetric light shafts in the sunlit zone ────────
// The site is a side-on cross-section of the water column, so the right
// surface-light effect is slanted crepuscular rays scattering down from
// the waves (caustic webs only exist where light lands ON a surface).
// Raw WebGL2, zero dependencies. Half-res canvas across the top ~45vh,
// opacity driven by --beach-op (set per-frame by OceanDepthContext), and
// the render loop fully pauses below the sunlit band or when the tab is
// hidden. No WebGL2 → renders nothing (the CSS look stands on its own).
// Ray color follows the time-of-day palette.
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { todBucket } from '../constants/timeOfDay'

const VERT = `#version 300 es
void main() {
  // Fullscreen triangle from gl_VertexID — no buffers needed
  vec2 pos = vec2(float(gl_VertexID << 1 & 2), float(gl_VertexID & 2));
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision mediump float;
uniform float u_time;
uniform vec2  u_res;
uniform vec3  u_tint;
uniform float u_strength;
out vec4 outColor;

// Beam brightness along the surface coordinate s: a product of drifting
// sine octaves at incommensurate frequencies (aperiodic, no tiling),
// sharpened into distinct shafts.
float beams(float s, float t) {
  float b = sin(s * 4.7 - t * 0.26) * 0.5 + 0.5;
  b *= sin(s * 9.1 + t * 0.17) * 0.5 + 0.5;
  b *= sin(s * 2.3 + t * 0.09) * 0.5 + 0.5;
  b *= sin(s * 15.7 - t * 0.31) * 0.35 + 0.65;
  return pow(b, 1.8) * 3.2;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res; // y: 0 = deep edge, 1 = surface
  float t = u_time;

  // Rays lean like afternoon sun; each fragment maps back to the point
  // on the surface its light came through. Two slightly different
  // slants layered = soft parallax between shafts.
  float depth = 1.0 - uv.y;
  float aspect = u_res.x / u_res.y;
  float s1 = (uv.x + depth * 0.28) * aspect;
  float s2 = (uv.x + depth * 0.38) * aspect;

  // Rays sway gently as the waves above refocus them
  float sway = sin(t * 0.12 + uv.y * 1.7) * 0.045;
  float b = beams(s1 + sway, t) + 0.6 * beams(s2 * 1.31 + 4.7 - sway, t * 0.85);

  // Strongest at the surface, dissolving with depth; a touch of
  // glancing-angle shimmer hugging the wave underside.
  float fade = pow(uv.y, 1.7);
  float shimmer = smoothstep(0.90, 1.0, uv.y)
                * (sin(uv.x * aspect * 38.0 + t * 1.1)
                 * sin(uv.x * aspect * 23.0 - t * 0.7) * 0.5 + 0.5);

  float a = clamp(b * fade * 0.32 + shimmer * 0.22, 0.0, 1.0) * u_strength;
  outColor = vec4(u_tint * a, a); // premultiplied
}`

// Ray tint + intensity by time of day (night renders as day — the water
// palette does too; see constants/timeOfDay.js)
const TOD_RAYS = {
  dawn:  { tint: [1.0, 0.84, 0.7], strength: 0.95 },
  day:   { tint: [0.85, 0.97, 1.0], strength: 1.0 },
  dusk:  { tint: [1.0, 0.74, 0.5], strength: 0.95 },
  night: { tint: [0.85, 0.97, 1.0], strength: 1.0 },
}

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    gl.deleteShader(sh)
    return null
  }
  return sh
}

export function Caustics() {
  const canvasRef = useRef(null)
  const { depthRef } = useOceanDepthContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // NOTE: never call WEBGL_lose_context.loseContext() in cleanup —
    // StrictMode remounts get the same (then permanently dead) context
    // back from getContext, and a lost-context canvas paints opaque white.
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

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTint = gl.getUniformLocation(prog, 'u_tint')
    const uStrength = gl.getUniformLocation(prog, 'u_strength')

    const rays = TOD_RAYS[todBucket()]
    gl.uniform3fv(uTint, rays.tint)
    gl.uniform1f(uStrength, rays.strength)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Debug/terminal override: retint the rays live
    const onSetTod = (e) => {
      const r = TOD_RAYS[e.detail?.tod] || TOD_RAYS[todBucket()]
      gl.uniform3fv(uTint, r.tint)
      gl.uniform1f(uStrength, r.strength)
      if (reduced) draw(0) // refresh the static frame
    }
    window.addEventListener('ocean:set-tod', onSetTod)

    const resize = () => {
      // Half-res: the pattern is soft, upscaling is invisible and cheap
      const w = Math.max(1, Math.floor(canvas.clientWidth / 2))
      const h = Math.max(1, Math.floor(canvas.clientHeight / 2))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        gl.viewport(0, 0, w, h)
      }
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    let rafId
    const start = performance.now()

    const draw = (t) => {
      gl.uniform1f(uTime, t)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const loop = () => {
      rafId = requestAnimationFrame(loop)
      // Fully idle when out of the sunlit band or tab hidden
      if (document.hidden || depthRef.current > 0.3) return
      resize()
      draw((performance.now() - start) / 1000)
    }

    if (reduced) {
      draw(0) // single static frame
    } else {
      rafId = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('ocean:set-tod', onSetTod)
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [depthRef])

  return <canvas ref={canvasRef} className="caustics-canvas" aria-hidden="true" />
}
