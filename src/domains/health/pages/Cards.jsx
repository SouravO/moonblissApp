
import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ShieldCheck,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

/**
 * Card.jsx
 * - 3 onboarding cards (pre-login)
 * - Next/Back controls
 * - Last card has "Get Stronger" CTA
 * - TailwindCSS + Framer Motion + Lucide icons
 *
 * Usage:
 * <Card onGetStarted={() => navigate("/login")} />
 */
export default function Card({ onGetStarted }) {
  const steps = useMemo(
    () => [
      {
        icon: Sparkles,
        title: "Welcome to MoonBliss",
        desc: "A calm, modern space to track your cycle, feel better daily, and stay consistent.",
        bullets: ["Smart reminders", "Clean insights", "Private by default"],
      },
      {
        icon: ShieldCheck,
        title: "Personalized wellness",
        desc: "Get recommendations that match your phase and energy. No noise. Just what helps.",
        bullets: ["Nutrition tips", "Rest cues", "Hydration nudges"],
      },
      {
        icon: Activity,
        title: "Build stronger habits",
        desc: "Small actions. Daily wins. Track progress and stay motivated.",
        bullets: ["Streaks", "Guided routines", "Better recovery"],
      },
    ],
    []
  );

  const [i, setI] = useState(0);
  const isFirst = i === 0;
  const isLast = i === steps.length - 1;

  const goNext = () => setI((v) => Math.min(v + 1, steps.length - 1));
  const goPrev = () => setI((v) => Math.max(v - 1, 0));

  const handleGetStarted = () => {
    //  navigate to login 
    window.location.href = "/login";
    
  };

  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 40 : -40,
      scale: 0.985,
    }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -40 : 40,
      scale: 0.985,
    }),
  };

  // Direction for animations
  const [dir, setDir] = useState(1);
  const next = () => {
    setDir(1);
    goNext();
  };
  const prev = () => {
    setDir(-1);
    goPrev();
  };

  const StepIcon = steps[i].icon;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-gradient-to-b from-sky-50 via-white to-sky-100">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
          animate={{ y: [0, 18, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-28 -right-28 h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl"
          animate={{ y: [0, -16, 0], x: [0, -12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease : "easeInOut" }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-white/70 ring-1 ring-sky-200/60 shadow-sm flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-sky-700" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-slate-800">
                Welcome
              </div>
              <div className="text-xs text-slate-500">
                Quick start in 3 steps
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            {i + 1}/{steps.length}
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-3xl bg-white/75 backdrop-blur-xl ring-1 ring-sky-200/60 shadow-xl overflow-hidden">
          <div className="p-6">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={i}
                custom={dir}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="select-none"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 ring-1 ring-sky-200/60 flex items-center justify-center shadow-sm">
                    <StepIcon className="h-6 w-6 text-sky-800" />
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold text-slate-900">
                      {steps[i].title}
                    </div>
                    <div className="mt-1 text-sm text-slate-600 leading-relaxed">
                      {steps[i].desc}
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {steps[i].bullets.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded-2xl bg-sky-50/70 ring-1 ring-sky-100 px-3 py-2"
                    >
                      <div className="h-7 w-7 rounded-xl bg-white ring-1 ring-sky-200/60 flex items-center justify-center">
                        <ChevronRight className="h-4 w-4 text-sky-700" />
                      </div>
                      <div className="text-sm text-slate-700">{b}</div>
                    </div>
                  ))}
                </div>

                {isLast && (
                  <motion.button
                    onClick={handleGetStarted}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-6 w-full rounded-2xl bg-slate-900 text-white py-3.5 font-semibold shadow-lg shadow-slate-900/15 flex items-center justify-center gap-2"
                  >
                    Get Stronger
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer controls */}
          <div className="px-6 pb-6">
            {/* Dots */}
            <div className="mb-4 flex items-center justify-center gap-2">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setDir(idx > i ? 1 : -1);
                    setI(idx);
                  }}
                  className="p-1"
                  aria-label={`Go to step ${idx + 1}`}
                >
                  <div
                    className={[
                      "h-2.5 rounded-full transition-all",
                      idx === i
                        ? "w-8 bg-slate-900"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400",
                    ].join(" ")}
                  />
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                onClick={prev}
                disabled={isFirst}
                className={[
                  "flex-1 rounded-2xl py-3 ring-1 font-semibold flex items-center justify-center gap-2 transition",
                  isFirst
                    ? "bg-white/40 text-slate-400 ring-slate-200 cursor-not-allowed"
                    : "bg-white text-slate-800 ring-slate-200 hover:bg-slate-50",
                ].join(" ")}
              >
                <ChevronLeft className="h-5 w-5" />
                Back
              </button>

              <button
                onClick={next}
                disabled={isLast}
                className={[
                  "flex-1 rounded-2xl py-3 ring-1 font-semibold flex items-center justify-center gap-2 transition",
                  isLast
                    ? "bg-white/40 text-slate-400 ring-slate-200 cursor-not-allowed"
                    : "bg-sky-600 text-white ring-sky-600 hover:bg-sky-700",
                ].join(" ")}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Hint */}
        <div className="mt-4 text-center text-xs text-slate-500">
          Pre-login onboarding. Wire <span className="font-semibold">onGetStarted</span> to your login route.
        </div>
      </div>
    </div>
  );
}
