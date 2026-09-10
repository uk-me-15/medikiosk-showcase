import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bone,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  FlaskConical,
  Fingerprint,
  HeartPulse,
  Languages,
  Leaf,
  Loader2,
  Mic,
  MousePointerClick,
  Pill,
  Salad,
  ScanLine,
  ShieldCheck,
  Siren,
  Stethoscope,
  Thermometer,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  AYUSH_COMPLAINTS,
  AYUSH_STEPS,
  COMPLAINTS,
  CONSENT_POINTS,
  DEMO_PATIENT,
  KIOSK_LANGUAGES,
  RED_FLAG_CASES,
  SAMPLE_DOCS,
  VITALS,
  type ComplaintOption,
} from "@/lib/kiosk-data";
import {
  useKioskSession,
  type AyushFinding,
  type CareMode,
  type ExtractedLab,
  type KioskSession,
  type SocratesFinding,
  type TimelineDoc,
} from "@/lib/kiosk-store";
import { speak, stopSpeaking, voiceLabel, type VoiceLocale } from "@/lib/speech";
import { ABHAArkaLogo, Typewriter, Waveform } from "@/components/medikiosk/ui";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function KioskChip({
  icon: Icon,
  children,
  className,
}: {
  icon?: typeof Stethoscope;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1",
        "bg-teal-50 text-teal-900 ring-teal-600/20",
        className,
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : null}
      {children}
    </span>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: typeof Mic; children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
      <Icon className="size-3.5 text-teal-700" />
      {children}
    </h3>
  );
}

const COMPLAINT_ICONS: Record<string, typeof HeartPulse> = {
  "heart-pulse": HeartPulse,
  salad: Salad,
  thermometer: Thermometer,
  bone: Bone,
};

function socratesFindings(c: ComplaintOption): SocratesFinding[] {
  return [
    { key: "O", label: "Onset", value: c.socrates.onset },
    { key: "C", label: "Character", value: c.socrates.character },
    { key: "R", label: "Radiation", value: c.socrates.radiation },
    { key: "S", label: "Severity", value: `${c.severity} / 10` },
    { key: "T", label: "Timing", value: c.socrates.timing },
    { key: "A", label: "Associated", value: c.socrates.associated },
    { key: "E", label: "Exacerbating", value: c.socrates.exacerbating },
  ];
}

type Patient = NonNullable<KioskSession["patient"]>;

/* ------------------------------------------------------------------ */
/* Step 1 — Language selection + ABHA verification / demographic       */
/* ------------------------------------------------------------------ */

function CheckInStep({ onNext }: { onNext: () => void }) {
  const { session, dispatch } = useKioskSession();
  const [verifying, setVerifying] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  const startVerify = () => {
    if (verifying || session.patient) return;
    setVerifying(true);
    timers.current.push(
      window.setTimeout(() => {
        setVerifying(false);
        dispatch({
          type: "set-patient",
          patient: {
            name: DEMO_PATIENT.name,
            age: DEMO_PATIENT.age,
            sex: DEMO_PATIENT.sex,
            abha: DEMO_PATIENT.abha,
            token: DEMO_PATIENT.token,
            vitals: VITALS,
          },
        });
      }, 1600),
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-slate-900">
          Choose your language
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          अपनी भाषा चुनें · மொழியைத் தேர்ந்தெடுக்கவும் · আপনার ভাষা নির্বাচন করুন
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {KIOSK_LANGUAGES.map((lang) => {
          const selected = session.language === lang.locale;
          return (
            <button
              key={lang.locale}
              onClick={() => {
                dispatch({
                  type: "set-language",
                  locale: lang.locale,
                  label: lang.label,
                });
                speak(`${lang.nativeScript}. Welcome to MediKiosk.`, lang.locale);
              }}
              className={cn(
                "flex min-h-[76px] flex-col items-center justify-center rounded-xl border-2 bg-white p-3 text-center transition",
                selected
                  ? "border-teal-600 bg-teal-50 shadow-sm ring-2 ring-teal-600/30"
                  : "border-slate-200 hover:border-teal-400 hover:bg-teal-50/40",
              )}
              aria-pressed={selected}
            >
              <span className="text-xl font-semibold text-slate-900">{lang.label}</span>
              <span className="mt-0.5 text-xs text-slate-500">{lang.english}</span>
              {selected ? (
                <Check className="mt-1 size-4 text-teal-600" aria-label="selected" />
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <SectionTitle icon={ShieldCheck}>ABHA verification</SectionTitle>

        <div className="mt-4 flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center">
          <ABHAArkaLogo size={40} />
          <div>
            <p className="font-mono text-sm tracking-wider text-slate-600">
              [ABHA / Govt ID Redacted]
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Place your ABHA card or Aadhaar on the scanner, or tap verify
            </p>
          </div>
          <Button
            type="button"
            onClick={startVerify}
            disabled={!session.language || verifying}
            className="min-h-12 gap-2 bg-teal-700 px-6 text-white hover:bg-teal-800"
          >
            {verifying ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Verifying with ABDM…
              </>
            ) : session.patient ? (
              <>
                <CheckCircle2 className="size-4" /> Verified
              </>
            ) : (
              <>
                <Fingerprint className="size-4" /> Verify ABHA
              </>
            )}
          </Button>
          {!session.language ? (
            <p className="text-xs text-amber-700">
              Select a language above to continue
            </p>
          ) : null}
        </div>

        {session.patient ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-xl border border-teal-200 bg-teal-50/60 p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-base font-semibold text-slate-900">
                  {session.patient.name}, {session.patient.age} · {session.patient.sex}
                </p>
                <p className="mt-0.5 font-mono text-xs text-slate-500">
                  {session.patient.abha}
                </p>
              </div>
              <Badge className="bg-teal-700 text-white">Demographics confirmed</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {session.patient.vitals.slice(0, 4).map((v) => (
                <span
                  key={v.label}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs ring-1",
                    v.flag === "high"
                      ? "text-red-700 ring-red-200"
                      : "text-slate-600 ring-slate-200",
                  )}
                >
                  <Activity className="size-3" />
                  {v.label} {v.value}
                </span>
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!session.language || !session.patient}
          className="min-h-13 gap-2 bg-slate-900 px-8 text-base text-white hover:bg-slate-800"
        >
          Start AI Intake <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Dual-mode AI intake (SOCRATES + AYUSH) with red flags      */
/* ------------------------------------------------------------------ */

const AYUSH_HINT =
  "AYUSH mode: I will ask simple questions about your body type, digestion, diet and daily routine.";

function IntakeStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { session, dispatch } = useKioskSession();
  const locale: VoiceLocale = session.language ?? "en-IN";
  const [mode, setMode] = useState<CareMode>(session.careMode);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [flagOpen, setFlagOpen] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const list = timers.current;
    return () => {
      list.forEach((t) => window.clearTimeout(t));
      stopSpeaking();
    };
  }, []);

  const complaint = useMemo(() => {
    const list = mode === "ayush" ? AYUSH_COMPLAINTS : COMPLAINTS;
    return list.find((c) => c.id === session.complaint) ?? null;
  }, [mode, session.complaint]);

  const findings = useMemo(
    () => (complaint ? socratesFindings(complaint) : []),
    [complaint],
  );

  // SOCRATES auto-branch: findings stream in while the AI "listens".
  useEffect(() => {
    setRevealed(0);
    setListening(false);
    if (mode !== "allopathy" || !complaint) return;
    setListening(true);
    findings.forEach((f, i) => {
      timers.current.push(
        window.setTimeout(
          () => {
            dispatch({ type: "add-socrates", finding: f });
            setRevealed(i + 1);
            if (i === findings.length - 1) setListening(false);
          },
          700 + i * 650,
        ),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complaint?.id, mode]);

  const narration = complaint
    ? complaint.narration
    : mode === "ayush"
      ? AYUSH_HINT
      : "Please tap the picture that matches your main problem today. Or press the microphone and tell me in your own words.";

  useEffect(() => {
    if (!voiceOn) return;
    speak(narration, locale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn, narration]);

  const switchMode = (m: CareMode) => {
    setMode(m);
    dispatch({ type: "set-care-mode", mode: m });
    dispatch({ type: "set-complaint", complaint: "", label: "" });
  };

  const pickComplaint = (c: ComplaintOption) => {
    dispatch({ type: "set-complaint", complaint: c.id, label: c.label });
    if (voiceOn) speak(c.narration, locale);
  };

  const pickAyush = (step: (typeof AYUSH_STEPS)[number], option: string) => {
    const finding: AyushFinding = { key: step.key, label: step.label, value: option };
    dispatch({ type: "add-ayush", finding });
  };

  const autoFillAyush = () => {
    AYUSH_STEPS.forEach((step, i) => {
      timers.current.push(
        window.setTimeout(() => {
          pickAyush(step, step.options[step.answerIndex]);
        }, i * 220),
      );
    });
  };

  const triggerRedFlag = (caseId: string) => {
    const flag = RED_FLAG_CASES.find((c) => c.id === caseId);
    if (!flag) return;
    dispatch({ type: "set-red-flag", flag: flag.label });
    setFlagOpen(false);
    if (voiceOn) speak("Emergency detected. Please stay seated. Help is coming.", locale);
  };

  const activeCase = RED_FLAG_CASES.find((c) => c.label === session.redFlag) ?? null;
  const complaintList = mode === "ayush" ? AYUSH_COMPLAINTS : COMPLAINTS;
  const canContinue =
    mode === "allopathy"
      ? Boolean(complaint) && revealed >= findings.length && findings.length > 0
      : session.ayush.length >= 6;

  return (
    <div className="flex flex-col gap-6">
      {/* Mode switcher */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5">
          {(
            [
              { id: "allopathy", label: "Allopathic OPD", icon: Stethoscope },
              { id: "ayush", label: "AYUSH Pariksha", icon: Leaf },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              onClick={() => switchMode(m.id)}
              aria-pressed={mode === m.id}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition",
                mode === m.id
                  ? "bg-white text-teal-800 shadow-sm ring-1 ring-teal-600/20"
                  : "text-slate-500 hover:text-slate-700",
              )}
            >
              <m.icon className="size-4" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Voice / touch engine toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceOn(true)}
            aria-pressed={voiceOn}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition",
              voiceOn
                ? "bg-teal-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <Mic className="size-4" /> Voice
          </button>
          <button
            onClick={() => {
              setVoiceOn(false);
              stopSpeaking();
            }}
            aria-pressed={!voiceOn}
            className={cn(
              "flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition",
              !voiceOn
                ? "bg-teal-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            <MousePointerClick className="size-4" /> Touch
          </button>
        </div>
      </div>

      {/* AI nurse conversation panel */}
      <div className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="relative flex size-2.5">
              <span
                className={cn(
                  "absolute inline-flex h-full w-full animate-ping rounded-full opacity-60",
                  listening ? "bg-teal-500" : "bg-slate-300",
                )}
              />
              <span
                className={cn(
                  "relative inline-flex size-2.5 rounded-full",
                  listening ? "bg-teal-500" : "bg-slate-300",
                )}
              />
            </span>
            MediKiosk AI Nurse
            <span className="text-xs font-normal text-slate-400">
              · {voiceLabel(locale)}
            </span>
          </div>
          <button
            onClick={() => setVoiceOn((v) => !v)}
            className="flex size-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
            aria-label={voiceOn ? "Mute narration" : "Unmute narration"}
          >
            {voiceOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </button>
        </div>
        <Waveform active={voiceOn && listening} className="mt-3" />
        <p className="mt-3 min-h-14 text-[15px] leading-relaxed text-slate-700">
          <Typewriter text={narration} />
        </p>
      </div>

      {/* Red-flag alert card */}
      <AnimatePresence>
        {activeCase ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="overflow-hidden rounded-2xl border-2 border-red-500 bg-red-50 shadow-lg"
            role="alert"
          >
            <div className="flex items-center gap-3 bg-red-600 px-5 py-3 text-white">
              <Siren className="size-6 animate-pulse" />
              <div>
                <p className="text-sm font-bold uppercase tracking-wider">
                  Emergency red-flag detected
                </p>
                <p className="text-xs text-red-100">{activeCase.label}</p>
              </div>
              <Badge className="ml-auto border-white/40 bg-white/15 text-white">
                Triage redirection
              </Badge>
            </div>
            <div className="p-5">
              <p className="text-sm text-red-900">{activeCase.trigger}</p>
              <ul className="mt-3 space-y-1.5">
                {activeCase.protocol.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 size-4 shrink-0 text-red-600" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-semibold text-red-700">
                Destination: {activeCase.destination}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  className="min-h-11 bg-red-600 text-white hover:bg-red-700"
                  onClick={() => dispatch({ type: "set-red-flag", flag: null })}
                >
                  Resume intake (demo)
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11 border-red-300 text-red-700 hover:bg-red-100"
                  onClick={onNext}
                >
                  End session here
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Chief complaint icons — only while no emergency is active */}
      {!activeCase ? (
        <div>
          <SectionTitle icon={Languages}>Chief complaint</SectionTitle>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {complaintList.map((c) => {
              const Icon = COMPLAINT_ICONS[c.icon] ?? HeartPulse;
              const selected = session.complaint === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => pickComplaint(c)}
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-2xl border-2 bg-white p-3 text-center transition",
                    selected
                      ? "border-teal-600 bg-teal-50 shadow-sm ring-2 ring-teal-600/25"
                      : "border-slate-200 hover:border-teal-400 hover:bg-teal-50/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-full",
                      selected ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-700",
                    )}
                  >
                    <Icon className="size-6" />
                  </span>
                  <span className="text-sm font-semibold text-slate-900">{c.label}</span>
                  <span className="text-xs text-slate-500">{c.hindi}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Dynamic branch — SOCRATES (allopathy) */}
      {!activeCase && mode === "allopathy" && complaint ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionTitle icon={Stethoscope}>SOCRATES history — captured live</SectionTitle>
          <div className="mt-4 space-y-2">
            {findings.slice(0, revealed).map((f) => (
              <motion.div
                key={f.key}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal-600 font-display text-[11px] font-bold text-white">
                  {f.key}
                </span>
                <div className="text-sm">
                  <span className="font-semibold text-slate-800">{f.label}: </span>
                  <span className="text-slate-600">{f.value}</span>
                </div>
              </motion.div>
            ))}
            {revealed < findings.length ? (
              <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                <Loader2 className="size-4 animate-spin" /> Listening for details…
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Dynamic branch — AYUSH Dashavidha / Ashtavidha Pariksha */}
      {!activeCase && mode === "ayush" ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle icon={Leaf}>Ashtavidha & Dashavidha Pariksha</SectionTitle>
            <button
              onClick={autoFillAyush}
              className="min-h-9 rounded-lg bg-teal-50 px-3 text-xs font-semibold text-teal-800 ring-1 ring-teal-600/20 hover:bg-teal-100"
            >
              Use suggested answers
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {AYUSH_STEPS.map((step) => {
              const answered = session.ayush.find((a) => a.key === step.key);
              return (
                <div
                  key={step.key}
                  className={cn(
                    "rounded-xl border p-3 transition",
                    answered ? "border-teal-200 bg-teal-50/50" : "border-slate-200",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      {step.label}{" "}
                      <span className="font-normal text-slate-500">· {step.hindi}</span>
                    </p>
                    {answered ? (
                      <CheckCircle2 className="size-4 text-teal-600" />
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {step.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => pickAyush(step, opt)}
                        aria-pressed={answered?.value === opt}
                        className={cn(
                          "min-h-11 rounded-lg border px-3 text-sm transition",
                          answered?.value === opt
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-teal-400",
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Red-flag simulator trigger */}
      {!activeCase ? (
        <div className="rounded-2xl border-2 border-dashed border-red-300 bg-red-50/50 p-4">
          <button
            onClick={() => setFlagOpen((o) => !o)}
            className="flex w-full items-center gap-2 text-sm font-semibold text-red-700"
            aria-expanded={flagOpen}
          >
            <AlertTriangle className="size-4" />
            Simulate red-flag emergency
            <ChevronRight
              className={cn("ml-auto size-4 transition-transform", flagOpen && "rotate-90")}
            />
          </button>
          {flagOpen ? (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {RED_FLAG_CASES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => triggerRedFlag(c.id)}
                  className="flex min-h-12 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-left text-sm font-medium text-red-800 transition hover:border-red-500 hover:bg-red-50"
                >
                  <Siren className="size-4 shrink-0 text-red-600" />
                  {c.label}
                  <span className="ml-auto hidden text-xs text-slate-400 sm:block">
                    {c.hindi}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 gap-2 text-slate-600"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={onNext}
          disabled={!canContinue}
          className="min-h-13 gap-2 bg-slate-900 px-8 text-base text-white hover:bg-slate-800"
        >
          Continue to documents <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — Medical document scanner & OCR timeline                    */
/* ------------------------------------------------------------------ */

function labStatusClasses(status: ExtractedLab["status"]): string {
  if (status === "high") return "bg-red-50 text-red-700 ring-red-200";
  if (status === "low") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-500 ring-slate-200";
}

function DocumentsStep({
  onBack,
  onNext,
}: {
  onBack: () => void;
  onNext: () => void;
}) {
  const { session, dispatch } = useKioskSession();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const dropCount = useRef(0);
  const timers = useRef<number[]>([]);
  const intervals = useRef<number[]>([]);

  useEffect(() => {
    const t = timers.current;
    const iv = intervals.current;
    return () => {
      t.forEach((x) => window.clearTimeout(x));
      iv.forEach((x) => window.clearInterval(x));
    };
  }, []);

  const scanDoc = (doc: TimelineDoc) => {
    if (scanning) return;
    setScanning(true);
    setProgress(8);
    const iv = window.setInterval(
      () => setProgress((p) => Math.min(96, p + 7)),
      130,
    );
    intervals.current.push(iv);
    timers.current.push(
      window.setTimeout(() => {
        window.clearInterval(iv);
        setProgress(100);
        dispatch({ type: "add-doc", doc });
        setExpanded(doc.id);
        setScanning(false);
      }, 1900),
    );
  };

  const docs = session.docs;

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-slate-900">
          Old papers? Just show them to the kiosk
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Handwritten prescriptions and lab reports are read aloud in your language
        </p>
      </div>

      {/* Drop zone + samples */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const doc = SAMPLE_DOCS[dropCount.current % SAMPLE_DOCS.length];
          dropCount.current += 1;
          scanDoc(doc);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition",
          dragOver
            ? "border-teal-600 bg-teal-50"
            : "border-slate-300 bg-white hover:border-teal-400",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-teal-50 text-teal-700">
          <Upload className="size-6" />
        </span>
        <p className="text-sm font-medium text-slate-700">
          Drag a prescription or report here — or scan a sample below
        </p>
        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {SAMPLE_DOCS.map((d) => (
            <button
              key={d.id}
              onClick={() => scanDoc(d)}
              disabled={scanning}
              className="min-h-11 rounded-lg bg-slate-100 px-4 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800 disabled:opacity-50"
            >
              <ScanLine className="mr-1.5 inline size-4" />
              {d.kind === "Prescription"
                ? "Handwritten prescription"
                : d.kind === "Lab Report"
                  ? "Lab report"
                  : "Discharge summary"}
            </button>
          ))}
        </div>
      </div>

      {/* Scanning animation */}
      <AnimatePresence>
        {scanning ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="pointer-events-none absolute left-0 right-0 h-10 animate-scanline bg-gradient-to-b from-transparent via-teal-400/25 to-transparent" />
            <div className="flex items-center gap-3">
              <Loader2 className="size-5 animate-spin text-teal-700" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  Multilingual OCR + medical NER running…
                </p>
                <p className="text-xs text-slate-500">
                  Reading handwriting, extracting drugs, doses and lab values
                </p>
              </div>
              <span className="font-mono text-xs text-teal-700">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-3 h-1.5" />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Timeline */}
      {docs.length > 0 ? (
        <div>
          <SectionTitle icon={FileText}>Your medical timeline</SectionTitle>
          <div className="mt-3 space-y-3">
            {docs.map((d) => {
              const open = expanded === d.id;
              return (
                <div
                  key={d.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <button
                    onClick={() => setExpanded(open ? null : d.id)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    aria-expanded={open}
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      {d.kind === "Lab Report" ? (
                        <FlaskConical className="size-5" />
                      ) : (
                        <FileText className="size-5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {d.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {d.date} · {d.source}
                      </p>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      OCR {Math.round(d.ocrConfidence * 100)}%
                    </Badge>
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0 text-slate-400 transition-transform",
                        open && "rotate-90",
                      )}
                    />
                  </button>

                  {open ? (
                    <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
                      {d.meds && d.meds.length > 0 ? (
                        <div className="mb-3">
                          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <Pill className="size-3.5" /> Extracted medications
                          </p>
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400">
                                <th className="py-1 pr-2 font-medium">Drug</th>
                                <th className="py-1 pr-2 font-medium">Dose</th>
                                <th className="py-1 pr-2 font-medium">Frequency</th>
                                <th className="py-1 font-medium">Since</th>
                              </tr>
                            </thead>
                            <tbody>
                              {d.meds.map((m) => (
                                <tr
                                  key={m.drug}
                                  className="border-t border-slate-200/70 text-slate-700"
                                >
                                  <td className="py-1.5 pr-2 font-medium">{m.drug}</td>
                                  <td className="py-1.5 pr-2">{m.dose}</td>
                                  <td className="py-1.5 pr-2">{m.frequency}</td>
                                  <td className="py-1.5">{m.since}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                      {d.labs && d.labs.length > 0 ? (
                        <div>
                          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <FlaskConical className="size-3.5" /> Lab values — out of
                            range flagged
                          </p>
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400">
                                <th className="py-1 pr-2 font-medium">Analyte</th>
                                <th className="py-1 pr-2 font-medium">Value</th>
                                <th className="py-1 pr-2 font-medium">Reference</th>
                                <th className="py-1 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {d.labs.map((l) => (
                                <tr
                                  key={l.analyte}
                                  className={cn(
                                    "border-t border-slate-200/70",
                                    l.status === "high" && "bg-red-50/70",
                                    l.status === "low" && "bg-amber-50/70",
                                  )}
                                >
                                  <td className="py-1.5 pr-2 font-medium text-slate-700">
                                    {l.analyte}
                                  </td>
                                  <td
                                    className={cn(
                                      "py-1.5 pr-2 font-mono",
                                      l.status !== "normal" && "font-bold",
                                      l.status === "high" && "text-red-700",
                                      l.status === "low" && "text-amber-700",
                                    )}
                                  >
                                    {l.value}
                                  </td>
                                  <td className="py-1.5 pr-2 font-mono text-slate-400">
                                    {l.range}
                                  </td>
                                  <td className="py-1.5">
                                    <span
                                      className={cn(
                                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1",
                                        labStatusClasses(l.status),
                                      )}
                                    >
                                      {l.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 gap-2 text-slate-600"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            className="min-h-12 text-slate-500"
            onClick={onNext}
          >
            Skip
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={onNext}
            disabled={docs.length === 0}
            className="min-h-13 gap-2 bg-slate-900 px-8 text-base text-white hover:bg-slate-800"
          >
            Review & consent <ArrowRight className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Review & DPDP / ABDM consent                               */
/* ------------------------------------------------------------------ */

const CONSENT_SCRIPT =
  "You are consenting to share today's clinical history with the doctor treating you, under the ABDM consent framework. Your data is processed under the DPDP Act 2023. The kiosk keeps nothing after your file reaches the doctor.";

function ConsentStep({
  onBack,
  onHandoff,
  onClose,
}: {
  onBack: () => void;
  onHandoff: (token: string) => void;
  onClose: () => void;
}) {
  const { session, dispatch } = useKioskSession();
  const [agreed, setAgreed] = useState(false);
  const [audio, setAudio] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (audio) speak(CONSENT_SCRIPT, session.language ?? "en-IN");
    else stopSpeaking();
    return () => stopSpeaking();
  }, [audio, session.language]);

  const complete = () => {
    dispatch({ type: "set-consent", consent: true });
    dispatch({ type: "set-intake-seconds", seconds: 95 });
    dispatch({ type: "complete", at: new Date().toISOString() });
    setDone(true);
  };

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-xl rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-lg"
      >
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          <CheckCircle2 className="size-9" />
        </span>
        <h2 className="mt-4 font-display text-2xl font-semibold text-slate-900">
          Intake complete in 95 seconds
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {session.complaintLabel ?? "Clinical summary"} ·{" "}
          {session.socrates.length + session.ayush.length} structured findings ·{" "}
          {session.docs.length} documents OCR&apos;d
        </p>
        <p className="mt-4 rounded-lg bg-teal-50 px-4 py-3 text-sm text-teal-900">
          Kiosk memory wiped · session handed to the physician OPD view
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            onClick={() => onHandoff(DEMO_PATIENT.token)}
            className="min-h-13 gap-2 bg-teal-700 px-8 text-base text-white hover:bg-teal-800"
          >
            Open physician OPD view <ArrowRight className="size-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-12 gap-2 text-slate-500"
            onClick={() => {
              dispatch({ type: "reset" });
              onClose();
            }}
          >
            <Trash2 className="size-4" /> Wipe session & exit
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-2xl font-semibold text-slate-900">
          One tap before you meet the doctor
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Everything stays between you and your doctor — here is exactly what happens
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {CONSENT_POINTS.map((p) => (
          <div
            key={p.title}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <ShieldCheck className="size-4 text-teal-700" />
              {p.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{p.body}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            {audio ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Audio explanation</p>
            <p className="text-xs text-slate-500">
              Hear this page in {voiceLabel(session.language ?? "en-IN")}
            </p>
          </div>
        </div>
        <Switch checked={audio} onCheckedChange={setAudio} aria-label="Audio explanation" />
      </div>

      <button
        role="checkbox"
        aria-checked={agreed}
        onClick={() => setAgreed((a) => !a)}
        className={cn(
          "flex min-h-14 w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition",
          agreed
            ? "border-teal-600 bg-teal-50"
            : "border-slate-200 bg-white hover:border-teal-300",
        )}
      >
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md border-2",
            agreed ? "border-teal-600 bg-teal-600 text-white" : "border-slate-300 bg-white",
          )}
        >
          {agreed ? <Check className="size-4" /> : null}
        </span>
        <span className="text-sm font-medium text-slate-800">
          I have understood and give consent (DPDP Act 2023 · ABDM consent artefact)
        </span>
      </button>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          className="min-h-12 gap-2 text-slate-600"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" /> Back
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={complete}
          disabled={!agreed}
          className="min-h-13 gap-2 bg-teal-700 px-8 text-base text-white hover:bg-teal-800"
        >
          Agree & finish <Check className="size-5" />
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kiosk shell                                                         */
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
  const { dispatch } = useKioskSession();
  const [step, setStep] = useState<StepKey>("checkin");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      dispatch({ type: "reset" });
      stopSpeaking();
      setStep("checkin");
    }
  }, [open, dispatch]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  if (!open) return null;

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  const stepMotion = (key: string, node: ReactNode) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.22 }}
    >
      {node}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[80] flex flex-col bg-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="MediKiosk patient kiosk simulator"
    >
      {/* Kiosk status bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-2.5 text-slate-200 sm:px-6">
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
          <KioskChip
            icon={ShieldCheck}
            className="border border-teal-700/40 bg-teal-900/40 text-teal-200 ring-teal-500/20"
          >
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
            const isDone = i < stepIndex;
            const current = i === stepIndex;
            return (
              <div key={s.key} className="flex flex-1 items-center gap-2 sm:gap-3">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone && "bg-teal-600 text-white",
                    current && "bg-slate-900 text-white ring-4 ring-teal-600/25",
                    !isDone && !current && "bg-slate-200 text-slate-500",
                  )}
                >
                  {isDone ? <Check className="size-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    current ? "text-slate-900" : "text-slate-500",
                  )}
                >
                  {s.label}
                </span>
                {i < STEPS.length - 1 ? (
                  <div
                    className={cn(
                      "h-[2px] flex-1 rounded",
                      isDone ? "bg-teal-600" : "bg-slate-200",
                    )}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <AnimatePresence mode="wait">
            {step === "checkin"
              ? stepMotion(
                  "checkin",
                  <CheckInStep onNext={() => setStep("intake")} />,
                )
              : null}
            {step === "intake"
              ? stepMotion(
                  "intake",
                  <IntakeStep
                    onBack={() => setStep("checkin")}
                    onNext={() => setStep("documents")}
                  />,
                )
              : null}
            {step === "documents"
              ? stepMotion(
                  "documents",
                  <DocumentsStep
                    onBack={() => setStep("intake")}
                    onNext={() => setStep("consent")}
                  />,
                )
              : null}
            {step === "consent"
              ? stepMotion(
                  "consent",
                  <ConsentStep
                    onBack={() => setStep("documents")}
                    onHandoff={onHandoff}
                    onClose={onClose}
                  />,
                )
              : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
