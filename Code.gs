const TBM_SHEET_NAME = 'tbm';
const STOP_SHEET_NAME = 'stop';
const STOP_PHOTO_FOLDER_ID = '1uSori6tFovYEXOg7TViO-RMxQr2WX8M2';

// Configure in Apps Script properties: STOP_ALERT_EMAILS="a@b.com,c@d.com"
const STOP_ALERT_EMAILS_PROP = 'STOP_ALERT_EMAILS';

function doPost(e) {
  try {
    const { meta = {}, data = {}, type } = JSON.parse(e.postData.contents);
    const formType = (type || meta.formType || '').toString().toLowerCase();

    if (formType === 'tbm') return handleTbm(meta, data);
    if (formType === 'stop') return handleStop(meta, data);

    return respond({ ok: false, error: 'unknown type', type, formType: meta.formType || '' });
  } catch (err) {
    return respond({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function handleTbm(meta, d) {
  const headers = ['sentAt', 'datetime', 'metier', 'chantier', 'responsable', 'equipe', 'youtubeUrl', 'userAgent', 'payloadJson'];
  const sh = getSheetByNameOrCreate(TBM_SHEET_NAME, headers);

  const row = {
    sentAt: new Date().toISOString(),
    datetime: d.datetime || '',
    metier: d.metier || '',
    chantier: d.chantier || '',
    responsable: d.responsable || '',
    equipe: Array.isArray(d.equipe) ? d.equipe.join('|') : '',
    youtubeUrl: d.youtubeUrl || '',
    userAgent: meta.userAgent || '',
    payloadJson: JSON.stringify(d)
  };

  const rowIndex = appendRowByHeaders(sh, row);
  return respond({ ok: true, sheet: TBM_SHEET_NAME, row: rowIndex });
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
  let photoError = '';
  if (d.photoDataUrl) {
    try {
      photoUpload = saveStopPhotoToDrive(d.photoDataUrl, caseId);
    } catch (err) {
      photoError = String(err && err.message ? err.message : err);
    }
  }

  const row = {
    sentAt: new Date().toISOString(),
    datetime: d.datetime || '',
    chantier: d.chantier || '',
    responsable: d.responsable || '',
    situation: d.situation || '',
    callNom: d.callNom || '',
    callFonction: d.callFonction || '',
    solution: d.solution || '',
    noGo: !!d.noGo,
    userAgent: meta.userAgent || '',
    caseId,
    photoUrl: photoUpload.url,
    photoFileId: photoUpload.fileId,
    payloadJson: JSON.stringify({
      ...d,
      photoDataUrl: d.photoDataUrl ? '[stored-in-drive]' : '',
      photoStored: !!photoUpload.fileId,
      photoError
    })
  };

  const rowIndex = appendRowByHeaders(sh, row);

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
    row: rowIndex,
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


function appendRowByHeaders(sh, dataByHeader) {
  const lastColumn = Math.max(sh.getLastColumn(), 1);
  const headers = sh.getRange(1, 1, 1, lastColumn).getValues()[0].map((h) => String(h || '').trim());

  const headerToIndex = {};
  headers.forEach((h, idx) => {
    if (h) headerToIndex[h] = idx;
  });

  const rowValues = new Array(lastColumn).fill('');
  Object.keys(dataByHeader).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(headerToIndex, key)) {
      rowValues[headerToIndex[key]] = dataByHeader[key];
    }
  });

  sh.appendRow(rowValues);
  return sh.getLastRow();
}

function getSheetByNameOrCreate(name, headers) {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    return sh;
  }

  const existingLastColumn = Math.max(sh.getLastColumn(), 1);
  const existingHeaders = sh.getRange(1, 1, 1, existingLastColumn).getValues()[0].map((h) => String(h || '').trim());
  const missing = headers.filter((h) => existingHeaders.indexOf(h) === -1);

  if (missing.length) {
    const startCol = existingLastColumn + 1;
    sh.getRange(1, startCol, 1, missing.length).setValues([missing]);
  }

  return sh;
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
