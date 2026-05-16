# CAM OS

Personal operating system. The 66 habit module lives in `src/modules/sixtysix/`.

## The 66

66-day habit arc tracker. Black & white, minimal, adult.

**Build is automated via Claude Code Routines:**
- Nightly build fires at 22:00 SAST → creates `claude/phase-N-*` branch → opens PR
- Morning brief fires at 06:00 SAST → writes to `/briefs/`
- Sunday retro fires at 09:00 → writes to `/retros/`

See `BUILD_QUEUE.md` for current status. See `docs/the66-build-prompt.md` for the full spec.

## Stack

React 18 · Vite · TypeScript · Tailwind · Zustand

## Dev

```bash
npm install
npm run dev
```
