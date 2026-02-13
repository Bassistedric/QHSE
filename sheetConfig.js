// Source CSV (Equipes-TBM, feuille AFFECTATIONS_SEMAINE)
export const SHEET_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNJqvjeu_Hox7I64HhX3y4j1SBWHswa6QO1mPwHEt2siXMP609WT__DnuGK-0Brlfq5D1a2R_iyL3g/pub?output=csv";

// On mappe les 2 métiers vers la même feuille normalisée AFFECTATIONS_SEMAINE
export const METIER_TO_GID = {
  Elec: "496527492",
  HVAC_REF: "496527492"
};

// (si ton code TBM l’utilise encore)
export const TBM_GID = "2013584163";

// Expose constants globally for non-module scripts
if (typeof window !== "undefined") {
  Object.assign(window, { SHEET_BASE_URL, METIER_TO_GID, TBM_GID });
}
