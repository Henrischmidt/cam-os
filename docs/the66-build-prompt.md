# THE 66 — MASTER BUILD SPEC

This document is the source of truth. When uncertain, follow this. Never invent.

---

## 1. Identity

The 66 is a habit-tracking module inside CAM OS. It implements a 66-day arc with four phases (Ignition, Friction, Groove, Lock-in). The user picks 3 to 5 habits, writes an identity statement, and shows up daily. The system rewards consistency through accumulated "marks" and milestone moments — not XP or levels.

Design philosophy: B&W minimalist, adult, quiet. Closer to Severance UI than Habitica. No gamification clichés.

---

## 2. Tech Stack (do not change)

- React 18 + Vite + TypeScript
- Tailwind CSS
- Zustand (extend existing CAM OS store)
- localStorage for persistence, with iCloud Drive JSON sync helper for widget data (Phase 4)
- No new dependencies without approval

---

## 3. File Structure to Create

```
src/modules/sixtysix/
├── Sixtysix.tsx                    # main screen container
├── components/
│   ├── PhaseHeader.tsx
│   ├── TickBar.tsx
│   ├── HabitRow.tsx
│   ├── MarkGrid.tsx
│   ├── DailyCard.tsx
│   ├── MilestoneOverlay.tsx
│   └── StreakBreakRecovery.tsx
├── screens/
│   ├── Onboarding.tsx
│   ├── Settings.tsx
│   ├── Cards.tsx
│   └── History.tsx
├── lib/
│   ├── arcLogic.ts                 # phase transitions, day rollover
│   ├── cardLogic.ts                # daily card pull
│   ├── snapshot.ts                 # builds widget snapshot JSON
│   └── icloudSync.ts               # writes state for Scriptable widgets
└── store/
    └── sixtysix.store.ts           # Zustand slice

src/data/
└── cards.json                      # 80-card starter deck
```

---

## 4. Design Tokens (use exactly these)

```css
--bg: #000000;
--fg: #FFFFFF;
--fg-60: rgba(255,255,255,0.60);
--fg-40: rgba(255,255,255,0.40);
--fg-30: rgba(255,255,255,0.30);
--fg-12: rgba(255,255,255,0.12);
--fg-08: rgba(255,255,255,0.08);
--fg-04: rgba(255,255,255,0.04);

--font-mono: 'DM Mono', monospace;
--font-serif: 'Instrument Serif', serif;
--font-sans: 'Outfit', system-ui, sans-serif;

--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--duration-fast: 200ms;
--duration-base: 400ms;
--duration-slow: 600ms;
--duration-moment: 2400ms;
```

---

## 5. Data Model (TypeScript)

```typescript
type Phase = 'ignition' | 'friction' | 'groove' | 'lockin';
type HabitType = 'toggle' | 'counter' | 'timer';

interface Arc {
  id: string;
  startDate: string;          // ISO
  currentDay: number;         // 1–66
  phase: Phase;
  hardMode: boolean;
  honestMissesUsed: number;   // resets per phase
  marks: number;
  status: 'active' | 'complete' | 'broken';
  identityStatement: string;
}

interface Habit {
  id: string;
  arcId: string;
  name: string;
  whyStatement: string;       // "Why this habit?"
  type: HabitType;
  target: number;
  unit?: string;
  active: boolean;
  createdAt: string;
}

interface DayLog {
  id: string;
  date: string;               // YYYY-MM-DD
  arcId: string;
  habitId: string;
  value: number;
  complete: boolean;
  honestMiss?: boolean;
  reflection?: string;        // one-word end-of-day
}

interface CardCollection {
  collected: string[];
  lastPulledDate: string;
  todayCardId: string | null;
}
```

---

## 6. Phase Logic

**Day boundaries:** 04:00 local time, anchored to device timezone.

**Phase boundaries:**
- Days 1–7: ignition
- Days 8–21: friction
- Days 22–45: groove
- Days 46–66: lockin
- Day 67+: arc complete → start new arc prompt

Phase transitions trigger MilestoneOverlay at days 7, 21, 45, 66.

**Day rollover logic:**

1. On app open (or daily background check), compute current local date
2. If new date AND yesterday had all habits complete → increment currentDay, advance phase if crossed
3. If new date AND yesterday had any habit incomplete AND hardMode false → streak holds, day does not count
4. If new date AND yesterday had any habit incomplete AND hardMode true → streak resets, remove last 3 marks, optionally mark arc broken
5. If user manually flagged honestMiss yesterday → day does not count but streak holds, honestMissesUsed++

**Honest miss budget:** 1 per phase. Resets to 0 on phase transition.

---

## 7. Onboarding Flow

Three-screen onboarding. First app open of The 66 with no active arc triggers this.

**Screen 1 — Pick habits**
User adds 3 to 5 habits. Each has: name, type (toggle/counter/timer), target, why-statement (optional on screen 1, required before arc starts).

Suggested defaults shown faintly: "Cold shower · Toggle", "Read · 30 min", "Move · 20 min"

Header: DM Mono uppercase — "ARC ONE — DAY ZERO"
Subhead: Instrument Serif italic — "Three habits. Sixty-six days."

**Screen 2 — Identity statement**
Header: DM Mono uppercase — "WHY THIS ARC"
Single text input completing: "By Day 66, I will be the kind of person who ___"
Placeholder disappears as user types. Required.

**Screen 3 — Begin**
Centered DM Mono: "DAY ONE BEGINS AT 04:00"
Large Instrument Serif italic: "Begin."
Single button "I'M IN" in DM Mono uppercase, white border, transparent fill.
Footer DM Mono 8pt faint: "Hard mode can be enabled in settings."

On completion: create Arc with status='active', save to store, navigate to /sixtysix.

---

## 8. The 66-Tick Bar Component

Renders 66 vertical ticks.

- SVG (not canvas)
- Each tick: 1px wide × 8px tall, 2px horizontal gap
- Colors:
  - Day < currentDay: `var(--fg)`
  - Day === currentDay: `var(--fg)` + `filter: drop-shadow(0 0 4px var(--fg))`
  - Day > currentDay: `var(--fg-12)`
- Phase boundary lines at indices 7, 21, 45: 1px wide × 12px tall in `var(--fg-30)`, centered vertically

---

## 9. The Mark Grid Component

Renders accumulated marks across the current arc.

- Rows of 10 dots (rows of 12 on iPad landscape)
- Each dot: 4px diameter, 6px gap
- Filled (marks > index): `var(--fg)`
- Unfilled: `var(--fg-12)`
- Most recent mark: pulse animation, 4-second cycle, opacity 0.6 → 1.0 → 0.6
- Performance: limit DOM dots to currentMarks × 1.5

---

## 10. Daily Card System

On first app open per local day:

1. Read `CardCollection.lastPulledDate`
2. If different from today: pull a new card
3. Selection: filter `cards.json` by current phase's preferred categories, pick a random uncollected card; if all collected in that category, pull from any uncollected; if all collected period, pull random
4. Save to `CardCollection.todayCardId`, update `lastPulledDate`

**Phase → category mapping:**
- ignition: ["Discipline", "Adventure", "Craft"]
- friction: ["Discipline", "Stoicism", "Quiet"]
- groove: ["Focus", "Craft", "Quiet"]
- lockin: ["Stoicism", "Quiet", "Focus"]

Card format: `{ id, category, text, attribution }`
Text max 100 characters.

---

## 11. Milestone Overlay

Triggers at end-of-day on days 7, 21, 45, 66.

**State machine:**
- State 1 (0–300ms): black overlay fades in
- State 2 (300–900ms): phase name appears centered, Instrument Serif italic 48px, letters stagger in 60ms apart, each fades 0→1 and lifts 8px
- State 3 (900–2400ms): holds — DM Mono 14px 0.3em above: "DAY 14 · PHASE 2 OF 4"; DM Mono 11px 0.25em 40% white below: phase-specific copy
- State 4 (2400–2800ms): fades out over 400ms

**Phase copy lines (use exactly):**
- Day 7 (Ignition → Friction): "WHERE MOST GIVE UP. NOT YOU."
- Day 21 (Friction → Groove): "THE HARDEST PART IS BEHIND YOU."
- Day 45 (Groove → Lock-in): "MOMENTUM IS YOURS."
- Day 66 (Lock-in → complete): "LOCKED IN."

**Day 66 special:** instead of fading to next phase, transitions to End-of-Arc screen with arc stats, identity statement read back, "Letter to future self" composer, "Start new arc?" CTA.

---

## 12. Streak Break Recovery

Full-screen recovery when streak breaks.

Tone: kind, not punishing. Quiet, not dramatic.

Header DM Mono 11px 0.25em 40% white: "DAY 23 · YESTERDAY MISSED"
Center Instrument Serif italic 28px: "The streak broke. The arc continues."
Body Outfit 14px 60% white: "Streaks are evidence of consistency. Their breaking is evidence of being human. Neither defines you."

Three options (full-width rows, thin white dividers):

1. DM Mono uppercase 12px: "CONTINUE — RESTART STREAK FROM DAY 24"
   Subtitle Outfit 11px 50% white: "Default. Kindness."

2. DM Mono uppercase 12px: "RESTART ARC FROM DAY 1"
   Subtitle Outfit 11px 50% white: "Hard Mode. Begin again."

3. DM Mono uppercase 12px: "END THIS ARC, START FRESH"
   Subtitle Outfit 11px 50% white: "New habits. New why. New day one."

Footer DM Mono 8pt very faint: "Honest misses don't break streaks. Settings → Honesty."

---

## 13. iCloud Sync (Phase 4 — placeholder only in Phase 2)

After every state change, write a snapshot to localStorage AND to a "pending iCloud sync" queue.

**Snapshot format** (read by Scriptable widgets):
```json
{
  "version": 1,
  "lastUpdated": "ISO timestamp",
  "arc": {
    "currentDay": 14,
    "phase": "friction",
    "streak": 13,
    "marks": 142,
    "status": "active"
  },
  "habitsToday": [
    { "name": "Cold shower", "type": "toggle", "complete": true },
    { "name": "Read", "type": "timer", "current": 18, "target": 30, "complete": false },
    { "name": "Move", "type": "counter", "current": 0, "target": 1, "complete": false }
  ],
  "todayCard": {
    "text": "The pain of discipline weighs ounces. The pain of regret weighs tons.",
    "attribution": "Jim Rohn"
  }
}
```

**Phase 2:** implement localStorage snapshot write only. iCloud write in Phase 4.

---

## 14. Settings Screen

Route: `/sixtysix/settings`

- Manage habits (add/edit/delete/reorder)
- Hard Mode toggle (with confirmation modal explaining consequences)
- Honest Miss display: "Honest misses this phase: 0/1"
- Haptics toggle
- Day rollover time (default 04:00, user can shift ±2 hours)
- Notifications toggle (placeholder for Phase 6)
- Export arc data (JSON download)
- "Show me an old card" — random card from collection
- About: arc start date, identity statement (editable), why-statements per habit (editable)

---

## 15. Phase 2 Build Order

Build in this exact order:

1. Zustand store slice (`src/modules/sixtysix/store/sixtysix.store.ts`) with all types and actions
2. Arc logic (`src/modules/sixtysix/lib/arcLogic.ts`) — phase boundaries, day rollover, transitions
3. Card logic + cards.json already exists at `src/data/cards.json`
4. The 66-tick bar component (visual spine)
5. Habit Row component (toggle/counter/timer variants)
6. Mark Grid component
7. Daily Card component
8. Main `Sixtysix.tsx` composing zones 1–4
9. Onboarding 3-screen flow
10. Milestone Overlay component
11. Streak Break Recovery screen
12. Route everything into existing CAM OS router

**Acceptance criteria for Phase 2:**
- [ ] Can complete onboarding, creating Arc 1 with 3 chosen habits and identity statement
- [ ] Main screen renders all four zones (phase header, habits, mark grid, daily card)
- [ ] 66-tick bar shows correct fill state based on currentDay
- [ ] Daily card pulls once per day, persists, never repeats until collection exhausted
- [ ] Tapping a habit logs it, updates progress visualization
- [ ] When all habits complete: day marks complete, marks++, streak++
- [ ] Manually simulating clock advance to next day triggers correct phase logic
- [ ] At simulated day 7, milestone overlay fires: "WHERE MOST GIVE UP. NOT YOU."
- [ ] At simulated day 21, milestone fires: "THE HARDEST PART IS BEHIND YOU."
- [ ] Triggering a streak break shows recovery screen with three options
- [ ] Settings screen accessible, all toggles function
- [ ] No console errors, no TypeScript errors, `npm run build` succeeds
- [ ] Visual elements match design tokens exactly — typography, spacing, colors

**Phase 2 does NOT include:**
- iCloud sync (Phase 4)
- Scriptable widgets (Phase 5)
- End-of-day reflection prompt (Phase 3)
- Day 67 completion screen (Phase 3)
- Catch-up flow for missed days (Phase 3)
- Notifications (Phase 6)

---

## 16. Future Phases

- **Phase 3:** Behavioural layer — identity reads, why surfacing, end-of-day reflection, Day 67 experience, catch-up flow
- **Phase 4:** iCloud sync helper
- **Phase 5:** Scriptable widget scripts (small, medium, large, lock screen rectangular, lock screen circular)
- **Phase 6:** Polish — animations refined, haptic hooks, notifications via local-notifications
- **Phase 7:** CAM OS integration — Habits surface to Hub screen, N8N webhook endpoint, Shoot habit type

---

## 17. Blocker Protocol

If any of these come up, exit with a blocker note in `BUILD_QUEUE.md` rather than guessing:

- Specific copy/wording for screens not specified above
- Adding any new npm dependency
- Modifying the existing CAM OS routes or layout in ways not described
- Changing design tokens

If you can make a reasonable inference using the design constraints and existing CAM OS conventions, do so and note it in the PR description.

---

---

## 18. iPhone-First / PWA Requirements (non-negotiable)

This app is built primarily for iPhone, installed as a PWA via Safari → Add to Home Screen. Every layout and interaction decision must start from this context.

### Viewport & meta tags (add to index.html)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="theme-color" content="#000000">
<link rel="apple-touch-icon" href="/icons/icon-192.png">
```

### Safe areas

All screens must respect the Dynamic Island / notch at top and home indicator at bottom:

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
```

The root app container must use `min-height: 100dvh` (dynamic viewport height, not `100vh`) so the layout doesn't break when the Safari toolbar shows/hides.

### Touch targets

Every tappable element — habit rows, buttons, toggles, option rows — must have a minimum tap area of **44×44px** per Apple HIG. Use padding to achieve this without affecting visual size.

### Primary target dimensions

- Design for **393×852px** (iPhone 15 / 14 Pro) as the primary canvas
- Must be fluid down to **375px wide** (iPhone SE)
- Do not hard-code pixel heights — use flex column + `100dvh` so it adapts

### The four-zone layout

The main Sixtysix.tsx screen must fit entirely within one viewport — no page scroll. Use `display: flex; flex-direction: column; height: 100dvh` with zones taking proportional flex space:

```
Zone 1 — PhaseHeader:    flex: 0 0 auto   (~80px)
Zone 2 — Habits:         flex: 1 1 auto   (grows to fill available)
Zone 3 — MarkGrid:       flex: 0 0 auto   (collapses/expands)
Zone 4 — DailyCard:      flex: 0 0 auto   (~80px)
```

Habits zone scrolls internally if content overflows (more than 5 habits).

### No hover states

This is a touch device. Do not use `:hover` as the only visual feedback. Use `:active` for tap feedback — a subtle opacity reduction (0.7) over 100ms.

### PWA manifest (create public/manifest.json)

```json
{
  "name": "The 66",
  "short_name": "The 66",
  "description": "66-day habit arc",
  "start_url": "/sixtysix",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Create placeholder 192×512px black PNG icons if real assets aren't available. The manifest must be linked in index.html: `<link rel="manifest" href="/manifest.json">`.

### Font loading

Load all three fonts from Google Fonts in index.html — do not rely on system fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet">
```

### Tap-to-complete interaction

Habit rows are the primary interaction surface. The entire row must be tappable (not just a small button). On tap: immediate visual feedback (opacity 0.7 for 100ms), then state update, then progress animation.

### Prevent iOS rubber-band scroll on the root

```css
body {
  overscroll-behavior: none;
  overflow: hidden;
}
```

Only the habits zone (if it overflows) should scroll, using `-webkit-overflow-scrolling: touch`.

### Testing note for Claude Code

After building, verify layout at 393×852 using Chrome DevTools device emulator (iPhone 15 Pro preset) before marking acceptance criteria complete. Check: safe areas respected, no content hidden behind Dynamic Island, home indicator clear, all tap targets ≥44px.

---

*End of master spec.*
