const TBM_SHEET_NAME = 'tbm';
const STOP_SHEET_NAME = 'stop';
const STOP_PHOTO_FOLDER_ID = '1uSori6tFovYEXOg7TViO-RMxQr2WX8M2';

// Configure in Apps Script properties: STOP_ALERT_EMAILS="a@b.com,c@d.com"
const STOP_ALERT_EMAILS_PROP = 'STOP_ALERT_EMAILS';

function doPost(e) {
  const { meta = {}, data = {}, type } = JSON.parse(e.postData.contents);
  if (type === 'tbm') return handleTbm(meta, data);
  if (type === 'stop') return handleStop(meta, data);
  return respond({ ok: false, error: 'unknown type', type });
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

  let photoUpload = { url: '', fileId: '', blob: null, fileName: '' };
  if (d.photoDataUrl) {
    photoUpload = saveStopPhotoToDrive(d.photoDataUrl, caseId);
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
    photoUpload.url,
    photoUpload.fileId,
    JSON.stringify({ ...d, photoDataUrl: d.photoDataUrl ? '[stored-in-drive]' : '' })
  ];

  sh.appendRow(row);

  if (d.noGo) {
    sendStopNoGoEmail({
      ...d,
      caseId,
      photoUrl: photoUpload.url,
      photoBlob: photoUpload.blob,
      photoFileName: photoUpload.fileName
    });
  }

  return respond({
    ok: true,
    sheet: STOP_SHEET_NAME,
    row: sh.getLastRow(),
    caseId,
    photoUrl: photoUpload.url,
    photoFileId: photoUpload.fileId
  });
}

function saveStopPhotoToDrive(photoDataUrl, caseId) {
  const matches = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(photoDataUrl);
  if (!matches) throw new Error('Invalid photoDataUrl format');

  const mimeType = matches[1];
  const base64 = matches[2];
  const bytes = Utilities.base64Decode(base64);
  const extension = mimeType.split('/')[1] || 'jpg';
  const fileName = `QHSE_STOP_${caseId}.${extension.replace('jpeg', 'jpg')}`;

  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folder = DriveApp.getFolderById(STOP_PHOTO_FOLDER_ID);
  const file = folder.createFile(blob);

  return {
    url: file.getUrl(),
    fileId: file.getId(),
    blob,
    fileName
  };
}

function sendStopNoGoEmail(stopData) {
  const recipients = (PropertiesService.getScriptProperties().getProperty(STOP_ALERT_EMAILS_PROP) || '').trim();
  if (!recipients) return;

  const subject = `[STOP][NO-GO] ${stopData.chantier || 'Sans chantier'} - ${stopData.caseId}`;
  const lines = [
    'Un NO-GO STOP a été déclaré.',
    '',
    `Case ID: ${stopData.caseId || ''}`,
    `Date/heure: ${stopData.datetime || ''}`,
    `Chantier: ${stopData.chantier || ''}`,
    `Responsable: ${stopData.responsable || ''}`,
    `Situation: ${stopData.situation || ''}`,
    `Personne contactée: ${stopData.callNom || ''}`,
    `Fonction: ${stopData.callFonction || ''}`,
    `Mesures prises: ${stopData.solution || ''}`,
    stopData.photoUrl ? `Photo: ${stopData.photoUrl}` : 'Photo: aucune'
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
