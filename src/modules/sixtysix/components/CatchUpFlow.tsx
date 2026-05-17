import { useState, useEffect, useCallback } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import { todayString } from '../lib/arcLogic'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

interface CatchUpFlowProps {
  daysAway: number
  onContinue: () => void
}

export default function CatchUpFlow({ daysAway, onContinue }: CatchUpFlowProps) {
  const { arc, habits, logs, logHabit, logHonestMiss, dismissDayComplete, dayBeginsHour } = useSixtysixStore()

  const today = todayString(dayBeginsHour)

  // Build the list of dates to present (max 3 missed days, oldest first)
  const missedCount = daysAway - 1 // daysAway includes today, missed = gap
  const datesToShow: string[] = []
  const autoMissDates: string[] = []

  for (let i = missedCount; i >= 1; i--) {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (!arc || ds < arc.startDate) continue
    if (i > 3) {
      autoMissDates.push(ds)
    } else {
      datesToShow.push(ds)
    }
  }

  // Auto-miss habits on old dates (> 3 days ago) on mount
  useEffect(() => {
    if (!arc) return
    const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
    autoMissDates.forEach(date => {
      activeHabits.forEach(h => {
        const alreadyLogged = logs.find(l => l.habitId === h.id && l.date === date && l.arcId === arc.id)
        if (!alreadyLogged) {
          logHonestMiss(h.id, 'auto', date)
        }
      })
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [dayIndex, setDayIndex] = useState(0)
  const [selections, setSelections] = useState<Record<string, 'done' | 'miss'>>({})

  const handleNext = useCallback(() => {
    if (!arc) return
    const currentDate = datesToShow[dayIndex]
    const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)

    activeHabits.forEach(h => {
      const sel = selections[h.id] ?? 'miss'
      if (sel === 'done') {
        logHabit(h.id, h.target, currentDate)
      } else {
        const alreadyLogged = logs.find(l => l.habitId === h.id && l.date === currentDate && l.arcId === arc.id)
        if (!alreadyLogged) {
          logHonestMiss(h.id, '', currentDate)
        }
      }
    })

    if (dayIndex >= datesToShow.length - 1) {
      dismissDayComplete()
      onContinue()
    } else {
      setDayIndex(d => d + 1)
      setSelections({})
    }
  }, [arc, habits, logs, datesToShow, dayIndex, selections, logHabit, logHonestMiss, dismissDayComplete, onContinue])

  if (!arc) return null

  const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)

  // No days to step through — simple welcome back
  if (datesToShow.length === 0) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 85, background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 48px',
        animation: 'fade-in 400ms ease both',
      }}>
        <div style={{
          fontFamily: mono, fontSize: 10, letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
          marginBottom: 28,
        }}>
          WELCOME BACK
        </div>
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 'clamp(26px, 4vw, 38px)',
          color: '#fff', textAlign: 'center',
          lineHeight: 1.3, maxWidth: 520, marginBottom: 56,
        }}>
          The arc is still yours.
        </div>
        <button
          onClick={onContinue}
          style={{
            width: 'min(400px, 100%)', border: '1px solid #fff',
            background: 'transparent', padding: '20px 32px', cursor: 'pointer',
            fontFamily: mono, fontSize: 11, letterSpacing: '0.36em',
            textTransform: 'uppercase', color: '#fff',
          }}
        >
          Continue
        </button>
      </div>
    )
  }

  const currentDate = datesToShow[dayIndex]
  const isLastDay = dayIndex === datesToShow.length - 1
  const displayDate = new Date(currentDate + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'short', day: 'numeric',
  })

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 85, background: '#000',
      display: 'flex', flexDirection: 'column',
      padding: 'env(safe-area-inset-top) 0 env(safe-area-inset-bottom)',
      animation: 'fade-in 400ms ease both',
    }}>
      {/* Header */}
      <div style={{
        padding: '28px 24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          WELCOME BACK · {dayIndex + 1} OF {datesToShow.length}
        </div>
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 'clamp(22px, 3vw, 30px)',
          color: '#fff', lineHeight: 1.3,
        }}>
          {displayDate}
        </div>
        <div style={{
          fontFamily: sans, fontSize: 12, fontWeight: 300,
          color: 'rgba(255,255,255,0.40)', marginTop: 8,
        }}>
          What happened that day?
        </div>
      </div>

      {/* Habit list */}
      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '8px 24px' }}>
        {activeHabits.map(h => {
          const sel = selections[h.id] ?? null
          const isDone = sel === 'done'
          return (
            <div
              key={h.id}
              style={{
                display: 'flex', alignItems: 'center',
                gap: 16, padding: '14px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer', minHeight: 60,
              }}
              onClick={() => setSelections(s => ({
                ...s,
                [h.id]: s[h.id] === 'done' ? 'miss' : 'done',
              }))}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setSelections(s => ({
                ...s,
                [h.id]: s[h.id] === 'done' ? 'miss' : 'done',
              }))}
            >
              {/* Toggle circle */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                border: isDone ? '1px solid #fff' : '1px solid rgba(255,255,255,0.20)',
                background: isDone ? '#fff' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 250ms ease',
              }}>
                {isDone && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <polyline points="2,6 5,9 10,3" stroke="#000" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Name + status */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: sans, fontSize: 14,
                  color: isDone ? 'rgba(255,255,255,0.40)' : '#fff',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  transition: 'color 250ms ease',
                }}>
                  {h.name}
                </div>
                <div style={{
                  fontFamily: mono, fontSize: 8, letterSpacing: '0.24em',
                  color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                  marginTop: 4,
                }}>
                  {isDone ? 'DONE' : sel === 'miss' ? 'MISSED' : 'TAP TO MARK DONE'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        flex: '0 0 auto',
        padding: '16px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontFamily: mono, fontSize: 8, letterSpacing: '0.20em',
          color: 'rgba(255,255,255,0.20)', textTransform: 'uppercase',
          marginBottom: 12, textAlign: 'center',
        }}>
          Unmarked habits count as honest misses
        </div>
        <button
          onClick={handleNext}
          style={{
            width: '100%', border: '1px solid #fff',
            background: 'transparent', color: '#fff',
            fontFamily: mono, fontSize: 11, letterSpacing: '0.36em',
            textTransform: 'uppercase', padding: '18px 32px',
            cursor: 'pointer',
          }}
        >
          {isLastDay ? 'DONE — CONTINUE' : 'NEXT DAY →'}
        </button>
      </div>
    </div>
  )
}
