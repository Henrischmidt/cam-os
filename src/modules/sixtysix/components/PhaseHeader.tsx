import React from 'react'
import type { Arc } from '../store/sixtysix.store'
import { phaseName, phaseNumber } from '../lib/arcLogic'
import TickBar from './TickBar'

interface PhaseHeaderProps {
  arc: Arc
  onClick?: () => void
}

export default function PhaseHeader({ arc, onClick }: PhaseHeaderProps) {
  const phase = arc.phase
  const pName = phaseName(phase).toUpperCase()
  const pNum = phaseNumber(phase)

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    width: '100%',
    cursor: onClick ? 'pointer' : undefined,
    userSelect: 'none',
  }

  const monoStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.32em',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }

  const phaseStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '10px',
    letterSpacing: '0.32em',
    color: 'rgba(255,255,255,0.50)',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
    textAlign: 'right',
  }

  const tickWrapStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '1 1 auto',
    minWidth: 0,
  }

  return (
    <div
      style={containerStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={onClick ? `Phase header, day ${arc.currentDay}` : undefined}
    >
      <span style={monoStyle}>DAY {arc.currentDay} &middot; ARC 1</span>

      <div style={tickWrapStyle}>
        <TickBar currentDay={arc.currentDay} />
      </div>

      <span style={phaseStyle}>
        {pName} &middot; PHASE {pNum} OF 4
      </span>
    </div>
  )
}
