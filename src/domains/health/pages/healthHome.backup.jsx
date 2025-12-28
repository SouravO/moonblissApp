import React, { useMemo, useState, useCallback, useRef, Suspense, lazy } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { storageService } from "@/infrastructure/storage/storageService";
import periodStorage from "@/infrastructure/storage/periodStorage";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";

// ============================================================================
// LAZY LOADED SECTIONS - Load on demand, not at component mount
// ============================================================================
const FloatingWellnessIcons = lazy(() =>
  import("./sections/FloatingWellnessIcons").then((m) => ({
    default: m.FloatingWellnessIcons,
  }))
);

const {
  CycleProgressSection,
  CurrentPhaseSection,
  WeekOverviewSection,
  PeriodTimelineSection,
  TipsGridSection,
  JournalSection,
} = (() => {
  const SectionsModule = require("./sections/index.jsx");
  return {
    CycleProgressSection: SectionsModule.CycleProgressSection,
    CurrentPhaseSection: SectionsModule.CurrentPhaseSection,
    WeekOverviewSection: SectionsModule.WeekOverviewSection,
    PeriodTimelineSection: SectionsModule.PeriodTimelineSection,
    TipsGridSection: SectionsModule.TipsGridSection,
    JournalSection: SectionsModule.JournalSection,
  };
})();

// ============================================================================
// LAZY LOADED MODALS - Only load when user interacts
// ============================================================================
const PeriodConfirmModal = lazy(() =>
  import("./modals/PeriodConfirmModal").then((m) => ({
    default: m.default,
  }))
);

const PeriodDateModal = lazy(() =>
  import("./modals/PeriodDateModal").then((m) => ({
    default: m.default,
  }))
);

const NutritionModal = lazy(() =>
  import("./modals/NutritionModal").then((m) => ({
    default: m.default,
  }))
);

// ============================================================================
// LOADING SKELETON - Fallback while sections load
// ============================================================================
const SectionLoader = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm mb-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
    <div className="h-3 bg-gray-200 rounded w-2/3" />
  </div>
);

// ============================================================================
// HEADER COMPONENT - Memoized with custom comparison
// ============================================================================
const HealthHomeHeader = React.memo(
  ({ userName, onTogglePeriod }) => (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-800">Welcome, {userName}</h1>
      <p className="text-gray-600 text-sm mt-1">Track your cycle and wellness journey</p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onTogglePeriod}
        className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-shadow"
      >
        + Log Period Activity
      </motion.button>
    </div>
  ),
  (prev, next) => prev.userName === next.userName
);
HealthHomeHeader.displayName = "HealthHomeHeader";

// ============================================================================
// MAIN COMPONENT - Optimized (reduced from 800+ lines)
// ============================================================================
const HealthHome = () => {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE - Only critical UI state
  // ─────────────────────────────────────────────────────────────────────────
  const [showPeriodConfirm, setShowPeriodConfirm] = useState(false);
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [userName, setUserName] = useState("Friend");

  // ─────────────────────────────────────────────────────────────────────────
  // REFS - Non-rendering state for period data (NO RE-RENDERS on storage update)
  // ─────────────────────────────────────────────────────────────────────────
  const periodDataRef = useRef(null);

  // Calculate period active state based on saved data
  // ✅ FIX: Moved storage read outside useMemo to avoid sync blocking
  useEffect(() => {
    // Only read storage once on mount or when user explicitly saves
    const periodData = periodStorage.get();
    setCachedPeriodData(periodData);
  }, []); // Only on mount

  const periodState = useMemo(() => {
    if (!cachedPeriodData?.lastPeriodDate) {
      return { periodActive: false, savedPeriodStartDate: "", periodDuration: 5 };
    }

    const startDate = new Date(cachedPeriodData.lastPeriodDate);
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const periodDuration = cachedPeriodData.periodDuration || 5;

    // Period is active if within the period duration
    const isActive = daysElapsed < periodDuration;

    return {
      periodActive: isActive,
      savedPeriodStartDate: cachedPeriodData.lastPeriodDate,
      daysElapsed,
      periodDuration,
    };
  }, [cachedPeriodData]); // ✅ FIX: Depend on actual data, not a trigger counter

  const { periodActive, savedPeriodStartDate, periodDuration } = periodState;

  // ✅ FIX: Removed expensive auto-toggle timer
  // Instead: Check on mount only. User can manually toggle OFF.
  // Auto-toggle can happen on next app open when periodState recalculates

  // Handle toggle change
  // ✅ FIX: Removed setRefreshTrigger - just update cache
  const handlePeriodToggle = () => {
    if (periodActive) {
      // If already active, turn it off by clearing the period data
      periodStorage.clear();
      setCachedPeriodData(null); // ✅ Update cache, not trigger
      console.log("Period turned off");
    } else {
      // If not active, show confirmation dialog
      setShowPeriodConfirm(true);
    }
  };

  // Confirm starting period
  const confirmStartPeriod = () => {
    setShowPeriodConfirm(false);
    setShowPeriodModal(true);
  };

  // Save period start date
  // ✅ FIX: Removed window.location.reload() and setRefreshTrigger
  const savePeriodDate = () => {
    if (periodStartDate) {
      console.log("Saving period start date:", periodStartDate);
      
      // Get current period data to preserve cycle/duration info
      const currentPeriodData = periodStorage.get();
      
      // Update with new period date - this becomes the new reference point
      const updated = periodStorage.update({
        lastPeriodDate: periodStartDate,
        avgCycleLength: currentPeriodData.avgCycleLength || 28,
        periodDuration: currentPeriodData.periodDuration || 5,
      });

      console.log("Period data updated - cache will recalculate predictions");
      
      // Close modal
      setShowPeriodModal(false);
      
      // ✅ FIX: Update cache directly instead of reloading page
      setCachedPeriodData(updated);
    }
  };

  // Cancel modal
  const cancelPeriodModal = () => {
    setShowPeriodModal(false);
    setPeriodStartDate(""); // Clear the date input
  };

  const userData = getUserData();
  const userName = userData?.name || "Sarah";
  const { nextPeriod, currentPhase } = usePeriodPrediction();
  const { title, subtitle, tips } = menstrualNutritionTips;
  const [nutritionModal, setNutritionModal] = useState(false);

  // Test notification function - lazy loads Capacitor to prevent crash
  const testNotification = async () => {
    try {
      console.log("Testing notifications...");

      // Lazy load Capacitor modules
      let Capacitor, LocalNotifications;
      try {
        const capacitorCore = await import("@capacitor/core");
        Capacitor = capacitorCore.Capacitor;
      } catch (error) {
        console.error("Capacitor not available:", error);
        return;
      }

      // Check if native platform
      const isNative = Capacitor.isNativePlatform();
      if (!isNative) {
        console.log("Not native platform (run on phone)");
        return;
      }

      try {
        const notifModule = await import("@capacitor/local-notifications");
        LocalNotifications = notifModule.LocalNotifications;
      } catch (error) {
        console.error("LocalNotifications not available:", error);
        return;
      }

      console.log("Checking permissions...");

      // Check permission
      const permCheck = await LocalNotifications.checkPermissions();

      if (permCheck.display !== "granted") {
        console.log("Requesting permissions...");
        const permReq = await LocalNotifications.requestPermissions();

        if (permReq.display !== "granted") {
          console.log("Permission denied - enable in Settings");
          return;
        }
      }

      // Schedule notification
      console.log("Scheduling test notification...");
      await LocalNotifications.schedule({
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

      console.log("Notification scheduled successfully");
    } catch (error) {
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
    startOfWeek.setDate(
      today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)
    );

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
  }, [tips]); // refresh when tips change

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
                <p className="text-sm text-slate-500 mt-1">
                  Today’s health insights
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Period Toggle Switch - Custom */}
                <motion.button
                  onClick={() => handlePeriodToggle()}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    periodActive ? "bg-red-600" : "bg-slate-300"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    className="absolute h-6 w-6 rounded-full bg-white shadow-md"
                    animate={{ x: periodActive ? 32 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold">
                    <span className={`absolute ${periodActive ? "left-1" : "right-1"} text-white`}>
                      {periodActive ? "ON" : "OFF"}
                    </span>
                  </span>
                </motion.button>

                {/* Notification Button */}
                <button className="w-11 h-11 rounded-2xl bg-white/80 border border-slate-200 shadow-sm flex items-center justify-center hover:bg-white transition">
                  <Bell className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Period Confirmation Modal */}
        {showPeriodConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 border border-slate-200 shadow-xl"
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  Are you on your period?
                </h2>
                <p className="text-sm text-slate-500 mt-2">
                  Let us know when your period started so we can track your cycle and provide personalized insights.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  onClick={() => setShowPeriodConfirm(false)}
                >
                  Not Now
                </button>
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition"
                  onClick={() => confirmStartPeriod()}
                >
                  Yes, Track It
                </button>
              </div>
            </motion.div>
          </div>
        )}

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
                  <h2 className="text-xl font-semibold text-slate-900">
                    {title}
                  </h2>
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
                  {randomTip?.description ||
                    "Eat iron-rich foods and stay hydrated."}
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

        {/* Period Date Picker Modal */}
        {showPeriodModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 border border-slate-200 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Period Start Date
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    When did your period start?
                  </p>
                </div>
                <button
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => cancelPeriodModal()}
                >
                  Close
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-100">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={periodStartDate}
                  onChange={(e) => setPeriodStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {periodStartDate && (
                  <p className="text-xs text-slate-500 mt-2">
                    You're on day {Math.floor((new Date() - new Date(periodStartDate)) / (1000 * 60 * 60 * 24)) + 1} of your period
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 px-4 py-2 rounded-2xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => savePeriodDate()}
                  disabled={!periodStartDate}
                >
                  Save Period
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  onClick={() => cancelPeriodModal()}
                >
                  Cancel
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
                    <p className="text-4xl font-semibold text-slate-900">
                      {progress}%
                    </p>
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
                    {currentPhase?.description ||
                      "Time to boost energy and activity."}
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
                    width: `${Math.min(
                      currentPhase?.percentComplete ?? 50,
                      100
                    )}%`,
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
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Heart className="w-5 h-5" />
                  </motion.div>
                  <span className="text-xs text-slate-500">Today</span>
                </div>
                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  Quick Log
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Track your symptoms
                </p>

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

              {/* water  */}
              <Water />
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
                <h3 className="text-base font-semibold text-slate-900">
                  Week Overview
                </h3>
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
                      <span
                        className={
                          isToday ? "text-white/85 mb-1" : "text-slate-500 mb-1"
                        }
                      >
                        {WEEK_DAYS[idx]}
                      </span>
                      <span
                        className={isToday ? "text-white" : "text-slate-900"}
                      >
                        {dayNum}
                      </span>
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
                  <h3 className="text-base font-semibold text-slate-900">
                    Period Timeline
                  </h3>
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

              <p className="text-xs text-slate-500 mt-3">
                📍 Low chance of pregnancy
              </p>
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
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Droplets className="w-5 h-5" />
                </motion.div>
                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  Nutrition
                </h4>
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
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Activity className="w-5 h-5" />
                </motion.div>
                <h4 className="mt-4 text-sm font-semibold text-slate-900">
                  Activity
                </h4>
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
                  <h3 className="text-base font-semibold text-slate-900">
                    Journal
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    How are you feeling?
                  </p>
                </div>
                <motion.div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-sky-400 text-white flex items-center justify-center"
                  animate={{ rotate: [0, 3, 0, -3, 0] }}
                  transition={{
                    duration: 4.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
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
