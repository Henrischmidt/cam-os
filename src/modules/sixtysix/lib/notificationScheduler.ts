let _timerId: ReturnType<typeof setTimeout> | null = null

function msUntilTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(h, m, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

function fire(timeStr: string) {
  try {
    new Notification('The 66', {
      body: 'Time to show up for yourself.',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      silent: false,
    })
  } catch {
    // Notification may be blocked or unavailable
  }
  _timerId = setTimeout(() => fire(timeStr), msUntilTime(timeStr))
}

export function initNotifications(timeStr: string): void {
  if (typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  cancelNotifications()
  _timerId = setTimeout(() => fire(timeStr), msUntilTime(timeStr))
}

export function cancelNotifications(): void {
  if (_timerId !== null) {
    clearTimeout(_timerId)
    _timerId = null
  }
}
