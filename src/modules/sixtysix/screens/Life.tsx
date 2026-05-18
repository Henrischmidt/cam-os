import { useState } from 'react'
import { useSixtysixStore } from '../store/sixtysix.store'
import type { LifeHabit } from '../store/sixtysix.store'
import { todayString } from '../lib/arcLogic'
import { hapticLight, hapticMedium } from '../lib/haptics'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const fg60 = 'rgba(255,255,255,0.60)'
const fg25 = 'rgba(255,255,255,0.25)'
const fg12 = 'rgba(255,255,255,0.12)'

// ─── Water widget ─────────────────────────────────────────────────────────────

function WaterWidget({ value, target, onAdd, onRemove }: {
  value: number; target: number; onAdd: () => void; onRemove: () => void
}) {
  const done = value >= target

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{
        fontFamily: mono, fontSize: 9, letterSpacing: '0.36em',
        color: fg25, textTransform: 'uppercase', marginBottom: 20,
      }}>
        Water
      </div>

      {/* Big counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
        <button
          onClick={() => { hapticLight(); onRemove() }}
          style={{
            width: 44, height: 44, border: `1px solid ${fg12}`,
            background: 'transparent', color: fg60,
            fontFamily: mono, fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          −
        </button>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            fontFamily: mono, fontSize: 72, letterSpacing: '-0.02em', lineHeight: 1,
            color: done ? '#fff' : 'rgba(255,255,255,0.85)',
            transition: 'color 300ms ease',
          }}>
            {value}
          </div>
          <div style={{
            fontFamily: mono, fontSize: 10, letterSpacing: '0.2em',
            color: fg25, textTransform: 'uppercase', marginTop: 6,
          }}>
            {done ? 'target reached' : `of ${target} glasses`}
          </div>
        </div>

        <button
          onClick={() => { hapticLight(); onAdd() }}
          style={{
            width: 44, height: 44, border: `1px solid ${done ? 'rgba(255,255,255,0.30)' : fg60}`,
            background: 'transparent', color: done ? 'rgba(255,255,255,0.40)' : '#fff',
            fontFamily: mono, fontSize: 22, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'border-color 300ms ease, color 300ms ease',
          }}
        >
          +
        </button>
      </div>

      {/* Fill bar — 8 segments */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array.from({ length: target }, (_, i) => (
          <div key={i} style={{
            flex: 1, height: 3,
            background: i < value ? '#fff' : fg12,
            transition: 'background 200ms ease',
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Life habit row ───────────────────────────────────────────────────────────

function LifeRow({ habit, value, onTap, onRemove }: {
  habit: LifeHabit
  value: number
  onTap: (delta: number) => void
  onRemove: () => void
}) {
  const done = value >= habit.target
  const pct = habit.type === 'counter' ? Math.min(100, habit.target > 0 ? (value / habit.target) * 100 : 0) : (done ? 100 : 0)

  return (
    <div style={{
      borderBottom: `1px solid rgba(255,255,255,0.05)`,
      paddingTop: 14, paddingBottom: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Name + progress */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 400,
            color: done ? 'rgba(255,255,255,0.35)' : '#fff',
            transition: 'color 300ms ease',
            marginBottom: 6,
          }}>
            {habit.name}
            {habit.unit && (
              <span style={{ fontFamily: mono, fontSize: 9, color: fg25, marginLeft: 8, letterSpacing: '0.2em' }}>
                {habit.target} {habit.unit}
              </span>
            )}
          </div>
          <div style={{ height: 1, background: fg12, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: 0, left: 0, height: '100%',
              width: `${pct}%`,
              background: done ? 'rgba(255,255,255,0.50)' : '#fff',
              transition: 'width 300ms cubic-bezier(0.16,1,0.3,1)',
            }} />
          </div>
        </div>

        {/* Controls */}
        {habit.type === 'check' ? (
          <button
            onClick={() => { hapticLight(); onTap(done ? -1 : 1) }}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: done ? '1px solid rgba(255,255,255,0.40)' : `1px solid ${fg12}`,
              background: done ? 'rgba(255,255,255,0.12)' : 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 200ms ease, border-color 200ms ease',
            }}
          >
            {done && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <polyline points="3,7 6,10 11,4" stroke="rgba(255,255,255,0.70)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontFamily: mono, fontSize: 13, color: done ? fg60 : '#fff', minWidth: 24, textAlign: 'center' }}>
              {value}
            </span>
            <button
              onClick={() => { hapticLight(); onTap(1) }}
              style={{
                width: 28, height: 28, border: `1px solid ${fg12}`,
                background: 'transparent', color: fg60,
                fontFamily: mono, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              +
            </button>
          </div>
        )}

        {/* Delete */}
        {!habit.id.startsWith('life-water') && (
          <button
            onClick={() => { hapticMedium(); onRemove() }}
            style={{
              background: 'transparent', border: 'none',
              color: 'rgba(255,255,255,0.15)', cursor: 'pointer',
              fontFamily: mono, fontSize: 14, padding: '4px 8px',
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Life screen ──────────────────────────────────────────────────────────────

const SLIDE_CSS = `
@keyframes tabSlideIn {
  from { opacity: 0; transform: translateX(10px); }
  to   { opacity: 1; transform: translateX(0); }
}
`

export default function Life() {
  const {
    lifeHabits, lifeLogs, dayBeginsHour,
    logLifeHabit, addLifeHabit, removeLifeHabit,
  } = useSixtysixStore()

  const today = todayString(dayBeginsHour)
  const todayLog = lifeLogs[today] ?? {}

  const water = lifeHabits.find(h => h.id === 'life-water')!
  const waterValue = todayLog['life-water'] ?? 0
  const otherHabits = lifeHabits.filter(h => h.id !== 'life-water')

  const doneCount = lifeHabits.filter(h => (todayLog[h.id] ?? 0) >= h.target).length

  return (
    <>
      <style>{SLIDE_CSS}</style>
      <div style={{
        height: '100%', overflowY: 'auto',
        padding: '20px 20px calc(80px + env(safe-area-inset-bottom))',
        paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
        animation: 'tabSlideIn 250ms ease-out',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <h1 style={{
              fontFamily: serif, fontStyle: 'italic', fontSize: 42,
              fontWeight: 400, color: '#fff', margin: 0, lineHeight: 1.1,
            }}>
              Life.
            </h1>
            <span style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.28em',
              color: fg25, textTransform: 'uppercase',
            }}>
              {doneCount}/{lifeHabits.length} done
            </span>
          </div>
          <div style={{
            fontFamily: serif, fontStyle: 'italic', fontSize: 16,
            color: fg60, marginTop: 8,
          }}>
            Small inputs compound.
          </div>
        </div>

        {/* Water */}
        <WaterWidget
          value={waterValue}
          target={water.target}
          onAdd={() => logLifeHabit('life-water', waterValue + 1)}
          onRemove={() => logLifeHabit('life-water', waterValue - 1)}
        />

        {/* Divider */}
        <div style={{ height: 1, background: fg12, marginBottom: 24 }} />

        {/* Other life habits */}
        <div>
          {otherHabits.map(habit => (
            <LifeRow
              key={habit.id}
              habit={habit}
              value={todayLog[habit.id] ?? 0}
              onTap={(delta) => logLifeHabit(habit.id, (todayLog[habit.id] ?? 0) + delta)}
              onRemove={() => removeLifeHabit(habit.id)}
            />
          ))}
        </div>

        {/* Add habit */}
        <AddLifeHabitForm onAdd={addLifeHabit} />
      </div>
    </>
  )
}

// ─── Add form ─────────────────────────────────────────────────────────────────

function AddLifeHabitForm({ onAdd }: { onAdd: (def: Omit<LifeHabit, 'id'>) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<'check' | 'counter'>('check')
  const [target, setTarget] = useState(1)
  const [unit, setUnit] = useState('')

  function submit() {
    if (!name.trim()) return
    onAdd({ name: name.trim(), type, target, unit: unit.trim() || undefined })
    setName(''); setType('check'); setTarget(1); setUnit('')
    setOpen(false)
    hapticLight()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', marginTop: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'transparent', color: fg25,
          fontFamily: mono, fontSize: 10, letterSpacing: '0.32em',
          textTransform: 'uppercase', padding: '14px 0', cursor: 'pointer',
        }}
      >
        + Add
      </button>
    )
  }

  return (
    <div style={{ marginTop: 20, border: '1px solid rgba(255,255,255,0.10)', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Habit name"
        style={{
          background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)',
          color: '#fff', fontFamily: serif, fontStyle: 'italic', fontSize: 18,
          padding: '8px 0', outline: 'none', width: '100%',
        }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        {(['check', 'counter'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            style={{
              flex: 1, padding: '10px 0',
              border: type === t ? '1px solid #fff' : '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: type === t ? '#fff' : fg60,
              fontFamily: mono, fontSize: 10, letterSpacing: '0.2em',
              textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {type === 'counter' && (
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="number"
            value={target}
            min={1}
            onChange={e => setTarget(Number(e.target.value))}
            style={{
              width: 60, background: 'transparent',
              border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontFamily: mono, fontSize: 16,
              padding: '6px 0', outline: 'none', textAlign: 'center',
            }}
          />
          <input
            value={unit}
            onChange={e => setUnit(e.target.value)}
            placeholder="unit (e.g. cups)"
            style={{
              flex: 1, background: 'transparent',
              border: 'none', borderBottom: '1px solid rgba(255,255,255,0.18)',
              color: '#fff', fontFamily: serif, fontStyle: 'italic', fontSize: 16,
              padding: '6px 0', outline: 'none',
            }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => setOpen(false)}
          style={{
            flex: 1, padding: '12px 0', border: '1px solid rgba(255,255,255,0.10)',
            background: 'transparent', color: fg60,
            fontFamily: mono, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          style={{
            flex: 2, padding: '12px 0', border: '1px solid #fff',
            background: 'transparent', color: '#fff',
            fontFamily: mono, fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', cursor: 'pointer',
            opacity: name.trim() ? 1 : 0.4,
          }}
        >
          Add
        </button>
      </div>
    </div>
  )
}

