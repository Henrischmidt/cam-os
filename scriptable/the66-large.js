// THE 66 — Large Widget
// Displays: day, phase, streak + marks, all habits with progress, today's card
// Place this file in Scriptable. CAM OS writes the66-state.json to the same folder.

const BG   = new Color('#000000')
const FG   = new Color('#ffffff')
const FG60 = new Color('#ffffff', 0.60)
const FG40 = new Color('#ffffff', 0.40)
const FG20 = new Color('#ffffff', 0.20)
const FG10 = new Color('#ffffff', 0.10)

async function loadData() {
  try {
    const fm = FileManager.iCloud()
    const path = fm.joinPath(fm.documentsDirectory(), 'the66-state.json')
    if (!fm.fileExists(path)) return null
    if (!fm.isFileDownloaded(path)) await fm.downloadFileFromiCloud(path)
    return JSON.parse(fm.readString(path))
  } catch (_) { return null }
}

function phaseName(p) {
  return { ignition: 'Ignition', friction: 'Friction', groove: 'Groove', lockin: 'Lock-in' }[p] ?? p
}

function phaseNum(p) {
  return { ignition: 1, friction: 2, groove: 3, lockin: 4 }[p] ?? 1
}

function habitValue(h) {
  if (h.complete) return 'DONE'
  if (h.type === 'toggle') return '—'
  if (h.current !== undefined && h.target !== undefined) return `${h.current} / ${h.target}`
  return '—'
}

function addDivider(widget) {
  widget.addSpacer(10)
  const d = widget.addStack()
  d.backgroundColor = FG10
  d.size = new Size(0, 1)
  widget.addSpacer(10)
}

const data = await loadData()
const w = new ListWidget()
w.backgroundColor = BG
w.setPadding(18, 20, 18, 20)

if (!data) {
  const t = w.addText('THE 66')
  t.font = Font.regularMonospaced(13)
  t.textColor = FG40
  w.addSpacer(12)
  const s = w.addText('No data.\nOpen CAM OS to start syncing.')
  s.font = Font.systemFont(16)
  s.textColor = FG60
  s.lineLimit = 3
} else {
  const { arc, habitsToday, todayCard } = data

  // ── Title row ──
  const titleRow = w.addStack()
  titleRow.layoutHorizontally()

  const dayTxt = titleRow.addText(`DAY ${arc.currentDay}`)
  dayTxt.font = Font.regularMonospaced(13)
  dayTxt.textColor = FG

  titleRow.addSpacer(null)

  const phaseTxt = titleRow.addText(`${phaseName(arc.phase).toUpperCase()} · PHASE ${phaseNum(arc.phase)} OF 4`)
  phaseTxt.font = Font.regularMonospaced(10)
  phaseTxt.textColor = FG40

  w.addSpacer(4)

  // ── Stats row ──
  const statsRow = w.addStack()
  statsRow.layoutHorizontally()

  const streakTxt = statsRow.addText(`${arc.streak} DAY STREAK`)
  streakTxt.font = Font.regularMonospaced(11)
  streakTxt.textColor = FG60

  statsRow.addSpacer(null)

  const marksTxt = statsRow.addText(`${arc.marks} MARKS`)
  marksTxt.font = Font.regularMonospaced(11)
  marksTxt.textColor = FG40

  addDivider(w)

  // ── Habits ──
  const maxHabits = Math.min(habitsToday.length, 5)
  for (let i = 0; i < maxHabits; i++) {
    const h = habitsToday[i]

    const row = w.addStack()
    row.layoutHorizontally()
    row.centerAlignContent()

    const dot = row.addText(h.complete ? '●' : '○')
    dot.font = Font.systemFont(11)
    dot.textColor = h.complete ? FG : FG20

    row.addSpacer(10)

    const name = row.addText(h.name)
    name.font = Font.systemFont(14)
    name.textColor = h.complete ? FG : FG60
    name.lineLimit = 1

    row.addSpacer(null)

    const val = row.addText(habitValue(h))
    val.font = Font.regularMonospaced(11)
    val.textColor = h.complete ? FG60 : FG20

    if (i < maxHabits - 1) w.addSpacer(7)
  }

  // ── Card quote ──
  if (todayCard && todayCard.text) {
    addDivider(w)

    const quoteLabel = w.addText('THE LINE YOU CARRIED IN')
    quoteLabel.font = Font.regularMonospaced(8)
    quoteLabel.textColor = FG20

    w.addSpacer(6)

    const maxLen = 90
    const quoteTxt = todayCard.text.length > maxLen
      ? todayCard.text.slice(0, maxLen - 1) + '…'
      : todayCard.text
    const quote = w.addText(`"${quoteTxt}"`)
    quote.font = Font.italicSystemFont(13)
    quote.textColor = FG60
    quote.lineLimit = 3

    if (todayCard.attribution) {
      w.addSpacer(4)
      const attr = w.addText(`— ${todayCard.attribution}`)
      attr.font = Font.regularMonospaced(9)
      attr.textColor = FG40
    }
  } else {
    w.addSpacer(null)
  }
}

Script.setWidget(w)
Script.complete()
