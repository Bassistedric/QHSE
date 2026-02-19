# Patch à merger dans ton `Code.gs` Apps Script

Ce patch est basé sur **ton fichier complet** fourni en message.  
Objectif : fiabiliser l’écriture STOP/TBM même si les colonnes ont été modifiées, et garantir les infos `caseId/photoUrl/photoFileId/payloadJson`.

## 1) Remplacer `getSheetByNameOrCreate_`

```javascript
function getSheetByNameOrCreate_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (headers && headers.length) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    return sh;
  }

  if (headers && headers.length) {
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const existing = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || '').trim());
    const existingSet = new Set(existing.filter(Boolean));
    const missing = headers.filter(h => !existingSet.has(h));

    if (missing.length) {
      sh.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    }
  }

  return sh;
}
```

---

## 2) Ajouter ce helper (nouveau)

```javascript
function appendRowByHeaders_(sh, dataByHeader) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const lastCol = Math.max(sh.getLastColumn(), 1);
    const headers = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || '').trim());

    const idx = {};
    headers.forEach((h, i) => {
      if (h) idx[h] = i;
    });

    const row = new Array(lastCol).fill('');
    Object.keys(dataByHeader || {}).forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(idx, k)) {
        row[idx[k]] = dataByHeader[k];
      }
    });

    sh.appendRow(row);
    return sh.getLastRow();
  } finally {
    lock.releaseLock();
  }
}
```

---

## 3) Remplacer `handleStop_`

> Différences clés:
> - ajoute `payloadJson` dans les headers STOP,
> - écrit la ligne par noms de colonnes (pas position),
> - conserve `photoError/photoStored` dans `payloadJson`.

```javascript
function handleStop_(meta, st) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const headers = [
    'sentAt','datetime','chantier','responsable',
    'situationSTOP',
    'callNom','callFonction',
    'solution','noGo','userAgent',
    'caseId','photoUrl','photoFileId','payloadJson'
  ];
  const sh = getSheetByNameOrCreate_(ss, STOP_SHEET_NAME, headers);

  const funcLabelMap = {
    chef:"Chef d'équipe", site:"Site sup.", pm:"PM",
    opm:"OPM", cp:"CP", coord:"Coordinateur", client:"Client"
  };
  const funcLabel = funcLabelMap[st.callFonction] || st.callFonction || '';

  const now = new Date();
  const caseId = buildCaseId_('STOP', now);

  let photo = null;
  let photoError = '';
  try {
    if (st.photoDataUrl) photo = saveStopPhotoToDrive_(caseId, st.photoDataUrl);
  } catch (e) {
    photo = null;
    photoError = String(e && e.message ? e.message : e);
  }

  const payloadJson = JSON.stringify({
    ...st,
    photoDataUrl: st.photoDataUrl ? '[stored-in-drive]' : '',
    photoStored: !!(photo && photo.fileId),
    photoError
  });

  const rowObj = {
    sentAt: meta.sentAt || now.toISOString(),
    datetime: st.datetime || '',
    chantier: st.chantier || '',
    responsable: st.responsable || '',
    situationSTOP: st.situation || '',
    callNom: st.callNom || '',
    callFonction: funcLabel,
    solution: st.solution || '',
    noGo: st.noGo ? 'OUI' : 'NON',
    userAgent: meta.userAgent || '',
    caseId,
    photoUrl: (photo && photo.url) || '',
    photoFileId: (photo && photo.fileId) || '',
    payloadJson
  };

  const lastRow = appendRowByHeaders_(sh, rowObj);

  if (SEND_STOP_MAIL_WHEN_NOGO && st.noGo) {
    try {
      const subject = `STOP – NO-GO – ${st.chantier || ''} – ${caseId}`;
      const photoLine = (photo && photo.url)
        ? `<li><b>Photo</b> : <a href="${photo.url}">Ouvrir dans Drive</a></li>`
        : `<li><b>Photo</b> : Aucune</li>`;

      const html = `
        <p><b>STOP – NO-GO</b></p>
        <ul>
          <li><b>Case ID</b> : ${caseId}</li>
          <li><b>Date/Heure</b> : ${st.datetime || ''}</li>
          <li><b>Chantier</b> : ${st.chantier || ''}</li>
          <li><b>Responsable</b> : ${st.responsable || ''}</li>
          <li><b>Situation</b> : ${String(st.situation || '').replace(/\n/g,'<br>')}</li>
          <li><b>Contacté</b> : ${st.callNom || ''} (${funcLabel || ''})</li>
          <li><b>Solution</b> : ${String(st.solution || '').replace(/\n/g,'<br>')}</li>
          ${photoLine}
        </ul>
      `;

      const csv = headers.join(',') + '\n' + toCsvLine_(headers, headers.map(h => rowObj[h] ?? ''));
      const csvBlob = Utilities.newBlob(csv, 'text/csv', `stop_nogo_${caseId}.csv`);

      const attachments = [csvBlob];
      if (photo && photo.blob) attachments.push(photo.blob);

      MailApp.sendEmail({ to: QHSE_EMAIL, subject, htmlBody: html, attachments });
    } catch (e) { /* no-op */ }
  }

  return respond_({
    ok:true,
    sheet:STOP_SHEET_NAME,
    row:lastRow,
    caseId,
    photoUrl: (photo && photo.url) || '',
    photoFileId: (photo && photo.fileId) || ''
  });
}
```

---

## 4) Remplacer `handleTbm_` (même logique robuste)

```javascript
function handleTbm_(meta, d) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const headers = ['sentAt','datetime','metier','chantier','responsable','equipe','youtubeUrl','userAgent','payloadJson'];
  const sh = getSheetByNameOrCreate_(ss, TBM_SHEET_NAME, headers);

  const rowObj = {
    sentAt: meta.sentAt || new Date().toISOString(),
    datetime: d.datetime || '',
    metier: d.metier || '',
    chantier: d.chantier || '',
    responsable: d.responsable || '',
    equipe: Array.isArray(d.equipe) ? d.equipe.join(' | ') : (d.equipe || ''),
    youtubeUrl: d.youtubeUrl || '',
    userAgent: meta.userAgent || '',
    payloadJson: JSON.stringify(d)
  };

  const lastRow = appendRowByHeaders_(sh, rowObj);
  return respond_({ ok: true, sheet: TBM_SHEET_NAME, row: lastRow });
}
```

---

## 5) Optionnel mais recommandé

Ton `doPost` est déjà bon (compat `meta.formType` / `payload.type` / `payload.formType`), donc pas de changement obligatoire.

