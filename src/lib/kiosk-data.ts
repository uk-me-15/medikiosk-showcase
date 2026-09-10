/**
 * Scripted clinical data powering the MediKiosk demo.
 * In production these branches come from the clinical ontology service;
 * the demo ships a representative subset so every screen stays truthful.
 */

import type {
  AyushFinding,
  ExtractedLab,
  ExtractedMedication,
  TimelineDoc,
} from "@/lib/kiosk-store";
import type { VoiceLocale } from "@/lib/speech";

/* ------------------------------------------------------------------ */
/* Languages                                                           */
/* ------------------------------------------------------------------ */

export interface KioskLanguage {
  locale: VoiceLocale;
  label: string;
  english: string;
  nativeScript: string; // "Hello" greeting shown as a pronunciation hint
}

export const KIOSK_LANGUAGES: KioskLanguage[] = [
  { locale: "hi-IN", label: "हिन्दी", english: "Hindi", nativeScript: "नमस्ते" },
  { locale: "en-IN", label: "English", english: "English", nativeScript: "Hello" },
  { locale: "ta-IN", label: "தமிழ்", english: "Tamil", nativeScript: "வணக்கம்" },
  { locale: "bn-IN", label: "বাংলা", english: "Bengali", nativeScript: "নমস্কার" },
  { locale: "mr-IN", label: "मराठी", english: "Marathi", nativeScript: "नमस्कार" },
  { locale: "te-IN", label: "తెలుగు", english: "Telugu", nativeScript: "నమస్కారం" },
  { locale: "gu-IN", label: "ગુજરાતી", english: "Gujarati", nativeScript: "કેમ છો" },
  { locale: "kn-IN", label: "ಕನ್ನಡ", english: "Kannada", nativeScript: "ನಮಸ್ಕಾರ" },
];

/* ------------------------------------------------------------------ */
/* Chief complaints + SOCRATES branches                                */
/* ------------------------------------------------------------------ */

export interface ComplaintOption {
  id: string;
  label: string;
  hindi: string;
  icon: string;
  narration: string;
  duration: string;
  severity: number;
  socrates: {
    onset: string;
    character: string;
    radiation: string;
    associated: string;
    timing: string;
    exacerbating: string;
  };
}

export const COMPLAINTS: ComplaintOption[] = [
  {
    id: "chest-pain",
    label: "Chest Pain",
    hindi: "सीने में दर्द",
    icon: "heart-pulse",
    narration:
      "Burning tightness in the centre of the chest for two days, worse after walking to the bus stop, eases with rest. Some sweating and left arm heaviness.",
    duration: "2 days",
    severity: 7,
    socrates: {
      onset: "Gradual, began 2 days ago after carrying load",
      character: "Burning, band-like tightness across mid-sternum",
      radiation: "Left shoulder and medial left forearm",
      associated: "Diaphoresis, mild dyspnoea on exertion",
      timing: "Worse on exertion, relieved by 5–10 min rest",
      exacerbating: "Climbing stairs, heavy meals, emotional stress",
    },
  },
  {
    id: "digestive",
    label: "Digestive Distress",
    hindi: "पेट संबंधी परेशानी",
    icon: "salad",
    narration:
      "Burning pain in the upper abdomen most evenings for two weeks, with bloating after meals and irregular motions.",
    duration: "2 weeks",
    severity: 4,
    socrates: {
      onset: "Insidious over 2 weeks, post-dinner worsening",
      character: "Gnawing epigastric burning with bloating",
      radiation: "None — pain stays in the upper abdomen",
      associated: "Eructations, early satiety, irregular stools",
      timing: "Evenings, 1–2 hours after meals",
      exacerbating: "Spicy food, skipping breakfast, tea on empty stomach",
    },
  },
  {
    id: "fever-cough",
    label: "Fever & Cough",
    hindi: "बुखार और खांसी",
    icon: "thermometer",
    narration:
      "Fever for three days reaching 101 in the evenings, with dry cough, body ache and weakness. No breathlessness at rest.",
    duration: "3 days",
    severity: 5,
    socrates: {
      onset: "Abrupt, 3 days ago",
      character: "Intermittent fever with chills, dry hacking cough",
      radiation: "Not applicable",
      associated: "Myalgia, sore throat, marked fatigue",
      timing: "Evening spikes up to 101°F, subsides with paracetamol",
      exacerbating: "Evenings, cold exposure",
    },
  },
  {
    id: "joint-pain",
    label: "Joint Pain",
    hindi: "जोड़ों का दर्द",
    icon: "bone",
    narration:
      "Both knees ache for four months, worse in winter and after standing long hours at work. Mild morning stiffness.",
    duration: "4 months",
    severity: 5,
    socrates: {
      onset: "Gradual over 4 months, no injury",
      character: "Dull aching, deep in both knees",
      radiation: "Occasionally to the inner thigh",
      associated: "Morning stiffness ~20 minutes, crepitus on stairs",
      timing: "Worse at day's end and in cold weather",
      exacerbating: "Prolonged standing, squatting, cold mornings",
    },
  },
];

export const AYUSH_COMPLAINTS: ComplaintOption[] = [
  {
    ...COMPLAINTS[1],
    narration:
      "Burning in the upper stomach after food, sour belching, irregular meals and late-night work. Tongue coating noticed in the morning.",
  },
  {
    ...COMPLAINTS[3],
    narration:
      "Both knee aches for months, worse in cold and damp weather, relieved by warmth and oil massage.",
  },
];

/* ------------------------------------------------------------------ */
/* AYUSH assessment (Dashavidha / Ashtavidha Pariksha subset)          */
/* ------------------------------------------------------------------ */

export interface AyushOption {
  key: string;
  label: string;
  hindi: string;
  options: string[];
  answerIndex: number;
}

export const AYUSH_STEPS: AyushOption[] = [
  {
    key: "prakriti",
    label: "Prakriti (Constitution)",
    hindi: "प्रकृति",
    options: ["Vata–Pitta", "Pitta–Kapha", "Kapha dominant", "Vata dominant"],
    answerIndex: 1,
  },
  {
    key: "vikriti",
    label: "Vikriti (Current imbalance)",
    hindi: "विकृति",
    options: ["Pitta vriddhi", "Kapha vriddhi", "Vata vriddhi", "Tridosha"],
    answerIndex: 0,
  },
  {
    key: "agni",
    label: "Agni (Digestive fire)",
    hindi: "अग्नि",
    options: ["Manda (dull)", "Tikshna (sharp)", "Sama (balanced)", "Vishama (irregular)"],
    answerIndex: 1,
  },
  {
    key: "ahara",
    label: "Ahara (Diet)",
    hindi: "आहार",
    options: [
      "2 meals, spicy & late",
      "3 meals, regular",
      "Frequent snacking",
      "Mostly fasting",
    ],
    answerIndex: 0,
  },
  {
    key: "vihara",
    label: "Vihara (Lifestyle)",
    hindi: "विहार",
    options: ["Sedentary, late nights", "Active, regular", "Mixed routine", "Heavy labour"],
    answerIndex: 0,
  },
  {
    key: "mala",
    label: "Mala (Elimination)",
    hindi: "मल",
    options: ["Irregular, acidic", "Regular", "Constipated", "Loose"],
    answerIndex: 0,
  },
  {
    key: "nadi",
    label: "Nadi (Pulse)",
    hindi: "नाड़ी",
    options: ["Pitta nadi", "Kapha nadi", "Vata nadi", "Mixed"],
    answerIndex: 0,
  },
  {
    key: "jihva",
    label: "Jihva (Tongue)",
    hindi: "जिह्वा",
    options: ["Yellowish coating", "White coating", "Clean", "Dry fissured"],
    answerIndex: 0,
  },
];

/* ------------------------------------------------------------------ */
/* Vitals                                                              */
/* ------------------------------------------------------------------ */

export const VITALS: { label: string; value: string; flag?: "high" | "low" }[] = [
  { label: "BP", value: "148 / 92 mmHg", flag: "high" },
  { label: "Pulse", value: "94 /min" },
  { label: "SpO₂", value: "97 %" },
  { label: "Temp", value: "98.6 °F" },
  { label: "Weight", value: "78 kg" },
  { label: "BMI", value: "28.9", flag: "high" },
];

/* ------------------------------------------------------------------ */
/* Patient identity (masked ABHA)                                      */
/* ------------------------------------------------------------------ */

export const DEMO_PATIENT = {
  name: "Sunita Devi",
  age: 46,
  sex: "Female" as const,
  abha: "ABHA •••• •••• 4821",
  token: "OPD Token #B-14",
};

/* ------------------------------------------------------------------ */
/* Red-flag triggers                                                   */
/* ------------------------------------------------------------------ */

export interface RedFlagCase {
  id: string;
  label: string;
  hindi: string;
  trigger: string;
  protocol: string[];
  destination: string;
}

export const RED_FLAG_CASES: RedFlagCase[] = [
  {
    id: "acs",
    label: "Crushing chest pain + sweating",
    hindi: "सीने में भारी दर्द + पसीना",
    trigger:
      "Patient reports sudden severe chest heaviness with cold sweats and breathlessness at rest.",
    protocol: [
      "Kiosk session paused — emergency triage card printed",
      "Nurse station alerted over PA + duty doctor paged",
      "ECG + aspirin protocol initiated at triage bay 1",
      "ABDM encounter flagged EMERGENCY for HIS escalation",
    ],
    destination: "Triage Bay 1 → Emergency Medicine",
  },
  {
    id: "dyspnea",
    label: "Severe breathlessness at rest",
    hindi: "सांस लेने में तीव्र तकलीफ",
    trigger:
      "Patient cannot complete a sentence and reports breathlessness while sitting still.",
    protocol: [
      "SpO₂ spot-check ordered before consultation",
      "Oxygen saturation < 92% → immediate red triage",
      "Pulmonary / cardiac rule-out pathway activated",
      "ABDM encounter flagged EMERGENCY for HIS escalation",
    ],
    destination: "Red Zone → Triage Bay 2",
  },
];

/* ------------------------------------------------------------------ */
/* OCR document corpus                                                 */
/* ------------------------------------------------------------------ */

export const SAMPLE_DOCS: TimelineDoc[] = [
  {
    id: "doc-rx-2025",
    title: "Handwritten Prescription — Civil Hospital",
    kind: "Prescription",
    date: "12 Jan 2025",
    source: "Civil Hospital, Varanasi",
    ocrConfidence: 0.94,
    meds: [
      { drug: "Tab. Amlodipine", dose: "5 mg", frequency: "OD, morning", since: "Jan 2025" },
      { drug: "Tab. Metformin", dose: "500 mg", frequency: "BD, after meals", since: "Jan 2025" },
      { drug: "Cap. Pantoprazole", dose: "40 mg", frequency: "OD, before breakfast", since: "Jan 2025" },
    ],
    labs: [],
  },
  {
    id: "doc-lab-2025",
    title: "Laboratory Report — District Lab",
    kind: "Lab Report",
    date: "08 Feb 2025",
    source: "District Pathology Lab",
    ocrConfidence: 0.97,
    meds: [],
    labs: [
      { analyte: "HbA1c", value: "8.4 %", range: "4.0 – 5.6", status: "high" },
      { analyte: "Fasting glucose", value: "168 mg/dL", range: "70 – 100", status: "high" },
      { analyte: "Serum creatinine", value: "1.1 mg/dL", range: "0.6 – 1.2", status: "normal" },
      { analyte: "Hemoglobin", value: "10.2 g/dL", range: "12.0 – 15.5", status: "low" },
      { analyte: "TSH", value: "2.4 µIU/mL", range: "0.4 – 4.0", status: "normal" },
    ],
  },
  {
    id: "doc-dc-2024",
    title: "Discharge Summary — Medical Ward",
    kind: "Discharge Summary",
    date: "19 Aug 2024",
    source: "District Hospital",
    ocrConfidence: 0.91,
    meds: [
      { drug: "Inj. Insulin (Basal)", dose: "10 units", frequency: "HS", since: "Aug 2024" },
    ],
    labs: [],
  },
];

export const ALLERGIES = ["Sulfa drugs — urticaria (2019)"];

export const CHRONIC_HISTORY = [
  "Type 2 Diabetes Mellitus — since 2018",
  "Hypertension — since 2021",
  "Chronic gastritis — 2024 discharge",
];

/* ------------------------------------------------------------------ */
/* Doctor queue                                                        */
/* ------------------------------------------------------------------ */

export interface QueueEntry {
  token: string;
  name: string;
  age: number;
  sex: string;
  complaint: string;
  wait: string;
  state: "ready" | "in-consult" | "waiting" | "flagged";
  isSession?: boolean;
}

export const DOCTOR_QUEUE: QueueEntry[] = [
  { token: "B-11", name: "Ram Prasad", age: 62, sex: "M", complaint: "Knee pain", wait: "done", state: "in-consult" },
  { token: "B-12", name: "Meena Kumari", age: 34, sex: "F", complaint: "Fever, body ache", wait: "12 min", state: "ready" },
  { token: "B-13", name: "Anil Yadav", age: 51, sex: "M", complaint: "Back pain", wait: "18 min", state: "waiting" },
];

/* ------------------------------------------------------------------ */
/* Consent narration (DPDP Act 2023 / ABDM)                            */
/* ------------------------------------------------------------------ */

export const CONSENT_POINTS: { title: string; body: string }[] = [
  {
    title: "Purpose limitation",
    body: "Your history is shared only with the doctor treating you today — no marketing, no research use without separate consent.",
  },
  {
    title: "Data minimisation",
    body: "Only what the consultation needs is shared: complaint, history, medicines, reports. Your ABHA number stays masked on screen.",
  },
  {
    title: "Zero-retention session",
    body: "The kiosk holds your answers only until the doctor opens your file. Then everything is wiped from the kiosk — nothing stays on the machine.",
  },
  {
    title: "Your rights under DPDP Act 2023",
    body: "You may withdraw consent, ask for correction, or ask who saw your data. Consent artefacts are stored with the ABDM consent manager.",
  },
];
