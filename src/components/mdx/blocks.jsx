// ── Page blocks — the building pieces for page write-ups ───────────────
// Each is a tag you can use in an .mdx file. See /dev/kitchen-sink (dev
// server) for every one of them rendered, and pages/_TEMPLATE.mdx for
// copy-paste examples.
//
//   <Stats items={[{ value: '30,000+', label: 'Steam downloads' }]} />
//   <Figure src="/media/projects/pelagos/menu.webp" alt="…" caption="…" />
//   <Gallery images={[{ src: '…', alt: '…', caption: '…' }]} />
//   <YouTube id="dQw4w9WgXcQ" title="Launch trailer" />
//   <Callout title="Why this mattered">…</Callout>
//   <Redacted until="January 2027">Screenshots of the simulator</Redacted>
//   <RepoCard repo="Happy-Duck/DiscordSportsBot" />
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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

// ── Callout — a boxed aside ────────────────────────────────────────────

export function Callout({ title, children }) {
  return (
    <aside className="blk-callout">
      {title && <p className="blk-callout-title">{title}</p>}
      <div className="blk-callout-body">{children}</div>
    </aside>
  )
}

// ── Redacted — a placeholder for media that can't be shown yet ─────────

export function Redacted({ until, children }) {
  return (
    <div className="blk-redacted" role="note">
      <span className="blk-redacted-stamp">Under embargo{until ? ` until ${until}` : ''}</span>
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
      <button ref={closeRef} type="button" className="blk-lightbox-close" onClick={onClose} aria-label="Close image">×</button>
      {many && <button type="button" className="blk-lightbox-nav blk-lightbox-nav--prev" onClick={() => onStep(-1)} aria-label="Previous image">‹</button>}
      <figure className="blk-lightbox-figure">
        <img src={img.src} alt={img.alt || ''} />
        {(img.caption || many) && (
          <figcaption>
            {img.caption}
            {many && <span className="blk-lightbox-count">{index + 1} / {images.length}</span>}
          </figcaption>
        )}
      </figure>
      {many && <button type="button" className="blk-lightbox-nav blk-lightbox-nav--next" onClick={() => onStep(1)} aria-label="Next image">›</button>}
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

export function Figure({ src, alt = '', caption, width, height }) {
  const box = useLightbox(1)
  const images = [{ src, alt, caption }]
  return (
    <figure className="blk-figure">
      <button type="button" className="blk-figure-btn" onClick={() => box.open(0)} aria-label={`Enlarge image: ${alt || caption || ''}`}>
        <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      </button>
      {caption && <figcaption>{caption}</figcaption>}
      {box.index >= 0 && <Lightbox images={images} index={0} onClose={box.close} onStep={box.step} />}
    </figure>
  )
}

// ── Gallery — a grid of images; click any to page through them ─────────

export function Gallery({ images = [] }) {
  const box = useLightbox(images.length)
  return (
    <div className="blk-gallery">
      {images.map((im, i) => (
        <button
          key={im.src}
          type="button"
          className="blk-gallery-item"
          onClick={() => box.open(i)}
          aria-label={`Enlarge image ${i + 1} of ${images.length}: ${im.alt || im.caption || ''}`}
        >
          <img src={im.src} alt={im.alt || ''} loading="lazy" decoding="async" />
        </button>
      ))}
      {box.index >= 0 && <Lightbox images={images} index={box.index} onClose={box.close} onStep={box.step} />}
    </div>
  )
}

// ── YouTube — a thumbnail until clicked, then the player ───────────────
// Nothing is loaded from YouTube (no player, no cookies) until the
// visitor presses play.

export function YouTube({ id, title = 'Video' }) {
  const [playing, setPlaying] = useState(false)
  return (
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
          <span className="blk-video-play" aria-hidden="true" />
          <span className="blk-video-title">{title}</span>
        </button>
      )}
    </div>
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

const monthYear = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' })

export function RepoCard({ repo }) {
  const data = useRepo(repo)
  return (
    <a className="blk-repo" href={`https://github.com/${repo}`} target="_blank" rel="noopener noreferrer">
      <span className="blk-repo-name">{repo}</span>
      {data?.description && <span className="blk-repo-desc">{data.description}</span>}
      <span className="blk-repo-meta">
        {data ? (
          <>
            {data.language && <span>{data.language}</span>}
            {data.stars > 0 && <span>★ {data.stars}</span>}
            {data.pushed && <span>last push {monthYear.format(new Date(data.pushed))}</span>}
          </>
        ) : (
          <span>view on GitHub</span>
        )}
      </span>
    </a>
  )
}
