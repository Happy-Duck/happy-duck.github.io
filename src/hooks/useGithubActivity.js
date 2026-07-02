// ── GitHub activity — "shipping manifest" for the Captain's Log ────────
// Public events for Happy-Duck, condensed to recent pushes/creations.
// Session-cached 10 min; silently renders nothing on error/rate-limit.
import { useState, useEffect } from 'react'

const CACHE_KEY = 'ocean.ghActivity.v2'
const CACHE_MS = 10 * 60 * 1000
const USER = 'Happy-Duck'

function relTime(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${Math.max(1, mins)}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}

// Read once at module load — render stays pure
const CACHED = (() => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.ts < CACHE_MS) return parsed.items
  } catch { /* ignore */ }
  return null
})()

function condense(events, limit) {
  const items = []
  const seenRepos = new Set() // at most one entry per repo
  for (const ev of events) {
    if (items.length >= limit) break
    const repo = ev.repo?.name?.split('/')[1] || ev.repo?.name || '?'
    if (seenRepos.has(repo)) continue
    if (ev.type === 'PushEvent') {
      // Browser-origin (CORS) requests get a trimmed payload: no commits
      // array, only ref/head/before. Fall back to branch + short sha.
      const commits = ev.payload?.commits
      const branch = (ev.payload?.ref || '').split('/').pop()
      const sha = (ev.payload?.head || '').slice(0, 7)
      const msg = commits?.length
        ? commits[commits.length - 1].message.split('\n')[0]
        : `pushed${branch ? ` to ${branch}` : ''}${sha ? ` @ ${sha}` : ''}`
      items.push({ id: ev.id, repo, msg, when: relTime(ev.created_at) })
      seenRepos.add(repo)
    } else if (ev.type === 'CreateEvent' && ev.payload?.ref_type === 'repository') {
      items.push({ id: ev.id, repo, msg: 'new vessel launched', when: relTime(ev.created_at) })
      seenRepos.add(repo)
    } else if (ev.type === 'ReleaseEvent') {
      items.push({ id: ev.id, repo, msg: `release ${ev.payload?.release?.tag_name || ''}`.trim(), when: relTime(ev.created_at) })
      seenRepos.add(repo)
    }
  }
  return items
}

export function useGithubActivity(limit = 3) {
  const [items, setItems] = useState(CACHED)

  useEffect(() => {
    if (CACHED) return

    let cancelled = false
    fetch(`https://api.github.com/users/${USER}/events/public?per_page=30`)
      .then(r => (r.ok ? r.json() : null))
      .then(events => {
        if (cancelled || !Array.isArray(events)) return
        const condensed = condense(events, limit)
        if (condensed.length > 0) {
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), items: condensed }))
          } catch { /* ignore */ }
        }
        setItems(condensed)
      })
      .catch(() => {})

    return () => { cancelled = true }
  }, [limit])

  return items
}
