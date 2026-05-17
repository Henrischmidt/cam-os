const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"
const sans = "'Outfit', sans-serif"

interface CatchUpFlowProps {
  daysAway: number
  onContinue: () => void
}

export default function CatchUpFlow({ daysAway, onContinue }: CatchUpFlowProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 85,
        background: '#000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 56px',
        animation: 'fade-in 400ms ease both',
      }}
    >
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
        WELCOME BACK
      </div>

      <div
        style={{
          fontFamily: serif,
          fontStyle: 'italic',
          fontSize: 'clamp(26px, 4vw, 38px)',
          color: '#fff',
          textAlign: 'center',
          lineHeight: 1.3,
          maxWidth: 520,
          marginBottom: 20,
        }}
      >
        {daysAway === 1
          ? 'You were away for a day.'
          : `You were away for ${daysAway} days.`}
      </div>

      <div
        style={{
          fontFamily: sans,
          fontWeight: 300,
          fontSize: 15,
          color: 'rgba(255,255,255,0.50)',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.7,
          marginBottom: 64,
        }}
      >
        Life happens. The arc is still yours. Pick up where it counts.
      </div>

      {/* Single option */}
      <button
        onClick={onContinue}
        style={{
          width: 'min(480px, 100%)',
          border: '1px solid #fff',
          background: 'transparent',
          padding: '22px 32px',
          cursor: 'pointer',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: mono,
            fontSize: 11,
            letterSpacing: '0.36em',
            textTransform: 'uppercase',
            color: '#fff',
          }}
        >
          CONTINUE — PICK UP FROM TODAY
        </span>
        <span
          style={{
            fontFamily: sans,
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
          }}
        >
          The arc counts forward from here.
        </span>
      </button>

      <div
        style={{
          fontFamily: mono,
          fontSize: 8,
          letterSpacing: '0.2em',
          color: 'rgba(255,255,255,0.20)',
          textTransform: 'uppercase',
          marginTop: 40,
          textAlign: 'center',
        }}
      >
        Honest misses can be logged from the habit drawer.
      </div>
    </div>
  )
}
