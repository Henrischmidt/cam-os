import type { Phase } from '../store/sixtysix.store'

export function dayToPhase(day: number): Phase {
  if (day <= 7) return 'ignition'
  if (day <= 21) return 'friction'
  if (day <= 45) return 'groove'
  return 'lockin'
}

export function isMilestoneDay(day: number): boolean {
  return [7, 21, 45, 66].includes(day)
}

export function milestoneText(day: number): string {
  const texts: Record<number, string> = {
    7: 'WHERE MOST GIVE UP. NOT YOU.',
    21: 'THE HARDEST PART IS BEHIND YOU.',
    45: 'MOMENTUM IS YOURS.',
    66: 'LOCKED IN.',
  }
  return texts[day] ?? ''
}

export function phaseName(phase: Phase): string {
  const names: Record<Phase, string> = {
    ignition: 'Ignition',
    friction: 'Friction',
    groove: 'Groove',
    lockin: 'Lock-in',
  }
  return names[phase]
}

export function phaseNumber(phase: Phase): number {
  return { ignition: 1, friction: 2, groove: 3, lockin: 4 }[phase]
}

// Returns today's local date as YYYY-MM-DD, using 04:00 as day boundary
export function todayString(): string {
  const now = new Date()
  // If before 4am, consider it "yesterday"
  if (now.getHours() < 4) {
    now.setDate(now.getDate() - 1)
  }
  return now.toISOString().slice(0, 10)
}

// Compute expected current arc day given startDate and today
export function computeCurrentDay(startDate: string): number {
  const start = new Date(startDate)
  const today = new Date(todayString())
  const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.min(66, diff + 1))
}

export function phaseLabel(phase: Phase): string {
  return phase.toUpperCase()
}

// Returns milestone copy for overlay above/below text
export function milestoneOverlayData(day: number): { above: string; name: string; below: string } {
  const phaseNum = day <= 7 ? 1 : day <= 21 ? 2 : day <= 45 ? 3 : 4
  const phase = dayToPhase(day)
  const name = phaseName(phase)
  return {
    above: `DAY ${day} · PHASE ${phaseNum} OF 4`,
    name,
    below: milestoneText(day),
  }
}
