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

If a pull request is blocked by a conflict on `dist/bundle.js`, run:

```bash
./scripts/resolve_bundle_conflict.sh
git commit
```

This keeps the current branch version for `dist/bundle.js`, rebuilds it, and stages the result.
