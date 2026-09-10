import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Fingerprint,
  FlaskConical,
  HeartPulse,
  Languages,
  Loader2,
  Mic,
  MicOff,
  MousePointerClick,
  Pill,
  Salad,
  ScanLine,
  ShieldCheck,
  Siren,
  Smartphone,
  Speaker,
  Stethoscope,
  ThumbsUp,
  Trash2,
  Volume2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AYUSH_STEPS,
  COMPLAINTS,
  AYUSH_COMPLAINTS,
  CONSENT_POINTS,
  DEMO_PATIENT,
  RED_FLAG_CASES,
  SAMPLE_DOCS,
  VITALS,
} from "@/lib/kiosk-data";
import { EMPTY_SESSION, useKioskSession, type TimelineDoc } from "@/lib/kiosk-store";
import { speak, stopSpeaking, voiceLabel, type VoiceLocale } from "@/lib/speech";
import { ABHAArkaLogo, Typewriter, Waveform } from "@/components/medikiosk/ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function KioskChip({
  icon: Icon,
  children,
  className,
}: {
  icon?: typeof Stethoscope;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-900 ring-1 ring-teal-600/15",
        className,
      )}
    >
      {Icon && <Icon className="size-3.5 text-teal-700" />}
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-teal-800/70">
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/* Kiosk shell — full-screen fixed overlay, emulates the kiosk display */
/* ------------------------------------------------------------------ */

const STEPS = [
  { key: "checkin", label: "Check-in" },
  { key: "intake", label: "AI Intake" },
  { key: "documents", label: "Documents" },
  { key: "consent", label: "Consent" },
] as const;

type StepKey = (typeof STEPS)[number]["key"];

export function KioskSimulator({
  open,
  onHandoff,
  onClose,
}: {
  open: boolean;
  onHandoff: (token: string) => void;
  onClose: () => void;
}) {
  const { session, dispatch } = useKioskSession();
  const [step, setStep] = useState<StepKey>("checkin");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Hard-wipe the session whenever the kiosk opens (zero-retention).
  useEffect(() => {
    if (open) {
      dispatch({ type: "reset" });
      setStep("checkin");
    }
  }, [open, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (!open) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <AnimatePresence>
      <motion.div
        key="kiosk-root"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[80] flex flex-col bg-[#F1F5F9]"
        role="dialog"
        aria-modal="true"
        aria-label="MediKiosk patient kiosk simulator"
      >
        {/* Kiosk status bar */}
        <div className="flex items-center justify-between gap-3 bg-[#0F172A] px-4 py-2.5 text-[#E2E8F0] sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-xs font-medium tracking-wide">
              MediKiosk · District Hospital OPD · Kiosk 03
            </span>
          </div>
          <div className="flex items-center gap-2">
            <KioskChip icon={ShieldCheck} className="border-teal-700/40 bg-teal-900/40 text-teal-200 ring-teal-500/20">
              ABDM Connected
            </KioskChip>
            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-white/10 px-3 text-sm font-medium text-white transition hover:bg-white/20"
              aria-label="Exit kiosk simulation"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Step tracker */}
        <div className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-2 sm:gap-3">
            {STEPS.map((s, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <div key={s.key} className="flex flex-1 items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                      done && "bg-teal-600 text-white",
                      current && "bg-[#0F172A] text-white ring-4 ring-teal-600/25",
                      !done && !current && "bg-slate-200 text-slate-500",
                    )}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      "hidden text-sm font-medium sm:block",
                      current ? "text-[#0F172A]" : "text-slate-500",
                    )}
                  >
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-[2px] flex-1 rounded",
                        done ? "bg-teal-600" : "bg-slate-200",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            <AnimatePresence mode="wait">
              {step === "checkin" && (
                <motion.div
                  key="checkin"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  <CheckInStep
                    language={session.language}
                    onLanguage={(locale) => {
                      const lang = LANGS.find((l) => l.locale === locale);
                      dispatch({
                        type: "set-language",
                        locale,
                        label: lang?.label ?? locale,
                      });
                    }}
                    onVerified={(patient) => dispatch({ type: "set-patient", patient })}
                    patient={session.patient}
                    onNext={() => setStep("intake")}
                  />
                </motion.div>
              )}
              {step === "intake" && (
                <motion.div
                  key="intake"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0 story: "wait" }}
                >
                  <div />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
