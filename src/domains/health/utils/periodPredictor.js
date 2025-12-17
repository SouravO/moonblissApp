/**
 * Rule-Based Period Prediction Engine
 * Pure, deterministic functions for period prediction
 * No side effects, unit-test friendly
 */

/**
 * Calculate next predicted period date
 * @param {string} lastPeriodDate - ISO date string (YYYY-MM-DD)
 * @param {number} avgCycleLength - Average cycle length in days
 * @returns {string} ISO date string of predicted next period
 */
export const calculateNextPeriodDate = (lastPeriodDate, avgCycleLength) => {
    if (!lastPeriodDate || !avgCycleLength) return null;

    const lastDate = new Date(lastPeriodDate);
    if (isNaN(lastDate.getTime())) return null;

    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + parseInt(avgCycleLength, 10));

    return nextDate.toISOString().split('T')[0];
};

/**
 * Calculate days remaining until next period
 * @param {string} lastPeriodDate - ISO date string
 * @param {number} avgCycleLength - Average cycle length in days
 * @returns {number} Days remaining (can be negative if period is overdue)
 */
export const calculateDaysUntilNextPeriod = (lastPeriodDate, avgCycleLength) => {
    const nextPeriodDate = calculateNextPeriodDate(lastPeriodDate, avgCycleLength);
    if (!nextPeriodDate) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(nextPeriodDate);
    nextDate.setHours(0, 0, 0, 0);

    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Calculate cycle phase based on position in cycle
 * @param {string} lastPeriodDate - ISO date string
 * @param {number} avgCycleLength - Average cycle length in days
 * @param {number} avgPeriodLength - Average period length in days (default: 5)
 * @returns {object} Phase info { name, dayInCycle, percentage }
 */
export const calculateCyclePhase = (lastPeriodDate, avgCycleLength, avgPeriodLength = 5) => {
    if (!lastPeriodDate || !avgCycleLength) return null;

    const lastDate = new Date(lastPeriodDate);
    if (isNaN(lastDate.getTime())) return null;

    const today = new Date();
    const diffTime = today.getTime() - lastDate.getTime();
    const dayInCycle = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % parseInt(avgCycleLength, 10);

    const cyclePercentage = (dayInCycle / parseInt(avgCycleLength, 10)) * 100;

    // Determine phase based on day in cycle
    let phaseName;
    let phaseEmoji;

    if (dayInCycle < avgPeriodLength) {
        phaseName = 'Menstrual';
        phaseEmoji = '🩸';
    } else if (dayInCycle < avgPeriodLength + 8) {
        phaseName = 'Follicular';
        phaseEmoji = '🌸';
    } else if (dayInCycle < avgPeriodLength + 14) {
        phaseName = 'Ovulation';
        phaseEmoji = '💥';
    } else {
        phaseName = 'Luteal';
        phaseEmoji = '🌙';
    }

    return {
        name: phaseName,
        emoji: phaseEmoji,
        dayInCycle: dayInCycle,
        percentage: Math.round(cyclePercentage),
        daysInPhase: calculateDaysInPhase(dayInCycle, avgPeriodLength, avgCycleLength),
    };
};

/**
 * Calculate days remaining in current phase
 */
const calculateDaysInPhase = (dayInCycle, avgPeriodLength, avgCycleLength) => {
    const periodLength = parseInt(avgPeriodLength, 10);

    if (dayInCycle < periodLength) {
        return periodLength - dayInCycle;
    } else if (dayInCycle < periodLength + 8) {
        return periodLength + 8 - dayInCycle;
    } else if (dayInCycle < periodLength + 14) {
        return periodLength + 14 - dayInCycle;
    } else {
        return parseInt(avgCycleLength, 10) - dayInCycle;
    }
};

/**
 * Format date string for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (e.g., "January 15, 2025")
 */
export const formatPeriodDate = (dateString) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
};

/**
 * Get period prediction window (range of dates period might occur)
 * Accounts for cycle irregularity (±3 days)
 * @param {string} lastPeriodDate - ISO date string
 * @param {number} avgCycleLength - Average cycle length in days
 * @returns {object} { earlyDate, expectedDate, lateDate }
 */
export const getPeriodPredictionWindow = (lastPeriodDate, avgCycleLength, variability = 3) => {
    const expectedDate = calculateNextPeriodDate(lastPeriodDate, avgCycleLength);
    if (!expectedDate) return null;

    const expected = new Date(expectedDate);

    const earlyDate = new Date(expected);
    earlyDate.setDate(expected.getDate() - variability);

    const lateDate = new Date(expected);
    lateDate.setDate(expected.getDate() + variability);

    return {
        earlyDate: earlyDate.toISOString().split('T')[0],
        expectedDate,
        lateDate: lateDate.toISOString().split('T')[0],
    };
};

/**
 * Determine if period is overdue
 * @param {string} lastPeriodDate - ISO date string
 * @param {number} avgCycleLength - Average cycle length
 * @returns {boolean}
 */
export const isPeriodOverdue = (lastPeriodDate, avgCycleLength) => {
    const daysUntil = calculateDaysUntilNextPeriod(lastPeriodDate, avgCycleLength);
    return daysUntil !== null && daysUntil < 0;
};

/**
 * Get fertility window (approximate ovulation window)
 * Typically 5 days before ovulation + ovulation day
 * @param {string} lastPeriodDate - ISO date string
 * @param {number} avgCycleLength - Average cycle length
 * @returns {object} { startDate, ovulationDate, endDate }
 */
export const getFertilityWindow = (lastPeriodDate, avgCycleLength) => {
    if (!lastPeriodDate || !avgCycleLength) return null;

    const lastDate = new Date(lastPeriodDate);
    const ovulationDay = Math.floor(parseInt(avgCycleLength, 10) / 2);

    const ovulationDate = new Date(lastDate);
    ovulationDate.setDate(lastDate.getDate() + ovulationDay);

    const startDate = new Date(ovulationDate);
    startDate.setDate(ovulationDate.getDate() - 5);

    const endDate = new Date(ovulationDate);
    endDate.setDate(ovulationDate.getDate() + 1);

    return {
        startDate: startDate.toISOString().split('T')[0],
        ovulationDate: ovulationDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
    };
};

/**
 * Get wellness recommendations based on cycle phase
 */
export const getCyclePhaseRecommendations = (phaseName) => {
    const recommendations = {
        Menstrual: {
            energy: 'Rest and conserve energy',
            exercise: 'Light activity like yoga or walking',
            nutrition: 'Iron-rich foods (spinach, beans, red meat)',
            tips: ['Stay hydrated', 'Use heat therapy for cramps', 'Listen to your body'],
        },
        Follicular: {
            energy: 'Increasing energy levels',
            exercise: 'Build intensity - cardio, strength training',
            nutrition: 'Proteins and complex carbs',
            tips: ['Start new projects', 'High energy phase', 'Good time for challenges'],
        },
        Ovulation: {
            energy: 'Peak energy and confidence',
            exercise: 'High intensity workouts',
            nutrition: 'Balanced diet with antioxidants',
            tips: ['Best time for social activities', 'Clearest thinking', 'Most outgoing'],
        },
        Luteal: {
            energy: 'Declining energy towards cycle end',
            exercise: 'Moderate to low intensity',
            nutrition: 'Magnesium-rich foods (nuts, seeds)',
            tips: ['Self-care focused', 'Plan downtime', 'Avoid big decisions near period'],
        },
    };

    return recommendations[phaseName] || null;
};
