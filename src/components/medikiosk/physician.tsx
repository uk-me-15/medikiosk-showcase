import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowLeft,
  BellRing,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardEdit,
  FileText,
  FlaskConical,
  History,
  Leaf,
  Pill,
  Printer,
  ShieldCheck,
  Siren,
  Stethoscope,
  Timer,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AYUSH_FALLBACK,
  CHRONIC_HISTORY,
  ALLERGIES,
  COMPLAINTS,
  DEMO_PATIENT,
  DOCTOR_QUEUE,
  SAMPLE_DOCS,
  VITALS,
} from "@/lib/kiosk-data";
import { useKioskSession } from "@/lib/kiosk-store";
import { ABHAArkaLogo } from "@/components/medikiosk/ui";
import { cn } from "@/lib/utils";

function labPill(status: "high" | "low" | "normal") {
  if (status === "high")
    return "bg-red-50 text-red-700 ring-red-200";
  if (status === "low") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-slate-50 text-slate-500 ring-slate-200";
}

/* ------------------------------------------------------------------ */
/* Summary data resolution — live kiosk session or demo fallback       */
/* ------------------------------------------------------------------ */

function useSummary() {
  const { session } = useKioskSession();

  return useMemo(() => {
    const live = Boolean(session.patient && session.completedAt);
    const complaint =
      COMPLAINTS.find((c) => c.id === session.complaint) ?? COMPLAINTS[0];
    return {
      live,
      name: live ? session.patient!.name : DEMO_PATIENT.name,
      age: live ? session.patient!.age : DEMO_PATIENT.age,
      sex: live ? session.patient!.sex : DEMO_PATIENT.sex,
      abha: live ? session.patient!.abha : DEMO_PATIENT.abha,
      token: live ? session.patient!.token : DEMO_PATIENT.token,
      vitals: live ? session.patient!.vitals : VITALS,
      careMode: session.careMode,
      complaintLabel: live ? session.complaintLabel ?? complaint.label : complaint.label,
      hpi: complaint.narration,
      duration: complaint.duration,
      severity: complaint.severity,
      socrates: session.socrates,
      ayush: live && session.ayush.length > 0 ? session.ayush : AYUSH_FALLBACK,
      redFlag: session.redFlag,
      docs: session.docs.length > 0 ? session.docs : SAMPLE_DOCS,
      intakeSeconds: live ? session.intakeSeconds : 95,
    };
  }, [session]);
}

type Summary = ReturnType<typeof useSummary>;

/* ------------------------------------------------------------------ */
/* Queue                                                               */
/* ------------------------------------------------------------------ */

function QueueRow({
  entry,
  selected,
  onClick,
}: {
  entry: { token: string; name: string; age: number; sex: string; complaint: string; wait: string; state: string; flagged?: boolean };
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
        selected
          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-600/20"
          : "border-transparent hover:bg-slate-50",
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          entry.flagged
            ? "bg-red-100 text-red-700"
            : "bg-slate-100 text-slate-600",
        )}
      >
        {entry.token}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-slate-900">
          {entry.name}, {entry.age}
          {entry.flagged ? <Siren className="ml-1.5 inline size-3.5 text-red-600" /> : null}
        </span>
        <span className="block truncate text-xs text-slate-500">
          {entry.complaint} · {entry.wait}
        </span>
      </span>
      {selected ? <ChevronRight className="size-4 shrink-0 text-teal-600" /> : null}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Physician console overlay                                           */
/* ------------------------------------------------------------------ */

export function PhysicianConsole({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const summary = useSummary();
  const [selectedToken, setSelectedToken] = useState<string>(summary.token);
  const [amending, setAmending] = useState(false);
  const [note, setNote] = useState("");
  const [pushed, setPushed] = useState(false);

  const queue = useMemo(
    () => [
      {
        token: summary.token.replace("OPD Token ", ""),
        name: summary.name,
        age: summary.age,
        sex: summary.sex === "Female" ? "F" : "M",
        complaint: summary.complaintLabel,
        wait: "intake done",
        state: "ready",
        flagged: Boolean(summary.redFlag),
      },
      ...DOCTOR_QUEUE,
    ],
    [summary],
  );

  if (!open) return null;

  const isDemoSelected = selectedToken !== summary.token.replace("OPD Token ", "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[80] flex flex-col bg-slate-100"
      role="dialog"
      aria-modal="true"
      aria-label="Physician OPD console"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 bg-slate-900 px-4 py-2.5 text-slate-200 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
            <Stethoscope className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">
              Dr. Arjun Mehta · General Medicine
            </p>
            <p className="text-[11px] text-slate-400">
              District Hospital OPD · Room 12 · ABDM linked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-400/20 sm:inline-flex">
            <BellRing className="size-3" /> 14 in queue
          </span>
          <button
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-white/10 px-3 text-white transition hover:bg-white/20"
            aria-label="Close physician console"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Queue column */}
        <aside className="flex max-h-56 shrink-0 flex-col gap-2 overflow-y-auto border-b border-slate-200 bg-white p-3 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
          <p className="px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            Today&apos;s OPD queue
          </p>
          {queue.map((q) => (
            <QueueRow
              key={q.token}
              entry={q}
              selected={selectedToken === q.token}
              onClick={() => setSelectedToken(q.token)}
            />
          ))}
        </aside>

        {/* Summary column */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isDemoSelected ? (
            <div className="mx-auto mt-16 max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <History className="mx-auto size-8 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">
                {selectedToken} — historic OPD record
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Registered at the manual counter. No MediKiosk AI summary for this
                patient. Select <strong>{summary.token.replace("OPD Token ", "")}</strong>{" "}
                to see the AI-generated intake summary.
              </p>
            </div>
          ) : (
            <ClinicalSummary
              summary={summary}
              amending={amending}
              setAmending={setAmending}
              note={note}
              setNote={setNote}
              pushed={pushed}
              setPushed={setPushed}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Standardized clinical summary card                                  */
/* ------------------------------------------------------------------ */

function ClinicalSummary({
  summary,
  amending,
  setAmending,
  note,
  setNote,
  pushed,
  setPushed,
}: {
  summary: Summary;
  amending: boolean;
  setAmending: (v: boolean) => void;
  note: string;
  setNote: (v: string) => void;
  pushed: boolean;
  setPushed: (v: boolean) => void;
}) {
  const hasAyush = summary.ayush.length > 0;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-10">
      {/* Patient header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-teal-50">
              <ABHAArkaLogo size={26} />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-slate-900">
                {summary.name}, {summary.age} · {summary.sex}
              </p>
              <p className="font-mono text-xs text-slate-500">
                {summary.abha} · {summary.token}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {summary.redFlag ? (
              <Badge className="gap-1 bg-red-600 text-white">
                <Siren className="size-3" /> Red flag
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className="gap-1 border-teal-600/30 bg-teal-50 text-teal-800"
            >
              {summary.careMode === "ayush" ? (
                <Leaf className="size-3" />
              ) : (
                <Stethoscope className="size-3" />
              )}
              {summary.careMode === "ayush" ? "AYUSH mode" : "Allopathic OPD"}
            </Badge>
            <Badge variant="outline" className="gap-1 border-slate-300 text-slate-600">
              <Timer className="size-3" /> Intake in {summary.intakeSeconds}s
            </Badge>
            {summary.live ? (
              <Badge variant="outline" className="gap-1 border-emerald-300 text-emerald-700">
                <CheckCircle2 className="size-3" /> Live kiosk session
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-slate-300 text-slate-500">
                Demo data
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Complaint + HPI */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Stethoscope className="size-4 text-teal-700" /> Chief complaint & HPI
          </h3>
          <span className="text-xs font-medium text-slate-400">
            SOCRATES complete · severity {summary.severity}/10
          </span>
        </div>
        <p className="mt-1 text-base font-semibold text-teal-900">
          {summary.complaintLabel}
          <span className="ml-2 text-xs font-normal text-slate-500">
            duration: {summary.duration}
          </span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary.hpi}</p>

        {summary.socrates.length > 0 ? (
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
            {summary.socrates.map((f) => (
              <div
                key={f.key}
                className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-teal-600 font-display text-[10px] font-bold text-white">
                  {f.key}
                </span>
                <span>
                  <span className="font-semibold text-slate-800">{f.label}: </span>
                  <span className="text-slate-600">{f.value}</span>
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* Vitals */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Activity className="size-4 text-teal-700" /> Vitals at kiosk
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {summary.vitals.map((v) => (
            <div
              key={v.label}
              className={cn(
                "rounded-xl border px-3 py-2",
                v.flag === "high"
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {v.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 text-sm font-bold",
                  v.flag === "high" ? "text-red-700" : "text-slate-800",
                )}
              >
                {v.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical tabs: history / AYUSH */}
      <Tabs defaultValue={hasAyush ? undefined : "clinical"}>
        <TabsList className={cn("h-11", hasAyush && "w-full max-w-xs")}>
          {hasAyush ? (
            <TabsTrigger value="clinical" className="gap-1.5">
              <ClipboardEdit className="size-4" /> History
            </TabsTrigger>
          ) : null}
          {hasAyush ? (
            <TabsTrigger value="ayush" className="gap-1.5">
              <Leaf className="size-4" /> AYUSH
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="clinical">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
                <Pill className="size-3.5" /> Chronic history
              </h4>
              <ul className="mt-2 space-y-1">
                {CHRONIC_HISTORY.map((h) => (
                  <li key={h} className="text-sm text-amber-900">
                    • {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4">
              <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
                <Siren className="size-3.5" /> Allergies — act before prescribing
              </h4>
              <ul className="mt-2 space-y-1">
                {ALLERGIES.map((a) => (
                  <li key={a} className="text-sm font-semibold text-red-900">
                    ⚠ {a}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ayush">
          <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <Leaf className="size-3.5" /> Prakriti / Vikriti & Pariksha indicators
            </h4>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {summary.ayush.map((a) => (
                <div
                  key={a.key}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-teal-600/10"
                >
                  <span className="text-slate-600">{a.label}</span>
                  <span className="font-semibold text-teal-900">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Document timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <FileText className="size-4 text-teal-700" /> Document timeline
        </h3>
        <div className="mt-3 space-y-2">
          {summary.docs.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2.5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-700 ring-1 ring-slate-200">
                {d.kind === "Lab Report" ? (
                  <FlaskConical className="size-4" />
                ) : (
                  <FileText className="size-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{d.title}</p>
                <p className="text-xs text-slate-500">
                  {d.date} · {d.source}
                </p>
              </div>
              <Badge variant="secondary" className="font-mono text-[10px]">
                OCR {Math.round(d.ocrConfidence * 100)}%
              </Badge>
              <button
                className="hidden min-h-9 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 hover:bg-white sm:block"
                onClick={() => toast.info(`Preview: ${d.title}`)}
              >
                Preview
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Amend note */}
      <AnimatePresence>
        {amending ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-2xl border border-teal-200 bg-white p-5 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900">
              Amend / add clinical note
            </h3>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Add your observations — appended to the AI summary and pushed with the encounter…"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-600/20"
            />
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="ghost"
                className="min-h-10"
                onClick={() => setAmending(false)}
              >
                Cancel
              </Button>
              <Button
                className="min-h-10 bg-teal-700 text-white hover:bg-teal-800"
                onClick={() => {
                  setAmending(false);
                  toast.success("Note appended to the clinical summary");
                }}
              >
                <Check className="size-4" /> Save note
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Actions */}
      <div className="sticky bottom-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="min-h-12 flex-1 gap-2 sm:flex-none sm:px-5"
            onClick={() => setAmending((a) => !a)}
          >
            <ClipboardEdit className="size-4" /> Edit / Amend Notes
          </Button>
          <Button
            variant="outline"
            className="min-h-12 flex-1 gap-2 sm:flex-none sm:px-5"
            onClick={() => toast.info("Prescription pad opened (demo)")}
          >
            <Printer className="size-4" /> Proceed to Prescription
          </Button>
          <Button
            className="min-h-12 min-w-48 flex-[2] gap-2 bg-teal-700 text-white hover:bg-teal-800 sm:flex-none sm:px-6"
            disabled={pushed}
            onClick={() => {
              setPushed(true);
              toast.success(
                "FHIR bundle pushed to HIS · ABDM encounter linked to ABHA",
              );
            }}
          >
            {pushed ? (
              <>
                <CheckCircle2 className="size-4" /> Pushed to HIS
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" /> Approve & Push to HIS/FHIR
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
