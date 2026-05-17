import React, { useState, useCallback } from 'react'
import type { Habit, DayLog, Arc } from '../store/sixtysix.store'
import { useSixtysixStore } from '../store/sixtysix.store'
import { phaseName, todayString } from '../lib/arcLogic'
import { hapticLight, hapticMedium } from '../lib/haptics'

// ─── Props ────────────────────────────────────────────────────────────────────

interface HabitDrawerProps {
  habit: Habit | null
  arc: Arc
  logs: DayLog[]
  onClose: () => void
}

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'

// ─── Dot states ───────────────────────────────────────────────────────────────

type DotState = 'done' | 'honest' | 'miss' | 'today' | 'empty'

function getDotColor(state: DotState): string {
  if (state === 'done') return '#fff'
  if (state === 'honest') return 'rgba(255,255,255,0.40)'
  if (state === 'miss') return 'transparent'
  if (state === 'today') return 'transparent'
  return 'transparent'
}

function getDotBorder(state: DotState): string {
  if (state === 'done') return '1px solid #fff'
  if (state === 'honest') return '1px solid rgba(255,255,255,0.40)'
  if (state === 'miss') return '1px solid rgba(255,255,255,0.15)'
  if (state === 'today') return '1px solid rgba(255,255,255,0.60)'
  return '1px solid rgba(255,255,255,0.08)'
}

// ─── Compute stats ────────────────────────────────────────────────────────────

function computeStats(
  habit: Habit,
  arcLogs: DayLog[],
  arcStartDate: string,
  _arcCurrentDay: number
): { currentStreak: number; bestStreak: number; rate30d: number } {
  const today = todayString()

  // Build a map of date → log for this habit
  const logMap = new Map<string, DayLog>()
  for (const log of arcLogs) {
    if (log.habitId === habit.id) {
      logMap.set(log.date, log)
    }
  }

  // Build array of all arc dates up to yesterday
  const startMs = new Date(arcStartDate + 'T12:00:00').getTime()
  const todayMs = new Date(today + 'T12:00:00').getTime()
  const dayMs = 86400000

  const allDates: string[] = []
  for (let ms = startMs; ms < todayMs; ms += dayMs) {
    allDates.push(new Date(ms).toISOString().slice(0, 10))
  }

  // Current streak: go backwards from yesterday
  let currentStreak = 0
  for (let i = allDates.length - 1; i >= 0; i--) {
    const log = logMap.get(allDates[i])
    if (log?.complete === true) {
      currentStreak++
    } else {
      break
    }
  }

  // Best streak
  let bestStreak = 0
  let runningStreak = 0
  for (const date of allDates) {
    const log = logMap.get(date)
    if (log?.complete === true) {
      runningStreak++
      if (runningStreak > bestStreak) bestStreak = runningStreak
    } else {
      runningStreak = 0
    }
  }

  // Rate last 30 days
  const last30: string[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayMs - i * dayMs)
    last30.push(d.toISOString().slice(0, 10))
  }
  const completedIn30 = last30.filter(d => logMap.get(d)?.complete === true).length
  const rate30d = Math.round((completedIn30 / 30) * 100)

  return { currentStreak, bestStreak, rate30d }
}

// ─── Button styles ────────────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  width: '100%',
  border: '1px solid #fff',
  background: 'transparent',
  color: '#fff',
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  padding: '18px 24px',
  cursor: 'pointer',
  transition: 'background 250ms ease, color 250ms ease',
}

const ghostBtn: React.CSSProperties = {
  ...primaryBtn,
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.60)',
}

// ─── Flash overlay ────────────────────────────────────────────────────────────

function useFlash(): [boolean, () => void] {
  const [flashing, setFlashing] = useState(false)

  const flash = useCallback(() => {
    setFlashing(true)
    setTimeout(() => setFlashing(false), 500)
  }, [])

  return [flashing, flash]
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const btnStyle: React.CSSProperties = {
    width: 48,
    height: 48,
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontFamily: mono,
    fontSize: 18,
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        border: '1px solid rgba(255,255,255,0.10)',
        alignItems: 'center',
      }}
    >
      <button style={btnStyle} onClick={() => onChange(Math.max(0, value - 1))}>
        −
      </button>
      <div
        style={{
          minWidth: 96,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: mono,
          fontSize: 14,
          color: '#fff',
          letterSpacing: '0.04em',
          borderLeft: '1px solid rgba(255,255,255,0.10)',
          borderRight: '1px solid rgba(255,255,255,0.10)',
          height: 48,
        }}
      >
        {value}
      </div>
      <button style={btnStyle} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  )
}

// ─── HabitDrawer ──────────────────────────────────────────────────────────────

export default function HabitDrawer({ habit, arc, logs, onClose }: HabitDrawerProps) {
  const { logHabit, logHonestMiss, honestMissWordMin } = useSixtysixStore()

  const [counterValue, setCounterValue] = useState(0)
  const [showMissForm, setShowMissForm] = useState(false)
  const [missText, setMissText] = useState('')
  const [flashing, flash] = useFlash()

  const today = todayString()
  const yesterdayDate = (() => {
    const d = new Date(today + 'T12:00:00')
    d.setDate(d.getDate() - 1)
    return d.toISOString().slice(0, 10)
  })()

  // Filter logs for this habit
  const habitLogs = habit ? logs.filter(l => l.habitId === habit.id && l.arcId === arc.id) : []
  const todayLog = habitLogs.find(l => l.date === today)
  const yesterdayLog = habitLogs.find(l => l.date === yesterdayDate)

  const isComplete = todayLog?.complete === true
  const yesterdayBeforeArcStart = yesterdayDate < arc.startDate
  const yesterdayMissed =
    !yesterdayBeforeArcStart &&
    (yesterdayLog === undefined || (!yesterdayLog.complete && !yesterdayLog.honestMiss))

  // Stats
  const stats = habit
    ? computeStats(habit, habitLogs, arc.startDate, arc.currentDay)
    : { currentStreak: 0, bestStreak: 0, rate30d: 0 }

  // 66-dot grid
  const dots: DotState[] = Array.from({ length: 66 }, (_, i) => {
    const dayNum = i + 1
    if (dayNum > arc.currentDay) return 'empty'
    if (dayNum === arc.currentDay) return 'today'

    const startMs = new Date(arc.startDate + 'T12:00:00').getTime()
    const dotDate = new Date(startMs + (dayNum - 1) * 86400000).toISOString().slice(0, 10)
    const log = habitLogs.find(l => l.date === dotDate)

    if (!log) return 'miss'
    if (log.complete) return 'done'
    if (log.honestMiss) return 'honest'
    return 'miss'
  })

  const completedDots = dots.filter(d => d === 'done').length

  // Log actions
  function handleLog() {
    if (!habit) return
    const value = habit.type === 'toggle' ? habit.target : counterValue
    logHabit(habit.id, value)
    hapticLight()
    flash()
    setCounterValue(0)
  }

  function handleUndo() {
    if (!habit) return
    logHabit(habit.id, 0)
    hapticLight()
  }

  const missWordCount = missText.trim().split(/\s+/).filter(Boolean).length
  const minWords = honestMissWordMin ?? 5

  function handleLogMiss() {
    if (!habit || missWordCount < minWords) return
    logHonestMiss(habit.id, missText.trim(), yesterdayDate)
    setMissText('')
    setShowMissForm(false)
    hapticMedium()
    flash()
  }

  const loggedTime = todayLog
    ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <>
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(3px)',
          zIndex: 20,
          opacity: habit ? 1 : 0,
          pointerEvents: habit ? 'auto' : 'none',
          transition: 'opacity 350ms ease',
        }}
      />

      {/* Flash */}
      {flashing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#fff',
            opacity: 0.85,
            zIndex: 100,
            pointerEvents: 'none',
            animation: 'flash-fade 500ms ease forwards',
          }}
        />
      )}

      <style>{`
        @keyframes flash-fade {
          0% { opacity: 0; }
          20% { opacity: 0.85; }
          100% { opacity: 0; }
        }
        .habit-drawer-primary-btn:hover {
          background: #fff !important;
          color: #000 !important;
        }
        .habit-drawer-ghost-btn:hover {
          background: rgba(255,255,255,0.04) !important;
        }
      `}</style>

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'min(520px, 92vw)',
          borderLeft: '1px solid rgba(255,255,255,0.18)',
          background: '#000',
          transform: habit ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 450ms cubic-bezier(0.2,0.7,0.2,1)',
          zIndex: 25,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 36px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.30)',
              textTransform: 'uppercase',
            }}
          >
            Habit · Detail
          </span>

          <button
            onClick={onClose}
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.40)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            × CLOSE
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '32px 36px',
            display: 'flex',
            flexDirection: 'column',
            gap: 30,
          }}
        >
          {habit && (
            <>
              {/* Hero */}
              <div>
                <h2
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 56,
                    fontWeight: 400,
                    color: '#fff',
                    margin: '0 0 12px',
                    lineHeight: 1.0,
                  }}
                >
                  {habit.name}
                </h2>

                {habit.whyStatement && (
                  <p
                    style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 18,
                      color: 'rgba(255,255,255,0.60)',
                      margin: '0 0 14px',
                      lineHeight: 1.5,
                    }}
                  >
                    {habit.whyStatement}
                  </p>
                )}

                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 10,
                    letterSpacing: '0.2em',
                    color: fg25,
                    textTransform: 'uppercase',
                  }}
                >
                  Day {arc.currentDay} · Arc 1 · {phaseName(arc.phase)}
                </div>
              </div>

              {/* 66-dot grid */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      letterSpacing: '0.32em',
                      color: fg40,
                      textTransform: 'uppercase',
                    }}
                  >
                    Arc Progress
                  </span>
                  <span
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      letterSpacing: '0.16em',
                      color: fg25,
                    }}
                  >
                    {completedDots} of 66 days
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(11, 14px)',
                    gap: 6,
                  }}
                >
                  {dots.map((state, i) => (
                    <div
                      key={i}
                      title={`Day ${i + 1}`}
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: getDotColor(state),
                        border: getDotBorder(state),
                        transition: 'background 300ms ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {[
                  { label: 'Current Streak', value: stats.currentStreak, suffix: 'd' },
                  { label: 'Best', value: stats.bestStreak, suffix: 'd' },
                  { label: 'Rate 30d', value: stats.rate30d, suffix: '%' },
                ].map((stat, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '20px 16px',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 8,
                        letterSpacing: '0.28em',
                        color: fg25,
                        textTransform: 'uppercase',
                        lineHeight: 1.4,
                      }}
                    >
                      {stat.label}
                    </span>
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: 24,
                        color: '#fff',
                        letterSpacing: '0.02em',
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                      <span style={{ fontSize: 12, color: fg40, marginLeft: 2 }}>
                        {stat.suffix}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '20px 36px 28px',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {habit && (
            <>
              {/* Honest miss form */}
              {showMissForm && (
                <div style={{ marginBottom: 8 }}>
                  <p
                    style={{
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 16,
                      color: fg60,
                      margin: '0 0 14px',
                    }}
                  >
                    Why did yesterday fall away?
                  </p>

                  <input
                    value={missText}
                    onChange={e => setMissText(e.target.value)}
                    placeholder="Write honestly…"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      borderBottom: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                      fontFamily: serif,
                      fontStyle: 'italic',
                      fontSize: 16,
                      padding: '10px 0',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />

                  <div
                    style={{
                      fontFamily: mono,
                      fontSize: 9,
                      letterSpacing: '0.2em',
                      color: missWordCount >= minWords ? fg40 : fg25,
                      textTransform: 'uppercase',
                      marginTop: 8,
                      marginBottom: 16,
                    }}
                  >
                    {missWordCount} words · min {minWords}
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => {
                        setShowMissForm(false)
                        setMissText('')
                      }}
                      className="habit-drawer-ghost-btn"
                      style={{ ...ghostBtn, flex: 1 }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleLogMiss}
                      className="habit-drawer-primary-btn"
                      disabled={missWordCount < minWords}
                      style={{
                        ...primaryBtn,
                        flex: 1,
                        opacity: missWordCount < minWords ? 0.4 : 1,
                        cursor: missWordCount < minWords ? 'default' : 'pointer',
                      }}
                    >
                      Log Miss
                    </button>
                  </div>
                </div>
              )}

              {/* Main footer actions */}
              {!showMissForm && (
                <>
                  {isComplete ? (
                    /* Done state */
                    <div>
                      <div
                        style={{
                          fontFamily: serif,
                          fontStyle: 'italic',
                          fontSize: 16,
                          color: fg60,
                          marginBottom: 8,
                        }}
                      >
                        Done for today.
                      </div>
                      {loggedTime && (
                        <div
                          style={{
                            fontFamily: mono,
                            fontSize: 9,
                            letterSpacing: '0.2em',
                            color: fg25,
                            textTransform: 'uppercase',
                            marginBottom: 16,
                          }}
                        >
                          Logged at {loggedTime}
                        </div>
                      )}
                      <button
                        onClick={handleUndo}
                        className="habit-drawer-ghost-btn"
                        style={ghostBtn}
                      >
                        Undo
                      </button>
                    </div>
                  ) : (
                    /* Logging state */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {/* Counter/timer stepper */}
                      {habit.type !== 'toggle' && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: mono,
                              fontSize: 9,
                              letterSpacing: '0.2em',
                              color: fg25,
                              textTransform: 'uppercase',
                            }}
                          >
                            {habit.type === 'timer' ? 'Minutes' : `Value · Target ${habit.target}${habit.unit ?? ''}`}
                          </span>
                          <Stepper value={counterValue} onChange={setCounterValue} />
                        </div>
                      )}

                      {/* LOG TODAY button */}
                      <button
                        onClick={handleLog}
                        className="habit-drawer-primary-btn"
                        style={primaryBtn}
                      >
                        Log Today
                      </button>

                      {/* Honest miss for yesterday */}
                      {yesterdayMissed ? (
                        <button
                          onClick={() => setShowMissForm(true)}
                          className="habit-drawer-ghost-btn"
                          style={ghostBtn}
                        >
                          Honest Miss (Yesterday)
                        </button>
                      ) : yesterdayBeforeArcStart ? (
                        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: fg25, textTransform: 'uppercase', textAlign: 'center', paddingTop: 4 }}>
                          Honest Miss available from Day 2
                        </div>
                      ) : (
                        <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.2em', color: fg25, textTransform: 'uppercase', textAlign: 'center', paddingTop: 4 }}>
                          Yesterday complete — no miss to log
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
