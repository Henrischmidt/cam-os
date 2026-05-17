// Haptic feedback via the Web Vibration API.
// Silently no-ops on browsers/devices that don't support vibration.

function vibe(pattern: number | number[]) {
  try { navigator.vibrate?.(pattern) } catch (_) { /* unavailable */ }
}

export function hapticLight()   { vibe(10) }
export function hapticMedium()  { vibe(25) }
export function hapticSuccess() { vibe([10, 40, 60]) }
export function hapticHeavy()   { vibe([30, 60, 30]) }
