import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ColorBg from "@/components/ColorBg";
import { usePeriodPrediction } from "../hooks/usePeriodPrediction.js";
import PeriodCalendarHelper from "./PeriodCalendarHelper.js";
import periodStorage from "../../../infrastructure/storage/periodStorage.js";

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const toKey = (d) => {
  // local date key, avoids timezone shifts
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const buildMonthDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Monday-first padding
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = 6;

  const days = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
};

const Legend = React.memo(function Legend() {
  return (
    <div className="px-5 pt-3 pb-2">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white/90">Legend</div>
          <div className="text-xs text-white/40">Tap edit to update data</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-pink-400" />
            Period
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            Fertile
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="h-2.5 w-2.5 rounded-full bg-green-200" />
            Ovulation
          </div>
          <div className="flex items-center gap-2 text-white/70">
            <span className="h-5 w-5 rounded-xl border border-emerald-400/40 bg-white/5" />
            Today
          </div>
        </div>
      </div>
    </div>
  );
});

const DayCell = React.memo(function DayCell({
  date,
  isToday,
  isPeriod,
  isFertile,
  isOvulation,
  todayRef,
}) {
  if (!date) return <div className="aspect-square" />;

  const dayNum = date.getDate();
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const base =
    "relative w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-semibold transition-transform active:scale-[0.98]";

  const textColor = isPeriod || isFertile ? "text-white" : isWeekend ? "text-emerald-200" : "text-white/70";

  const surface = isToday
    ? "bg-white/10 border border-emerald-400/40"
    : "bg-white/5 border border-white/10";

  const periodSurface = isPeriod ? "bg-pink-500/25 border border-pink-500/40" : "";
  const fertileSurface = isFertile && !isPeriod ? "bg-emerald-500/15 border border-emerald-400/30" : "";

  return (
    <div ref={isToday ? todayRef : null} className="flex flex-col items-center">
      <div className={`${base} ${surface} ${periodSurface} ${fertileSurface} ${textColor}`}>
        {dayNum}

        {(isPeriod || isFertile) && (
          <div className="absolute -bottom-1 flex items-center gap-1">
            {isPeriod && <span className="h-1.5 w-1.5 rounded-full bg-pink-400" />}
            {isFertile && !isOvulation && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
            {isOvulation && <span className="h-1.5 w-1.5 rounded-full bg-green-200" />}
          </div>
        )}

        {isToday && <div className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-emerald-500/25" />}
      </div>

      {isToday && <div className="mt-1 text-[10px] font-bold tracking-wide text-emerald-200">TODAY</div>}
    </div>
  );
});

const Calendar = () => {
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState({
    lastPeriodDate: "",
    avgCycleLength: 28,
    periodDuration: 5,
  });
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const history = useHistory();
  const { futurePeriods, cycleLength, hasPeriodData, refresh } = usePeriodPrediction({ monthsAhead: 24 });

  const [viewMode, setViewMode] = useState("Month"); // Month or Year (UI only, keeping your toggle)

  const todayRef = useRef(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);
  console.log({cycleLength});
  

  const todayKey = useMemo(() => toKey(today), [today]);

  const monthsToShow = useMemo(() => {
    const months = [];
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    for (let i = 0; i < 14; i++) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      months.push({ year: monthDate.getFullYear(), month: monthDate.getMonth() });
    }
    return months;
  }, [today]);

  // Precompute calendar month helper once per month (only when needed)
  const monthCalendarData = useMemo(() => {
    if (!hasPeriodData || !futurePeriods?.length) return {};
    const data = {};
    for (const { year, month } of monthsToShow) {
      const key = `${year}-${month}`;
      data[key] = PeriodCalendarHelper.getCalendarMonthData({
        predictions: futurePeriods,
        cycleLength,
        year,
        month,
      });
    }
    return data;
  }, [monthsToShow, futurePeriods, cycleLength, hasPeriodData]);

  // Precompute markers sets per month. This removes getDateType calls during render.
  const monthMarkers = useMemo(() => {
    if (!hasPeriodData || !futurePeriods?.length) return {};
    const out = {};

    for (const { year, month } of monthsToShow) {
      const monthKey = `${year}-${month}`;
      const monthData = monthCalendarData[monthKey];
      if (!monthData) continue;

      const period = new Set();
      const fertile = new Set();
      const ovulation = new Set();

      // Iterate only actual days in this month.
      const last = new Date(year, month + 1, 0).getDate();
      for (let day = 1; day <= last; day++) {
        const d = new Date(year, month, day);
        d.setHours(0, 0, 0, 0);
        const t = monthData.getDateType(d); // heavy, but now only once per day, not per re-render
        const k = toKey(d);
        if (t === "period") period.add(k);
        if (t === "fertile") fertile.add(k);
        if (t === "ovulation") {
          fertile.add(k);
          ovulation.add(k);
        }
      }

      out[monthKey] = { period, fertile, ovulation };
    }

    return out;
  }, [hasPeriodData, futurePeriods, monthsToShow, monthCalendarData]);

  // Precompute day grids per month so render is just mapping arrays.
  const monthDaysMap = useMemo(() => {
    const map = {};
    for (const { year, month } of monthsToShow) {
      map[`${year}-${month}`] = buildMonthDays(year, month);
    }
    return map;
  }, [monthsToShow]);

  const handleClose = useCallback(() => {
    history.goBack();
  }, [history]);

  useEffect(() => {
    if (!todayRef.current) return;
    // Avoid forced layout at bad times
    const id = requestAnimationFrame(() => {
      try {
        todayRef.current?.scrollIntoView({ behavior: "auto", block: "center" });
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (editModal) {
      const currentData = periodStorage.get();
      setEditData({
        lastPeriodDate: currentData.lastPeriodDate || "",
        avgCycleLength: currentData.avgCycleLength || 28,
        periodDuration: currentData.periodDuration || 5,
      });
      setErrors({});
    }
  }, [editModal]);

  const validateEditData = useCallback(() => {
    const newErrors = {};
    if (!editData.lastPeriodDate) newErrors.lastPeriodDate = "Please select a period start date";
    if (editData.avgCycleLength < 21 || editData.avgCycleLength > 45)
      newErrors.avgCycleLength = "Cycle length should be between 21-45 days";
    if (editData.periodDuration < 1 || editData.periodDuration > 14)
      newErrors.periodDuration = "Period duration should be between 1-14 days";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [editData]);

  const handleSavePeriodData = useCallback(async () => {
    if (!validateEditData()) return;

    setIsSaving(true);
    try {
      periodStorage.save({
        lastPeriodDate: editData.lastPeriodDate,
        avgCycleLength: parseInt(editData.avgCycleLength, 10),
        periodDuration: parseInt(editData.periodDuration, 10),
      });
      refresh?.();
      setEditModal(false);
    } catch (error) {
      console.error("Error saving period data:", error);
      setErrors({ general: "Failed to save period data. Please try again." });
    } finally {
      setIsSaving(false);
    }
  }, [editData, refresh, validateEditData]);

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <ColorBg />

        <div className="min-h-full bg-[#1a43bf]">
          {/* Header */}
          <div
            className="sticky top-0 z-30 border-b border-white/10 bg-[#1a43bf]/60 backdrop-blur-xl"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 20px) + 8px)" }}
          >
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="px-5 pb-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={handleClose}
                  className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                >
                  <IonIcon icon={closeOutline} className="text-2xl text-white/70" />
                </button>

                <div className="text-center">
                  <div className="text-sm text-white/50">Calendar</div>
                  <div className="text-lg font-bold text-white">Cycle View</div>
                </div>

                <button
                  onClick={() => setEditModal(true)}
                  className="
                    h-10 min-w-[88px] px-4
                    rounded-2xl
                    border border-blue-400/25
                    bg-blue-500/15
                    text-blue-200
                    text-sm font-semibold
                    flex items-center justify-center
                    hover:bg-blue-500/20 hover:border-blue-400/35
                    active:scale-[0.98]
                    transition
                  "
                >
                  Edit
                </button>
              </div>

              {/* Month/Year Bar */}
              <div className="mt-3 flex justify-center">
                <div className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-white/5 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setViewMode("Month")}
                      className={`h-10 rounded-2xl text-sm font-extrabold transition ${
                        viewMode === "Month"
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/15"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setViewMode("Year")}
                      className={`h-10 rounded-2xl text-sm font-extrabold transition ${
                        viewMode === "Year"
                          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/15"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      Year
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Day headers */}
            <div className="px-5 pb-3">
              <div className="grid grid-cols-7 rounded-2xl border border-white/10 bg-white/5 px-2 py-2">
                {DAYS.map((d, i) => (
                  <div
                    key={i}
                    className={`text-center text-xs font-semibold ${i >= 5 ? "text-emerald-200" : "text-white/50"}`}
                  >
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Legend />

          {/* Calendar list */}
          <div className="px-5 pb-52">
            {monthsToShow.map(({ year, month }, monthIndex) => {
              const monthKey = `${year}-${month}`;
              const days = monthDaysMap[monthKey] || [];
              const markers = monthMarkers[monthKey];

              return (
                <div key={monthKey} className="mb-6">
                  <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 backdrop-blur-xl overflow-hidden">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-blue-400/20">
                      <div className="text-white font-bold">
                        {month === 0 || monthIndex === 0 ? `${MONTHS[month]} ${year}` : MONTHS[month]}
                      </div>
                      <div className="text-xs text-white/40">{hasPeriodData ? "Predicted" : "Add period data"}</div>
                    </div>

                    <div className="px-4 py-4">
                      <div className="grid grid-cols-7 gap-y-3 place-items-center">
                        {days.map((date, idx) => {
                          if (!date) return <div key={idx} className="aspect-square" />;

                          const key = toKey(date);
                          const isToday = key === todayKey;

                          const isPeriod = markers?.period?.has(key) || false;
                          const isOvu = markers?.ovulation?.has(key) || false;
                          const isFertile = isOvu || markers?.fertile?.has(key) || false;

                          return (
                            <DayCell
                              key={idx}
                              date={date}
                              isToday={isToday}
                              isPeriod={isPeriod}
                              isFertile={isFertile}
                              isOvulation={isOvu}
                              todayRef={todayRef}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom action bar */}
          <div
            className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#1a43bf]/70 backdrop-blur-xl"
            style={{ paddingBottom: "calc(86px + env(safe-area-inset-bottom, 0px))" }}
          >
            <div className="px-5 py-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditModal(true)}
                className="
                  w-full h-12
                  rounded-2xl
                  bg-gradient-to-r from-emerald-600 to-green-500
                  hover:from-emerald-500 hover:to-green-400
                  text-white text-[15px] font-extrabold
                  shadow-lg shadow-emerald-500/20
                  flex items-center justify-center
                  transition
                "
              >
                Edit period dates
              </motion.button>
            </div>
          </div>

          {/* Modal */}
          <AnimatePresence>
            {editModal && (
              <div className="fixed inset-0 z-50 flex items-end">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#1a43bf]/70"
                  onClick={() => setEditModal(false)}
                />

                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 320 }}
                  className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-[32px] border-t border-white/10 bg-[#1a43bf]"
                >
                  <div className="sticky top-0 z-10 bg-[#1a43bf]/90 backdrop-blur-xl border-b border-white/10 px-5 py-4 rounded-t-[32px]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/50">Update</div>
                        <div className="text-xl font-extrabold text-white">Period Data</div>
                      </div>
                      <button
                        onClick={() => setEditModal(false)}
                        className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center justify-center"
                      >
                        <IonIcon icon={closeOutline} className="text-2xl text-white/70" />
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {errors.general && (
                      <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-4">
                        <div className="text-sm text-red-200">{errors.general}</div>
                      </div>
                    )}

                    <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-4">
                      <label className="block text-xs font-semibold text-white/60">Last Period Start</label>
                      <input
                        type="date"
                        value={editData.lastPeriodDate}
                        onChange={(e) => {
                          setEditData({ ...editData, lastPeriodDate: e.target.value });
                          if (errors.lastPeriodDate) setErrors({ ...errors, lastPeriodDate: "" });
                        }}
                        className={`mt-2 w-full rounded-2xl border px-4 py-3 text-base bg-[#1a43bf]/30 text-white outline-none transition
                          ${
                            errors.lastPeriodDate
                              ? "border-red-500/40 focus:border-red-500/60"
                              : "border-blue-400/30 focus:border-blue-500/50"
                          }`}
                      />
                      {errors.lastPeriodDate && <div className="mt-2 text-xs text-red-300">{errors.lastPeriodDate}</div>}
                      <div className="mt-2 text-xs text-white/40">Used to predict upcoming cycles.</div>
                    </div>

                    <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white/60">Average Cycle</div>
                          <div className="text-xs text-white/40">Typical length between periods</div>
                        </div>
                        <div className="text-lg font-extrabold text-blue-200">{editData.avgCycleLength}d</div>
                      </div>

                      <input
                        type="range"
                        min="21"
                        max="45"
                        value={editData.avgCycleLength}
                        onChange={(e) => {
                          setEditData({ ...editData, avgCycleLength: parseInt(e.target.value, 10) });
                          if (errors.avgCycleLength) setErrors({ ...errors, avgCycleLength: "" });
                        }}
                        className="mt-4 w-full accent-blue-500"
                      />

                      <div className="mt-2 flex justify-between text-[11px] text-white/35">
                        <span>21</span>
                        <span>45</span>
                      </div>

                      {errors.avgCycleLength && <div className="mt-2 text-xs text-red-300">{errors.avgCycleLength}</div>}
                    </div>

                    <div className="rounded-3xl border border-blue-400/30 bg-blue-500/10 p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-xs font-semibold text-white/60">Period Duration</div>
                          <div className="text-xs text-white/40">How many days bleeding lasts</div>
                        </div>
                        <div className="text-lg font-extrabold text-blue-200">{editData.periodDuration}d</div>
                      </div>

                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={editData.periodDuration}
                        onChange={(e) => {
                          setEditData({ ...editData, periodDuration: parseInt(e.target.value, 10) });
                          if (errors.periodDuration) setErrors({ ...errors, periodDuration: "" });
                        }}
                        className="mt-4 w-full accent-blue-500"
                      />

                      <div className="mt-2 flex justify-between text-[11px] text-white/35">
                        <span>1</span>
                        <span>14</span>
                      </div>

                      {errors.periodDuration && <div className="mt-2 text-xs text-red-300">{errors.periodDuration}</div>}
                    </div>

                    <div className="rounded-3xl border border-blue-500/20 bg-blue-900/10 p-4">
                      <div className="text-xs text-blue-100">Better data = better predictions.</div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSavePeriodData}
                        disabled={isSaving}
                        className="
                          w-full h-12
                          rounded-2xl
                          bg-gradient-to-r from-blue-600 to-blue-500
                          hover:from-blue-500 hover:to-blue-400
                          disabled:opacity-60 disabled:cursor-not-allowed
                          text-white text-[15px] font-extrabold
                          shadow-lg shadow-blue-500/20
                          flex items-center justify-center gap-2
                          transition
                        "
                      >
                        <IonIcon icon={checkmarkOutline} className="text-xl" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </motion.button>

                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setEditModal(false)}
                        disabled={isSaving}
                        className="w-full h-12 rounded-2xl border border-white/10 bg-white/5 text-white/80 font-bold transition disabled:opacity-60"
                      >
                        Cancel
                      </motion.button>
                    </div>

                    <div className="h-3" />
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Calendar;
