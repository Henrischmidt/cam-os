import React, { useState } from 'react'
import type { Habit, DayLog } from '../store/sixtysix.store'

interface HabitRowProps {
  habit: Habit
  todayLog: DayLog | undefined
  yesterdayLog: DayLog | undefined
  onClick: () => void
}

// ─── Icon SVGs ────────────────────────────────────────────────────────────────

function ToggleIcon({ dim }: { dim: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle
        cx="10"
        cy="10"
        r="8"
        stroke={dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)'}
        strokeWidth="1"
      />
      <polyline
        points="6,10 9,13 14,7"
        stroke={dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)'}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function CounterIcon({ dim }: { dim: boolean }) {
  const color = dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <polyline
        points="3,14 7,9 11,12 17,5"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <polyline
        points="13,5 17,5 17,9"
        stroke={color}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function TimerIcon({ dim }: { dim: boolean }) {
  const color = dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="11" r="7" stroke={color} strokeWidth="1" />
      <line x1="10" y1="11" x2="10" y2="7" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="11" x2="13" y2="13" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="8" y1="3" x2="12" y2="3" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="10" y1="3" x2="10" y2="4.5" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

function ShootIcon({ dim }: { dim: boolean }) {
  const color = dim ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.60)'
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="11" rx="1.5" stroke={color} strokeWidth="1" />
      <circle cx="10" cy="11.5" r="3" stroke={color} strokeWidth="1" />
      <path d="M7 6 L8.5 3.5 H11.5 L13 6" stroke={color} strokeWidth="1" strokeLinejoin="round" />
      <circle cx="15" cy="8.5" r="1" fill={color} />
    </svg>
  )
}

function HabitIcon({ type, dim }: { type: Habit['type']; dim: boolean }) {
  if (type === 'toggle') return <ToggleIcon dim={dim} />
  if (type === 'timer') return <TimerIcon dim={dim} />
  if (type === 'shoot') return <ShootIcon dim={dim} />
  return <CounterIcon dim={dim} />
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polyline
        points="5,3 9,7 5,11"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Chip ─────────────────────────────────────────────────────────────────────

interface ChipProps {
  label: string
  variant: 'done' | 'missed' | 'default'
}

function Chip({ label, variant }: ChipProps) {
  const borderColor =
    variant === 'done'
      ? 'rgba(255,255,255,0.12)'
      : variant === 'missed'
      ? 'rgba(255,255,255,0.50)'
      : 'rgba(255,255,255,0.18)'

  const color =
    variant === 'done'
      ? 'rgba(255,255,255,0.30)'
      : variant === 'missed'
      ? 'rgba(255,255,255,0.80)'
      : 'rgba(255,255,255,0.40)'

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: "'DM Mono', monospace",
        fontSize: '8px',
        letterSpacing: '0.28em',
        textTransform: 'uppercase',
        color,
        border: `1px solid ${borderColor}`,
        borderRadius: '3px',
        padding: '2px 6px',
        lineHeight: 1,
      }}
    >
      {label}
    </span>
  )
}

// ─── HabitRow ─────────────────────────────────────────────────────────────────

const HOVER_STYLE = `
  .habit-row {
    transition: padding-left 400ms cubic-bezier(0.16,1,0.3,1);
  }
  .habit-row:hover {
    padding-left: 6px !important;
  }
  .habit-row:hover .habit-row-arrow {
    transform: translateX(3px);
  }
  .habit-row:hover .habit-row-icon {
    opacity: 1;
  }
  .habit-row-arrow {
    transition: transform 400ms cubic-bezier(0.16,1,0.3,1);
  }
  .habit-row-icon {
    transition: opacity 400ms ease-out;
    opacity: 0.7;
  }
`

export default function HabitRow({ habit, todayLog, yesterdayLog, onClick }: HabitRowProps) {
  const [_hovered, setHovered] = useState(false)

  const value = todayLog?.value ?? 0
  const isComplete = todayLog?.complete === true
  const pct = Math.min(100, (value / habit.target) * 100)

  const yesterdayMissed =
    yesterdayLog === undefined ||
    (!yesterdayLog.complete && !yesterdayLog.honestMiss)

  // Determine chip
  let chipLabel = ''
  let chipVariant: ChipProps['variant'] = 'default'

  if (isComplete) {
    chipLabel = habit.type === 'shoot' ? 'SHOT' : 'DONE'
    chipVariant = 'done'
  } else if (yesterdayMissed) {
    chipLabel = 'YESTERDAY MISSED'
    chipVariant = 'missed'
  } else {
    const unit = habit.unit ?? ''
    if (habit.type === 'toggle') {
      chipLabel = `DAILY`
    } else if (habit.type === 'shoot') {
      chipLabel = `SHOOT · DAILY`
    } else if (habit.type === 'timer') {
      chipLabel = `TIMER · ${habit.target}${unit}`
    } else {
      chipLabel = `DAILY · ${habit.target}${unit}`
    }
    chipVariant = 'default'
  }

  const unit = habit.unit ?? ''
  const valueLabel = isComplete
    ? `${habit.target}${unit}`
    : `${value}/${habit.target}${unit}`

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto 14px',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    paddingLeft: '0px',
    paddingTop: '10px',
    paddingBottom: '10px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  }

  const iconBoxStyle: React.CSSProperties = {
    width: '44px',
    height: '44px',
    border: '1px solid rgba(255,255,255,0.10)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  }

  const nameStyle: React.CSSProperties = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '14px',
    fontWeight: 400,
    color: isComplete ? 'rgba(255,255,255,0.40)' : 'rgba(255,255,255,0.80)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2,
    transition: 'color 400ms ease-out',
  }

  const chipRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }

  const barTrackStyle: React.CSSProperties = {
    height: '1px',
    background: 'rgba(255,255,255,0.10)',
    borderRadius: '1px',
    overflow: 'hidden',
    marginTop: '4px',
  }

  const barFillStyle: React.CSSProperties = {
    height: '100%',
    width: `${pct}%`,
    background: isComplete ? 'rgba(255,255,255,0.50)' : '#fff',
    borderRadius: '1px',
    transition: 'width 400ms cubic-bezier(0.16,1,0.3,1)',
  }

  const valueStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '11px',
    letterSpacing: '0.04em',
    color: isComplete ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.40)',
    whiteSpace: 'nowrap',
  }

  return (
    <>
      <style>{HOVER_STYLE}</style>
      <div
        className="habit-row"
        style={rowStyle}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        aria-label={`${habit.name}, ${valueLabel}`}
      >
        <div style={iconBoxStyle} className="habit-row-icon">
          <HabitIcon type={habit.type} dim={isComplete} />
        </div>

        <div style={bodyStyle}>
          <span style={nameStyle}>{habit.name}</span>
          <div style={chipRowStyle}>
            <Chip label={chipLabel} variant={chipVariant} />
          </div>
          <div style={barTrackStyle}>
            <div style={barFillStyle} />
          </div>
        </div>

        <span style={valueStyle}>{valueLabel}</span>

        <span className="habit-row-arrow">
          <ChevronIcon />
        </span>
      </div>
    </>
  )
}
