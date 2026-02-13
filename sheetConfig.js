// sheetConfig.js (QHSE) — VERSION NON-MODULE

// ----------------------------
// Sources CSV / IDs
// ----------------------------
const SHEET_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNJqvjeu_Hox7I64HhX3y4j1SBWHswa6QO1mPwHEt2siXMP609WT__DnuGK-0Brlfq5D1a2R_iyL3g/pub?output=csv";

const METIER_TO_GID = {
  Elec: "0",
  HVAC_REF: "2005844218",
};

// (si ton TBM utilise TBM_GID)
const TBM_GID = "2013584163";

// (si ton TBM poste vers Apps Script)
const COLLECT_URL =
  "https://script.google.com/macros/s/AKfycbw53EiERifnozNg9ybNfbn_Ofm9NrFquashw_mbYoWyqtQROS6xXXzwVT2UQ4XxcJYK/exec";

// Expose globally for non-module scripts
if (typeof window !== "undefined") {
  Object.assign(window, {
    SHEET_BASE_URL,
    METIER_TO_GID,
    TBM_GID,
    COLLECT_URL,
  });
}
