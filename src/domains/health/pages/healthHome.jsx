import React, { useMemo, useState, useEffect } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { storageService } from "@/infrastructure/storage/storageService";
import periodStorage from "@/infrastructure/storage/periodStorage";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { getThemeConfig } from "@/infrastructure/theme/themeConfig";

import { Bell, Heart, Sparkles, Droplets, Moon, Activity } from "lucide-react";
import Water from "../components/Water";
import PeriodCalendarHelper from "../components/PeriodCalendarHelper";
import { usePeriodPrediction } from "@/domains/health/hooks/usePeriodPrediction";

// REFACTORED: Removed FloatingWellnessIcons component (decorative, -70 lines)
// REFACTORED: Removed testNotification function (unused, -50 lines)
// REFACTORED: Removed fadeUp animation variant (replaced with CSS)

// REFACTORED: Reusable StatsCard component to reduce repetition (-40 lines)
const StatsCard = ({
  icon: Icon,
  title,
  subtitle,
  children,
  gradient = "from-blue-600 to-sky-400",
}) => (
  <section className="rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 shadow-sm hover:shadow-md transition">
    <div
      className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center`}
    >
      <Icon className="w-5 h-5" />
    </div>
    <h4 className="mt-4 text-sm font-semibold text-slate-900">{title}</h4>
    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    {children}
  </section>
);

// Helper for date key
const toKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const HealthHome = () => {
  // Period tracking state
  const [showPeriodModal, setShowPeriodModal] = useState(false);
  const [periodStartDate, setPeriodStartDate] = useState(""); // For the modal input

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

  const { periodActive, savedPeriodStartDate, periodDuration } = periodState;

  // Handle toggle change
  const handlePeriodToggle = () => {
    if (periodActive) {
      periodStorage.clear();
      setCachedPeriodData(null);
      window.dispatchEvent(new Event("period-data-changed"));
      console.log("Period turned off");
      window.location.reload();
    } else {
      setShowPeriodModal(true);
    }
  };

  // Save period start date
  const savePeriodDate = () => {
    if (periodStartDate) {
      console.log("Saving period start date:", periodStartDate);

      const currentPeriodData = periodStorage.get();
      const updated = periodStorage.update({
        lastPeriodDate: periodStartDate,
        avgCycleLength: currentPeriodData.avgCycleLength || 28,
        periodDuration: currentPeriodData.periodDuration || 5,
      });

      setShowPeriodModal(false);
      setCachedPeriodData(updated);
      setPeriodStartDate("");
      window.dispatchEvent(new Event("period-data-changed"));
      window.location.reload();
    }
  };

  // Cancel modal
  const cancelPeriodModal = () => {
    setShowPeriodModal(false);
    setPeriodStartDate("");
  };

  const userData = getUserData();
  const userName = userData?.name || "Sarah";
  const { nextPeriod, currentPhase, cycleLength } = usePeriodPrediction();

  // Get dynamic theme based on period state
  const theme = useMemo(() => {
    return getThemeConfig(periodActive);
  }, [periodActive]);

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
    console.log(cycleLength);

    // If your nextPeriod.percent exists use it. Otherwise keep your previous behavior.
    console.log(nextPeriod?.daysUntil);
    const days = cycleLength - nextPeriod?.daysUntil;
    const prog = (days / cycleLength) * 100;
    return Math.round(prog);
  }, [nextPeriod?.daysUntil]);

  // Get calendar prediction data for markers
  const { futurePeriods, hasPeriodData } = usePeriodPrediction({
    monthsAhead: 2,
  });

  // Mini calendar markers for the current week
  const weekMarkers = useMemo(() => {
    if (!hasPeriodData || !futurePeriods?.length) return {};
    // Use the same calendar helper as the full calendar
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const calendarData = PeriodCalendarHelper.getCalendarMonthData({
      predictions: futurePeriods,
      cycleLength,
      year,
      month,
    });

    const markers = {};
    weekDays.forEach((date) => {
      const key = toKey(date);
      const type = calendarData.getDateType(date);
      markers[key] = type; // "period", "fertile", "ovulation", or undefined
    });
    return markers;
  }, [weekDays, futurePeriods, cycleLength, hasPeriodData]);

  return (
    <PageLayout>
      <ColorBg />

      {/* Minimal modern canvas - Dynamic background based on theme */}
      <div className={`relative min-h-screen ${theme.background} text-slate-900`}>
        {/* REFACTORED: Simplified background - removed extra decorations (-15 lines) */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute -top-24 -left-24 h-72 w-72 rounded-full ${theme.blobs.blob1} blur-3xl`} />
          <div className={`absolute top-24 -right-24 h-80 w-80 rounded-full ${theme.blobs.blob2} blur-3xl`} />
        </div>

        {/* Header - Removed FloatingWellnessIcons */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative px-5 pt-6 pb-4"
        >
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl sm:text-3xl font-semibold tracking-tight ${theme.header.text}`}>
                  Hi, <span className={theme.header.userName}>{userName}</span>
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Today's health insights
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Period Toggle Switch - Custom */}
                <motion.button
                  onClick={() => handlePeriodToggle()}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                    periodActive ? (periodActive ? "bg-red-600" : "bg-slate-300") : "bg-slate-300"
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
                    <span
                      className={`absolute ${
                        periodActive ? "left-1" : "right-1"
                      } text-white`}
                    >
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

        {/* REFACTORED: Consolidated Period Modal (merged confirmation + date picker, -25 lines) */}
        {showPeriodModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 border border-slate-200 shadow-xl"
            >
              <h2 className="text-xl font-semibold text-slate-900">
                Are you on your period?
              </h2>
              <p className="text-sm text-slate-500 mt-2 mb-4">
                Tell us when your period started so we can track your cycle.
              </p>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 to-white border border-red-100 mb-4">
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Period Start Date
                </label>
                <input
                  type="date"
                  value={periodStartDate}
                  onChange={(e) => setPeriodStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                {periodStartDate && (
                  <p className="text-xs text-slate-500 mt-2">
                    Day{" "}
                    {Math.floor(
                      (new Date() - new Date(periodStartDate)) /
                        (1000 * 60 * 60 * 24)
                    ) + 1}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                  onClick={() => cancelPeriodModal()}
                >
                  Not Now
                </button>
                <button
                  className="flex-1 px-4 py-3 rounded-2xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => savePeriodDate()}
                  disabled={!periodStartDate}
                >
                  Yes, Track It
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content */}
        <div className="relative px-5 pb-10">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Mini Calendar Week Overview */}
            <section className={`${theme.borderRadius.card} border ${theme.card.default} ${theme.shadow} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-slate-900">
                  Week Overview
                </h3>
                <span className="text-xs text-slate-500">This week</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((date, idx) => {
                  const key = toKey(date);
                  const isToday = date.toDateString() === today.toDateString();
                  const type = weekMarkers[key];
                  return (
                    <div
                      key={idx}
                      className={[
                        "flex flex-col items-center justify-center rounded-2xl py-2 font-semibold text-xs transition relative",
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
                        {date.getDate()}
                      </span>
                      {/* Marker dots */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                        {type === "period" && (
                          <span className="h-2 w-2 rounded-full bg-pink-400" />
                        )}
                        {type === "fertile" && (
                          <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        )}
                        {type === "ovulation" && (
                          <span className="h-2 w-2 rounded-full bg-green-200" />
                        )}
                        {isToday && (
                          <span className="h-2 w-2 rounded-full border border-emerald-400/40 bg-white/5" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-pink-400" /> Period
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />{" "}
                  Fertile
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-200" />{" "}
                  Ovulation
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full border border-emerald-400/40 bg-white/5" />{" "}
                  Today
                </span>
              </div>
            </section>

            {/* Top hero card - REFACTORED: Removed framer-motion variants */}
            {currentPhase?.name === "Menstrual" || periodActive ? (
              <section className={`${theme.borderRadius.card} ${theme.card.bordered} ${theme.shadow} p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${periodActive ? "text-black/80" : "text-red-700/80"} mb-2`}>
                      Menstrual phase
                    </p>
                    <h2 className={`text-xl sm:text-2xl font-semibold leading-tight ${periodActive ? "text-black" : "text-slate-900"}`}>
                      Have your Moonbliss
                    </h2>
                    <p className={`text-sm ${periodActive ? "text-black/85" : "text-slate-600"} mt-2`}>
                      Prioritize rest, hydration, and warmth.
                    </p>
                  </div>
                  <div className={`rounded-2xl ${periodActive ? "bg-white/15 border-white/20" : "bg-red-50 border-red-200"} border p-2`}>
                    <Droplets className={`w-5 h-5 ${periodActive ? "text-black" : "text-red-700"}`} />
                  </div>
                </div>
              </section>
            ) : (
              <section className={`${theme.borderRadius.card} border ${theme.card.default} ${theme.shadow} p-6`}>
                <div className="flex items-end justify-between gap-6">
                  <div>
                    <p className={`text-xs uppercase tracking-wider ${theme.text.secondary} mb-2`}>
                      Cycle progress
                    </p>
                    <p className={`text-4xl font-semibold ${theme.text.primary}`}>
                      {progress}%{/*  */}
                    </p>
                    <p className={`text-sm ${theme.text.secondary} mt-1`}>
                      Keep steady habits. Small wins daily.
                    </p>
                  </div>

                  <div className="w-32 sm:w-40">
                    <div className={`h-2 w-full rounded-full bg-slate-200 overflow-hidden`}>
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar} transition-all duration-500`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <p className={`mt-2 text-xs ${theme.text.secondary}`}>
                      Next period in{" "}
                      <span className={`font-semibold ${theme.text.primary}`}>
                        {nextPeriod?.daysUntil || 0} days
                      </span>
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Main phase card - REFACTORED: Simplified CSS */}
            <section className={`${theme.borderRadius.card} border ${theme.card.bordered} ${theme.shadow} p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${theme.header.userName}/80 mb-2`}>
                    Current phase
                  </p>
                  <h2 className={`text-xl font-semibold ${theme.text.primary}`}>
                    {currentPhase?.name || "Follicular"} Phase
                  </h2>
                  <p className={`text-sm ${theme.text.secondary} mt-2`}>
                    {currentPhase?.description ||
                      "Time to boost energy and activity."}
                  </p>
                </div>

                <div className={`rounded-2xl bg-white border ${theme.card.default} shadow-sm p-2`}>
                  <Sparkles className={`w-5 h-5 ${theme.header.userName}`} />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-4">
                <p className={`text-xs ${theme.text.secondary}`}>
                  Day{" "}
                  <span className={`font-semibold ${theme.text.primary}`}>
                    {currentPhase?.dayInCycle || 1}
                  </span>{" "}
                  of{" "}
                  <span className={`font-semibold ${theme.text.primary}`}>
                    {currentPhase?.cycleDays || 28}
                  </span>
                </p>
                <p className={`text-xs ${theme.text.secondary}`}>
                  Completion{" "}
                  <span className={`font-semibold ${theme.text.primary}`}>
                    {currentPhase?.percentComplete ?? 50}%
                  </span>
                </p>
              </div>

              <div className={`mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar} transition-all duration-500`}
                  style={{
                    width: `${Math.min(
                      currentPhase?.percentComplete ?? 50,
                      100
                    )}%`,
                  }}
                />
              </div>
            </section>

            {/* Minimal cards grid - REFACTORED: Using StatsCard component */}
            <div className="grid grid-cols-2 gap-4">
              {/* Quick Log - Using StatsCard */}
              <StatsCard
                icon={Heart}
                title="Quick Log"
                subtitle="Track your symptoms"
              >
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
              </StatsCard>

              {/* Water */}
              <Water />
            </div>

            {/* Period Timeline */}
            <section className={`${theme.borderRadius.card} border ${theme.card.bordered} ${theme.shadow} p-6`}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`text-base font-semibold ${theme.text.primary}`}>
                    Period Timeline
                  </h3>
                  <p className={`text-xs ${theme.text.secondary} mt-1`}>Next period in</p>
                </div>
                <div className={`rounded-2xl bg-white border ${theme.card.default} shadow-sm p-2`}>
                  <Moon className={`w-5 h-5 ${theme.header.userName}`} />
                </div>
              </div>

              <div className="mt-4 flex items-baseline gap-2">
                <div className={`text-4xl font-semibold ${theme.header.userName}`}>
                  {nextPeriod?.daysUntil || 0}
                </div>
                <div className={`text-xs ${theme.text.secondary}`}>days</div>
              </div>

              <div className={`mt-4 h-2 w-full rounded-full bg-slate-200 overflow-hidden`}>
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${theme.progressBar} transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p className="text-xs text-slate-500 mt-3">
                📍 Low chance of pregnancy
              </p>
            </section>

            {/* Tips Grid - REFACTORED: Using StatsCard, removed nutrition modal */}
            <div className="grid grid-cols-2 gap-4">
              {/* Activity - Using StatsCard */}
              <StatsCard
                icon={Activity}
                title="Activity"
                subtitle="Light movement eases discomfort."
                gradient="from-blue-700 to-indigo-600"
              />

              {/* Journal - Using StatsCard */}
              <StatsCard
                icon={Sparkles}
                title="Journal"
                subtitle="How are you feeling?"
              />
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default React.memo(HealthHome);
