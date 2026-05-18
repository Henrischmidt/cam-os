import { useEffect, useRef, useState } from 'react'
import { useSixtysixStore } from './store/sixtysix.store'
import type { HabitType } from './store/sixtysix.store'
import { pullDailyCard } from './lib/cardLogic'
import { todayString, phaseName, phaseNumber } from './lib/arcLogic'
import { hapticSuccess } from './lib/haptics'
import { initNotifications, cancelNotifications } from './lib/notificationScheduler'
import HabitRow from './components/HabitRow'
import DailyCard from './components/DailyCard'
import HabitDrawer from './components/HabitDrawer'
import MilestoneOverlay from './components/MilestoneOverlay'
import StreakBreakRecovery from './components/StreakBreakRecovery'
import DayCompleteModal from './components/DayCompleteModal'
import CatchUpFlow from './components/CatchUpFlow'
import TickBar from './components/TickBar'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

// ─── Marks dot grid (Section 9) ───────────────────────────────────────────────

const MARKS_PULSE_CSS = `
@keyframes marksPulse {
  0%,100% { opacity: 0.60; }
  50%      { opacity: 1.00; }
}
`

const WHY_SURFACE_CSS = `
@keyframes whyFadeInOut {
  0%   { opacity: 0; }
  12%  { opacity: 1; }
  80%  { opacity: 1; }
  100% { opacity: 0; }
}
`

function WhySurface({ identityStatement, onDone }: { identityStatement: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <>
      <style>{WHY_SURFACE_CSS}</style>
      <div style={{
        position: 'fixed', inset: 0, zIndex: 92, background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 48px',
        animation: 'whyFadeInOut 3.4s ease both',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: mono, fontSize: 9, letterSpacing: '0.36em',
          color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
          marginBottom: 28, textAlign: 'center',
        }}>
          THIS IS WHY YOU STARTED
        </div>
        <div style={{
          fontFamily: serif, fontStyle: 'italic',
          fontSize: 'clamp(20px, 3.5vw, 32px)',
          color: '#fff', textAlign: 'center',
          lineHeight: 1.5, maxWidth: 560,
        }}>
          I am the kind of person who {identityStatement}.
        </div>
      </div>
    </>
  )
}

function MarksGrid({ marks }: { marks: number }) {
  if (marks === 0) return (
    <div style={{
      fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
      color: 'rgba(255,255,255,0.18)', textTransform: 'uppercase',
      padding: '4px 0',
    }}>
      No marks yet. Complete a day to earn your first.
    </div>
  )

  const totalDots = Math.max(10, Math.ceil(marks * 1.5 / 10) * 10)

  return (
    <>
      <style>{MARKS_PULSE_CSS}</style>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(10, 4px)',
        gap: 6,
      }}>
        {Array.from({ length: totalDots }, (_, i) => {
          const filled = i < marks
          const isLatest = filled && i === marks - 1
          return (
            <div
              key={i}
              style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: filled ? '#fff' : 'rgba(255,255,255,0.12)',
                animation: isLatest ? 'marksPulse 4s ease-in-out infinite' : undefined,
              }}
            />
          )
        })}
      </div>
    </>
  )
}

// ─── Sixtysix ────────────────────────────────────────────────────────────────

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
    notificationsEnabled,
    notificationTime,
  } = useSixtysixStore()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitType, setNewHabitType] = useState<HabitType>('toggle')
  const [newHabitTarget, setNewHabitTarget] = useState(1)
  const [newHabitUnit, setNewHabitUnit] = useState('')
  const [showWhy, setShowWhy] = useState(false)

  useEffect(() => { rolloverDay() }, [rolloverDay])

  // Show identity statement on day 8 and 22 (once per day per arc)
  useEffect(() => {
    if (!arc) return
    if (arc.currentDay !== 8 && arc.currentDay !== 22) return
    const key = `cam-os-why-${arc.id}-d${arc.currentDay}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    setShowWhy(true)
  }, [arc?.id, arc?.currentDay]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!arc) return
    const today = todayString(dayBeginsHour)
    if (cards.lastPulledDate !== today) {
      setTodayCard(pullDailyCard(arc, cards))
    }
  }, [arc, cards, setTodayCard, dayBeginsHour])

  // Daily reminder notifications
  useEffect(() => {
    if (notificationsEnabled) {
      initNotifications(notificationTime)
    } else {
      cancelNotifications()
    }
    return () => cancelNotifications()
  }, [notificationsEnabled, notificationTime])

  // Haptic when all habits complete for the day
  const prevDayComplete = useRef(false)
  useEffect(() => {
    if (showDayComplete && !prevDayComplete.current) hapticSuccess()
    prevDayComplete.current = showDayComplete
  }, [showDayComplete])

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

  // Streak
  let streak = 0
  for (let i = 1; i <= arc.currentDay; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (activeHabits.every(h =>
      logs.find(l => l.habitId === h.id && l.date === ds && (l.complete || l.honestMiss))
    )) streak++
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

  const overdueHabit = yesterdayStr >= arc.startDate ? activeHabits.find(h => {
    const yLog = yesterdayLogs.find(l => l.habitId === h.id)
    return !yLog || (!yLog.complete && !yLog.honestMiss)
  }) : undefined

  const statusText = (() => {
    if (doneTodayCount === activeHabits.length) return 'All done for today.'
    const overdueText = overdueHabit ? ` ${overdueHabit.name} overdue.` : ''
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

      {/* 4-zone fixed container */}
      <div style={{
        position: 'relative', zIndex: 1,
        height: '100dvh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 430,
        margin: '0 auto',
        width: '100%',
        paddingBottom: 'calc(64px + env(safe-area-inset-bottom))',
      }}>

        {/* ── ZONE 1: Phase header + tick bar + identity ─────────────────── */}
        <div style={{
          flex: '0 0 auto',
          paddingTop: 'env(safe-area-inset-top)',
          padding: 'env(safe-area-inset-top) 20px 0',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          {/* Phase label row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            paddingTop: 16,
            paddingBottom: 12,
          }}>
            <span style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
              color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
            }}>
              DAY {arc.currentDay} · {phaseName(arc.phase).toUpperCase()} · PHASE {phaseNumber(arc.phase)}/4
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <button
              onClick={() => setCurrentScreen('settings')}
              style={{
                fontFamily: mono, fontSize: 9, letterSpacing: '0.32em',
                color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase',
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '12px 8px',
                minHeight: 44,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              SETTINGS
            </button>
          </div>

          {/* 66-tick bar */}
          <div style={{ paddingBottom: 10 }}>
            <TickBar currentDay={arc.currentDay} />
          </div>

          {/* Compact stats row */}
          <div style={{
            display: 'flex',
            gap: 16,
            paddingBottom: 10,
            fontFamily: mono, fontSize: 9, letterSpacing: '0.26em',
            color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase',
          }}>
            <span>
              <span style={{ color: '#fff', fontSize: 11 }}>{doneTodayCount}/{activeHabits.length}</span>
              {' '}DONE
            </span>
            <span>·</span>
            <span>
              <span style={{ color: '#fff', fontSize: 11 }}>{streak}</span>
              {' '}DAY STREAK
            </span>
            {arc.currentDay >= 7 && (
              <>
                <span>·</span>
                <span>
                  <span style={{ color: '#fff', fontSize: 11 }}>{rate30}%</span>
                  {' '}30D
                </span>
              </>
            )}
          </div>

          {/* Identity statement */}
          <div style={{
            fontFamily: serif, fontStyle: 'italic', fontSize: 14,
            color: 'rgba(255,255,255,0.50)', lineHeight: 1.4,
            paddingBottom: 14,
          }}>
            By Day 66 I'll be the kind of person who{' '}
            <em style={{ color: 'rgba(255,255,255,0.75)' }}>{arc.identityStatement}</em>.
          </div>
        </div>

        {/* ── ZONE 2: Habits list (scrollable) ─────────────────────────── */}
        <div className="zone-habits-scroll" style={{ flex: '1 1 auto', overflowY: 'auto', padding: '0 20px' }}>
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
            {!showAddForm && (
              <div
                role="button"
                tabIndex={0}
                onClick={() => setShowAddForm(true)}
                onKeyDown={e => { if (e.key === 'Enter') setShowAddForm(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  minHeight: 44, padding: '10px 0',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 6,
                  border: '1px dashed rgba(255,255,255,0.10)',
                  display: 'grid', placeItems: 'center',
                  color: 'rgba(255,255,255,0.25)', flexShrink: 0,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
                    <line x1="7" y1="2" x2="7" y2="12" /><line x1="2" y1="7" x2="12" y2="7" />
                  </svg>
                </div>
                <span style={{ fontFamily: serif, fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.30)' }}>
                  Add habit
                </span>
              </div>
            )}

            {showAddForm && (
              <div style={{
                borderTop: '1px solid rgba(255,255,255,0.06)',
                padding: '16px 0',
                display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                {/* Name */}
                <input
                  autoFocus
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  placeholder="Habit name"
                  onKeyDown={e => { if (e.key === 'Escape') { setNewHabitName(''); setShowAddForm(false) } }}
                  style={{
                    background: 'transparent', border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.18)',
                    outline: 'none', color: '#fff',
                    fontFamily: sans, fontSize: 16,
                    padding: '6px 0', width: '100%', minHeight: 44,
                  }}
                />
                {/* Type */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(['toggle','counter','timer'] as HabitType[]).map(t => (
                    <button key={t} onClick={() => { setNewHabitType(t); setNewHabitTarget(t === 'toggle' ? 1 : newHabitTarget) }} style={{
                      fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
                      textTransform: 'uppercase', padding: '8px 12px', cursor: 'pointer',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: newHabitType === t ? '#fff' : 'transparent',
                      color: newHabitType === t ? '#000' : 'rgba(255,255,255,0.45)',
                      minHeight: 36,
                    }}>{t}</button>
                  ))}
                </div>
                {/* Target + unit for counter/timer */}
                {(newHabitType === 'counter' || newHabitType === 'timer') && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase' }}>
                        Goal
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={newHabitTarget}
                        onChange={e => setNewHabitTarget(Math.max(1, Number(e.target.value)))}
                        style={{
                          width: 64, background: 'transparent', border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.18)',
                          color: '#fff', fontFamily: mono, fontSize: 18,
                          padding: '6px 0', outline: 'none', textAlign: 'center',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase' }}>
                        Unit {newHabitType === 'timer' ? '(default: min)' : ''}
                      </span>
                      <input
                        value={newHabitUnit}
                        onChange={e => setNewHabitUnit(e.target.value)}
                        placeholder={newHabitType === 'timer' ? 'min' : 'reps'}
                        style={{
                          background: 'transparent', border: 'none',
                          borderBottom: '1px solid rgba(255,255,255,0.18)',
                          color: '#fff', fontFamily: sans, fontSize: 16,
                          padding: '6px 0', outline: 'none', width: '100%',
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      if (!newHabitName.trim()) return
                      const unit = newHabitUnit.trim() || (newHabitType === 'timer' ? 'min' : undefined)
                      addHabit({ name: newHabitName.trim(), type: newHabitType, target: newHabitTarget, unit, whyStatement: '' })
                      setNewHabitName(''); setNewHabitTarget(1); setNewHabitUnit(''); setShowAddForm(false)
                    }}
                    style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: '0.28em',
                      textTransform: 'uppercase', border: '1px solid #fff',
                      background: 'transparent', color: '#fff',
                      padding: '10px 20px', cursor: 'pointer', minHeight: 44,
                      opacity: newHabitName.trim() ? 1 : 0.30,
                    }}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => { setNewHabitName(''); setNewHabitTarget(1); setNewHabitUnit(''); setShowAddForm(false) }}
                    style={{
                      fontFamily: mono, fontSize: 10, letterSpacing: '0.28em',
                      textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.10)',
                      background: 'transparent', color: 'rgba(255,255,255,0.35)',
                      padding: '10px 20px', cursor: 'pointer', minHeight: 44,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div style={{
            padding: '10px 0 14px',
            fontFamily: sans, fontWeight: 300, fontSize: 12,
            color: 'rgba(255,255,255,0.40)',
          }}>
            {statusText}
          </div>

          {/* Debug controls (DEV only) */}
          {import.meta.env.DEV && (
            <div style={{
              padding: '10px 0 14px',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', gap: 8, flexWrap: 'wrap',
            }}>
              {[
                ['ADVANCE DAY', () => useSixtysixStore.getState().debugAdvanceDay()],
                ['ONBOARDING', () => setCurrentScreen('onboarding')],
                ['ARC COMPLETE', () => setCurrentScreen('arc-complete')],
              ].map(([label, fn]) => (
                <button
                  key={label as string}
                  onClick={fn as () => void}
                  style={{
                    fontFamily: mono, fontSize: 8, letterSpacing: '0.24em',
                    color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                    background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                    padding: '6px 10px', cursor: 'pointer',
                  }}
                >{label as string}</button>
              ))}
            </div>
          )}
        </div>

        {/* ── ZONE 3: Marks dot grid ────────────────────────────────────── */}
        <div style={{
          flex: '0 0 auto',
          padding: '12px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{
            fontFamily: mono, fontSize: 8, letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
            marginBottom: 8,
          }}>
            MARKS · {arc.marks} TOTAL
          </div>
          <MarksGrid marks={arc.marks} />
        </div>

        {/* ── ZONE 4: Daily card ────────────────────────────────────────── */}
        <div style={{
          flex: '0 0 auto',
          padding: '0 20px 12px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          <DailyCard cardId={cards.todayCardId} />
        </div>
      </div>

      {/* Overlays — outside the 4-zone container */}
      <HabitDrawer
        habit={drawerHabit}
        arc={arc}
        logs={logs}
        onClose={() => setDrawerHabitId(null)}
      />

      {showCatchUp && (
        <CatchUpFlow daysAway={catchUpDaysAway} onContinue={resolveCatchUp} />
      )}

      {showMilestone && milestoneDay !== null && (
        <MilestoneOverlay
          day={milestoneDay}
          onDismiss={dismissMilestone}
          onArcComplete={() => { dismissMilestone(); setCurrentScreen('arc-complete') }}
        />
      )}

      {showStreakBreak && (
        <StreakBreakRecovery arc={arc} onResolve={resolveStreakBreak} />
      )}

      {showDayComplete && arc && (
        <DayCompleteModal
          identityStatement={arc.identityStatement}
          onSubmit={setDayReflection}
          onDismiss={dismissDayComplete}
        />
      )}

      {showWhy && arc && (
        <WhySurface
          identityStatement={arc.identityStatement}
          onDone={() => setShowWhy(false)}
        />
      )}
    </>
  )
}
