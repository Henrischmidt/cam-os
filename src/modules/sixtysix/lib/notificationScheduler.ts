// Schedules recurring notifications at a fixed daily time AND every 3 hours
// between that time and midnight if habits are still incomplete.
// The 3-hourly reminders fire at: notificationTime, +3h, +6h, +9h (capped at midnight).

const _timers: ReturnType<typeof setTimeout>[] = []

function msUntilNext(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

function fire(label: string) {
  try {
    new Notification('The 66', {
      body: label,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      silent: false,
    })
  } catch {
    // Blocked or unavailable
  }
}

function scheduleAt(hour: number, minute: number, label: string) {
  function loop() {
    fire(label)
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

  // First fire at the configured time
  scheduleAt(h, m, 'Time to show up for yourself.')

  // Then every 3 hours after, up to 23:00
  const messages = [
    'Still time to mark today.',
    'The arc doesn\'t pause. Three habits.',
    'Day isn\'t done yet.',
  ]
  for (let i = 1; i <= 3; i++) {
    const nextHour = h + i * 3
    if (nextHour >= 24) break
    scheduleAt(nextHour, m, messages[i - 1])
  }
}

export function cancelNotifications(): void {
  while (_timers.length) {
    clearTimeout(_timers.pop()!)
  }
}
