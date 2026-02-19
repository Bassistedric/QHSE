# Résoudre le conflit `Code.gs` dans la PR

Si GitHub affiche `This branch has conflicts ... Code.gs`, fais une résolution locale avec ces commandes.

## Option recommandée (garder la version robuste de cette branche)

```bash
git checkout work
git fetch origin
git merge origin/main
# résoudre le conflit sur Code.gs
# puis:
git add Code.gs
git commit -m "Resolve Code.gs merge conflict"
git push origin work
```

Pendant la résolution, garde ces points dans `Code.gs`:
- routage `type` + fallback `meta.formType`
- colonnes STOP incluant `caseId`, `photoUrl`, `photoFileId`, `payloadJson`
- écriture par en-têtes (`appendRowByHeaders`) pour éviter les décalages de colonnes

## Option alternative (si tout est déjà déployé dans Apps Script et tu veux juste merger vite)

Tu peux garder la version de `main` pour `Code.gs` puis seulement conserver le front:

```bash
git checkout work
git fetch origin
git merge origin/main
git checkout --theirs Code.gs
git add Code.gs
git commit -m "Resolve conflict by taking main Code.gs"
git push origin work
```

Ensuite vérifie que `src/main.jsx` garde bien `type: "stop"` dans le payload STOP.
