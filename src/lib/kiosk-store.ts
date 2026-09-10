import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import type { VoiceLocale } from "@/lib/speech";

/* ------------------------------------------------------------------ */
/* Session types shared by the kiosk simulator and the OPD console     */
/* ------------------------------------------------------------------ */

export type CareMode = "allopathy" | "ayush";

export interface SocratesFinding {
  key: string; // SOCRATES dimension
  label: string;
  value: string;
}

export interface AyushFinding {
  key: string;
  label: string;
  value: string;
}

export interface ExtractedMedication {
  drug: string;
  dose: string;
  frequency: string;
  since: string;
}

export interface ExtractedLab {
  analyte: string;
  value: string;
  range: string;
  status: "high" | "low" | "normal";
}

export interface TimelineDoc {
  id: string;
  title: string;
  kind: "Prescription" | "Lab Report" | "Discharge Summary";
  date: string;
  source: string;
  ocrConfidence: number;
  meds?: ExtractedMedication[];
  labs?: ExtractedLab[];
}

export interface KioskSession {
  language: VoiceLocale | null;
  languageLabel: string | null;
  patient: {
    name: string;
    age: number;
    sex: "Female" | "Male";
    abha: string;
    token: string;
    vitals: { label: string; value: string; flag?: "high" | "low" }[];
  } | null;
  careMode: CareMode;
  complaint: string | null;
  complaintLabel: string | null;
  socrates: SocratesFinding[];
  ayush: AyushFinding[];
  redFlag: string | null;
  docs: TimelineDoc[];
  consent: boolean;
  completedAt: string | null;
  intakeSeconds: number;
}

export const EMPTY_SESSION: KioskSession = {
  language: null,
  languageLabel: null,
  patient: null,
  careMode: "allopathy",
  complaint: null,
  complaintLabel: null,
  socrates: [],
  ayush: [],
  redFlag: null,
  docs: [],
  consent: false,
  completedAt: null,
  intakeSeconds: 0,
};

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

type KioskAction =
  | { type: "set-language"; locale: VoiceLocale; label: string }
  | { type: "set-patient"; patient: NonNullable<KioskSession["patient"]> }
  | { type: "set-care-mode"; mode: CareMode }
  | { type: "set-complaint"; complaint: string; label: string }
  | { type: "add-socrates"; finding: SocratesFinding }
  | { type: "add-ayush"; finding: AyushFinding }
  | { type: "set-red-flag"; flag: string | null }
  | { type: "add-doc"; doc: TimelineDoc }
  | { type: "set-consent"; consent: boolean }
  | { type: "set-intake-seconds"; seconds: number }
  | { type: "complete"; at: string }
  | { type: "reset" };

function reducer(state: KioskSession, action: KioskAction): KioskSession {
  switch (action.type) {
    case "set-language":
      return {
        ...state,
        language: action.locale,
        languageLabel: action.label,
      };
    case "set-patient":
      return { ...state, patient: action.patient };
    case "set-care-mode":
      return { ...state, careMode: action.mode };
    case "set-complaint":
      return { ...state, complaint: action.complaint, complaintLabel: action.label };
    case "add-socrates":
      return {
        ...state,
        socrates: [
          ...state.socrates.filter((f) => f.key !== action.finding.key),
          action.finding,
        ],
      };
    case "add-ayush":
      return {
        ...state,
        ayush: [
          ...state.ayush.filter((f) => f.key !== action.finding.key),
          action.finding,
        ],
      };
    case "set-red-flag":
      return { ...state, redFlag: action.flag };
    case "add-doc":
      return { ...state, docs: [...state.docs, action.doc] };
    case "set-consent":
      return { ...state, consent: action.consent };
    case "set-intake-seconds":
      return { ...state, intakeSeconds: action.seconds };
    case "complete":
      return { ...state, completedAt: action.at };
    case "reset":
      return { ...EMPTY_SESSION };
    default:
      return state;
  }
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface KioskStore {
  session: KioskSession;
  dispatch: React.Dispatch<KioskAction>;
}

const KioskContext = createContext<KioskStore | null>(null);

export function KioskProvider({ children }: { children: ReactNode }) {
  const [session, dispatch] = useReducer(reducer, EMPTY_SESSION);
  const value = useMemo(() => ({ session, dispatch }), [session]);
  return <KioskContext.Provider value={value}>{children}</KioskContext.Provider>;
}

export function useKioskSession(): KioskStore {
  const ctx = useContext(KioskContext);
  if (!ctx) throw new Error("useKioskSession must be used within KioskProvider");
  return ctx;
}
