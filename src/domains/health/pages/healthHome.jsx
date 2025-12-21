import React, { useMemo } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { usePeriodPrediction } from "@/domains/health/hooks/usePeriodPrediction";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { Bell, MapPin, Phone, TrendingUp } from "lucide-react";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HealthHome = () => {
  const userData = getUserData();
  const userName = userData?.name || "Sarah";
  const { nextPeriod, currentPhase, hasPeriodData, loading } =
    usePeriodPrediction();

  // Memoize week calculations
  const { weekDays, today } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekDays = [];
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }
    return { weekDays, today };
  }, []);

  const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <PageLayout>
      <ColorBg />

      <div className="relative bg-black text-gray-100">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-6 pb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Hi, {userName}
              </h1>
              <p className="text-sm text-gray-400 mt-1">Today's health insights</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition">
              <Bell className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </motion.header>

        <div className="px-5 space-y-6">
          {/* Progress Overview - Simple Progress Bar */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div>
              <p className="text-sm text-gray-400 mb-2">Cycle Progress</p>
              <p className="text-5xl font-bold text-white">
                {Math.min(nextPeriod?.daysUntil || 0, 100)}%
              </p>
            </div>
            <div className="w-full h-4 bg-gray-500 rounded-full overflow-hidden border-2 border-black flex">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${Math.min(nextPeriod?.daysUntil || 0, 100)}%` }}
              />
            </div>
          </motion.section>

          {/* Main Phase Card - Yellow/Vibrant */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="rounded-[50px] bg-[#ede339] p-6 border border-yellow-200/50 relative overflow-hidden cursor-pointer hover:border-yellow-300/70 transition-all"
          >
            {/* Decorative star */}
            <div className="absolute top-4 right-6 text-4xl opacity-80">✨</div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                {currentPhase?.name || "Follicular"} Phase
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                {currentPhase?.description || "Time to boost energy and activity"}
              </p>

              {/* Day info - moved up */}
              <p className="text-xs text-gray-900 font-semibold mb-4">
                Day {currentPhase?.dayInCycle || 1} of {currentPhase?.cycleDays || 28}
              </p>

              {/* Slider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2 bg-black rounded-full px-4 py-2">
                  <div className="w-4 h-4 rounded-full bg-white" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={currentPhase?.percentComplete || 50}
                    className="flex-1 accent-gray-900 opacity-50"
                    disabled
                  />
                  <div className="w-4 h-4 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pink - Quick Log Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="rounded-[60px] bg-[#de699f] p-6 border border-pink-400/30 text-white cursor-pointer hover:border-pink-300/60 transition-all"
            >
              <div className="text-3xl mb-2">📝</div>
              <h3 className="text-sm font-bold text-white mb-1">Quick Log</h3>
              <p className="text-xs text-white/70 mb-3">Track your symptoms</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">Flow</span>
                  <span className="font-semibold">Light</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">Mood</span>
                  <span className="font-semibold">Good</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">Energy</span>
                  <span className="font-semibold">High</span>
                </div>
              </div>
            </motion.section>

            {/* Blue - Wellness Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
              className="rounded-[60px] bg-gradient-to-br from-blue-500 to-blue-600 p-6 border border-blue-400/30 text-white cursor-pointer hover:border-blue-300/60 transition-all"
            >
              <div className="text-3xl mb-2">🧘</div>
              <h3 className="text-sm font-bold text-white mb-1">Wellness</h3>
              <p className="text-xs text-white/70 mb-3">Today's tips</p>
              <div className="space-y-2">
                <div className="text-xs text-white/80">✓ Light yoga</div>
                <div className="text-xs text-white/80">✓ Stay hydrated</div>
                <div className="text-xs text-white/80">✓ Get good sleep</div>
              </div>
            </motion.section>
          </div>

          {/* Week Overview - Green Card */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
            className="rounded-[50px] bg-gradient-to-br from-green-500 to-green-600 p-6 border border-green-400/30"
          >
            <h3 className="text-lg font-bold text-white mb-4">Week Overview</h3>
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date, idx) => {
                const isToday = date.toDateString() === today.toDateString();
                const dayNum = date.getDate();

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center rounded-lg py-2 transition-all font-semibold text-xs ${
                      isToday
                        ? "bg-white/30 ring-2 ring-white"
                        : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <span className="text-green-50 mb-1">
                      {WEEK_DAYS[idx]}
                    </span>
                    <span className="text-white">
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Period Timeline - Purple Card */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.45 }}
            className="rounded-[50px] bg-gradient-to-br from-purple-600 to-purple-700 p-6 border border-purple-500/30"
          >
            <h3 className="text-lg font-bold text-white mb-2">Period Timeline</h3>
            <p className="text-xs text-white/80 mb-3">Next period in</p>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold text-white">
                {nextPeriod?.daysUntil || 0}
              </div>
              <div className="text-xs text-white/70">days</div>
            </div>
            <div className="w-full h-1 bg-purple-900/40 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-gradient-to-r from-pink-400 to-purple-300 rounded-full transition-all"
                style={{ width: `${Math.min(nextPeriod?.daysUntil || 0, 100)}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-3">
              📍 Low chance of pregnancy
            </p>
          </motion.section>

          {/* Tips Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Orange - Nutrition */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
              className="rounded-[40px] bg-gradient-to-br from-orange-500 to-orange-600 p-5 border border-orange-400/30 cursor-pointer hover:border-orange-300/60 transition-all"
            >
              <div className="text-3xl mb-2">🥗</div>
              <h4 className="text-sm font-bold text-white mb-2">Nutrition</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Iron-rich foods boost energy
              </p>
            </motion.section>

            {/* Teal - Activity */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.55 }}
              className="rounded-[40px] bg-gradient-to-br from-teal-500 to-teal-600 p-5 border border-teal-400/30 cursor-pointer hover:border-teal-300/60 transition-all"
            >
              <div className="text-3xl mb-2">🏃</div>
              <h4 className="text-sm font-bold text-white mb-2">Activity</h4>
              <p className="text-xs text-white/80 leading-relaxed">
                Light exercise eases discomfort
              </p>
            </motion.section>
          </div>

          {/* Journal Section - Indigo Card */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
            className="rounded-[40px] bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 border border-indigo-500/30 cursor-pointer hover:border-indigo-400/60 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Journal</h3>
                <p className="text-xs text-white/70 mt-1">
                  How are you feeling?
                </p>
              </div>
              <div className="text-4xl group-hover:translate-x-1 transition-transform">
                📔
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(HealthHome);