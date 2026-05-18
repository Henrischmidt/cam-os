# The 66 — Build Queue

## NEXT UP (work on this tonight)

(empty — all phases complete)

## QUEUED

(empty)

## COMPLETED

Phase 0 — Strategy and architecture
Phase 1 — Claude Design mockups (pending Cam — add HTML files to /mockups/)
Phase 2 — Core React module (built overnight — components, store, arc logic, Scriptable widgets, iCloud sync scaffold)
Phase 2.5 — iPhone layout refactor (built overnight — four-zone layout, marks grid rows-of-10, active tap states, PWA meta/manifest, safe areas)
Phase 3 — Behavioural layer (already on main — CatchUpFlow, DayCompleteModal, ArcComplete, WhySurface, identity reads)
Phase 4 — iCloud sync helper (desktop: File System Access auto-write; iOS: Share API one-tap export to Scriptable folder)
Phase 5 — Scriptable widget scripts (built as part of Phase 2)
Phase 6 — Polish pass (haptic hooks on all key interactions, notification scheduling wired, mark pulse animation)
Phase 7 — CAM OS integration (Habits surface to Hub, N8N webhook endpoint, Shoot habit type — HabitDrawer shoot fix, all three features verified complete)

## BLOCKED

(empty)

---

## RULES FOR CLAUDE CODE

1. Pick the top NEXT UP item. Work only on that.
2. If acceptance criteria fully met: move to COMPLETED, promote first QUEUED item to NEXT UP, open PR titled `Phase N: [name] — ready for review`.
3. If you hit a genuine blocker: move it to BLOCKED with a clear note. Do not invent solutions. Exit cleanly.
4. Do not work on multiple phases in one run.
5. Always reference `/docs/the66-build-prompt.md` as source of truth.
6. All commits on `claude/phase-N-[name]` branch. Never push to main.
7. Every PR: summary of what was built, acceptance criteria checklist, decisions made with rationale, anything needing Cam's input.
