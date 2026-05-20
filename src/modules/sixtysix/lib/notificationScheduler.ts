// Fires at the configured daily time, then every 3 hours after (capped at midnight).
// cancelNotifications() drains all timers.

const _timers: ReturnType<typeof setTimeout>[] = []

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

export function initNotifications(timeStr: string): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  cancelNotifications()

  const [h, m] = timeStr.split(':').map(Number)

  scheduleAt(h, m, 'Time to show up for yourself.')

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
