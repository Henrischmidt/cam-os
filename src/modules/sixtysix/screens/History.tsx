import { useSixtysixStore } from '../store/sixtysix.store'
import { todayString } from '../lib/arcLogic'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'
const fg12 = 'rgba(255,255,255,0.12)'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// ─── Calendar grid ────────────────────────────────────────────────────────────

function CalendarGrid() {
  const { arc, habits, logs, dayBeginsHour } = useSixtysixStore()
  if (!arc) return null

  const today = todayString(dayBeginsHour)
  const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)

  // Build arc day → date map
  const startMs = new Date(arc.startDate + 'T12:00:00').getTime()
  const arcDates: string[] = Array.from({ length: arc.currentDay }, (_, i) =>
    new Date(startMs + i * 86400000).toISOString().slice(0, 10)
  )

  // Build status for each arc date
  const statusOf = (date: string): 'done' | 'partial' | 'miss' | 'today' | 'future' => {
    if (date === today) return 'today'
    if (date > today) return 'future'
    const dayLogs = logs.filter(l => l.date === date && l.arcId === arc.id)
    const doneCount = activeHabits.filter(h =>
      dayLogs.find(l => l.habitId === h.id && (l.complete || l.honestMiss))
    ).length
    if (doneCount === 0) return 'miss'
    if (doneCount >= activeHabits.length) return 'done'
    return 'partial'
  }

  // Group by week (Mon-based)
  // Find the Monday on or before arc.startDate
  const startDate = new Date(arc.startDate + 'T12:00:00')
  const dowOffset = (startDate.getDay() + 6) % 7 // Mon=0..Sun=6

  // Build full calendar grid — pad start with empty cells
  type Cell = { date: string; day: number } | null
  const cells: Cell[] = [
    ...Array.from({ length: dowOffset }, () => null),
    ...arcDates.map((date, i) => ({ date, day: i + 1 })),
  ]

  // Pad to full rows of 7
  while (cells.length % 7 !== 0) cells.push(null)

  const weeks: Cell[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div>
      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
        {DAYS.map((d, i) => (
          <div key={i} style={{
            fontFamily: mono, fontSize: 8, letterSpacing: '0.2em',
            color: fg25, textAlign: 'center', textTransform: 'uppercase',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {week.map((cell, ci) => {
              if (!cell) return <div key={ci} />
              const status = statusOf(cell.date)
              return (
                <div
                  key={ci}
                  title={`Day ${cell.day} — ${cell.date}`}
                  style={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: status === 'today'
                      ? '1px solid rgba(255,255,255,0.60)'
                      : `1px solid ${fg12}`,
                    background: status === 'done'
                      ? '#fff'
                      : status === 'partial'
                      ? 'rgba(255,255,255,0.25)'
                      : 'transparent',
                    transition: 'background 200ms ease',
                  }}
                >
                  <span style={{
                    fontFamily: mono, fontSize: 9,
                    color: status === 'done'
                      ? '#000'
                      : status === 'today'
                      ? '#fff'
                      : status === 'partial'
                      ? 'rgba(0,0,0,0.70)'
                      : fg25,
                  }}>
                    {cell.day}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginTop: 16, flexWrap: 'wrap' }}>
        {[
          { color: '#fff', label: 'All done' },
          { color: 'rgba(255,255,255,0.25)', label: 'Partial' },
          { color: 'transparent', border: '1px solid rgba(255,255,255,0.60)', label: 'Today' },
          { color: 'transparent', border: `1px solid ${fg12}`, label: 'Missed' },
        ].map(({ color, label, border }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 12, height: 12, background: color,
              border: border ?? `1px solid ${fg12}`,
            }} />
            <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.2em', color: fg25, textTransform: 'uppercase' }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── History screen ───────────────────────────────────────────────────────────

export default function History() {
  const { arc, setCurrentScreen } = useSixtysixStore()
  const arcMarks = arc ? arc.marks : 0

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000', zIndex: 70,
      overflowY: 'auto',
      padding: 'calc(env(safe-area-inset-top) + 20px) 20px calc(80px + env(safe-area-inset-bottom))',
    }}>
      <button
        onClick={() => setCurrentScreen('habits')}
        style={{
          fontFamily: mono, fontSize: 11, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: fg40,
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: 0, marginBottom: 32,
        }}
      >
        ← BACK
      </button>

      <h1 style={{
        fontFamily: serif, fontStyle: 'italic', fontSize: 42,
        fontWeight: 400, color: '#fff', margin: '0 0 8px', lineHeight: 1.1,
      }}>
        Calendar.
      </h1>

      {arc && (
        <div style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
          color: fg25, textTransform: 'uppercase', marginBottom: 36,
        }}>
          Day {arc.currentDay} of 66 · {arcMarks} marks
        </div>
      )}

      {arc ? (
        <CalendarGrid />
      ) : (
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 18, color: fg25, marginTop: 48,
        }}>
          Start your arc to see your calendar.
        </div>
      )}
    </div>
  )
}
