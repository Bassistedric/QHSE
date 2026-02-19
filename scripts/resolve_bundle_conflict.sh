#!/usr/bin/env bash
set -euo pipefail

# Resolves common merge conflict on generated dist/bundle.js,
# then rebuilds and stages the generated asset.

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not in a git repository." >&2
  exit 1
fi

if ! git diff --name-only --diff-filter=U | grep -qx 'dist/bundle.js'; then
  echo "No unresolved conflict found on dist/bundle.js"
  echo "Current unresolved files:"
  git diff --name-only --diff-filter=U || true
  exit 0
fi

echo "Resolving dist/bundle.js conflict with current branch version (ours)..."
git checkout --ours dist/bundle.js
git add dist/bundle.js

echo "Rebuilding bundle to ensure consistency..."
npm run build >/dev/null

git add dist/bundle.js

echo "Done. Now finalize merge with:"
echo "  git commit"
