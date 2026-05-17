// THE 66 — Small Widget
// Displays: day number, phase, today's completion fraction, streak
// Place this file in Scriptable. CAM OS writes the66-state.json to the same folder.

const BG   = new Color('#000000')
const FG   = new Color('#ffffff')
const FG60 = new Color('#ffffff', 0.60)
const FG30 = new Color('#ffffff', 0.30)

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

const data = await loadData()
const w = new ListWidget()
w.backgroundColor = BG
w.setPadding(16, 18, 16, 18)

if (!data) {
  const t = w.addText('THE 66')
  t.font = Font.regularMonospaced(11)
  t.textColor = FG30
  w.addSpacer(6)
  const s = w.addText('No data.\nOpen CAM OS.')
  s.font = Font.systemFont(13)
  s.textColor = FG60
  s.lineLimit = 2
} else {
  const { arc, habitsToday } = data
  const done = habitsToday.filter(h => h.complete).length
  const total = habitsToday.length

  // Header label
  const label = w.addText('THE 66')
  label.font = Font.regularMonospaced(9)
  label.textColor = FG30

  w.addSpacer(8)

  // Day number — big
  const day = w.addText(`${arc.currentDay}`)
  day.font = Font.boldSystemFont(52)
  day.textColor = FG
  day.minimumScaleFactor = 0.6

  // Phase name
  const phase = w.addText(phaseName(arc.phase).toUpperCase())
  phase.font = Font.regularMonospaced(9)
  phase.textColor = FG60

  w.addSpacer(null)

  // Bottom row: X/Y · N streak
  const row = w.addStack()
  row.layoutHorizontally()
  row.centerAlignContent()

  const comp = row.addText(`${done}/${total}`)
  comp.font = Font.regularMonospaced(13)
  comp.textColor = FG

  row.addSpacer(null)

  const streak = row.addText(`${arc.streak}d`)
  streak.font = Font.regularMonospaced(13)
  streak.textColor = FG60
}

Script.setWidget(w)
Script.complete()
