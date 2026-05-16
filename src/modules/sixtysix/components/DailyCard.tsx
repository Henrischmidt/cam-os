import React from 'react'
import cardsData from '../../../data/cards.json'

interface CardEntry {
  id: string
  category: string
  text: string
  attribution: string
}

interface DailyCardProps {
  cardId: string | null
  className?: string
}

const cards = cardsData as CardEntry[]

export default function DailyCard({ cardId, className }: DailyCardProps) {
  if (!cardId) return null

  const card = cards.find(c => c.id === cardId)
  if (!card) return null

  const containerStyle: React.CSSProperties = {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '22px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'center',
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '9px',
    letterSpacing: '0.34em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    lineHeight: 1,
  }

  const quoteStyle: React.CSSProperties = {
    fontFamily: "'Instrument Serif', serif",
    fontStyle: 'italic',
    fontSize: '16px',
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.60)',
    maxWidth: '480px',
  }

  const attributionStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: '8px',
    letterSpacing: '0.32em',
    color: 'rgba(255,255,255,0.25)',
    textTransform: 'uppercase',
    lineHeight: 1,
  }

  return (
    <div style={containerStyle} className={className}>
      <span style={labelStyle}>THE LINE YOU CARRIED IN</span>
      <p style={quoteStyle}>{card.text}</p>
      <span style={attributionStyle}>{card.attribution}</span>
    </div>
  )
}
