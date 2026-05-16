import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { dayToPhase, isMilestoneDay, todayString, computeCurrentDay } from '../lib/arcLogic'
import { writeSnapshot } from '../lib/snapshot'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Phase = 'ignition' | 'friction' | 'groove' | 'lockin'
export type HabitType = 'toggle' | 'counter' | 'timer'
export type ArcStatus = 'active' | 'complete' | 'broken'
export type Screen = 'onboarding' | 'habits' | 'settings' | 'cards' | 'history'
export type Tab = 'hub' | 'life' | 'habits' | 'work' | 'focus'
export type StreakBreakChoice = 'continue' | 'restart' | 'end' | 'defer'

export interface Arc {
  id: string
  startDate: string          // ISO date YYYY-MM-DD
  currentDay: number         // 1–66
  phase: Phase
  hardMode: boolean
  honestMissesUsed: number   // resets per phase
  marks: number
  status: ArcStatus
  identityStatement: string
}

export interface Habit {
  id: string
  arcId: string
  name: string
  whyStatement: string
  type: HabitType
  target: number
  unit?: string
  active: boolean
  createdAt: string
}

export interface DayLog {
  id: string
  date: string               // YYYY-MM-DD
  arcId: string
  habitId: string
  value: number
  complete: boolean
  honestMiss?: boolean
  reflection?: string
}

export interface CardCollection {
  collected: string[]
  lastPulledDate: string
  todayCardId: string | null
}

// ─── State ────────────────────────────────────────────────────────────────────

interface SixtysixState {
  arc: Arc | null
  habits: Habit[]
  logs: DayLog[]
  cards: CardCollection
  currentScreen: Screen
  currentTab: Tab
  drawerHabitId: string | null
  showMilestone: boolean
  milestoneDay: number | null
  showStreakBreak: boolean
  honestMissWordMin: number
}

// ─── Actions ──────────────────────────────────────────────────────────────────

interface SixtysixActions {
  createArc: (
    habitDefs: Array<{ name: string; type: HabitType; target: number; unit?: string; whyStatement: string }>,
    identityStatement: string
  ) => void
  logHabit: (habitId: string, value: number, date?: string) => void
  logHonestMiss: (habitId: string, reason: string, date?: string) => void
  rolloverDay: () => void
  setCurrentScreen: (screen: Screen) => void
  setCurrentTab: (tab: Tab) => void
  setDrawerHabitId: (habitId: string | null) => void
  dismissMilestone: () => void
  resolveStreakBreak: (choice: StreakBreakChoice) => void
  setTodayCard: (cardId: string) => void
  toggleHardMode: () => void
  setHonestMissWordMin: (min: number) => void
  addHabit: (def: { name: string; type: HabitType; target: number; unit?: string; whyStatement: string }) => void
  removeHabit: (habitId: string) => void
  updateHabit: (habitId: string, updates: Partial<Pick<Habit, 'name' | 'target' | 'unit' | 'whyStatement' | 'active'>>) => void
  exportArcData: () => void
  debugAdvanceDay: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

function allHabitsCompleteToday(
  arc: Arc,
  habits: Habit[],
  logs: DayLog[],
  date: string
): boolean {
  const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
  if (activeHabits.length === 0) return false
  return activeHabits.every(h => {
    const log = logs.find(l => l.habitId === h.id && l.date === date && l.arcId === arc.id)
    return log?.complete === true
  })
}

// ─── Initial State ────────────────────────────────────────────────────────────

const initialCards: CardCollection = {
  collected: [],
  lastPulledDate: '',
  todayCardId: null,
}

const initialState: SixtysixState = {
  arc: null,
  habits: [],
  logs: [],
  cards: initialCards,
  currentScreen: 'onboarding',
  currentTab: 'hub',
  drawerHabitId: null,
  showMilestone: false,
  milestoneDay: null,
  showStreakBreak: false,
  honestMissWordMin: 5,
}

// ─── Store ────────────────────────────────────────────────────────────────────

type SixtysixStore = SixtysixState & SixtysixActions

export const useSixtysixStore = create<SixtysixStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      createArc: (habitDefs, identityStatement) => {
        const arcId = makeId()
        const today = todayString()

        const arc: Arc = {
          id: arcId,
          startDate: today,
          currentDay: 1,
          phase: 'ignition',
          hardMode: false,
          honestMissesUsed: 0,
          marks: 0,
          status: 'active',
          identityStatement,
        }

        const habits: Habit[] = habitDefs.map(def => ({
          id: makeId(),
          arcId,
          name: def.name,
          whyStatement: def.whyStatement,
          type: def.type,
          target: def.target,
          unit: def.unit,
          active: true,
          createdAt: new Date().toISOString(),
        }))

        set({
          arc,
          habits,
          logs: [],
          cards: initialCards,
          currentScreen: 'habits',
          showMilestone: false,
          milestoneDay: null,
          showStreakBreak: false,
        })

        const state = get()
        writeSnapshot(arc, habits, state.logs, state.cards)
      },

      logHabit: (habitId, value, date) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return

        const logDate = date ?? todayString()
        const habit = habits.find(h => h.id === habitId)
        if (!habit) return

        const existingLogIdx = logs.findIndex(
          l => l.habitId === habitId && l.date === logDate && l.arcId === arc.id
        )

        const complete = value >= habit.target

        const newLog: DayLog = {
          id: existingLogIdx >= 0 ? logs[existingLogIdx].id : makeId(),
          date: logDate,
          arcId: arc.id,
          habitId,
          value,
          complete,
          honestMiss: false,
        }

        const newLogs =
          existingLogIdx >= 0
            ? logs.map((l, i) => (i === existingLogIdx ? newLog : l))
            : [...logs, newLog]

        // Check if all habits complete after this log
        const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
        const allComplete = activeHabits.every(h => {
          if (h.id === habitId) return complete
          const log = newLogs.find(l => l.habitId === h.id && l.date === logDate && l.arcId === arc.id)
          return log?.complete === true
        })

        let updatedArc = arc
        if (allComplete) {
          // Only increment marks if not already credited today
          const wasAlreadyComplete = allHabitsCompleteToday(arc, habits, logs, logDate)
          if (!wasAlreadyComplete) {
            updatedArc = { ...arc, marks: arc.marks + 1 }
          }
        }

        set({ logs: newLogs, arc: updatedArc })
        writeSnapshot(updatedArc, habits, newLogs, cards)
      },

      logHonestMiss: (habitId, reason, date) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return

        const logDate = date ?? todayString()
        const existingLogIdx = logs.findIndex(
          l => l.habitId === habitId && l.date === logDate && l.arcId === arc.id
        )

        const newLog: DayLog = {
          id: existingLogIdx >= 0 ? logs[existingLogIdx].id : makeId(),
          date: logDate,
          arcId: arc.id,
          habitId,
          value: 0,
          complete: false,
          honestMiss: true,
          reflection: reason,
        }

        const newLogs =
          existingLogIdx >= 0
            ? logs.map((l, i) => (i === existingLogIdx ? newLog : l))
            : [...logs, newLog]

        const updatedArc = {
          ...arc,
          honestMissesUsed: arc.honestMissesUsed + 1,
        }

        set({ logs: newLogs, arc: updatedArc })
        writeSnapshot(updatedArc, habits, newLogs, cards)
      },

      rolloverDay: () => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc || arc.status !== 'active') return

        const computedDay = computeCurrentDay(arc.startDate)
        if (computedDay <= arc.currentDay) return // no rollover needed

        const newDay = computedDay
        const newPhase = dayToPhase(newDay)
        const phaseChanged = newPhase !== arc.phase

        // Check streak break: was yesterday complete?
        const yesterday = new Date(todayString())
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().slice(0, 10)
        const activeHabits = habits.filter(h => h.arcId === arc.id && h.active)
        const yesterdayComplete = activeHabits.every(h => {
          const log = logs.find(l => l.habitId === h.id && l.date === yesterdayStr && l.arcId === arc.id)
          return log?.complete === true || log?.honestMiss === true
        })

        const streakBroke = !yesterdayComplete && arc.currentDay > 1

        let updatedArc: Arc = {
          ...arc,
          currentDay: newDay,
          phase: newPhase,
          honestMissesUsed: phaseChanged ? 0 : arc.honestMissesUsed,
        }

        if (newDay > 66) {
          updatedArc = { ...updatedArc, status: 'complete' }
        }

        const showMilestone = isMilestoneDay(newDay)

        set({
          arc: updatedArc,
          showMilestone,
          milestoneDay: showMilestone ? newDay : null,
          showStreakBreak: streakBroke,
        })

        writeSnapshot(updatedArc, habits, logs, cards)
      },

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      setCurrentTab: (tab) => set({ currentTab: tab }),

      setDrawerHabitId: (habitId) => set({ drawerHabitId: habitId }),

      dismissMilestone: () => set({ showMilestone: false, milestoneDay: null }),

      resolveStreakBreak: (choice) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return

        if (choice === 'restart') {
          const today = todayString()
          const updatedArc: Arc = {
            ...arc,
            startDate: today,
            currentDay: 1,
            phase: 'ignition',
            honestMissesUsed: 0,
            marks: 0,
            status: 'active',
          }
          set({ arc: updatedArc, showStreakBreak: false, logs: [] })
          writeSnapshot(updatedArc, habits, [], cards)
        } else if (choice === 'end') {
          const updatedArc: Arc = { ...arc, status: 'broken' }
          set({ arc: updatedArc, showStreakBreak: false })
          writeSnapshot(updatedArc, habits, logs, cards)
        } else {
          // 'continue' or 'defer' — just dismiss
          set({ showStreakBreak: false })
        }
      },

      setTodayCard: (cardId) => {
        const state = get()
        const today = todayString()
        const updatedCards: CardCollection = {
          ...state.cards,
          collected: state.cards.collected.includes(cardId)
            ? state.cards.collected
            : [...state.cards.collected, cardId],
          todayCardId: cardId,
          lastPulledDate: today,
        }
        set({ cards: updatedCards })
        writeSnapshot(state.arc, state.habits, state.logs, updatedCards)
      },

      toggleHardMode: () => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return
        const updatedArc = { ...arc, hardMode: !arc.hardMode }
        set({ arc: updatedArc })
        writeSnapshot(updatedArc, habits, logs, cards)
      },

      setHonestMissWordMin: (min) => set({ honestMissWordMin: min }),

      addHabit: (def) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return

        const newHabit: Habit = {
          id: makeId(),
          arcId: arc.id,
          name: def.name,
          whyStatement: def.whyStatement,
          type: def.type,
          target: def.target,
          unit: def.unit,
          active: true,
          createdAt: new Date().toISOString(),
        }

        const newHabits = [...habits, newHabit]
        set({ habits: newHabits })
        writeSnapshot(arc, newHabits, logs, cards)
      },

      removeHabit: (habitId) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return
        const newHabits = habits.filter(h => h.id !== habitId)
        set({ habits: newHabits })
        writeSnapshot(arc, newHabits, logs, cards)
      },

      updateHabit: (habitId, updates) => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return
        const newHabits = habits.map(h =>
          h.id === habitId ? { ...h, ...updates } : h
        )
        set({ habits: newHabits })
        writeSnapshot(arc, newHabits, logs, cards)
      },

      exportArcData: () => {
        const state = get()
        const { arc, habits, logs } = state
        if (!arc) return

        const data = {
          arc,
          habits: habits.filter(h => h.arcId === arc.id),
          logs: logs.filter(l => l.arcId === arc.id),
          exportedAt: new Date().toISOString(),
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `cam-os-arc-${arc.id}-day${arc.currentDay}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      debugAdvanceDay: () => {
        const state = get()
        const { arc, habits, logs, cards } = state
        if (!arc) return

        const newDay = Math.min(arc.currentDay + 1, 66)
        const newPhase = dayToPhase(newDay)
        const phaseChanged = newPhase !== arc.phase
        const showMilestone = isMilestoneDay(newDay)

        const updatedArc: Arc = {
          ...arc,
          currentDay: newDay,
          phase: newPhase,
          honestMissesUsed: phaseChanged ? 0 : arc.honestMissesUsed,
          status: newDay >= 66 ? 'complete' : arc.status,
        }

        set({
          arc: updatedArc,
          showMilestone,
          milestoneDay: showMilestone ? newDay : null,
        })

        writeSnapshot(updatedArc, habits, logs, cards)
      },
    }),
    {
      name: 'cam-os-sixtysix',
    }
  )
)
