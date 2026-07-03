import { MarineSnow    } from './components/MarineSnow'
import { DeepParticles } from './components/DeepParticles'
import { Plankton      } from './components/Plankton'
import { RovLight      } from './components/RovLight'
import { SonarPing     } from './components/SonarPing'
import { BioTrail      } from './components/BioTrail'
import { FloorStamp    } from './components/FloorStamp'
import { WaterSurface  } from './components/WaterSurface'
import { WaterSim      } from './components/WaterSim'
import { Caustics      } from './components/Caustics'
import { CreatureLayer } from './components/creatures/CreatureLayer'
import { BoidSchool    } from './components/creatures/BoidSchool'
import { Whale         } from './components/creatures/Whale'
import { DepthGauge    } from './components/DepthGauge'
import { Hero          } from './components/Hero'
import { Experience    } from './components/Experience'
import { Skills        } from './components/Skills'
import { Projects      } from './components/Projects'
import { About         } from './components/About'
import { ContactSidebar } from './components/ContactSidebar'
import { DiveLog       } from './components/DiveLog'
import { Terminal      } from './components/Terminal'
import { XRDive        } from './components/XRDive'
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

      {/* Submarine terminal — type "cmd" or press ` */}
      <Terminal />

      {/* VR dive — appears only on XR-capable browsers */}
      <XRDive />

      <div className="relative overflow-hidden">

        {/* WebGL caustics — shader light-dance in the sunlit zone */}
        <Caustics />

        {/* Water surface — underwater perspective, only near surface (depth < 0.20) */}
        <WaterSurface />

        {/* Interactive ripple sim — cursor wakes + click drops */}
        <WaterSim />

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

        {/* ROV headlight — darkness + cursor light cone in deep zones */}
        <RovLight />

        {/* Sonar ping rings — click open water */}
        <SonarPing />

        {/* Bioluminescent cursor trail — stirred plankton at depth */}
        <BioTrail />

        {/* First-dive stamp — fires on reaching the floor */}
        <FloorStamp />

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
