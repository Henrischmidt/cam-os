# The 66 — Build Queue

## NEXT UP

**Deploy to HTTPS (Vercel)**
- Required for PWA "Add to Home Screen" on iPhone
- Required for push notifications and File System Access API
- Run: `npx vercel` in the project root, or connect the GitHub repo at vercel.com
- Acceptance: app loads at an https:// URL on real iPhone Safari

## QUEUED

- Test on real iPhone in Safari (notch, safe-area, keyboard, scroll behaviour)

## COMPLETED

Phase 0 — Strategy and architecture
Phase 1 — Claude Design mockups (HTML files pending Cam → /mockups/)
Phase 2 — Core React module
Phase 3 — Behavioural layer
Phase 4 — iCloud sync helper
Phase 5 — Scriptable widget scripts
Phase 6 — Polish pass
Phase 7 — CAM OS integration
fix/review-pass — Bug fixes from external review round 1
fix/review-pass-2 — Bug fixes from external review round 2
fix/mobile-responsive — iPhone layout: responsive stage, ring clamp, safe-area insets, PWA manifest

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
