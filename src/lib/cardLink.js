// ── Card link — make a whole card open an in-site page ─────────────────
// Project and career cards are divs, not <a>s, because a card can hold a
// real link of its own (the store button). Spread these onto the card to
// get link behaviour: click or Enter navigates in-app, Ctrl/Cmd/middle
// click opens a new tab, and data-no-ping keeps the sonar from firing.
import { navigate } from './router'

export function cardLinkProps(href, label) {
  const open = (e) => {
    if (e.metaKey || e.ctrlKey || e.button === 1) {
      window.open(href, '_blank', 'noopener')
      return
    }
    navigate(href)
  }
  return {
    role: 'link',
    tabIndex: 0,
    'aria-label': label,
    'data-no-ping': true,
    onClick: open,
    onAuxClick: open,
    onKeyDown: (e) => {
      if (e.key !== 'Enter') return
      e.preventDefault()
      navigate(href)
    },
  }
}
