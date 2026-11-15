// ── Course column — every class as a bubble in a lava-lamp column ──────
// A cold seep: bubble plumes really do rise from the deep seafloor. Each
// class in src/content/courses.js is one bubble — size by credit hours,
// color by category, solid when completed, translucent while in progress,
// faint when planned. Classes with a page carry a glow ring and are real
// links; the rest show a hover card.
//
// Layers: a WebGL2 metaball canvas draws the wax (bubbles that press
// together fuse and split), and plain DOM nodes on top carry the labels,
// links, and focus. Without WebGL2 the DOM nodes paint their own circles
// (.course-column--css) and nothing else changes.
//
// Motion lives in lib/bubbleSim.js and ticks from the shared depth loop
// (subscribe → dt-scaled step → transforms written straight to the DOM;
// no React state in the hot path). It only runs while the column is on
// screen. Under prefers-reduced-motion the column is laid out once and
// held still. The list view is the accessible, no-motion equivalent.
import { useEffect, useRef, useState } from 'react'
import { useOceanDepthContext } from '../context/OceanDepthContext'
import { useMouse } from '../context/MouseContext'
import { pingImpulse } from '../lib/sonar'
import { createBubbleSim } from '../lib/bubbleSim'
import { Link } from './Link'
import {
  COURSES, TERMS, CURRENT_TERM, COURSE_CATEGORIES, STATUS_LABEL,
  courseStatus, courseHasPage, termLabel, entryPath, entryAnchor,
} from '../content/index.js'

const MAX_BALLS = 40 // shader array size — raise it here and in FRAG together
const BUBBLES = COURSES.slice(0, MAX_BALLS).map(c => ({
  ...c,
  status:    courseStatus(c),
  hasPage:   courseHasPage(c),
  termIdx:   TERMS.findIndex(t => t.id === c.term),
  color:     COURSE_CATEGORIES.find(k => k.id === c.category)?.color ?? '#22c7f5',
  dept:      c.code.split(' ')[0],
  number:    c.code.split(' ').slice(1).join(' '),
}))
const NOW_IDX = TERMS.findIndex(t => t.id === CURRENT_TERM)

// How strongly a bubble is drawn, by status
const STATUS_STRENGTH = { done: 1, now: 0.72, next: 0.4 }
const DIMMED = 0.16 // filtered-out categories

// Radius for a 3-credit class at this column width; others scale by area
function baseRadius(width) {
  return width < 520 ? 26 : width < 900 ? 35 : 44
}
function radiusFor(credits, base) {
  return Math.max(base * 0.62, base * Math.sqrt(credits / 3))
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

// ── Metaball shader ────────────────────────────────────────────────────
// Buffer-less fullscreen triangle (same trick as the god rays). Field per
// ball is (r²/d²)²: exactly 1 on an isolated ball's own edge, falling off
// fast enough that distant balls don't inflate each other, and summing
// past 1 between close neighbours — that is the fused neck.

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`

const FRAG = `#version 300 es
precision highp float;
uniform vec2  u_res;        // column size, CSS px
uniform float u_dpr;
uniform int   u_count;
uniform vec4  u_balls[40];  // x, y, radius (CSS px), strength 0..1
uniform vec3  u_colors[40];
out vec4 o;

void main() {
  vec2 p = gl_FragCoord.xy / u_dpr;
  p.y = u_res.y - p.y;

  float field = 0.0;
  float wsum = 0.0;
  float strength = 0.0;
  vec3 col = vec3(0.0);

  for (int i = 0; i < 40; i++) {
    if (i >= u_count) break;
    vec4 b = u_balls[i];
    if (b.z < 0.5) continue;
    vec2 d = p - b.xy;
    float q = b.z * b.z / (dot(d, d) + 1.0);
    float v = q * q;
    field += v;
    float w = v * v;
    col += u_colors[i] * w;
    strength += b.w * w;
    wsum += w;
  }

  if (wsum < 1e-9) { o = vec4(0.0); return; }
  col /= wsum;
  strength /= wsum;

  float aa   = fwidth(field);
  float body = smoothstep(1.0 - aa, 1.0 + aa, field);  // inside the wax
  float core = smoothstep(1.0, 3.2, field);             // 0 at the rim, 1 deep inside
  float halo = smoothstep(0.3, 1.0, field) * (1.0 - body);

  // Bright rim, darker translucent heart — lit glass, not a flat disc
  vec3 rim  = col * 1.2 + 0.1;
  vec3 fill = mix(rim, col * 0.42, core);
  float alpha = body * mix(0.95, 0.5, core) + halo * 0.2;
  vec3 rgb = mix(col, fill, body);

  alpha *= strength;
  o = vec4(rgb * alpha, alpha);  // premultiplied
}`

function createRenderer(canvas) {
  const gl = canvas.getContext('webgl2', { alpha: true, premultipliedAlpha: true, antialias: false })
  if (!gl) return null

  const compile = (type, src) => {
    const s = gl.createShader(type)
    gl.shaderSource(s, src)
    gl.compileShader(s)
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null
  }
  const vs = compile(gl.VERTEX_SHADER, VERT)
  const fs = compile(gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const prog = gl.createProgram()
  gl.attachShader(prog, vs)
  gl.attachShader(prog, fs)
  gl.linkProgram(prog)
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
  gl.useProgram(prog)

  const uRes    = gl.getUniformLocation(prog, 'u_res')
  const uDpr    = gl.getUniformLocation(prog, 'u_dpr')
  const uCount  = gl.getUniformLocation(prog, 'u_count')
  const uBalls  = gl.getUniformLocation(prog, 'u_balls')
  const uColors = gl.getUniformLocation(prog, 'u_colors')

  const colors = new Float32Array(MAX_BALLS * 3)
  BUBBLES.forEach((b, i) => colors.set(hexToRgb(b.color), i * 3))
  gl.uniform3fv(uColors, colors)
  gl.uniform1i(uCount, BUBBLES.length)

  let dpr = 1
  let w = 1
  let h = 1

  return {
    resize(width, height) {
      w = width
      h = height
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.max(1, Math.round(w * dpr))
      canvas.height = Math.max(1, Math.round(h * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    },
    draw(balls) {
      gl.uniform2f(uRes, w, h)
      gl.uniform1f(uDpr, dpr)
      gl.uniform4fv(uBalls, balls)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    // Never loseContext() here — a StrictMode remount gets the same
    // context back, dead (see CLAUDE.md, god rays)
    dispose() {
      gl.deleteProgram(prog)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}

// ── Hover card ─────────────────────────────────────────────────────────

function BubbleCard({ bubble }) {
  return (
    <>
      <span className="ccard-code">{bubble.code}</span>
      <span className="ccard-title">{bubble.title}</span>
      <span className="ccard-meta">
        {termLabel(bubble.term)} · {bubble.credits} {bubble.credits === 1 ? 'credit hour' : 'credit hours'} · {STATUS_LABEL[bubble.status]}
      </span>
      {bubble.note && <span className="ccard-meta">{bubble.note}</span>}
      {bubble.hasPage && <span className="ccard-open">Click to open the class page</span>}
    </>
  )
}

// ── List view — the same data as a plain table ─────────────────────────

function CourseList({ through, filter }) {
  return (
    <div className="course-list">
      {TERMS.slice(0, through + 1).map(term => {
        const rows = BUBBLES.filter(b => b.term === term.id && (!filter || b.category === filter))
        if (rows.length === 0) return null
        return (
          <table key={term.id} className="course-table">
            <caption>{term.label}</caption>
            <thead>
              <tr>
                <th scope="col">Class</th>
                <th scope="col">Title</th>
                <th scope="col">Hours</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(b => (
                <tr key={b.slug}>
                  <td className="course-table-code" style={{ '--bubble-color': b.color }}>{b.code}</td>
                  <td>
                    {b.hasPage
                      ? <Link href={entryPath('courses', b.slug)} className="course-table-link">{b.title}</Link>
                      : b.title}
                  </td>
                  <td>{b.credits}</td>
                  <td>{STATUS_LABEL[b.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      })}
    </div>
  )
}

// ── Column ─────────────────────────────────────────────────────────────

export function CourseColumn() {
  const { subscribe } = useOceanDepthContext()
  const mouseRef = useMouse()

  const [view, setView]       = useState('bubbles') // 'bubbles' | 'list'
  const [filter, setFilter]   = useState(null)      // category id | null
  const [through, setThrough] = useState(TERMS.length - 1)
  const [hover, setHover]     = useState(-1)

  const wrapRef   = useRef(null)
  const canvasRef = useRef(null)
  const tipRef    = useRef(null)
  const nodeRefs  = useRef([])
  // Controls, mirrored for the tick loop (written in the effect below)
  const liveRef   = useRef({ filter: null, through: TERMS.length - 1, hover: -1 })
  const apiRef    = useRef(null)

  useEffect(() => {
    liveRef.current.filter = filter
    liveRef.current.through = through
    // Reduced motion never ticks — redraw by hand when a control changes
    apiRef.current?.refresh()
  }, [filter, through])

  useEffect(() => {
    liveRef.current.hover = hover
    apiRef.current?.placeTip()
  }, [hover])

  useEffect(() => {
    if (view !== 'bubbles') return
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const n = BUBBLES.length
    const sim = createBubbleSim(n)
    const balls = new Float32Array(MAX_BALLS * 4)
    const strength = new Float32Array(n).fill(0)
    const baseR = new Float32Array(n) // each bubble's full radius at this width

    const renderer = createRenderer(canvas)
    wrap.classList.toggle('course-column--css', !renderer)

    const isActive = (i) => BUBBLES[i].termIdx <= liveRef.current.through

    const layout = (first) => {
      const w = wrap.clientWidth
      const h = wrap.clientHeight
      sim.resize(w, h)
      renderer?.resize(w, h)
      const base = baseRadius(w)
      for (let i = 0; i < n; i++) {
        baseR[i] = radiusFor(BUBBLES[i].credits, base)
        const node = nodeRefs.current[i]
        if (node) {
          node.style.width = `${baseR[i] * 2}px`
          node.style.height = `${baseR[i] * 2}px`
        }
        sim.setRadius(i, isActive(i) ? baseR[i] : 0, true)
      }
      if (first) sim.scatter()
      sim.settle(first ? 320 : 90)
    }

    const targetStrength = (i) => {
      const { filter: f } = liveRef.current
      const s = STATUS_STRENGTH[BUBBLES[i].status]
      return f && BUBBLES[i].category !== f ? s * DIMMED : s
    }

    const placeTip = () => {
      const tip = tipRef.current
      const i = liveRef.current.hover
      if (!tip || i < 0) return
      // Keep the card inside the column: flip below near the top edge
      const above = sim.y[i] - sim.r[i] > 96
      const ty = above ? sim.y[i] - sim.r[i] - 10 : sim.y[i] + sim.r[i] + 10
      const half = tip.offsetWidth / 2
      const tx = Math.max(half + 6, Math.min(wrap.clientWidth - half - 6, sim.x[i]))
      tip.style.transform = `translate3d(${tx}px, ${ty}px, 0) translate(-50%, ${above ? '-100%' : '0'})`
    }

    // Sim state → DOM transforms + shader uniforms
    const paint = (k) => {
      for (let i = 0; i < n; i++) {
        strength[i] += (targetStrength(i) - strength[i]) * k
        const r = sim.r[i]
        const node = nodeRefs.current[i]
        if (node) {
          const shown = r >= 1
          node.style.visibility = shown ? 'visible' : 'hidden'
          if (shown) {
            node.style.transform =
              `translate3d(${sim.x[i] - baseR[i]}px, ${sim.y[i] - baseR[i]}px, 0) scale(${r / baseR[i]})`
          }
        }
        balls[i * 4]     = sim.x[i]
        balls[i * 4 + 1] = sim.y[i]
        balls[i * 4 + 2] = r
        balls[i * 4 + 3] = strength[i]
      }
      renderer?.draw(balls)
      placeTip()
    }

    const syncActive = () => {
      for (let i = 0; i < n; i++) {
        const want = isActive(i) ? baseR[i] : 0
        if (sim.rt[i] !== want) sim.setRadius(i, want)
      }
    }

    layout(true)
    paint(1)

    // Reduced motion: no ticking. A control change snaps to the new state.
    apiRef.current = {
      placeTip,
      refresh() {
        if (!reduced) return
        for (let i = 0; i < n; i++) sim.setRadius(i, isActive(i) ? baseR[i] : 0, true)
        sim.settle(90)
        paint(1)
      },
    }

    let inView = false
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting }, { rootMargin: '120px' })
    io.observe(wrap)

    const ro = new ResizeObserver(() => { layout(false); paint(1) })
    ro.observe(wrap)

    const env = { mouse: null, ping: null }
    const local = { x: 0, y: 0 }
    let rect = { left: 0, top: 0 }
    env.ping = (x, y) => pingImpulse(x + rect.left, y + rect.top, 360)

    const unsubscribe = reduced ? null : subscribe((_depth, dt) => {
      if (!inView) return
      rect = wrap.getBoundingClientRect()
      const m = mouseRef.current
      local.x = m.x - rect.left
      local.y = m.y - rect.top
      const inside = local.x > -60 && local.y > -60 &&
        local.x < rect.width + 60 && local.y < rect.height + 60
      // A hovered bubble is being read — don't shove it out from under
      // the cursor
      env.mouse = inside && liveRef.current.hover < 0 ? local : null
      syncActive()
      sim.step(dt, env)
      paint(1 - Math.pow(1 - 0.12, dt))
    })

    return () => {
      unsubscribe?.()
      io.disconnect()
      ro.disconnect()
      apiRef.current = null
      renderer?.dispose()
    }
  }, [view, subscribe, mouseRef])

  const shown = hover >= 0 ? BUBBLES[hover] : null
  const throughLabel = TERMS[through].label
  const scrubNote = through < NOW_IDX ? 'looking back' : through === NOW_IDX ? 'this semester' : 'including what is planned'

  return (
    <div className="course-wrap">
      {/* Controls */}
      <div className="course-controls" data-no-ping>
        <div className="course-legend" role="group" aria-label="Filter classes by category">
          {COURSE_CATEGORIES.map(k => (
            <button
              key={k.id}
              type="button"
              className={`course-chip${filter === k.id ? ' course-chip--on' : ''}`}
              style={{ '--bubble-color': k.color }}
              aria-pressed={filter === k.id}
              onClick={() => setFilter(f => (f === k.id ? null : k.id))}
            >
              <span className="course-chip-dot" aria-hidden="true" />
              {k.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="course-view-toggle"
          aria-pressed={view === 'list'}
          onClick={() => { setHover(-1); setView(v => (v === 'bubbles' ? 'list' : 'bubbles')) }}
        >
          {view === 'bubbles' ? 'List view' : 'Bubble view'}
        </button>
      </div>

      {view === 'bubbles' ? (
        <div
          ref={wrapRef}
          className="course-column"
          onMouseLeave={() => setHover(-1)}
        >
          <canvas ref={canvasRef} className="course-canvas" aria-hidden="true" />

          {BUBBLES.map((b, i) => {
            const cls =
              `cbubble cbubble--${b.status}` +
              (b.hasPage ? ' cbubble--page' : '') +
              (filter && b.category !== filter ? ' cbubble--dim' : '')
            const label = (
              <span className="cbubble-label">
                <span className="cbubble-dept">{b.dept}</span>
                <span className="cbubble-num">{b.number}</span>
              </span>
            )
            const common = {
              ref: (el) => { nodeRefs.current[i] = el },
              className: cls,
              style: { '--bubble-color': b.color },
              onMouseEnter: () => setHover(i),
            }
            // Classes with a page are links (keyboard reachable, real
            // href); the rest are hover/tap targets only — the list view
            // is their accessible form
            return b.hasPage ? (
              <Link
                key={b.slug}
                {...common}
                href={entryPath('courses', b.slug)}
                data-entry-anchor={entryAnchor('courses', b.slug)}
                aria-label={`${b.code}: ${b.title}. Open the class page`}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(-1)}
              >
                {label}
              </Link>
            ) : (
              <div
                key={b.slug}
                {...common}
                aria-hidden="true"
                onClick={() => setHover(h => (h === i ? -1 : i))}
              >
                {label}
              </div>
            )
          })}

          <div
            ref={tipRef}
            className={`ccard${shown ? ' ccard--on' : ''}`}
            style={shown ? { '--bubble-color': shown.color } : undefined}
            role="status"
          >
            {shown && <BubbleCard bubble={shown} />}
          </div>
        </div>
      ) : (
        <CourseList through={through} filter={filter} />
      )}

      {/* Semester scrubber */}
      <div className="course-scrub" data-no-ping>
        <label className="course-scrub-label" htmlFor="course-scrub">
          Through <strong>{throughLabel}</strong>
          <span className="course-scrub-note">{scrubNote}</span>
        </label>
        <input
          id="course-scrub"
          className="course-scrub-range"
          type="range"
          min={0}
          max={TERMS.length - 1}
          step={1}
          value={through}
          onChange={(e) => { setHover(-1); setThrough(Number(e.target.value)) }}
          aria-valuetext={throughLabel}
        />
        <div className="course-status-key" aria-hidden="true">
          <span className="course-status-key-item course-status-key-item--done">completed</span>
          <span className="course-status-key-item course-status-key-item--now">in progress</span>
          <span className="course-status-key-item course-status-key-item--next">planned</span>
        </div>
      </div>
    </div>
  )
}
