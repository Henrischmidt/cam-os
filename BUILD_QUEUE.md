# The 66 — Build Queue

## NEXT UP (work on this tonight)

Phase 2.5 — iPhone layout refactor (CRITICAL — do this before Phase 3)

The app was built desktop-first at 1920px. It needs to be refactored to iPhone-first before any further feature work. The full spec is in /docs/the66-build-prompt.md Section 18.

Specific fixes required:

1. **Root layout**: Main app wrapper must be `height: 100dvh; overflow: hidden; display: flex; flex-direction: column`. No page scroll.

2. **Body/HTML**: `body { overflow: hidden; overscroll-behavior: none; }` and `html { height: 100%; overflow: hidden; }`

3. **Four-zone structure**:
   - Zone 1 PhaseHeader: `flex: 0 0 auto` (~80px)
   - Zone 2 Habits: `flex: 1 1 auto; overflow-y: auto; -webkit-overflow-scrolling: touch`
   - Zone 3 MarkGrid: `flex: 0 0 auto`
   - Zone 4 DailyCard: `flex: 0 0 auto` (~80px)

4. **Max-width container**: `max-width: 430px; margin: 0 auto; width: 100%` so it centres on iPad/desktop but is designed for 393px.

5. **Safe areas**: `padding-top: env(safe-area-inset-top)` on top zone, `padding-bottom: env(safe-area-inset-bottom)` on bottom zone.

6. **Touch targets**: All habit row buttons minimum 44px tall.

7. **Progress ring → Tick bar**: Replace the 320px circular progress ring with the spec-defined 66-tick SVG bar (Section 8). Circular ring is desktop pattern.

8. **Mark grid**: Currently a text list of dates. Replace with dot grid from Section 9: 4px dots, 6px gap, rows of 10, filled/unfilled states, pulse on most recent.

9. **Verify at 393×852**: Chrome DevTools → iPhone 15 Pro. All four zones visible without scrolling. No content hidden behind Dynamic Island or home indicator.

Acceptance criteria:
- [ ] App fits in one iPhone viewport — no page scroll
- [ ] Four zones correct per Section 18
- [ ] Safe areas respected
- [ ] 66-tick bar replaces circular ring
- [ ] Mark grid shows dots (not text list)
- [ ] All interactive elements ≥44px
- [ ] `npm run build` passes
- [ ] Verified in DevTools at iPhone 15 Pro (393×852)

## QUEUED

Phase 3 — Behavioural layer (identity reads, why surfacing, end-of-day reflection, Day 67 experience, catch-up flow)
Phase 4 — iCloud sync helper (writes the66-state.json for Scriptable widgets)
Phase 6 — Polish pass (animations refined, haptic hooks, notification placeholders)
Phase 7 — CAM OS integration (Habits surface to Hub, N8N webhook endpoint, Shoot habit type)

## COMPLETED

Phase 0 — Strategy and architecture
Phase 1 — Claude Design mockups (pending Cam — add HTML files to /mockups/)
Phase 2 — Core React module (built overnight — components, store, arc logic, Scriptable widgets, iCloud sync scaffold)
Phase 5 — Scriptable widget scripts (built as part of Phase 2)

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
