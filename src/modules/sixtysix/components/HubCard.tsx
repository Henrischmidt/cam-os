import { useEffect } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import { todayString, phaseName, phaseNumber } from '../lib/arcLogic'
import { pullDailyCard } from '../lib/cardLogic'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

export default function HubCard() {
  const {
    arc,
    habits,
    logs,
    cards,
    dayBeginsHour,
    setTodayCard,
    setCurrentTab,
    setCurrentScreen,
  } = useSixtysixStore()

  useEffect(() => {
    if (!arc) return
    const today = todayString(dayBeginsHour)
    if (cards.lastPulledDate !== today) {
      const cardId = pullDailyCard(arc, cards)
      setTodayCard(cardId)
    }
  }, [arc, cards, dayBeginsHour, setTodayCard])

  if (!arc) return null

  const today = todayString(dayBeginsHour)
  const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
  const todayLogs = logs.filter(l => l.date === today && l.arcId === arc.id)
  const done = activeHabits.filter(h => todayLogs.find(l => l.habitId === h.id && l.complete)).length

  // Streak
  let streak = 0
  for (let i = 1; i <= arc.currentDay; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    const dayComplete = activeHabits.every(h =>
      logs.find(l => l.habitId === h.id && l.date === ds && (l.complete || l.honestMiss))
    )
    if (dayComplete) streak++
    else break
  }

  function goToHabits() {
    setCurrentTab('habits')
    setCurrentScreen('habits')
  }

  return (
    <div
      onClick={goToHabits}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') goToHabits() }}
      style={{
        border: '1px solid rgba(255,255,255,0.10)',
        padding: '28px 32px',
        cursor: 'pointer',
        maxWidth: 480,
        transition: 'border-color 300ms ease',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 20,
      }}>
        <span style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>
          THE 66
        </span>
        <span style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.28em',
          color: 'rgba(255,255,255,0.35)',
          textTransform: 'uppercase',
        }}>
          DAY {arc.currentDay} · {phaseName(arc.phase).toUpperCase()} {phaseNumber(arc.phase)}/4
        </span>
      </div>

      {/* Habit rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {activeHabits.map(h => {
          const log = todayLogs.find(l => l.habitId === h.id)
          const complete = log?.complete === true
          const isShoot = h.type === 'shoot'
          return (
            <div key={h.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}>
              <span style={{
                fontSize: 10,
                color: complete ? '#fff' : 'rgba(255,255,255,0.20)',
              }}>
                {complete ? '●' : '○'}
              </span>
              <span style={{
                fontFamily: sans,
                fontSize: 14,
                color: complete ? 'rgba(255,255,255,0.60)' : 'rgba(255,255,255,0.80)',
                flex: 1,
              }}>
                {h.name}
              </span>
              <span style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: complete ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.15)',
              }}>
                {complete ? (isShoot ? 'SHOT' : 'DONE') : (
                  h.type === 'toggle' || isShoot
                    ? '—'
                    : `${log?.value ?? 0}/${h.target}${h.unit ?? ''}`
                )}
              </span>
            </div>
          )
        })}
      </div>

      {/* Footer stats */}
      <div style={{
        display: 'flex',
        gap: 28,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 16,
      }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>TODAY</div>
          <div style={{ fontFamily: mono, fontSize: 18, color: '#fff' }}>{done}/{activeHabits.length}</div>
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>STREAK</div>
          <div style={{ fontFamily: mono, fontSize: 18, color: '#fff' }}>{streak}d</div>
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', marginBottom: 4 }}>MARKS</div>
          <div style={{ fontFamily: mono, fontSize: 18, color: '#fff' }}>{arc.marks}</div>
        </div>
        <div style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
          <span style={{
            fontFamily: serif,
            fontStyle: 'italic',
            fontSize: 13,
            color: 'rgba(255,255,255,0.25)',
          }}>
            Open →
          </span>
        </div>
      </div>
    </div>
  )
}
