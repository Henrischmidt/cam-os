import React, { useState } from 'react'
import type { Arc, StreakBreakChoice } from '../store/sixtysix.store'
import { useSixtysixStore } from '../store/sixtysix.store'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StreakBreakRecoveryProps {
  arc: Arc
  onResolve: (choice: StreakBreakChoice) => void
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'
const fg18 = 'rgba(255,255,255,0.18)'
const rule = 'rgba(255,255,255,0.10)'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countWords(s: string): number {
  return s.trim().split(/\s+/).filter(w => w.length > 0).length
}

// ─── Rise-in animation delays ─────────────────────────────────────────────────
// Global CSS must include:
// @keyframes rise-in {
//   from { opacity: 0; transform: translateY(10px); }
//   to   { opacity: 1; transform: translateY(0); }
// }

function riseIn(delayMs: number): React.CSSProperties {
  return {
    animation: `rise-in 400ms cubic-bezier(0.16,1,0.3,1) ${delayMs}ms both`,
  }
}

// ─── HonestMissPanel ──────────────────────────────────────────────────────────

interface HonestMissPanelProps {
  onConfirm: (text: string) => void
}

function HonestMissPanel({ onConfirm }: HonestMissPanelProps) {
  const [text, setText] = useState('')
  const words = countWords(text)
  const minWords = 5

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
      <textarea
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What honestly happened yesterday?"
        rows={3}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${fg25}`,
          outline: 'none',
          resize: 'none',
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 16,
          color: '#fff',
          lineHeight: 1.5,
          padding: '8px 0',
          width: '100%',
        }}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: '0.2em',
            color: words >= minWords ? fg60 : fg25,
            transition: 'color 400ms ease-out',
          }}
        >
          {words} / {minWords} WORDS
        </span>
        <button
          onClick={() => words >= minWords && onConfirm(text)}
          disabled={words < minWords}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.36em',
            textTransform: 'uppercase' as const,
            background: 'transparent',
            border: `1px solid ${words >= minWords ? '#fff' : fg18}`,
            color: words >= minWords ? '#fff' : fg25,
            padding: '10px 20px',
            cursor: words >= minWords ? 'pointer' : 'not-allowed',
            transition: 'border-color 400ms ease-out, color 400ms ease-out',
          }}
        >
          LOG & CONTINUE
        </button>
      </div>
    </div>
  )
}

// ─── StreakBreakRecovery ───────────────────────────────────────────────────────

export default function StreakBreakRecovery({ arc, onResolve }: StreakBreakRecoveryProps) {
  const [honestOpen, setHonestOpen] = useState(false)
  const [cardHover, setCardHover] = useState(false)

  const logHonestMiss = useSixtysixStore(s => s.logHonestMiss)
  const habits = useSixtysixStore(s => s.habits)

  function handleHonestConfirm(text: string) {
    // Log honest miss for all active habits belonging to this arc
    const arcHabits = habits.filter(h => h.arcId === arc.id && h.active)
    arcHabits.forEach(h => logHonestMiss(h.id, text))
    onResolve('continue')
  }

  const optionBase: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderTop: `1px solid ${rule}`,
    padding: '20px 0',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 400ms ease-out',
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 80,
        overflowY: 'auto',
        padding: '60px 48px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
        }}
      >
        {/* Crumb */}
        <div
          style={{
            ...riseIn(50),
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: fg25,
            marginBottom: 20,
          }}
        >
          DAY {arc.currentDay} · YESTERDAY MISSED
        </div>

        {/* Heading */}
        <div
          style={{
            ...riseIn(150),
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 28,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: 20,
          }}
        >
          The streak broke. The arc continues.
        </div>

        {/* Body text */}
        <div
          style={{
            ...riseIn(250),
            fontFamily: sans,
            fontSize: 14,
            color: fg60,
            lineHeight: 1.7,
            marginBottom: 32,
          }}
        >
          Streaks are evidence of consistency. Their breaking is evidence of being human. Neither defines you.
        </div>

        {/* Honesty card */}
        <div
          style={{
            ...riseIn(350),
            border: `1px solid ${cardHover ? fg40 : rule}`,
            padding: 20,
            marginBottom: 40,
            transition: 'border-color 400ms ease-out',
            cursor: honestOpen ? 'default' : 'pointer',
          }}
          onMouseEnter={() => setCardHover(true)}
          onMouseLeave={() => setCardHover(false)}
          onClick={() => !honestOpen && setHonestOpen(true)}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#fff',
                  marginBottom: 8,
                }}
              >
                WAS YESTERDAY AN HONEST MISS?
              </div>
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 13,
                  color: fg40,
                  lineHeight: 1.5,
                }}
              >
                Write one line. The arc continues, the streak holds, the day is logged, not lost.
              </div>
            </div>
            {!honestOpen && (
              <span
                style={{
                  fontFamily: mono,
                  fontSize: 16,
                  color: fg40,
                  marginLeft: 16,
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                →
              </span>
            )}
          </div>

          {honestOpen && <HonestMissPanel onConfirm={handleHonestConfirm} />}
        </div>

        {/* Divider */}
        <div
          style={{
            ...riseIn(400),
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 0,
          }}
        >
          <div style={{ flex: 1, height: 1, background: rule }} />
          <span
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: fg40,
              whiteSpace: 'nowrap',
            }}
          >
            IF THE STREAK BROKE
          </span>
          <div style={{ flex: 1, height: 1, background: rule }} />
        </div>

        {/* Option 1 — Continue */}
        <button
          onClick={() => onResolve('continue')}
          style={{
            ...optionBase,
            ...riseIn(480),
            borderLeft: '3px solid #fff',
            paddingLeft: 20,
            background: 'rgba(255,255,255,0.03)',
            borderTop: `1px solid ${rule}`,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            CONTINUE — RESTART STREAK FROM DAY {arc.currentDay + 1}
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 11,
              color: fg40,
            }}
          >
            Default. Kindness.
          </span>
        </button>

        {/* Option 2 — Restart arc */}
        <button
          onClick={() => onResolve('restart')}
          style={{
            ...optionBase,
            ...riseIn(540),
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            RESTART ARC FROM DAY 1
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 11,
              color: fg40,
            }}
          >
            Hard Mode. Begin again.
          </span>
        </button>

        {/* Option 3 — End arc */}
        <button
          onClick={() => onResolve('end')}
          style={{
            ...optionBase,
            ...riseIn(600),
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: '#fff',
            }}
          >
            END THIS ARC, START FRESH
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 11,
              color: fg40,
            }}
          >
            New habits. New why. New day one.
          </span>
        </button>

        {/* Option 4 — Defer (ghost) */}
        <button
          onClick={() => onResolve('defer')}
          style={{
            ...optionBase,
            ...riseIn(660),
            borderTop: `1px solid ${rule}`,
            borderBottom: `1px solid ${rule}`,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 12,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: fg25,
            }}
          >
            DECIDE TOMORROW
          </span>
          <span
            style={{
              fontFamily: sans,
              fontSize: 11,
              color: fg18,
            }}
          >
            You don't have to choose right now.
          </span>
        </button>

        {/* Footer note */}
        <div
          style={{
            ...riseIn(720),
            fontFamily: mono,
            fontSize: 8,
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.18)',
            textTransform: 'uppercase',
            marginTop: 32,
          }}
        >
          Honest misses don't break streaks. Settings → Honesty.
        </div>
      </div>
    </div>
  )
}
