// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { nowLocalDateTime } from './utils/date.js';

// ========================= CONFIG =========================
// ⬇⬇ Remplacer l' URL Apps Script /exec si modification du GSheet
const COLLECT_URL = "https://script.google.com/macros/library/d/1e2P1ItFjdcqrKotKdiffEX9BoneoxhC2PjwvGtSvrNB_iAYuDfgbdveV/25";

const STORAGE_KEY     = "qhse_current_v1";
const OUTBOX_KEY      = "qhse_outbox_v1";
const PREFS_KEY       = "qhse_prefs_v1"; // conserve Responsable & Équipe
const LANG_KEY        = "qhse_lang_v1";  // fr/en/nl

const RESPONSABLES_PAR_CHANTIER = {
  "Chantier A": ["Alice", "Albert"],
  "Chantier B": ["Brigitte", "Bob"],
};

// ========================= I18N (FR/EN/NL) =========================
// >>> ensemble des libellés ici, FR par défaut.
if (!globalThis.QHSE_I18N) {
  globalThis.QHSE_I18N = {
    fr: {
      // Accueil / global
      home_title: "QHSE – Apps chantier",
      home_apps: "Applications chantier",
      home_install: "Installer sur mobile",
      home_scan: "Scannez avec l’appareil photo pour ouvrir l’app.",
      install_howto_title: "Installer sur le téléphone",
      install_howto_body:
`Ouvre l’URL sur le mobile (en ligne, 1ʳᵉ fois) →
 iPhone (Safari) : Partager → Sur l’écran d’accueil.
 Android (Chrome) : ⋮ → Ajouter à l’écran d’accueil.
Ensuite, l’app peut fonctionner hors-ligne.`,

      tile_lmra_title: "LMRA",
      tile_lmra_sub: "Analyse de risque",
      tile_fa_title: "Premiers soins",
      tile_fa_sub: "Utilisation trousse",
      tile_stop_title: "STOP chantier",
      tile_stop_sub: "Imprévu / arrêt",

      tile_tbm_title: "TBM",
      tile_tbm_sub: "Toolbox meeting",

      print: "Imprimer",
      reset_all: "Réinitialiser le formulaire (tout remettre à zéro)",
      reset_hint_team: "Remet tout à zéro, excepté le nom du responsable et l'équipe.",
      send: "Envoyer",
      sending: "Envoi en cours…",
      queue_label: "File",
      prev: "Précédent",
      next: "Suivant",

      // Alerts
      alert_sent: "Envoyé ✅",
      alert_offline_queued: "Pas de réseau : enregistré localement. Envoi auto dès connexion.",
      required_field: "Champ obligatoire",
      required_fields: "Merci de remplir les champs obligatoires.",

      // LMRA
      lmra_title: "LMRA",
      general_info: "Infos générales",
      datetime: "Date & heure",
      job: "Métier",
      job_ph: "Ex: électricien",
      site: "Chantier",
      site_ph: "Ex: Bât. A – Toiture",
      task: "Tâche",
      task_ph: "Ex: Remplacement moteur ventilo",
      manager: "Responsable (Nom & Prénom)",
      manager_ph: "Ex: Jean Dupont",
      team: "Équipe",
      team_member_ph: "Nom & prénom",
      team_validate: "Valider",
      team_add: "Ajouter",
      team_empty: "(Ajouter les membres)",

      cond_title: "Conditions du jour",
      cond_task_clear: "Tâche & étapes claires",
      cond_coactivity: "Co-activité / interfaces gérées",
      cond_zone: "Zone balisée / accès maîtrisé",
      cond_epi: "EPI adaptés portés",

      permits_title: "Permis requis",
      permit_fire: "Feu",
      permit_elec: "Électrique",
      permit_confined: "Espace confiné",
      permit_lift: "Levage",
      permit_other: "Autre",
      permit_other_ph: "Préciser l’autre permis",
      permit_na: "N/A",

      risks_title: "Risques présents",
      energies_title: "Énergies",
      energy_electric: "Électrique",
      energy_mechanical: "Mécanique",
      energy_fluid: "Hydraulique/Pneumatique",
      energy_gravity: "Gravité",

      env_title: "Environnement",
      env_height: "Hauteur",
      env_weather: "Vent/Météo",
      env_noise: "Bruit",
      env_dust: "Poussières",
      env_thermal: "Chaleur/Froid",
      env_chemical: "Produits chimiques",

      ops_title: "Opérations",
      ops_traffic: "Circulation / engins",
      ops_lift: "Levage",
      ops_tools: "Outillage portatif",
      ops_atex: "ATEX",
      ops_confined: "Espace confiné",
      ops_others: "Autres",
      ops_others_ph: "Préciser autres opérations",

      measures_title: "Mesures de maîtrise",
      measures_seven: "7 règles consignation + test",
      measures_ventilation: "Ventilation / mesure gaz",
      measures_earth: "Mise à la terre",
      measures_balisage: "Balisage / zonage",
      measures_watch: "Observateur / surveillant",
      measures_liftplan: "Plan de levage / CMU vérifiée",
      measures_anchor: "Ancrage / chutes d’objets",
      measures_toolsok: "Outils conformes / inspection",
      measures_other: "Autre",
      measures_other_ph: "Préciser autre mesure",

      top3_title: "Top 3 risques & actions",
      risk_ph: "Risque",
      action_ph: "Action immédiate",
      resp_ph: "Responsable",

      decision_title: "Décision & responsable",
      go: "GO",
      no_go: "NO-GO",
      nogo_name: "Nom à prévenir",
      nogo_name_ph: "Nom à prévenir",
      nogo_tel: "Téléphone",
      nogo_tel_ph: "Téléphone",
      notes: "Notes",
      notes_ph: "Observations…",

      // First aid
      fa_title: "Premiers soins",
      fa_info: "Informations",
      person: "Personne concernée",
      action_title: "Action (au moment du fait)",
      a_cut: "En coupant",
      a_grind: "En disquant",
      a_weld: "En soudant",
      a_drill: "En perçant",
      a_pushpull: "En tirant/poussant",
      a_lift: "En soulevant/déposant",
      other: "Autre",
      other_specify: "Préciser…",
      injury_title: "Blessure",
      i_cut: "Coupure",
      i_scratch: "Égratignure",
      i_bruise: "Contusion (bleu/bosse)",
      i_proj: "Projection (poussière/matière)",
      i_burn: "Brûlure",
      location_title: "Localisation de la lésion",
      loc_hand: "Main",
      loc_arm: "Bras",
      loc_torso: "Torse",
      loc_leg: "Jambe",
      loc_foot: "Pied",
      loc_head: "Tête",
      loc_eye: "Œil",
      kit_title: "Trousse de secours",
      kit_need: "Faut-il recharger la trousse ?",
      no: "Non",
      yes: "Oui",
      kit_number: "Numéro de la trousse",
      remarks: "Remarques",

      // STOP
      stop_title: "STOP – Imprévu",
      coords: "Coordonnées",
      stop_box: "STOP",
      stop_desc: "Expliquer la situation qui a amené au STOP",
      call_box: "CALL",
      call_name: "Responsable contacté – Nom",
      call_role: "Fonction",
      role_chef: "Chef d'équipe",
      role_site: "Site sup.",
      role_pm: "PM",
      role_opm: "OPM",
      role_cp: "CP",
      role_coord: "Coordinateur",
      role_client: "Client",
      act_box: "ACT",
      solution: "Solution mise en place",
      nogo_wait: "NO-GO — Situation en attente de solution",

      // ✅ PHOTO (STOP)
      photo_box: "PHOTO",
      photo_optional: "Optionnel. 1 photo max (compressée automatiquement).",
      photo_take: "Prendre / choisir une photo",
      photo_remove: "Supprimer",
      photo_status_ready: "OK",
      photo_status_processing: "Compression photo…",
      photo_status_error: "Erreur traitement photo",
    },

    en: {
      // Home / global
      home_title: "QHSE – Site apps",
      home_apps: "Site applications",
      home_install: "Install on mobile",
      home_scan: "Scan with the camera to open the app.",
      install_howto_title: "Install on the phone",
      install_howto_body:
`Open the URL on the phone (online, first time) →
 iPhone (Safari): Share → Add to Home Screen.
 Android (Chrome): ⋮ → Add to Home screen.
Then, the app can work offline.`,

      tile_lmra_title: "LMRA",
      tile_lmra_sub: "Risk assessment",
      tile_fa_title: "First aid",
      tile_fa_sub: "First-aid kit use",
      tile_stop_title: "STOP",
      tile_stop_sub: "Unplanned / stop",

      tile_tbm_title: "TBM",
      tile_tbm_sub: "Toolbox meeting",

      print: "Print",
      reset_all: "Reset form (clear everything)",
      reset_hint_team: "Resets everything except the manager's name and team.",
      send: "Send",
      sending: "Sending…",
      queue_label: "Queue",
      prev: "Previous",
      next: "Next",

      alert_sent: "Sent ✅",
      alert_offline_queued: "No network: saved locally. Will auto-send when online.",
      required_field: "Required field",
      required_fields: "Please fill in required fields.",

      // LMRA
      lmra_title: "LMRA",
      general_info: "General info",
      datetime: "Date & time",
      job: "Job",
      job_ph: "e.g. Electrician",
      site: "Site / Area",
      site_ph: "e.g. Building A – Roof",
      task: "Task",
      task_ph: "e.g. Replace fan motor",
      manager: "Manager (First & Last name)",
      manager_ph: "e.g. John Smith",
      team: "Team",
      team_member_ph: "First & last name",
      team_validate: "Validate",
      team_add: "Add",
      team_empty: "(Add members)",

      cond_title: "Day conditions",
      cond_task_clear: "Task & steps are clear",
      cond_coactivity: "Co-activity / interfaces managed",
      cond_zone: "Area cordoned / access controlled",
      cond_epi: "PPE adapted and worn",

      permits_title: "Required permits",
      permit_fire: "Hot work",
      permit_elec: "Electrical",
      permit_confined: "Confined space",
      permit_lift: "Lifting",
      permit_other: "Other",
      permit_other_ph: "Specify the other permit",
      permit_na: "N/A",

      risks_title: "Present risks",
      energies_title: "Energies",
      energy_electric: "Electrical",
      energy_mechanical: "Mechanical",
      energy_fluid: "Hydraulic/Pneumatic",
      energy_gravity: "Gravity",

      env_title: "Environment",
      env_height: "Height",
      env_weather: "Wind/Weather",
      env_noise: "Noise",
      env_dust: "Dust",
      env_thermal: "Heat/Cold",
      env_chemical: "Chemicals",

      ops_title: "Operations",
      ops_traffic: "Traffic / vehicles",
      ops_lift: "Lifting",
      ops_tools: "Hand tools",
      ops_atex: "ATEX",
      ops_confined: "Confined space",
      ops_others: "Others",
      ops_others_ph: "Specify other operations",

      measures_title: "Control measures",
      measures_seven: "7 lockout rules + test",
      measures_ventilation: "Ventilation / gas measurement",
      measures_earth: "Earthing",
      measures_balisage: "Barricading / zoning",
      measures_watch: "Watchman / spotter",
      measures_liftplan: "Lift plan / SWL checked",
      measures_anchor: "Anchorage / falling objects",
      measures_toolsok: "Tools compliant / inspection",
      measures_other: "Other",
      measures_other_ph: "Specify other measure",

      top3_title: "Top 3 risks & actions",
      risk_ph: "Risk",
      action_ph: "Immediate action",
      resp_ph: "Responsible",

      decision_title: "Decision & manager",
      go: "GO",
      no_go: "NO-GO",
      nogo_name: "Person to notify",
      nogo_name_ph: "Person to notify",
      nogo_tel: "Phone",
      nogo_tel_ph: "Phone",
      notes: "Notes",
      notes_ph: "Observations…",

      // First aid
      fa_title: "First aid",
      fa_info: "Information",
      person: "Person concerned",
      action_title: "Action (at the time)",
      a_cut: "Cutting",
      a_grind: "Grinding",
      a_weld: "Welding",
      a_drill: "Drilling",
      a_pushpull: "Pulling/Pushing",
      a_lift: "Lifting/Setting down",
      other: "Other",
      other_specify: "Specify…",
      injury_title: "Injury",
      i_cut: "Cut",
      i_scratch: "Scratch",
      i_bruise: "Bruise (blue/bump)",
      i_proj: "Projection (dust/material)",
      i_burn: "Burn",
      location_title: "Injury location",
      loc_hand: "Hand",
      loc_arm: "Arm",
      loc_torso: "Torso",
      loc_leg: "Leg",
      loc_foot: "Foot",
      loc_head: "Head",
      loc_eye: "Eye",
      kit_title: "First-aid kit",
      kit_need: "Do we need to restock the kit?",
      no: "No",
      yes: "Yes",
      kit_number: "Kit number",
      remarks: "Remarks",

      // STOP
      stop_title: "STOP – Unexpected",
      coords: "Details",
      stop_box: "STOP",
      stop_desc: "Explain the situation that led to STOP",
      call_box: "CALL",
      call_name: "Responsible contacted – Name",
      call_role: "Role",
      role_chef: "Team leader",
      role_site: "Site supervisor",
      role_pm: "PM",
      role_opm: "OPM",
      role_cp: "CP",
      role_coord: "Coordinator",
      role_client: "Client",
      act_box: "ACT",
      solution: "Solution implemented",
      nogo_wait: "NO-GO — Situation pending a solution",

      // ✅ PHOTO (STOP)
      photo_box: "PHOTO",
      photo_optional: "Optional. Max 1 photo (auto-compressed).",
      photo_take: "Take / choose a photo",
      photo_remove: "Remove",
      photo_status_ready: "OK",
      photo_status_processing: "Compressing photo…",
      photo_status_error: "Photo processing error",
    },

    nl: {
      // Home / global
      home_title: "QHSE – Werf-apps",
      home_apps: "Werfapplicaties",
      home_install: "Installeren op mobiel",
      home_scan: "Scan met de camera om de app te openen.",
      install_howto_title: "Op de telefoon installeren",
      install_howto_body:
`Open de URL op de telefoon (online, eerste keer) →
 iPhone (Safari): Delen → Zet op beginscherm.
 Android (Chrome): ⋮ → Toevoegen aan startscherm.
Daarna kan de app offline werken.`,

      tile_lmra_title: "LMRA",
      tile_lmra_sub: "Risicoanalyse",
      tile_fa_title: "Eerste hulp",
      tile_fa_sub: "Gebruik EHBO-koffer",
      tile_stop_title: "STOP",
      tile_stop_sub: "Onvoorziene stop",

      tile_tbm_title: "TBM",
      tile_tbm_sub: "Toolbox meeting",

      print: "Afdrukken",
      reset_all: "Formulier resetten (alles wissen)",
      reset_hint_team: "Zet alles terug behalve de naam van de verantwoordelijke en het team.",
      send: "Verzenden",
      sending: "Verzenden…",
      queue_label: "Wachtrij",
      prev: "Vorige",
      next: "Volgende",

      alert_sent: "Verzonden ✅",
      alert_offline_queued: "Geen netwerk: lokaal opgeslagen. Wordt automatisch verzonden zodra online.",
      required_field: "Verplicht veld",
      required_fields: "Vul de verplichte velden in.",

      // LMRA
      lmra_title: "LMRA",
      general_info: "Algemene info",
      datetime: "Datum & tijd",
      job: "Beroep",
      job_ph: "Bv. elektricien",
      site: "Werf / Zone",
      site_ph: "Bv. Gebouw A – Dak",
      task: "Taak",
      task_ph: "Bv. Vervangen ventilatormotor",
      manager: "Verantwoordelijke (Voor- & achternaam)",
      manager_ph: "Bv. Jan Jansen",
      team: "Team",
      team_member_ph: "Voor- & achternaam",
      team_validate: "Bevestigen",
      team_add: "Toevoegen",
      team_empty: "(Voeg teamleden toe)",

      cond_title: "Dagcondities",
      cond_task_clear: "Taak & stappen zijn duidelijk",
      cond_coactivity: "Co-activiteit / interfaces beheerd",
      cond_zone: "Zone afgebakend / toegang beheerst",
      cond_epi: "Juiste PBM gedragen",

      permits_title: "Vereiste vergunningen",
      permit_fire: "Hete werken",
      permit_elec: "Elektrisch",
      permit_confined: "Besloten ruimte",
      permit_lift: "Hijswerk",
      permit_other: "Andere",
      permit_other_ph: "Specifieer de andere vergunning",
      permit_na: "N.v.t.",

      risks_title: "Aanwezige risico’s",
      energies_title: "Energieën",
      energy_electric: "Elektrisch",
      energy_mechanical: "Mechanisch",
      energy_fluid: "Hydraulisch/Pneumatisch",
      energy_gravity: "Zwaartekracht",

      env_title: "Omgeving",
      env_height: "Hoogte",
      env_weather: "Wind/Weer",
      env_noise: "Lawaai",
      env_dust: "Stof",
      env_thermal: "Warmte/Kou",
      env_chemical: "Chemicaliën",

      ops_title: "Handelingen",
      ops_traffic: "Verkeer / voertuigen",
      ops_lift: "Hijswerk",
      ops_tools: "Handgereedschap",
      ops_atex: "ATEX",
      ops_confined: "Besloten ruimte",
      ops_others: "Andere",
      ops_others_ph: "Specifieer andere handelingen",

      measures_title: "Beheersmaatregelen",
      measures_seven: "7 lockoutregels + test",
      measures_ventilation: "Ventilatie / gasmeting",
      measures_earth: "Aarding",
      measures_balisage: "Afbakening / zonering",
      measures_watch: "Observator / spotter",
      measures_liftplan: "Hijsplan / SWL gecontroleerd",
      measures_anchor: "Ankerpunt / vallende voorwerpen",
      measures_toolsok: "Gereedschap conform / inspectie",
      measures_other: "Andere",
      measures_other_ph: "Specifieer andere maatregel",

      top3_title: "Top 3 risico’s & acties",
      risk_ph: "Risico",
      action_ph: "Onmiddellijke actie",
      resp_ph: "Verantwoordelijke",

      decision_title: "Beslissing & verantwoordelijke",
      go: "GO",
      no_go: "NO-GO",
      nogo_name: "Te verwittigen naam",
      nogo_name_ph: "Te verwittigen naam",
      nogo_tel: "Telefoon",
      nogo_tel_ph: "Telefoon",
      notes: "Opmerkingen",
      notes_ph: "Opmerkingen…",

      // First aid
      fa_title: "Eerste hulp",
      fa_info: "Informatie",
      person: "Betrokken persoon",
      action_title: "Handeling (op het moment)",
      a_cut: "Bij snijden",
      a_grind: "Bij slijpen",
      a_weld: "Bij lassen",
      a_drill: "Bij boren",
      a_pushpull: "Bij trekken/duwen",
      a_lift: "Bij heffen/neerzetten",
      other: "Andere",
      other_specify: "Specifieer…",
      injury_title: "Letsel",
      i_cut: "Snijwonde",
      i_scratch: "Schaafwonde",
      i_bruise: "Kneuzing (blauw/buil)",
      i_proj: "Projectie (stof/materiaal)",
      i_burn: "Brandwonde",
      location_title: "Plaats van het letsel",
      loc_hand: "Hand",
      loc_arm: "Arm",
      loc_torso: "Romp",
      loc_leg: "Been",
      loc_foot: "Voet",
      loc_head: "Hoofd",
      loc_eye: "Oog",
      kit_title: "EHBO-koffer",
      kit_need: "Moet de koffer aangevuld worden?",
      no: "Nee",
      yes: "Ja",
      kit_number: "Koffernummer",
      remarks: "Opmerkingen",

      // STOP
      stop_title: "STOP – Onvoorzien",
      coords: "Gegevens",
      stop_box: "STOP",
      stop_desc: "Leg de situatie uit die tot STOP heeft geleid",
      call_box: "CALL",
      call_name: "Gecontacteerde verantwoordelijke – Naam",
      call_role: "Functie",
      role_chef: "Ploegbaas",
      role_site: "Siteverantw.",
      role_pm: "PM",
      role_opm: "OPM",
      role_cp: "CP",
      role_coord: "Coördinator",
      role_client: "Klant",
      act_box: "ACT",
      solution: "Ingevoerde oplossing",
      nogo_wait: "NO-GO — Situatie in afwachting van oplossing",

      // ✅ PHOTO (STOP)
      photo_box: "FOTO",
      photo_optional: "Optioneel. Max. 1 foto (automatisch gecomprimeerd).",
      photo_take: "Maak / kies een foto",
      photo_remove: "Verwijderen",
      photo_status_ready: "OK",
      photo_status_processing: "Foto comprimeren…",
      photo_status_error: "Fout bij fotoverwerking",
    },
  };
}
const I18N = globalThis.QHSE_I18N; // alias unique

// ========================= HELPERS =========================
const parseRoute = () => (location.hash.replace(/^#\/?/, '') || 'home');
const saveLS = (k,v)=>{ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };
const loadLS = (k,def)=>{ try{ const raw=localStorage.getItem(k); return raw? JSON.parse(raw): def; }catch{return def;} };

// i18n hook & provider simples
const I18nContext = React.createContext({ lang:'fr', t:(k)=>k, setLang:()=>{} });
function I18nProvider({children}){
  const [lang, setLangState] = React.useState(loadLS(LANG_KEY, 'fr'));
  const setLang = (l)=>{ setLangState(l); saveLS(LANG_KEY,l); };
  const t = (key)=> (I18N[lang] && I18N[lang][key]) || (I18N.fr && I18N.fr[key]) || key;
  return <I18nContext.Provider value={{lang,t,setLang}}>{children}</I18nContext.Provider>;
}
const useI18n = ()=>React.useContext(I18nContext);

// Petits composants génériques
function Section({ title, tone = "default", children }) {
  const TONES = {
    default: { border: "border-gray-200", bar: "bg-gray-50", title: "text-gray-800", bg: "bg-white" },
    slate:   { border: "border-slate-300", bar: "bg-slate-50", title: "text-slate-900", bg: "bg-white" },
    blue:    { border: "border-blue-300",  bar: "bg-blue-50",  title: "text-blue-900",  bg: "bg-white" },
    green:   { border: "border-green-300", bar: "bg-green-50", title: "text-green-900", bg: "bg-white" },
    red:     { border: "border-red-300",   bar: "bg-red-50",   title: "text-red-900",   bg: "bg-white" },
    amber:   { border: "border-amber-300", bar: "bg-amber-50", title: "text-amber-900", bg: "bg-white" },
    dark:    { border: "border-gray-700",  bar: "bg-gray-700", title: "text-white",     bg: "bg-gray-700" },
  };
  const c = TONES[tone] || TONES.default;

  return (
    <section className={`rounded-2xl border ${c.border} ${c.bg} shadow-sm overflow-hidden mb-4`}>
      <div className={`px-4 py-2 border-b ${c.border} ${c.bar} text-base font-medium ${c.title}`}>
        {title}
      </div>
      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

function Toggle({ checked, onChange, label }){
  return (
    <label className="flex items-center justify-between gap-3 py-2">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        className="w-5 h-5 accent-black"
        checked={checked}
        onChange={(e)=>onChange(e.target.checked)}
      />
    </label>
  );
}

// Envoi + file d’attente locale (offline)
async function sendNow(payload){
  try{
    const res = await fetch(COLLECT_URL, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // si Apps Script renvoie 4xx/5xx => res.ok = false
    if (!res.ok) return false;

    const txt = await res.text().catch(()=> "");
    // optionnel: si tu renvoies {ok:true} côté script
    if (txt) {
      try {
        const j = JSON.parse(txt);
        if (j && j.ok === false) return false;
      } catch {}
    }
    return true;
  } catch (e) {
    console.warn(e);
    return false;
  }
}

function enqueueOutbox(item){
  const box = loadLS(OUTBOX_KEY, []);
  box.unshift(item);
  saveLS(OUTBOX_KEY, box.slice(0,500));
}
async function flushOutbox(){
  let box = loadLS(OUTBOX_KEY, []);
  if(!box.length) return {sent:0,left:0};
  let sent=0, left=[];
  for(const it of box){
    const ok = await sendNow(it);
    if(ok) sent++; else left.push(it);
  }
  saveLS(OUTBOX_KEY, left);
  return {sent,left:left.length};
}
globalThis.addEventListener('online', ()=>{ flushOutbox(); });

// ========================= PHOTO HELPERS (STOP) =========================
function approxSizeKbFromDataUrl_(dataUrl){
  const b64 = (String(dataUrl||"").split(",")[1] || "");
  const bytes = Math.floor(b64.length * 0.75);
  return Math.round(bytes / 1024);
}
function loadImage_(file){
  return new Promise((resolve,reject)=>{
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = ()=>{ URL.revokeObjectURL(url); resolve(img); };
    img.onerror = (e)=>{ URL.revokeObjectURL(url); reject(e); };
    img.src = url;
  });
}
async function fileToCompressedDataUrl_(file, maxDim=1280, quality=0.72){
  const img = await loadImage_(file);
  const w = img.width, h = img.height;

  let tw=w, th=h;
  const maxSide = Math.max(w,h);
  if(maxSide > maxDim){
    const s = maxDim / maxSide;
    tw = Math.round(w*s);
    th = Math.round(h*s);
  }

  const canvas = document.createElement("canvas");
  canvas.width = tw; canvas.height = th;
  const ctx = canvas.getContext("2d", {alpha:false});
  ctx.drawImage(img, 0, 0, tw, th);

  return canvas.toDataURL("image/jpeg", quality);
}

// Préférences (Responsable & Équipe conservés)
const defaultPrefs = { responsable:"", team:[] };

if (!globalThis.QHSE_Tile) {
  globalThis.QHSE_Tile = function Tile({href, icon, img, title, sub, muted}) {
    const base = "rounded-2xl p-4 text-center transition border";
    const active = "hover:bg-gray-50";
    const off = "border-dashed text-gray-300 pointer-events-none select-none";
    return (
      <a href={href||"#"} className={[base, muted?off:active].join(" ")}>
        {img ? (
          <img src={img} alt="" className={"w-10 h-10 mx-auto rounded " + (muted?"opacity-40":"")} />
        ) : (
          <div className={"text-3xl font-bold " + (muted?"opacity-40":"")}>{icon || "＋"}</div>
        )}
        {title && <div className="font-semibold mt-2">{title}</div>}
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </a>
    );
  };
}

function HomeScreen(){
  const { t } = useI18n();

  // Fallback : si le composant global n’existe pas, on en crée un local
  const TileC = globalThis.QHSE_Tile || function Tile({href, icon, img, title, sub, muted}) {
    const base = "rounded-2xl p-4 text-center transition border";
    const active = "hover:bg-gray-50";
    const off = "border-dashed text-gray-300 pointer-events-none select-none";
    return (
      <a href={href||"#"} className={[base, muted?off:active].join(" ")}>
        {img ? (
          <img src={img} alt="" className={"w-10 h-10 mx-auto rounded " + (muted?"opacity-40":"")} />
        ) : (
          <div className={"text-3xl font-bold " + (muted?"opacity-40":"")}>{icon || "＋"}</div>
        )}
        {title && <div className="font-semibold mt-2">{title}</div>}
        {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
      </a>
    );
  };

  const installUrl = (location.origin + location.pathname).replace(/#.*$/,'');

  return (
    <main className="max-w-md mx-auto p-4">
      <Section title={t('home_apps')}>
        <div className="grid grid-cols-2 gap-4">
          <TileC href="#lmra" icon="🦺" title={t('tile_lmra_title')} sub={t('tile_lmra_sub')} />
          <TileC href="#firstaid" img="firstaid-icon.svg" title={t('tile_fa_title')} sub={t('tile_fa_sub')} />
          <TileC href="#stop" icon="🚦" title={t('tile_stop_title')} sub={t('tile_stop_sub')} />
          <TileC href="tbm.html" icon="🧰" title={t('tile_tbm_title')} sub={t('tile_tbm_sub')} />
        </div>
      </Section>

      <Section title={t('home_install')}>
        <div className="flex flex-col items-center gap-3">
          <img
            src={"https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" + encodeURIComponent(installUrl)}
            alt="QR"
            className="w-44 h-44 rounded-lg border bg-white"
          />
          <div className="text-xs text-gray-500">{t('home_scan')}</div>
        </div>
      </Section>

      <Section title={t('install_howto_title')}>
        <pre className="whitespace-pre-wrap text-xs bg-gray-50 rounded-xl p-3 border">
          {t('install_howto_body')}
        </pre>
      </Section>
    </main>
  );
}

function LmraScreen(){
  const { t } = useI18n();

  // --- Storage keys dédiés LMRA
  const STATE_KEY = "qhse_lmra_state_v1";

  // --- Préférences globales
  const prefs = loadLS(PREFS_KEY, { responsable:"", team:[] });

  const initialState = () => ({
    version: "v3.2",
    datetime: nowLocalDateTime(),
    job: "",
    site: "", task: "",
    responsable: prefs.responsable || "",
    team: Array.isArray(prefs.team) ? [...prefs.team] : [],
    teamInput: "",
    conditions: { tacheClaires:false, coactivite:false, zonage:false, epi:false },
    permits: { feu:false, electrique:false, confine:false, levage:false, autre:false, autreText:"", na:false },
    risks: {
      energies: { electrique:false, mecanique:false, fluide:false, gravite:false, autre:false, autreText:"" },
      environnement: { hauteur:false, meteo:false, bruit:false, poussiere:false, thermique:false, chimique:false },
      operations: { trafic:false, levage:false, outillage:false, atex:false, confine:false, autres:false, autresText:"" },
    },
    measures: { septRegles:false, ventilation:false, terre:false, balisage:false, surveillant:false, planLevage:false, ancrage:false, outilsOk:false, autre:false, autreText:"" },
    top3: [ { risk:"", action:"", resp:"" }, { risk:"", action:"", resp:"" }, { risk:"", action:"", resp:"" } ],
    decision: "GO",
    noGo: { name:"", tel:"" },
    notes: "",
  });

  const [data, setData] = React.useState(loadLS(STATE_KEY, initialState()));
  const [step, setStep] = React.useState(0);
  const totalSteps = 6;
  const [errors, setErrors] = React.useState({});
  React.useEffect(()=>{ saveLS(STATE_KEY, data); }, [data]);

  const setField = (k,v)=>setData({...data,[k]:v});
  const resetAll = () => {
    setData({ ...initialState(), responsable: data.responsable, team: data.team });
    setStep(0);
  };

  const next = () => {
    if(step === 0){
      const name = data.teamInput.trim();
      if(name){
        if(data.team.includes(name)){
          setData({...data, teamInput:""});
        }else{
          setData({...data, team:[...data.team, name], teamInput:""});
        }
      }
      const missing = { site: !data.site.trim(), responsable: !data.responsable.trim() };
      setErrors(missing);
      if(missing.site || missing.responsable){
        alert(t('required_fields'));
        return;
      }
    }
    setStep(step+1);
  };

  const envoyer = async () => {
    const payload = {
      meta: { sentAt:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, formType:"lmra" },
      data
    };
    const ok = await sendNow(payload);
    if(ok){
      alert(t('alert_sent'));
      // Conserver Responsable & Équipe (prefs)
      saveLS(PREFS_KEY, { responsable: data.responsable, team: data.team });
      // Réinitialiser en conservant Site, Responsable & Équipe
      setData({ ...initialState(), site: data.site, responsable: data.responsable, team: data.team });
      setStep(0);
      setErrors({});
    }else{
      enqueueOutbox(payload);
      alert(t('alert_offline_queued'));
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="mb-3 px-4 py-2 rounded-xl bg-[#104861] text-[#D9D9D9] text-center">{t('lmra_title')}</h1>
      <div className="mb-3">
        <button onClick={resetAll} className="px-3 py-2 rounded-xl border">{t('reset_all')}</button>
        <div className="text-xs text-gray-500 mt-1">{t('reset_hint_team')}</div>
      </div>
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-black h-2 rounded-full" style={{width: `${((step+1)/totalSteps)*100}%`}}></div>
        </div>
        <div className="text-center text-xs mt-1">{step+1}/{totalSteps}</div>
      </div>

      {step===0 && (
        <Section title={t('general_info')}>
          <div className="flex flex-col gap-3">
            <label className="text-sm">{t('datetime')}
              <input type="datetime-local" value={data.datetime} onChange={(e)=>setField("datetime", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
            </label>
            <label className="text-sm">{t('job')}
              <select value={data.job} onChange={(e)=>setField("job", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border">
                <option value="" disabled>{t('job_ph')}</option>
                <option value="Elec">Elec</option>
                <option value="HVAC-Ref">HVAC-Ref</option>
              </select>
            </label>
            <label className="text-sm">{t('site')}
              <input
                value={data.site}
                onChange={(e)=>{ setField("site", e.target.value); if(errors.site) setErrors({...errors, site:false}); }}
                placeholder={t('site_ph')}
                className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.site? 'border-red-500':''}`}
              />
              {errors.site && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
            </label>
            <label className="text-sm">{t('task')}
              <input value={data.task} onChange={(e)=>setField("task", e.target.value)} placeholder={t('task_ph')} className="mt-1 w-full px-3 py-2 rounded-xl border" />
            </label>
            <label className="text-sm">{t('manager')}
              <input
                value={data.responsable}
                onChange={(e)=>{ setField("responsable", e.target.value); if(errors.responsable) setErrors({...errors, responsable:false}); }}
                placeholder={t('manager_ph')}
                className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.responsable? 'border-red-500':''}`}
              />
              {errors.responsable && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
            </label>

            {/* Équipe */}
            <div>
              <label className="text-sm block mb-2">{t('team')}</label>
              <div className="flex gap-2 mb-2">
                <input value={data.teamInput} onChange={(e)=>setData({...data, teamInput:e.target.value})} placeholder={t('team_member_ph')} className="flex-1 px-3 py-2 rounded-xl border" />
                <button
                  onClick={()=>{
                    const name=data.teamInput.trim();
                    if(!name) return;
                    if(data.team.includes(name)) return setData({...data, teamInput:""});
                    setData({...data, team:[...data.team, name], teamInput:""});
                  }}
                  className="px-3 py-2 rounded-xl border"
                >
                  {data.team.length === 0 ? t('team_validate') : t('team_add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {data.team.map((n)=>(
                  <span key={n} className="inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-gray-100">
                    {n}
                    <button onClick={()=>setData({...data, team: data.team.filter(x=>x!==n)})} className="w-5 h-5 inline-flex items-center justify-center rounded-full border border-gray-300">×</button>
                  </span>
                ))}
                {!data.team.length && <span className="text-sm text-gray-400">{t('team_empty')}</span>}
              </div>
            </div>
          </div>
        </Section>
      )}

      {step===1 && (
        <Section title={t('cond_title')}>
          <div className="flex flex-col gap-3">
            <Toggle checked={data.conditions.tacheClaires} onChange={(v)=>setData({...data, conditions:{...data.conditions, tacheClaires:v}})} label={t('cond_task_clear')} />
            <Toggle checked={data.conditions.coactivite}  onChange={(v)=>setData({...data, conditions:{...data.conditions, coactivite:v}})}   label={t('cond_coactivity')} />
            <Toggle checked={data.conditions.zonage}      onChange={(v)=>setData({...data, conditions:{...data.conditions, zonage:v}})}       label={t('cond_zone')} />
            <Toggle checked={data.conditions.epi}         onChange={(v)=>setData({...data, conditions:{...data.conditions, epi:v}})}          label={t('cond_epi')} />

            <hr className="my-3 border-gray-200" />

            <div>
              <div className="text-sm font-medium mb-2">{t('permits_title')}</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.feu} onChange={(e)=>setData({...data, permits:{...data.permits, feu:e.target.checked}})} />{t('permit_fire')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.electrique} onChange={(e)=>setData({...data, permits:{...data.permits, electrique:e.target.checked}})} />{t('permit_elec')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.confine} onChange={(e)=>setData({...data, permits:{...data.permits, confine:e.target.checked}})} />{t('permit_confined')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.levage} onChange={(e)=>setData({...data, permits:{...data.permits, levage:e.target.checked}})} />{t('permit_lift')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.autre} onChange={(e)=>setData({...data, permits:{...data.permits, autre:e.target.checked}})} />{t('permit_other')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.permits.na} onChange={(e)=>setData({...data, permits:{...data.permits, na:e.target.checked}})} />{t('permit_na')}</label>
              </div>
              {data.permits.autre && (
                <input value={data.permits.autreText} onChange={(e)=>setData({...data, permits:{...data.permits, autreText:e.target.value}})} placeholder={t('permit_other_ph')} className="mt-2 w-full px-3 py-2 rounded-xl border" />
              )}
            </div>
          </div>
        </Section>
      )}

      {step===2 && (
        <Section title={t('risks_title')}>
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-sm font-medium mb-2">{t('energies_title')}</div>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.risks.energies.electrique} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, electrique:e.target.checked}}})} />{t('energy_electric')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.risks.energies.mecanique} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, mecanique:e.target.checked}}})} />{t('energy_mechanical')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.risks.energies.fluide} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, fluide:e.target.checked}}})} />{t('energy_fluid')}</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.risks.energies.gravite} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, gravite:e.target.checked}}})} />{t('energy_gravity')}</label>
                <label className="flex items-center gap-2 text-sm col-span-2"><input type="checkbox" className="w-4 h-4 accent-black" checked={data.risks.energies.autre} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, autre:e.target.checked}}})} />{t('other')}</label>
              </div>
              {data.risks.energies.autre && (
                <input value={data.risks.energies.autreText} onChange={(e)=>setData({...data, risks:{...data.risks, energies:{...data.risks.energies, autreText:e.target.value}}})} placeholder={t('other_specify')} className="mt-2 w-full px-3 py-2 rounded-xl border" />
              )}
            </div>

            <hr className="my-3 border-gray-200" />

            <div>
              <div className="text-sm font-medium mb-2">{t('env_title')}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['hauteur','env_height'],['meteo','env_weather'],['bruit','env_noise'],
                  ['poussiere','env_dust'],['thermique','env_thermal'],['chimique','env_chemical']
                ].map(([k,label])=>(
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-black"
                      checked={data.risks.environnement[k]}
                      onChange={(e)=>setData({...data, risks:{...data.risks, environnement:{...data.risks.environnement, [k]:e.target.checked}}})} />
                    {t(label)}
                  </label>
                ))}
              </div>
            </div>

            <hr className="my-3 border-gray-200" />

            <div>
              <div className="text-sm font-medium mb-2">{t('ops_title')}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['trafic','ops_traffic'],['levage','ops_lift'],['outillage','ops_tools'],
                  ['atex','ops_atex'],['confine','ops_confined']
                ].map(([k,label])=>(
                  <label key={k} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="w-4 h-4 accent-black"
                      checked={data.risks.operations[k]}
                      onChange={(e)=>setData({...data, risks:{...data.risks, operations:{...data.risks.operations, [k]:e.target.checked}}})} />
                    {t(label)}
                  </label>
                ))}
                <label className="flex items-center gap-2 text-sm col-span-2">
                  <input type="checkbox" className="w-4 h-4 accent-black"
                    checked={data.risks.operations.autres}
                    onChange={(e)=>setData({...data, risks:{...data.risks, operations:{...data.risks.operations, autres:e.target.checked}}})} />
                  {t('ops_others')}
                </label>
              </div>
              {data.risks.operations.autres && (
                <input value={data.risks.operations.autresText} onChange={(e)=>setData({...data, risks:{...data.risks, operations:{...data.risks.operations, autresText:e.target.value}}})} placeholder={t('ops_others_ph')} className="mt-2 w-full px-3 py-2 rounded-xl border" />
              )}
            </div>
          </div>
        </Section>
      )}

      {step===3 && (
        <Section title={t('measures_title')}>
          <div className="grid grid-cols-2 gap-2">
            {[
              ['septRegles','measures_seven'],['ventilation','measures_ventilation'],
              ['terre','measures_earth'],['balisage','measures_balisage'],
              ['surveillant','measures_watch'],['planLevage','measures_liftplan'],
              ['ancrage','measures_anchor'],['outilsOk','measures_toolsok']
            ].map(([k,label])=>(
              <label key={k} className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="w-4 h-4 accent-black"
                  checked={data.measures[k]}
                  onChange={(e)=>setData({...data, measures:{...data.measures, [k]:e.target.checked}})} />
                {t(label)}
              </label>
            ))}
            <label className="flex items-center gap-2 text-sm col-span-2">
              <input type="checkbox" className="w-4 h-4 accent-black"
                checked={data.measures.autre}
                onChange={(e)=>setData({...data, measures:{...data.measures, autre:e.target.checked}})} />
              {t('other')}
            </label>
            {data.measures.autre && (
              <input value={data.measures.autreText} onChange={(e)=>setData({...data, measures:{...data.measures, autreText:e.target.value}})} placeholder={t('other_specify')} className="mt-2 w-full px-3 py-2 rounded-xl border col-span-2" />
            )}
          </div>
        </Section>
      )}

      {step===4 && (
        <Section title={t('top3_title')}>
          <div className="flex flex-col gap-2">
            {data.top3.map((it,i)=>(
              <div key={i} className="grid grid-cols-1 gap-2">
                <div className="text-sm font-medium">#{i+1}</div>
                <input value={it.risk} onChange={(e)=>{ const top3=[...data.top3]; top3[i]={...top3[i], risk:e.target.value}; setField("top3", top3); }} placeholder={t('risk_ph')} className="px-3 py-2 rounded-xl border" />
                <input value={it.action} onChange={(e)=>{ const top3=[...data.top3]; top3[i]={...top3[i], action:e.target.value}; setField("top3", top3); }} placeholder={t('action_ph')} className="px-3 py-2 rounded-xl border" />
                <input value={it.resp} onChange={(e)=>{ const top3=[...data.top3]; top3[i]={...top3[i], resp:e.target.value}; setField("top3", top3); }} placeholder={t('resp_ph')} className="px-3 py-2 rounded-xl border" />
                <hr className="my-2 border-gray-200" />
              </div>
            ))}
          </div>
        </Section>
      )}

      {step===5 && (
        <Section title={t('decision_title')}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <button onClick={()=>setField("decision","GO")} className={"px-4 py-2 rounded-xl border "+(data.decision==="GO"?"bg-green-50 border-green-300":"")}>{t('go')}</button>
              <button onClick={()=>setField("decision","NO-GO")} className={"px-4 py-2 rounded-xl border "+(data.decision==="NO-GO"?"bg-red-50 border-red-300":"")}>{t('no_go')}</button>
            </div>
            {data.decision==="NO-GO" && (
              <div className="grid grid-cols-1 gap-2">
                <input value={data.noGo.name} onChange={(e)=>setField("noGo",{...data.noGo, name:e.target.value})} placeholder={t('nogo_name_ph')} className="px-3 py-2 rounded-xl border" />
                <input value={data.noGo.tel}  onChange={(e)=>setField("noGo",{...data.noGo, tel:e.target.value})}  placeholder={t('nogo_tel_ph')}  className="px-3 py-2 rounded-xl border" />
              </div>
            )}
            <label className="text-sm">{t('manager')}
              <input value={data.responsable} onChange={(e)=>setField("responsable", e.target.value)} placeholder={t('manager_ph')} className="mt-1 w-full px-3 py-2 rounded-xl border" />
            </label>
            <label className="text-sm">{t('notes')}
              <textarea value={data.notes} onChange={(e)=>setField("notes", e.target.value)} rows={2} placeholder={t('notes_ph')} className="mt-1 w-full px-3 py-2 rounded-xl border" />
            </label>
          </div>
        </Section>
      )}

      <div className={"flex mt-4 " + (step>0 ? "justify-between" : "justify-end")}>
        {step>0 && (
          <button onClick={()=>setStep(step-1)} className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-200 text-gray-800 hover:bg-gray-300">{t('prev')}</button>
        )}
        {step<totalSteps-1 ? (
          <button onClick={next} className="px-3 py-2 rounded-xl border border-blue-600 bg-blue-600 text-white hover:bg-blue-700">{t('next')}</button>
        ) : (
          <button onClick={envoyer} className="px-4 py-3 rounded-xl border bg-black text-white">{t('send')}</button>
        )}
      </div>
    </main>
  );
}

/* ======================= PREMIERS SOINS ======================= */
function FirstAidScreen(){
  const { t } = useI18n();

  const STATE_KEY = "qhse_firstaid_state_v1";
  const prefs = loadLS(PREFS_KEY, { responsable:"", team:[] });

  const initialState = () => ({
    datetime: nowLocalDateTime(),
    chantier: "",
    responsable: prefs.responsable || "",
    personne: "",
    actions: { coupant:false, disquant:false, soudant:false, percant:false, tirant:false, soulevant:false, autre:false, autreText:"" },
    blessures: { coupure:false, egratignure:false, contusion:false, projection:false, brulure:false, autre:false, autreText:"" },
    localisation: { main:false, bras:false, torse:false, jambe:false, pied:false, tete:false, oeil:false, autre:false, autreText:"" },
    recharge: false,
    trousseNumero: "",
    remarques: ""
  });

  const [data, setData] = React.useState(loadLS(STATE_KEY, initialState()));
  React.useEffect(()=>{ saveLS(STATE_KEY, data); }, [data]);
  const [errors, setErrors] = React.useState({});

  const setField = (k,v)=>setData({...data,[k]:v});
  const resetAll = () => setData(initialState());

  const envoyer = async () => {
    const missing = { chantier: !data.chantier.trim(), responsable: !data.responsable.trim() };
    setErrors(missing);
    if(missing.chantier || missing.responsable){
      alert(t('required_fields'));
      return;
    }
    const payload = {
      meta: { sentAt:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, formType:"firstaid" },
      data
    };
    const ok = await sendNow(payload);
    if(ok){
      alert(t('alert_sent'));
      saveLS(PREFS_KEY, { ...loadLS(PREFS_KEY, {responsable:"", team:[]}), responsable:data.responsable });
      setData(initialState());
      setErrors({});
    }else{
      enqueueOutbox(payload);
      alert(t('alert_offline_queued'));
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="mb-3 px-4 py-2 rounded-xl bg-[#104861] text-[#D9D9D9] text-center">{t('fa_title')}</h1>
      <div className="mb-3">
        <button onClick={resetAll} className="px-3 py-2 rounded-xl border">{t('reset_all')}</button>
      </div>

      <Section title={t('fa_info')}>
        <div className="flex flex-col gap-3">
          <label className="text-sm">{t('datetime')}
            <input type="datetime-local" value={data.datetime} onChange={(e)=>setField("datetime", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
          </label>
          <label className="text-sm">{t('site')}
            <input name="chantier" value={data.chantier} onChange={(e)=>{ const v=e.target.value; setData({...data, chantier:v, responsable:""}); if(errors.chantier) setErrors({...errors, chantier:false}); }} className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.chantier? 'border-red-500':''}`} />
            {errors.chantier && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
          </label>
          <label className="text-sm">{t('manager')}
            <input list="responsables-fa" name="responsable" value={data.responsable} onChange={(e)=>{ setField("responsable", e.target.value); if(errors.responsable) setErrors({...errors, responsable:false}); }} placeholder={t('manager_ph')} className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.responsable? 'border-red-500':''}`} required />
            <datalist id="responsables-fa">
              {(RESPONSABLES_PAR_CHANTIER[data.site || data.chantier] || []).map(n => <option key={n} value={n} />)}
            </datalist>
            {errors.responsable && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
          </label>
          <label className="text-sm">{t('person')}
            <input value={data.personne} onChange={(e)=>setField("personne", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
          </label>
        </div>
      </Section>

      <Section title={t('action_title')} tone="amber">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['coupant','a_cut'],['disquant','a_grind'],['soudant','a_weld'],
            ['percant','a_drill'],['tirant','a_pushpull'],['soulevant','a_lift']
          ].map(([k,label])=>(
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 accent-black"
                checked={data.actions[k]}
                onChange={(e)=>setField("actions", {...data.actions, [k]:e.target.checked})} />
              {t(label)}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" className="w-4 h-4 accent-black"
              checked={data.actions.autre}
              onChange={(e)=>setField("actions", {...data.actions, autre:e.target.checked})} />
            {t('other')}
          </label>
          {data.actions.autre && (
            <input value={data.actions.autreText} onChange={(e)=>setField("actions", {...data.actions, autreText:e.target.value})} placeholder={t('other_specify')} className="mt-2 w-full px-3 py-2 rounded-xl border col-span-2" />
          )}
        </div>
      </Section>

      <Section title={t('injury_title')} tone="red">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['coupure','i_cut'],['egratignure','i_scratch'],['contusion','i_bruise'],
            ['projection','i_proj'],['brulure','i_burn']
          ].map(([k,label])=>(
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 accent-black"
                checked={data.blessures[k]}
                onChange={(e)=>setField("blessures", {...data.blessures, [k]:e.target.checked})} />
              {t(label)}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" className="w-4 h-4 accent-black"
              checked={data.blessures.autre}
              onChange={(e)=>setField("blessures", {...data.blessures, autre:e.target.checked})} />
            {t('other')}
          </label>
          {data.blessures.autre && (
            <input value={data.blessures.autreText} onChange={(e)=>setField("blessures", {...data.blessures, autreText:e.target.value})} placeholder={t('other_specify')} className="mt-2 w-full px-3 py-2 rounded-xl border col-span-2" />
          )}
        </div>
      </Section>

      <Section title={t('location_title')} tone="blue">
        <div className="grid grid-cols-2 gap-2">
          {[
            ['main','loc_hand'],['bras','loc_arm'],['torse','loc_torso'],
            ['jambe','loc_leg'],['pied','loc_foot'],['tete','loc_head'],['oeil','loc_eye']
          ].map(([k,label])=>(
            <label key={k} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="w-4 h-4 accent-black"
                checked={data.localisation[k]}
                onChange={(e)=>setField("localisation", {...data.localisation, [k]:e.target.checked})} />
              {t(label)}
            </label>
          ))}
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input type="checkbox" className="w-4 h-4 accent-black"
              checked={data.localisation.autre}
              onChange={(e)=>setField("localisation", {...data.localisation, autre:e.target.checked})} />
            {t('other')}
          </label>
          {data.localisation.autre && (
            <input value={data.localisation.autreText} onChange={(e)=>setField("localisation", {...data.localisation, autreText:e.target.value})} placeholder={t('other_specify')} className="mt-2 w-full px-3 py-2 rounded-xl border col-span-2" />
          )}
        </div>
      </Section>

      <Section title={t('kit_title')} tone="green">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-sm">{t('kit_need')}</span>
            <label className="text-sm inline-flex items-center gap-1">
              <input type="radio" name="recharge" checked={!data.recharge} onChange={()=>setField("recharge", false)} /> {t('no')}
            </label>
            <label className="text-sm inline-flex items-center gap-1">
              <input type="radio" name="recharge" checked={data.recharge} onChange={()=>setField("recharge", true)} /> {t('yes')}
            </label>
          </div>
          {data.recharge && (
            <label className="text-sm">{t('kit_number')}
              <input value={data.trousseNumero} onChange={(e)=>setField("trousseNumero", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
            </label>
          )}
        </div>
      </Section>

      <Section title={t('remarks')}>
        <textarea value={data.remarques} onChange={(e)=>setField("remarques", e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border" />
      </Section>

      <div className="grid grid-cols-1 gap-2 mt-4">
        <button onClick={envoyer} className="px-4 py-3 rounded-xl border bg-black text-white">{t('send')}</button>
      </div>
    </main>
  );
}

/* ======================= STOP ======================= */
function StopScreen(){
  const { t } = useI18n();

  const STATE_KEY = "qhse_stop_state_v1";
  const prefs = loadLS(PREFS_KEY, { responsable:"", team:[] });

  const initialState = () => ({
    datetime: nowLocalDateTime(),
    chantier: "",
    responsable: prefs.responsable || "",
    situation: "",
    callNom: "",
    callFonction: "chef", // chef/site/pm/opm/cp/coord/client
    solution: "",
    noGo: ""
  });

  const [data, setData] = React.useState(loadLS(STATE_KEY, initialState()));
  React.useEffect(()=>{ saveLS(STATE_KEY, data); }, [data]);
  const [errors, setErrors] = React.useState({});

  // ✅ photo
  const [photoDataUrl, setPhotoDataUrl] = React.useState(""); // base64 data URL
  const [photoStatus, setPhotoStatus] = React.useState("");

  const setField = (k,v)=>setData({...data,[k]:v});

  const resetAll = () => {
    setData(initialState());
    setPhotoDataUrl("");
    setPhotoStatus("");
  };

  const onPickPhoto = async (file) => {
    if(!file){
      setPhotoDataUrl("");
      setPhotoStatus("");
      return;
    }
    try{
      setPhotoStatus(t('photo_status_processing'));
      const dataUrl = await fileToCompressedDataUrl_(file, 1280, 0.72);
      const kb = approxSizeKbFromDataUrl_(dataUrl);
      setPhotoDataUrl(dataUrl);
      setPhotoStatus(`${t('photo_status_ready')} (~${kb} KB)`);
    }catch(e){
      console.error(e);
      setPhotoDataUrl("");
      setPhotoStatus(t('photo_status_error'));
    }
  };

  const envoyer = async () => {
    const missing = { chantier: !data.chantier.trim(), responsable: !data.responsable.trim() };
    setErrors(missing);
    if(missing.chantier || missing.responsable){
      alert(t('required_fields'));
      return;
    }
    const payload = {
      type: "stop",
      meta: { sentAt:new Date().toISOString(), page:location.href, userAgent:navigator.userAgent, formType:"stop" },
      data: { ...data, photoDataUrl: photoDataUrl || "" } // ✅ include photo
    };
    const ok = await sendNow(payload);
    if(ok){
      alert(t('alert_sent'));
      saveLS(PREFS_KEY, { ...loadLS(PREFS_KEY, {responsable:"", team:[]}), responsable:data.responsable });
      setData(initialState());
      setErrors({});
      setPhotoDataUrl("");
      setPhotoStatus("");
    }else{
      enqueueOutbox(payload);
      alert(t('alert_offline_queued'));
    }
  };

  return (
    <main className="max-w-md mx-auto p-4">
      <h1 className="mb-3 px-4 py-2 rounded-xl bg-[#104861] text-[#D9D9D9] text-center">{t('stop_title')}</h1>
      <div className="mb-3">
        <button onClick={resetAll} className="px-3 py-2 rounded-xl border">{t('reset_all')}</button>
      </div>

      <Section title={t('coords')}>
        <div className="flex flex-col gap-3">
          <label className="text-sm">{t('datetime')}
            <input type="datetime-local" value={data.datetime} onChange={(e)=>setField("datetime", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
          </label>
          <label className="text-sm">{t('site')}
            <input name="chantier" value={data.chantier} onChange={(e)=>{ const v=e.target.value; setData({...data, chantier:v, responsable:""}); if(errors.chantier) setErrors({...errors, chantier:false}); }} className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.chantier? 'border-red-500':''}`} />
            {errors.chantier && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
          </label>
          <label className="text-sm">{t('manager')}
            <input list="responsables-stop" name="responsable" value={data.responsable} onChange={(e)=>{ setField("responsable", e.target.value); if(errors.responsable) setErrors({...errors, responsable:false}); }} placeholder={t('manager_ph')} className={`mt-1 w-full px-3 py-2 rounded-xl border ${errors.responsable? 'border-red-500':''}`} required />
            <datalist id="responsables-stop">
              {(RESPONSABLES_PAR_CHANTIER[data.site || data.chantier] || []).map(n => <option key={n} value={n} />)}
            </datalist>
            {errors.responsable && <div className="text-red-600 text-xs mt-1">{t('required_field')}</div>}
          </label>
        </div>
      </Section>

      <Section title={t('stop_box')} tone="red">
        <textarea value={data.situation} onChange={(e)=>setField("situation", e.target.value)} rows={3} placeholder={t('stop_desc')} className="w-full px-3 py-2 rounded-xl border" />
      </Section>

      <Section title={t('call_box')} tone="amber">
        <div className="grid grid-cols-1 gap-3">
          <label className="text-sm">{t('call_name')}
            <input value={data.callNom} onChange={(e)=>setField("callNom", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border" />
          </label>
          <label className="text-sm">{t('call_role')}
            <select value={data.callFonction} onChange={(e)=>setField("callFonction", e.target.value)} className="mt-1 w-full px-3 py-2 rounded-xl border">
              <option value="chef">{t('role_chef')}</option>
              <option value="site">{t('role_site')}</option>
              <option value="pm">{t('role_pm')}</option>
              <option value="opm">{t('role_opm')}</option>
              <option value="cp">{t('role_cp')}</option>
              <option value="coord">{t('role_coord')}</option>
              <option value="client">{t('role_client')}</option>
            </select>
          </label>
        </div>
      </Section>

      {/* ✅ PHOTO */}
      <Section title={t('photo_box')} tone="blue">
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-500">{t('photo_optional')}</div>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="block w-full text-sm"
            onChange={(e)=> onPickPhoto(e.target.files && e.target.files[0])}
          />

          {!!photoStatus && <div className="text-xs text-gray-500">{photoStatus}</div>}

          {!!photoDataUrl && (
            <>
              <img
                src={photoDataUrl}
                alt="preview"
                className="w-full rounded-xl border object-cover"
              />
              <button
                type="button"
                className="text-sm text-red-600 underline self-start"
                onClick={()=>{ setPhotoDataUrl(""); setPhotoStatus(""); }}
              >
                {t('photo_remove')}
              </button>
            </>
          )}
        </div>
      </Section>

      <Section title={t('act_box')} tone="green">
        <label className="text-sm">{t('solution')}
          <textarea value={data.solution} onChange={(e)=>setField("solution", e.target.value)} rows={3} className="mt-1 w-full px-3 py-2 rounded-xl border" />
        </label>
      </Section>

      <Section tone="dark" title={<><span className="text-red-600">{t('no_go')}</span> — {(t('nogo_wait').split('—')[1] || t('nogo_wait')).trim()}</>}>
        <textarea value={data.noGo} onChange={(e)=>setField('noGo', e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border" />
      </Section>

      <div className="grid grid-cols-1 gap-2 mt-4">
        <button onClick={envoyer} className="px-4 py-3 rounded-xl border bg-black text-white">{t('send')}</button>
      </div>
    </main>
  );
}

// Logo seul (pas de texte redondant)
function Brand(){
  return (
    <a href="#home" className="flex items-center gap-2" aria-label="QHSE">
      <img src="qhse-logo.svg" alt="" className="w-8 h-8 rounded-lg border"
        onError={(e)=>{ e.currentTarget.replaceWith(Object.assign(document.createElement('span'),{className:'inline-flex items-center justify-center w-8 h-8 rounded-lg border font-bold', innerText:'QHSE'})); }} />
    </a>
  );
}

// === LangPicker (images SVG locales) ===
function LangPicker(){
  const { lang, setLang } = useI18n();

  const Btn = ({code, src, alt}) => (
    <button
      onClick={()=>setLang(code)}
      className={
        "w-9 h-9 flex items-center justify-center rounded-lg border " +
        (lang===code ? "bg-black" : "bg-white")
      }
      aria-label={code.toUpperCase()}
      title={code.toUpperCase()}
    >
      <img src={src} alt={alt} className="w-6 h-4 rounded-sm pointer-events-none select-none" />
    </button>
  );

  return (
    <div className="flex items-center gap-1.5">
      <Btn code="fr" src="flag-fr.svg" alt="FR" />
      <Btn code="en" src="flag-gb.svg" alt="EN" />
      <Btn code="nl" src="flag-nl.svg" alt="NL" />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center text-red-600">
          Une erreur inattendue est survenue. Merci de recharger la page.
        </div>
      );
    }
    return this.props.children;
  }
}

function App(){
  const { t } = useI18n();
  const [route,setRoute] = React.useState(parseRoute());
  React.useEffect(()=>{
    const onHash=()=>setRoute(parseRoute());
    globalThis.addEventListener('hashchange', onHash);
    return ()=>globalThis.removeEventListener('hashchange', onHash);
  },[]);
  return (
    <div>
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Brand />
          <div className="flex items-center gap-3">
            <LangPicker />
            <button onClick={()=>globalThis.print()} className="px-3 py-1.5 rounded-xl border">{t('print')}</button>
          </div>
        </div>
      </header>

      {route==='home' && <HomeScreen/>}
      {route==='lmra' && <LmraScreen/>}
      {route==='firstaid' && <FirstAidScreen/>}
      {route==='stop' && <StopScreen/>}

      <footer className="max-w-md mx-auto px-4 pb-8 text-center text-xs text-gray-400">
        QHSE PWA • Données locales + collecte centrale
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <I18nProvider>
    <ErrorBoundary>
      <App/>
    </ErrorBoundary>
  </I18nProvider>
);
