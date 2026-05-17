import { useState } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import { useIsMobile } from '../lib/useIsMobile'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"

export default function ArcComplete() {
  const { arc, habits, logs, setCurrentScreen } = useSixtysixStore()
  const isMobile = useIsMobile()
  const [letter, setLetter] = useState('')

  if (!arc) return null

  const arcHabits = habits.filter(h => h.arcId === arc.id && h.active)
  const arcLogs = logs.filter(l => l.arcId === arc.id)

  // Compute stats
  const allDates = new Set(arcLogs.map(l => l.date))
  const daysWithAllComplete = (() => {
    let count = 0
    for (const date of allDates) {
      const dayLogs = arcLogs.filter(l => l.date === date)
      const allDone = arcHabits.every(h =>
        dayLogs.find(l => l.habitId === h.id && (l.complete || l.honestMiss))
      )
      if (allDone) count++
    }
    return count
  })()

  const rate = allDates.size > 0
    ? Math.round((daysWithAllComplete / 66) * 100)
    : 0

  const stats = [
    { label: 'MARKS', value: arc.marks, unit: '' },
    { label: 'DAYS COMPLETE', value: daysWithAllComplete, unit: 'OF 66' },
    { label: 'COMPLETION RATE', value: rate, unit: '%' },
  ]

  function handleStartNewArc() {
    setCurrentScreen('onboarding')
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 95,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: isMobile
          ? 'calc(24px + env(safe-area-inset-top)) 20px calc(32px + env(safe-area-inset-bottom))'
          : '80px 56px 100px',
        animation: 'scale-in 600ms cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      {/* Dot matrix */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}>

        {/* Header */}
        <div
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.36em',
            color: 'rgba(255,255,255,0.30)',
            textTransform: 'uppercase',
            marginBottom: 24,
            textAlign: 'center',
          }}
        >
          ARC COMPLETE · DAY 66
        </div>

        <div
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 'clamp(40px, 6vw, 64px)',
            color: '#fff',
            textAlign: 'center',
            lineHeight: 1.0,
            marginBottom: 56,
          }}
        >
          Locked in.
        </div>

        {/* Identity read-back */}
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '32px 40px',
            marginBottom: 48,
          }}
        >
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.30)',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            WHO YOU BECAME
          </div>
          <div
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 'clamp(18px, 2.5vw, 26px)',
              color: '#fff',
              lineHeight: 1.45,
            }}
          >
            You are now the kind of person who{' '}
            <em style={{ borderBottom: '1px solid rgba(255,255,255,0.30)' }}>
              {arc.identityStatement}
            </em>
            .
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
            marginBottom: isMobile ? 40 : 56,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '24px 20px',
                borderRight: !isMobile && i < 2 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                borderBottom: isMobile && i < 2 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 9,
                  letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.35)',
                  textTransform: 'uppercase',
                }}
              >
                {s.label}
              </div>
              <div style={{ fontFamily: mono, fontSize: 28, color: '#fff', letterSpacing: '-0.01em' }}>
                {s.value}
                {s.unit && (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 6 }}>
                    {s.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Letter to future self */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            LETTER TO FUTURE SELF
          </div>

          <textarea
            value={letter}
            onChange={e => setLetter(e.target.value)}
            placeholder="Write to the person you'll be at the next arc…"
            rows={7}
            style={{
              width: '100%',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              outline: 'none',
              resize: 'vertical',
              color: '#fff',
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 17,
              lineHeight: 1.7,
              padding: '20px 24px',
              boxSizing: 'border-box',
            }}
          />

          {letter.trim() && (
            <button
              onClick={() => {
                const blob = new Blob([letter], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `cam-os-arc-letter-day66.txt`
                a.click()
                URL.revokeObjectURL(url)
              }}
              style={{
                marginTop: 12,
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.40)',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                padding: '10px 20px',
                cursor: 'pointer',
              }}
            >
              Save Letter
            </button>
          )}
        </div>

        {/* Start new arc CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={handleStartNewArc}
            style={{
              width: '100%',
              border: '1px solid #fff',
              background: 'transparent',
              color: '#fff',
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              padding: '22px 32px',
              cursor: 'pointer',
            }}
          >
            Start New Arc
          </button>

          <button
            onClick={() => setCurrentScreen('history')}
            style={{
              width: '100%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.50)',
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              padding: '16px 32px',
              cursor: 'pointer',
            }}
          >
            View History
          </button>
        </div>
      </div>
    </div>
  )
}
