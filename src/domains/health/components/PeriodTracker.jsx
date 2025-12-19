import React, { useMemo, useCallback } from "react";
import { usePeriodTracking } from "../hooks/usePeriodTracking.js";
import {
  selectPeriodTrackerState,
  selectHealthInsights,
} from "../utils/selectors.js";
import { calculateCyclePhase } from "../utils/periodPredictor.js";

/**
 * Memoized Period Tracker Content Component
 * Prevents unnecessary re-renders of phase calculation and UI
 */
const PeriodTrackerContent = React.memo(({ trackerState, insights }) => {
  console.log({trackerState})
  if (!trackerState?.isReady) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="text-center space-y-2">
          <div className="text-5xl">📅</div>
          <p className="text-gray-600">No period data recorded yet</p>
        </div>
      </div>
    );
  }

  const getPhaseColor = useCallback((phase) => {
    const colors = {
      Menstrual: "text-red-600 bg-red-50 border-red-200",
      Follicular: "text-green-600 bg-green-50 border-green-200",
      Ovulation: "text-orange-600 bg-orange-50 border-orange-200",
      Luteal: "text-blue-600 bg-blue-50 border-blue-200",
    };
    return (
      colors[phase?.name] || "text-purple-600 bg-purple-50 border-purple-200"
    );
  }, []);

  const statusColor = trackerState.isOverdue
    ? "text-red-600"
    : "text-purple-600";
  const countdownText =
    trackerState.daysUntilNextPeriod >= 0
      ? `${trackerState.daysUntilNextPeriod} days`
      : `${Math.abs(trackerState.daysUntilNextPeriod)} days overdue`;

  return (
    <div className="space-y-4">
      {/* Main Countdown Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Days Until Next Period</p>
            <p className={`text-4xl font-bold ${statusColor}`}>
              {countdownText}
            </p>
          </div>
          <span className="text-4xl">{trackerState.currentPhase?.emoji}</span>
        </div>

        <div className="space-y-3">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Cycle Progress
              </span>
              <span className="text-sm text-gray-600">
                {trackerState.currentPhase?.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${trackerState.currentPhase?.percentage}%` }}
              />
            </div>
          </div>

          {/* Phase Info */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs text-gray-600">Current Phase</p>
              <p
                className={`text-sm font-semibold px-3 py-1 rounded-full border ${getPhaseColor(
                  trackerState.currentPhase
                )}`}
              >
                {trackerState.currentPhase?.name} - Day{" "}
                {trackerState.currentPhase?.dayInCycle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Next Period</p>
              <p className="text-sm font-semibold text-gray-800">
                {trackerState.nextPeriodDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Prediction Window Info */}
      {trackerState.predictionWindow && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Period Prediction Window</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-gray-500">Earliest</p>
              <p className="text-sm font-semibold text-gray-700">
                {trackerState.predictionWindow.earlyDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expected</p>
              <p className="text-sm font-semibold text-purple-600">
                {trackerState.predictionWindow.expectedDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Latest</p>
              <p className="text-sm font-semibold text-gray-700">
                {trackerState.predictionWindow.lateDate}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Insight */}
      {insights && insights.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{insights[0].emoji}</span>
            <div>
              <p className="font-semibold text-gray-800 text-sm">
                {insights[0].title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {insights[0].description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PeriodTrackerContent.displayName = "PeriodTrackerContent";

/**
 * Main Period Tracker Hook Component
 * Uses memoized selectors and optimized re-renders
 */
const PeriodTracker = () => {
  // usePeriodTracking returns { menstrualData, loading, error, hasPeriodData }
  const { menstrualData, loading, hasPeriodData } = usePeriodTracking();
  const userProfile = { name: "User" };

  // Memoize selector calculations to prevent unnecessary recalculation
  const trackerState = useMemo(
    () => selectPeriodTrackerState(menstrualData),
    [menstrualData]
  );

  const insights = useMemo(
    () => selectHealthInsights(menstrualData, userProfile, null),
    [menstrualData, userProfile]
  );

  // Show loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
        <div className="text-center space-y-2">
          <div className="text-5xl animate-pulse">🌸</div>
          <p className="text-gray-600">Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <PeriodTrackerContent trackerState={trackerState} insights={insights} />
  );
};

export default React.memo(PeriodTracker);
