
import React, { useMemo, useState } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { usePeriodPrediction } from "@/domains/health/hooks/usePeriodPrediction";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import {
  Bell,
  Heart,
  Sparkles,
  Droplets,
  Flower2,
  Moon,
  Activity,
  Smile,
} from "lucide-react";
import { menstrualNutritionTips } from "@/domains/health/data/nutritionTips";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
};

/* Floating moving women-wellness icons (no emoji) */
const FloatingWellnessIcons = React.memo(function FloatingWellnessIcons() {
  const items = useMemo(
    () => [
      { Icon: Moon, x: "8%", y: "16%", s: 26, d: 0.0, dur: 7.5, o: 0.22 },
      { Icon: Flower2, x: "84%", y: "18%", s: 24, d: 0.2, dur: 8.2, o: 0.2 },
      { Icon: Droplets, x: "12%", y: "72%", s: 26, d: 0.4, dur: 7.8, o: 0.18 },
      { Icon: Heart, x: "86%", y: "68%", s: 24, d: 0.6, dur: 8.6, o: 0.18 },
      { Icon: Sparkles, x: "52%", y: "10%", s: 22, d: 0.3, dur: 9.0, o: 0.16 },
      { Icon: Smile, x: "50%", y: "78%", s: 22, d: 0.5, dur: 8.8, o: 0.16 },
      { Icon: Activity, x: "70%", y: "42%", s: 22, d: 0.7, dur: 9.4, o: 0.14 },
    ],
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map(({ Icon, x, y, s, d, dur, o }, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{
            opacity: o,
            y: [0, -14, 0, 10, 0],
            x: [0, 8, 0, -6, 0],
            rotate: [0, 6, 0, -6, 0],
            scale: [1, 1.04, 1, 0.98, 1],
          }}
          transition={{
            delay: d,
            duration: dur,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="rounded-3xl border border-blue-100/70 bg-white/45 backdrop-blur-sm shadow-sm">
            <div className="p-3">
              <Icon
                className="text-blue-700"
                style={{ width: s, height: s }}
                strokeWidth={1.6}
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* soft moving light sweep */}
      <motion.div
        className="absolute -left-40 top-24 h-64 w-64 rounded-full bg-blue-400/10 blur-3xl"
        animate={{ x: [0, 520, 0], y: [0, 40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
});

const HealthHome = () => {
  const userData = getUserData();
  const userName = userData?.name || "Sarah";
  const { nextPeriod, currentPhase } = usePeriodPrediction();
  const { title, subtitle, tips } = menstrualNutritionTips;
  const [nutritionModal, setNutritionModal] = useState(false);
  const [notifStatus, setNotifStatus] = useState("Tap to test");

  // Test notification function - lazy loads Capacitor to prevent crash
  const testNotification = async () => {
    try {
      setNotifStatus("Loading...");

      // Lazy load Capacitor modules
      let Capacitor, LocalNotifications;
      try {
        const capacitorCore = await import("@capacitor/core");
        Capacitor = capacitorCore.Capacitor;
      } catch (e) {
        setNotifStatus("❌ Capacitor not available");
        return;
      }

      // Check if native platform
      const isNative = Capacitor.isNativePlatform();
      if (!isNative) {
        setNotifStatus("❌ Not native platform (run on phone)");
        return;
      }

      try {
        const notifModule = await import("@capacitor/local-notifications");
        LocalNotifications = notifModule.LocalNotifications;
      } catch (e) {
        setNotifStatus("❌ LocalNotifications not available");
        return;
      }

      setNotifStatus("Checking permission...");

      // Check permission
      const permCheck = await LocalNotifications.checkPermissions();

      if (permCheck.display !== "granted") {
        setNotifStatus("Requesting permission...");
        const permReq = await LocalNotifications.requestPermissions();

        if (permReq.display !== "granted") {
          setNotifStatus("❌ Permission denied - enable in Settings");
          return;
        }
      }

      // Schedule notification
      setNotifStatus("Sending...");
      const result = await LocalNotifications.schedule({
        notifications: [
          {
            id: Math.floor(Math.random() * 90000) + 10000,
            title: "🎉 Test Notification",
            body: "Notifications are working!",
            schedule: { at: new Date(Date.now() + 2000) },
            autoCancel: true,
          },
        ],
      });

      setNotifStatus(`✅ Done! Check notification in 2 sec`);
    } catch (error) {
      setNotifStatus(`❌ ${error.message || "Unknown error"}`);
      console.error("Notification test error:", error);
    }
  };

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

  const progress = useMemo(() => {
    // If your nextPeriod.percent exists use it. Otherwise keep your previous behavior.
    const v = Math.min(nextPeriod?.daysUntil || 0, 100);
    return Number.isFinite(v) ? v : 0;
  }, [nextPeriod?.daysUntil]);

  const randomTip = useMemo(() => {
    if (!tips?.length) return null;
    return tips[Math.floor(Math.random() * tips.length)];
  }, [tips, nutritionModal]); // refresh when modal opens

  return (
    <PageLayout>
      <ColorBg />

      {/* Minimal modern canvas - Blue background */}
      <div className="relative min-h-screen bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50 text-slate-900">
        {/* Soft background accents */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-300/40 blur-3xl" />
          <div className="absolute top-24 -right-24 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.12),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.10),transparent_40%)]" />
        </div>

        {/* Moving women-wellness icons layer */}
        <FloatingWellnessIcons />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 pt-6 pb-4"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Hi, <span className="text-blue-700">{userName}</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">Today’s health insights</p>
              </div>

              <button className="w-11 h-11 rounded-2xl bg-white/80 border border-slate-200 shadow-sm flex items-center justify-center hover:bg-white transition">
                <Bell className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Nutrition Modal */}
        {nutritionModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
                  <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>
                <button
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => setNutritionModal(false)}
                >
                  Close
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-white border border-blue-100">
                <p className="text-sm font-medium text-slate-900">
                  {randomTip?.description || "Eat iron-rich foods and stay hydrated."}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                  onClick={() => setNutritionModal(false)}
                >
                  Got it
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  onClick={() => setNutritionModal(true)}
                >
                  Another tip
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className="relative px-5 pb-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Top hero card */}
            {currentPhase?.name === "Menstrual" ? (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 to-sky-500 text-white p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-white/80 mb-2">
                      Menstrual phase
                    </p>
                    <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                      Have your Moonbliss
                    </h2>
                    <p className="text-sm text-white/85 mt-2">
                      Prioritize rest, hydration, and warmth.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/15 border border-white/20 p-2">
                    <Droplets className="w-5 h-5 text-white" />
                  </div>
                </div>
              </motion.section>
            ) : (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur shadow-sm p-6"
              >
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-2">
                      Cycle progress
                    </p>
                    <p className="text-4xl font-semibold text-slate-900">{progress}%</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Keep steady habits. Small wins daily.
                    </p>
                  </div>

                  <div className="w-32 sm:w-40">
                    <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-sky-400 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Next period in{" "}
                      <span className="font-semibold text-slate-800">
                        {nextPeriod?.daysUntil || 0} days
                      </span>
                    </p>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Main phase card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.16 }}
              className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-blue-700/80 mb-2">
                    Current phase
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {currentPhase?.name || "Follicular"} Phase
                  </h2>
                  <p className="text-sm text-slate-600 mt-2">
                    {currentPhase?.description || "Time to boost energy and activity."}
                  </p>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-2">
                  <Sparkles className="w-5 h-5 text-blue-700" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="text-xs text-slate-500">
                  Day{" "}
                  <span className="font-semibold text-slate-800">
                    {currentPhase?.dayInCycle || 1}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {currentPhase?.cycleDays || 28}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  Completion{" "}
                  <span className="font-semibold text-slate-800">
                    {currentPhase?.percentComplete ?? 50}%
                  </span>
                </p>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-700 to-sky-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(currentPhase?.percentComplete ?? 50, 100)}%`,
                  }}
                />
              </div>
            </motion.section>

            {/* Minimal cards grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quick Log */}
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.22 }}
                className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white flex items-center justify-center"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs text-slate-500">Today</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Quick Log</h3>
                <p className="text-xs text-slate-500 mt-1">Track your symptoms</p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Flow</span>
                    <span className="font-semibold text-slate-900">Light</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Mood</span>
                    <span className="font-semibold text-slate-900">Good</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Energy</span>
                    <span className="font-semibold text-slate-900">High</span>
                  </div>
                </div>
              </motion.section>

              {/* Wellness */}
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.26 }}
                className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <motion.div
                    className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white flex items-center justify-center"
                    animate={{ rotate: [0, 6, 0, -6, 0] }}
                    transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Flower2 className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs text-slate-500">Tips</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">Wellness</h3>
                <p className="text-xs text-slate-500 mt-1">Small things that help</p>

                <div className="mt-4 space-y-2 text-xs text-slate-700">
                  <div>✓ Light yoga</div>
                  <div>✓ Hydrate</div>
                  <div>✓ Good sleep</div>
                </div>
              </motion.section>
            </div>

            {/* Week Overview */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.32 }}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">Week Overview</h3>
                <span className="text-xs text-slate-500">This week</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, idx) => {
                  const isToday = date.toDateString() === today.toDateString();
                  const dayNum = date.getDate();

                  return (
                    <div
                      key={idx}
                      className={[
                        "flex flex-col items-center justify-center rounded-2xl py-2 font-semibold text-xs transition",
                        isToday
                          ? "bg-gradient-to-br from-blue-600 to-sky-400 text-white shadow-sm"
                          : "bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100",
                      ].join(" ")}
                    >
                      <span className={isToday ? "text-white/85 mb-1" : "text-slate-500 mb-1"}>
                        {WEEK_DAYS[idx]}
                      </span>
                      <span className={isToday ? "text-white" : "text-slate-900"}>{dayNum}</span>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* Period Timeline */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.36 }}
              className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Period Timeline</h3>
                  <p className="text-xs text-slate-500 mt-1">Next period in</p>
                </div>
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-2">
                  <Moon className="w-5 h-5 text-blue-700" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <div className="text-4xl font-semibold text-blue-700">
                  {nextPeriod?.daysUntil || 0}
                </div>
                <div className="text-xs text-slate-500">days</div>
              </div>

              <div className="mt-4 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-700 to-sky-400 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">📍 Low chance of pregnancy</p>
            </motion.section>

            {/* Tips Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Nutrition */}
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.42 }}
                className="rounded-3xl border border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5 shadow-sm hover:shadow-md transition cursor-pointer"
                onClick={() => setNutritionModal(true)}
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white flex items-center justify-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Droplets className="w-5 h-5" />
                </motion.div>
                <h4 className="mt-4 text-sm font-semibold text-slate-900">Nutrition</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Iron-rich foods help energy.
                </p>
              </motion.section>

              {/* Activity */}
              <motion.section
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.46 }}
                className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <motion.div
                  className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-600 text-white flex items-center justify-center"
                  animate={{ y: [0, -2, 0], x: [0, 1, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Activity className="w-5 h-5" />
                </motion.div>
                <h4 className="mt-4 text-sm font-semibold text-slate-900">Activity</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Light movement eases discomfort.
                </p>
              </motion.section>
            </div>

            {/* Journal */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.52 }}
              className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-6 shadow-sm hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Journal</h3>
                  <p className="text-xs text-slate-500 mt-1">How are you feeling?</p>
                </div>
                <motion.div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white flex items-center justify-center"
                  animate={{ rotate: [0, 3, 0, -3, 0] }}
                  transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(HealthHome);

