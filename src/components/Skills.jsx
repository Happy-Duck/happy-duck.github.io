import { motion } from 'framer-motion'
// Per-icon imports — the package index is CJS and pulls in every icon (~10 MB)
import CplusplusPlain        from 'devicons-react/lib/icons/CplusplusPlain'
import CsharpPlain           from 'devicons-react/lib/icons/CsharpPlain'
import JavaPlain             from 'devicons-react/lib/icons/JavaPlain'
import PythonPlain           from 'devicons-react/lib/icons/PythonPlain'
import UnityPlain            from 'devicons-react/lib/icons/UnityPlain'
import UnrealengineOriginal  from 'devicons-react/lib/icons/UnrealengineOriginal'
import BlenderOriginal       from 'devicons-react/lib/icons/BlenderOriginal'
import DjangoPlain           from 'devicons-react/lib/icons/DjangoPlain'
import AzuresqldatabasePlain from 'devicons-react/lib/icons/AzuresqldatabasePlain'
import GitOriginal           from 'devicons-react/lib/icons/GitOriginal'
import PytorchOriginal       from 'devicons-react/lib/icons/PytorchOriginal'
import { SKILL_GROUPS as GROUPS } from '../content/index.js'

// Wrapper to force fill color on icons that don't accept a color prop
function ForcedColorIcon({ Icon, size }) {
  return (
    <span className="forced-icon-color">
      <Icon size={size} />
    </span>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────
// Names and tooltips live in src/content/skills.js; this list supplies the
// icon for each skill id. A skill needs a line in both places.

const ICONS = {
  cpp:     (s) => <CplusplusPlain size={s} color="currentColor" />,
  csharp:  (s) => <CsharpPlain size={s} color="currentColor" />,
  java:    (s) => <JavaPlain size={s} color="currentColor" />,
  python:  (s) => <PythonPlain size={s} color="currentColor" />,
  unity:   (s) => <UnityPlain size={s} color="currentColor" />,
  unreal:  (s) => <ForcedColorIcon Icon={UnrealengineOriginal} size={s} />,
  blender: (s) => <ForcedColorIcon Icon={BlenderOriginal} size={s} />,
  django:  (s) => <DjangoPlain size={s} color="currentColor" />,
  sql:     (s) => <AzuresqldatabasePlain size={s} color="currentColor" />,
  git:     (s) => <ForcedColorIcon Icon={GitOriginal} size={s} />,
  pytorch: (s) => <ForcedColorIcon Icon={PytorchOriginal} size={s} />,
}

// ── Animation variants ─────────────────────────────────────────────────

const headerStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const headerItem = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const groupContainer = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const gemVariant = {
  hidden: { opacity: 0, y: 36 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] } },
}

// ── Skill item ─────────────────────────────────────────────────────────
// An icon, its name, and a tooltip on hover or keyboard focus. Not a
// control: pressing one used to send a sonar ping, outline the cards
// that used the skill, and list them in a line underneath. The owner had
// that turned off (2026-11-15); don't bring it back.

function SkillItem({ item }) {
  return (
    <motion.div className="skill-item-wrap" variants={gemVariant}>
      <span className="skill-gem-outer" tabIndex={0} data-no-ping>
        <span className="skill-icon-box">
          {ICONS[item.id]?.('48px')}
        </span>

        <span className="skill-tooltip" role="tooltip">
          {item.tooltip}
          <span className="skill-tooltip-arrow" />
        </span>
      </span>

      <span className="skill-label">{item.name}</span>
    </motion.div>
  )
}

// ── Skill group ────────────────────────────────────────────────────────

function SkillGroup({ group }) {
  return (
    <div>
      <motion.p
        className="skill-group-label text-sm font-semibold mb-5"
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        viewport={{ once: true }}
      >
        {group.label}
      </motion.p>

      <motion.div
        className="flex flex-wrap gap-6"
        variants={groupContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
      >
        {group.items.map(item => (
          <SkillItem key={item.id} item={item} />
        ))}
      </motion.div>
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Skills() {
  return (
    <section
      id="skills"
      data-waypoint="Skills"
      className="relative px-6 pb-28 pt-4 w-full max-w-6xl mx-auto"
      style={{ zIndex: 10 }}
    >
      {/* Section header */}
      <motion.div
        className="mb-12"
        variants={headerStagger}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
      >
        <motion.h2 variants={headerItem} className="section-heading font-black text-4xl sm:text-5xl tracking-tight leading-none mb-4">
          Skills
        </motion.h2>
        <motion.div variants={headerItem} className="section-rule h-px w-full" />
      </motion.div>

      {/* Groups */}
      <div className="flex flex-col gap-12">
        {GROUPS.map(group => (
          <SkillGroup key={group.label} group={group} />
        ))}
      </div>

    </section>
  )
}
