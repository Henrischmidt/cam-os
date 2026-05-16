import { useState, useEffect } from 'react'
import { milestoneOverlayData } from '../lib/arcLogic'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MilestoneOverlayProps {
  day: number
  onDismiss: () => void
}

// Animation states:
//  0 — pre-start (invisible, no pointer events)
//  1 — overlay fading in
//  2 — phase name letters staggering in
//  3 — hold: above/below text visible
//  4 — fading out → triggers onDismiss

type AnimState = 0 | 1 | 2 | 3 | 4

// ─── Component ────────────────────────────────────────────────────────────────

export default function MilestoneOverlay({ day, onDismiss }: MilestoneOverlayProps) {
  const [animState, setAnimState] = useState<AnimState>(0)

  const { above, name, below } = milestoneOverlayData(day)

  useEffect(() => {
    // Kick off immediately — state 1: fade in
    setAnimState(1)

    const t1 = setTimeout(() => setAnimState(2), 300)   // letters stagger in
    const t2 = setTimeout(() => setAnimState(3), 900)   // above/below appear
    const t3 = setTimeout(() => setAnimState(4), 2400)  // begin fade out
    const t4 = setTimeout(() => onDismiss(), 2800)      // call dismiss after fade

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      {/*
        letter-in keyframes must be present in global CSS:
        @keyframes letter-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: '#000',
          opacity: animState >= 1 && animState < 4 ? 1 : 0,
          transition: 'opacity 300ms ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: animState > 0 ? 'auto' : 'none',
        }}
      >
        {/* Above text — phase label */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 14,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.40)',
            textTransform: 'uppercase',
            opacity: animState >= 3 ? 1 : 0,
            transition: 'opacity 400ms ease',
            marginBottom: 24,
          }}
        >
          {above}
        </div>

        {/* Phase name with letter stagger */}
        <div
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 48,
            color: '#fff',
            lineHeight: 1,
          }}
        >
          {animState >= 2 &&
            name.split('').map((ch, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  animation: `letter-in 400ms cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both`,
                }}
              >
                {ch === ' ' ? ' ' : ch}
              </span>
            ))}
        </div>

        {/* Below copy */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.40)',
            textTransform: 'uppercase',
            opacity: animState >= 3 ? 1 : 0,
            transition: 'opacity 400ms ease',
            marginTop: 24,
            maxWidth: 400,
            textAlign: 'center',
          }}
        >
          {below}
        </div>

        {/* Tap to skip hint */}
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            bottom: 40,
            fontFamily: "'DM Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.3em',
            color: 'rgba(255,255,255,0.25)',
            textTransform: 'uppercase',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            opacity: animState >= 3 ? 1 : 0,
            transition: 'opacity 400ms ease',
          }}
        >
          TAP TO CONTINUE
        </button>
      </div>
    </>
  )
}
