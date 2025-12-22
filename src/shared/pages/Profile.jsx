import React, { useMemo, useState, useEffect } from "react";
import PageLayout from "@/shared/layout/PageLayout";
import { getUserData } from "@/infrastructure/storage/onboarding";
import { motion } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import {
  LogOut,
  Mail,
  User,
  Cake,
  Settings,
  Bell,
  Moon,
  ShieldCheck,
  HeartPulse,
  Droplets,
  BedDouble,
  Activity,
  CalendarDays,
  Flame,
  Leaf,
  PencilLine,
  ChevronRight,
  HelpCircle,
  Download,
} from "lucide-react";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const fadeInScale = {
  hidden: { opacity: 0, scale: 0.985 },
  visible: { opacity: 1, scale: 1 },
};

const Profile = () => {
  const userData = getUserData();
  const userName = userData?.name || "User";

  // Keep existing age logic
  const userAge = useMemo(() => {
    if (!userData?.age && !userData?.dateOfBirth) return null;
    if (userData?.age) return userData.age;

    const dob = userData?.dateOfBirth;
    if (!dob) return null;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }, [userData?.age, userData?.dateOfBirth]);

  /* -------------------------------------------------------
    Period + Wellness extras (added, non-breaking)
  -------------------------------------------------------- */
  const [prefs, setPrefs] = useState(() => {
    const safeParse = (k, fallback) => {
      try {
        const v = localStorage.getItem(k);
        return v == null ? fallback : JSON.parse(v);
      } catch {
        return fallback;
      }
    };
    return {
      notifications: safeParse("mb_prefs_notifications", true),
      darkMode: safeParse("mb_prefs_darkmode", true),
      hydrationReminders: safeParse("mb_prefs_hydration", true),
      restReminders: safeParse("mb_prefs_rest", true),
      symptomInsights: safeParse("mb_prefs_insights", true),
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "mb_prefs_notifications",
        JSON.stringify(prefs.notifications)
      );
      localStorage.setItem("mb_prefs_darkmode", JSON.stringify(prefs.darkMode));
      localStorage.setItem(
        "mb_prefs_hydration",
        JSON.stringify(prefs.hydrationReminders)
      );
      localStorage.setItem("mb_prefs_rest", JSON.stringify(prefs.restReminders));
      localStorage.setItem(
        "mb_prefs_insights",
        JSON.stringify(prefs.symptomInsights)
      );
    } catch {
      // ignore
    }
  }, [prefs]);

  const toggle = (key) =>
    setPrefs((p) => ({
      ...p,
      [key]: !p[key],
    }));

  const cycle = useMemo(() => {
    const lastPeriodStart =
      userData?.lastPeriodStart ||
      userData?.periodStart ||
      userData?.lastPeriodDate ||
      localStorage.getItem("mb_lastPeriodStart") ||
      null;

    const cycleLength =
      Number(userData?.cycleLength) ||
      Number(userData?.periodCycleLength) ||
      Number(localStorage.getItem("mb_cycleLength")) ||
      28;

    const periodLength =
      Number(userData?.periodLength) ||
      Number(userData?.periodDuration) ||
      Number(localStorage.getItem("mb_periodLength")) ||
      5;

    const parsedLast = lastPeriodStart ? new Date(lastPeriodStart) : null;
    const isValidDate =
      parsedLast && !Number.isNaN(parsedLast.getTime()) ? parsedLast : null;

    const addDays = (d, days) => {
      const x = new Date(d);
      x.setDate(x.getDate() + days);
      return x;
    };

    const fmt = (d) => {
      if (!d) return "Not set";
      try {
        return d.toLocaleDateString(undefined, {
          weekday: "short",
          day: "2-digit",
          month: "short",
        });
      } catch {
        return "Not set";
      }
    };

    const today = new Date();
    const start = isValidDate;
    const nextPeriod = start ? addDays(start, cycleLength) : null;
    const periodEnd = start
      ? addDays(start, Math.max(0, periodLength - 1))
      : null;

    const ovulation = nextPeriod ? addDays(nextPeriod, -14) : null;

    const daysBetween = (a, b) => {
      const MS = 1000 * 60 * 60 * 24;
      const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
      const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
      return Math.round((bb - aa) / MS);
    };

    const dToNext = nextPeriod ? daysBetween(today, nextPeriod) : null;
    const dFromStart = start ? Math.max(0, daysBetween(start, today)) : null;

    let phase = "Not tracking";
    let phaseHint = "Add your period info to unlock insights.";
    let phaseTone = "from-emerald-600/25 to-teal-500/10";

    if (start && nextPeriod) {
      const day = dFromStart;

      if (day <= periodLength - 1) {
        phase = "Period";
        phaseHint = "Hydrate, rest, and keep iron-rich foods.";
        phaseTone = "from-emerald-600/22 to-lime-500/10";
      } else if (day <= 12) {
        phase = "Follicular";
        phaseHint = "Energy may rise. Great for light workouts.";
        phaseTone = "from-teal-500/22 to-emerald-500/10";
      } else if (ovulation && Math.abs(daysBetween(today, ovulation)) <= 2) {
        phase = "Ovulation";
        phaseHint = "Peak energy window. Prioritize strength + protein.";
        phaseTone = "from-lime-500/22 to-emerald-500/10";
      } else if (dToNext != null && dToNext <= 10) {
        phase = "Luteal";
        phaseHint = "Mood and cravings can shift. Prioritize sleep and magnesium.";
        phaseTone = "from-emerald-700/22 to-teal-500/10";
      } else {
        phase = "Cycle";
        phaseHint = "You are on track. Keep your routine steady.";
        phaseTone = "from-emerald-600/22 to-cyan-500/10";
      }
    }

    return {
      start,
      nextPeriod,
      periodEnd,
      ovulation,
      cycleLength,
      periodLength,
      fmt,
      dToNext,
      phase,
      phaseHint,
      phaseTone,
    };
  }, [userData]);

  const wellness = useMemo(() => {
    const hydrationGoalMl =
      Number(userData?.hydrationGoalMl) ||
      Number(localStorage.getItem("mb_hydrationGoalMl")) ||
      2200;

    const sleepGoalHrs =
      Number(userData?.sleepGoalHrs) ||
      Number(localStorage.getItem("mb_sleepGoalHrs")) ||
      8;

    const movementGoalMin =
      Number(userData?.movementGoalMin) ||
      Number(localStorage.getItem("mb_movementGoalMin")) ||
      30;

    const hydrationToday = Number(localStorage.getItem("mb_hydrationToday")) || 0;
    const sleepLast = Number(localStorage.getItem("mb_sleepLast")) || 0;
    const movementToday = Number(localStorage.getItem("mb_movementToday")) || 0;

    const clampPct = (v) => Math.max(0, Math.min(100, v));
    const hydrationPct = clampPct((hydrationToday / hydrationGoalMl) * 100);
    const sleepPct = clampPct((sleepLast / sleepGoalHrs) * 100);
    const movementPct = clampPct((movementToday / movementGoalMin) * 100);

    return {
      hydrationGoalMl,
      sleepGoalHrs,
      movementGoalMin,
      hydrationToday,
      sleepLast,
      movementToday,
      hydrationPct,
      sleepPct,
      movementPct,
    };
  }, [userData]);

  const avatarSeed = useMemo(() => {
    const seed =
      (userData?.email || userName || "moonbliss").toString().trim() || "moon";
    return encodeURIComponent(seed);
  }, [userData?.email, userName]);

  return (
    <PageLayout>
      <ColorBg />

      <div className="relative min-h-screen bg-[#1a43bf] text-gray-100">
        {/* Blue glows */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[520px] -translate-x-1/2 rounded-full bg-blue-700/20 blur-3xl" />
        <div className="pointer-events-none absolute top-24 right-0 h-56 w-56 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 sm:px-5 pt-6 pb-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-sm text-gray-400">
                Your cycle, wellness, and account details
              </p>
            </div>

            <button className="shrink-0 inline-flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-100 hover:bg-blue-500/15 transition">
              <Settings className="h-4 w-4 text-blue-200" />
              <span className="hidden xs:inline">Settings</span>
            </button>
          </div>
        </motion.header>

        <div className="px-4 sm:px-5 space-y-6 pb-8">
          {/* Hero: MOBILE RESPONSIVE */}
          <motion.section
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-3xl border border-blue-500/15 bg-neutral-900/60 p-4 sm:p-5"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${cycle.phaseTone}`}
            />

            {/* Top row becomes stacked on mobile */}
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl overflow-hidden ring-4 ring-blue-600/25 shadow-xl"
                >
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </motion.div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-lg sm:text-xl font-bold text-white">
                      {userName}
                    </h2>
                    {userAge && (
                      <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-xs text-gray-200">
                        {userAge}y
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-gray-200/90">
                    Current phase:{" "}
                    <span className="font-semibold text-white">{cycle.phase}</span>
                  </p>
                  <p className="mt-1 text-xs text-gray-300">{cycle.phaseHint}</p>
                </div>
              </div>

              {/* UPDATED: Neat Edit button */}
              <div className="sm:ml-auto">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-500/25 bg-blue-500/10 px-4 py-2.5 text-sm font-semibold text-blue-100 hover:bg-blue-500/15 transition shadow-sm shadow-blue-900/20"
                  onClick={() => {
                    // hook your edit route/modal here later
                    // e.g. navigate("/edit-profile") or openModal()
                  }}
                >
                  <PencilLine className="h-4 w-4 text-emerald-200" />
                  Edit profile
                </motion.button>
              </div>
            </div>

            {/* Chips: wrap nicely on mobile */}
            <div className="relative mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-black/25 px-3 py-2 text-xs text-gray-100">
                <CalendarDays className="h-4 w-4 text-blue-200" />
                <span className="text-gray-200">Next period:</span>{" "}
                <span className="font-semibold">{cycle.fmt(cycle.nextPeriod)}</span>
                {cycle.dToNext != null && (
                  <span className="text-gray-300">
                    ({cycle.dToNext >= 0 ? `${cycle.dToNext}d` : "overdue"})
                  </span>
                )}
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-black/25 px-3 py-2 text-xs text-gray-100">
                <Flame className="h-4 w-4 text-blue-300" />
                <span className="text-gray-200">Ovulation:</span>{" "}
                <span className="font-semibold">{cycle.fmt(cycle.ovulation)}</span>
              </div>

              <div className="inline-flex items-center gap-2 rounded-xl border border-blue-500/15 bg-black/25 px-3 py-2 text-xs text-gray-100">
                <Leaf className="h-4 w-4 text-blue-200" />
                <span className="text-gray-200">Cycle:</span>{" "}
                <span className="font-semibold">{cycle.cycleLength}d</span>
              </div>
            </div>

            {/* Stat chips: 1 col on small, 3 on md */}
            <div className="relative mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatChip
                icon={<Droplets className="h-4 w-4 text-emerald-200" />}
                label="Hydration"
                value={`${Math.round(wellness.hydrationPct)}%`}
                sub={`${wellness.hydrationToday} / ${wellness.hydrationGoalMl} ml`}
              />
              <StatChip
                icon={<BedDouble className="h-4 w-4 text-emerald-200" />}
                label="Sleep"
                value={`${Math.round(wellness.sleepPct)}%`}
                sub={`${wellness.sleepLast} / ${wellness.sleepGoalHrs} hrs`}
              />
              <StatChip
                icon={<Activity className="h-4 w-4 text-emerald-200" />}
                label="Movement"
                value={`${Math.round(wellness.movementPct)}%`}
                sub={`${wellness.movementToday} / ${wellness.movementGoalMin} min`}
              />
            </div>
          </motion.section>

          {/* Account Info */}
          <motion.section
            variants={fadeInScale}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
            className="rounded-3xl bg-neutral-900 p-4 sm:p-5 border border-blue-500/15"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">
                Account information
              </h3>
              <span className="text-xs text-blue-200/90 inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-200" />
                Protected
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <Row
                iconWrap="bg-blue-500/12 border-blue-500/25"
                icon={<User className="w-5 h-5 text-blue-200" />}
                label="Name"
                value={userName}
              />

              {userAge && (
                <Row
                  iconWrap="bg-blue-500/12 border-blue-500/25"
                  icon={<Cake className="w-5 h-5 text-blue-200" />}
                  label="Age"
                  value={`${userAge} years`}
                />
              )}

              {userData?.email && (
                <Row
                  iconWrap="bg-blue-500/12 border-blue-500/25"
                  icon={<Mail className="w-5 h-5 text-blue-200" />}
                  label="Email"
                  value={userData.email}
                />
              )}
            </div>
          </motion.section>

          {/* Cycle details */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.18 }}
            className="rounded-3xl bg-neutral-900 p-4 sm:p-5 border border-blue-500/15"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Cycle tracking</h3>
              <button className="text-xs text-blue-200 hover:text-white inline-flex items-center gap-1">
                Update <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoTile
                icon={<CalendarDays className="h-4 w-4 text-blue-200" />}
                title="Last period start"
                value={cycle.fmt(cycle.start)}
              />
              <InfoTile
                icon={<CalendarDays className="h-4 w-4 text-blue-200" />}
                title="Next period"
                value={cycle.fmt(cycle.nextPeriod)}
              />
              <InfoTile
                icon={<HeartPulse className="h-4 w-4 text-blue-200" />}
                title="Period length"
                value={`${cycle.periodLength} days`}
              />
              <InfoTile
                icon={<Leaf className="h-4 w-4 text-blue-200" />}
                title="Cycle length"
                value={`${cycle.cycleLength} days`}
              />
            </div>

            <div className="mt-4 rounded-2xl border border-blue-500/15 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-xl border border-blue-500/15 bg-blue-500/10 p-2">
                  <Moon className="h-4 w-4 text-blue-100" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    Wellness tip for {cycle.phase}
                  </p>
                  <p className="mt-1 text-xs text-gray-300">
                    {cycle.phase === "Period"
                      ? "Prioritize hydration, warm foods, and gentle movement. Log cramps and flow for better predictions."
                      : cycle.phase === "Follicular"
                      ? "Energy can rise. Try strength training, higher protein, and plan deep work."
                      : cycle.phase === "Ovulation"
                      ? "You may feel strongest. Add strength workouts and balanced carbs."
                      : cycle.phase === "Luteal"
                      ? "Sleep matters most. Reduce caffeine late, add magnesium foods, and keep steps steady."
                      : "Track symptoms daily to unlock more accurate insights."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PillButton label="Log symptoms" />
                    <PillButton label="Add mood" />
                    <PillButton label="Record flow" />
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Preferences */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.22 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-neutral-900 p-4 sm:p-5 border border-blue-500/15"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>

            <div className="space-y-3">
              <ToggleRow
                icon={<Bell className="h-4 w-4 text-blue-100" />}
                label="Notifications"
                desc="Reminders, tips, and updates"
                on={prefs.notifications}
                onClick={() => toggle("notifications")}
              />
              <ToggleRow
                icon={<Moon className="h-4 w-4 text-blue-100" />}
                label="Dark mode"
                desc="Keep the app in dark theme"
                on={prefs.darkMode}
                onClick={() => toggle("darkMode")}
              />
              <ToggleRow
                icon={<Droplets className="h-4 w-4 text-blue-100" />}
                label="Hydration reminders"
                desc="Smart reminders during your cycle"
                on={prefs.hydrationReminders}
                onClick={() => toggle("hydrationReminders")}
              />
              <ToggleRow
                icon={<BedDouble className="h-4 w-4 text-blue-100" />}
                label="Rest reminders"
                desc="Nudges when recovery matters"
                on={prefs.restReminders}
                onClick={() => toggle("restReminders")}
              />
              <ToggleRow
                icon={<HeartPulse className="h-4 w-4 text-blue-100" />}
                label="Symptom insights"
                desc="Patterns and trend summaries"
                on={prefs.symptomInsights}
                onClick={() => toggle("symptomInsights")}
              />
            </div>
          </motion.section>

          {/* Privacy + Data */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.26 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-neutral-900 p-4 sm:p-5 border border-blue-500/15"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Privacy & data
            </h3>

            <div className="space-y-3">
              <ActionRow
                icon={<ShieldCheck className="h-4 w-4 text-blue-200" />}
                title="Privacy controls"
                subtitle="Manage data sharing and permissions"
              />
              <ActionRow
                icon={<Download className="h-4 w-4 text-blue-200" />}
                title="Export my data"
                subtitle="Download cycle and wellness history"
              />
              <ActionRow
                icon={<HelpCircle className="h-4 w-4 text-blue-200" />}
                title="Help & support"
                subtitle="FAQs and contact"
              />
            </div>
          </motion.section>

          {/* Security */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-neutral-900 p-4 sm:p-5 border border-emerald-500/15"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Security</h3>

            <div className="space-y-3">
              <button className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 hover:border-emerald-500/25 hover:bg-emerald-500/12 transition">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-2">
                    <span aria-hidden>🔐</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white">
                      Change password
                    </p>
                    <p className="text-xs text-gray-400">
                      Recommended every few months
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300" />
              </button>
            </div>
          </motion.section>

          {/* UPDATED: Neat Logout section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            transition={{ delay: 0.34 }}
            viewport={{ once: true }}
            className="pb-2"
          >
            <div className="rounded-3xl border border-emerald-500/15 bg-neutral-900 p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Logout</p>
                  <p className="text-xs text-gray-400">
                    This will clear local data on this device.
                  </p>
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-900/30"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </PageLayout>
  );
};

/* --------------------------- UI Bits --------------------------- */

const StatChip = ({ icon, label, value, sub }) => (
  <div className="rounded-2xl border border-emerald-500/15 bg-black/20 p-3">
    <div className="flex items-center justify-between">
      <div className="inline-flex items-center gap-2 text-xs text-gray-300">
        <span className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 p-1.5">
          {icon}
        </span>
        {label}
      </div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
    <div className="mt-2 text-[11px] text-gray-400">{sub}</div>
    </div>
);

const Row = ({ iconWrap, icon, label, value }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/15 bg-neutral-800/25 p-4">
    <div
      className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${iconWrap}`}
    >
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-white truncate">{value}</p>
    </div>
  </div>
);

const InfoTile = ({ icon, title, value }) => (
  <div className="rounded-2xl border border-emerald-500/15 bg-neutral-800/25 p-4">
    <div className="flex items-center gap-2 text-xs text-gray-300">
      <span className="rounded-lg border border-emerald-500/15 bg-emerald-500/10 p-1.5">
        {icon}
      </span>
      {title}
    </div>
    <div className="mt-2 text-sm font-semibold text-white">{value}</div>
  </div>
);

const PillButton = ({ label }) => (
  <button className="rounded-full border border-emerald-500/15 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-100 hover:bg-emerald-500/15 hover:text-white transition">
    {label}
  </button>
);

const ToggleRow = ({ icon, label, desc, on, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-800/25 border border-blue-500/15 hover:border-blue-500/25 hover:bg-neutral-800/35 transition"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="rounded-xl border border-blue-500/15 bg-blue-500/10 p-2">
        {icon}
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm font-semibold text-white truncate">{label}</p>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400">{on ? "On" : "Off"}</span>
      <div
        className={`relative h-6 w-12 rounded-full border transition ${
          on
            ? "bg-blue-600/90 border-blue-500/20"
            : "bg-white/10 border-white/10"
        }`}
      >
        <div
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            on ? "right-0.5" : "left-0.5"
          }`}
        />
      </div>
    </div>
  </button>
);

const ActionRow = ({ icon, title, subtitle }) => (
  <button className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-800/25 border border-blue-500/15 hover:border-blue-500/25 hover:bg-neutral-800/35 transition">
    <div className="flex items-center gap-3 min-w-0">
      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/10 p-2">
        {icon}
      </div>
      <div className="text-left min-w-0">
        <p className="text-sm font-semibold text-white truncate">{title}</p>
        <p className="text-xs text-gray-400 truncate">{subtitle}</p>
      </div>
    </div>
    <ChevronRight className="h-5 w-5 text-gray-300 shrink-0" />
  </button>
);

export default Profile;
