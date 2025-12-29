import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../layout/PageLayout";
import ColorBg from "@/components/ColorBg";
import QuizModal from "../../domains/quiz/components/QuizModal";
import StepTrackerModal from "../../domains/tracker/components/StepTrackerModal";
import JokeModal from "../../domains/Joke/JokeModal";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";
import { getThemeConfig } from "@/infrastructure/theme/themeConfig";
import periodStorage from "@/infrastructure/storage/periodStorage";
import {
  Bell,
  ChevronRight,
  Footprints,
  Flame,
  MapPin,
  Timer,
  Target,
  Music2,
  HelpCircle,
  BarChart3,
  Laugh,
  Sparkles,
  Brain,
} from "lucide-react";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const floatIn = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const IconBadge = ({ Icon, className = "" }) => (
  <div
    className={[
      "w-11 h-11 shrink-0 rounded-2xl grid place-items-center",
      "border border-white/15 bg-white/10 text-white",
      className,
    ].join(" ")}
    aria-hidden="true"
  >
    <Icon className="w-6 h-6" />
  </div>
);

const Activities = () => {
  const history = useHistory();

  const [showQuiz, setShowQuiz] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showJoke, setShowJoke] = useState(false);

  // ✅ REFACTORED: Cached period data with event listeners
  const [cachedPeriodData, setCachedPeriodData] = useState(() => {
    return periodStorage.get();
  });

  // ✅ FIX: Re-sync cache when component mounts or storage changes
  useEffect(() => {
    const periodData = periodStorage.get();
    setCachedPeriodData(periodData);

    const handlePeriodDataChange = () => {
      console.log("Period data changed, updating cache");
      const updatedData = periodStorage.get();
      setCachedPeriodData(updatedData);
    };

    window.addEventListener("storage", handlePeriodDataChange);
    window.addEventListener("period-data-changed", handlePeriodDataChange);

    return () => {
      window.removeEventListener("storage", handlePeriodDataChange);
      window.removeEventListener("period-data-changed", handlePeriodDataChange);
    };
  }, []);

  const periodState = useMemo(() => {
    if (!cachedPeriodData?.lastPeriodDate) {
      return {
        periodActive: false,
        savedPeriodStartDate: "",
        periodDuration: 5,
      };
    }

    const startDate = new Date(cachedPeriodData.lastPeriodDate);
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const periodDuration = cachedPeriodData.periodDuration || 5;

    return {
      periodActive: daysElapsed < periodDuration,
      savedPeriodStartDate: cachedPeriodData.lastPeriodDate,
      daysElapsed,
      periodDuration,
    };
  }, [cachedPeriodData]);

  const { periodActive } = periodState;

  // Get dynamic theme based on period state
  const theme = useMemo(() => {
    return getThemeConfig(periodActive);
  }, [periodActive]);

  const [stepData, setStepData] = useState({
    steps: 0,
    calories: 0,
    distance: 0,
    duration: 0,
  });

  useEffect(() => {
    const savedData = localStorage.getItem("stepTrackerData");
    if (savedData) setStepData(JSON.parse(savedData));
  }, [showTracker]);

  const formatDuration = useCallback((seconds) => {
    const s = Number(seconds) || 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const dailyGoal = 6000;
  const progress = useMemo(() => {
    const steps = Number(stepData.steps) || 0;
    return Math.min((steps / dailyGoal) * 100, 100);
  }, [stepData.steps]);

  useBackHandler(() => {
    if (showQuiz) return setShowQuiz(false);
    if (showTracker) return setShowTracker(false);
    if (showJoke) return setShowJoke(false);
  });

  return (
    <PageLayout>
      <ColorBg />

      {/* Dynamic theme background */}
      <div className={`relative min-h-screen text-slate-900 overflow-hidden ${theme.background}`}>

        {/* Animated aurora layers */}
        <motion.div
          aria-hidden="true"
          className={`absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-gradient-to-br ${theme.blobs.blob1} blur-3xl`}
          animate={{ x: [0, 40, -10, 0], y: [0, 20, 55, 0], scale: [1, 1.08, 0.98, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className={`absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-gradient-to-br ${theme.blobs.blob2} blur-3xl`}
          animate={{ x: [0, -35, 15, 0], y: [0, -25, -50, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className={`absolute top-24 right-10 h-[260px] w-[260px] rounded-full bg-gradient-to-br ${theme.blobs.blob1} blur-2xl opacity-60`}
          animate={{ y: [0, 18, -10, 0], opacity: [0.55, 0.8, 0.6, 0.55] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Subtle animated grid/noise feel */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.35) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
          animate={{ opacity: [0.06, 0.1, 0.07, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Content */}
        <div className="relative">
          {/* Top App Bar */}
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-5 pt-6 pb-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className={`text-3xl font-extrabold ${theme.header.text} tracking-tight`}>
                  Activities
                </h1>
                <p className={`text-sm ${theme.text.secondary} mt-1`}>
                  Track your wellness journey
                </p>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className={`relative shrink-0 w-12 h-12 rounded-2xl border flex items-center justify-center hover:opacity-80 transition shadow-sm ${theme.card.default}`}
              >
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />
                <Bell className={`w-6 h-6 ${theme.text.primary}`} />
                <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ede339] shadow-[0_0_0_4px_rgba(255,255,255,0.9)] border ${theme.text.secondary}`} />
              </button>
            </div>
          </motion.header>

          <div className="px-5 pb-10">
            {/* WELLNESS TIPS - TOP */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
              className="mb-5"
            >
              <h2 className={`text-sm font-semibold ${theme.text.primary} mb-3 px-1`}>
                Wellness Tips
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Tip 1 */}
                <motion.div
                  variants={floatIn}
                  className={`rounded-2xl border ${theme.card.default} backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 grid place-items-center border border-blue-200/50`}>
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold ${theme.text.primary}`}>
                        Stay Active
                      </div>
                      <div className={`mt-1 text-xs ${theme.text.secondary} leading-relaxed`}>
                        Aim for 6000 steps daily for steady energy.
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tip 2 */}
                <motion.div
                  variants={floatIn}
                  transition={{ delay: 0.03 }}
                  className={`rounded-2xl border ${theme.card.default} backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-sky-600 to-sky-500 grid place-items-center border border-sky-200/50`}>
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold ${theme.text.primary}`}>
                        Mind & Body
                      </div>
                      <div className={`mt-1 text-xs ${theme.text.secondary} leading-relaxed`}>
                        Short breathing breaks reduce stress and improve focus.
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tip 3 */}
                <motion.div
                  variants={floatIn}
                  transition={{ delay: 0.06 }}
                  className={`rounded-2xl border ${theme.card.default} backdrop-blur-sm p-4 shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 grid place-items-center border border-emerald-200/50`}>
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-bold ${theme.text.primary}`}>
                        Relax & Enjoy
                      </div>
                      <div className={`mt-1 text-xs ${theme.text.secondary} leading-relaxed`}>
                        Music breaks help recovery and reduce tension.
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* HERO */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`rounded-[34px] border backdrop-blur-xl overflow-hidden shadow-sm ${theme.card.default}`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-20 h-20 shrink-0">
                      <div className={`absolute inset-0 rounded-full border ${theme.text.secondary}`} />
                      <svg
                        viewBox="0 0 36 36"
                        className="absolute inset-0 w-full h-full -rotate-90"
                      >
                        <path
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(15,23,42,0.12)"
                          strokeWidth="3.2"
                        />
                        <path
                          d="M18 2.0845
                             a 15.9155 15.9155 0 0 1 0 31.831
                             a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={periodActive ? "#dc2626" : "#2563eb"}
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeDasharray={`${progress}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className={`text-xl font-extrabold ${theme.text.primary}`}>
                          {Math.round(progress)}%
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className={`text-[12px] uppercase tracking-wider ${theme.text.secondary} font-semibold`}>
                        Today
                      </div>
                      <div className={`mt-1 text-[26px] leading-tight font-extrabold ${theme.text.primary}`}>
                        {(Number(stepData.steps) || 0).toLocaleString()}
                        <span className={`text-sm font-semibold ${theme.text.secondary}`}>
                          {" "}
                          / {dailyGoal.toLocaleString()}
                        </span>
                      </div>
                      <div className={`mt-1 text-[12px] leading-relaxed ${theme.text.secondary}`}>
                        Keep moving. Small wins count.
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:grid grid-cols-2 gap-3 shrink-0">
                    <div className={`rounded-2xl border backdrop-blur-sm px-3 py-2 ${theme.card.default}`}>
                      <div className={`text-[11px] ${theme.text.secondary} font-semibold`}>
                        CAL
                      </div>
                      <div className={`text-base font-extrabold ${theme.text.primary}`}>
                        {Number(stepData.calories) || 0}
                      </div>
                    </div>
                    <div className={`rounded-2xl border backdrop-blur-sm px-3 py-2 ${theme.card.default}`}>
                      <div className={`text-[11px] ${theme.text.secondary} font-semibold`}>
                        KM
                      </div>
                      <div className={`text-base font-extrabold ${theme.text.primary}`}>
                        {Number(stepData.distance) || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className={`flex items-center justify-between text-xs ${theme.text.secondary}`}>
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className={`mt-2 w-full h-3 rounded-full overflow-hidden border ${theme.card.bordered}`}>
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative h-16">
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.background}`} />
              </div>
            </motion.section>

            {/* ACTION: Step tracker banner */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.08 }}
              onClick={() => setShowTracker(true)}
              className={`mt-5 rounded-[34px] text-slate-900 border backdrop-blur-xl shadow-sm overflow-hidden cursor-pointer ${theme.card.default}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowTracker(true);
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`text-[12px] font-semibold tracking-wide ${theme.text.secondary}`}>
                      STEPS TODAY
                    </div>
                    <div className={`mt-1 text-[30px] leading-tight font-extrabold tracking-tight ${theme.text.primary}`}>
                      {(Number(stepData.steps) || 0).toLocaleString()}
                    </div>
                    <div className={`mt-2 text-[13px] leading-relaxed ${theme.text.secondary}`}>
                      Tap to open tracker and edit your log
                    </div>
                  </div>

                  <div
                    className={`w-12 h-12 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-red-600/10 border-red-200 text-red-700' : 'bg-blue-600/10 border-blue-200 text-blue-700'}`}
                    aria-hidden="true"
                  >
                    <Footprints className="w-7 h-7" />
                  </div>
                </div>

                <div className={`mt-4 rounded-2xl border p-3 ${theme.card.bordered}`}>
                  <div className={`flex items-center justify-between text-[12px] font-semibold ${theme.text.secondary}`}>
                    <span>Goal</span>
                    <span>
                      {Math.round(progress)}% of {dailyGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full overflow-hidden border">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar} transition-all duration-500`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* STATS */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.12 }}
              className="mt-5 space-y-3"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className={`text-sm font-semibold ${theme.text.primary}`}>
                  Your Stats
                </h2>
                <span className={`text-xs ${theme.text.secondary}`}>Auto-saved</span>
              </div>

              <div className="space-y-3">
                <div className={`rounded-[26px] border overflow-hidden backdrop-blur-xl shadow-sm ${theme.card.default}`}>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <IconBadge Icon={Flame} className={periodActive ? "bg-red-500/10 border-red-200 text-red-700" : "bg-rose-500/10 border-rose-200 text-rose-700"} />
                      <div className="min-w-0">
                        <div className={`text-[11px] ${theme.text.secondary} font-semibold tracking-wide`}>
                          CALORIES BURNED
                        </div>
                        <div className={`mt-1 text-[22px] leading-tight font-extrabold ${theme.text.primary}`}>
                          {Number(stepData.calories) || 0}{" "}
                          <span className={`text-[13px] font-semibold ${theme.text.secondary}`}>
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme.text.secondary} shrink-0`} />
                  </div>
                  <div className={`h-[1px] ${periodActive ? 'bg-red-200/70' : 'bg-blue-200/70'}`} />
                </div>

                <div className={`rounded-[26px] border overflow-hidden backdrop-blur-xl shadow-sm ${theme.card.default}`}>
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <IconBadge Icon={MapPin} className={periodActive ? "bg-red-500/10 border-red-200 text-red-700" : "bg-blue-600/10 border-blue-200 text-blue-700"} />
                      <div className="min-w-0">
                        <div className={`text-[11px] ${theme.text.secondary} font-semibold tracking-wide`}>
                          DISTANCE
                        </div>
                        <div className={`mt-1 text-[22px] leading-tight font-extrabold ${theme.text.primary}`}>
                          {Number(stepData.distance) || 0}{" "}
                          <span className={`text-[13px] font-semibold ${theme.text.secondary}`}>
                            km
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${theme.text.secondary} shrink-0`} />
                  </div>
                  <div className={`h-[1px] ${periodActive ? 'bg-red-200/70' : 'bg-blue-200/70'}`} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-[26px] border p-4 backdrop-blur-xl shadow-sm ${theme.card.default}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`text-[11px] ${theme.text.secondary} font-semibold tracking-wide`}>
                          ACTIVE TIME
                        </div>
                        <div className={`mt-1 text-[20px] leading-tight font-extrabold ${theme.text.primary}`}>
                          {formatDuration(stepData.duration)}
                        </div>
                        <div className={`mt-1 text-[11px] ${theme.text.secondary} leading-relaxed`}>
                          minutes active
                        </div>
                      </div>
                      <div
                        className={`w-11 h-11 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-purple-600/10 border-purple-200 text-purple-700' : 'bg-purple-600/10 border-purple-200 text-purple-700'}`}
                        aria-hidden="true"
                      >
                        <Timer className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className={`rounded-[26px] border p-4 backdrop-blur-xl shadow-sm ${theme.card.default}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className={`text-[11px] ${theme.text.secondary} font-semibold tracking-wide`}>
                          GOAL
                        </div>
                        <div className={`mt-1 text-[20px] leading-tight font-extrabold ${theme.text.primary}`}>
                          {Math.round(progress)}%
                        </div>
                        <div className={`mt-1 text-[11px] ${theme.text.secondary} leading-relaxed`}>
                          to target
                        </div>
                      </div>
                      <div
                        className={`w-11 h-11 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-green-600/10 border-green-200 text-green-700' : 'bg-green-600/10 border-green-200 text-green-700'}`}
                        aria-hidden="true"
                      >
                        <Target className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* QUICK ACCESS */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.18 }}
              className="mt-6"
            >
              <div className="flex items-center justify-between px-1 mb-4">
                <div>
                  <h2 className={`text-lg font-bold ${theme.text.primary}`}>
                    Quick Access
                  </h2>
                  <p className={`text-xs ${theme.text.secondary} mt-0.5`}>
                    Curated for your wellness
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${periodActive ? 'text-red-700 bg-red-600/10 border border-red-200' : 'text-blue-700 bg-blue-600/10 border border-blue-200'}`}>
                  Premium
                </span>
              </div>

                <div className="mt-4 grid grid-cols-1 gap-4">
                  {/* MUSIC */}
                  <div
                    type="button"
                    variants={floatIn}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      y: -6,
                      boxShadow: `0 30px 60px ${periodActive ? 'rgba(220, 38, 38, 0.18)' : 'rgba(37, 99, 235, 0.18)'}`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => history.push("/music")}
                    className={`relative overflow-hidden rounded-4xl border p-7 text-left backdrop-blur-xl shadow-sm group active:scale-95 ${theme.card.default}`}
                  >
                    <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${periodActive ? 'bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0' : 'bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0'}`} />
                    <div className={`pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full blur-3xl opacity-70 ${periodActive ? 'bg-red-300/30' : 'bg-blue-300/30'}`} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className={`text-[10px] uppercase tracking-[0.15em] ${theme.text.secondary} font-black`}>
                          Mindfulness
                        </div>
                        <div className={`mt-3 text-[40px] leading-[1] font-black ${theme.text.primary} tracking-tight`}>
                          Music
                        </div>
                        <div className={`mt-4 text-[13px] leading-relaxed ${theme.text.secondary} max-w-[18rem] font-semibold`}>
                          Curated soundscapes for focus, calm and sleep
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-red-600/10 border-red-200 text-red-700' : 'bg-blue-600/10 border-blue-200 text-blue-700'}`}
                        aria-hidden="true"
                      >
                        <Music2 className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between relative z-10">
                      <div className="h-1 w-16 bg-slate-900/10 rounded-full" />
                      <ChevronRight className={`w-6 h-6 ${theme.text.secondary} group-hover:translate-x-2 transition-transform`} />
                    </div>
                  </div>

                  {/* QUIZ */}
                  <div
                    type="button"
                    variants={floatIn}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -5 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={()=>{history.push('/expert'), location.reload()}}          
                    className={`relative overflow-hidden rounded-[28px] border p-6 text-left backdrop-blur-xl shadow-sm group active:scale-95 ${theme.card.default}`}
                  >
                    <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${periodActive ? 'bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0' : 'bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0'}`} />
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className={`text-[10px] uppercase tracking-[0.12em] ${theme.text.secondary} font-black`}>
                          Fix anything from anywhere
                        </div>
                        <div className={`text-[24px] font-black ${theme.text.primary} leading-none`}>
                          Talk with Experts
                        </div>
                        <div className={`text-[12px] ${theme.text.secondary} font-semibold`}>
                         certified professionals
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-teal-600/10 border-teal-200 text-teal-700' : 'bg-teal-600/10 border-teal-200 text-teal-700'}`}
                        aria-hidden="true"
                      >
                        <HelpCircle className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between relative z-10">
                      <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                      <ChevronRight className={`w-6 h-6 ${theme.text.secondary} group-hover:translate-x-2 transition-transform`} />
                    </div>
                  </div>

                  {/* TRACK */}
                  <div  
                    type="button"
                    variants={floatIn}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      y: -6,
                      boxShadow: `0 30px 60px ${periodActive ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.18)'}`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowTracker(true)}
                    className={`relative overflow-hidden rounded-[28px] border p-6 text-left backdrop-blur-xl shadow-sm group active:scale-95 ${theme.card.default}`}
                  >
                    <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${periodActive ? 'bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0' : 'bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0'}`} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className={`text-[10px] uppercase tracking-[0.12em] ${theme.text.secondary} font-black`}>
                          Activity
                        </div>
                        <div className={`text-[24px] font-black ${theme.text.primary} leading-none`}>
                          Track
                        </div>
                        <div className={`text-[12px] ${theme.text.secondary} font-semibold`}>
                          Log activity
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-indigo-600/10 border-indigo-200 text-indigo-700' : 'bg-indigo-600/10 border-indigo-200 text-indigo-700'}`}
                        aria-hidden="true"
                      >
                        <BarChart3 className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between relative z-10">
                      <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                      <ChevronRight className={`w-6 h-6 ${theme.text.secondary} group-hover:translate-x-2 transition-transform`} />
                    </div>
                  </div>

                  {/* JOKES */}
                  <div
                    type="button"
                    variants={floatIn}
                    initial="hidden"
                    animate="visible"
                    whileHover={{
                      y: -6,
                      boxShadow: `0 30px 60px ${periodActive ? 'rgba(220, 38, 38, 0.18)' : 'rgba(244, 63, 94, 0.16)'}`,
                    }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowJoke(true)}
                    className={`relative overflow-hidden rounded-[28px] border p-6 text-left backdrop-blur-xl shadow-sm group active:scale-95 ${theme.card.default}`}
                  >
                    <div className={`pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${periodActive ? 'bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0' : 'bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0'}`} />

                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <div className="min-w-0 space-y-2">
                        <div className={`text-[10px] uppercase tracking-[0.12em] ${theme.text.secondary} font-black`}>
                          Your Companion
                        </div>
                        <div className={`text-[24px] font-black ${theme.text.primary} leading-none`}>
                          Bliss Ai
                        </div>
                        <div className={`text-[12px] ${theme.text.secondary} font-semibold`}>
                          Best Buddy
                        </div>
                      </div>
                      <div
                        className={`w-12 h-12 shrink-0 rounded-2xl border grid place-items-center ${periodActive ? 'bg-rose-600/10 border-rose-200 text-rose-700' : 'bg-rose-600/10 border-rose-200 text-rose-700'}`}
                        aria-hidden="true"
                      >
                        <Laugh className="w-7 h-7" />
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between relative z-10">
                      <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                      <ChevronRight className={`w-6 h-6 ${theme.text.secondary} group-hover:translate-x-2 transition-transform`} />
                    </div>
                  </div>
                </div>
            </motion.section>
          </div>

          {/* Modals */}
          {/* <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} /> */}
          <StepTrackerModal
            isOpen={showTracker}
            onClose={() => setShowTracker(false)}
          />
          <JokeModal isOpen={showJoke} onClose={() => setShowJoke(false)} />
        </div>
      </div>
    </PageLayout>
  );
};

export default Activities;
