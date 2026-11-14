// ── Chart — line, bar, and scatter charts for page write-ups ───────────
// Plain inline SVG, no charting library. Used from MDX:
//
//   <Chart type="line" title="Downloads per month" unit="downloads"
//          x={['Oct', 'Nov', 'Dec']}
//          series={[{ name: 'Downloads', values: [120, 900, 2400] }]} />
//
//   <Chart type="bar" title="Frame rate" unit="fps"
//          x={['Before', 'After']}
//          series={[{ name: 'Average', values: [38, 61] }]} />
//
//   <Chart type="scatter" title="Accuracy vs. latency"
//          xLabel="Latency (ms)" yLabel="mAP"
//          points={[{ name: 'YOLOv8n', x: 6.2, y: 37.3, group: 'YOLOv8' }]} />
//
// Rules it follows (so pages don't have to think about them):
// - One y-axis, always. Bars grow from zero; lines include zero unless
//   zero={false}.
// - Series colors are the fixed slots in index.css (--viz-s1…s8), in
//   order, validated for color-blind separation against this page's dark
//   surface. Scatter caps at three colored groups (any two points can sit
//   side by side, and only three slots stay distinct in every pairing);
//   further groups are drawn neutral as "Other".
// - Text is never drawn in a series color. Two or more series get a
//   legend; a single series is named by the title.
// - Every value is reachable without hovering: arrow keys walk the data
//   when the chart has focus, and "View as table" shows all of it.
import { useEffect, useRef, useState } from 'react'

const SLOTS = 8
const SCATTER_GROUPS = 3

// ── Numbers ────────────────────────────────────────────────────────────

const full = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })

function fmt(v) {
  return Number.isFinite(v) ? full.format(v) : '–'
}

// Round steps (1, 2, 2.5, 5 × 10ⁿ) covering [min, max]
function niceTicks(min, max, target = 5) {
  if (min === max) { max = min + 1 }
  const raw = (max - min) / target
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => s >= raw)
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks = []
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Number(v.toFixed(10)))
  return ticks
}

function axisFmt(ticks) {
  const big = Math.max(...ticks.map(Math.abs)) >= 10000
  return (v) => (big ? compact.format(v) : full.format(v))
}

// A bar with a 4px rounded data-end and a square foot on the baseline
function barPath(x, y, w, h, r = 4) {
  const rr = Math.min(r, w / 2, h)
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`
}

// ── Data → one shape for all three types ───────────────────────────────

function normalize({ type, x, categories, series, points }) {
  if (type === 'scatter') {
    const pts = (points || []).filter(p => Number.isFinite(p.x) && Number.isFinite(p.y))
    const names = [...new Set(pts.map(p => p.group).filter(Boolean))]
    const kept = names.slice(0, SCATTER_GROUPS)
    const groups = names.length > SCATTER_GROUPS ? [...kept, 'Other'] : kept
    return {
      pts: pts.map(p => ({ ...p, slot: p.group ? (kept.indexOf(p.group) + 1 || 0) : 1 })),
      groups,
      keptCount: kept.length,
    }
  }
  const labels = (categories || x || []).map(String)
  const list = (series || []).slice(0, SLOTS).map((s, i) => ({
    name: s.name || `Series ${i + 1}`,
    values: labels.map((_, j) => Number(s.values?.[j])),
    slot: i + 1,
  }))
  return { labels, list }
}

// ── Component ──────────────────────────────────────────────────────────

export default function Chart(props) {
  const {
    type = 'line', title, caption, unit = '', xLabel, yLabel, zero = true,
  } = props
  const data = normalize(props)

  const wrapRef = useRef(null)
  const [width, setWidth] = useState(640)
  const [active, setActive] = useState(-1)
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const isScatter = type === 'scatter'
  const count = isScatter ? data.pts.length : data.labels.length
  const multi = isScatter ? data.groups.length > 1 : data.list.length > 1
  if (count === 0) return null

  // ── Scales ──
  const narrow = width < 520
  const plotH = narrow ? 200 : 250
  const yValues = isScatter ? data.pts.map(p => p.y) : data.list.flatMap(s => s.values.filter(Number.isFinite))
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)
  const pad = (lo, hi) => (hi - lo || Math.abs(hi) || 1) * 0.08
  const yTicks = isScatter
    ? niceTicks(yMin - pad(yMin, yMax), yMax + pad(yMin, yMax))
    : niceTicks(zero || type === 'bar' ? Math.min(0, yMin) : yMin, yMax)
  const yFmt = axisFmt(yTicks)
  const [y0, y1] = [yTicks[0], yTicks[yTicks.length - 1]]

  // End-of-line labels need room on the right; skip them on phones
  const endLabels = type === 'line' && !narrow && data.list.length <= 4
  const endText = (s) => (multi ? s.name : fmt(s.values[s.values.length - 1]))
  const m = {
    top: 12,
    right: endLabels ? Math.min(150, 14 + Math.max(...data.list.map(s => endText(s).length)) * 6.6) : 14,
    bottom: 26 + (xLabel ? 18 : 0),
    left: 10 + Math.max(...yTicks.map(t => yFmt(t).length)) * 6.6 + (yLabel ? 16 : 0),
  }
  const plotW = Math.max(60, width - m.left - m.right)
  const height = m.top + plotH + m.bottom
  const sy = (v) => m.top + plotH - ((v - y0) / (y1 - y0)) * plotH

  let xTicks = null
  let sx
  if (isScatter) {
    const xs = data.pts.map(p => p.x)
    const [lo, hi] = [Math.min(...xs), Math.max(...xs)]
    xTicks = niceTicks(lo - pad(lo, hi), hi + pad(lo, hi), narrow ? 4 : 6)
    const [x0, x1] = [xTicks[0], xTicks[xTicks.length - 1]]
    sx = (v) => m.left + ((v - x0) / (x1 - x0)) * plotW
  } else if (type === 'bar') {
    sx = (i) => m.left + ((i + 0.5) / count) * plotW
  } else {
    sx = (i) => m.left + (count === 1 ? plotW / 2 : (i / (count - 1)) * plotW)
  }
  const xFmt = xTicks ? axisFmt(xTicks) : null

  // Category labels: thin them out rather than let them collide
  const longest = isScatter ? 0 : Math.max(...data.labels.map(l => l.length))
  const every = isScatter ? 1 : Math.max(1, Math.ceil((count * (longest * 6.4 + 14)) / plotW))

  // ── Pointer → nearest data position ──
  const locate = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top
    if (isScatter) {
      let best = -1
      let bestD = Infinity
      data.pts.forEach((p, i) => {
        const d = Math.hypot(sx(p.x) - px, sy(p.y) - py)
        if (d < bestD) { bestD = d; best = i }
      })
      return best
    }
    const t = (px - m.left) / plotW
    const i = type === 'bar' ? Math.floor(t * count) : Math.round(t * (count - 1))
    return Math.max(0, Math.min(count - 1, i))
  }

  const onKeyDown = (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
    e.preventDefault()
    setActive(a => {
      const from = a < 0 ? (e.key === 'ArrowRight' ? -1 : count) : a
      return Math.max(0, Math.min(count - 1, from + (e.key === 'ArrowRight' ? 1 : -1)))
    })
  }

  // ── Tooltip ──
  let tip = null
  if (active >= 0) {
    const ax = isScatter ? sx(data.pts[active].x) : sx(active)
    const ay = isScatter
      ? sy(data.pts[active].y)
      : Math.min(...data.list.map(s => (Number.isFinite(s.values[active]) ? sy(s.values[active]) : Infinity)))
    const flip = ax > width * 0.6
    // Scatter: sit above (or below) the point, so the card never covers
    // the neighbours it is being compared with. Line and bar: beside the
    // crosshair.
    const below = ay < 96
    tip = {
      style: isScatter
        ? {
            left: Math.max(84, Math.min(width - 84, ax)),
            top: below ? ay + 14 : ay - 14,
            transform: `translate(-50%, ${below ? '0' : '-100%'})`,
          }
        : {
            left: flip ? undefined : ax + 12,
            right: flip ? width - ax + 12 : undefined,
            top: Math.max(4, Math.min(height - 70, ay - 14)),
          },
      head: isScatter ? data.pts[active].name : data.labels[active],
      rows: isScatter
        ? [
            { key: 'y', slot: data.pts[active].slot, value: fmt(data.pts[active].y), name: yLabel || 'y' },
            { key: 'x', slot: -1, value: fmt(data.pts[active].x), name: xLabel || 'x' },
          ]
        : data.list.map(s => ({
            key: s.name, slot: s.slot,
            value: `${fmt(s.values[active])}${unit ? ` ${unit}` : ''}`, name: s.name,
          })),
    }
  }

  const slotVar = (slot) => (slot > 0 ? `var(--viz-s${slot})` : 'var(--viz-other)')
  const band = plotW / count
  const groupN = isScatter ? 1 : data.list.length
  const barW = Math.min(24, Math.max(3, (band * 0.72) / groupN - 2))
  const labelCaps = type === 'bar' && groupN === 1 && count <= 8 && band >= 40
  const namePoints = isScatter && count <= 8

  return (
    <figure className="viz" ref={wrapRef}>
      {(title || multi) && (
        <div className="viz-head">
          {title && <figcaption className="viz-title">{title}</figcaption>}
          {multi && (
            <ul className="viz-legend">
              {(isScatter ? data.groups.map((g, i) => ({ name: g, slot: i < data.keptCount ? i + 1 : 0 })) : data.list).map(s => (
                <li key={s.name}>
                  <span className={`viz-key viz-key--${type}`} style={{ background: slotVar(s.slot) }} />
                  {s.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div
        className="viz-plot"
        tabIndex={0}
        role="group"
        aria-label={`${title || 'Chart'}. Use the left and right arrow keys to read the values.`}
        onKeyDown={onKeyDown}
        onFocus={() => setActive(a => (a < 0 ? (type === 'line' ? count - 1 : 0) : a))}
        onBlur={() => setActive(-1)}
      >
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={title || 'Chart'}
          onPointerMove={(e) => setActive(locate(e))}
          onPointerLeave={() => setActive(-1)}
        >
          {/* Grid + y ticks */}
          {yTicks.map(t => (
            <g key={t}>
              <line
                x1={m.left} x2={m.left + plotW} y1={sy(t)} y2={sy(t)}
                className={t === 0 || t === y0 ? 'viz-axis' : 'viz-grid'}
              />
              <text x={m.left - 8} y={sy(t)} className="viz-tick" textAnchor="end" dominantBaseline="middle">
                {yFmt(t)}
              </text>
            </g>
          ))}
          {yLabel && (
            <text className="viz-axis-title" textAnchor="middle" transform={`translate(11 ${m.top + plotH / 2}) rotate(-90)`}>
              {yLabel}
            </text>
          )}

          {/* X ticks */}
          {isScatter
            ? xTicks.map(t => (
                <g key={t}>
                  <line x1={sx(t)} x2={sx(t)} y1={m.top} y2={m.top + plotH} className="viz-grid" />
                  <text x={sx(t)} y={m.top + plotH + 16} className="viz-tick" textAnchor="middle">{xFmt(t)}</text>
                </g>
              ))
            : data.labels.map((l, i) => (
                i % every === 0 && (
                  <text key={l + i} x={sx(i)} y={m.top + plotH + 16} className="viz-tick" textAnchor="middle">{l}</text>
                )
              ))}
          {xLabel && (
            <text x={m.left + plotW / 2} y={height - 4} className="viz-axis-title" textAnchor="middle">{xLabel}</text>
          )}

          {/* Marks */}
          {type === 'line' && data.list.map(s => {
            const pts = s.values.map((v, i) => (Number.isFinite(v) ? [sx(i), sy(v)] : null)).filter(Boolean)
            const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ')
            const last = pts[pts.length - 1]
            return (
              <g key={s.name}>
                {!multi && pts.length > 1 && (
                  <path
                    d={`${d} L${last[0]},${sy(y0)} L${pts[0][0]},${sy(y0)} Z`}
                    fill={slotVar(s.slot)} opacity="0.1"
                  />
                )}
                <path d={d} fill="none" stroke={slotVar(s.slot)} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                {last && <circle cx={last[0]} cy={last[1]} r="4" fill={slotVar(s.slot)} className="viz-ring" />}
                {endLabels && last && (
                  <text x={last[0] + 10} y={last[1]} className="viz-label" dominantBaseline="middle">{endText(s)}</text>
                )}
              </g>
            )
          })}

          {type === 'bar' && data.list.map((s, si) => s.values.map((v, i) => {
            if (!Number.isFinite(v)) return null
            const x = sx(i) - (groupN * (barW + 2) - 2) / 2 + si * (barW + 2)
            const top = Math.min(sy(v), sy(0))
            const h = Math.abs(sy(v) - sy(0))
            return (
              <g key={`${s.name}-${i}`}>
                <path d={barPath(x, top, barW, h)} fill={slotVar(s.slot)} opacity={active < 0 || active === i ? 1 : 0.45} />
                {labelCaps && (
                  <text x={x + barW / 2} y={top - 7} className="viz-label" textAnchor="middle">{fmt(v)}</text>
                )}
              </g>
            )
          }))}

          {isScatter && data.pts.map((p, i) => {
            const cx = sx(p.x)
            const left = cx > m.left + plotW - 90
            return (
              <g key={p.name + i}>
                <circle cx={cx} cy={sy(p.y)} r={active === i ? 6 : 5} fill={slotVar(p.slot)} className="viz-ring" />
                {namePoints && (
                  <text x={cx + (left ? -10 : 10)} y={sy(p.y)} className="viz-label" textAnchor={left ? 'end' : 'start'} dominantBaseline="middle">
                    {p.name}
                  </text>
                )}
              </g>
            )
          })}

          {/* Crosshair + the dots it lands on */}
          {type === 'line' && active >= 0 && (
            <g>
              <line x1={sx(active)} x2={sx(active)} y1={m.top} y2={m.top + plotH} className="viz-cross" />
              {data.list.map(s => Number.isFinite(s.values[active]) && (
                <circle key={s.name} cx={sx(active)} cy={sy(s.values[active])} r="4" fill={slotVar(s.slot)} className="viz-ring" />
              ))}
            </g>
          )}
        </svg>

        {tip && (
          <div className="viz-tip" style={tip.style} role="status">
            <span className="viz-tip-head">{tip.head}</span>
            {tip.rows.map(r => (
              <span key={r.key} className="viz-tip-row">
                {r.slot >= 0 && <span className="viz-tip-key" style={{ background: slotVar(r.slot) }} />}
                <strong>{r.value}</strong>
                <span>{r.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="viz-foot">
        {caption && <p className="viz-caption">{caption}</p>}
        <button type="button" className="viz-toggle" aria-expanded={showTable} onClick={() => setShowTable(v => !v)}>
          {showTable ? 'Hide table' : 'View as table'}
        </button>
      </div>

      {showTable && (
        <div className="viz-table-wrap">
          <table className="viz-table">
            {isScatter ? (
              <>
                <thead>
                  <tr><th scope="col">Name</th>{multi && <th scope="col">Group</th>}<th scope="col">{xLabel || 'x'}</th><th scope="col">{yLabel || 'y'}</th></tr>
                </thead>
                <tbody>
                  {data.pts.map((p, i) => (
                    <tr key={p.name + i}><th scope="row">{p.name}</th>{multi && <td>{p.group || ''}</td>}<td>{fmt(p.x)}</td><td>{fmt(p.y)}</td></tr>
                  ))}
                </tbody>
              </>
            ) : (
              <>
                <thead>
                  <tr><th scope="col">{xLabel || ''}</th>{data.list.map(s => <th key={s.name} scope="col">{s.name}{unit ? ` (${unit})` : ''}</th>)}</tr>
                </thead>
                <tbody>
                  {data.labels.map((l, i) => (
                    <tr key={l + i}><th scope="row">{l}</th>{data.list.map(s => <td key={s.name}>{fmt(s.values[i])}</td>)}</tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      )}
    </figure>
  )
}
