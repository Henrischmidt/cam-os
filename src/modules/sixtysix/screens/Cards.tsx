import { useSixtysixStore } from '../store/sixtysix.store'
import { getAllCards, getCard } from '../lib/cardLogic'

// ─── Style tokens ─────────────────────────────────────────────────────────────

const mono = "'DM Mono', monospace"
const serif = "'Instrument Serif', serif"

const fg60 = 'rgba(255,255,255,0.60)'
const fg40 = 'rgba(255,255,255,0.40)'
const fg25 = 'rgba(255,255,255,0.25)'

// ─── Cards ────────────────────────────────────────────────────────────────────

export default function Cards() {
  const { cards, setCurrentScreen } = useSixtysixStore()

  const allCards = getAllCards()
  const totalCards = allCards.length
  const collectedCount = cards.collected.length

  const todayCard = cards.todayCardId ? getCard(cards.todayCardId) : undefined

  const collectedCards = cards.collected
    .map(id => getCard(id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 70,
        overflowY: 'auto',
        padding: 'calc(env(safe-area-inset-top) + 20px) 20px calc(80px + env(safe-area-inset-bottom))',
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
          margin: '0 0 40px',
          lineHeight: 1.1,
        }}
      >
        Cards.
      </h1>

      {/* Today's card */}
      {todayCard && (
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              fontFamily: mono,
              fontSize: 9,
              letterSpacing: '0.32em',
              color: fg40,
              textTransform: 'uppercase',
              marginBottom: 20,
            }}
          >
            Today's Card
          </div>

          <div
            style={{
              border: '1px solid rgba(255,255,255,0.18)',
              padding: '32px 36px',
            }}
          >
            <div
              style={{
                fontFamily: mono,
                fontSize: 8,
                letterSpacing: '0.28em',
                color: fg25,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              {todayCard.category}
            </div>

            <p
              style={{
                fontFamily: serif,
                fontStyle: 'italic',
                fontSize: 20,
                color: '#fff',
                lineHeight: 1.5,
                margin: '0 0 20px',
              }}
            >
              {todayCard.text}
            </p>

            <div
              style={{
                fontFamily: mono,
                fontSize: 10,
                letterSpacing: '0.16em',
                color: fg40,
                textTransform: 'uppercase',
              }}
            >
              — {todayCard.attribution}
            </div>
          </div>
        </div>
      )}

      {/* Collection */}
      <div>
        <div
          style={{
            fontFamily: mono,
            fontSize: 9,
            letterSpacing: '0.32em',
            color: fg40,
            textTransform: 'uppercase',
            marginBottom: 20,
          }}
        >
          Collected — {collectedCount} / {totalCards}
        </div>

        {collectedCards.length === 0 ? (
          <p
            style={{
              fontFamily: serif,
              fontStyle: 'italic',
              fontSize: 18,
              color: fg25,
              margin: 0,
            }}
          >
            Cards arrive daily.
          </p>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 16,
            }}
          >
            {collectedCards.map(card => (
              <div
                key={card.id}
                style={{
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: '20px 22px',
                }}
              >
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 8,
                    letterSpacing: '0.28em',
                    color: fg25,
                    textTransform: 'uppercase',
                    marginBottom: 12,
                  }}
                >
                  {card.category}
                </div>

                <p
                  style={{
                    fontFamily: serif,
                    fontStyle: 'italic',
                    fontSize: 13,
                    color: fg60,
                    lineHeight: 1.55,
                    margin: '0 0 12px',
                  }}
                >
                  {card.text}
                </p>

                <div
                  style={{
                    fontFamily: mono,
                    fontSize: 9,
                    letterSpacing: '0.12em',
                    color: fg25,
                  }}
                >
                  — {card.attribution}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
