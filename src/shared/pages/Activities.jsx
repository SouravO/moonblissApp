import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
import PageLayout from "../layout/PageLayout";
import ColorBg from "@/components/ColorBg";
import QuizModal from "../../domains/quiz/components/QuizModal";
import StepTrackerModal from "../../domains/tracker/components/StepTrackerModal";
import MoodTracker from "../../domains/moodTracker/MoodTracker";
import JokeModal from "../../domains/Joke/JokeModal";
import { Bell, ChevronRight } from "lucide-react";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const floatIn = {
  hidden: { opacity: 0, y: 10, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

// Move QuickTile outside the component
const QuickTile = ({ title, sub, emoji, className, onClick }) => (
  <motion.button
    type="button"
    variants={floatIn}
    initial="hidden"
    animate="visible"
    whileHover={{ y: -3 }}
    whileTap={{ scale: 0.985 }}
    onClick={onClick}
    className={[
      "relative w-full text-left overflow-hidden",
      "rounded-[28px] p-5 border",
      "shadow-[0_18px_50px_-30px_rgba(0,0,0,0.8)]",
      "transition-all",
      className,
    ].join(" ")}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[12px] text-white/70 font-semibold tracking-wide">
          {sub}
        </div>
        <div className="mt-1 text-[18px] leading-snug font-extrabold text-white tracking-tight">
          {title}
        </div>
      </div>
      <div className="text-3xl leading-none">{emoji}</div>
    </div>

    <div className="mt-5 flex items-center justify-between">
      <div className="h-[2px] w-12 bg-white/25 rounded-full" />
      <ChevronRight className="w-5 h-5 text-white/70" />
    </div>

    <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-white/12 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-black/20 blur-2xl" />
  </motion.button>
);

const Activities = () => {
  const history = useHistory();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
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
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const dailyGoal = 6000;
  const progress = useMemo(
    () => Math.min((stepData.steps / dailyGoal) * 100, 100),
    [stepData.steps]
  );

  useBackHandler(() => {
    if (showQuiz) return setShowQuiz(false);
    if (showTracker) return setShowTracker(false);
    if (showMoodTracker) return setShowMoodTracker(false);
    if (showJoke) return setShowJoke(false);
  });

  return (
    <PageLayout>
      <ColorBg />

      <div className="relative min-h-screen bg-[#1a43bf] text-gray-100">
        {/* Top App Bar */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-6 pb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Activities
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Track your wellness journey
              </p>
            </div>

            <button className="relative w-12 h-12 rounded-2xl bg-neutral-900/70 border border-white/10 flex items-center justify-center hover:bg-neutral-800 transition">
              <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
              <Bell className="w-6 h-6 text-gray-200" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#ede339] shadow-[0_0_0_4px_rgba(0,0,0,0.6)]" />
            </button>
          </div>
        </motion.header>

        <div className="px-5 pb-10">
          {/* HERO: progress ring + stats */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="rounded-[34px] border border-white/10 bg-neutral-900/60 backdrop-blur-xl overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full bg-neutral-950 border border-white/10" />
                    <svg
                      viewBox="0 0 36 36"
                      className="absolute inset-0 w-full h-full -rotate-90"
                    >
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="rgba(255,255,255,0.10)"
                        strokeWidth="3.2"
                      />
                      <path
                        d="M18 2.0845
                           a 15.9155 15.9155 0 0 1 0 31.831
                           a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#ede339"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        strokeDasharray={`${progress}, 100`}
                      />
                    </svg>
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-xl font-extrabold text-white">
                        {Math.round(progress)}%
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[12px] uppercase tracking-wider text-white/60 font-semibold">
                      Today
                    </div>
                    <div className="mt-1 text-[26px] leading-tight font-extrabold text-white">
                      {stepData.steps.toLocaleString()}
                      <span className="text-sm font-semibold text-white/50">
                        {" "}
                        / {dailyGoal.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 text-[12px] leading-relaxed text-white/55">
                      Keep moving. Small wins count.
                    </div>
                  </div>
                </div>

                <div className="hidden sm:grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <div className="text-[11px] text-white/55 font-semibold">
                      CAL
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {stepData.calories}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
                    <div className="text-[11px] text-white/55 font-semibold">
                      KM
                    </div>
                    <div className="text-base font-extrabold text-white">
                      {stepData.distance}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="mt-2 w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full bg-[#ede339] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="relative h-16">
              <div className="absolute inset-0 bg-gradient-to-r from-[#ede339]/25 via-pink-500/10 to-blue-500/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
            </div>
          </motion.section>

          {/* ACTION: big step card as a horizontal banner */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            onClick={() => setShowTracker(true)}
            className="mt-5 rounded-[34px] bg-[#ede339] text-gray-900 border border-yellow-200/50 overflow-hidden cursor-pointer"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[12px] font-semibold text-gray-800/80 tracking-wide">
                    STEPS TODAY
                  </div>
                  <div className="mt-1 text-[30px] leading-tight font-extrabold tracking-tight">
                    {stepData.steps.toLocaleString()}
                  </div>
                  <div className="mt-2 text-[13px] leading-relaxed text-gray-800/80">
                    Tap to open tracker and edit your log
                  </div>
                </div>
                <div className="text-4xl opacity-90">👟</div>
              </div>

              <div className="mt-4 rounded-2xl bg-black/10 border border-black/10 p-3">
                <div className="flex items-center justify-between text-[12px] font-semibold text-gray-800/80">
                  <span>Goal</span>
                  <span>
                    {Math.round(progress)}% of {dailyGoal.toLocaleString()}
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-black/15 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black/70 transition-all duration-500"
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
              <h2 className="text-sm font-semibold text-white/90">Your Stats</h2>
              <span className="text-xs text-white/45">Auto-saved</span>
            </div>

            <div className="space-y-3">
              <div className="rounded-[26px] bg-[#de699f] border border-pink-400/30 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 grid place-items-center text-2xl">
                      🔥
                    </div>
                    <div>
                      <div className="text-[11px] text-white/70 font-semibold tracking-wide">
                        CALORIES BURNED
                      </div>
                      <div className="mt-1 text-[22px] leading-tight font-extrabold text-white">
                        {stepData.calories}{" "}
                        <span className="text-[13px] font-semibold text-white/60">
                          kcal
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </div>
                <div className="h-[2px] bg-white/12" />
              </div>

              <div className="rounded-[26px] bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400/30 overflow-hidden">
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 grid place-items-center text-2xl">
                      📍
                    </div>
                    <div>
                      <div className="text-[11px] text-white/70 font-semibold tracking-wide">
                        DISTANCE
                      </div>
                      <div className="mt-1 text-[22px] leading-tight font-extrabold text-white">
                        {stepData.distance}{" "}
                        <span className="text-[13px] font-semibold text-white/60">
                          km
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/70" />
                </div>
                <div className="h-[2px] bg-white/12" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[26px] bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-500/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-white/70 font-semibold tracking-wide">
                        ACTIVE TIME
                      </div>
                      <div className="mt-1 text-[20px] leading-tight font-extrabold text-white">
                        {formatDuration(stepData.duration)}
                      </div>
                      <div className="mt-1 text-[11px] text-white/55 leading-relaxed">
                        minutes active
                      </div>
                    </div>
                    <div className="text-2xl">⏱️</div>
                  </div>
                </div>

                <div className="rounded-[26px] bg-gradient-to-br from-green-500 to-green-600 border border-green-400/30 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-white/70 font-semibold tracking-wide">
                        GOAL
                      </div>
                      <div className="mt-1 text-[20px] leading-tight font-extrabold text-white">
                        {Math.round(progress)}%
                      </div>
                      <div className="mt-1 text-[11px] text-white/55 leading-relaxed">
                        to target
                      </div>
                    </div>
                    <div className="text-2xl">🎯</div>
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
                <h2 className="text-lg font-bold text-white">
                  Quick Access
                </h2>
                <p className="text-xs text-white/50 mt-0.5">Curated for your wellness</p>
              </div>
              <span className="text-xs font-semibold text-blue-400/80 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20">
                Premium
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {/* MUSIC: premium card with enhanced styling */}
              <motion.button
                type="button"
                variants={floatIn}
                initial="hidden"
                animate="visible"
                whileHover={{ y: -6, boxShadow: "0 30px 60px rgba(249, 115, 22, 0.3)" }}
                whileTap={{ scale: 0.96 }}
                onClick={() => history.push("/music")}
                className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-orange-500 to-orange-600 border-2 border-orange-300/60 p-7 text-left backdrop-blur-xl shadow-xl shadow-orange-600/25 group active:scale-95"
              >
                {/* Premium shine effect */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Animated gradient background */}
                <div className="pointer-events-none absolute -inset-px rounded-[36px] bg-gradient-to-r from-orange-400/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="min-w-0 p-4 rounded-[50px]">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-white/85 font-black">
                      Mindfulness
                    </div>
                    <div className="mt-3 text-[40px] leading-[1] font-black text-white tracking-tight">
                      Music
                    </div>
                    <div className="mt-4 text-[13px] leading-relaxed text-white/90 max-w-[18rem] font-semibold">
                      Curated soundscapes for focus, calm & sleep
                    </div>

                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between relative z-10">
                  <div className="h-1 w-16 bg-white/40 rounded-full" />
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
                </div>

                {/* Gradient orb */}
                <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-orange-300/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.button>

              {/* Two premium tiles row */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.14 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="relative h-full rounded-[36px] bg-gradient-to-br from-teal-500 to-teal-600 border-2 border-teal-300/60 p-6 text-left backdrop-blur-xl shadow-xl shadow-teal-600/25 cursor-pointer overflow-hidden active:scale-95 transition-transform"
                    onClick={() => setShowQuiz(true)}>
                    {/* Premium shine */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.12em] text-white/90 font-black">
                            Challenge
                          </div>
                          <div className="mt-2 text-[28px] font-black text-white leading-none">
                            Quiz
                          </div>
                        </div>
                        <div className="text-4xl group-hover:scale-125 transition-transform">❓</div>
                      </div>
                      <p className="text-[12px] text-white/85 font-semibold">Test & learn</p>
                      <div className="h-1 w-10 bg-white/30 rounded-full" />
                    </div>
                    
                    <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-teal-300/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>

                <motion.div
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.16 }}
                  whileHover={{ y: -5 }}
                  className="group"
                >
                  <div className="relative h-full rounded-[36px] bg-gradient-to-br from-pink-500 to-pink-600 border-2 border-pink-300/60 p-6 text-left backdrop-blur-xl shadow-xl shadow-pink-600/25 cursor-pointer overflow-hidden active:scale-95 transition-transform"
                    onClick={() => setShowMoodTracker(true)}>
                    {/* Premium shine */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-[0.12em] text-white/90 font-black">
                            Wellness
                          </div>
                          <div className="mt-2 text-[28px] font-black text-white leading-none">
                            Mood
                          </div>
                        </div>
                        <div className="text-4xl group-hover:scale-125 transition-transform">😊</div>
                      </div>
                      <p className="text-[12px] text-white/85 font-semibold">Check in</p>
                      <div className="h-1 w-10 bg-white/30 rounded-full" />
                    </div>
                    
                    <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-pink-300/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </motion.div>
              </div>

              {/* TRACK + JOKES + GAMES: premium grid */}
              <div className="grid grid-cols-5 gap-4">
                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, boxShadow: "0 30px 60px rgba(102, 51, 153, 0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowTracker(true)}
                  className="col-span-2 relative overflow-hidden rounded-[36px] bg-gradient-to-br from-indigo-600 to-indigo-700 border-2 border-indigo-400/60 p-6 text-left backdrop-blur-xl shadow-xl shadow-indigo-700/30 group active:scale-95"
                >
                  {/* Premium shine */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="text-4xl group-hover:scale-125 transition-transform">📊</div>
                    <div className="text-[24px] font-black text-white leading-none">Track</div>
                    <div className="text-[12px] text-white/85 font-semibold">Log activity</div>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className="h-1 w-10 bg-white/30 rounded-full" />
                    <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-2 transition-transform" />
                  </div>
                  
                  <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-indigo-400/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>

                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, boxShadow: "0 30px 60px rgba(244, 63, 94, 0.3)" }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowJoke(true)}
                  className="col-span-2 relative overflow-hidden rounded-[36px] bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 border-2 border-rose-300/60 p-6 text-left backdrop-blur-xl shadow-xl shadow-rose-600/30 group active:scale-95"
                >
                  {/* Premium shine */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 space-y-3">
                    <div className="text-[9px] uppercase tracking-[0.12em] text-white/90 font-black">
                      Boost Mood
                    </div>
                    <div className="text-[24px] font-black text-white leading-none">Jokes</div>
                    <div className="text-[12px] text-white/85 font-semibold">Quick laughs</div>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between relative z-10">
                    <div className="h-1 w-10 bg-white/30 rounded-full" />
                    <div className="text-3xl group-hover:scale-125 transition-transform">😂</div>
                  </div>
                  
                  <div className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full bg-rose-400/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>

                <motion.button
                  type="button"
                  variants={floatIn}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => alert("Game feature coming soon!")}
                  className="col-span-1 relative overflow-hidden rounded-[36px] bg-gradient-to-br from-purple-600 to-purple-700 border-2 border-purple-400/60 p-6 text-left backdrop-blur-xl shadow-xl shadow-purple-700/30 flex flex-col items-center justify-center group cursor-pointer active:scale-95"
                >
                  {/* Premium shine */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="text-4xl leading-none group-hover:scale-125 transition-transform">🎮</div>
                    <div className="text-[13px] leading-tight font-black text-white">Games</div>
                    <div className="text-[10px] text-white/75 font-semibold">Coming</div>
                  </div>

                  <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-purple-400/30 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.button>
              </div>
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
              <h2 className="text-sm font-semibold text-white/90">
                Wellness Tips
              </h2>
              <span className="text-xs text-white/45">Daily</span>
            </div>

            <div className="mt-3 space-y-3">
              <div className="rounded-[28px] border border-white/10 bg-neutral-900/60 backdrop-blur-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#ede339] text-black grid place-items-center text-2xl">
                    🎯
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white">
                      Stay Active
                    </div>
                    <div className="mt-1 text-xs text-white/65 leading-relaxed">
                      Aim for 6000 steps daily for steady energy.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-blue-400/20 bg-gradient-to-br from-blue-500/30 to-blue-600/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500 text-white grid place-items-center text-2xl">
                    🧘
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white">
                      Mind and Body
                    </div>
                    <div className="mt-1 text-xs text-white/75 leading-relaxed">
                      Use mood tracking to notice patterns and adjust.
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-green-400/20 bg-gradient-to-br from-green-500/25 to-green-600/25 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-green-500 text-white grid place-items-center text-2xl">
                    🎵
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-extrabold text-white">
                      Relax and Enjoy
                    </div>
                    <div className="mt-1 text-xs text-white/75 leading-relaxed">
                      Music breaks help recovery and reduce stress.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
        <StepTrackerModal
          isOpen={showTracker}
          onClose={() => setShowTracker(false)}
        />
        <MoodTracker
          isOpen={showMoodTracker}
          onClose={() => setShowMoodTracker(false)}
        />
        <JokeModal isOpen={showJoke} onClose={() => setShowJoke(false)} />
      </div>
    </PageLayout>
  );
};

export default Activities;