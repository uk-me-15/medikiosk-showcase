import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  FlaskConical,
  Fingerprint,
  HeartPulse,
  Languages,
  Leaf,
  Lock,
  Mic,
  Monitor,
  MousePointerClick,
  Pill,
  Play,
  RefreshCw,
  ScanLine,
  Server,
  ShieldCheck,
  Siren,
  Smartphone,
  Stethoscope,
  Syringe,
  Tablet,
  Users,
  Volume2,
  Workflow,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediKioskLogo, Waveform } from "@/components/medikiosk/ui";
import { KioskSimulator } from "@/components/medikiosk/kiosk.tsx";
import { PhysicianConsole } from "@/components/medikiosk/physician.tsx";
import { KIOSK_LANGUAGES, a11yPersonaRows } from "@/lib/kiosk-data";
import { useKioskSession } from "@/lib/kiosk-store";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Reveal-on-scroll helper                                             */
/* ------------------------------------------------------------------ */

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-700">
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
        {title}
      </h2>
      {sub ? <p className="mt-3 text-base text-slate-500">{sub}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nav                                                                 */
/* How-it-works, personas, architecture, footer                      */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#personas", label: "Who it serves" },
  { href: "#architecture", label: "Architecture" },
] as const;

function Nav({ onKiosk, onConsole }: { onKiosk: () => void; onConsole: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-md"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5">
          <MediKioskLogo size={30} />
          <span className="font-display text-lg font-semibold text-slate-900">
            MediKiosk
          </span>
          <Badge
            variant="outline"
            className="ml-1 hidden border-teal-600/30 bg-teal-50 text-teal-800 sm:inline-flex"
          >
            ABDM-ready
          </Badge>
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-teal-50 hover:text-teal-900"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="min-h-11 text-slate-700"
            onClick={onConsole}
          >
            <Monitor className="size-4" /> Doctor view
          </Button>
          <Button
            className="min-h-11 gap-2 bg-teal-700 text-white hover:bg-teal-800"
            onClick={onKiosk}
          >
            <Play className="size-4" /> Kiosk demo
          </Button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

const HERO_STATS = [
  { value: "70–80%", label: "Clinical history accuracy", icon: ClipboardList },
  { value: "8 min → 95 sec", label: "Intake time per patient", icon: TimerIcon },
  { value: "10,000", label: "Daily OPD load handled", icon: Users },
  { value: "8", label: "Languages, incl. AYUSH", icon: Languages },
];

function Hero({ onKiosk, onConsole }: { onKiosk: () => void; onConsole: () => void }) {
  return (
    <section id="top" className="relative overflow-hidden pt-28 pb-16 sm:pt-36">
      <div className="bg-grid-faint absolute inset-0" aria-hidden="true" />
      <div className="glow-teal absolute inset-x-0 top-0 h-[540px]" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex w-fit items-center gap-2 rounded-full border border-teal-600/20 bg-white px-4 py-1.5 text-xs font-semibold text-teal-800 shadow-sm"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-teal-600" />
            </span>
            Built for ABDM · DPDP Act 2023 compliant · AYUSH aware
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 font-display text-4xl font-semibold leading-[1.08] text-slate-900 sm:text-6xl"
          >
            From 2-minute bottlenecks to{" "}
            <span className="text-teal-700">meaningful consultations</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-slate-600"
          >
            MediKiosk is the AI intake assistant for Indian public-hospital OPDs and
            AYUSH institutions — voice-first, icon-driven, ABDM integrated. It listens
            in the patient&apos;s language, reads the handwriting, and hands the doctor a
            structured summary before the patient sits down.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button
              size="lg"
              onClick={onKiosk}
              className="min-h-13 w-full gap-2 bg-teal-700 px-8 text-base text-white shadow-md shadow-teal-700/20 hover:bg-teal-800 sm:w-auto"
            >
              <Play className="size-5" /> Launch Patient Kiosk Demo
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={onConsole}
              className="min-h-13 w-full gap-2 border-slate-300 px-8 text-base text-slate-800 hover:bg-slate-50 sm:w-auto"
            >
              <Monitor className="size-5" /> View Physician Dashboard
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-xs text-slate-400"
          >
            No sign-up · scripted demo data · the kiosk wipes itself after every session
          </motion.p>
        </div>

        {/* Kiosk device mockup */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative mx-auto mt-14 max-w-4xl"
        >
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-2 shadow-2xl shadow-teal-900/20">
            <div className="overflow-hidden rounded-2xl bg-slate-50">
              <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 text-[11px] font-medium text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
                  MediKiosk · District Hospital OPD · Kiosk 03
                </span>
                <span className="flex items-center gap-1.5 text-teal-300">
                  <ShieldCheck className="size-3.5" /> ABDM Connected
                </span>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-5 sm:p-6">
                <div className="sm:col-span-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Live intake · Sunita Devi · Token B-14
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">
                    &ldquo;Burning tightness in the centre of the chest for two days, worse
                    after walking, eases with rest. Some sweating and left arm
                    heaviness.&rdquo;
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Waveform active className="h-7 flex-1" />
                    <span className="rounded-md bg-teal-600/10 px-2 py-1 text-[10px] font-bold text-teal-800">
                      hi-IN · AI4Bharat ASR
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {["Onset", "Character", "Radiation", "Severity 7/10", "Timing"].map(
                      (chip) => (
                        <span
                          key={chip}
                          className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-800 ring-1 ring-teal-600/15"
                        >
                          {chip}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 sm:col-span-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    Structured summary
                  </p>
                  <ul className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                    <li className="flex gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-teal-600" />
                      Chest pain — SOCRATES complete
                    </li>
                    <li className="flex gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-teal-600" />
                      BP 148/92 · HbA1c 8.4% flagged
                    </li>
                    <li className="flex gap-1.5">
                      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-teal-600" />
                      3 meds OCR&apos;d from Jan 2025 script
                    </li>
                    <li className="flex gap-1.5">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />
                      Sulfa allergy highlighted
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Floating stat cards */}
          <div
            className="absolute -top-5 -left-4 hidden animate-floaty rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg lg:block"
          >
            <p className="font-display text-2xl font-semibold text-teal-700">95 sec</p>
            <p className="text-[11px] font-medium text-slate-500">avg. intake</p>
          </div>
          <div
            className="absolute -right-4 -bottom-6 hidden animate-floaty rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg lg:block"
            style={{ animationDelay: "1.2s" }}
          >
            <p className="font-display text-2xl font-semibold text-slate-900">8 min</p>
            <p className="text-[11px] font-medium text-slate-500">manual desk today</p>
          </div>
        </motion.div>

        {/* Metric band */}
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-3 lg:grid-cols-4">
          {HERO_STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm"
            >
              <s.icon className="mx-auto size-5 text-teal-700" />
              <p className="mt-2 font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Personas & accessibility comparison                                 */
/* ------------------------------------------------------------------ */

const PERSONA_CARDS = [
  {
    icon: Volume2,
    title: "Voice-first",
    body: "Speaks every question aloud, in the patient's own language, at a pace they control.",
  },
  {
    icon: MousePointerClick,
    title: "48px+ touch targets",
    body: "Large icon buttons, no typing required, tremor- and literacy-friendly by design.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-retention kiosk",
    body: "Every session wipes itself. Nothing about the patient stays on the machine.",
  },
];

function Personas() {
  return (
    <section id="personas" className="scroll-mt-20 bg-slate-950 py-20 text-slate-200 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">
            Who it serves
          </p>
          <h2 className="mt-3 font-display text-3xl Fraunces font-semibold text-white sm:text-4xl">
            Designed for the patients the system forgets
          </h2>
          h2 close
          <p className="mt-3 text-base text-slate-400">
            Mobile apps and manual registration desks fail the people who visit public
            OPDs the most. MediKiosk starts where they are.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          <div className="grid grid-cols-3 border-b border-slate-800">
            <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate- deleted">
              Patient situation
            </div>
            <div className="border-l border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Mobile app / manual desk
            </div>
 broken          </div>
          {a11yPersonaRows.map((row) => (
            <div
              key={row.situation}
              className="grid grid-cols-3 border-b border-slate-800/70 last:border-b-0 max-md:text-sm"
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-300">
                {row.situation}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slate-500">
                <X className="mr-1.5 inline size-3.5 text-red-4
00/70" /> {row.statusQuo}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slide-500">
                <CheckCircle2 className="mr-1.5 inline size-3.5 text-teal-400" />{" "}
                {row.medikiosk}
              </slate-300>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PERSONA_CARDS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How it works — 4-step journey                                       */
/* ------------------------------------------------------------------ */

const HOW_STEPS = [
  {
    icon: Fingerprint,
    title: "Check in with ABHA",
    body: "Tap in, verify once, demographics confirmed in seconds. The ABHA number stays masked on screen.",
    accent: "bg-teal-600",
  },
  {
    icon: Mic,
    title: "Talk or tap your complaint",
    body: "Voice-first in 8 languages, or big icon buttons. SOCRATES and AYUSH Pariksha branches fill in as the AI nurse listens.",
    accent: "bg-teal-700",
  },
  {
    icon: ScanLine,
    title: "Show your old papers",
    body: "Handwritten prescriptions and lab reports are OCR-read on the spot — drugs, doses and out-of-range values highlighted.",
    accent: "bg-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Consent & handoff",
    body: "A plain-language DPDP/ABDM consent, an optional audio explanation, then a clean handoff to the doctor's screen.",
    accent: "bg-slate-900",
  },
];

function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Reveal>
          <SectionHeading
            kicker="How it works"
            title={
              <>
                Four taps between the queue and the 
                <span className="text-teal-700">consultation</span>
              </>
            }
            sub="The same journey patients walk through on the kiosk — try each step live in the demo."
          />
        </Reveal>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {HOW_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08}>
              <Card className="h-full rounded-2xl border-slate-200 shadow-sm transition hover:border-teal-300 hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-xl text-white",
                        step.accent,
                      )}
                    >
                      <step.icon className="size-5" />
                    </span>
                    <span className="font-display text-4xl font-semibold text-slate-100">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                    {step.body}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Personas & accessibility comparison                                 */
/* ------------------------------------------------------------------ */

const PERSONA_CARDS = [
  {
    icon: Volume2,
    title: "Voice-first",
    body: "Speaks every question aloud, in the patient's own language, at a pace they control.",
  },
  {
    icon: MousePointerClick,
    title: "48px+ touch targets",
    body: "Large icon buttons, no typing required, tremor- and literacy-friendly by design.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-retention kiosk",
    body: "Every session wipes itself. Nothing about the patient stays on the machine.",
  },
];

function Personas() {
  return (
    <section id="personas" className="scroll-mt-20 bg-slate-950 py-20 text-slate-200 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">
            Who it serves
          </p>
          <h2 className="mt-3 font-display text-3xl Fraunces font-semibold text-white sm:text-4xl">
            Designed for the patients the system forgets
          </h2>
          h2 close
          <p className="mt-3 text-base text-slate-400">
            Mobile apps and manual registration desks fail the people who visit public
            OPDs the most. MediKiosk starts where they are.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          <div className="grid grid-cols-3 border-b border-slate-800">
            <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate- deleted">
              Patient situation
            </div>
            <div className="border-l border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Mobile app / manual desk
            </div>
 broken          </div>
          {a11yPersonaRows.map((row) => (
            <div
              key={row.situation}
              className="grid grid-cols-3 border-b border-slate-800/70 last:border-b-0 max-md:text-sm"
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-300">
                {row.situation}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slate-500">
                <X className="mr-1.5 inline size-3.5 text-red-4
00/70" /> {row.statusQuo}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slide-500">
                <CheckCircle2 className="mr-1.5 inline size-3.5 text-teal-400" />{" "}
                {row.medikiosk}
              </slate-300>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PERSONA_CARDS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Personas & accessibility comparison                                 */
/* ------------------------------------------------------------------ */

function Personas() {
  return (
    <section id="personas" className="scroll-mt-20 bg-slate-950 py-20 text-slate-200 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">
            Who it serves
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
            Designed for the patients the system forgets
          </h2>
          <p className="mt-3 text-base text-slate-400">
            Mobile apps and manual registration desks fail the people who visit public
            OPDs the most. MediKiosk starts where they are.
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-slate-800">
            <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Patient situation
            </div>
            <div className="border-l border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Mobile app / manual desk
            </div>
            <div className="border-l border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-teal-400">
              MediKiosk
            </div>
          </div>
          {a11yPersonaRows.map((row) => (
            <div
              key={row.situation}
              className="grid grid-cols-3 border-b border-slate-800/70 last:border-b-0 max-md:text-sm"
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-300">
                {row.situation}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slate-500">
                <X className="mr-1.5 inline size-3.5 text-red-400/70" /> {row.statusQuo}
              div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slate-300">
                <CheckCircle2 className="mr-1.5 inline size-3.5 text-teal-400" />{" "}
                {row.medikiosk}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Volume2,
              title: "Voice-first",
              body: "Speaks every question aloud, in the patient's own language, at a pace they control.",
            },
            {
              icon: MousePointerClick,
              title: "48px+ touch targets",
              body: "Large icon buttons, no typing required, tremor- and literacy-friendly by design.",
            },
            {
              icon: ShieldCheck,
              title: "Zero-retention kiosk",
              body: "Every session wipes itself. Nothing about the patient stays on the machine.",
            },
          ]}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Personas & accessibility comparison                                 */
/* ------------------------------------------------------------------ */

const PERSONA_CARDS = [
  {
    icon: Volume2,
    title: "Voice-first",
    body: "Speaks every question aloud, in the patient's own language, at a pace they control.",
  },
  {
    icon: MousePointerClick,
    title: "48px+ touch targets",
    body: "Large icon buttons, no typing required, tremor- and literacy-friendly by design.",
  },
  {
    icon: ShieldCheck,
    title: "Zero-retention kiosk",
    body: "Every session wipes itself. Nothing about the patient stays on the machine.",
  },
];

function Personas() {
  return (
    <section id="personas" className="scroll-mt-20 bg-slate-950 py-20 text-slate-200 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-teal-400">
            Who it serves
          </p>
          <h2 className="mt-3 font-display text-3xl Fraunces font-semibold text-white sm:text-4xl">
            Designed for the patients the system forgets
          </h2>
          h2 close
          <p className="mt-3 text-base text-slate-400">
            Mobile apps and manual registration desks fail the people who visit public
            OPDs the most. MediKiosk starts where they are.
          </p>
        </div>
        <div className="mt-12 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60">
          <div className="grid grid-cols-3 border-b border-slate-800">
            <div className="px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate- deleted">
              Patient situation
            </div>
            <div className="border-l border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
              Mobile app / manual desk
            </div>
 broken          </div>
          {a11yPersonaRows.map((row) => (
            <div
              key={row.situation}
              className="grid grid-cols-3 border-b border-slate-800/70 last:border-b-0 max-md:text-sm"
            >
              <div className="px-5 py-4 text-sm font-medium text-slate-300">
                {row.situation}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slate-500">
                <X className="mr-1.5 inline size-3.5 text-red-4
00/70" /> {row.statusQuo}
              </div>
              <div className="border-l border-slate-800 px-5 py-4 text-sm text-slide-500">
                <CheckCircle2 className="mr-1.5 inline size-3.5 text-teal-400" />{" "}
                {row.medikiosk}
              </slate-300>
            </div>
          ))}
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PERSONA_CARDS.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-300">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-3 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
