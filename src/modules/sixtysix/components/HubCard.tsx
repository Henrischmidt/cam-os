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
    morningRitualUrl,
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

  const hasRitual = morningRitualUrl.trim().length > 0

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
    <>
    {/* Morning ritual — Spotify quick-launch */}
    {hasRitual && (
      <a
        href={morningRitualUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '20px 24px',
          textDecoration: 'none',
          maxWidth: 480,
          transition: 'border-color 300ms ease',
          cursor: 'pointer',
        }}
      >
        {/* Spotify-ish icon */}
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.40)" strokeWidth="1" />
            <path d="M6 6.5 C8.5 5.5 11.5 6 13 7.5" stroke="rgba(255,255,255,0.60)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M6.5 9 C8.5 8.2 11 8.6 12.5 9.8" stroke="rgba(255,255,255,0.40)" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M7 11.5 C8.5 11 10.5 11.2 11.5 12" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            MORNING RITUAL
          </div>
          <div style={{
            fontFamily: serif, fontStyle: 'italic', fontSize: 16,
            color: 'rgba(255,255,255,0.80)',
          }}>
            Jim Rohn
          </div>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polyline points="5,3 9,7 5,11" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    )}

    {/* The 66 summary card */}
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
    </>
  )
}
