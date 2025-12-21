import React from "react";

/* ======================================================
   PERIOD PREDICTION ENGINE (PURE FUNCTIONS)
   ====================================================== */

export const calculateNextPeriodDate = (lastPeriodDate, avgCycleLength) => {
  if (!lastPeriodDate || !avgCycleLength) return null;

  const lastDate = new Date(lastPeriodDate);
  if (isNaN(lastDate.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycle = parseInt(avgCycleLength, 10);

  let nextDate = new Date(lastDate);
  nextDate.setHours(0, 0, 0, 0);

  while (nextDate <= today) {
    nextDate.setDate(nextDate.getDate() + cycle);
  }

  return nextDate.toISOString().split("T")[0];
};

export const calculateDaysUntilNextPeriod = (lastPeriodDate, avgCycleLength) => {
  const nextDateStr = calculateNextPeriodDate(lastPeriodDate, avgCycleLength);
  if (!nextDateStr) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextDate = new Date(nextDateStr);
  nextDate.setHours(0, 0, 0, 0);

  return Math.ceil(
    (nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

export const calculateCyclePhase = (
  lastPeriodDate,
  avgCycleLength,
  avgPeriodLength = 5
) => {
  if (!lastPeriodDate || !avgCycleLength) return null;

  const lastDate = new Date(lastPeriodDate);
  lastDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycle = parseInt(avgCycleLength, 10);
  const periodLength = parseInt(avgPeriodLength, 10);

  const daysSinceLast =
    (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

  const dayInCycle =
    ((Math.floor(daysSinceLast) % cycle) + cycle) % cycle + 1;

  const percentage = Math.round((dayInCycle / cycle) * 100);

  let name, emoji;

  if (dayInCycle <= periodLength) {
    name = "Menstrual";
    emoji = "🩸";
  } else if (dayInCycle <= periodLength + 6) {
    name = "Follicular";
    emoji = "🌸";
  } else if (dayInCycle >= cycle - 16 && dayInCycle <= cycle - 11) {
    name = "Ovulation";
    emoji = "✨";
  } else {
    name = "Luteal";
    emoji = "🌙";
  }

  return { name, emoji, dayInCycle, percentage };
};

export const getPeriodPredictionWindow = (
  lastPeriodDate,
  avgCycleLength,
  variability = 3
) => {
  const expectedDate = calculateNextPeriodDate(
    lastPeriodDate,
    avgCycleLength
  );
  if (!expectedDate) return null;

  const expected = new Date(expectedDate);

  const early = new Date(expected);
  early.setDate(expected.getDate() - variability);

  const late = new Date(expected);
  late.setDate(expected.getDate() + variability);

  return {
    earlyDate: early.toISOString().split("T")[0],
    expectedDate,
    lateDate: late.toISOString().split("T")[0],
  };
};

/* ======================================================
   DASHBOARD UI (SOLID COLORS + NEW LAYOUT)
   ====================================================== */

export default function PeriodDashboard() {
  const lastPeriodDate = "2025-12-06";
  const avgCycleLength = 28;
  const avgPeriodLength = 5;

  const nextPeriodDate = calculateNextPeriodDate(
    lastPeriodDate,
    avgCycleLength
  );
  const daysLeft = calculateDaysUntilNextPeriod(
    lastPeriodDate,
    avgCycleLength
  );
  const predictionWindow = getPeriodPredictionWindow(
    lastPeriodDate,
    avgCycleLength
  );
  const cyclePhase = calculateCyclePhase(
    lastPeriodDate,
    avgCycleLength,
    avgPeriodLength
  );

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">

      {/* NEW LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* BIG PRIMARY CARD — PURPLE BG + YELLOW TEXT */}
        <div className="md:col-span-2 rounded-3xl p-6 bg-purple-700 shadow-xl text-yellow-300 flex flex-col justify-center">
          <p className="text-sm opacity-90">Next Period In</p>
          <h1 className="text-5xl font-extrabold mt-2 text-yellow-200">
            {daysLeft}
            <span className="text-2xl font-semibold ml-2">days</span>
          </h1>
          <p className="mt-3 text-base text-yellow-100">
            Expected on{" "}
            <span className="font-semibold text-yellow-300">
              {nextPeriodDate}
            </span>
          </p>
        </div>

        {/* RIGHT STACK */}
        <div className="flex flex-col gap-4">

          {/* ROYAL BLUE CARD */}
          <div className="rounded-2xl p-4 bg-blue-900 shadow-lg text-white">
            <p className="text-xs opacity-80">Prediction Window</p>
            <p className="mt-2 text-sm">
              Early: <strong>{predictionWindow.earlyDate}</strong>
            </p>
            <p className="text-sm">
              Late: <strong>{predictionWindow.lateDate}</strong>
            </p>
          </div>

          {/* YELLOW CARD */}
          <div className="rounded-2xl p-4 bg-yellow-300 shadow-lg text-purple-900">
            <p className="text-xs opacity-80">Current Phase</p>
            <h2 className="text-xl font-bold mt-1">
              {cyclePhase.emoji} {cyclePhase.name}
            </h2>
            <p className="text-xs mt-1 text-purple-700">
              Day {cyclePhase.dayInCycle} • {cyclePhase.percentage}%
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
