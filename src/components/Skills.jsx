import { motion } from 'framer-motion'
import {
  CplusplusPlain,
  CsharpPlain,
  JavaPlain,
  PythonPlain,
  UnityPlain,
  UnrealengineOriginal,
  BlenderOriginal,
  DjangoPlain,
  AzuresqldatabasePlain,
} from 'devicons-react'

// Wrapper to force fill color on icons that don't accept a color prop
function ForcedColorIcon({ Icon, size }) {
  return (
    <span className="forced-icon-color">
      <Icon size={size} />
    </span>
  )
}

// ── Data ───────────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: 'Languages',
    items: [
      { name: 'C++',    render: (s) => <CplusplusPlain size={s} color="currentColor" />,       tooltip: 'Data Structures and Unreal Engine' },
      { name: 'C#',     render: (s) => <CsharpPlain size={s} color="currentColor" />,           tooltip: 'All of my Unity Scripts' },
      { name: 'Java',   render: (s) => <JavaPlain size={s} color="currentColor" />,             tooltip: 'Good ol\' CS 124' },
      { name: 'Python', render: (s) => <PythonPlain size={s} color="currentColor" />,           tooltip: 'Data analysis, Linear algebra, Computer vision research' },
    ],
  },
  {
    label: 'Tools & Frameworks',
    items: [
      { name: 'Unity',          render: (s) => <UnityPlain size={s} color="currentColor" />,                tooltip: 'What haven\'t I used Unity for' },
      { name: 'Unreal Engine',  render: (s) => <ForcedColorIcon Icon={UnrealengineOriginal} size={s} />,    tooltip: 'Game Dev coursework' },
      { name: 'Blender',        render: (s) => <ForcedColorIcon Icon={BlenderOriginal} size={s} />,         tooltip: 'Asset creation & texturing for the ILL' },
      { name: 'Django',         render: (s) => <DjangoPlain size={s} color="currentColor" />,               tooltip: 'A web app I built and will not elaborate on' },
      { name: 'SQL',            render: (s) => <AzuresqldatabasePlain size={s} color="currentColor" />,     tooltip: 'SportsBot\'s backbone' },
    ],
  },
]

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

function SkillItem({ item }) {
  return (
    <motion.div className="skill-item-wrap" variants={gemVariant}>
      <div className="skill-gem-outer">
        <motion.div
          className="skill-icon-box"
          whileHover={{ y: -10, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {item.render('48px')}
        </motion.div>

        <div className="skill-tooltip" role="tooltip">
          {item.tooltip}
          <div className="skill-tooltip-arrow" />
        </div>
      </div>

      <span className="skill-label">{item.name}</span>
    </motion.div>
  )
}

// ── Skill group ────────────────────────────────────────────────────────

function SkillGroup({ group }) {
  return (
    <div>
      <motion.p
        className="skill-group-label font-mono text-xs tracking-[0.22em] uppercase mb-5"
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
          <SkillItem key={item.name} item={item} />
        ))}
      </motion.div>
    </div>
  )
}

// ── Section ────────────────────────────────────────────────────────────

export function Skills() {
  return (
    <section
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
