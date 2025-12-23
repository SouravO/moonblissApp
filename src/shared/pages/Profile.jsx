import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import PageLayout from "@/shared/layout/PageLayout";
import ColorBg from "@/components/ColorBg";
import { storageService } from "@/infrastructure/storage/storageService";
import {
  LogOut,
  Mail,
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
  Check,
  Pencil,
  Download,
  HelpCircle,
  ChevronRight as LucideChevronRight,
  Lock,
} from "lucide-react";

/* --------------------------- Persistence --------------------------- */
const usePersistentState = (key, defaultValue) => {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [key, state]);

  return [state, setState];
};

const clampNum = (v, min, max, fallback) => {
  const n = Number(v);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
};

const toISODate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "";
  const yyyy = x.getFullYear();
  const mm = String(x.getMonth() + 1).padStart(2, "0");
  const dd = String(x.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const fmtShort = (d) => {
  if (!d) return "Not set";
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "Not set";
  try {
    return x.toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "Not set";
  }
};

const addDays = (d, days) => {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
};

const daysBetween = (a, b) => {
  if (!a || !b) return null;
  const MS = 1000 * 60 * 60 * 24;
  const aa = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const bb = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((bb - aa) / MS);
};

/* --------------------------- Main --------------------------- */
const Profile = () => {
  const history = useHistory();

  // Profile (editable + persistent)
  const [name, setName] = usePersistentState("mb_profile_name", "Alex Rivera");
  const [email, setEmail] = usePersistentState(
    "mb_profile_email",
    "alex@example.com"
  );
  const [dateOfBirth, setDateOfBirth] = usePersistentState(
    "mb_profile_dob",
    ""
  );
  const [ageManual, setAgeManual] = usePersistentState(
    "mb_profile_age_manual",
    26
  );

  // Profile photo (base64 data URL, persistent)
  const [photoDataUrl, setPhotoDataUrl] = usePersistentState(
    "mb_profile_photo",
    ""
  );

  // Cycle (editable + persistent)
  const [lastPeriodStart, setLastPeriodStart] = usePersistentState(
    "mb_cycle_last_start",
    ""
  );
  const [cycleLength, setCycleLength] = usePersistentState(
    "mb_cycle_length",
    28
  );
  const [periodLength, setPeriodLength] = usePersistentState(
    "mb_period_length",
    5
  );

  // Wellness (editable + persistent)
  const [hydrationGoalMl, setHydrationGoalMl] = usePersistentState(
    "mb_goal_hydration",
    2200
  );
  const [sleepGoalHrs, setSleepGoalHrs] = usePersistentState(
    "mb_goal_sleep",
    8
  );
  const [movementGoalMin, setMovementGoalMin] = usePersistentState(
    "mb_goal_move",
    30
  );

  const [hydrationToday, setHydrationToday] = usePersistentState(
    "mb_today_hydration",
    1650
  );
  const [sleepLast, setSleepLast] = usePersistentState("mb_last_sleep", 7.2);
  const [movementToday, setMovementToday] = usePersistentState(
    "mb_today_move",
    22
  );

  // Preferences (editable + persistent)
  const [prefs, setPrefs] = usePersistentState("mb_prefs_v3", {
    notifications: true,
    darkMode: true,
    hydrationReminders: true,
    restReminders: true,
    symptomInsights: true,
  });

  const [isEditing, setIsEditing] = useState(false);

  /* --------------------------- Logout --------------------------- */
  const logout = (mode = "wipe_data") => {
    try {
      console.log("Logging out - mode:", mode);
      
      // Use storageService to properly clear all data
      if (mode === "wipe_data") {
        storageService.clearAllData();
      } else {
        // Just clear auth but keep some profile data
        storageService.onboardingService.reset();
      }
      
      // Also clear all custom localStorage keys that might be in use
      const keysToRemove = [
        "moonbliss_period_data",
        "mb_profile_name",
        "mb_profile_email",
        "mb_profile_dob",
        "mb_profile_age_manual",
        "mb_profile_photo",
        "mb_cycle_last_start",
        "mb_cycle_length",
        "mb_period_length",
        "mb_goal_hydration",
        "mb_goal_sleep",
        "mb_goal_move",
        "mb_today_hydration",
        "mb_last_sleep",
        "mb_today_move",
        "mb_prefs_v3",
      ];
      
      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {
          // ignore individual key removal errors
        }
      });
      
      console.log("Data cleared, dispatching logout event");
      
      // Dispatch custom event to trigger AppRouter re-check
      window.dispatchEvent(new Event("onboarding-complete"));
      
      // Redirect to onboarding/login page
      setTimeout(() => {
        history.push("/");
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  /* --------------------------- Photo upload helpers --------------------------- */
  const MAX_BYTES = 900_000; // ~0.9MB (localStorage safety)

  const fileToDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const compressImageToDataUrl = (file, { maxW = 512, quality = 0.82 } = {}) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const scale = Math.min(1, maxW / img.width);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          const dataUrl = canvas.toDataURL("image/jpeg", quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };

      img.onerror = (e) => {
        URL.revokeObjectURL(url);
        reject(e);
      };

      img.src = url;
    });

  const onPickPhoto = async (file) => {
    if (!file) return;
    if (!file.type?.startsWith("image/")) return;

    try {
      const dataUrl = await compressImageToDataUrl(file, {
        maxW: 512,
        quality: 0.82,
      });

      if (dataUrl.length > MAX_BYTES) {
        const smaller = await compressImageToDataUrl(file, {
          maxW: 384,
          quality: 0.72,
        });
        if (smaller.length > MAX_BYTES) return;
        setPhotoDataUrl(smaller);
        return;
      }

      setPhotoDataUrl(dataUrl);
    } catch {
      try {
        const dataUrl = await fileToDataUrl(file);
        if (dataUrl.length <= MAX_BYTES) setPhotoDataUrl(dataUrl);
      } catch {
        // ignore
      }
    }
  };

  const removePhoto = () => setPhotoDataUrl("");

  /* --------------------------- Derived --------------------------- */
  const userAge = useMemo(() => {
    const dob = dateOfBirth ? new Date(dateOfBirth) : null;
    if (dob && !Number.isNaN(dob.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate()))
        age--;
      return age;
    }
    return Number(ageManual) ? Number(ageManual) : null;
  }, [dateOfBirth, ageManual]);

  const cycle = useMemo(() => {
    const cl = clampNum(cycleLength, 20, 60, 28);
    const pl = clampNum(periodLength, 2, 10, 5);

    const start = lastPeriodStart ? new Date(lastPeriodStart) : null;
    const startValid = start && !Number.isNaN(start.getTime()) ? start : null;

    const today = new Date();
    const nextPeriod = startValid ? addDays(startValid, cl) : null;
    const periodEnd = startValid
      ? addDays(startValid, Math.max(0, pl - 1))
      : null;
    const ovulation = nextPeriod ? addDays(nextPeriod, -14) : null;

    const dToNext = nextPeriod ? daysBetween(today, nextPeriod) : null;
    const dFromStart = startValid
      ? Math.max(0, daysBetween(startValid, today))
      : null;

    let phase = "Not tracking";
    let hint = "Add last period start to unlock insights.";
    let badge = "Ready";
    let tone = "from-blue-500/15 to-indigo-600/10";

    if (startValid && nextPeriod) {
      const day = dFromStart;

      if (day <= pl - 1) {
        phase = "Period";
        hint = "Hydrate, warm foods, gentle movement.";
        badge = "Care";
        tone = "from-sky-500/18 to-blue-600/10";
      } else if (day <= 12) {
        phase = "Follicular";
        hint = "Energy may rise. Great for strength and deep work.";
        badge = "Build";
        tone = "from-cyan-500/18 to-indigo-600/10";
      } else if (ovulation && Math.abs(daysBetween(today, ovulation)) <= 2) {
        phase = "Ovulation";
        hint = "Peak window. Prioritize protein and strength sessions.";
        badge = "Peak";
        tone = "from-indigo-500/18 to-violet-600/10";
      } else if (dToNext != null && dToNext <= 10) {
        phase = "Luteal";
        hint = "Sleep first. Reduce late caffeine. Keep steps steady.";
        badge = "Steady";
        tone = "from-indigo-600/18 to-blue-600/10";
      } else {
        phase = "Cycle";
        hint = "You are on track. Keep routine consistent.";
        badge = "On track";
        tone = "from-blue-500/18 to-cyan-500/10";
      }
    }

    return {
      cl,
      pl,
      startValid,
      nextPeriod,
      periodEnd,
      ovulation,
      dToNext,
      phase,
      hint,
      badge,
      tone,
    };
  }, [lastPeriodStart, cycleLength, periodLength]);

  const wellness = useMemo(() => {
    const hGoal = clampNum(hydrationGoalMl, 1000, 5000, 2200);
    const sGoal = clampNum(sleepGoalHrs, 5, 12, 8);
    const mGoal = clampNum(movementGoalMin, 5, 180, 30);

    const hToday = clampNum(hydrationToday, 0, 8000, 0);
    const sLast = clampNum(sleepLast, 0, 24, 0);
    const mToday = clampNum(movementToday, 0, 500, 0);

    const pct = (a, b) =>
      Math.max(0, Math.min(100, (a / Math.max(1, b)) * 100));

    return {
      hGoal,
      sGoal,
      mGoal,
      hToday,
      sLast,
      mToday,
      hPct: pct(hToday, hGoal),
      sPct: pct(sLast, sGoal),
      mPct: pct(mToday, mGoal),
    };
  }, [
    hydrationGoalMl,
    sleepGoalHrs,
    movementGoalMin,
    hydrationToday,
    sleepLast,
    movementToday,
  ]);

  const avatarSeed = useMemo(
    () => encodeURIComponent((email || name || "moon").trim()),
    [email, name]
  );

  const togglePref = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const wipeLocal = () => {
    try {
      const all = Object.keys(localStorage);
      all.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const exportJSON = () => {
    const payload = {
      profile: {
        name,
        email,
        dateOfBirth,
        age: userAge,
        photo: !!photoDataUrl,
      },
      cycle: {
        lastPeriodStart,
        cycleLength: clampNum(cycleLength, 20, 60, 28),
        periodLength: clampNum(periodLength, 2, 10, 5),
        nextPeriod: cycle.nextPeriod
          ? new Date(cycle.nextPeriod).toISOString()
          : null,
        ovulation: cycle.ovulation
          ? new Date(cycle.ovulation).toISOString()
          : null,
        phase: cycle.phase,
      },
      wellness: {
        hydrationGoalMl: wellness.hGoal,
        sleepGoalHrs: wellness.sGoal,
        movementGoalMin: wellness.mGoal,
        hydrationToday: wellness.hToday,
        sleepLast: wellness.sLast,
        movementToday: wellness.mToday,
      },
      prefs,
      exportedAt: new Date().toISOString(),
    };

    try {
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moonbliss_profile_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  };

  return (
    <PageLayout>
      <ColorBg />

      <div className="relative min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30 overflow-hidden">
        {/* Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px]" />
          <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[30%] rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] [background-size:34px_34px]" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          {/* Header */}
          <header className="flex items-start justify-end mb-10 sm:mb-12">
            <div className="flex gap-2">
              {/* Customize Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing((s) => !s)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                  isEditing
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40"
                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                }`}
                title={isEditing ? "Save Profile" : "Customize"}
              >
                {isEditing ? <Check size={20} /> : <Pencil size={20} />}
              </motion.button>

              {/* Export Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportJSON}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-all"
                title="Export Profile"
              >
                <Download size={20} />
              </motion.button>

              {/* Logout Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => logout("wipe_data")}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/25 transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </header>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* 1) Identity (Large) */}
            <motion.section
              layout
              className="md:col-span-8 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 backdrop-blur-md relative overflow-hidden"
            >
              <div
                className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${cycle.tone}`}
              />

              <div className="relative flex flex-col sm:flex-row items-center gap-7 sm:gap-8">
                <div className="relative">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-blue-500/20 shadow-2xl bg-black/20">
                    <img
                      src={
                        photoDataUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`
                      }
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl border-4 border-[#020617]">
                    <Activity size={16} />
                  </div>

                  {/* Upload UI (only in edit mode) */}
                  {isEditing ? (
                    <div className="mt-4 flex flex-col sm:flex-row items-center gap-2 justify-center sm:justify-start">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-black bg-white/5 hover:bg-white/10 border border-white/10 transition">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onPickPhoto(e.target.files?.[0])}
                        />
                        Upload photo
                      </label>

                      <button
                        type="button"
                        onClick={removePhoto}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-2xl font-black bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}

                  {isEditing ? (
                    <p className="mt-2 text-[11px] text-slate-500 text-center sm:text-left">
                      Tip: Use a small image. Stored locally on device.
                    </p>
                  ) : null}
                </div>

                <div className="flex-1 text-center sm:text-left min-w-0">
                  {isEditing ? (
                    <input
                      className="bg-white/5 border border-blue-500/30 rounded-xl px-3 py-2 text-3xl sm:text-4xl font-black w-full focus:outline-none"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  ) : (
                    <h2 className="text-3xl sm:text-4xl font-black mb-1 truncate">
                      {name}
                    </h2>
                  )}

                  <div className="mt-2 flex items-center justify-center sm:justify-start gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-200 font-black">
                      {cycle.badge}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-200 font-black">
                      Phase: {cycle.phase}
                    </span>
                    {cycle.dToNext != null && (
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-black">
                        {cycle.dToNext >= 0
                          ? `${cycle.dToNext}d to next`
                          : "Overdue"}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-slate-300/90">{cycle.hint}</p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5">
                    <Chip>
                      <Mail size={14} className="text-blue-400" />
                      {isEditing ? (
                        <input
                          className="bg-transparent focus:outline-none w-[180px] sm:w-[220px]"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      ) : (
                        <span className="truncate">{email || "Not set"}</span>
                      )}
                    </Chip>

                    <Chip>
                      <Cake size={14} className="text-indigo-400" />
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            className="bg-transparent focus:outline-none"
                            value={toISODate(dateOfBirth)}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                          />
                          <span className="text-slate-500 text-xs">or</span>
                          <input
                            type="number"
                            className="bg-transparent focus:outline-none w-14"
                            value={ageManual}
                            onChange={(e) => setAgeManual(e.target.value)}
                          />
                        </div>
                      ) : (
                        <span>
                          {userAge != null ? `${userAge} years` : "Not set"}
                        </span>
                      )}
                    </Chip>
                  </div>

                  <div className="mt-5 flex flex-wrap justify-center sm:justify-start gap-3">
                    <MiniStat
                      icon={
                        <CalendarDays size={16} className="text-blue-300" />
                      }
                      label="Next period"
                      value={fmtShort(cycle.nextPeriod)}
                    />
                    <MiniStat
                      icon={<Flame size={16} className="text-indigo-300" />}
                      label="Ovulation"
                      value={fmtShort(cycle.ovulation)}
                    />
                    <MiniStat
                      icon={<Leaf size={16} className="text-cyan-300" />}
                      label="Cycle"
                      value={`${cycle.cl}d / ${cycle.pl}d`}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 2) Quick Settings (Small) */}
            <motion.section className="md:col-span-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] p-7 sm:p-8 flex flex-col justify-between shadow-xl shadow-blue-900/20">
              <div className="flex justify-between items-start">
                <ShieldCheck size={32} className="text-white/80" />
                <Settings size={20} className="text-white/60" />
              </div>

              <div className="mt-6">
                <h3 className="text-2xl font-black text-white mb-1">
                  Privacy Pro
                </h3>
                <p className="text-blue-100/75 text-sm">
                  Stored locally on this device. No server sync here.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <QuickToggle
                    icon={<Bell size={16} />}
                    label="Notify"
                    on={prefs.notifications}
                    onClick={() => togglePref("notifications")}
                  />
                  <QuickToggle
                    icon={<Moon size={16} />}
                    label="Dark"
                    on={prefs.darkMode}
                    onClick={() => togglePref("darkMode")}
                  />
                </div>
              </div>
            </motion.section>

            {/* 3) Cycle Metrics (Medium) */}
            <motion.section className="md:col-span-5 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-7 sm:p-8">
              <div className="flex items-center justify-between gap-3 mb-7">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-pink-500/10 rounded-2xl text-pink-400">
                    <HeartPulse size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Cycle Radar</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Editable and persistent.
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300 font-black">
                  {cycle.phase}
                </span>
              </div>

              <div className="space-y-5">
                <MetricInput
                  label="Last period start"
                  value={toISODate(lastPeriodStart)}
                  unit=""
                  onEdit={setLastPeriodStart}
                  isEditing={isEditing}
                  type="date"
                  color="blue"
                />
                <MetricInput
                  label="Average cycle"
                  value={cycleLength}
                  unit="days"
                  onEdit={(v) => setCycleLength(clampNum(v, 20, 60, 28))}
                  isEditing={isEditing}
                  color="blue"
                />
                <MetricInput
                  label="Period duration"
                  value={periodLength}
                  unit="days"
                  onEdit={(v) => setPeriodLength(clampNum(v, 2, 10, 5))}
                  isEditing={isEditing}
                  color="pink"
                />

                <div className="mt-3 rounded-[2rem] bg-white/5 border border-white/10 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/15 border border-blue-500/25 rounded-2xl p-3">
                        <CalendarDays size={18} className="text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">Next period</p>
                        <p className="text-xs text-slate-400">
                          {fmtShort(cycle.nextPeriod)}
                        </p>
                      </div>
                    </div>
                    <LucideChevronRight className="text-slate-400" size={18} />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <SoftKV k="Ovulation" v={fmtShort(cycle.ovulation)} />
                    <SoftKV k="Period end" v={fmtShort(cycle.periodEnd)} />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 4) Wellness Bento (Wide) */}
            <motion.section className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BentoCard
                icon={<Droplets className="text-cyan-400 mb-4" size={28} />}
                title="Hydration"
                value={`${Math.round(wellness.hPct)}%`}
                sub={`${wellness.hToday} / ${wellness.hGoal} ml`}
                editing={isEditing}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <RangeRow
                      label="Today (ml)"
                      min={0}
                      max={Math.max(1000, wellness.hGoal)}
                      value={wellness.hToday}
                      onChange={(v) =>
                        setHydrationToday(clampNum(v, 0, 8000, 0))
                      }
                    />
                    <RangeRow
                      label="Goal (ml)"
                      min={1000}
                      max={5000}
                      value={wellness.hGoal}
                      onChange={(v) =>
                        setHydrationGoalMl(clampNum(v, 1000, 5000, 2200))
                      }
                    />
                  </div>
                ) : null}
              </BentoCard>

              <BentoCard
                icon={<BedDouble className="text-indigo-400 mb-4" size={28} />}
                title="Sleep"
                value={`${Math.round(wellness.sPct)}%`}
                sub={`${wellness.sLast} / ${wellness.sGoal} hrs`}
                editing={isEditing}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <RangeRow
                      label="Last night (hrs)"
                      min={0}
                      max={12}
                      step={0.1}
                      value={wellness.sLast}
                      onChange={(v) => setSleepLast(clampNum(v, 0, 24, 0))}
                    />
                    <RangeRow
                      label="Goal (hrs)"
                      min={5}
                      max={12}
                      step={0.1}
                      value={wellness.sGoal}
                      onChange={(v) => setSleepGoalHrs(clampNum(v, 5, 12, 8))}
                    />
                  </div>
                ) : null}
              </BentoCard>

              <BentoCard
                icon={<Activity className="text-emerald-400 mb-4" size={28} />}
                title="Movement"
                value={`${Math.round(wellness.mPct)}%`}
                sub={`${wellness.mToday} / ${wellness.mGoal} min`}
                editing={isEditing}
                className="sm:col-span-2"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <RangeRow
                      label="Today (min)"
                      min={0}
                      max={Math.max(30, wellness.mGoal * 2)}
                      value={wellness.mToday}
                      onChange={(v) => setMovementToday(clampNum(v, 0, 500, 0))}
                    />
                    <RangeRow
                      label="Goal (min)"
                      min={5}
                      max={180}
                      value={wellness.mGoal}
                      onChange={(v) =>
                        setMovementGoalMin(clampNum(v, 5, 180, 30))
                      }
                    />
                  </div>
                ) : null}
              </BentoCard>

              {/* Tip strip */}
              <div className="sm:col-span-2 bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-[2rem] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="bg-emerald-400 rounded-full p-2 shrink-0">
                    <Leaf size={16} className="text-black" />
                  </div>
                  <p className="text-sm font-black text-emerald-200 truncate">
                    Tip for {cycle.phase}:{" "}
                    <span className="font-medium text-emerald-100/90">
                      {cycle.hint}
                    </span>
                  </p>
                </div>
                <LucideChevronRight
                  size={18}
                  className="text-emerald-400 shrink-0"
                />
              </div>
            </motion.section>

            {/* 5) Preferences */}
            <motion.section className="md:col-span-12 bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-black">Preferences</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Persisted toggles.
                  </p>
                </div>
                <span className="text-xs text-slate-400">Tap to toggle</span>
              </div>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <PrefTile
                  icon={<Bell size={18} className="text-blue-300" />}
                  title="Notifications"
                  subtitle="Reminders and updates"
                  on={prefs.notifications}
                  onClick={() => togglePref("notifications")}
                />
                <PrefTile
                  icon={<Moon size={18} className="text-indigo-300" />}
                  title="Dark mode"
                  subtitle="Stay in dark theme"
                  on={prefs.darkMode}
                  onClick={() => togglePref("darkMode")}
                />
                <PrefTile
                  icon={<Droplets size={18} className="text-cyan-300" />}
                  title="Hydration reminders"
                  subtitle="Cycle-aware nudges"
                  on={prefs.hydrationReminders}
                  onClick={() => togglePref("hydrationReminders")}
                />
                <PrefTile
                  icon={<BedDouble size={18} className="text-indigo-200" />}
                  title="Rest reminders"
                  subtitle="Recovery prompts"
                  on={prefs.restReminders}
                  onClick={() => togglePref("restReminders")}
                />
                <PrefTile
                  icon={<HeartPulse size={18} className="text-pink-300" />}
                  title="Symptom insights"
                  subtitle="Trends and patterns"
                  on={prefs.symptomInsights}
                  onClick={() => togglePref("symptomInsights")}
                />
                <PrefTile
                  icon={<Settings size={18} className="text-slate-200" />}
                  title="App settings"
                  subtitle="More controls later"
                  on={true}
                  onClick={() => {}}
                  lock
                />
              </div>
            </motion.section>

            {/* 6) Privacy, Data, Support */}
            <motion.section className="md:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-4">
              <ActionCard
                icon={<ShieldCheck size={22} className="text-blue-300" />}
                title="Privacy controls"
                subtitle="Permissions and data sharing"
                right={
                  <LucideChevronRight size={18} className="text-slate-400" />
                }
              />
              <ActionCard
                icon={<Download size={22} className="text-blue-300" />}
                title="Export my data"
                subtitle="Download JSON export"
                onClick={exportJSON}
                right={
                  <LucideChevronRight size={18} className="text-slate-400" />
                }
              />
              <ActionCard
                icon={<HelpCircle size={22} className="text-blue-300" />}
                title="Help & support"
                subtitle="FAQs and contact"
                right={
                  <LucideChevronRight size={18} className="text-slate-400" />
                }
              />
            </motion.section>

            {/* 7) Dangerous / Logout */} 
            <motion.section className="md:col-span-12 flex flex-col sm:flex-row gap-4 mt-2">
              <button
                onClick={wipeLocal}
                className="flex-1 flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-5 rounded-[2rem] font-black transition-all"
              >
                <LogOut size={20} />
                Wipe Local History
              </button>

              <button
                onClick={() => logout("wipe_data")}
                className="flex-1 flex items-center justify-center gap-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 py-5 rounded-[2rem] font-black transition-all"
              >
                <LogOut size={20} />
                Logout (clear app data)
              </button>
            </motion.section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

/* --------------------------- Sub Components --------------------------- */

const Chip = ({ children }) => (
  <div className="flex items-center gap-2 text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 max-w-full">
    {children}
  </div>
);

const MiniStat = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2">
    {icon}
    <div className="leading-tight">
      <p className="text-[11px] text-slate-400 font-black">{label}</p>
      <p className="text-xs text-slate-200 font-black">{value}</p>
    </div>
  </div>
);

const QuickToggle = ({ icon, label, on, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 border transition ${
      on
        ? "bg-white/15 border-white/20"
        : "bg-white/10 border-white/10 hover:bg-white/15"
    }`}
  >
    <div className="flex items-center gap-2 text-white/90">
      {icon}
      <span className="text-xs font-black">{label}</span>
    </div>
    <div
      className={`h-5 w-10 rounded-full border relative transition ${
        on ? "bg-blue-200/20 border-white/20" : "bg-black/20 border-white/10"
      }`}
    >
      <div
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "right-0.5" : "left-0.5"
        }`}
      />
    </div>
  </button>
);

const MetricInput = ({
  label,
  value,
  unit,
  onEdit,
  isEditing,
  color,
  type = "number",
}) => {
  const accentColor = color === "blue" ? "text-blue-400" : "text-pink-400";
  const borderColor =
    color === "blue" ? "border-blue-500/30" : "border-pink-500/30";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-slate-400 text-sm font-black">{label}</p>
      </div>

      <div
        className={`flex items-center gap-2 font-mono text-xl ${accentColor}`}
      >
        {isEditing ? (
          <input
            type={type}
            className={`bg-white/5 border ${borderColor} rounded-xl px-3 py-2 w-[160px] sm:w-[180px] focus:outline-none`}
            value={value ?? ""}
            onChange={(e) => onEdit(e.target.value)}
          />
        ) : (
          <span className="font-black">{value || "Not set"}</span>
        )}
        {unit ? (
          <span className="text-xs uppercase font-sans text-slate-500">
            {unit}
          </span>
        ) : null}
      </div>
    </div>
  );
};

const SoftKV = ({ k, v }) => (
  <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
    <p className="text-[11px] text-slate-400 font-black">{k}</p>
    <p className="text-xs text-slate-200 font-black mt-1">{v}</p>
  </div>
);

const BentoCard = ({
  icon,
  title,
  value,
  sub,
  editing,
  className = "",
  children,
}) => (
  <div
    className={`bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 group hover:bg-white/[0.06] transition-colors ${className}`}
  >
    {icon}
    <span className="block text-slate-400 text-sm font-black mb-1">
      {title}
    </span>
    <div className="flex items-end justify-between gap-3">
      <div>
        <span className="text-3xl font-black">{value}</span>
        <p className="text-xs text-slate-400 mt-1">{sub}</p>
      </div>
      {editing ? (
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-200 font-black">
          EDIT
        </span>
      ) : null}
    </div>
    {children ? <div className="mt-4">{children}</div> : null}
  </div>
);

const RangeRow = ({ label, value, onChange, min, max, step = 1 }) => (
  <div className="rounded-2xl bg-black/20 border border-white/10 p-3">
    <div className="flex items-center justify-between">
      <p className="text-xs text-slate-400 font-black">{label}</p>
      <p className="text-xs text-slate-200 font-black">{value}</p>
    </div>
    <input
      type="range"
      className="w-full mt-3 h-1 accent-cyan-400"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const PrefTile = ({ icon, title, subtitle, on, onClick, lock }) => (
  <button
    onClick={onClick}
    disabled={!!lock}
    className={`text-left rounded-[2rem] border p-5 transition ${
      lock
        ? "bg-white/5 border-white/10 opacity-60 cursor-not-allowed"
        : on
        ? "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/15"
        : "bg-white/5 border-white/10 hover:bg-white/10"
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-2">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black text-white truncate">{title}</p>
          <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
        </div>
      </div>
      <div
        className={`relative h-6 w-12 rounded-full border transition ${
          on
            ? "bg-blue-600/70 border-blue-500/20"
            : "bg-black/20 border-white/10"
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

const ActionCard = ({ icon, title, subtitle, right, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-6 hover:bg-white/[0.06] transition flex items-center justify-between gap-4"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className="rounded-2xl bg-white/5 border border-white/10 p-3">
        {icon}
      </div>
      <div className="min-w-0 text-left">
        <p className="text-sm font-black text-white truncate">{title}</p>
        <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
      </div>
    </div>
    {right}
  </button>
);

export default Profile;
