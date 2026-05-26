import { useState } from 'react'
import { hapticSuccess } from '../lib/haptics'

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
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 28px calc(24px + env(safe-area-inset-bottom))',
        animation: 'fade-in 300ms ease both',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: mono,
          fontSize: 10,
          letterSpacing: '0.32em',
          color: 'rgba(255,255,255,0.30)',
          textTransform: 'uppercase',
          marginBottom: 24,
          textAlign: 'center',
        }}
      >
        TODAY'S MARK
      </div>

      {/* Identity read */}
      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(18px, 5vw, 26px)',
          color: 'rgba(255,255,255,0.85)',
          textAlign: 'center',
          maxWidth: 400,
          lineHeight: 1.5,
          marginBottom: 40,
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
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        ONE WORD FOR TODAY
      </div>

      <input
        autoFocus
        value={word}
        onChange={e => {
          const v = e.target.value.replace(/\s/g, '')
          setWord(v)
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' && trimmed) { hapticSuccess(); onSubmit(trimmed) }
          if (e.key === 'Escape') onDismiss()
        }}
        placeholder="—"
        maxLength={32}
        style={{
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.25)',
          outline: 'none',
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 8vw, 40px)',
          color: '#fff',
          textAlign: 'center',
          width: '100%',
          maxWidth: 300,
          padding: '10px 0',
          letterSpacing: '0.01em',
        }}
      />

      <div
        style={{
          display: 'flex',
          gap: 12,
          marginTop: 36,
          width: '100%',
          maxWidth: 300,
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            flex: 1,
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.30)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '16px 0',
            minHeight: 52,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>

        <button
          onClick={() => { if (trimmed) { hapticSuccess(); onSubmit(trimmed) } }}
          disabled={!trimmed}
          style={{
            flex: 2,
            fontFamily: mono,
            fontSize: 10,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: trimmed ? '#000' : 'rgba(255,255,255,0.25)',
            background: trimmed ? '#fff' : 'transparent',
            border: `1px solid ${trimmed ? '#fff' : 'rgba(255,255,255,0.10)'}`,
            padding: '16px 0',
            minHeight: 52,
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
