import { useState } from 'react'

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"

interface DayCompleteModalProps {
  identityStatement: string
  onSubmit: (reflection: string) => void
  onDismiss: () => void
}

export default function DayCompleteModal({ identityStatement, onSubmit, onDismiss }: DayCompleteModalProps) {
  const [word, setWord] = useState('')
  const trimmed = word.trim()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 48px',
        animation: 'fade-in 300ms ease both',
      }}
    >
      {/* Identity read */}
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.30)',
          textTransform: 'uppercase',
          marginBottom: 32,
        }}
      >
        TODAY'S MARK
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(22px, 3vw, 30px)',
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          maxWidth: 600,
          lineHeight: 1.4,
          marginBottom: 56,
        }}
      >
        Today you were the kind of person who{' '}
        <em style={{ color: '#fff' }}>{identityStatement}</em>.
      </div>

      {/* Reflection prompt */}
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.40)',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}
      >
        ONE WORD FOR TODAY
      </div>

      <input
        autoFocus
        value={word}
        onChange={e => {
          // Single word only — no spaces
          const v = e.target.value.replace(/\s/g, '')
          setWord(v)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && trimmed) onSubmit(trimmed)
          if (e.key === 'Escape') onDismiss()
        }}
        placeholder="___"
        maxLength={32}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          outline: 'none',
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 36,
          color: '#fff',
          textAlign: 'center',
          width: 'min(300px, 80vw)',
          padding: '12px 0',
          letterSpacing: '0.01em',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 40,
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '14px 28px',
            cursor: 'pointer',
          }}
        >
          Skip
        </button>

        <button
          onClick={() => { if (trimmed) onSubmit(trimmed) }}
          disabled={!trimmed}
          style={{
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: trimmed ? '#000' : 'rgba(255,255,255,0.30)',
            background: trimmed ? '#fff' : 'transparent',
            border: `1px solid ${trimmed ? '#fff' : 'rgba(255,255,255,0.10)'}`,
            padding: '14px 28px',
            cursor: trimmed ? 'pointer' : 'default',
            transition: 'background 250ms ease, color 250ms ease, border-color 250ms ease',
          }}
        >
          Mark the Day
        </button>
      </div>
    </div>
  )
}
