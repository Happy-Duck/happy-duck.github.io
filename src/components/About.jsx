import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLanyard } from '../hooks/useLanyard'

// ── Data ───────────────────────────────────────────────────────────────

const LOG_ENTRIES = [
  "I'm just a man trying to make cool stuff: games, simulations, the occasional VR experience for a space agency.",
  "Gamer at heart: Zelda is an all-time favorite, Minecraft is timeless.",
  "Musical theater nerd: catching every touring production I ever can",
  "Cooking enthusiast: my favorite thing to cook is something I've never cooked before",
  'Avid fly fisherman: fished the Wisconsin Driftless, the Appalachians in Virginia. Current trout count: 4',
  'TTRPG Player: if I use the name, then Wizards of the Coast™ might get me',
]

const LOCATION = 'Urbana, IL'

// ── Rotating typewriter hook ─────────────────────────────────────────

function useRotatingTypewriter(lines, pauseMs = 4000) {
  const [entries, setEntries]       = useState([])
  const [typingIdx, setTypingIdx]   = useState(-1)
  const [typingLen, setTypingLen]   = useState(0)
  const [phase, setPhase]           = useState('idle') // idle | typing | paused
  const started   = useRef(false)
  const timeoutRef = useRef(null)
  const idRef     = useRef(0)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  const start = useCallback(() => {
    if (started.current) return
    started.current = true

    const initial = lines.map(text => ({ text, id: idRef.current++ }))
    setEntries(initial)
    setPhase('paused')

    // Cycle: remove top, re-type it at bottom
    function cycle() {
      setEntries(prev => {
        const removed = prev[0]
        const rest = prev.slice(1)
        const newEntry = { text: removed.text, id: idRef.current++ }
        const next = [...rest, newEntry]

        // Start typing the new bottom entry
        setTypingIdx(next.length - 1)
        setPhase('typing')
        let charIdx = 0

        function tick() {
          if (charIdx >= newEntry.text.length) {
            setTypingIdx(-1)
            setPhase('paused')
            timeoutRef.current = setTimeout(cycle, pauseMs)
            return
          }
          charIdx++
          setTypingLen(charIdx)
          const variance = (Math.random() - 0.5) * 20
          timeoutRef.current = setTimeout(tick, 40 + variance)
        }
        tick()

        return next
      })
    }

    timeoutRef.current = setTimeout(cycle, pauseMs)
  }, [lines, pauseMs])

  return { entries, typingIdx, typingLen, phase, start }
}

// ── Discord presence ───────────────────────────────────────────────────

function resolveActivityImage(activity) {
  if (!activity) return null
  const assets = activity.assets
  const appId  = activity.application_id
  const img = assets?.large_image || assets?.small_image
  if (!img) return null
  if (img.startsWith('mp:external/'))
    return `https://media.discordapp.net/external/${img.slice(12)}`
  if (appId)
    return `https://cdn.discordapp.com/app-assets/${appId}/${img}.png`
  return null
}

const appIconCache = {}

function useAppIcon(appId) {
  const [iconUrl, setIconUrl] = useState(null)

  useEffect(() => {
    if (!appId) { setIconUrl(null); return }

    if (appIconCache[appId]) {
      setIconUrl(appIconCache[appId])
      return
    }

    let cancelled = false
    fetch(`https://discord.com/api/v9/applications/${appId}/rpc`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled || !data?.icon) return
        const url = `https://cdn.discordapp.com/app-icons/${appId}/${data.icon}.png`
        appIconCache[appId] = url
        setIconUrl(url)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [appId])

  return iconUrl
}

function useElapsed(startTimestamp) {
  const [elapsed, setElapsed] = useState('')

  useEffect(() => {
    if (!startTimestamp) { setElapsed(''); return }

    function update() {
      const diff = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000))
      const h = Math.floor(diff / 3600)
      const m = Math.floor((diff % 3600) / 60)
      const s = diff % 60
      setElapsed(h > 0
        ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
        : `${m}:${String(s).padStart(2,'0')}`)
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [startTimestamp])

  return elapsed
}

function LivePresence() {
  const { activities, spotify, loading, error } = useLanyard()
  const activity = activities?.find(a => a.type !== 4) || null
  const fallbackTs = useRef(null)

  let thumb = null
  let line  = null
  let sub   = null
  let startTs = null

  if (!loading && !error) {
    if (spotify) {
      line  = spotify.song
      sub   = `by ${spotify.artist}`
      thumb = spotify.album_art_url
      startTs = spotify.timestamps?.start
    } else if (activity) {
      line  = activity.name
      thumb = resolveActivityImage(activity)
      startTs = activity.timestamps?.start
    }
  }

  // Track when we first see an activity as fallback for missing timestamps
  const activityKey = line || null
  if (activityKey && !startTs) {
    if (!fallbackTs.current || fallbackTs.current.key !== activityKey) {
      fallbackTs.current = { key: activityKey, ts: Date.now() }
    }
    startTs = fallbackTs.current.ts
  } else if (!activityKey) {
    fallbackTs.current = null
  }

  const needsAppIcon = !thumb && activity?.application_id
  const appIcon = useAppIcon(needsAppIcon ? activity.application_id : null)
  if (!thumb && appIcon) thumb = appIcon

  const elapsed = useElapsed(startTs)

  // Nothing active → render nothing
  if (loading || error || !line) return null

  return (
    <div className="log-presence">
      <span className="log-presence-label">live transmission //</span>
      <div className="log-presence-content">
        {thumb && (
          <img src={thumb} alt="" className="log-presence-thumb" loading="lazy" />
        )}
        <div className="log-presence-text">
          <span className="log-presence-main">{line}</span>
          {sub && <span className="log-presence-sub">{sub}</span>}
          {elapsed && <span className="log-presence-elapsed">{elapsed} elapsed</span>}
        </div>
      </div>
    </div>
  )
}

// ── Typewriter log entries ─────────────────────────────────────────────

function TypewriterLog() {
  const { entries, typingIdx, typingLen, phase, start } = useRotatingTypewriter(LOG_ENTRIES)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start()
          obs.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [start])

  return (
    <div ref={ref} className="log-entries">
      {entries.map((entry, i) => (
        <p key={entry.id} className="log-entry">
          <span className="log-prompt" aria-hidden="true">&gt;</span>
          <span>
            {i === typingIdx ? entry.text.slice(0, typingLen) : entry.text}
            {((i === typingIdx && phase === 'typing') ||
              (phase === 'paused' && i === entries.length - 1)) && (
              <span className="typewriter-cursor" aria-hidden="true">|</span>
            )}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function About() {
  return (
    <section
      className="relative px-6 pb-28 pt-4 w-full max-w-6xl mx-auto"
      style={{ zIndex: 10 }}
    >
      {/* Captain's log card — single unified console */}
      <motion.div
        className="log-card"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.78, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true, margin: '-60px' }}
      >
        {/* Heading */}
        <h2 className="log-title">Captain's Log</h2>

        {/* Metadata block */}
        <div className="log-meta">
          <span className="log-meta-line">UIUC — CS '27 — 4.0 GPA</span>
          <span className="log-meta-line">40.1141°N 88.2249°W — {LOCATION}</span>
        </div>

        <div className="log-divider" />

        {/* Log entries — typewriter */}
        <TypewriterLog />

        {/* Live Discord presence — only shows when active */}
        <LivePresence />

      </motion.div>
    </section>
  )
}
