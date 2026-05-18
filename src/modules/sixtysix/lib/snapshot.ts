import type { Arc, Habit, DayLog, CardCollection } from '../store/sixtysix.store'
import { getCard } from './cardLogic'
import { todayString } from './arcLogic'
import { writeToICloud } from './icloudSync'
import { fireWebhook } from './webhook'

const SNAPSHOT_KEY = 'cam-os-sixtysix-snapshot'

interface HabitSnapshot {
  name: string
  type: string
  complete: boolean
  current?: number
  target?: number
}

interface Snapshot {
  version: 1
  lastUpdated: string
  arc: {
    currentDay: number
    phase: string
    streak: number
    marks: number
    status: string
  }
  habitsToday: HabitSnapshot[]
  todayCard: { text: string; attribution: string } | null
}

/** Read the last-written snapshot JSON from localStorage (for manual iOS export). */
export function readSnapshotJson(): string | null {
  try {
    return localStorage.getItem(SNAPSHOT_KEY)
  } catch {
    return null
  }
}

export function writeSnapshot(
  arc: Arc | null,
  habits: Habit[],
  logs: DayLog[],
  cards: CardCollection,
  webhookUrl = ''
): void {
  if (!arc) return

  const today = todayString()
  const todayLogs = logs.filter(l => l.date === today && l.arcId === arc.id)

  // Compute streak: consecutive complete days up to yesterday
  const streak = computeStreak(arc, logs)

  const habitsToday: HabitSnapshot[] = habits
    .filter(h => h.arcId === arc.id && h.active)
    .map(h => {
      const log = todayLogs.find(l => l.habitId === h.id)
      return {
        name: h.name,
        type: h.type,
        complete: log?.complete ?? false,
        current: log?.value,
        target: h.target,
      }
    })

  const card = cards.todayCardId ? getCard(cards.todayCardId) : null

  const snapshot: Snapshot = {
    version: 1,
    lastUpdated: new Date().toISOString(),
    arc: {
      currentDay: arc.currentDay,
      phase: arc.phase,
      streak,
      marks: arc.marks,
      status: arc.status,
    },
    habitsToday,
    todayCard: card ? { text: card.text, attribution: card.attribution } : null,
  }

  const json = JSON.stringify(snapshot)

  try {
    localStorage.setItem(SNAPSHOT_KEY, json)
  } catch {
    // localStorage might be unavailable
  }

  writeToICloud(json).catch(() => {})
  fireWebhook(webhookUrl, snapshot).catch(() => {})
}

function computeStreak(arc: Arc, logs: DayLog[]): number {
  // Count consecutive days where all habits were complete, going backwards from yesterday
  let streak = 0
  const arcLogs = logs.filter(l => l.arcId === arc.id && l.complete)
  const completeDates = new Set(arcLogs.map(l => l.date))

  const today = new Date(todayString())
  for (let i = 1; i <= arc.currentDay; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    if (completeDates.has(dateStr)) {
      streak++
    } else {
      break
    }
  }
  return streak
}
