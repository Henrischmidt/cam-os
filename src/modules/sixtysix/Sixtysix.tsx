import { useEffect } from 'react'
import { useSixtysixStore } from './store/sixtysix.store'
import { pullDailyCard } from './lib/cardLogic'
import { todayString, phaseName, phaseNumber } from './lib/arcLogic'
import HabitRow from './components/HabitRow'
import MarkGrid from './components/MarkGrid'
import DailyCard from './components/DailyCard'
import HabitDrawer from './components/HabitDrawer'
import MilestoneOverlay from './components/MilestoneOverlay'
import StreakBreakRecovery from './components/StreakBreakRecovery'
import DayCompleteModal from './components/DayCompleteModal'
import CatchUpFlow from './components/CatchUpFlow'

const RING_SIZE = 320

function progressRing(pct: number) {
  return {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: '50%',
    // --ring-pct is animated via @property in index.css; falls back to static gradient
    ['--ring-pct' as string]: `${pct}%`,
    position: 'relative' as const,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
  }
}

const riseIn = (delay: number): React.CSSProperties => ({
  animation: `rise-in 500ms cubic-bezier(0.16,1,0.3,1) ${delay}ms both`,
})

export default function Sixtysix() {
  const {
    arc,
    habits,
    logs,
    cards,
    drawerHabitId,
    showMilestone,
    milestoneDay,
    showStreakBreak,
    showDayComplete,
    showCatchUp,
    catchUpDaysAway,
    setDrawerHabitId,
    dismissMilestone,
    resolveStreakBreak,
    rolloverDay,
    setTodayCard,
    setCurrentScreen,
    setDayReflection,
    dismissDayComplete,
    resolveCatchUp,
    dayBeginsHour,
  } = useSixtysixStore()

  // On mount: rollover day + pull daily card
  useEffect(() => {
    rolloverDay()
  }, [rolloverDay])

  useEffect(() => {
    if (!arc) return
    const today = todayString(dayBeginsHour)
    if (cards.lastPulledDate !== today) {
      const cardId = pullDailyCard(arc, cards)
      setTodayCard(cardId)
    }
  }, [arc, cards, setTodayCard, dayBeginsHour])

  if (!arc) return null

  const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
  const today = todayString(dayBeginsHour)
  const todayLogs = logs.filter(l => l.date === today && l.arcId === arc.id)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().slice(0, 10)
  const yesterdayLogs = logs.filter(l => l.date === yesterdayStr && l.arcId === arc.id)

  const doneTodayCount = activeHabits.filter(h =>
    todayLogs.find(l => l.habitId === h.id && l.complete)
  ).length

  const todayPct = activeHabits.length > 0
    ? Math.round((doneTodayCount / activeHabits.length) * 100)
    : 0

  // Compute streak
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

  // Rate 30d
  const rate30 = (() => {
    let possible = 0; let done = 0
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const ds = d.toISOString().slice(0, 10)
      activeHabits.forEach(h => {
        possible++
        if (logs.find(l => l.habitId === h.id && l.date === ds && (l.complete || l.honestMiss))) done++
      })
    }
    return possible > 0 ? Math.round((done / possible) * 100) : 0
  })()

  const drawerHabit = drawerHabitId ? habits.find(h => h.id === drawerHabitId) ?? null : null

  // Overdue habit check (only valid if yesterday is within the arc)
  const overdueHabit = yesterdayStr >= arc.startDate ? activeHabits.find(h => {
    const yLog = yesterdayLogs.find(l => l.habitId === h.id)
    return !yLog || (!yLog.complete && !yLog.honestMiss)
  }) : undefined

  const statusText = (() => {
    if (doneTodayCount === activeHabits.length) return 'All done for today.'
    const overdueText = overdueHabit ? ` ${overdueHabit.name} overdue from yesterday.` : ''
    return `${doneTodayCount} of ${activeHabits.length} done.${overdueText}`
  })()

  return (
    <>
      {/* Dot matrix texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '14px 14px',
      }} />

      {/* Main scrollable content */}
      <div style={{ paddingBottom: 96, position: 'relative', zIndex: 1 }}>

        {/* Stage: 3-column grid */}
        <section style={{ ...riseIn(0),
          padding: '64px 56px 0',
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 56,
          alignItems: 'center',
        }}>
          {/* LHS: identity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifySelf: 'end', textAlign: 'right', maxWidth: 340 }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase',
            }}>
              DAY {arc.currentDay} · ARC 1 · {phaseName(arc.phase).toUpperCase()}
            </div>
            <div style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: 'italic', fontSize: 22, lineHeight: 1.35,
              color: 'rgba(255,255,255,0.60)', letterSpacing: '-0.005em',
            }}>
              By Day 66,<br />
              I'll be the kind of person who{' '}
              <em style={{ color: '#fff' }}>{arc.identityStatement}</em>.
            </div>
          </div>

          {/* Center: progress ring */}
          <div className="progress-ring" style={progressRing(todayPct)}>
            <div style={{
              position: 'absolute', inset: 12,
              background: '#000', borderRadius: '50%',
            }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 72, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                {todayPct}%
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10, letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
                marginTop: 10,
              }}>
                TODAY
              </div>
            </div>
          </div>

          {/* RHS: anchor stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifySelf: 'start' }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.3em',
              color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase',
            }}>TODAY</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>{doneTodayCount}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>OF {activeHabits.length} DONE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>{streak}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>DAY STREAK</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 22, color: arc.currentDay >= 7 ? '#fff' : 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>{arc.currentDay >= 7 ? `${rate30}%` : '—'}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>RATE · 30D</span>
            </div>
          </div>
        </section>

        {/* Phase header with tick bar */}
        <div style={{ ...riseIn(80),
          padding: '32px 56px 0',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <span style={{
            fontFamily: "'DM Mono',monospace",
            fontSize: 10, letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
          }}>
            {phaseName(arc.phase).toUpperCase()} · PHASE {phaseNumber(arc.phase)} OF 4
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
          <button
            onClick={() => setCurrentScreen('settings')}
            style={{
              fontFamily: "'DM Mono',monospace",
              fontSize: 9, letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            SETTINGS
          </button>
        </div>

        {/* Habits list */}
        <section style={{ padding: '40px 56px 0', ...riseIn(160) }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {activeHabits.map(habit => {
              const todayLog = todayLogs.find(l => l.habitId === habit.id)
              const yesterdayLog = yesterdayStr >= arc.startDate
                ? yesterdayLogs.find(l => l.habitId === habit.id)
                : null
              return (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  todayLog={todayLog}
                  yesterdayLog={yesterdayLog}
                  onClick={() => setDrawerHabitId(habit.id)}
                />
              )
            })}
            {/* Add habit row */}
            {activeHabits.length < 5 && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCurrentScreen('settings')}
                onKeyDown={e => { if (e.key === 'Enter') setCurrentScreen('settings') }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '44px 1fr auto auto',
                  columnGap: 22,
                  alignItems: 'center',
                  padding: '22px 0 20px',
                  borderTop: '1px solid rgba(255,255,255,0.10)',
                  borderBottom: '1px solid rgba(255,255,255,0.10)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 6,
                  border: '1px dashed rgba(255,255,255,0.10)',
                  display: 'grid', placeItems: 'center',
                  color: 'rgba(255,255,255,0.40)',
                }}>
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="9" y1="3" x2="9" y2="15" /><line x1="3" y1="9" x2="15" y2="9" />
                  </svg>
                </div>
                <span style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontStyle: 'italic', fontSize: 16,
                  color: 'rgba(255,255,255,0.40)',
                }}>Add habit</span>
              </div>
            )}
          </div>
          <div style={{
            marginTop: 22,
            fontFamily: "'Outfit',sans-serif",
            fontWeight: 300, fontSize: 13,
            color: 'rgba(255,255,255,0.50)', letterSpacing: '0.005em',
          }}>
            {statusText}
          </div>
        </section>

        {/* Aggregate mark grid */}
        <section style={{ padding: '64px 56px 0', display: 'flex', flexDirection: 'column', gap: 18, ...riseIn(240) }}>
          <MarkGrid
            logs={logs}
            habits={activeHabits}
            arcId={arc.id}
            arcStartDate={arc.startDate}
          />
        </section>

        {/* Stats section */}
        <section style={{ padding: '48px 56px 0', ...riseIn(320) }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}>
            {[
              { label: 'CURRENT STREAK', value: `${streak}`, unit: 'DAYS' },
              { label: 'MARKS', value: `${arc.marks}`, unit: 'TOTAL' },
              { label: arc.currentDay >= 7 ? 'RATE · 30 DAYS' : 'RATE · 30 DAYS', value: arc.currentDay >= 7 ? `${rate30}` : '—', unit: arc.currentDay >= 7 ? '%' : '' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: '22px 24px 20px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.10)' : 'none',
              }}>
                <div style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
                  marginBottom: 10,
                }}>{stat.label}</div>
                <div style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 26, color: arc.currentDay >= 7 || i < 2 ? '#fff' : 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em',
                }}>
                  {stat.value}
                  {stat.unit && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.40)', marginLeft: 6 }}>{stat.unit}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Daily card quote footer */}
          <DailyCard cardId={cards.todayCardId} />

          {/* Debug controls (DEV only) */}
          {import.meta.env.DEV && (
            <div style={{
              marginTop: 40,
              padding: '16px 0',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: 16,
            }}>
              <button
                onClick={() => useSixtysixStore.getState().debugAdvanceDay()}
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '8px 16px', cursor: 'pointer',
                }}
              >
                DEBUG: ADVANCE DAY
              </button>
              <button
                onClick={() => setCurrentScreen('onboarding')}
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '8px 16px', cursor: 'pointer',
                }}
              >
                DEBUG: RESET ONBOARDING
              </button>
              <button
                onClick={() => setCurrentScreen('arc-complete')}
                style={{
                  fontFamily: "'DM Mono',monospace",
                  fontSize: 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '8px 16px', cursor: 'pointer',
                }}
              >
                DEBUG: ARC COMPLETE
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Habit drawer */}
      <HabitDrawer
        habit={drawerHabit}
        arc={arc}
        logs={logs}
        onClose={() => setDrawerHabitId(null)}
      />

      {/* Catch-up flow — shown first if user was away 2+ days */}
      {showCatchUp && (
        <CatchUpFlow
          daysAway={catchUpDaysAway}
          onContinue={resolveCatchUp}
        />
      )}

      {/* Milestone overlay */}
      {showMilestone && milestoneDay !== null && (
        <MilestoneOverlay
          day={milestoneDay}
          onDismiss={dismissMilestone}
          onArcComplete={() => {
            dismissMilestone()
            setCurrentScreen('arc-complete')
          }}
        />
      )}

      {/* Streak break recovery */}
      {showStreakBreak && (
        <StreakBreakRecovery
          arc={arc}
          onResolve={resolveStreakBreak}
        />
      )}

      {/* Day complete — identity read + one-word reflection */}
      {showDayComplete && arc && (
        <DayCompleteModal
          identityStatement={arc.identityStatement}
          onSubmit={setDayReflection}
          onDismiss={dismissDayComplete}
        />
      )}
    </>
  )
}
