import React from 'react'

interface TickBarProps {
  currentDay: number
  className?: string
}

export default function TickBar({ currentDay, className }: TickBarProps) {
  const TICK_W = 1
  const GAP = 2
  const TICK_H = 8
  const BOUND_H = 12
  const HEIGHT = 16
  const PHASE_BOUNDS = new Set([7, 21, 45])

  const ticks: React.ReactElement[] = []
  for (let i = 1; i <= 66; i++) {
    const x = (i - 1) * (TICK_W + GAP)
    const isCurrentDay = i === currentDay
    const isPast = i < currentDay
    const isBoundary = PHASE_BOUNDS.has(i)

    if (isBoundary) {
      ticks.push(
        <rect
          key={`b${i}`}
          x={x}
          y={(HEIGHT - BOUND_H) / 2}
          width={TICK_W}
          height={BOUND_H}
          fill="rgba(255,255,255,0.30)"
        />
      )
    } else {
      const fill = isPast || isCurrentDay ? '#fff' : 'rgba(255,255,255,0.12)'
      ticks.push(
        <rect
          key={i}
          x={x}
          y={(HEIGHT - TICK_H) / 2}
          width={TICK_W}
          height={TICK_H}
          fill={fill}
          filter={isCurrentDay ? 'url(#tickGlow)' : undefined}
        />
      )
    }
  }

  const svgWidth = 66 * (TICK_W + GAP)

  return (
    <svg
      width={svgWidth}
      height={HEIGHT}
      viewBox={`0 0 ${svgWidth} ${HEIGHT}`}
      className={className}
    >
      <defs>
        <filter id="tickGlow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {ticks}
    </svg>
  )
}
