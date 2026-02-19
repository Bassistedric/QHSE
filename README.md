# QHSE
Safety ap by Cco

## Configuration

Sheet information for the TBM page is stored in `sheetConfig.js`. Update the
following constants in that file to change the data sources without touching the
application logic:

- `SHEET_BASE_URL`
- `METIER_TO_GID`
- `TBM_GID`

After editing `sheetConfig.js`, reload `tbm.html` to use the new values.

## Merge conflict helper (dist/bundle.js)

If GitHub shows `This branch has conflicts that must be resolved` on `dist/bundle.js`,
run the sync helper from your PR branch:

```bash
./scripts/sync_main_and_resolve_bundle.sh origin/main
git push
```

What it does automatically:

1. fetches and merges `origin/main` into your current branch,
2. if the only conflict is `dist/bundle.js`, it rebuilds with `npm run build`,
3. creates the merge commit ready to push.

If there are conflicts on other files, it stops and lists them for manual resolution.
