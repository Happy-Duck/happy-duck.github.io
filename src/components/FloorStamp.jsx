// ── Floor stamp — "ABYSSAL FLOOR REACHED" on first full dive ───────────
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useOceanDepthContext } from '../context/OceanDepthContext'

const COUNT_KEY = 'ocean.divesCompleted'
const SESSION_KEY = 'ocean.diveCounted'

export function FloorStamp() {
  const { subscribe } = useOceanDepthContext()
  const [show, setShow] = useState(false)

  useEffect(() => {
    let fired = false
    const unsubscribe = subscribe((depth) => {
      if (fired || depth < 0.98) return
      fired = true

      // Count one dive per session
      let counted = false
      try { counted = sessionStorage.getItem(SESSION_KEY) === '1' } catch { counted = true }
      if (counted) return

      let dives = 0
      try { dives = Number(localStorage.getItem(COUNT_KEY)) || 0 } catch { /* ignore */ }
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
        localStorage.setItem(COUNT_KEY, String(dives + 1))
      } catch { /* private mode */ }

      // Stamp ceremony only for the very first recorded dive
      if (dives === 0) setShow(true)
    })
    return unsubscribe
  }, [subscribe])

  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => setShow(false), 4200)
    return () => clearTimeout(t)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="floor-stamp"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.6, rotate: -14 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="floor-stamp-top">ABYSSAL FLOOR REACHED</span>
          <span className="floor-stamp-depth">6,000 m</span>
          <span className="floor-stamp-sub">R/V HAPPY DUCK — expedition logged</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
