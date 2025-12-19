/**
 * NextPeriodCard Component
 *
 * Displays the next predicted period date on the home page
 *
 * RULE: This component contains ZERO business logic
 * All predictions come from usePeriodPrediction hook
 */

import React from "react";
import {
  IonCard,
  IonCardContent,
  IonText,
  IonIcon,
  IonSkeletonText,
} from "@ionic/react";
import {
  waterOutline,
  calendarOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { usePeriodPrediction } from "../hooks/usePeriodPrediction.js";

const NextPeriodCard = ({
  showPhase = true,
  showFertility = false,
  compact = false,
  className = "",
}) => {
  const {
    loading,
    hasPeriodData,
    nextPeriod,
    currentPhase,
    fertilityWindow,
    formatDate,
  } = usePeriodPrediction();

  // Loading state
  if (loading) {
    return (
      <IonCard className={`m-4 rounded-2xl ${className}`}>
        <IonCardContent className="p-4">
          <IonSkeletonText animated style={{ width: "60%", height: "24px" }} />
          <IonSkeletonText
            animated
            style={{ width: "80%", height: "16px" }}
            className="mt-2"
          />
          <IonSkeletonText
            animated
            style={{ width: "40%", height: "14px" }}
            className="mt-2"
          />
        </IonCardContent>
      </IonCard>
    );
  }

  // No data state - prompt to set up
  if (!hasPeriodData) {
    return (
      <IonCard
        className={`m-4 rounded-2xl bg-gradient-to-r from-pink-100 to-purple-100 ${className}`}
      >
        <IonCardContent className="p-4 text-center">
          <IonIcon
            icon={calendarOutline}
            className="text-pink-500 text-4xl mb-2"
          />
          <IonText className="block text-gray-700 font-medium">
            Track Your Cycle
          </IonText>
          <IonText className="block text-gray-500 text-sm mt-1">
            Complete the questionnaire to get personalized predictions
          </IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  // Compact version for smaller displays
  if (compact) {
    return (
      <IonCard className={`rounded-xl overflow-hidden shadow-sm ${className}`}>
        <IonCardContent className="p-3 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                <IonIcon
                  icon={waterOutline}
                  className="text-pink-500 text-xl"
                />
              </div>
              <div>
                <IonText className="block text-sm font-semibold text-gray-800">
                  {nextPeriod.isOngoing ? "Period Now" : "Next Period"}
                </IonText>
                <IonText className="block text-xs text-gray-500">
                  {nextPeriod.isOngoing
                    ? `Day ${nextPeriod.dayOfPeriod}`
                    : formatDate(nextPeriod.startDate, "short")}
                </IonText>
              </div>
            </div>
            {!nextPeriod.isOngoing && (
              <div className="text-right">
                <IonText className="block text-2xl font-bold text-pink-500">
                  {nextPeriod.daysUntil}
                </IonText>
                <IonText className="block text-xs text-gray-500">days</IonText>
              </div>
            )}
          </div>
        </IonCardContent>
      </IonCard>
    );
  }

  // Full version
  return (
    <IonCard
      className={`m-4 rounded-2xl overflow-hidden shadow-md ${className}`}
    >
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <IonIcon icon={waterOutline} className="text-white text-2xl" />
            </div>
            <div>
              <IonText className="block text-white/80 text-sm">
                {nextPeriod.isOngoing ? "Your Period" : "Next Period"}
              </IonText>
              <IonText className="block text-white font-bold text-lg">
                {nextPeriod.isOngoing
                  ? `Day ${nextPeriod.dayOfPeriod} of ${nextPeriod.duration}`
                  : formatDate(nextPeriod.startDate, "long")}
              </IonText>
            </div>
          </div>

          {!nextPeriod.isOngoing && (
            <div className="text-right">
              <IonText className="block text-white text-3xl font-bold">
                {nextPeriod.daysUntil}
              </IonText>
              <IonText className="block text-white/80 text-sm">
                days left
              </IonText>
            </div>
          )}
        </div>
      </div>

      <IonCardContent className="p-4 bg-white">
        {/* Current Phase */}
        {showPhase && currentPhase && (
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{currentPhase.emoji}</span>
            <div className="flex-1">
              <IonText className="block text-gray-800 font-medium">
                {currentPhase.name} Phase
              </IonText>
              <IonText className="block text-gray-500 text-sm">
                Day {currentPhase.dayInCycle} of your cycle
              </IonText>
            </div>
            <div className="text-right">
              <IonText className="text-pink-500 font-semibold">
                {currentPhase.percentComplete}%
              </IonText>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {showPhase && currentPhase && (
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${currentPhase.percentComplete}%` }}
            />
          </div>
        )}

        {/* Fertility info */}
        {showFertility && fertilityWindow && (
          <div className="bg-teal-50 rounded-xl p-3 mt-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🥚</span>
              <div>
                <IonText className="block text-teal-700 font-medium text-sm">
                  Fertility Window
                </IonText>
                <IonText className="block text-teal-600 text-xs">
                  {formatDate(fertilityWindow.start, "short")} -{" "}
                  {formatDate(fertilityWindow.end, "short")}
                </IonText>
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
          <IonIcon
            icon={alertCircleOutline}
            className="text-gray-400 text-sm mt-0.5"
          />
          <IonText className="text-gray-400 text-xs">
            Predictions are estimates based on your cycle data and may vary.
          </IonText>
        </div>
      </IonCardContent>
    </IonCard>
  );
};

export default NextPeriodCard;
