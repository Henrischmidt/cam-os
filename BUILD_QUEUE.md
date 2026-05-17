# The 66 — Build Queue

## NEXT UP (work on this tonight)

Phase 6 — Polish pass (animations refined, haptic hooks, notification placeholders)

## QUEUED

Phase 7 — CAM OS integration (Habits surface to Hub, N8N webhook endpoint, Shoot habit type)

## COMPLETED

Phase 0 — Strategy and architecture (done)
Phase 1 — Claude Design mockups (pending Cam — HTML files to be added to /mockups/)
Phase 2 — Core React module (complete — PR open)
Phase 3 — Behavioural layer (complete — PR open)
Phase 4 — iCloud sync helper (complete — PR open)
Phase 5 — Scriptable widget scripts (complete — PR open)

## BLOCKED

(empty)

---

## RULES FOR CLAUDE CODE

1. Pick the top NEXT UP item. Work only on that.
2. If acceptance criteria fully met: move to COMPLETED, promote first QUEUED item to NEXT UP, open PR titled `Phase N: [name] — ready for review`.
3. If you hit a genuine blocker: move it to BLOCKED with a clear note explaining what's needed. Do not invent solutions. Exit cleanly.
4. Do not work on multiple phases in one run.
5. Always reference `/docs/the66-build-prompt.md` as the source of truth.
6. All commits on a `claude/phase-N-[name]` branch. Never push to main.
7. Every PR must include: summary of what was built, acceptance criteria checklist (checked off), any spec decisions made with rationale, anything needing Cam's input.
