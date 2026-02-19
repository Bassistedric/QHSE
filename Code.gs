const TBM_SHEET_NAME = 'tbm';
const STOP_SHEET_NAME = 'stop';
// Configure in Apps Script properties: STOP_ALERT_EMAILS="a@b.com,c@d.com"
const STOP_ALERT_EMAILS_PROP = 'STOP_ALERT_EMAILS';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const meta = payload.meta || {};
    const data = payload.data || {};
    const type = String(payload.type || meta.formType || payload.formType || '').toLowerCase();

    if (type === 'tbm') return handleTbm(meta, data);
    if (type === 'stop') return handleStop(meta, data);

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
    'payloadJson'
  ];

  const sh = getSheetByNameOrCreate(STOP_SHEET_NAME, headers);
  const caseId = d.caseId || Utilities.getUuid();

  let photoMail = { blob: null, fileName: '' };
  let photoError = '';
  if (d.photoDataUrl) {
    try {
      photoMail = decodePhotoDataUrl(d.photoDataUrl, caseId);
    } catch (err) {
      photoError = String(err && err.message ? err.message : err);
    }
  }

  const row = [
    new Date().toISOString(),
    d.datetime || '',
    d.chantier || '',
    d.responsable || '',
    d.situation || '',
    d.callNom || '',
    d.callFonction || '',
    d.solution || '',
    !!d.noGo,
    meta.userAgent || '',
    caseId,
    '',
    '',
    JSON.stringify({
      ...d,
      photoDataUrl: d.photoDataUrl ? '[sent-by-email]' : '',
      photoStoredInDrive: false,
      photoSentByEmail: !!photoMail.blob,
      photoError
    })
  ];

  sh.appendRow(row);

  sendStopEmail({
    ...d,
    caseId,
    photoBlob: photoMail.blob,
    photoFileName: photoMail.fileName,
    photoError
  });

  return respond({
    ok: true,
    sheet: STOP_SHEET_NAME,
    row: sh.getLastRow(),
    caseId,
    photoUrl: '',
    photoFileId: '',
    photoSentByEmail: !!photoMail.blob,
    photoError
  });
}

function decodePhotoDataUrl(photoDataUrl, caseId) {
  const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(String(photoDataUrl || ''));
  if (!matches) throw new Error('Invalid photoDataUrl format');

  const mimeType = matches[1];
  const base64 = matches[2];
  const bytes = Utilities.base64Decode(base64);
  const extension = (mimeType.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const fileName = `QHSE_STOP_${caseId}.${extension}`;

  return {
    blob: Utilities.newBlob(bytes, mimeType, fileName),
    fileName
  };
}

function sendStopEmail(stopData) {
  const recipients = (PropertiesService.getScriptProperties().getProperty(STOP_ALERT_EMAILS_PROP) || '').trim();
  if (!recipients) return;

  const subject = `[STOP] ${stopData.noGo ? '[NO-GO] ' : ''}${stopData.chantier || 'Sans chantier'} - ${stopData.caseId}`;
  const lines = [
    stopData.noGo ? 'Un NO-GO STOP a été déclaré.' : 'Un STOP a été déclaré.',
    '',
    `Case ID: ${stopData.caseId || ''}`,
    `Date/heure: ${stopData.datetime || ''}`,
    `Chantier: ${stopData.chantier || ''}`,
    `Responsable: ${stopData.responsable || ''}`,
    `Situation: ${stopData.situation || ''}`,
    `Personne contactée: ${stopData.callNom || ''}`,
    `Fonction: ${stopData.callFonction || ''}`,
    `Mesures prises: ${stopData.solution || ''}`,
    stopData.photoBlob ? 'Photo: en pièce jointe' : 'Photo: aucune',
    stopData.photoError ? `Erreur photo: ${stopData.photoError}` : ''
  ];

  const mailOptions = {};
  if (stopData.photoBlob) {
    mailOptions.attachments = [stopData.photoBlob.setName(stopData.photoFileName || `QHSE_STOP_${stopData.caseId}.jpg`)];
  }

  MailApp.sendEmail(recipients, subject, lines.join('\n'), mailOptions);
}

function getSheetByNameOrCreate(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
  }
  return sh;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
