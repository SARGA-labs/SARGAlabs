'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useEffect, useState } from 'react'
import s from './design.module.scss'

const NAV = [
  { id: 'system', num: '01' },
  { id: 'architecture', num: '02' },
  { id: 'nomenclature', num: '03' },
  { id: 'colors', num: '04' },
  { id: 'typography', num: '05' },
  { id: 'spacing', num: '06' },
  { id: 'components', num: '07' },
  { id: 'patterns', num: '08' },
  { id: 'voice', num: '09' }
]

export default function DesignPage() {
  const { scrollYProgress } = useScroll()
  const [active, setActive] = useState('')
  const heroOp = useTransform(scrollYProgress, [0, 0.04], [1, 0])
  const heroSc = useTransform(scrollYProgress, [0, 0.04], [1, 0.92])

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-30% 0px -70% 0px' }
    )
    for (const n of NAV) {
      const el = document.getElementById(n.id)
      if (el) obs.observe(el)
    }
    return () => obs.disconnect()
  }, [])

  return (
    <div className={s.page}>
      <motion.div className={s.progress} style={{ scaleX: scrollYProgress }} />

      <nav className={s.side}>
        <div className={s.sideLogo}>S</div>
        <div className={s.sideNav}>
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() =>
                document
                  .getElementById(n.id)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className={active === n.id ? s.sideActive : s.sideLink}
            >
              {n.num}
            </button>
          ))}
        </div>
        <div className={s.sideSpec}>2.0</div>
      </nav>

      <main className={s.main}>
        <div className={s.heroWrap}>
          <motion.div
            className={s.hero}
            style={{ opacity: heroOp, scale: heroSc }}
          >
            <motion.h1
              className={s.heroTitle}
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              SARGA
              <br />
              SYSTEM
            </motion.h1>
            <motion.p
              className={s.heroSub}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              A SYSTEM FOR MAKING / 2026 / V2.0
            </motion.p>
          </motion.div>
        </div>

        <div className={s.content}>
          <Sec id="system" num="01" title="THE SYSTEM">
            <p className={s.lead}>
              SARGA is art, code, sound—one system, infinite outputs. We build
              like engineers. We ship like a label.
            </p>
            <div className={s.row}>
              <Card border="#f87171" title="NOT">
                An agency. A collective. A magazine.
              </Card>
              <Card border="#4ade80" title="YES">
                A modular studio. A publishing system. A frequency.
              </Card>
            </div>
            <Card title="AESTHETIC DNA">
              Chrome Hearts brutalism + Swiss grid discipline. Direct. No
              filler. Declarative statements. Specs over stories.
            </Card>
          </Sec>

          <Sec id="architecture" num="02" title="ARCHITECTURE">
            <div className={s.archRoot}>
              <span className={s.mono}>LEVEL 0</span>
              <h3 className={s.archName}>SARGA</h3>
              <p className={s.dim}>
                Master system. Owns worldview, standards, visual language.
              </p>
            </div>
            <div className={s.archGrid}>
              {[
                ['LABS', 'labs.sar.ga', 'Research, tools, builds.'],
                ['MUSIC', 'music.sar.ga', 'Sets, edits, originals. Indexed.'],
                ['CLOTH', 'cloth.sar.ga', 'Uniforms with intent.'],
                ['CLUB', 'club.sar.ga', 'Nights. Rooms. Rituals.'],
                ['LIFESTYLE', 'lifestyle.sar.ga', 'Objects and habits.'],
                ['SUPPLEMENT', 'supplement.sar.ga', 'Stacks for output.']
              ].map(([name, domain, desc]) => (
                <div key={name} className={s.archCard}>
                  <span className={s.mono}>LEVEL 1</span>
                  <h4>{name}</h4>
                  <p
                    className={s.dim}
                    style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}
                  >
                    {domain}
                  </p>
                  <p className={s.dim}>{desc}</p>
                </div>
              ))}
            </div>
          </Sec>

          <Sec id="nomenclature" num="03" title="NOMENCLATURE">
            <div className={s.row}>
              <div>
                <h4 className={s.label}>CASE RULES</h4>
                <ul className={s.ruleList}>
                  <li>
                    <strong>ALL CAPS</strong> — Division labels, status
                    indicators, section headers
                  </li>
                  <li>
                    <strong>lowercase</strong> — Subsection routes, body copy,
                    spec lines
                  </li>
                  <li
                    style={{ color: '#f87171', textDecoration: 'line-through' }}
                  >
                    Title Case — Never. Kills the vibe.
                  </li>
                </ul>
              </div>
              <div>
                <h4 className={s.label}>PATH SYNTAX</h4>
                <div className={s.code}>
                  SARGA / LABS / BUILD{'\n'}SARGA / MUSIC / SET / SET 014{'\n'}
                  SARGA / CLUB / NIGHT / RITUAL 01
                </div>
              </div>
            </div>
            <div className={s.row}>
              <Card title="USE">
                system, unit, module, signal, frequency, ritual, protocol, spec,
                build, proof, iteration, release, archive, index, grid,
                structure, output, density, noise, silence, tension
              </Card>
              <Card title="NEVER USE" border="#f87171">
                curate, craft, journey, story, experience, ecosystem, synergy,
                innovative, disruptive, next-level, cutting-edge, bespoke
              </Card>
            </div>
          </Sec>

          <Sec id="colors" num="04" title="COLOR SYSTEM">
            <p className={s.mono} style={{ marginBottom: 24 }}>
              BASE / 95% SURFACE AREA
            </p>
            <div className={s.colorRow}>
              <div
                className={s.colorSwatch}
                style={{
                  background: '#000',
                  color: '#fff',
                  border: '1px solid #fff'
                }}
              >
                <span className={s.colorVal}>#000</span>
                <span className={s.colorTok}>--ink</span>
              </div>
              <div
                className={s.colorSwatch}
                style={{ background: '#fff', color: '#000' }}
              >
                <span className={s.colorVal}>#FFF</span>
                <span className={s.colorTok}>--paper</span>
              </div>
            </div>
            <p className={s.mono} style={{ margin: '48px 0 24px' }}>
              SIGNAL / RARE — ONE PER LAYOUT
            </p>
            <div className={s.colorRow}>
              {[
                ['#0000ff', '--signal-sarga', '#fff'],
                ['#ff0000', '--signal-diyuksh', '#fff'],
                ['#00ff00', '--signal-notebook', '#000']
              ].map(([bg, tok, fg]) => (
                <div
                  key={tok}
                  className={s.colorSwatch}
                  style={{ background: bg, color: fg }}
                >
                  <span className={s.colorVal}>{bg?.toUpperCase()}</span>
                  <span className={s.colorTok}>{tok}</span>
                </div>
              ))}
            </div>
            <div className={s.ruleBox}>
              RULE: Never as background fills. Think LED indicator. 2px max
              width for rules.
            </div>
          </Sec>

          <Sec id="typography" num="05" title="TYPOGRAPHY">
            <div className={s.typeRow}>
              <div>
                <p className={s.mono}>PRIMARY</p>
                <p className={s.typeGiant}>Aa</p>
                <p className={s.dim}>System sans-serif stack</p>
              </div>
              <div>
                <p className={s.mono}>MONO</p>
                <p
                  className={s.typeGiant}
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  Aa
                </p>
                <p className={s.dim}>SF Mono / Cascadia Code</p>
              </div>
            </div>
            <div className={s.scaleWrap}>
              {(
                [
                  [
                    '--text-xs',
                    '11px',
                    'SPEC LINES',
                    {
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase' as const
                    }
                  ],
                  ['--text-sm', '13px', 'Body captions', { fontSize: 13 }],
                  [
                    '--text-base',
                    '15px',
                    'Standard body text',
                    { fontSize: 15 }
                  ],
                  ['--text-lg', '18px', 'Subheads', { fontSize: 18 }],
                  [
                    '--text-xl',
                    '24px',
                    'SECTION',
                    { fontSize: 24, fontWeight: 500 }
                  ],
                  [
                    '--text-2xl',
                    '32px',
                    'PAGE',
                    { fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em' }
                  ],
                  [
                    '--text-3xl',
                    '48px',
                    'HERO',
                    {
                      fontSize: 48,
                      fontWeight: 500,
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1
                    }
                  ]
                ] as const
              ).map(([tok, size, sample, style]) => (
                <div key={tok} className={s.scaleItem}>
                  <span className={s.scaleTok}>
                    {tok} ({size})
                  </span>
                  <span style={style as React.CSSProperties}>{sample}</span>
                </div>
              ))}
            </div>
          </Sec>

          <Sec id="spacing" num="06" title="GRID & SPACING">
            <div className={s.row}>
              <div style={{ flex: 1 }}>
                <h4 className={s.label}>8PX GRID</h4>
                <div className={s.spaceGrid}>
                  {[4, 8, 12, 16, 24, 32, 48, 64, 96, 128].map((v) => (
                    <div key={v} className={s.spaceRow}>
                      <span className={s.scaleTok}>{v}px</span>
                      <div
                        style={{
                          width: v,
                          height: 8,
                          background: 'var(--color-primary)',
                          opacity: 0.4
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <h4 className={s.label}>CONTAINERS</h4>
                <div className={s.code}>
                  --container-sm: 640px (essays){'\n'}--container-md: 896px
                  (default){'\n'}--container-lg: 1200px (wide){'\n'}
                  --container-xl: 1400px (full)
                </div>
                <h4 className={s.label} style={{ marginTop: 32 }}>
                  RULES
                </h4>
                <ul className={s.ruleList}>
                  <li>Everything aligns to 8px grid</li>
                  <li>Left-align default (center is rare + intentional)</li>
                  <li>More whitespace = more luxury</li>
                </ul>
              </div>
            </div>
          </Sec>

          <Sec id="components" num="07" title="COMPONENTS">
            <div className={s.compGrid}>
              <CompCard title="CAPSULE">
                <div className={s.compDemo}>
                  <button type="button" className={s.capsule}>
                    DEFAULT
                  </button>
                  <button
                    type="button"
                    className={s.capsule}
                    style={{ borderBottom: '2px solid #0000ff' }}
                  >
                    ACTIVE
                  </button>
                  <button
                    type="button"
                    className={s.capsule}
                    style={{ background: '#fff', color: '#000' }}
                  >
                    INVERTED
                  </button>
                </div>
                <p className={s.dim}>
                  32px height. 9999px radius. One active per view.
                </p>
              </CompCard>
              <CompCard title="BUTTONS">
                <div className={s.compDemo}>
                  <button
                    type="button"
                    style={{
                      padding: '12px 24px',
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    PRIMARY
                  </button>
                  <button
                    type="button"
                    style={{
                      padding: '12px 24px',
                      background: 'transparent',
                      color: '#fff',
                      border: '1px solid #fff',
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    SECONDARY
                  </button>
                </div>
                <p className={s.dim}>
                  Primary: filled. Secondary: outline. Hover inverts.
                </p>
              </CompCard>
              <CompCard title="SPEC LINE">
                <div
                  className={s.compDemo}
                  style={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <p className={s.mono}>SARGA / LABS / BUILD 001 / 1.0</p>
                  <p className={s.mono}>TIMESTAMP: 2026.04.12</p>
                </div>
                <p className={s.dim}>
                  Mono, 11px, 0.1em tracking, 60% opacity.
                </p>
              </CompCard>
              <CompCard title="INPUTS">
                <div
                  className={s.compDemo}
                  style={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    width: '100%'
                  }}
                >
                  {/* Motion Showcase: Framer-motion integration */}
                  <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
                    <h4 className="text-lg font-semibold mb-4">Motion & Animation</h4>
                    <p className="text-gray-600 mb-6">Using <code className="bg-yellow-100 p-1 rounded">framer-motion</code> to control complex entry/exit states.</p>
                    <button
                      className="transition duration-300 ease-in-out bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-[1.02]"
                      onClick={() => alert("Motion detected! This button animates on hover.")}
                    >
                      Hover Me (Motion Demo)
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="enter value..."
                  className={s.inputDemo}
                />
                {/* Advanced Input/Textarea Demo */}
                <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100">
                  <h4 className="text-lg font-semibold mb-4">Text Inputs & Responsiveness</h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    Testing input scaling across breakpoints. This container fluidly adjusts its internal spacing.
                  </p>
                  <input
                    type="text"
                    placeholder="enter value..."
                    className={s.inputDemo}
                  />
                  <textarea
                    placeholder="longer content..."
                    rows={2}
                    className={s.inputDemo}
                    style={{ resize: 'none', marginTop: '16px' }}
                  />
                </div>
              </CompCard>
              <CompCard title="CARDS">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
            >
              <div
                style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 8
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 500 }}>STANDARD</p>
              </div>
              <div
                style={{
                  padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 500 }}>GLASS</p>
              </div>
              <div
                style={{
                  padding: 16,
                  borderLeft: '2px solid #0000ff',
                  paddingLeft: 14
                }}
              >
                <p style={{ fontSize: 12, fontWeight: 500 }}>SIGNAL</p>
              </div>
            </div>
            <p className={s.dim}>No solid borders on structural cards.</p>
          </CompCard>
          <CompCard title="LOCKUP">
            <div
              className={s.compDemo}
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 24
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    letterSpacing: '-0.02em'
                  }}
                >
                  SARGA
                </span>
                <span
                  className={s.capsule}
                  style={{ pointerEvents: 'none' }}
                >
                  LABS
                </span>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
              >
                <span style={{ fontSize: 18, fontWeight: 500 }}>SARGA</span>
                <span
                  style={{ fontSize: 14, fontWeight: 500, opacity: 0.6 }}
                >
                  MUSIC
                </span>
              </div>
            </div>
            <p className={s.dim}>Wordmark + capsule OR stacked.</p>
          </CompCard>
        </div>
      </Sec>

      <Sec id="patterns" num="08" title="LAYOUT PATTERNS">
        <div className={s.row}>
          <Card title="PAGE STRUCTURE">
            <div
              style={{
                border: '1px solid rgba(255,255,255,0.2)',
                marginBottom: 12
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 11
                }}
              >
                <span>
                  SARGA <span style={{ opacity: 0.4 }}>LABS</span>
                </span>
                <span style={{ opacity: 0.4 }}>NAV</span>
              </div>
              <div
                style={{
                  padding: '40px 12px',
                  textAlign: 'center',
                  opacity: 0.2,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10
                }}
              >
                CONTENT
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  opacity: 0.4
                }}
              >
                SARGA / LABS / V1.0
              </div>
            </div>
            Header / Main (flex:1) / Footer (spec line)
          </Card>
          <Card title="INDEX PATTERN">
            <div style={{ fontSize: 12 }}>
              {[
                '001|GLYPH|WEBSITE',
                '002|DIYUK.SH|IDENTITY',
                '003|SARGA|SYSTEM'
              ].map((line) => {
                const [num, name, type] = line.split('|')
                return (
                  <div
                    key={line}
                    style={{
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      fontFamily: 'var(--font-mono)',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                   <span>{num}</span>
                    <span style={{ fontFamily: 'inherit' }}>{name}</span>
                    <span style={{ opacity: 0.4 }}>{type}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </Sec>

      <Sec id="voice" num="09" title="VOICE & TONE">
        <div className={s.voiceGrid}>
          {[
            ['01', 'Direct.', 'No preamble. Start with the point.'],
            ['02', 'Declarative.', 'Statements, not questions.'],
            ['03', 'Minimal.', 'If you can cut a word, cut it.'],
            ['04', 'Specific.', 'Numbers, specs, materials.'],
            ['05', 'Confident.', 'No apologies.']
          ].map(([num, t, d]) => (
            <div key={num} className={s.voiceItem}>
              <span className={s.voiceNum}>{num}</span>
              <div>
                <strong>{t}</strong>
                <span className={s.dim} style={{ marginLeft: 8 }}>
                  {d}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className={s.row} style={{ marginTop: 48 }}>
          <Card title="WE SOUND LIKE" border="#4ade80">
            {
              '"Built like software. Felt like music."\n"Signal over noise."\n"Structure over trend."\n"High fidelity, low light."'
            }
          </Card>
          <Card title="WE DON'T SOUND LIKE" border="#f87171">
            {
              '"We\'re passionate about creating..."\n"Join us on a journey..."\n"Crafted with love..."\n"Your one-stop shop..."'
            }
          </Card>
        </div>
      </Sec>

      <footer className={s.foot}>
        <p className={s.mono}>SARGA / SYSTEM / SPECS / END / 2.0</p>
      </footer>
      </div>
      </main>
    </div>
  )
}

function Sec({
  id,
  num,
  title,
  children
}: {
  id: string
  num: string
  title: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      id={id}
      className={s.sec}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={s.secHead}>
        <span className={s.secNum}>{num}</span>
        <h2 className={s.secTitle}>{title}</h2>
      </div>
      {children}
    </motion.section>
  )
}

function Card({
  title,
  children,
  border
}: {
  title: string
  children: React.ReactNode
  border?: string
}) {
  return (
    <div
      className={s.card}
      style={border ? { borderColor: border } : undefined}
    >
      <h4
        className={s.cardTitle}
        style={border ? { color: border } : undefined}
      >
        {title}
      </h4>
      <div className={s.cardBody}>{children}</div>
    </div>
  )
}

function CompCard({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className={s.compCard}>
      <div className={s.compHead}>{title}</div>
      <div className={s.compBody}>{children}</div>
    </div>
  )
}
