import { MarineSnow    } from './components/MarineSnow'
import { DeepParticles } from './components/DeepParticles'
import { Plankton      } from './components/Plankton'
import { RovLight      } from './components/RovLight'
import { SonarPing     } from './components/SonarPing'
import { BioTrail      } from './components/BioTrail'
import { FloorStamp    } from './components/FloorStamp'
import { WaterSurface  } from './components/WaterSurface'
import { Caustics      } from './components/Caustics'
import { CreatureLayer } from './components/creatures/CreatureLayer'
import { BoidSchool    } from './components/creatures/BoidSchool'
import { Whale         } from './components/creatures/Whale'
import { DepthGauge    } from './components/DepthGauge'
import { Hero          } from './components/Hero'
import { Experience    } from './components/Experience'
import { Skills        } from './components/Skills'
import { Projects      } from './components/Projects'
import { Education     } from './components/Education'
import { About        } from './components/About'
import { ContactSidebar } from './components/ContactSidebar'
import { DiveLog       } from './components/DiveLog'
import { Terminal      } from './components/Terminal'
import { XRDive        } from './components/XRDive'
import { GyroParallax  } from './components/GyroParallax'
import { Footer        } from './components/Footer'
import { PageLayer     } from './components/pages/PageLayer'
import { useEffect, useLayoutEffect, useMemo } from 'react'
import { usePath } from './lib/router'
import { setOceanPaused } from './lib/oceanPause'
import { matchRoute, entryAnchor } from './content/index.js'

// A visitor who lands directly on a page URL has never seen the dive.
// Remember which card that page belongs to, so closing the page drops
// them at that card's depth instead of the surface. Read once at load.
// Two candidates: the entry's own element, then its section (for entries
// that have a page but no card on the dive).
let pendingAnchor = (() => {
  const route = matchRoute(window.location.pathname)
  return route.entry ? [entryAnchor(route.kind, route.slug), route.kind] : null
})()

// Career cards render twice (desktop + mobile layouts) — take the one
// that is actually laid out
function findAnchor(name) {
  return [...document.querySelectorAll(`[data-entry-anchor="${name}"]`)]
    .find(n => n.offsetParent !== null)
}

function scrollToAnchor([own, section]) {
  const el = findAnchor(own) || findAnchor(section)
  el?.scrollIntoView({ block: 'center', behavior: 'instant' })
}

export default function App() {
  const path = usePath()
  const route = useMemo(() => matchRoute(path), [path])
  const pageOpen = route.kind !== 'home'

  // Layout effect: the pause flag and the anchor scroll must land in the
  // same commit that shows or hides the dive (View Transitions snapshot it)
  useLayoutEffect(() => {
    setOceanPaused(pageOpen)
    // Prerendered page shells paint a dark background before boot
    // (scripts/prerender.mjs); the app owns the background from here on
    document.getElementById('page-prepaint')?.remove()
    if (pageOpen || !pendingAnchor) return
    scrollToAnchor(pendingAnchor)
    pendingAnchor = null
  }, [pageOpen])

  // Direct landing: also move the dive to the entry's card right away, so
  // the water beside the sheet is the water at that depth. Layout is still
  // settling this early (fonts, the lazy course column), which is why the
  // scroll is repeated once and then again when the page closes (above).
  useEffect(() => {
    if (!pendingAnchor) return
    scrollToAnchor(pendingAnchor)
    const id = setTimeout(() => { if (pendingAnchor) scrollToAnchor(pendingAnchor) }, 900)
    return () => clearTimeout(id)
  }, [])

  return (
    <>
      {/* The dive — everything below stays mounted while a page is open:
          inert, its content hidden, its water still in view beside the
          sheet on a wide screen (see lib/oceanPause.js) */}
      <div className={pageOpen ? 'dive dive--stowed' : 'dive'} inert={pageOpen}>

      {/* Skip link — first focusable element, keyboard/screen-reader only */}
      <a href="#main" className="skip-link">Skip to content</a>

      {/* ── Fixed backdrop layers (z 0–4) ─────────────────────────── */}
      {/* Smooth color-interpolated background */}
      <div className="ocean-backdrop" aria-hidden="true" />

      {/* Contact sidebar — persistent left edge */}
      <ContactSidebar />

      {/* Dive log — discovery journal, bottom-right */}
      <DiveLog />

      {/* VR dive — appears only on XR-capable browsers */}
      <XRDive />

      {/* Tilt parallax — coarse pointers only */}
      <GyroParallax />

      <div className="relative overflow-hidden">

        {/* The water itself. Grouped so that, with a page open, just
            these layers stay in view beside the sheet (no content, no
            UI) — see styles/pages.css. The
            wrapper is unpositioned on purpose: it must not create a
            stacking context, the layers interleave with <main> by z-index. */}
        <div className="dive-ocean">

        {/* WebGL caustics — shader light-dance in the sunlit zone */}
        <Caustics />

        {/* Water surface — underwater perspective, only near surface (depth < 0.20) */}
        <WaterSurface />

        {/* Depth overlay gradients */}
        <div className="overlay-deep" />
        <div className="overlay-reef" />

        {/* Whale — rare background crossing event */}
        <Whale />

        {/* Sea creatures — depth-zone aware */}
        <CreatureLayer />

        {/* WebGPU fish school — additive; absent without navigator.gpu */}
        <BoidSchool />

        {/* Plankton — CSS-only, visible near surface (depth < 0.30) */}
        <Plankton />

        {/* Marine snow — CSS-only, fades in at depth > 0.35 */}
        <MarineSnow />

        {/* GPU marine snow — lit volumetrically by the ROV beam */}
        <DeepParticles />

        {/* Sonar ping rings — click open water. In here so a ping sent
            from a page (the engine controls) shows in the water beside it */}
        <SonarPing />

        </div>

        {/* ROV headlight — darkness + cursor light cone in deep zones */}
        <RovLight />

        {/* Bioluminescent cursor trail — stirred plankton at depth */}
        <BioTrail />

        {/* First-dive stamp — fires on reaching the floor */}
        <FloorStamp />

        {/* Depth gauge — right edge, scroll-triggered */}
        <DepthGauge />

        {/* ── Page content (z 10) ────────────────────────────────── */}
        {/* Recruiter's dive: internships first, then what got shipped,
            the toolbox, the coursework, and the personal log at the floor */}
        <main id="main">
          <Hero />
          <Experience />
          <Projects />
          <Skills />
          <Education />
          <About />
        </main>

      </div>

      {/* Footer — outside content div so ocean floor styles independently */}
      <Footer />

      </div>

      {/* Submarine terminal — type "cmd" or press `. Outside the dive so
          it keeps working on top of a page. */}
      <Terminal />

      {/* Expedition-file page — any route other than / */}
      {pageOpen && <PageLayer route={route} path={path} />}
    </>
  )
}
