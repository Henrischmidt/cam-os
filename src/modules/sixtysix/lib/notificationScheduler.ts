// Fires at the configured daily time, then every 3 hours after (capped at midnight).
// cancelNotifications() drains all timers.
// The first daily notification uses a rotating quote keyed to the arc day.

const _timers: ReturnType<typeof setTimeout>[] = []

const DAILY_QUOTES = [
  "We are what we repeatedly do. Excellence is not an act but a habit.",
  "Small steps every day.",
  "The secret of getting ahead is getting started.",
  "Discipline is doing it when you don't feel like it.",
  "Every day is a chance to be better than yesterday.",
  "Show up. Do the work. Trust the process.",
  "Your habits shape your identity.",
  "Progress, not perfection.",
  "Be consistent. Results follow.",
  "Don't stop when you're tired. Stop when you're done.",
  "The arc continues. Keep going.",
  "You don't rise to your goals — you fall to your systems.",
  "Make it a non-negotiable.",
  "Today shapes tomorrow.",
  "Momentum is everything. Keep it.",
  "Three habits. That's all it takes.",
  "You already know what to do.",
  "The person you're becoming is watching.",
  "Strong foundation. Every rep counts.",
  "One more day of showing up for yourself.",
]

function msUntilNext(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

function scheduleAt(hour: number, minute: number, body: string) {
  function loop() {
    try {
      new Notification('The 66', {
        body,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        silent: false,
      })
    } catch { /* blocked or unavailable */ }
    const id = setTimeout(loop, msUntilNext(hour, minute))
    _timers.push(id)
  }
  const id = setTimeout(loop, msUntilNext(hour, minute))
  _timers.push(id)
}

export function initNotifications(timeStr: string, arcDay = 1): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  cancelNotifications()

  const [h, m] = timeStr.split(':').map(Number)
  const quote = DAILY_QUOTES[(arcDay - 1) % DAILY_QUOTES.length]

  scheduleAt(h, m, quote)

  const followUp = [
    'Still time to mark today.',
    "The arc doesn't pause. Three habits.",
    "Day isn't done yet.",
  ]
  for (let i = 1; i <= 3; i++) {
    const nextHour = h + i * 3
    if (nextHour >= 24) break
    scheduleAt(nextHour, m, followUp[i - 1])
  }
}

export function cancelNotifications(): void {
  while (_timers.length) clearTimeout(_timers.pop()!)
}
