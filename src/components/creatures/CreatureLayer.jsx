// ── CreatureLayer — all creatures, fixed, full-screen ─────────────────
// Ordered by zone depth: sunlit → abyssal
import { ReefFish         } from './ReefFish'
import { SeaTurtle        } from './SeaTurtle'
import { Jellyfish        } from './Jellyfish'
import { Squid            } from './Squid'
import { Anglerfish       } from './Anglerfish'
import { DeepSeaFish      } from './DeepSeaFish'
import { GiantSquid       } from './GiantSquid'
import { AbyssalJellyfish } from './AbyssalJellyfish'
import { SnailFish        } from './SnailFish'
export function CreatureLayer() {
  return (
    <div
      className="creature-layer"
      style={{
        position:      'fixed',
        inset:         0,
        zIndex:        3,
        pointerEvents: 'none',
        overflow:      'hidden',
      }}
    >
      {/* Sunlit Zone (0.0–0.20) */}
      <ReefFish />
      <SeaTurtle />

      {/* Twilight Zone (0.12–0.45) */}
      <Jellyfish />
      <Squid />

      {/* Midnight Zone (0.30–0.65) */}
      <Anglerfish />
      <DeepSeaFish />

      {/* Abyssal Zone (0.55–0.90) */}
      <AbyssalJellyfish />
      <GiantSquid />
      <SnailFish />
    </div>
  )
}
