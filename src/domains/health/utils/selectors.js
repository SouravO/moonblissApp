/**
 * Selectors for derived health state
 * Pure functions that compute derived data from menstrual data
 * Designed to be used with useMemo for performance optimization
 */

import {
    calculateNextPeriodDate,
    calculateDaysUntilNextPeriod,
    calculateCyclePhase,
    formatPeriodDate,
    getPeriodPredictionWindow,
    isPeriodOverdue,
    getFertilityWindow,
    getCyclePhaseRecommendations,
} from './periodPredictor.js';

/**
 * Get all derived period information
 * @param {object} menstrualData - MenstrualData from storage
 * @returns {object} Complete period information
 */
export const selectPeriodInfo = (menstrualData) => {
    if (!menstrualData?.lastPeriodDate || !menstrualData?.avgCycleLength) {
        return {
            nextPeriodDate: null,
            daysUntilNextPeriod: null,
            currentPhase: null,
            predictionWindow: null,
            isOverdue: false,
            fertilityWindow: null,
        };
    }

    const nextPeriodDate = calculateNextPeriodDate(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    const daysUntilNextPeriod = calculateDaysUntilNextPeriod(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    const currentPhase = calculateCyclePhase(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength,
        menstrualData.avgPeriodLength || 5
    );

    const predictionWindow = getPeriodPredictionWindow(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    const isOverdue = isPeriodOverdue(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    const fertilityWindow = getFertilityWindow(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    return {
        nextPeriodDate: formatPeriodDate(nextPeriodDate),
        daysUntilNextPeriod,
        currentPhase,
        predictionWindow: predictionWindow ? {
            earlyDate: formatPeriodDate(predictionWindow.earlyDate),
            expectedDate: formatPeriodDate(predictionWindow.expectedDate),
            lateDate: formatPeriodDate(predictionWindow.lateDate),
        } : null,
        isOverdue,
        fertilityWindow: fertilityWindow ? {
            startDate: formatPeriodDate(fertilityWindow.startDate),
            ovulationDate: formatPeriodDate(fertilityWindow.ovulationDate),
            endDate: formatPeriodDate(fertilityWindow.endDate),
        } : null,
    };
};

/**
 * Get period status as simple string
 * @param {object} menstrualData
 * @returns {string} Status like "3 days until period", "Period coming this week", etc.
 */
export const selectPeriodStatus = (menstrualData) => {
    const daysUntil = calculateDaysUntilNextPeriod(
        menstrualData?.lastPeriodDate,
        menstrualData?.avgCycleLength
    );

    if (daysUntil === null) return 'No period data';
    if (daysUntil < 0) return `${Math.abs(daysUntil)} days overdue`;
    if (daysUntil === 0) return 'Period starting today';
    if (daysUntil === 1) return 'Period tomorrow';
    if (daysUntil <= 7) return `${daysUntil} days until period`;
    if (daysUntil <= 14) return 'Period coming this month';
    return `${daysUntil} days until period`;
};

/**
 * Get current cycle phase with recommendations
 * @param {object} menstrualData
 * @returns {object} Phase with recommendations
 */
export const selectPhaseWithRecommendations = (menstrualData) => {
    const phase = calculateCyclePhase(
        menstrualData?.lastPeriodDate,
        menstrualData?.avgCycleLength,
        menstrualData?.avgPeriodLength || 5
    );

    if (!phase) return null;

    const recommendations = getCyclePhaseRecommendations(phase.name);

    return {
        ...phase,
        recommendations,
    };
};

/**
 * Get period tracker state for dashboard
 * @param {object} menstrualData
 * @returns {object} All data needed for PeriodTracker component
 */
export const selectPeriodTrackerState = (menstrualData) => {
    const periodInfo = selectPeriodInfo(menstrualData);
    const status = selectPeriodStatus(menstrualData);
    const phaseWithRecommendations = selectPhaseWithRecommendations(menstrualData);

    return {
        ...periodInfo,
        status,
        phase: phaseWithRecommendations,
        isReady: !!menstrualData?.lastPeriodDate && !!menstrualData?.avgCycleLength,
    };
};

/**
 * Calculate health insights based on data
 * @param {object} menstrualData
 * @param {object} userProfile
 * @param {object} questionnaireAnswers
 * @returns {array} Array of insight objects { title, description, emoji, priority }
 */
export const selectHealthInsights = (menstrualData, userProfile, questionnaireAnswers) => {
    const insights = [];

    // Check for common symptoms
    if (menstrualData?.symptoms?.includes('heavy_flow')) {
        insights.push({
            title: 'Heavy Period Flow',
            description: 'Consider iron-rich foods and staying hydrated during your period',
            emoji: '💧',
            priority: 'high',
        });
    }

    if (menstrualData?.symptoms?.includes('severe_cramps')) {
        insights.push({
            title: 'Period Cramps',
            description: 'Heat therapy, gentle exercise, and magnesium-rich foods may help',
            emoji: '🌡️',
            priority: 'high',
        });
    }

    // Check lifestyle factors
    if (menstrualData?.lifestyleFactors?.stressLevel === 'high') {
        insights.push({
            title: 'High Stress Detected',
            description: 'High stress can affect your cycle. Try meditation or yoga.',
            emoji: '🧘‍♀️',
            priority: 'medium',
        });
    }

    if (menstrualData?.lifestyleFactors?.sleepHours < 6) {
        insights.push({
            title: 'Insufficient Sleep',
            description: 'Aim for 7-9 hours of sleep to support hormonal balance',
            emoji: '😴',
            priority: 'medium',
        });
    }

    // Check phase-based insights
    const phase = selectPhaseWithRecommendations(menstrualData);
    if (phase) {
        insights.push({
            title: `${phase.name} Phase`,
            description: phase.recommendations.tips[0],
            emoji: phase.emoji,
            priority: 'low',
        });
    }

    return insights.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
};

/**
 * Check if user should be prompted to log symptoms
 * @param {object} menstrualData
 * @returns {boolean}
 */
export const selectShouldPromptSymptomLogging = (menstrualData) => {
    if (!menstrualData?.lastPeriodDate) return false;

    const daysUntil = calculateDaysUntilNextPeriod(
        menstrualData.lastPeriodDate,
        menstrualData.avgCycleLength
    );

    // Prompt when period is 2-7 days away or during period
    return daysUntil !== null && daysUntil >= -5 && daysUntil <= 7;
};

/**
 * Get cycle statistics for user profile
 * @param {object} menstrualData
 * @returns {object} Statistics
 */
export const selectCycleStatistics = (menstrualData) => {
    return {
        cycleLength: menstrualData?.avgCycleLength || null,
        periodLength: menstrualData?.avgPeriodLength || null,
        isCycleRegular: menstrualData?.isCycleRegular !== false,
        lastRecordedDate: menstrualData?.lastPeriodDate || null,
        trackedSince: menstrualData?.recordedAt || null,
    };
};
