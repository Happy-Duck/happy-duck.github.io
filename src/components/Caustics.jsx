// ── WebGL caustics — real shader light-dance in the sunlit zone ────────
// Raw WebGL2, zero dependencies. Half-res canvas across the top ~45vh,
// opacity driven by --beach-op (set per-frame by OceanDepthContext), and
// the render loop fully pauses below the sunlit band or when the tab is
// hidden. No WebGL2 → renders nothing (the CSS look stands on its own).
import { useEffect, useRef } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'

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
out vec4 outColor;

// Iterative water-turbulence caustics — thin bright filaments with a
// near-zero baseline. The pattern is inherently 2pi-periodic, so a
// single layer tiles visibly; two layers at incommensurate scales are
// multiplied so their repeats never align, plus a slow low-frequency
// domain warp shifting each would-be tile differently.
float turb(vec2 uv, float t) {
  vec2 p = mod(uv * 6.28318, 6.28318) - 250.0;
  vec2 i = p;
  float c = 1.0;
  const float inten = 0.005;

  for (int n = 0; n < 4; n++) {
    float tt = t * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(tt - i.x) + sin(tt + i.y),
                 sin(tt - i.y) + cos(tt + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + tt) / inten),
                           p.y / (cos(i.y + tt) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return clamp(pow(abs(c), 8.0), 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.y;
  float t = u_time * 0.55 + 23.0;

  // Low-frequency cross-axis warp (x displaced by y and vice versa —
  // a shear, not a squash) — incommensurate with the pattern period
  vec2 warp = 1.3 * vec2(sin(uv.y * 0.83 + t * 0.10),
                         cos(uv.x * 0.71 - t * 0.08));

  float a1 = turb(uv * 1.45 + warp, t);
  float a2 = turb(uv * 0.97 + vec2(5.2, 1.7) - warp * 0.6, t * 0.82 + 3.0);
  float b = pow(clamp(a1 * a2 * 2.6, 0.0, 1.0), 0.8);

  // Strongest at the surface (top of canvas), gone by the bottom edge
  float fade = smoothstep(0.0, 0.8, gl_FragCoord.y / u_res.y);

  float a = b * 0.45 * fade;
  vec3 tint = vec3(0.8, 0.97, 1.0);
  outColor = vec4(tint * a, a); // premultiplied
}`

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

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    }
  }, [depthRef])

  return <canvas ref={canvasRef} className="caustics-canvas" aria-hidden="true" />
}
