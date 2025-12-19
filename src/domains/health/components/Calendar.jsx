import React, { useState, useEffect, useRef, useMemo } from "react";
import { IonPage, IonContent, IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { useHistory } from "react-router-dom";
import { usePeriodPrediction } from "../hooks/usePeriodPrediction.js";
import PeriodCalendarHelper from "./PeriodCalendarHelper.js";

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
  const history = useHistory();
  const { futurePeriods, cycleLength, periodDuration, hasPeriodData, loading } =
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

  const handleClose = () => {
    history.goBack();
  };

  return (
    <IonPage>
      <IonContent className="ion-no-padding">
        <div className="min-h-full bg-white flex flex-col">
          {/* Inline styles for dotted circle */}
          <style>{`
            .fertile-circle {
              border: 2px dashed #14b8a6;
              border-radius: 50%;
            }
            .ovulation-circle {
              border: 2px dashed #14b8a6;
              border-radius: 50%;
              background: rgba(20, 184, 166, 0.1);
            }
          `}</style>

          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white"
            style={{
              paddingTop: "calc(env(safe-area-inset-top, 20px) + 12px)",
            }}
          >
            <button onClick={handleClose} className="p-2">
              <IonIcon icon={closeOutline} className="text-2xl text-gray-700" />
            </button>
            {/* Month/Year Toggle */}
            <div className="flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setViewMode("Month")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "Month"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("Year")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  viewMode === "Year"
                    ? "bg-gray-800 text-white"
                    : "text-gray-600"
                }`}
              >
                Year
              </button>
            </div>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 px-4 py-2 border-b border-gray-100 bg-white">
            {DAYS.map((day, i) => (
              <div
                key={i}
                className={`text-center text-sm font-medium ${
                  i >= 5 ? "text-teal-500" : "text-gray-400"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Scrollable Calendar */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto px-4 pb-4"
          >
            {monthsToShow.map(({ year, month }, monthIndex) => {
              const days = generateMonthDays(year, month);
              const isCurrentMonth =
                year === today.getFullYear() && month === today.getMonth();

              return (
                <div key={`${year}-${month}`} className="mb-6">
                  {/* Month Header */}
                  <div className="py-4 text-center">
                    <h2 className="text-lg font-semibold text-gray-800">
                      {month === 0 || monthIndex === 0
                        ? `${MONTHS[month]} ${year}`
                        : MONTHS[month]}
                    </h2>
                  </div>

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
                              <span className="text-[10px] font-medium text-teal-500 mb-0.5">
                                TODAY
                              </span>
                            )}

                            {/* Day Circle */}
                            <div
                              className={`
                          w-10 h-10 flex items-center justify-center text-sm font-medium
                          ${
                            isPeriod
                              ? "bg-pink-400 text-white rounded-full"
                              : ""
                          }
                          ${
                            isFertile && !isPeriod
                              ? isOvulation
                                ? "ovulation-circle text-teal-600"
                                : "fertile-circle text-teal-600"
                              : ""
                          }
                          ${
                            !isPeriod && !isFertile
                              ? isWeekend
                                ? "text-teal-500"
                                : "text-gray-700"
                              : ""
                          }
                          ${
                            isToday && !isPeriod && !isFertile
                              ? "text-teal-500 font-bold"
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
            className="sticky bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent"
            style={{
              paddingBottom:
                "calc(70px + env(safe-area-inset-bottom, 0px) + 16px)",
            }}
          >
            <button
              onClick={() => {
                /* TODO: Open period edit modal */
              }}
              className="w-full bg-pink-400 text-white py-3 rounded-full font-semibold text-base shadow-lg active:scale-95 transition-transform"
            >
              Edit period dates
            </button>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Calendar;
