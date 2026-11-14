// ── Link — an in-site <a> that navigates without a page load ───────────
// A real href, so middle-click, ctrl-click, copy-link, and crawlers all
// see an ordinary link; a plain left click is handed to the router.
import { navigate } from '../lib/router'

export function Link({ href, onClick, children, ...rest }) {
  const handleClick = (e) => {
    onClick?.(e)
    if (e.defaultPrevented) return
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    navigate(href)
  }

  return (
    <a href={href} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
