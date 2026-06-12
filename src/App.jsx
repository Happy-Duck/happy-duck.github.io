import { MarineSnow    } from './components/MarineSnow'
import { Plankton      } from './components/Plankton'
import { RovLight      } from './components/RovLight'
import { WaterSurface  } from './components/WaterSurface'
import { CreatureLayer } from './components/creatures/CreatureLayer'
import { DepthGauge    } from './components/DepthGauge'
import { Hero          } from './components/Hero'
import { Experience    } from './components/Experience'
import { Skills        } from './components/Skills'
import { Projects      } from './components/Projects'
import { About         } from './components/About'
import { ContactSidebar } from './components/ContactSidebar'
import { DiveLog       } from './components/DiveLog'
import { Footer        } from './components/Footer'

export default function App() {
  return (
    <>
      {/* Skip link — first focusable element, keyboard/screen-reader only */}
      <a href="#main" className="skip-link">Skip to content</a>

      {/* ── Fixed backdrop layers (z 0–4) ─────────────────────────── */}
      {/* Smooth color-interpolated background */}
      <div className="ocean-backdrop" aria-hidden="true" />

      {/* Contact sidebar — persistent left edge */}
      <ContactSidebar />

      {/* Dive log — discovery journal, bottom-right */}
      <DiveLog />

      <div className="relative overflow-hidden">

        {/* Water surface — underwater perspective, only near surface (depth < 0.20) */}
        <WaterSurface />

        {/* Depth overlay gradients */}
        <div className="overlay-deep" />
        <div className="overlay-reef" />

        {/* Sea creatures — depth-zone aware */}
        <CreatureLayer />

        {/* Plankton — CSS-only, visible near surface (depth < 0.30) */}
        <Plankton />

        {/* Marine snow — CSS-only, fades in at depth > 0.35 */}
        <MarineSnow />

        {/* ROV headlight — darkness + cursor light cone in deep zones */}
        <RovLight />

        {/* Depth gauge — right edge, scroll-triggered */}
        <DepthGauge />

        {/* ── Page content (z 10) ────────────────────────────────── */}
        <main id="main">
          <Hero />
          <Projects />
          <Experience />
          <Skills />
          <About />
        </main>

      </div>

      {/* Footer — outside content div so ocean floor styles independently */}
      <Footer />
    </>
  )
}
