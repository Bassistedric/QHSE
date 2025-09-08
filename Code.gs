const TBM_SHEET_NAME = 'tbm';

function doPost(e) {
  const { meta = {}, data = {}, type } = JSON.parse(e.postData.contents);
  if (type === 'tbm') return handleTbm(meta, data);
  return respond({ ok: false, error: 'unknown type', type });
}

function handleTbm(meta, d) {
  const headers = ['sentAt','datetime','metier','chantier','responsable','equipe','youtubeUrl','userAgent','payloadJson'];
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
