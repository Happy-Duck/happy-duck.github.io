// ── Submarine Terminal — hidden console, type "dive" or press ` ───────
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPECIES, BONUS_SPECIES } from '../constants/species'
import { getDiscovered } from '../lib/diveLog'
import { todBucket } from '../constants/timeOfDay'
import { depthAtMeters } from '../constants/depthZones'

const BANNER = [
  'R.O.V. CONSOLE v2.6 — R/V HAPPY DUCK',
  'link established. type \'help\' for commands.',
]

const EMAIL = 'garhyan2@illinois.edu'

function runCommand(raw, ctx) {
  const cmd = raw.trim().toLowerCase()
  if (!cmd) return []

  // ── debug commands ──

  // tod [dawn|day|dusk|night|auto] — live-swap the surface palette
  if (cmd === 'tod' || cmd.startsWith('tod ')) {
    const arg = cmd.slice(3).trim()
    const valid = ['dawn', 'day', 'dusk', 'night']
    if (!arg) {
      return [
        `surface conditions: ${todBucket()}`,
        'usage: tod dawn|day|dusk|night|auto',
      ]
    }
    if (arg === 'auto' || valid.includes(arg)) {
      const tod = arg === 'auto' ? todBucket() : arg
      window.dispatchEvent(new CustomEvent('ocean:set-tod', { detail: { tod } }))
      return [`surface conditions set: ${tod}${arg === 'auto' ? ' (auto)' : ''}`]
    }
    return [`unknown time of day: ${arg}`]
  }

  // depth <meters> — dive straight to a depth (0–6000)
  if (cmd.startsWith('depth ')) {
    const m = Number(cmd.slice(6).trim())
    if (!Number.isFinite(m) || m < 0 || m > 6000) {
      return ['usage: depth <0–6000>']
    }
    const max = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({ top: max * depthAtMeters(m), behavior: 'smooth' })
    setTimeout(ctx.close, 600)
    return [`descending to ${Math.round(m).toLocaleString()} m…`]
  }

  // reset — wipe expedition data (dive log, dive count) and reload
  if (cmd === 'reset') {
    try {
      for (const k of Object.keys(localStorage)) {
        if (k.startsWith('ocean.')) localStorage.removeItem(k)
      }
      for (const k of Object.keys(sessionStorage)) {
        if (k.startsWith('ocean.')) sessionStorage.removeItem(k)
      }
    } catch { /* private mode */ }
    setTimeout(() => window.location.reload(), 900)
    return ['expedition records wiped. resurfacing…']
  }

  if (cmd === 'debug') {
    return [
      'debug commands:',
      '  tod dawn|day|dusk|night|auto   swap surface palette',
      '  depth <0-6000>                 dive to a depth',
      '  reset                          wipe dive log + counters, reload',
    ]
  }

  switch (cmd) {
    case 'help':
      return [
        'available commands:',
        '  log        dive log summary',
        '  surface    return to the surface',
        '  bottom     descend to the ocean floor',
        '  lights     toggle the ROV headlights',
        '  whale      scan for large biologicals',
        '  ping       emit a sonar ping',
        '  time       ship\'s clock',
        '  resume     open the captain\'s resume',
        '  contact    hailing frequencies',
        '  pelagos    open Pelagos on Steam',
        '  clear      clear the console',
        '  exit       close the console',
        '  debug      engineering commands',
      ]

    case 'log':
    case 'creatures': {
      const found = getDiscovered()
      const names = SPECIES.filter(s => found[s.id]).map(s => s.name)
      const lines = [
        `species identified: ${names.length}/${SPECIES.length}`,
        ...(names.length ? [`  ${names.join(', ')}`] : ['  (none yet — go look around)']),
      ]
      if (found[BONUS_SPECIES.id]) lines.push('  + one entry the log refuses to classify.')
      let dives = 0
      try { dives = Number(localStorage.getItem('ocean.divesCompleted')) || 0 } catch { /* ignore */ }
      if (dives > 0) lines.push(`full dives completed: ${dives}`)
      return lines
    }

    case 'surface':
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(ctx.close, 600)
      return ['blowing ballast. surfacing…']

    case 'bottom':
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      })
      setTimeout(ctx.close, 600)
      return ['diving. watch your head.']

    case 'lights': {
      const off = document.documentElement.classList.toggle('rov-off')
      return [off ? 'headlights OFF. good luck down there.' : 'headlights ON.']
    }

    case 'whale':
      window.dispatchEvent(new CustomEvent('ocean:summon-whale'))
      // Linger long enough to read the contact report before the view clears
      setTimeout(ctx.close, 1600)
      return ['large biological contact on sonar. look to the deep…']

    case 'ping':
      window.dispatchEvent(new CustomEvent('ocean:ping', {
        detail: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      }))
      return ['ping sent. listening…']

    case 'time': {
      const now = new Date()
      const h = now.getHours()
      const watch = h < 5 ? 'middle watch' : h < 8 ? 'morning watch' : h < 17 ? 'forenoon watch' : h < 20 ? 'dog watch' : 'first watch'
      return [
        `ship's clock: ${now.toLocaleTimeString()} — ${watch}`,
        `surface conditions: ${todBucket(h)}`,
      ]
    }

    case 'resume':
      window.open('/Rishi Garhyan Resume.pdf', '_blank', 'noopener')
      return ['transmitting credentials…']

    case 'contact':
      return [
        `email     ${EMAIL}`,
        'linkedin  linkedin.com/in/rishi-garhyan',
        'github    github.com/Happy-Duck',
      ]

    case 'pelagos':
      window.open('https://store.steampowered.com/app/2645390/Pelagos_A_Marine_Adventure', '_blank', 'noopener')
      return ['surfacing Steam page…']

    case 'vr':
      if (!('xr' in navigator)) return ['no immersive rig detected on this vessel.']
      window.dispatchEvent(new CustomEvent('ocean:enter-vr'))
      setTimeout(ctx.close, 800)
      return ['donning the headset…']

    case 'clear':
      ctx.clear()
      return []

    case 'exit':
    case 'quit':
      ctx.close()
      return []

    // ── jokes ──
    case 'sudo':
    case 'sudo su':
      return ['garhyan2 is not in the sudoers file.', 'this incident will be reported to the kraken.']
    case 'rm -rf /':
    case 'rm -rf':
      return ['nice try. the abyss keeps its files.']
    case '42':
      return ['so long, and thanks for all the fish.']
    case 'blub':
      return ['blub blub.']
    case 'dive':
      return ['we\'re already down here, captain.']
    case 'cmd':
      return ['this IS the command console.']

    default:
      return [`command not found: ${cmd} — try 'help'`]
  }
}

export function Terminal() {
  const [open, setOpen] = useState(false)
  const [lines, setLines] = useState([])
  const [history, setHistory] = useState([])
  const [, setHistIdx] = useState(-1)
  const inputRef = useRef(null)
  const bodyRef = useRef(null)
  const bufferRef = useRef('')

  const close = useCallback(() => setOpen(false), [])
  const clear = useCallback(() => setLines([]), [])

  // Global open triggers: type "cmd" anywhere, or press ` / ~
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
      if (typing) return

      if (e.key === '`' || e.key === '~') {
        e.preventDefault()
        setOpen(o => !o)
        bufferRef.current = ''
        return
      }
      if (e.key.length === 1) {
        bufferRef.current = (bufferRef.current + e.key.toLowerCase()).slice(-3)
        if (bufferRef.current === 'cmd') {
          // The same keystroke would otherwise type "d" into the
          // freshly-focused console input
          e.preventDefault()
          setOpen(true)
          bufferRef.current = ''
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus input + reset scroll when opened
  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  // Keep output scrolled to the latest line
  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const onSubmit = (e) => {
    e.preventDefault()
    const value = inputRef.current.value
    if (!value.trim()) return
    inputRef.current.value = ''
    setHistory(h => [...h, value])
    setHistIdx(-1)

    const out = runCommand(value, { close, clear })
    if (value.trim().toLowerCase() !== 'clear') {
      setLines(l => [
        ...l,
        { type: 'in', text: value },
        ...out.map(text => ({ type: 'out', text })),
      ])
    }
  }

  const onInputKey = (e) => {
    if (e.key === 'Escape') { close(); return }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = i === -1 ? history.length - 1 : Math.max(0, i - 1)
        if (history[next] !== undefined) inputRef.current.value = history[next]
        return next
      })
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        if (i === -1) return -1
        const next = i + 1
        if (next >= history.length) { inputRef.current.value = ''; return -1 }
        inputRef.current.value = history[next]
        return next
      })
    }
  }

  return (
    <>
      {/* Console button — the discoverable way in (typing "dive" still works) */}
      <button
        type="button"
        className="term-fab"
        data-no-ping
        onClick={() => setOpen(o => !o)}
        aria-label="Open the submarine console"
        aria-expanded={open}
      >
        <span className="term-fab-glyph" aria-hidden="true">&gt;_</span>
        <span className="term-fab-tip">sub console — psst: typing 'cmd' works too</span>
      </button>

      <AnimatePresence>
      {open && (
        <motion.div
          className="term-overlay"
          data-no-ping
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}
        >
          <motion.div
            className="term-box"
            role="dialog"
            aria-modal="true"
            aria-label="Submarine console"
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={() => inputRef.current?.focus()}
          >
            <div className="term-body" ref={bodyRef}>
              {BANNER.map((b, i) => (
                <p key={`b${i}`} className="term-line term-line--banner">{b}</p>
              ))}
              {lines.map((l, i) => (
                <p key={i} className={`term-line${l.type === 'in' ? ' term-line--in' : ''}`}>
                  {l.type === 'in' ? <><span className="term-prompt">&gt;</span> {l.text}</> : l.text}
                </p>
              ))}
            </div>
            <form className="term-input-row" onSubmit={onSubmit}>
              <span className="term-prompt" aria-hidden="true">&gt;</span>
              <input
                ref={inputRef}
                className="term-input selectable"
                type="text"
                spellCheck="false"
                autoComplete="off"
                aria-label="Console command"
                onKeyDown={onInputKey}
              />
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
