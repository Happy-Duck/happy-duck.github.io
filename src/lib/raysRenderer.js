// ── raysRenderer — the god-rays WebGL2 renderer, host-agnostic ─────────
// Works on an HTMLCanvasElement (main thread fallback) or an
// OffscreenCanvas (worker). Pure module: no DOM, no Date — the host
// supplies sizes, time, and the time-of-day ray palette.

const VERT = `#version 300 es
void main() {
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

float beams(float s, float t) {
  float b = sin(s * 4.7 - t * 0.26) * 0.5 + 0.5;
  b *= sin(s * 9.1 + t * 0.17) * 0.5 + 0.5;
  b *= sin(s * 2.3 + t * 0.09) * 0.5 + 0.5;
  b *= sin(s * 15.7 - t * 0.31) * 0.35 + 0.65;
  return pow(b, 1.8) * 3.2;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  float t = u_time;
  float depth = 1.0 - uv.y;
  float aspect = u_res.x / u_res.y;
  float s1 = (uv.x + depth * 0.28) * aspect;
  float s2 = (uv.x + depth * 0.38) * aspect;
  float sway = sin(t * 0.12 + uv.y * 1.7) * 0.045;
  float b = beams(s1 + sway, t) + 0.6 * beams(s2 * 1.31 + 4.7 - sway, t * 0.85);
  float fade = pow(uv.y, 1.7);
  float shimmer = smoothstep(0.90, 1.0, uv.y)
                * (sin(uv.x * aspect * 38.0 + t * 1.1)
                 * sin(uv.x * aspect * 23.0 - t * 0.7) * 0.5 + 0.5);
  float a = clamp(b * fade * 0.32 + shimmer * 0.22, 0.0, 1.0) * u_strength;
  outColor = vec4(u_tint * a, a);
}`

// Ray tint + intensity by time of day (night renders as day, like the
// water palette — see constants/timeOfDay.js)
export const TOD_RAYS = {
  dawn:  { tint: [1.0, 0.84, 0.7], strength: 0.95 },
  day:   { tint: [0.85, 0.97, 1.0], strength: 1.0 },
  dusk:  { tint: [1.0, 0.74, 0.5], strength: 0.95 },
  night: { tint: [0.85, 0.97, 1.0], strength: 1.0 },
}

function compile(gl, type, src) {
  const sh = gl.createShader(type)
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null
}

export function createRaysRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false })
  if (!gl || (gl.isContextLost && gl.isContextLost())) return null

  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const uTime = gl.getUniformLocation(prog, 'u_time')
  const uRes = gl.getUniformLocation(prog, 'u_res')
  const uTint = gl.getUniformLocation(prog, 'u_tint')
  const uStrength = gl.getUniformLocation(prog, 'u_strength')

  return {
    // Half-res render, upscaled by CSS — the pattern is soft
    resize(w, h) {
      canvas.width = Math.max(1, w >> 1)
      canvas.height = Math.max(1, h >> 1)
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    setTod(rays) {
      gl.uniform3fv(uTint, rays.tint)
      gl.uniform1f(uStrength, rays.strength)
    },
    draw(timeSec) {
      gl.uniform1f(uTime, timeSec)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
  }
}
