import { useEffect, useRef, useState } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import { todayString } from '../lib/arcLogic'

const DURATIONS = [
  { label: '25', seconds: 25 * 60 },
  { label: '45', seconds: 45 * 60 },
  { label: '60', seconds: 60 * 60 },
]

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export default function Focus() {
  const { focusSessions, incrementFocusSession, dayBeginsHour } = useSixtysixStore()
  const today = todayString(dayBeginsHour)
  const sessionsToday = focusSessions[today] ?? 0

  const [durationIdx, setDurationIdx] = useState(0)
  const [remaining, setRemaining] = useState(DURATIONS[0].seconds)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const totalSeconds = DURATIONS[durationIdx].seconds

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  function handleSelectDuration(idx: number) {
    if (running) return
    setDurationIdx(idx)
    setRemaining(DURATIONS[idx].seconds)
    setFinished(false)
  }

  function handleStart() {
    if (finished) return
    setRunning(true)
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearTimer()
          setRunning(false)
          setFinished(true)
          incrementFocusSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  function handlePause() {
    setRunning(false)
    clearTimer()
  }

  function handleReset() {
    clearTimer()
    setRunning(false)
    setFinished(false)
    setRemaining(DURATIONS[durationIdx].seconds)
  }

  useEffect(() => {
    return () => clearTimer()
  }, [])

  const progress = 1 - remaining / totalSeconds
  const circumference = 2 * Math.PI * 80

  return (
    <div style={{
      flex: 1, minHeight: 0, overflowY: 'auto', height: '100%',
      padding: 'calc(env(safe-area-inset-top) + 40px) 24px calc(96px + env(safe-area-inset-bottom))',
      display: 'flex', flexDirection: 'column', gap: 40, alignItems: 'center',
    }}>
      {/* Header */}
      <div style={{
        alignSelf: 'flex-start',
        fontFamily: "'DM Mono', monospace",
        fontSize: 10, letterSpacing: '0.32em',
        color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase',
      }}>FOCUS</div>

      {/* Duration selector */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid rgba(255,255,255,0.15)' }}>
        {DURATIONS.map((d, i) => (
          <button
            key={d.label}
            onClick={() => handleSelectDuration(i)}
            style={{
              background: durationIdx === i ? 'rgba(255,255,255,0.10)' : 'transparent',
              border: 'none',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.15)' : 'none',
              color: durationIdx === i ? '#fff' : 'rgba(255,255,255,0.40)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 11, letterSpacing: '0.22em',
              padding: '8px 20px',
              cursor: running ? 'default' : 'pointer',
              transition: 'background 200ms, color 200ms',
              opacity: running && durationIdx !== i ? 0.4 : 1,
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Ring timer */}
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.5"
          />
          <circle
            cx="100" cy="100" r="80"
            fill="none"
            stroke={finished ? 'rgba(255,255,255,0.80)' : 'rgba(255,255,255,0.55)'}
            strokeWidth="1.5"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 4,
        }}>
          <div style={{
            fontFamily: "'Instrument Serif', serif",
            fontStyle: 'italic',
            fontSize: 42,
            color: finished ? 'rgba(255,255,255,0.90)' : '#fff',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}>
            {finished ? 'Done.' : fmt(remaining)}
          </div>
          {!finished && (
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9, letterSpacing: '0.28em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
            }}>
              {running ? 'focus' : remaining === totalSeconds ? 'ready' : 'paused'}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12 }}>
        {!finished && !running && (
          <button
            onClick={handleStart}
            style={{
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.28em',
              padding: '12px 32px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'background 200ms',
            }}
          >
            {remaining === totalSeconds ? 'Start' : 'Resume'}
          </button>
        )}
        {running && (
          <button
            onClick={handlePause}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.20)',
              color: '#fff',
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.28em',
              padding: '12px 32px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Pause
          </button>
        )}
        {(running || remaining < totalSeconds || finished) && (
          <button
            onClick={handleReset}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.40)',
              fontFamily: "'DM Mono', monospace",
              fontSize: 10, letterSpacing: '0.28em',
              padding: '12px 24px',
              cursor: 'pointer',
              textTransform: 'uppercase',
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Session count */}
      {sessionsToday > 0 && (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10, letterSpacing: '0.26em',
          color: 'rgba(255,255,255,0.30)',
          textTransform: 'uppercase',
        }}>
          {sessionsToday} session{sessionsToday !== 1 ? 's' : ''} today
        </div>
      )}
    </div>
  )
}
