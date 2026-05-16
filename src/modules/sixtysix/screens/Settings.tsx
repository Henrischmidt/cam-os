import { useSixtysixStore } from '../store/sixtysix.store'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'
const rule = 'rgba(255,255,255,0.10)'
const sectionBorder = 'rgba(255,255,255,0.05)'

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: 'relative',
        width: 44,
        height: 24,
        borderRadius: 100,
        border: `1px solid rgba(255,255,255,0.25)`,
        background: on ? '#fff' : 'transparent',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'background 300ms ease',
      }}
      aria-checked={on}
      role="switch"
    >
      <span
        style={{
          position: 'absolute',
          top: '50%',
          transform: 'translateY(-50%)',
          left: on ? 'calc(100% - 20px)' : 4,
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: on ? '#000' : fg40,
          transition: 'left 300ms ease, background 300ms ease',
        }}
      />
    </button>
  )
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 10,
        letterSpacing: '0.32em',
        color: fg40,
        textTransform: 'uppercase',
        paddingBottom: 12,
        borderBottom: `1px solid ${sectionBorder}`,
        marginTop: 40,
      }}
    >
      {label}
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTop: `1px solid ${rule}`,
        padding: '20px 0',
      }}
    >
      <span
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.2em',
          color: fg60,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>{children}</div>
    </div>
  )
}

// ─── Stepper ──────────────────────────────────────────────────────────────────

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    border: `1px solid rgba(255,255,255,0.10)`,
    background: 'transparent',
    color: '#fff',
    fontFamily: mono,
    fontSize: 14,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return (
    <div style={{ display: 'inline-flex', border: `1px solid rgba(255,255,255,0.10)` }}>
      <button style={btnStyle} onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <div
        style={{
          minWidth: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: mono,
          fontSize: 12,
          color: '#fff',
          borderLeft: `1px solid rgba(255,255,255,0.10)`,
          borderRight: `1px solid rgba(255,255,255,0.10)`,
        }}
      >
        {value}
      </div>
      <button style={btnStyle} onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  )
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export default function Settings() {
  const {
    arc,
    habits,
    honestMissWordMin,
    setCurrentScreen,
    toggleHardMode,
    setHonestMissWordMin,
    exportArcData,
  } = useSixtysixStore()

  const arcHabits = habits.filter(h => arc ? h.arcId === arc.id && h.active : false)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 70,
        overflowY: 'auto',
        padding: '40px 56px 100px',
      }}
    >
      {/* Back header */}
      <button
        onClick={() => setCurrentScreen('habits')}
        style={{
          fontFamily: mono,
          fontSize: 11,
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: fg40,
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        ← HABITS
      </button>

      {/* Title */}
      <h1
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 42,
          fontWeight: 400,
          color: '#fff',
          margin: '0 0 8px',
          lineHeight: 1.1,
        }}
      >
        Settings.
      </h1>

      {/* ── HONESTY ── */}
      <SectionHeader label="Honesty" />

      <Row label="Honest Misses This Phase">
        <span
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: fg60,
            letterSpacing: '0.04em',
          }}
        >
          {arc ? arc.honestMissesUsed : 0} / 1
        </span>
      </Row>

      <Row label="Minimum Words">
        <Stepper
          value={honestMissWordMin}
          min={3}
          max={10}
          onChange={setHonestMissWordMin}
        />
      </Row>

      {/* ── HARD MODE ── */}
      <SectionHeader label="Hard Mode" />

      <Row label="Hard Mode">
        <ToggleSwitch
          on={arc?.hardMode ?? false}
          onToggle={toggleHardMode}
        />
      </Row>

      {arc?.hardMode && (
        <p
          style={{
            fontFamily: sans,
            fontSize: 12,
            color: fg25,
            margin: '0 0 4px',
            lineHeight: 1.6,
          }}
        >
          Honesty disabled. Any missed day resets the streak.
        </p>
      )}

      {/* ── DAY ROLLOVER ── */}
      <SectionHeader label="Day Rollover" />

      <Row label="Day Begins At">
        <span
          style={{
            fontFamily: mono,
            fontSize: 12,
            color: fg40,
            border: `1px solid rgba(255,255,255,0.12)`,
            borderRadius: 100,
            padding: '4px 14px',
            letterSpacing: '0.1em',
          }}
        >
          04:00
        </span>
      </Row>

      {/* ── HABITS ── */}
      <SectionHeader label="Manage Habits" />

      {arcHabits.length === 0 ? (
        <div
          style={{
            borderTop: `1px solid ${rule}`,
            padding: '20px 0',
            fontFamily: mono,
            fontSize: 11,
            color: fg25,
            letterSpacing: '0.14em',
          }}
        >
          No habits yet.
        </div>
      ) : (
        arcHabits.map(h => (
          <div
            key={h.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: `1px solid ${rule}`,
              padding: '20px 0',
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 14,
                color: fg60,
              }}
            >
              {h.name}
            </span>
            <span
              style={{
                fontFamily: mono,
                fontSize: 9,
                letterSpacing: '0.2em',
                color: fg25,
                textTransform: 'uppercase',
              }}
            >
              {h.type}
            </span>
          </div>
        ))
      )}

      <p
        style={{
          fontFamily: mono,
          fontSize: 10,
          color: fg25,
          letterSpacing: '0.14em',
          marginTop: 4,
          marginBottom: 0,
        }}
      >
        Full habit editing in Phase 3.
      </p>

      {/* ── DATA ── */}
      <SectionHeader label="Data" />

      <Row label="Export Arc Data">
        <button
          onClick={exportArcData}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: fg60,
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.12)`,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          Export
        </button>
      </Row>

      {/* ── DANGER ZONE ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          margin: '48px 0 16px',
        }}
      >
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <span
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: '0.32em',
            color: fg25,
            textTransform: 'uppercase',
          }}
        >
          Danger
        </span>
        <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
      </div>

      <Row label="End Arc Early">
        <button
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
            background: 'transparent',
            border: `1px solid rgba(255,255,255,0.08)`,
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          End Arc
        </button>
      </Row>
    </div>
  )
}
