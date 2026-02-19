#!/usr/bin/env bash
set -euo pipefail

MAIN_REF="${1:-origin/main}"

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not a git repository." >&2
  exit 1
fi

branch="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$branch" == "HEAD" ]]; then
  echo "Detached HEAD is not supported. Checkout your PR branch first." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash your changes first." >&2
  exit 1
fi

remote="${MAIN_REF%%/*}"
if [[ "$MAIN_REF" == "$remote" ]]; then
  remote="origin"
fi

if git remote get-url "$remote" >/dev/null 2>&1; then
  git fetch "$remote"
fi

set +e
git merge --no-commit --no-ff "$MAIN_REF"
merge_rc=$?
set -e

if [[ $merge_rc -eq 0 ]]; then
  git commit -m "Merge $MAIN_REF into $branch"
  echo "Merged $MAIN_REF into $branch without conflicts."
  exit 0
fi

mapfile -t conflicts < <(git diff --name-only --diff-filter=U)
if [[ ${#conflicts[@]} -eq 0 ]]; then
  echo "Merge reported an error but no unresolved conflicts were detected." >&2
  exit 1
fi

if [[ ${#conflicts[@]} -ne 1 || "${conflicts[0]}" != "dist/bundle.js" ]]; then
  echo "Conflicts are not limited to dist/bundle.js:" >&2
  printf ' - %s\n' "${conflicts[@]}" >&2
  echo "Resolve manually, then run npm run build and commit." >&2
  exit 2
fi

echo "Auto-resolving dist/bundle.js conflict by rebuilding the bundle..."
git checkout --theirs dist/bundle.js || true
npm run build
git add dist/bundle.js
git add -u
git commit -m "Merge $MAIN_REF into $branch and rebuild dist bundle"

echo "Conflict resolved and merge commit created."
