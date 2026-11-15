// ── Page blocks — the building pieces for page write-ups ───────────────
// Each is a tag you can use in an .mdx file. See /dev/kitchen-sink (dev
// server) for every one of them rendered, and pages/_TEMPLATE.mdx for
// copy-paste examples.
//
//   <Draft />                                  "this page is placeholder"
//   <Stats items={[{ value: '30,000+', label: 'Steam downloads' }]} />
//   <Figure src="/media/…/menu.webp" alt="…" caption="…" />
//   <Gallery images={[{ src: '…', alt: '…', caption: '…' }]} />
//   <Clip src="/media/…/clip.mp4" poster="…" caption="…" />
//   <YouTube id="dQw4w9WgXcQ" title="Launch trailer" />
//   <Diagram nodes={[…]} links={[…]} caption="…" />
//   <CodeTour steps={[{ lines: [2, 4], text: '…' }]}> ```js … ``` </CodeTour>
//   <Note title="Aside">…</Note>               sits in the right margin
//   <Callout title="Why this mattered">…</Callout>
//   <Redacted until="January 2027">Screenshots of the simulator</Redacted>
//   <RepoCard repo="Happy-Duck/DiscordSportsBot" />
//   <Compare before="/media/…/old.webp" after="/media/…/new.webp" alt="…" />
//   <Timeline items={[{ when: 'March 2025', title: '…', text: '…' }]} />
//   <Download href="/media/…/paper.pdf" title="The paper" note="12 pages" />
//
// Figure, Gallery, and Clip draw a labelled placeholder frame when they
// are given no `src` — use `label="what will go here"` while a page is
// being laid out. Compare (no `before`/`after`) and Download (no `href`)
// do the same.
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// ── Draft — marks a page whose content is still placeholder ────────────
// scripts/prerender.mjs counts these at build time and warns, so filler
// can't reach the live site unnoticed.

// `note` replaces the default wording, for a page that is drafted for a
// different reason (written but not yet reviewed, say).
export function Draft({ note }) {
  return (
    <p className="blk-draft" role="note">
      {note || 'Draft layout. The text and media on this page are placeholders.'}
    </p>
  )
}

// ── Placeholder frame ──────────────────────────────────────────────────

function Placeholder({ label, ratio = '16 / 9', play = false }) {
  return (
    <span className="blk-ph" style={{ aspectRatio: ratio }}>
      <svg className="blk-ph-cross" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="0" x2="100" y2="100" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" vectorEffect="non-scaling-stroke" />
      </svg>
      {play && (
        <svg className="blk-ph-play" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="23" />
          <path d="M19 15 L35 24 L19 33 Z" />
        </svg>
      )}
      <span className="blk-ph-label">
        <span>Placeholder</span>
        {label}
      </span>
    </span>
  )
}

// ── Stats — a row of headline numbers ──────────────────────────────────

export function Stats({ items = [] }) {
  return (
    <dl className="blk-stats">
      {items.map(it => (
        <div key={it.label} className="blk-stat">
          <dd className="blk-stat-value">{it.value}</dd>
          <dt className="blk-stat-label">{it.label}</dt>
        </div>
      ))}
    </dl>
  )
}

// ── Note — a short aside set in the right margin ───────────────────────
// Put it directly before the paragraph it belongs beside.

export function Note({ title, children }) {
  return (
    <aside className="blk-note">
      {title && <p className="blk-note-title">{title}</p>}
      {children}
    </aside>
  )
}

// ── Callout — a set-apart passage in the text column ───────────────────

export function Callout({ title, children }) {
  return (
    <aside className="blk-callout">
      {title && <p className="blk-callout-title">{title}</p>}
      <div className="blk-callout-body">{children}</div>
    </aside>
  )
}

// ── Redacted — a frame for media that can't be shown yet ───────────────

export function Redacted({ until, children, ratio = '16 / 9' }) {
  return (
    <div className="blk-redacted" role="note" style={{ aspectRatio: ratio }}>
      <span className="blk-redacted-why">Not public{until ? ` until ${until}` : ' yet'}</span>
      {children && <span className="blk-redacted-what">{children}</span>}
    </div>
  )
}

// ── Lightbox — full-screen image viewer shared by Figure and Gallery ───
// Portaled to <body> above the page layer. data-esc-layer tells the page
// (PageLayer.jsx) that Esc belongs to this, not to "go back".

function Lightbox({ images, index, onClose, onStep }) {
  const closeRef = useRef(null)
  const img = images[index]
  const many = images.length > 1

  useEffect(() => {
    const prev = document.activeElement
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onStep(1)
      if (e.key === 'ArrowLeft') onStep(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      if (prev && prev.focus) prev.focus({ preventScroll: true })
    }
  }, [onClose, onStep])

  return createPortal(
    <div
      className="blk-lightbox"
      data-esc-layer
      data-no-ping
      role="dialog"
      aria-modal="true"
      aria-label={img.alt || 'Image'}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <button ref={closeRef} type="button" className="blk-lightbox-btn blk-lightbox-close" onClick={onClose} aria-label="Close image">
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" /></svg>
      </button>
      {many && (
        <button type="button" className="blk-lightbox-btn" onClick={() => onStep(-1)} aria-label="Previous image">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 L5 8 L10 13" /></svg>
        </button>
      )}
      <figure className="blk-lightbox-figure">
        <img src={img.src} alt={img.alt || ''} />
        {(img.caption || many) && (
          <figcaption>
            {img.caption}
            {many && <span className="blk-lightbox-count">{index + 1} of {images.length}</span>}
          </figcaption>
        )}
      </figure>
      {many && (
        <button type="button" className="blk-lightbox-btn" onClick={() => onStep(1)} aria-label="Next image">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3 L11 8 L6 13" /></svg>
        </button>
      )}
    </div>,
    document.body,
  )
}

function useLightbox(count) {
  const [index, setIndex] = useState(-1)
  const close = useCallback(() => setIndex(-1), [])
  const step = useCallback((d) => setIndex(i => (i + d + count) % count), [count])
  return { index, open: setIndex, close, step }
}

// ── Figure — one image with a caption; click to enlarge ────────────────
// `wide` lets it run the full width of the page instead of the text column.

export function Figure({ src, alt = '', caption, label, ratio, wide = false, width, height }) {
  const box = useLightbox(1)
  return (
    <figure className={`blk-figure${wide ? ' blk-wide' : ''}`}>
      {src ? (
        <button type="button" className="blk-figure-btn" onClick={() => box.open(0)} aria-label={`Enlarge image: ${alt || caption || ''}`}>
          <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
        </button>
      ) : (
        <Placeholder label={label || alt} ratio={ratio} />
      )}
      {caption && <figcaption>{caption}</figcaption>}
      {box.index >= 0 && <Lightbox images={[{ src, alt, caption }]} index={0} onClose={box.close} onStep={box.step} />}
    </figure>
  )
}

// ── Gallery — several images; click any to page through them ───────────
// With `lead`, the first image is shown large and the rest beside it.

// The grid has 12 columns. Three to a row is the default (span 4); the
// last row is re-cut so no picture is ever left alone: a remainder of one
// makes the last four share a row (span 3), a remainder of two makes the
// last two split it (span 6). With `lead`, the first picture takes a
// 2-by-2 block and the next two stack beside it.
function gallerySpans(count, lead) {
  const spans = Array(count).fill(4)
  const start = lead && count >= 3 ? 3 : 0
  const rest = (count - start) % 3
  if (rest === 1 && count - start >= 4) spans.fill(3, count - 4)
  if (rest === 1 && count - start === 1) spans[count - 1] = 12
  if (rest === 2) spans.fill(6, count - 2)
  return spans
}

export function Gallery({ images = [], lead = false, caption }) {
  const real = images.filter(im => im.src)
  const box = useLightbox(real.length)
  const useLead = lead && images.length >= 3
  const spans = gallerySpans(images.length, useLead)
  const cell = (i) => (useLead && i === 0 ? undefined : { gridColumn: `span ${spans[i]}` })
  return (
    <figure className={`blk-gallery blk-wide${useLead ? ' blk-gallery--lead' : ''}`}>
      <div className="blk-gallery-grid">
        {images.map((im, i) => (
          im.src ? (
            <button
              key={im.src}
              type="button"
              className="blk-gallery-item"
              style={cell(i)}
              onClick={() => box.open(real.indexOf(im))}
              aria-label={`Enlarge image ${real.indexOf(im) + 1} of ${real.length}: ${im.alt || im.caption || ''}`}
            >
              <img src={im.src} alt={im.alt || ''} loading="lazy" decoding="async" />
            </button>
          ) : (
            <span key={`${im.label}-${i}`} className="blk-gallery-item blk-gallery-item--ph" style={cell(i)}>
              <Placeholder label={im.label || im.alt} ratio="auto" />
            </span>
          )
        ))}
      </div>
      {caption && <figcaption>{caption}</figcaption>}
      {box.index >= 0 && <Lightbox images={real} index={box.index} onClose={box.close} onStep={box.step} />}
    </figure>
  )
}

// ── Clip — a short video file that plays in place ──────────────────────

export function Clip({ src, poster, caption, label, ratio = '16 / 9', wide = false }) {
  return (
    <figure className={`blk-figure blk-clip${wide ? ' blk-wide' : ''}`}>
      {src ? (
        <video src={src} poster={poster} controls muted playsInline preload="none" style={{ aspectRatio: ratio }} />
      ) : (
        <Placeholder label={label} ratio={ratio} play />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ── YouTube — a thumbnail until clicked, then the player ───────────────
// Nothing is loaded from YouTube (no player, no cookies) until the
// visitor presses play.

export function YouTube({ id, title = 'Video', caption }) {
  const [playing, setPlaying] = useState(false)
  return (
    <figure className="blk-figure blk-clip">
      <div className="blk-video">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title={title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="blk-video-poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${title}`}>
            <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
            <svg className="blk-video-play" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="23" />
              <path d="M19 15 L35 24 L19 33 Z" />
            </svg>
          </button>
        )}
      </div>
      <figcaption>{caption || title}</figcaption>
    </figure>
  )
}

// ── Diagram — boxes and arrows on a grid ───────────────────────────────
//   nodes: [{ id, label, note, col, row }]     col/row count from 0
//   links: [{ from, to, label }]
// On a narrow screen the grid is turned on its side, so a left-to-right
// flow becomes top-to-bottom instead of shrinking to nothing.

const CELL_W = 176
const CELL_H = 60
const GAP_X = 96
const GAP_Y = 58

export function Diagram({ nodes = [], links = [], caption, label = 'Diagram' }) {
  const wrapRef = useRef(null)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setNarrow(e.contentRect.width < 560))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const placed = nodes.map(n => {
    const col = narrow ? n.row || 0 : n.col || 0
    const row = narrow ? n.col || 0 : n.row || 0
    return { ...n, x: col * (CELL_W + GAP_X), y: row * (CELL_H + GAP_Y), col, row }
  })
  const byId = Object.fromEntries(placed.map(n => [n.id, n]))
  const w = Math.max(...placed.map(n => n.x)) + CELL_W
  const h = Math.max(...placed.map(n => n.y)) + CELL_H

  const edges = links.map(l => {
    const a = byId[l.from]
    const b = byId[l.to]
    if (!a || !b) return null
    const ax = a.x + CELL_W / 2
    const ay = a.y + CELL_H / 2
    const bx = b.x + CELL_W / 2
    const by = b.y + CELL_H / 2
    let pts
    if (a.row === b.row) {
      const dir = bx > ax ? 1 : -1
      pts = [[ax + dir * CELL_W / 2, ay], [bx - dir * CELL_W / 2, by]]
    } else if (a.col === b.col) {
      const dir = by > ay ? 1 : -1
      pts = [[ax, ay + dir * CELL_H / 2], [bx, by - dir * CELL_H / 2]]
    } else {
      // Dog-leg: out sideways into the gap between the columns, along the
      // gap to the target's row, then in through the target's side. The
      // turn happens in empty space, so the line never crosses a box.
      const dx = bx > ax ? 1 : -1
      const gapX = ax + dx * (CELL_W / 2 + GAP_X / 2)
      pts = [[ax + dx * CELL_W / 2, ay], [gapX, ay], [gapX, by], [bx - dx * CELL_W / 2, by]]
    }
    const mid = [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2]
    return { key: `${l.from}-${l.to}`, d: pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' '), mid, label: l.label }
  }).filter(Boolean)

  return (
    <figure className="blk-figure blk-diagram" ref={wrapRef}>
      <svg
        viewBox={`-2 -2 ${w + 4} ${h + 4}`}
        style={{ maxWidth: w + 4 }}
        role="img"
        aria-label={`${label}: ${nodes.map(n => n.label).join(', ')}`}
      >
        <defs>
          <marker id="blk-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 Z" className="blk-diagram-head" />
          </marker>
        </defs>
        {edges.map(e => (
          <g key={e.key}>
            <path d={e.d} className="blk-diagram-link" markerEnd="url(#blk-arrow)" />
            {e.label && (
              <text x={e.mid[0]} y={e.mid[1] - 7} className="blk-diagram-linklabel" textAnchor="middle">{e.label}</text>
            )}
          </g>
        ))}
        {placed.map(n => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={CELL_W} height={CELL_H} rx="4" className="blk-diagram-node" />
            <text x={n.x + CELL_W / 2} y={n.y + (n.note ? 26 : 35)} className="blk-diagram-label" textAnchor="middle">{n.label}</text>
            {n.note && (
              <text x={n.x + CELL_W / 2} y={n.y + 44} className="blk-diagram-note" textAnchor="middle">{n.note}</text>
            )}
          </g>
        ))}
      </svg>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ── CodeTour — walk through a code block a few lines at a time ─────────
// Wrap a fenced code block and give it steps. Each step names the lines
// it is about (one number, or [first, last], counting from 1) and says
// something about them; those lines stay lit while the rest dim.
//
//   <CodeTour steps={[
//     { lines: 2, text: 'What this line is for.' },
//     { lines: [3, 5], text: 'What these three do together.' },
//   ]}>
//   ```js
//   …the code…
//   ```
//   </CodeTour>
//
// The code is highlighted at build time like any other block; this only
// marks lines, so it reaches into the rendered block rather than
// re-rendering it.

export function CodeTour({ steps = [], children }) {
  const [at, setAt] = useState(0)
  const codeRef = useRef(null)
  const step = steps[at]

  useEffect(() => {
    const lines = codeRef.current?.querySelectorAll('[data-line]') || []
    const [from, to] = Array.isArray(step?.lines) ? step.lines : [step?.lines, step?.lines]
    lines.forEach((el, i) => el.toggleAttribute('data-lit', i + 1 >= from && i + 1 <= to))
  }, [step])

  if (!step) return children
  return (
    <figure className="blk-tour blk-wide">
      <div className="blk-tour-code" ref={codeRef}>{children}</div>
      <div className="blk-tour-side">
        <p className="blk-tour-count">Step {at + 1} of {steps.length}</p>
        <p className="blk-tour-text" aria-live="polite">{step.text}</p>
        <div className="blk-tour-nav">
          <button type="button" onClick={() => setAt(i => i - 1)} disabled={at === 0}>Back</button>
          <button type="button" onClick={() => setAt(i => i + 1)} disabled={at === steps.length - 1}>Next</button>
        </div>
      </div>
    </figure>
  )
}

// ── Compare — two pictures of the same thing, with a divider to drag ───
// Both pictures should be the same shape. The divider is a real range
// input laid over the frame, so it works by drag, tap, and arrow keys
// with nothing written for any of them. Either side draws a placeholder
// when it has no file yet.

export function Compare({
  before, after, beforeLabel = 'Before', afterLabel = 'After',
  alt = '', caption, ratio = '16 / 9', wide = false, start = 50,
}) {
  const [pos, setPos] = useState(start)
  const side = (src, name) => (
    src
      ? <img src={src} alt={`${name}: ${alt}`} loading="lazy" decoding="async" draggable="false" />
      : <Placeholder label={`${name} picture`} ratio="auto" />
  )
  return (
    <figure className={`blk-figure blk-compare${wide ? ' blk-wide' : ''}`}>
      <div className="blk-compare-frame" style={{ aspectRatio: ratio, '--pos': `${pos}%` }}>
        <div className="blk-compare-side">
          {side(after, afterLabel)}
          <span className="blk-compare-tag blk-compare-tag--after">{afterLabel}</span>
        </div>
        <div className="blk-compare-side blk-compare-side--before">
          {side(before, beforeLabel)}
          <span className="blk-compare-tag">{beforeLabel}</span>
        </div>
        <input
          className="blk-compare-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label={`How much of the ${beforeLabel.toLowerCase()} picture to show`}
          aria-valuetext={`${pos}% ${beforeLabel.toLowerCase()}, ${100 - pos}% ${afterLabel.toLowerCase()}`}
        />
        <span className="blk-compare-divider" aria-hidden="true">
          <svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="13" /><path d="M11 9 L6.5 14 L11 19 M17 9 L21.5 14 L17 19" /></svg>
        </span>
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ── Timeline — dated steps, oldest first ───────────────────────────────
//   items: [{ when: 'March 2025', title: 'First playable', text: '…' }]

export function Timeline({ items = [] }) {
  return (
    <ol className="blk-timeline">
      {items.map(it => (
        <li key={`${it.when}-${it.title}`} className="blk-timeline-row">
          <span className="blk-timeline-when">{it.when}</span>
          <span className="blk-timeline-what">
            <span className="blk-timeline-title">{it.title}</span>
            {it.text && <span className="blk-timeline-text">{it.text}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

// ── Download — a file the reader can open (a paper, a poster) ──────────
// The kind of file is read from its name. Without `href` it draws as a
// placeholder row, for a file that has not been added yet.

export function Download({ href, title, note }) {
  const kind = href ? (href.split('?')[0].match(/\.([a-z0-9]+)$/i)?.[1] || 'file').toUpperCase() : null
  const meta = [kind, note].filter(Boolean).join(', ')
  const body = (
    <>
      <svg className="blk-download-icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M10 3 V12.5 M6 9 L10 13 L14 9 M4 16.5 H16" />
      </svg>
      <span className="blk-download-title">{title}</span>
      <span className="blk-download-meta">{href ? meta : ['File to come', note].filter(Boolean).join(', ')}</span>
    </>
  )
  return href ? (
    <a className="blk-download" href={href} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <p className="blk-download blk-download--ph">{body}</p>
  )
}

// ── RepoCard — live numbers for a GitHub repository ────────────────────
// One unauthenticated API call, cached for the session. If GitHub says no
// (rate limit, offline), the card still shows as a plain link.

function useRepo(repo) {
  const [data, setData] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(`ocean.repo.${repo}`)) } catch { return null }
  })
  useEffect(() => {
    if (data) return
    let live = true
    fetch(`https://api.github.com/repos/${repo}`)
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (!live || !j) return
        const slim = {
          description: j.description, language: j.language,
          stars: j.stargazers_count, pushed: j.pushed_at,
        }
        try { sessionStorage.setItem(`ocean.repo.${repo}`, JSON.stringify(slim)) } catch { /* private mode */ }
        setData(slim)
      })
      .catch(() => {})
    return () => { live = false }
  }, [repo, data])
  return data
}

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export function RepoCard({ repo }) {
  const data = useRepo(repo)
  const meta = data
    ? [
        data.language,
        data.stars > 0 && `${data.stars} ${data.stars === 1 ? 'star' : 'stars'}`,
        data.pushed && `last pushed ${monthYear.format(new Date(data.pushed))}`,
      ].filter(Boolean).join(', ')
    : 'on GitHub'
  return (
    <a className="blk-repo" href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">
      <span className="blk-repo-name">{repo}</span>
      {data?.description && <span className="blk-repo-desc">{data.description}</span>}
      <span className="blk-repo-meta">{meta}</span>
    </a>
  )
}
