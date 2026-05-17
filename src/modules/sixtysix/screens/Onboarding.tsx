import React, { useState, useRef, useEffect } from 'react'
import type { HabitType } from '../store/sixtysix.store'
import { useSixtysixStore } from '../store/sixtysix.store'
import { useIsMobile } from '../lib/useIsMobile'

// ─── Types ────────────────────────────────────────────────────────────────────

interface HabitDef {
  name: string
  type: HabitType
  target: number
  unit: string
  whyStatement: string
}

// ─── Shared style tokens ──────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'
const fg18 = 'rgba(255,255,255,0.18)'
const fg12 = 'rgba(255,255,255,0.12)'
const rule = 'rgba(255,255,255,0.10)'

const btnBase: React.CSSProperties = {
  fontFamily: mono,
  fontSize: 11,
  letterSpacing: '0.4em',
  textTransform: 'uppercase',
  cursor: 'pointer',
  background: 'transparent',
  color: '#fff',
  border: `1px solid ${fg40}`,
  padding: '14px 32px',
  transition: 'border-color 400ms ease-out, color 400ms ease-out',
}

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  border: '1px solid #fff',
}

const btnBack: React.CSSProperties = {
  ...btnBase,
  border: `1px solid ${fg18}`,
  color: fg40,
}

// ─── Default habits ───────────────────────────────────────────────────────────

const defaultHabits: HabitDef[] = [
  { name: 'Cold shower', type: 'toggle', target: 1, unit: '', whyStatement: '' },
  { name: 'Read', type: 'timer', target: 30, unit: 'min', whyStatement: '' },
  { name: 'Move', type: 'counter', target: 20, unit: 'min', whyStatement: '' },
]

// ─── HabitRow ─────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: HabitDef
  index: number
  canRemove: boolean
  onChange: (index: number, updates: Partial<HabitDef>) => void
  onRemove: (index: number) => void
  showNameError?: boolean
}

function HabitRow({ habit, index, canRemove, onChange, onRemove, showNameError }: HabitRowProps) {
  const types: HabitType[] = ['toggle', 'counter', 'timer', 'shoot']

  return (
    <div
      style={{
        borderTop: `1px solid ${rule}`,
        padding: '20px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <input
          value={habit.name}
          onChange={e => onChange(index, { name: e.target.value })}
          placeholder="Habit name"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom: showNameError ? '1px solid rgba(255,100,100,0.6)' : 'none',
            outline: 'none',
            fontFamily: sans,
            fontSize: 18,
            color: '#fff',
            padding: showNameError ? '0 0 4px' : 0,
          }}
        />
        {canRemove && (
          <button
            onClick={() => onRemove(index)}
            style={{
              background: 'transparent',
              border: 'none',
              color: fg25,
              cursor: 'pointer',
              fontSize: 18,
              padding: '0 4px',
              lineHeight: 1,
              transition: 'color 400ms ease-out',
            }}
            aria-label="Remove habit"
          >
            x
          </button>
        )}
      </div>

      {/* Why statement */}
      <input
        value={habit.whyStatement}
        onChange={e => onChange(index, { whyStatement: e.target.value })}
        placeholder="Why this habit? (required)"
        style={{
          flex: 1,
          background: 'transparent',
          border: 'none',
          borderBottom: showNameError && !habit.whyStatement.trim() ? '1px solid rgba(255,100,100,0.6)' : `1px solid ${fg12}`,
          outline: 'none',
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 15,
          color: habit.whyStatement ? fg60 : fg25,
          padding: '6px 0',
          width: '100%',
        }}
      />

      {/* Type toggle + target */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => onChange(index, { type: t, target: (t === 'toggle' || t === 'shoot') ? 1 : habit.target })}
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                padding: '6px 14px',
                cursor: 'pointer',
                border: `1px solid ${fg18}`,
                transition: 'background 400ms ease-out, color 400ms ease-out, border-color 400ms ease-out',
                background: habit.type === t ? '#fff' : 'transparent',
                color: habit.type === t ? '#000' : fg40,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {habit.type !== 'toggle' && habit.type !== 'shoot' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number"
              value={habit.target}
              min={1}
              onChange={e => onChange(index, { target: Number(e.target.value) })}
              style={{
                width: 56,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${fg25}`,
                outline: 'none',
                fontFamily: mono,
                fontSize: 13,
                color: '#fff',
                textAlign: 'center',
                padding: '4px 0',
              }}
            />
            <input
              value={habit.unit}
              onChange={e => onChange(index, { unit: e.target.value })}
              placeholder="unit"
              style={{
                width: 64,
                background: 'transparent',
                border: 'none',
                borderBottom: `1px solid ${fg25}`,
                outline: 'none',
                fontFamily: mono,
                fontSize: 11,
                color: fg60,
                padding: '4px 0',
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Screen 1 ─────────────────────────────────────────────────────────────────

interface Screen1Props {
  habits: HabitDef[]
  onChange: (index: number, updates: Partial<HabitDef>) => void
  onRemove: (index: number) => void
  onAdd: () => void
  triedAdvance: boolean
}

function Screen1({ habits, onChange, onRemove, onAdd, triedAdvance }: Screen1Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color: fg40,
          marginBottom: 16,
        }}
      >
        ARC ONE — DAY ZERO
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 32,
          color: '#fff',
          marginBottom: 48,
          lineHeight: 1.1,
        }}
      >
        Three habits. Sixty-six days.
      </div>

      <div>
        {habits.map((h, i) => (
          <HabitRow
            key={i}
            habit={h}
            index={i}
            canRemove={habits.length > 3}
            onChange={onChange}
            onRemove={onRemove}
            showNameError={triedAdvance && !h.name.trim()}
          />
        ))}
        <div style={{ borderTop: `1px solid ${rule}` }} />
      </div>

      {habits.length < 5 && (
        <button
          onClick={onAdd}
          style={{
            ...btnBase,
            border: `1px solid ${fg12}`,
            color: fg40,
            padding: '12px 0',
            marginTop: 20,
            width: '100%',
            fontSize: 10,
            letterSpacing: '0.36em',
          }}
        >
          + ADD HABIT
        </button>
      )}
    </div>
  )
}

// ─── Screen 2 ─────────────────────────────────────────────────────────────────

interface Screen2Props {
  identity: string
  setIdentity: (v: string) => void
}

function Screen2({ identity, setIdentity }: Screen2Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.36em',
          textTransform: 'uppercase',
          color: fg40,
          marginBottom: 40,
        }}
      >
        WHY THIS ARC
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 24,
          color: fg60,
          marginBottom: 24,
          lineHeight: 1.4,
        }}
      >
        By Day 66, I will be the kind of person who
      </div>

      <input
        ref={inputRef}
        value={identity}
        onChange={e => setIdentity(e.target.value)}
        placeholder="___"
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${fg25}`,
          outline: 'none',
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 28,
          color: '#fff',
          padding: '12px 0',
          width: '100%',
        }}
      />

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 13,
          color: fg25,
          marginTop: 12,
          lineHeight: 1.6,
        }}
      >
        e.g. "wakes up energised and physically strong" or "ships creative work every week"
      </div>
    </div>
  )
}

// ─── Screen 3 ─────────────────────────────────────────────────────────────────

function Screen3() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 24,
      }}
    >
      <div
        style={{
          fontFamily: mono,
          fontSize: 12,
          letterSpacing: '0.32em',
          textTransform: 'uppercase',
          color: fg40,
        }}
      >
        DAY ONE BEGINS AT 04:00
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(40px, 8vw, 64px)',
          color: '#fff',
          lineHeight: 1,
        }}
      >
        Begin.
      </div>

      <div
        style={{
          fontFamily: mono,
          fontSize: 8,
          letterSpacing: '0.2em',
          color: fg25,
          textTransform: 'uppercase',
          marginTop: 8,
        }}
      >
        Hard mode can be enabled in settings.
      </div>
    </div>
  )
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [habits, setHabits] = useState<HabitDef[]>(defaultHabits)
  const [identity, setIdentity] = useState('')
  const [flashing, setFlashing] = useState(false)
  const [triedAdvance, setTriedAdvance] = useState(false)

  const createArc = useSixtysixStore(s => s.createArc)
  const isMobile = useIsMobile()

  function changeHabit(index: number, updates: Partial<HabitDef>) {
    setHabits(prev => prev.map((h, i) => (i === index ? { ...h, ...updates } : h)))
  }

  function removeHabit(index: number) {
    setHabits(prev => prev.filter((_, i) => i !== index))
  }

  function addHabit() {
    setHabits(prev => [
      ...prev,
      { name: '', type: 'toggle', target: 1, unit: '', whyStatement: '' },
    ])
  }

  const missingWhy = habits.some(h => !h.whyStatement.trim())

  function canAdvance(): boolean {
    if (step === 1) return habits.length >= 3 && habits.every(h => h.name.trim().length > 0) && habits.every(h => h.whyStatement.trim().length > 0)
    if (step === 2) return identity.trim().length > 0
    return true
  }

  function back() {
    if (step === 2) setStep(1)
    else if (step === 3) setStep(2)
  }

  function next() {
    if (!canAdvance()) { setTriedAdvance(true); return }
    setTriedAdvance(false)
    if (step === 1) setStep(2)
    else if (step === 2) setStep(3)
    else {
      // Step 3 — commit
      createArc(
        habits.map(h => ({
          name: h.name,
          type: h.type,
          target: h.target,
          unit: h.unit || undefined,
          whyStatement: h.whyStatement,
        })),
        identity
      )
      setFlashing(true)
      setTimeout(() => setFlashing(false), 600)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Dot matrix texture */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '14px 14px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Header */}
      <header
        style={{
          padding: isMobile ? '20px 20px 0' : '28px 48px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            color: fg40,
            textTransform: 'uppercase',
          }}
        >
          CAM OS · THE 66
        </span>
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.32em',
            color: fg40,
            textTransform: 'uppercase',
          }}
        >
          STEP {step} / 3
        </span>
      </header>

      {/* Body */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile ? '0 20px' : '0 48px',
          maxWidth: 720,
          margin: '0 auto',
          width: '100%',
          position: 'relative',
          zIndex: 1,
          overflowY: 'auto',
        }}
      >
        {step === 1 && (
          <Screen1
            habits={habits}
            onChange={changeHabit}
            onRemove={removeHabit}
            onAdd={addHabit}
            triedAdvance={triedAdvance}
          />
        )}
        {step === 2 && <Screen2 identity={identity} setIdentity={setIdentity} />}
        {step === 3 && (
          <>
            <Screen3 />
            {missingWhy && (
              <div
                style={{
                  marginTop: 32,
                  fontFamily: mono,
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  color: fg40,
                  textTransform: 'uppercase',
                  textAlign: 'center',
                }}
              >
                ← Go back and add a why for each habit.
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          padding: isMobile
            ? `0 20px calc(28px + env(safe-area-inset-bottom))`
            : '0 48px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {step > 1 ? (
          <button onClick={back} style={btnBack}>
            BACK
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={next}
          disabled={!canAdvance()}
          style={{
            ...btnPrimary,
            opacity: canAdvance() ? 1 : 0.35,
            cursor: canAdvance() ? 'pointer' : 'not-allowed',
          }}
        >
          {step === 3 ? "I'M IN" : 'NEXT'}
        </button>
      </footer>

      {/* White flash */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#fff',
          opacity: flashing ? 0.85 : 0,
          transition: 'opacity 300ms',
          zIndex: 200,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
