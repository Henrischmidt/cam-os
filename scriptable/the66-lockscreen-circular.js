// THE 66 — Lock Screen Circular Widget
// Displays: day number large, fraction done below
// Widget type: Accessory Circular
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

// Circular lock screen — center content
w.addSpacer(null)

if (!data) {
  const center = w.addStack()
  center.layoutVertically()
  center.centerAlignContent()

  const t = center.addText('66')
  t.font = Font.boldSystemFont(22)
  t.centerAlignText()

  center.addSpacer(2)

  const s = center.addText('—/—')
  s.font = Font.regularMonospaced(10)
  s.centerAlignText()
} else {
  const { arc, habitsToday } = data
  const done = habitsToday.filter(h => h.complete).length
  const total = habitsToday.length

  const center = w.addStack()
  center.layoutVertically()
  center.centerAlignContent()

  // Day number — the focal point
  const dayT = center.addText(`${arc.currentDay}`)
  dayT.font = Font.boldSystemFont(28)
  dayT.centerAlignText()
  dayT.minimumScaleFactor = 0.7

  center.addSpacer(2)

  // Completion fraction
  const compT = center.addText(`${done}/${total}`)
  compT.font = Font.regularMonospaced(11)
  compT.centerAlignText()
}

w.addSpacer(null)

Script.setWidget(w)
Script.complete()
