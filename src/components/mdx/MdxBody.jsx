// ── MDX body — renders one lazily-loaded page write-up ─────────────────
// `loader` is a () => import('….mdx') from src/content/bodies.js. The
// module promise is cached per loader and read with use(), so the body
// suspends once on first open and renders instantly after that.
//
// MDX_COMPONENTS is what Markdown elements and custom tags resolve to
// inside a page body. Portfolio components (Figure, Gallery, Video,
// CodeTour, …) get registered here as they are built.
import { Suspense, createElement, lazy, use } from 'react'
import { Link } from '../Link'

// Site links navigate in-app; everything else opens in a new tab
function MdxLink({ href = '', children, ...rest }) {
  if (href.startsWith('/')) {
    return <Link href={href} {...rest}>{children}</Link>
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  )
}

// Page blocks load on first use, as their own chunks — the dive's bundle
// carries none of them. (blocks.jsx is one chunk; Chart.jsx is another.)
const block = (name) => lazy(() => import('./blocks').then(m => ({ default: m[name] })))

const MDX_COMPONENTS = {
  a: MdxLink,
  Chart:    lazy(() => import('./Chart')),
  Stats:    block('Stats'),
  Figure:   block('Figure'),
  Gallery:  block('Gallery'),
  YouTube:  block('YouTube'),
  Callout:  block('Callout'),
  Redacted: block('Redacted'),
  RepoCard: block('RepoCard'),
}

const modules = new Map()

function loadModule(loader) {
  if (!modules.has(loader)) modules.set(loader, loader())
  return modules.get(loader)
}

function Loaded({ loader }) {
  const mod = use(loadModule(loader))
  return createElement(mod.default, { components: MDX_COMPONENTS })
}

export function MdxBody({ loader }) {
  return (
    <div className="entry-body">
      <Suspense fallback={<p className="entry-body-loading">retrieving file…</p>}>
        <Loaded loader={loader} />
      </Suspense>
    </div>
  )
}
