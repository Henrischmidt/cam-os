// THE 66 — Lock Screen Rectangular Widget
// Displays: day, completion fraction, streak — compact for lock screen
// Widget type: Accessory Rectangular
// Place this file in Scriptable. CAM OS writes the66-state.json to the same folder.

async function loadData() {
  try {
    const fm = FileManager.iCloud()
    const path = fm.joinPath(fm.documentsDirectory(), 'the66-state.json')
    if (!fm.fileExists(path)) return null
    if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path)
    return JSON.parse(fm.readString(path))
  } catch (_) { return null }
}

const data = await loadData()
const w = new ListWidget()

// Lock screen widgets use system foreground color automatically

if (!data) {
  const t = w.addText('THE 66')
  t.font = Font.regularMonospaced(12)
  w.addSpacer(2)
  const s = w.addText('Sync needed')
  s.font = Font.systemFont(11)
} else {
  const { arc, habitsToday } = data
  const done = habitsToday.filter(h => h.complete).length
  const total = habitsToday.length

  // Row 1: DAY N  ·  X/Y
  const row1 = w.addStack()
  row1.layoutHorizontally()

  const dayT = row1.addText(`DAY ${arc.currentDay}`)
  dayT.font = Font.boldSystemFont(13)

  row1.addSpacer(null)

  const compT = row1.addText(`${done}/${total}`)
  compT.font = Font.regularMonospaced(13)

  w.addSpacer(3)

  // Row 2: N DAY STREAK
  const row2 = w.addStack()
  row2.layoutHorizontally()

  const streakT = row2.addText(`${arc.streak} DAY STREAK`)
  streakT.font = Font.regularMonospaced(10)
}

Script.setWidget(w)
Script.complete()
