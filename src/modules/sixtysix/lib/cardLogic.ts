import cardsData from '../../../data/cards.json'
import type { Arc, CardCollection } from '../store/sixtysix.store'

interface Card {
  id: string
  category: string
  text: string
  attribution: string
}

const cards = cardsData as Card[]

const PHASE_CATEGORIES: Record<string, string[]> = {
  ignition: ['Discipline', 'Adventure', 'Craft'],
  friction: ['Discipline', 'Stoicism', 'Quiet'],
  groove: ['Focus', 'Craft', 'Quiet'],
  lockin: ['Stoicism', 'Quiet', 'Focus'],
}

export function getCard(id: string): Card | undefined {
  return cards.find(c => c.id === id)
}

export function getAllCards(): Card[] {
  return cards
}

export function pullDailyCard(arc: Arc, collection: CardCollection): string {
  const preferredCats = PHASE_CATEGORIES[arc.phase] ?? []
  const collected = new Set(collection.collected)

  // Try preferred categories, uncollected
  let pool = cards.filter(c => preferredCats.includes(c.category) && !collected.has(c.id))

  // Fall back to any uncollected
  if (pool.length === 0) {
    pool = cards.filter(c => !collected.has(c.id))
  }

  // Fall back to any card
  if (pool.length === 0) {
    pool = [...cards]
  }

  const picked = pool[Math.floor(Math.random() * pool.length)]
  return picked.id
}
