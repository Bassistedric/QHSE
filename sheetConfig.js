export const SHEET_BASE_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTNJqvjeu_Hox7I64HhX3y4j1SBWHswa6QO1mPwHEt2siXMP609WT__DnuGK-0Brlfq5D1a2R_iyL3g/pub?output=csv";

export const METIER_TO_GID = { Elec: "0", HVAC_REF: "2005844218" };
export const TBM_GID = "2013584163";

// ✅ IMPORTANT : AFFECTATIONS_SEMAINE
export const AFFECTATIONS_GID = "496527492";

export const SUIVI_PMS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQuTHHF0EDmhAxj4IbH_eqcsg8rtMUoJpo8gz5I2WAS3LhscoM-zhGH9zLVfJ00YKJsw3YiDoyqF3sJ/pub?gid=1420233608&single=true&output=csv";

export const ATTESTATION_COLLECT_URL =
  "https://script.google.com/macros/s/AKfycbyVjoTjAttwzjdQqUp2a1Upvvl9A1WEvp0dse47Cp_gt6mVOYDc1P_2u372poEZiu_H/exec";

if (typeof window !== "undefined") {
  Object.assign(window, {
    SHEET_BASE_URL,
    METIER_TO_GID,
    TBM_GID,
    AFFECTATIONS_GID,
    SUIVI_PMS_CSV_URL,
    ATTESTATION_COLLECT_URL
  });
}
