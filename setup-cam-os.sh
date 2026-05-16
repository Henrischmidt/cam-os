#!/bin/bash
# setup-cam-os.sh
# Run this once from inside the cam-os folder to push everything to GitHub.
# Usage: cd ~/Desktop/cam-os && bash setup-cam-os.sh

set -e

REPO_URL="https://github.com/Henricschmidt/cam-os.git"

echo "→ Initialising git..."
git init
git branch -M main

echo "→ Staging all files..."
git add .

echo "→ Initial commit..."
git commit -m "chore: initial scaffold — The 66 build infrastructure

- BUILD_QUEUE.md with Phase 2 queued for tonight
- docs/the66-build-prompt.md (complete master spec, 17 sections)
- src/data/cards.json (80 cards across 6 categories)
- Folder structure: src/modules/sixtysix, mockups, briefs, retros"

echo "→ Adding remote..."
git remote add origin "$REPO_URL"

echo "→ Pushing to GitHub..."
git push -u origin main

echo ""
echo "✓ Done. Open https://github.com/Henricschmidt/cam-os to confirm."
echo ""
echo "Next steps:"
echo "  1. Open Claude Code → Routines"
echo "  2. Create Routine A (Nightly Build) — prompt is in the dispatch doc"
echo "  3. Create Routine B (Morning Brief) — same"
echo "  4. Trigger Routine A manually once to test it"
echo "  5. Tonight at 22:00 SAST it fires automatically"
