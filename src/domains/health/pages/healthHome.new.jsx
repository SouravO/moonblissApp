import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { usePeriodPrediction } from "@/domains/health/hooks/usePeriodPrediction";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { Bell } from "lucide-react";

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

  // Get current week dates
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

  const WEEK_DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <PageLayout title="Health">
      <ColorBg />

      <div className="relative min-h-screen pb-32 bg-black text-gray-100">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-6 pb-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-white/10">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white">
                  Good Morning, {userName}
                </h1>
                {currentPhase && (
                  <p className="text-sm text-gray-400">
                    Cycle Day {currentPhase.dayInCycle}
                  </p>
                )}
              </div>
            </div>

            <button className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
              <Bell className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </motion.header>

        <div className="px-5 space-y-6">
          {/* Week Mini Calendar */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((date, idx) => {
                const isToday = date.toDateString() === today.toDateString();
                const dayNum = date.getDate();

                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center py-2 rounded-lg transition-all ${
                      isToday
                        ? "bg-purple-600"
                        : "bg-neutral-800/50 hover:bg-neutral-700/50"
                    }`}
                  >
                    <span className="text-xs font-medium text-gray-400">
                      {WEEK_DAYS[idx]}
                    </span>
                    <span
                      className={`text-sm font-semibold mt-1 ${
                        isToday ? "text-white" : "text-gray-300"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* Circular Period Progress */}
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center py-8"
          >
            <div className="relative w-48 h-48">
              {/* Background circle */}
              <svg
                className="w-full h-full"
                viewBox="0 0 200 200"
                style={{ transform: "rotateY(180deg) rotateZ(-90deg)" }}
              >
                {/* Background ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                />
                {/* Progress ring */}
                {nextPeriod && (
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    fill="none"
                    stroke="url(#purpleGradient)"
                    strokeWidth="12"
                    strokeDasharray={`${(nextPeriod.daysUntil / 30) * 534} 534`}
                    strokeLinecap="round"
                  />
                )}
                <defs>
                  <linearGradient
                    id="purpleGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-purple-300 font-medium">PERIOD IN</p>
                <p className="text-5xl font-bold text-white">
                  {nextPeriod?.daysUntil || 0}
                </p>
                <p className="text-sm text-gray-400">Days</p>
                <p className="text-xs text-gray-500 mt-2 text-center max-w-[90%]">
                  Low chance of pregnancy
                </p>
              </div>

              {/* Dot indicator */}
              <div
                className="absolute w-4 h-4 rounded-full bg-white left-1/2"
                style={{
                  top: "8%",
                  transform: "translateX(-50%)",
                }}
              />
            </div>
          </motion.section>

          {/* Luteal Phase Card */}
          {currentPhase && (
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="rounded-2xl bg-neutral-900 p-4 border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {currentPhase.name} Phase
                  </h3>
                  <p className="text-sm text-gray-400">
                    Day {currentPhase.dayInCycle} of {currentPhase.cycleDays}
                  </p>
                </div>
                <button className="text-purple-400 text-xs font-semibold">
                  DETAILS
                </button>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{
                    width: `${currentPhase.percentComplete}%`,
                  }}
                />
              </div>

              <p className="text-xs text-gray-400 mt-3 leading-relaxed">
                You might experience lower energy levels and mood swings as
                progesterone rises.
              </p>
            </motion.section>
          )}

          {/* Quick Log Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Quick Log</h2>
              <button className="text-purple-400 text-sm font-semibold">
                Edit
              </button>
            </div>

            <div className="flex gap-3">
              {[
                { label: "Flow", emoji: "🩸", color: "bg-red-950/40" },
                { label: "Mood", emoji: "😊", color: "bg-yellow-950/40" },
                { label: "Symptoms", emoji: "🔥", color: "bg-orange-950/40" },
              ].map((item, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 py-3 rounded-full ${item.color} border border-white/10 flex items-center justify-center gap-2 hover:border-white/20 transition`}
                >
                  <span className="text-lg">{item.emoji}</span>
                  <span className="text-sm font-medium text-white">
                    {item.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Wellness Tips Grid */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-purple-950/60 to-purple-900/40 p-4 border border-white/10">
                <div className="text-2xl mb-2">🧘</div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  Wellness Tip
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Try a light yoga session to help with cramps...
                </p>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-blue-950/60 to-blue-900/40 p-4 border border-white/10">
                <div className="text-2xl mb-2">💧</div>
                <h3 className="font-semibold text-white text-sm mb-1">
                  Hydration
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Drink at least 2L of water to reduce bloating.
                </p>
              </div>
            </div>
          </motion.section>

          {/* Journal Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
            className="rounded-2xl bg-neutral-900 p-4 border border-white/10 flex items-center justify-between cursor-pointer hover:border-white/20 transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">📔</span>
              <div>
                <h3 className="font-semibold text-white">Journal</h3>
                <p className="text-xs text-gray-400">
                  How are you feeling today?
                </p>
              </div>
            </div>
            <span className="text-gray-600 text-xl">›</span>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

export default HealthHome;
