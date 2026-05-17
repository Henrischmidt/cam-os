import React from 'react'
import type { DayLog, Habit } from '../store/sixtysix.store'
import { todayString } from '../lib/arcLogic'

interface MarkGridProps {
  logs: DayLog[]
  habits: Habit[]
  arcId: string
  arcStartDate: string
  className?: string
}

type CellState = 'done' | 'honest' | 'miss' | 'today' | 'empty'

function getLast30Days(): string[] {
  const days: string[] = []
  const today = new Date(todayString())
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

const STYLES = `
  @keyframes markPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.25), 0 0 0 2px rgba(255,255,255,0.12); }
    50%       { box-shadow: 0 0 0 3px rgba(255,255,255,0.10), 0 0 0 5px rgba(255,255,255,0.05); }
  }

  .mark-cell {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.18);
    background: transparent;
    position: relative;
    flex-shrink: 0;
  }

  .mark-cell.done {
    background: #fff;
    border-color: #fff;
  }

  .mark-cell.honest {
    border-color: rgba(255,255,255,0.40);
    background: transparent;
  }

  .mark-cell.honest::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(255,255,255,0.40);
  }

  .mark-cell.miss {
    border-color: rgba(255,255,255,0.10);
    background: transparent;
  }

  .mark-cell.miss::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 1px;
    background: rgba(255,255,255,0.18);
  }

  .mark-cell.today {
    background: rgba(255,255,255,0.10);
    border-color: #fff;
    animation: markPulse 2s ease-in-out infinite;
  }

  .mark-cell.empty {
    border-color: rgba(255,255,255,0.12);
    background: transparent;
  }
`

export default function MarkGrid({ logs, habits, arcId, arcStartDate, className }: MarkGridProps) {
  const activeHabits = habits.filter(h => h.arcId === arcId && h.active)
  const days = getLast30Days()
  const todayStr = todayString()

  // Compute stats — only count days from arc start to today
  let doneCt = 0
  let honestCt = 0
  let missCt = 0
  const arcDaysInWindow = days.filter(d => d >= arcStartDate && d <= todayStr).length
  const possibleMarks = arcDaysInWindow * activeHabits.length

  const cells: Array<{ day: string; habit: Habit; state: CellState }> = []

  for (const day of days) {
    const isToday = day === todayStr
    const isFuture = day > todayStr

    for (const habit of activeHabits) {
      const log = logs.find(
        l => l.habitId === habit.id && l.date === day && l.arcId === arcId
      )

      let state: CellState

      if (isFuture || day < arcStartDate) {
        state = 'empty'
      } else if (log?.complete) {
        state = 'done'
        doneCt++
      } else if (log?.honestMiss) {
        state = 'honest'
        honestCt++
      } else if (isToday) {
        state = 'today'
      } else {
        state = 'miss'
        missCt++
      }

      cells.push({ day, habit, state })
    }
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    width: '100%',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.30em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase' as const,
  }

  const statsStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.28em',
    color: 'rgba(255,255,255,0.40)',
    textTransform: 'uppercase' as const,
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(30, 1fr)',
    gap: '10px',
  }

  const legendStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  }

  const legendItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: "'DM Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.28em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase' as const,
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={containerStyle} className={className}>
        <div style={headerStyle}>
          <span style={labelStyle}>
            LAST 30 DAYS &middot; ALL HABITS &middot; {possibleMarks} POSSIBLE MARKS
          </span>
          <span style={statsStyle}>
            {doneCt} DONE &middot; {honestCt} HONEST &middot; {missCt} MISS
          </span>
        </div>

        <div style={gridStyle}>
          {cells.map(({ day, habit, state }) => (
            <div
              key={`${day}-${habit.id}`}
              className={`mark-cell ${state}`}
              title={`${habit.name} · ${day}`}
            />
          ))}
        </div>

        <div style={legendStyle}>
          <span style={legendItemStyle}>
            <span className="mark-cell done" style={{ flexShrink: 0 }} />
            DONE
          </span>
          <span style={legendItemStyle}>
            <span className="mark-cell honest" style={{ flexShrink: 0 }} />
            HONEST MISS
          </span>
          <span style={legendItemStyle}>
            <span className="mark-cell miss" style={{ flexShrink: 0 }} />
            MISS
          </span>
          <span style={legendItemStyle}>
            <span className="mark-cell today" style={{ flexShrink: 0 }} />
            TODAY
          </span>
        </div>
      </div>
    </>
  )
}
