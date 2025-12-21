import React, { useState, useEffect, useRef, useMemo } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { closeOutline, checkmarkOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { motion } from "framer-motion";
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

/**
 * Period Calendar Component - Flow App Style
 * Scrollable vertical calendar with period tracking
 *
 * RULE: Uses usePeriodPrediction hook for all period data
 * RULE: Uses PeriodCalendarHelper for calendar display logic
 */
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
  const { futurePeriods, cycleLength, periodDuration, hasPeriodData, loading, refresh } =
    usePeriodPrediction({ monthsAhead: 24 });

  const [viewMode, setViewMode] = useState("Month"); // Month or Year
  const scrollContainerRef = useRef(null);
  const todayRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate months to display (6 months before and 6 months after current)
  const monthsToShow = useMemo(() => {
    const months = [];
    const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    for (let i = 0; i < 14; i++) {
      const monthDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + i,
        1
      );
      months.push({
        year: monthDate.getFullYear(),
        month: monthDate.getMonth(),
      });
    }
    return months;
  }, []);

  // Pre-compute calendar data for all visible months
  const monthCalendarData = useMemo(() => {
    if (!hasPeriodData || !futurePeriods.length) return {};

    const data = {};
    monthsToShow.forEach(({ year, month }) => {
      const key = `${year}-${month}`;
      data[key] = PeriodCalendarHelper.getCalendarMonthData({
        predictions: futurePeriods,
        cycleLength,
        year,
        month,
      });
    });
    return data;
  }, [monthsToShow, futurePeriods, cycleLength, hasPeriodData]);

  // Generate calendar days for a month (Monday start)
  const generateMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    let startPadding = firstDay.getDay() - 1;
    if (startPadding < 0) startPadding = 6;

    const days = [];

    // Previous month padding (empty slots)
    for (let i = 0; i < startPadding; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    return days;
  };

  // Get day styling info using PeriodCalendarHelper
  const getDayInfo = (date, year, month) => {
    if (!date) return {};

    const isToday = date.toDateString() === today.toDateString();

    // Get calendar data for this month
    const monthKey = `${year}-${month}`;
    const monthData = monthCalendarData[monthKey];

    if (!monthData) {
      return { isToday, isPeriod: false, isFertile: false, isOvulation: false };
    }

    const dateType = monthData.getDateType(date);

    return {
      isToday,
      isPeriod: dateType === "period",
      isFertile: dateType === "fertile" || dateType === "ovulation",
      isOvulation: dateType === "ovulation",
    };
  };

  // Scroll to current month on mount
  useEffect(() => {
    setTimeout(() => {
      if (todayRef.current) {
        todayRef.current.scrollIntoView({ behavior: "auto", block: "center" });
      }
    }, 100);
  }, []);

  // Load current period data when modal opens
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

  const handleClose = () => {
    history.goBack();
  };

  const validateEditData = () => {
    const newErrors = {};

    if (!editData.lastPeriodDate) {
      newErrors.lastPeriodDate = "Please select a period start date";
    }

    if (editData.avgCycleLength < 21 || editData.avgCycleLength > 45) {
      newErrors.avgCycleLength = "Cycle length should be between 21-45 days";
    }

    if (editData.periodDuration < 1 || editData.periodDuration > 14) {
      newErrors.periodDuration = "Period duration should be between 1-14 days";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSavePeriodData = async () => {
    if (!validateEditData()) {
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage via periodStorage
      periodStorage.save({
        lastPeriodDate: editData.lastPeriodDate,
        avgCycleLength: parseInt(editData.avgCycleLength, 10),
        periodDuration: parseInt(editData.periodDuration, 10),
      });

      // Refresh the predictions
      if (refresh) {
        refresh();
      }

      // Close modal
      setEditModal(false);
    } catch (error) {
      console.error("Error saving period data:", error);
      setErrors({ general: "Failed to save period data. Please try again." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <ColorBg />

        {editModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end">
            {/* Modal backdrop */}
            <div
              className="absolute inset-0"
              onClick={() => setEditModal(false)}
            />

            {/* Modal content - slides from bottom */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full bg-neutral-900 rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto border-t border-white/10"
            >
              {/* Header */}
              <div className="sticky top-0 bg-neutral-900 border-b border-white/10 px-5 py-4 flex items-center justify-between rounded-t-3xl">
                <h2 className="text-xl font-bold text-white">
                  Edit Period Dates
                </h2>
                <button
                  onClick={() => setEditModal(false)}
                  className="p-2 hover:bg-neutral-800 rounded-full transition"
                >
                  <IonIcon icon={closeOutline} className="text-2xl text-gray-400" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-5 space-y-6">
                {/* General error */}
                {errors.general && (
                  <div className="bg-red-950/50 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm text-red-300">{errors.general}</p>
                  </div>
                )}

                {/* Last Period Date */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Last Period Start Date
                  </label>
                  <input
                    type="date"
                    value={editData.lastPeriodDate}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        lastPeriodDate: e.target.value,
                      });
                      if (errors.lastPeriodDate) {
                        setErrors({ ...errors, lastPeriodDate: "" });
                      }
                    }}
                    className={`w-full px-4 py-3 text-base border-2 rounded-lg font-medium bg-neutral-800
                      ${
                        errors.lastPeriodDate
                          ? "border-red-500/50 text-red-300"
                          : "border-white/10 text-white"
                      }
                      focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
                      transition placeholder-gray-500`}
                  />
                  {errors.lastPeriodDate && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.lastPeriodDate}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    When did your last period start?
                  </p>
                </div>

                {/* Average Cycle Length */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-white">
                      Average Cycle Length
                    </label>
                    <span className="text-lg font-bold text-purple-400">
                      {editData.avgCycleLength} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="21"
                    max="45"
                    value={editData.avgCycleLength}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        avgCycleLength: parseInt(e.target.value, 10),
                      });
                      if (errors.avgCycleLength) {
                        setErrors({ ...errors, avgCycleLength: "" });
                      }
                    }}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>21 days</span>
                    <span>45 days</span>
                  </div>
                  {errors.avgCycleLength && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.avgCycleLength}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    The typical length from one period to the next
                  </p>
                </div>

                {/* Period Duration */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-white">
                      Period Duration
                    </label>
                    <span className="text-lg font-bold text-purple-400">
                      {editData.periodDuration} days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="14"
                    value={editData.periodDuration}
                    onChange={(e) => {
                      setEditData({
                        ...editData,
                        periodDuration: parseInt(e.target.value, 10),
                      });
                      if (errors.periodDuration) {
                        setErrors({ ...errors, periodDuration: "" });
                      }
                    }}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-2">
                    <span>1 day</span>
                    <span>14 days</span>
                  </div>
                  {errors.periodDuration && (
                    <p className="text-sm text-red-400 mt-1">
                      {errors.periodDuration}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    How many days does your period usually last?
                  </p>
                </div>

                {/* Info box */}
                <div className="bg-purple-950/50 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-xs text-purple-200 leading-relaxed">
                    📝 <strong>Tip:</strong> Accurate cycle and period information helps
                    us predict your next period more accurately.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 pt-4">
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSavePeriodData}
                    disabled={isSaving}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                      text-white py-3 rounded-xl font-semibold text-base
                      flex items-center justify-center gap-2 transition-all"
                  >
                    <IonIcon icon={checkmarkOutline} className="text-xl" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setEditModal(false)}
                    disabled={isSaving}
                    className="w-full bg-neutral-800 hover:bg-neutral-700 active:scale-95 disabled:opacity-60
                      text-gray-300 py-3 rounded-xl font-semibold text-base
                      transition-all border border-white/10"
                  >
                    Cancel
                  </motion.button>
                </div>

                {/* Safe area spacing */}
                <div className="h-4" />
              </div>
            </motion.div>
          </div>
        )}

        <div className="min-h-full bg-black flex flex-col">
          {/* Inline styles for dotted circles */}
          <style>{`
            .fertile-circle {
              border: 2px dashed #a855f7;
              border-radius: 50%;
            }
            .ovulation-circle {
              border: 2px dashed #a855f7;
              border-radius: 50%;
              background: rgba(168, 85, 247, 0.1);
            }
          `}</style>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-black"
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 20px) + 12px)",
            }}
          >
            <button
              onClick={handleClose}
              className="p-2 hover:bg-neutral-900 rounded-full transition"
            >
              <IonIcon icon={closeOutline} className="text-2xl text-gray-400" />
            </button>

            {/* Month/Year Toggle */}
            <div className="flex bg-neutral-900 rounded-full p-1 border border-white/10">
              <button
                onClick={() => setViewMode("Month")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "Month"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("Year")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "Year"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400"
                }`}
              >
                Year
              </button>
            </div>

            <div className="w-10" />
          </motion.div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 px-5 py-3 border-b border-white/10 bg-black">
            {DAYS.map((day, i) => (
              <div
                key={i}
                className={`text-center text-sm font-medium ${
                  i >= 5 ? "text-purple-400" : "text-gray-500"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Scrollable Calendar */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-5 pb-4"
          >
            {monthsToShow.map(({ year, month }, monthIndex) => {
              const days = generateMonthDays(year, month);
              const isCurrentMonth =
                year === today.getFullYear() && month === today.getMonth();

              return (
                <div key={`${year}-${month}`} className="mb-6">
                  {/* Month Header */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-4 text-center"
                  >
                    <h2 className="text-lg font-semibold text-white">
                      {month === 0 || monthIndex === 0
                        ? `${MONTHS[month]} ${year}`
                        : MONTHS[month]}
                    </h2>
                  </motion.div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-y-2">
                    {days.map(
                      ({ date, isCurrentMonth: isCurrent }, dayIndex) => {
                        if (!date) {
                          return (
                            <div key={dayIndex} className="aspect-square" />
                          );
                        }

                        const { isToday, isPeriod, isFertile, isOvulation } =
                          getDayInfo(date, year, month);
                        const dayNum = date.getDate();
                        const isWeekend =
                          date.getDay() === 0 || date.getDay() === 6;

                        return (
                          <div
                            key={dayIndex}
                            ref={isToday ? todayRef : null}
                            className="flex flex-col items-center"
                          >
                            {/* TODAY label */}
                            {isToday && (
                              <span className="text-[10px] font-bold text-purple-400 mb-0.5">
                                TODAY
                              </span>
                            )}

                            {/* Day Circle */}
                            <div
                              className={`
                          w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg
                          transition-all
                          ${
                            isPeriod
                              ? "bg-pink-500/30 text-pink-300 border border-pink-500/50"
                              : ""
                          }
                          ${
                            isFertile && !isPeriod
                              ? isOvulation
                                ? "ovulation-circle text-purple-300"
                                : "fertile-circle text-purple-300"
                              : ""
                          }
                          ${
                            !isPeriod && !isFertile
                              ? isWeekend
                                ? "text-purple-400"
                                : "text-gray-400"
                              : ""
                          }
                          ${
                            isToday && !isPeriod && !isFertile
                              ? "text-purple-400 font-bold bg-neutral-800/50 border border-purple-500/30"
                              : ""
                          }
                        `}
                            >
                              {dayNum}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Edit Period Dates Button */}
          <div
            className="sticky bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black to-transparent border-t border-white/10"
            style={{
              paddingBottom:
                "calc(70px + env(safe-area-inset-bottom, 0px) + 16px)",
            }}
          >
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditModal(true);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-semibold text-base shadow-lg active:scale-95 transition-all"
            >
              Edit period dates
            </motion.button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Calendar;
