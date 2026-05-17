// THE 66 — Medium Widget
// Displays: day + streak header, all habits with done/not-done markers, phase
// Place this file in Scriptable. CAM OS writes the66-state.json to the same folder.

const BG   = new Color('#000000')
const FG   = new Color('#ffffff')
const FG60 = new Color('#ffffff', 0.60)
const FG30 = new Color('#ffffff', 0.30)
const FG15 = new Color('#ffffff', 0.15)

async function loadData() {
  try {
    const fm = FileManager.iCloud()
    const path = fm.joinPath(fm.documentsDirectory(), 'the66-state.json')
    if (!fm.fileExists(path)) return null
    if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path)
    return JSON.parse(fm.readString(path))
  } catch (_) { return null }
}

function phaseName(phase) {
  return { ignition: 'Ignition', friction: 'Friction', groove: 'Groove', lockin: 'Lock-in' }[phase] ?? phase
}

function habitValue(h) {
  if (h.complete) return 'DONE'
  if (h.type === 'toggle') return '—'
  if (h.current !== undefined && h.target !== undefined) {
    return `${h.current} / ${h.target}`
  }
  return '—'
}

const data = await loadData()
const w = new ListWidget()
w.backgroundColor = BG
w.setPadding(14, 18, 14, 18)

if (!data) {
  const t = w.addText('THE 66')
  t.font = Font.regularMonospaced(11)
  t.textColor = FG30
  w.addSpacer(6)
  const s = w.addText('No data. Open CAM OS to sync.')
  s.font = Font.systemFont(14)
  s.textColor = FG60
} else {
  const { arc, habitsToday } = data

  // ── Header row ──
  const header = w.addStack()
  header.layoutHorizontally()
  header.centerAlignContent()

  const dayLabel = header.addText(`DAY ${arc.currentDay}`)
  dayLabel.font = Font.regularMonospaced(11)
  dayLabel.textColor = FG

  header.addSpacer(null)

  const streakLabel = header.addText(`${arc.streak} DAY STREAK`)
  streakLabel.font = Font.regularMonospaced(9)
  streakLabel.textColor = FG60

  // Thin divider
  w.addSpacer(8)
  const div = w.addStack()
  div.backgroundColor = FG15
  div.size = new Size(0, 1)
  w.addSpacer(8)

  // ── Habits ──
  const maxHabits = Math.min(habitsToday.length, 4)
  for (let i = 0; i < maxHabits; i++) {
    const h = habitsToday[i]

    const row = w.addStack()
    row.layoutHorizontally()
    row.centerAlignContent()

    // Dot marker
    const dot = row.addText(h.complete ? '●' : '○')
    dot.font = Font.systemFont(10)
    dot.textColor = h.complete ? FG : FG30

    row.addSpacer(8)

    // Habit name
    const name = row.addText(h.name)
    name.font = Font.systemFont(13)
    name.textColor = h.complete ? FG : FG60
    name.lineLimit = 1

    row.addSpacer(null)

    // Value
    const val = row.addText(habitValue(h))
    val.font = Font.regularMonospaced(10)
    val.textColor = h.complete ? FG60 : FG30

    if (i < maxHabits - 1) w.addSpacer(5)
  }

  w.addSpacer(null)

  // ── Footer: phase ──
  const footer = w.addText(phaseName(arc.phase).toUpperCase() + ' · PHASE')
  footer.font = Font.regularMonospaced(8)
  footer.textColor = FG30
}

Script.setWidget(w)
Script.complete()
