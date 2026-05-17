import { useEffect, useState } from 'react'
import { useSixtysixStore } from './store/sixtysix.store'
import type { HabitType } from './store/sixtysix.store'
import { pullDailyCard } from './lib/cardLogic'
import { todayString, phaseName, phaseNumber } from './lib/arcLogic'
import { useIsMobile } from './lib/useIsMobile'
import HabitRow from './components/HabitRow'
import MarkGrid from './components/MarkGrid'
import DailyCard from './components/DailyCard'
import HabitDrawer from './components/HabitDrawer'
import MilestoneOverlay from './components/MilestoneOverlay'
import StreakBreakRecovery from './components/StreakBreakRecovery'
import DayCompleteModal from './components/DayCompleteModal'
import CatchUpFlow from './components/CatchUpFlow'

function progressRing(pct: number): React.CSSProperties {
  return {
    width: 'clamp(180px, 56vw, 320px)',
    height: 'clamp(180px, 56vw, 320px)',
    borderRadius: '50%',
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

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

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
    addHabit,
  } = useSixtysixStore()

  const isMobile = useIsMobile()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitType, setNewHabitType] = useState<HabitType>('toggle')

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

  const overdueHabit = yesterdayStr >= arc.startDate ? activeHabits.find(h => {
    const yLog = yesterdayLogs.find(l => l.habitId === h.id)
    return !yLog || (!yLog.complete && !yLog.honestMiss)
  }) : undefined

  const statusText = (() => {
    if (doneTodayCount === activeHabits.length) return 'All done for today.'
    const overdueText = overdueHabit ? ` ${overdueHabit.name} overdue from yesterday.` : ''
    return `${doneTodayCount} of ${activeHabits.length} done.${overdueText}`
  })()

  const hPad = isMobile ? '20px' : '56px'

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

        {/* Stage: responsive */}
        <section style={{
          ...riseIn(0),
          padding: `${isMobile ? '32px' : '64px'} ${hPad} 0`,
          ...(isMobile
            ? { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }
            : { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 56, alignItems: 'center' }
          ),
        }}>
          {/* LHS: identity — order 3 on mobile */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            ...(isMobile
              ? { order: 3, textAlign: 'center' as const, alignSelf: 'stretch' as const }
              : { justifySelf: 'end' as const, textAlign: 'right' as const, maxWidth: 340 }
            ),
          }}>
            <div style={{
              fontFamily: mono,
              fontSize: 10, letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase',
            }}>
              DAY {arc.currentDay} · ARC 1 · {phaseName(arc.phase).toUpperCase()}
            </div>
            <div style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: isMobile ? 17 : 22,
              lineHeight: 1.35,
              color: 'rgba(255,255,255,0.60)', letterSpacing: '-0.005em',
            }}>
              By Day 66,<br />
              I'll be the kind of person who{' '}
              <em style={{ color: '#fff' }}>{arc.identityStatement}</em>.
            </div>
          </div>

          {/* Center: progress ring — order 1 on mobile */}
          <div className="progress-ring" style={{ ...progressRing(todayPct), ...(isMobile ? { order: 1 } : {}) }}>
            <div style={{
              position: 'absolute', inset: 12,
              background: '#000', borderRadius: '50%',
            }} />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
              <div style={{
                fontFamily: mono,
                fontSize: 'clamp(40px, 12vw, 72px)', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1,
              }}>
                {todayPct}%
              </div>
              <div style={{
                fontFamily: mono,
                fontSize: 10, letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
                marginTop: 10,
              }}>
                TODAY
              </div>
            </div>
          </div>

          {/* RHS: stats — order 2 on mobile, horizontal row */}
          <div style={{
            display: 'flex',
            ...(isMobile
              ? { order: 2, flexDirection: 'row' as const, gap: 28, justifyContent: 'center' as const, alignItems: 'center' as const }
              : { flexDirection: 'column' as const, gap: 14, justifySelf: 'start' as const }
            ),
          }}>
            {isMobile ? (
              <>
                {/* Mobile compact stats row */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>{doneTodayCount}</span>
                  <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const }}>OF {activeHabits.length}</span>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.10)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: '#fff', letterSpacing: '-0.01em', lineHeight: 1 }}>{streak}</span>
                  <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const }}>STREAK</span>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.10)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: arc.currentDay >= 7 ? '#fff' : 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em', lineHeight: 1 }}>{arc.currentDay >= 7 ? `${rate30}%` : '—'}</span>
                  <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.26em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' as const }}>30D</span>
                </div>
              </>
            ) : (
              <>
                {/* Desktop vertical stats */}
                <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>TODAY</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>{doneTodayCount}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>OF {activeHabits.length} DONE</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: '#fff', letterSpacing: '-0.01em' }}>{streak}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>DAY STREAK</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                  <span style={{ fontFamily: mono, fontSize: 22, color: arc.currentDay >= 7 ? '#fff' : 'rgba(255,255,255,0.25)', letterSpacing: '-0.01em' }}>{arc.currentDay >= 7 ? `${rate30}%` : '—'}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: '0.28em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase' }}>RATE · 30D</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Phase header with tick bar */}
        <div style={{ ...riseIn(80),
          padding: `32px ${hPad} 0`,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <span style={{
            fontFamily: mono,
            fontSize: 10, letterSpacing: '0.32em',
            color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
          }}>
            {phaseName(arc.phase).toUpperCase()} · PHASE {phaseNumber(arc.phase)} OF 4
          </span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.10)' }} />
          <button
            onClick={() => setCurrentScreen('settings')}
            style={{
              fontFamily: mono,
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
        <section style={{ padding: `40px ${hPad} 0`, ...riseIn(160) }}>
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
            {/* Add habit */}
            {activeHabits.length < 5 && !showAddForm && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowAddForm(true)}
                onKeyDown={e => { if (e.key === 'Enter') setShowAddForm(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 0',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 6,
                  border: '1px dashed rgba(255,255,255,0.12)',
                  display: 'grid', placeItems: 'center',
                  color: 'rgba(255,255,255,0.35)', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="7" y1="2" x2="7" y2="12" /><line x1="2" y1="7" x2="12" y2="7" />
                  </svg>
                </div>
                <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 15, color: 'rgba(255,255,255,0.35)' }}>
                  Add habit
                </span>
              </div>
            )}
            {activeHabits.length < 5 && showAddForm && (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.08)',
                padding: '20px 0',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <input
                  autoFocus
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="Habit name"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && newHabitName.trim()) {
                      addHabit({ name: newHabitName.trim(), type: newHabitType, target: 1, whyStatement: '' })
                      setNewHabitName(''); setShowAddForm(false)
                    }
                    if (e.key === 'Escape') { setNewHabitName(''); setShowAddForm(false) }
                  }}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.20)',
                    outline: 'none', color: '#fff',
                    fontFamily: sans, fontSize: 16,
                    padding: '6px 0', width: '100%',
                  }}
                />
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['toggle','counter','timer','shoot'] as HabitType[]).map(t => (
                    <button key={t} onClick={() => setNewHabitType(t)} style={{
                      fontFamily: mono, fontSize: 9, letterSpacing: '0.3em',
                      textTransform: 'uppercase', padding: '6px 14px', cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.18)',
                      background: newHabitType === t ? '#fff' : 'transparent',
                      color: newHabitType === t ? '#000' : 'rgba(255,255,255,0.50)',
                    }}>{t}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => {
                      if (newHabitName.trim()) {
                        addHabit({ name: newHabitName.trim(), type: newHabitType, target: 1, whyStatement: '' })
                        setNewHabitName(''); setShowAddForm(false)
                      }
                    }}
                    style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: '0.32em',
                      textTransform: 'uppercase', border: '1px solid #fff',
                      background: 'transparent', color: '#fff',
                      padding: '12px 24px', cursor: 'pointer',
                      opacity: newHabitName.trim() ? 1 : 0.35,
                    }}
                  >Add</button>
                  <button
                    onClick={() => { setNewHabitName(''); setShowAddForm(false) }}
                    style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: '0.32em',
                      textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.12)',
                      background: 'transparent', color: 'rgba(255,255,255,0.40)',
                      padding: '12px 24px', cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              </div>
            )}
          </div>
          <div style={{
            marginTop: 22,
            fontFamily: sans,
            fontWeight: 300, fontSize: 13,
            color: 'rgba(255,255,255,0.50)', letterSpacing: '0.005em',
          }}>
            {statusText}
          </div>
        </section>

        {/* Aggregate mark grid */}
        <section style={{ padding: `${isMobile ? '40px' : '64px'} ${hPad} 0`, display: 'flex', flexDirection: 'column', gap: 18, ...riseIn(240) }}>
          <MarkGrid
            logs={logs}
            habits={activeHabits}
            arcId={arc.id}
            arcStartDate={arc.startDate}
          />
        </section>

        {/* Stats section */}
        <section style={{ padding: `${isMobile ? '32px' : '48px'} ${hPad} 0`, ...riseIn(320) }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '1px solid rgba(255,255,255,0.10)',
            borderBottom: '1px solid rgba(255,255,255,0.10)',
          }}>
            {[
              { label: isMobile ? 'STREAK' : 'CURRENT STREAK', value: `${streak}`, unit: 'DAYS' },
              { label: 'MARKS', value: `${arc.marks}`, unit: 'TOTAL' },
              { label: isMobile ? 'RATE' : 'RATE · 30 DAYS', value: arc.currentDay >= 7 ? `${rate30}` : '—', unit: arc.currentDay >= 7 ? '%' : '' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: isMobile ? '14px 10px 12px' : '22px 24px 20px',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.10)' : 'none',
              }}>
                <div style={{
                  fontFamily: mono,
                  fontSize: isMobile ? 7 : 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
                  marginBottom: 8,
                }}>{stat.label}</div>
                <div style={{
                  fontFamily: mono,
                  fontSize: isMobile ? 20 : 26,
                  color: arc.currentDay >= 7 || i < 2 ? '#fff' : 'rgba(255,255,255,0.25)',
                  letterSpacing: '-0.01em',
                }}>
                  {stat.value}
                  {stat.unit && <span style={{ fontSize: isMobile ? 11 : 14, color: 'rgba(255,255,255,0.40)', marginLeft: 4 }}>{stat.unit}</span>}
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
              display: 'flex', gap: 12, flexWrap: 'wrap',
            }}>
              <button
                onClick={() => useSixtysixStore.getState().debugAdvanceDay()}
                style={{
                  fontFamily: mono,
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
                  fontFamily: mono,
                  fontSize: 9, letterSpacing: '0.28em',
                  color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
                  padding: '8px 16px', cursor: 'pointer',
                }}
              >
                DEBUG: ONBOARDING
              </button>
              <button
                onClick={() => setCurrentScreen('arc-complete')}
                style={{
                  fontFamily: mono,
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

      {showCatchUp && (
        <CatchUpFlow
          daysAway={catchUpDaysAway}
          onContinue={resolveCatchUp}
        />
      )}

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

      {showStreakBreak && (
        <StreakBreakRecovery
          arc={arc}
          onResolve={resolveStreakBreak}
        />
      )}

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
