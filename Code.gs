const TBM_SHEET_NAME = 'tbm';
const STOP_SHEET_NAME = 'stop';
const FMRA_SHEET_NAME = 'fmra';

// Configure in Apps Script properties: FMRA_PM_EMAILS="pm1@vma.be,pm2@vma.be"
const FMRA_PM_EMAILS_PROP = 'FMRA_PM_EMAILS';

// Configure in Apps Script properties: STOP_ALERT_EMAILS="a@b.com,c@d.com"
const STOP_ALERT_EMAILS_PROP = 'STOP_ALERT_EMAILS';
const QHSE_EMAIL = 'qhse.sud@vma.be';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const meta = payload.meta || {};
    const data = payload.data || {};
    const type = String((meta.formType || payload.type || payload.formType || '')).toLowerCase().trim();

    if (type === 'tbm') return handleTbm(meta, data);
    if (type === 'stop') return handleStop(meta, data);
    if (type === 'fmra') return handleFmra(meta, data);
    return respond({ ok: false, error: 'unknown type', type });
  } catch (err) {
    return respond({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function handleTbm(meta, d) {
  const headers = ['sentAt', 'datetime', 'metier', 'chantier', 'responsable', 'equipe', 'youtubeUrl', 'userAgent', 'payloadJson'];
  const sh = getSheetByNameOrCreate(TBM_SHEET_NAME, headers);
  const row = [
    new Date().toISOString(),
    d.datetime || '',
    d.metier || '',
    d.chantier || '',
    d.responsable || '',
    Array.isArray(d.equipe) ? d.equipe.join('|') : '',
    d.youtubeUrl || '',
    meta.userAgent || '',
    JSON.stringify(d)
  ];
  sh.appendRow(row);
  return respond({ ok: true, sheet: TBM_SHEET_NAME, row: sh.getLastRow() });
}

function handleStop(meta, d) {
  const headers = [
    'sentAt',
    'datetime',
    'chantier',
    'responsable',
    'situation',
    'callNom',
    'callFonction',
    'solution',
    'noGo',
    'userAgent',
    'caseId',
    'photoUrl',
    'photoFileId',
    'payloadJson',
    'photo'
  ];

  const sh = getSheetByNameOrCreate(STOP_SHEET_NAME, headers);
  const caseId = d.caseId || Utilities.getUuid();

  let photoAttachment = { blob: null, fileName: '' };
  let photoError = '';
  if (d.photoDataUrl) {
    try {
      photoAttachment = buildStopPhotoAttachment(d.photoDataUrl, caseId);
    } catch (err) {
      photoError = String(err && err.message ? err.message : err);
    }
  }

  const row = [
    meta.sentAt || new Date().toISOString(),
    d.datetime || '',
    d.chantier || '',
    d.responsable || '',
    d.situation || '',
    d.callNom || '',
    d.callFonction || '',
    d.solution || '',
    d.noGo ? 'OUI' : 'NON',
    meta.userAgent || '',
    caseId,
    '',
    '',
    JSON.stringify({
      ...d,
      photoDataUrl: d.photoDataUrl ? '[sent-by-email]' : '',
      photoIncluded: !!photoAttachment.blob,
      photoError
    }),
    d.photoDataUrl ? 'oui' : ''
  ];

  sh.appendRow(row);

  // Envoi si NO-GO ou photo (photo jointe quand présente)
  if (d.noGo || d.photoDataUrl) {
    sendStopNoGoEmail({
      ...d,
      caseId,
      photoError,
      photoBlob: photoAttachment.blob,
      photoFileName: photoAttachment.fileName
    });
  }

  return respond({
    ok: true,
    sheet: STOP_SHEET_NAME,
    row: sh.getLastRow(),
    caseId
  });
}

function buildStopPhotoAttachment(photoDataUrl, caseId) {
  const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(photoDataUrl);
  if (!matches) throw new Error('Invalid photoDataUrl format');

  const mimeType = matches[1];
  const base64 = matches[2];
  const bytes = Utilities.base64Decode(base64);
  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `QHSE_STOP_${caseId}.${extension.replace('jpeg', 'jpg')}`;

  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  return { blob, fileName };
}

function sendStopNoGoEmail(stopData) {
  const extra = (PropertiesService.getScriptProperties().getProperty(STOP_ALERT_EMAILS_PROP) || '').trim();
  const recipients = Array.from(new Set([
    QHSE_EMAIL,
    ...String(extra || '').split(',').map(s => s.trim()).filter(Boolean)
  ])).join(',');
  if (!recipients) return;

  const subject = `[STOP][${stopData.noGo ? 'NO-GO' : 'PHOTO'}] ${stopData.chantier || 'Sans chantier'} - ${stopData.caseId}`;
  const lines = [
    stopData.noGo ? 'Un NO-GO STOP a été déclaré.' : 'Un STOP avec photo a été déclaré.',
    '',
    `Case ID: ${stopData.caseId || ''}`,
    `Date/heure: ${stopData.datetime || ''}`,
    `Chantier: ${stopData.chantier || ''}`,
    `Responsable: ${stopData.responsable || ''}`,
    `Situation: ${stopData.situation || ''}`,
    `Personne contactée: ${stopData.callNom || ''}`,
    `Fonction: ${stopData.callFonction || ''}`,
    `Mesures prises: ${stopData.solution || ''}`,
    stopData.photoBlob ? 'Photo: jointe au mail' : 'Photo: aucune',
    stopData.photoError ? `Erreur photo: ${stopData.photoError}` : ''
  ];

  const mailOptions = {};
  if (stopData.photoBlob) {
    mailOptions.attachments = [stopData.photoBlob.setName(stopData.photoFileName || `QHSE_STOP_${stopData.caseId}.jpg`)];
  }

  MailApp.sendEmail(recipients, subject, lines.join('\n'), mailOptions);
}

function handleFmra(meta, d) {
  const headers = [
    'sentAt',
    'datetime',
    'metier',
    'chantier',
    'responsable',
    'decision',
    'pointsIdentifies',
    'autreText',
    'userAgent',
    'payloadJson'
  ];

  const sh = getSheetByNameOrCreate(FMRA_SHEET_NAME, headers);
  const flagged = Array.isArray(d.flagged) ? d.flagged : [];

  const row = [
    meta.sentAt || new Date().toISOString(),
    d.datetime || '',
    d.metier || '',
    d.chantier || '',
    d.responsable || '',
    d.decision || '',
    flagged.map(f => f.question).join(' | '),
    d.autreText || '',
    meta.userAgent || '',
    JSON.stringify(d)
  ];

  sh.appendRow(row);

  // ✅ Le PM est informé systématiquement, que la décision soit OK GO ou STOP.
  // Le SIPP/QHSE n'est informé qu'à la clôture de la fiche STOP (logique existante, non modifiée ici).
  sendFmraPmEmail(d, flagged);

  return respond({ ok: true, sheet: FMRA_SHEET_NAME, row: sh.getLastRow() });
}

function sendFmraPmEmail(d, flagged) {
  const recipients = (PropertiesService.getScriptProperties().getProperty(FMRA_PM_EMAILS_PROP) || '').trim();
  if (!recipients) return; // ⚠️ Configurer la propriété de script FMRA_PM_EMAILS pour activer l'envoi.

  const isStop = d.decision === 'STOP';
  const subject = `[FMRA][${isStop ? 'STOP' : 'OK GO'}] ${d.chantier || 'Sans chantier'} - ${d.responsable || ''}`;

  const pointsLines = flagged.length
    ? flagged.map(f => `- ${f.question}\n  \u2192 ${f.recommandation}`)
    : ['Aucun point particulier identifié cette semaine.'];

  const lines = [
    isStop
      ? `${d.responsable || 'Le chef d\u2019équipe'} a lancé la procédure STOP suite à la FMRA.`
      : `${d.responsable || 'Le chef d\u2019équipe'} confirme que le travail peut démarrer (OK GO).`,
    '',
    `Métier: ${d.metier || ''}`,
    `Chantier: ${d.chantier || ''}`,
    `Chef d'équipe: ${d.responsable || ''}`,
    `Date: ${d.datetime || ''}`,
    '',
    'Points identifiés cette semaine:',
    ...pointsLines
  ];

  if (d.autreText) {
    lines.push('', `Autre risque précisé: ${d.autreText}`);
  }

  if (isStop) {
    lines.push(
      '',
      'Le détail du blocage et son traitement sont à compléter dans la fiche STOP dédiée de l\u2019application QHSE.',
      'Le SIPP/QHSE sera informé automatiquement à la clôture de cette fiche en cas d\u2019issue "no-go".'
    );
  }

  MailApp.sendEmail(recipients, subject, lines.join('\n'));
}

function getSheetByNameOrCreate(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    return sh;
  }

  // Garantit les colonnes A:O attendues pour STOP
  if (sh.getMaxColumns() < headers.length) {
    sh.insertColumnsAfter(sh.getMaxColumns(), headers.length - sh.getMaxColumns());
  }
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);

  return sh;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
