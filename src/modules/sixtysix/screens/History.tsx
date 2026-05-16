import { useSixtysixStore } from '../store/sixtysix.store'
import { phaseName } from '../lib/arcLogic'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'

// ─── History ──────────────────────────────────────────────────────────────────

export default function History() {
  const { arc, setCurrentScreen } = useSixtysixStore()

  const arcMarks = arc ? arc.marks : 0
  const progressPct = arc ? Math.min(100, (arc.currentDay / 66) * 100) : 0

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 70,
        overflowY: 'auto',
        padding: '40px 56px 100px',
      }}
    >
      {/* Back header */}
      <button
        onClick={() => setCurrentScreen('habits')}
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: fg40,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 32,
        }}
      >
        ← HABITS
      </button>

      {/* Title */}
      <h1
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 42,
          fontWeight: 400,
          color: '#fff',
          margin: '0 0 40px',
          lineHeight: 1.1,
        }}
      >
        History.
      </h1>

      {/* Current arc card */}
      {arc && (
        <div
          style={{
            border: '1px solid rgba(255,255,255,0.12)',
            padding: 28,
            marginBottom: 48,
          }}
        >
          {/* Arc label */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.32em',
              color: fg40,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Arc One · In Progress
          </div>

          {/* Start date */}
          <div
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 18,
              color: fg60,
              marginBottom: 4,
            }}
          >
            Started {formatDate(arc.startDate)}
          </div>

          {/* Phase */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.2em',
              color: fg25,
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            {phaseName(arc.phase)} Phase
          </div>

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 1,
              background: 'rgba(255,255,255,0.08)',
              marginBottom: 16,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                height: '100%',
                width: `${progressPct}%`,
                background: '#fff',
                transition: 'width 600ms ease',
              }}
            />
          </div>

          {/* Stats */}
          <div
            style={{
              fontFamily: mono,
              fontSize: 10,
              letterSpacing: '0.2em',
              color: fg40,
              textTransform: 'uppercase',
            }}
          >
            Day {arc.currentDay} / 66 · {arcMarks} Marks
          </div>
        </div>
      )}

      {/* Locked zone */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          paddingTop: 24,
        }}
      >
        {/* 66 circle */}
        <div
          style={{
            width: 66,
            height: 66,
            borderRadius: '50%',
            border: `1px solid rgba(255,255,255,0.14)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 14,
              color: fg25,
              letterSpacing: '0.04em',
            }}
          >
            66
          </span>
        </div>

        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.24em',
            color: fg25,
            textTransform: 'uppercase',
            margin: 0,
            textAlign: 'center',
          }}
        >
          No past arcs. Not yet.
        </p>

        <p
          style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 16,
            color: fg25,
            margin: 0,
            textAlign: 'center',
          }}
        >
          Return at Day 66.
        </p>
      </div>
    </div>
  )
}
