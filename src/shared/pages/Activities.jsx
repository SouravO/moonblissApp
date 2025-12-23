import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../layout/PageLayout";
import ColorBg from "@/components/ColorBg";
import QuizModal from "../../domains/quiz/components/QuizModal";
import StepTrackerModal from "../../domains/tracker/components/StepTrackerModal";
import JokeModal from "../../domains/Joke/JokeModal";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";
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

      {/* Light blue-white animated gradient background */}
      <div className="relative min-h-screen text-slate-900 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f7fbff] via-[#eaf4ff] to-[#ffffff]" />

        {/* Animated aurora layers */}
        <motion.div
          aria-hidden="true"
          className="absolute -top-24 -left-24 h-[380px] w-[380px] rounded-full bg-gradient-to-br from-sky-300/40 via-cyan-200/20 to-white/10 blur-3xl"
          animate={{ x: [0, 40, -10, 0], y: [0, 20, 55, 0], scale: [1, 1.08, 0.98, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute -bottom-28 -right-28 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-blue-300/35 via-indigo-200/15 to-white/10 blur-3xl"
          animate={{ x: [0, -35, 15, 0], y: [0, -25, -50, 0], scale: [1, 1.06, 0.97, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute top-24 right-10 h-[260px] w-[260px] rounded-full bg-gradient-to-br from-cyan-200/30 via-sky-200/20 to-white/10 blur-2xl"
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
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Activities
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Track your wellness journey
                </p>
              </div>

              <button
                type="button"
                aria-label="Notifications"
                className="relative shrink-0 w-12 h-12 rounded-2xl bg-white/70 border border-slate-200 flex items-center justify-center hover:bg-white transition shadow-[0_10px_30px_-18px_rgba(15,23,42,0.35)]"
              >
                <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white to-transparent" />
                <Bell className="w-6 h-6 text-slate-700" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ede339] shadow-[0_0_0_4px_rgba(255,255,255,0.9)] border border-slate-200" />
              </button>
            </div>
          </motion.header>

          <div className="px-5 pb-10">
            {/* HERO */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-[34px] border border-white/60 bg-white/55 backdrop-blur-xl overflow-hidden shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)]"
            >
              <div className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-20 h-20 shrink-0">
                      <div className="absolute inset-0 rounded-full bg-white border border-slate-200" />
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
                          stroke="#2563eb"
                          strokeWidth="3.2"
                          strokeLinecap="round"
                          strokeDasharray={`${progress}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 grid place-items-center">
                        <div className="text-xl font-extrabold text-slate-900">
                          {Math.round(progress)}%
                        </div>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="text-[12px] uppercase tracking-wider text-slate-500 font-semibold">
                        Today
                      </div>
                      <div className="mt-1 text-[26px] leading-tight font-extrabold text-slate-900">
                        {(Number(stepData.steps) || 0).toLocaleString()}
                        <span className="text-sm font-semibold text-slate-500">
                          {" "}
                          / {dailyGoal.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 text-[12px] leading-relaxed text-slate-600">
                        Keep moving. Small wins count.
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:grid grid-cols-2 gap-3 shrink-0">
                    <div className="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        CAL
                      </div>
                      <div className="text-base font-extrabold text-slate-900">
                        {Number(stepData.calories) || 0}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2">
                      <div className="text-[11px] text-slate-500 font-semibold">
                        KM
                      </div>
                      <div className="text-base font-extrabold text-slate-900">
                        {Number(stepData.distance) || 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-2 w-full h-3 rounded-full bg-slate-200/70 overflow-hidden border border-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="relative h-16">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-200/70 via-white/60 to-blue-200/70" />
                <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent" />
              </div>
            </motion.section>

            {/* ACTION: Step tracker banner */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.08 }}
              onClick={() => setShowTracker(true)}
              className="mt-5 rounded-[34px] bg-white/70 text-slate-900 border border-white/60 overflow-hidden cursor-pointer backdrop-blur-xl shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowTracker(true);
              }}
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-slate-600 tracking-wide">
                      STEPS TODAY
                    </div>
                    <div className="mt-1 text-[30px] leading-tight font-extrabold tracking-tight text-slate-900">
                      {(Number(stepData.steps) || 0).toLocaleString()}
                    </div>
                    <div className="mt-2 text-[13px] leading-relaxed text-slate-600">
                      Tap to open tracker and edit your log
                    </div>
                  </div>

                  <div
                    className="w-12 h-12 shrink-0 rounded-2xl bg-blue-600/10 border border-blue-200 grid place-items-center"
                    aria-hidden="true"
                  >
                    <Footprints className="w-7 h-7 text-blue-700" />
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-100/70 border border-slate-200 p-3">
                  <div className="flex items-center justify-between text-[12px] font-semibold text-slate-600">
                    <span>Goal</span>
                    <span>
                      {Math.round(progress)}% of {dailyGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-200/80 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-700 transition-all duration-500"
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
                <h2 className="text-sm font-semibold text-slate-900">
                  Your Stats
                </h2>
                <span className="text-xs text-slate-500">Auto-saved</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-[26px] bg-white/60 border border-white/60 overflow-hidden backdrop-blur-xl shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <IconBadge Icon={Flame} className="bg-rose-500/10 border-rose-200 text-rose-700" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                          CALORIES BURNED
                        </div>
                        <div className="mt-1 text-[22px] leading-tight font-extrabold text-slate-900">
                          {Number(stepData.calories) || 0}{" "}
                          <span className="text-[13px] font-semibold text-slate-500">
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                  <div className="h-[1px] bg-slate-200/70" />
                </div>

                <div className="rounded-[26px] bg-white/60 border border-white/60 overflow-hidden backdrop-blur-xl shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <IconBadge Icon={MapPin} className="bg-blue-600/10 border-blue-200 text-blue-700" />
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                          DISTANCE
                        </div>
                        <div className="mt-1 text-[22px] leading-tight font-extrabold text-slate-900">
                          {Number(stepData.distance) || 0}{" "}
                          <span className="text-[13px] font-semibold text-slate-500">
                            km
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                  <div className="h-[1px] bg-slate-200/70" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[26px] bg-white/60 border border-white/60 p-4 backdrop-blur-xl shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                          ACTIVE TIME
                        </div>
                        <div className="mt-1 text-[20px] leading-tight font-extrabold text-slate-900">
                          {formatDuration(stepData.duration)}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                          minutes active
                        </div>
                      </div>
                      <div
                        className="w-11 h-11 shrink-0 rounded-2xl bg-purple-600/10 border border-purple-200 grid place-items-center"
                        aria-hidden="true"
                      >
                        <Timer className="w-6 h-6 text-purple-700" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[26px] bg-white/60 border border-white/60 p-4 backdrop-blur-xl shadow-[0_18px_50px_-38px_rgba(15,23,42,0.35)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] text-slate-500 font-semibold tracking-wide">
                          GOAL
                        </div>
                        <div className="mt-1 text-[20px] leading-tight font-extrabold text-slate-900">
                          {Math.round(progress)}%
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500 leading-relaxed">
                          to target
                        </div>
                      </div>
                      <div
                        className="w-11 h-11 shrink-0 rounded-2xl bg-green-600/10 border border-green-200 grid place-items-center"
                        aria-hidden="true"
                      >
                        <Target className="w-6 h-6 text-green-700" />
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
                  <h2 className="text-lg font-bold text-slate-900">
                    Quick Access
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Curated for your wellness
                  </p>
                </div>
                <span className="text-xs font-semibold text-blue-700 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-200">
                  Premium
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                {/* MUSIC */}
                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -6,
                    boxShadow: "0 30px 60px rgba(37, 99, 235, 0.18)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => history.push("/music")}
                  className="relative overflow-hidden rounded-[32px] bg-white/70 border border-white/70 p-7 text-left backdrop-blur-xl shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)] group active:scale-95"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="pointer-events-none absolute -top-24 -right-24 h-60 w-60 rounded-full bg-blue-300/30 blur-3xl opacity-70" />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 font-black">
                        Mindfulness
                      </div>
                      <div className="mt-3 text-[40px] leading-[1] font-black text-slate-900 tracking-tight">
                        Music
                      </div>
                      <div className="mt-4 text-[13px] leading-relaxed text-slate-600 max-w-[18rem] font-semibold">
                        Curated soundscapes for focus, calm and sleep
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 shrink-0 rounded-2xl bg-blue-600/10 border border-blue-200 grid place-items-center"
                      aria-hidden="true"
                    >
                      <Music2 className="w-7 h-7 text-blue-700" />
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-between relative z-10">
                    <div className="h-1 w-16 bg-slate-900/10 rounded-full" />
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>

                {/* QUIZ */}
                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowQuiz(true)}
                  className="relative overflow-hidden rounded-[28px] bg-white/70 border border-white/70 p-6 text-left backdrop-blur-xl shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)] group active:scale-95"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-black">
                        Challenge
                      </div>
                      <div className="text-[24px] font-black text-slate-900 leading-none">
                        Quiz
                      </div>
                      <div className="text-[12px] text-slate-600 font-semibold">
                        Test and learn
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 shrink-0 rounded-2xl bg-teal-600/10 border border-teal-200 grid place-items-center"
                      aria-hidden="true"
                    >
                      <HelpCircle className="w-7 h-7 text-teal-700" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>

                {/* TRACK */}
                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -6,
                    boxShadow: "0 30px 60px rgba(99, 102, 241, 0.18)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowTracker(true)}
                  className="relative overflow-hidden rounded-[28px] bg-white/70 border border-white/70 p-6 text-left backdrop-blur-xl shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)] group active:scale-95"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-black">
                        Activity
                      </div>
                      <div className="text-[24px] font-black text-slate-900 leading-none">
                        Track
                      </div>
                      <div className="text-[12px] text-slate-600 font-semibold">
                        Log activity
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-600/10 border border-indigo-200 grid place-items-center"
                      aria-hidden="true"
                    >
                      <BarChart3 className="w-7 h-7 text-indigo-700" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>

                {/* JOKES */}
                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    y: -6,
                    boxShadow: "0 30px 60px rgba(244, 63, 94, 0.16)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowJoke(true)}
                  className="relative overflow-hidden rounded-[28px] bg-white/70 border border-white/70 p-6 text-left backdrop-blur-xl shadow-[0_22px_60px_-35px_rgba(15,23,42,0.35)] group active:scale-95"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-slate-500 font-black">
                        Quick Reset
                      </div>
                      <div className="text-[24px] font-black text-slate-900 leading-none">
                        Jokes
                      </div>
                      <div className="text-[12px] text-slate-600 font-semibold">
                        Lighten up
                      </div>
                    </div>
                    <div
                      className="w-12 h-12 shrink-0 rounded-2xl bg-rose-600/10 border border-rose-200 grid place-items-center"
                      aria-hidden="true"
                    >
                      <Laugh className="w-7 h-7 text-rose-700" />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className="h-1 w-10 bg-slate-900/10 rounded-full" />
                    <ChevronRight className="w-6 h-6 text-slate-400 group-hover:translate-x-2 transition-transform" />
                  </div>
                </motion.button>
              </div>
            </motion.section>

            {/* WELLNESS */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.22 }}
              className="mt-7"
            >
              <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  Wellness Tips
                </h2>
                <span className="text-xs text-slate-500">Daily</span>
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-[28px] border border-white/70 bg-white/60 backdrop-blur-xl p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-3">
                    <IconBadge Icon={Target} className="bg-blue-600/10 text-blue-700 border-blue-200" />
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        Stay Active
                      </div>
                      <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Aim for 6000 steps daily for steady energy.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/60 backdrop-blur-xl p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-3">
                    <IconBadge Icon={Brain} className="bg-sky-600/10 text-sky-700 border-sky-200" />
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        Mind and Body
                      </div>
                      <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Short breathing breaks reduce stress and improve focus.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/70 bg-white/60 backdrop-blur-xl p-4 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.35)]">
                  <div className="flex items-start gap-3">
                    <IconBadge Icon={Sparkles} className="bg-emerald-600/10 text-emerald-700 border-emerald-200" />
                    <div className="min-w-0">
                      <div className="text-sm font-extrabold text-slate-900">
                        Relax and Enjoy
                      </div>
                      <div className="mt-1 text-xs text-slate-600 leading-relaxed">
                        Music breaks help recovery and reduce tension.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Modals */}
          <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
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
