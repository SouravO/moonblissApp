/**
 * Period Prediction Service (FIXED VERSION)
 * 
 * SIMPLE rule-based menstrual cycle prediction logic
 * 
 * ═══════════════════════════════════════════════════════════════
 * CORE FORMULAS:
 * ═══════════════════════════════════════════════════════════════
 * 
 *   Next Period Start = Last Period Start + Cycle Length
 *   Period End = Period Start + Period Duration - 1
 *   Ovulation = Period Start + Cycle Length - 14
 *              (i.e., 14 days BEFORE next period)
 *   Fertile Window = Ovulation - 5 days TO Ovulation + 1 day
 * 
 * ═══════════════════════════════════════════════════════════════
 * EXAMPLE (Last Period: Dec 1, Cycle: 28 days, Duration: 5 days):
 * ═══════════════════════════════════════════════════════════════
 * 
 *   Period 1:      Dec 1 - Dec 5
 *   Ovulation 1:   Dec 1 + 28 - 14 = Dec 15
 *   Fertile 1:     Dec 10 - Dec 16 (5 days before to 1 day after ovulation)
 *   Period 2:      Dec 1 + 28 = Dec 29 - Jan 2
 *   Ovulation 2:   Dec 29 + 28 - 14 = Jan 12
 *   Fertile 2:     Jan 7 - Jan 13
 * 
 * ═══════════════════════════════════════════════════════════════
 */

// ══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Add days to a date
 */
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

/**
 * Get today at midnight
 */
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

/**
 * Parse date string to Date at midnight
 */
const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    date.setHours(0, 0, 0, 0);
    return date;
};

/**
 * Format date to YYYY-MM-DD
 */
const toISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// ══════════════════════════════════════════════════════════════
// MAIN PREDICTION FUNCTION
// ══════════════════════════════════════════════════════════════

/**
 * Generate all period predictions with fertility data
 * 
 * @param {string} lastPeriodDate - Last period start date (YYYY-MM-DD)
 * @param {number} cycleLength - Cycle length in days (default: 28)
 * @param {number} periodDuration - Period duration in days (default: 5)
 * @param {number} monthsAhead - Months to predict ahead (default: 12)
 * @returns {Array} Array of cycle objects with period and fertility data
 */
export const predictFuturePeriods = (
    lastPeriodDate,
    cycleLength = 28,
    periodDuration = 5,
    monthsAhead = 12
) => {
    const lastDate = parseDate(lastPeriodDate);
    if (!lastDate) return [];

    const cycle = parseInt(cycleLength, 10) || 28;
    const duration = parseInt(periodDuration, 10) || 5;
    const today = getToday();

    // Set boundaries
    const pastLimit = addDays(today, -90); // 3 months back
    const futureLimit = addDays(today, monthsAhead * 31);

    // Find first period to include (go back from lastDate if needed)
    let periodStart = new Date(lastDate);
    while (periodStart > pastLimit) {
        periodStart = addDays(periodStart, -cycle);
    }

    const predictions = [];
    let cycleNumber = 0;

    // Generate all cycles
    while (periodStart <= futureLimit) {
        const periodEnd = addDays(periodStart, duration - 1);

        // Ovulation is 14 days BEFORE the next period
        // = periodStart + cycleLength - 14
        const ovulationDate = addDays(periodStart, cycle - 14);
        const fertileStart = addDays(ovulationDate, -5);
        const fertileEnd = addDays(ovulationDate, 1);

        predictions.push({
            // Period info
            startDate: new Date(periodStart),
            endDate: new Date(periodEnd),
            startDateISO: toISODate(periodStart),
            endDateISO: toISODate(periodEnd),

            // Fertility info for this cycle
            ovulationDate: new Date(ovulationDate),
            fertileStart: new Date(fertileStart),
            fertileEnd: new Date(fertileEnd),
            ovulationDateISO: toISODate(ovulationDate),
            fertileStartISO: toISODate(fertileStart),
            fertileEndISO: toISODate(fertileEnd),

            cycleNumber,
        });

        periodStart = addDays(periodStart, cycle);
        cycleNumber++;
    }

    return predictions;
};

// ══════════════════════════════════════════════════════════════
// DERIVED FUNCTIONS
// ══════════════════════════════════════════════════════════════

/**
 * Get the next/current period
 */
export const getNextUpcomingPeriod = (lastPeriodDate, cycleLength = 28, periodDuration = 5) => {
    const predictions = predictFuturePeriods(lastPeriodDate, cycleLength, periodDuration, 3);
    const today = getToday();

    for (const period of predictions) {
        // Find period that hasn't ended
        if (period.endDate >= today) {
            const daysUntil = Math.ceil(
                (period.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            const isOngoing = period.startDate <= today && period.endDate >= today;
            const dayOfPeriod = isOngoing
                ? Math.floor((today.getTime() - period.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                : 0;

            return {
                ...period,
                daysUntil: Math.max(0, daysUntil),
                isOngoing,
                dayOfPeriod,
                duration: parseInt(periodDuration, 10),
            };
        }
    }

    return null;
};

/**
 * Get current cycle phase (FIXED VERSION)
 */
export const getCurrentCyclePhase = (lastPeriodDate, cycleLength = 28, periodDuration = 5) => {
    const lastDate = parseDate(lastPeriodDate);
    if (!lastDate) return null;

    const today = getToday();
    const cycle = parseInt(cycleLength, 10) || 28;
    const duration = parseInt(periodDuration, 10) || 5;

    // Days since last period
    const daysSince = Math.floor(
        (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // FIX: Handle case where lastPeriodDate is in the future
    if (daysSince < 0) {
        return {
            name: 'Future Date',
            emoji: '📅',
            color: 'gray',
            dayInCycle: 0,
            totalDays: cycle,
            percentComplete: 0,
            error: 'Last period date is in the future'
        };
    }

    // FIX: Simplified day in cycle calculation (1-indexed)
    const dayInCycle = (daysSince % cycle) + 1;

    // FIX: Ovulation day calculation (consistent with predictFuturePeriods)
    // Ovulation happens cycle - 14 days after period starts (0-indexed)
    // So in 1-indexed terms, it's on day (cycle - 14 + 1) of the cycle
    const ovulationDay = cycle - 13; // This is cycle - 14 + 1 for 1-indexing

    // Determine phase
    let phase;
    if (dayInCycle <= duration) {
        phase = { name: 'Menstrual', emoji: '🩸', color: 'pink' };
    } else if (dayInCycle < ovulationDay - 2) {
        // Follicular phase: after period ends until 2 days before ovulation
        phase = { name: 'Follicular', emoji: '🌸', color: 'green' };
    } else if (dayInCycle >= ovulationDay - 2 && dayInCycle <= ovulationDay + 2) {
        // Ovulation window: 2 days before to 2 days after ovulation day
        phase = { name: 'Ovulation', emoji: '✨', color: 'purple' };
    } else {
        // Luteal phase: after ovulation until next period
        phase = { name: 'Luteal', emoji: '🌙', color: 'blue' };
    }

    return {
        ...phase,
        dayInCycle,
        totalDays: cycle,
        percentComplete: Math.round((dayInCycle / cycle) * 100),
    };
};

/**
 * Get current/upcoming fertility window
 */
export const getFertilityWindow = (lastPeriodDate, cycleLength = 28) => {
    const predictions = predictFuturePeriods(lastPeriodDate, cycleLength, 5, 3);
    const today = getToday();

    for (const period of predictions) {
        if (period.fertileEnd >= today) {
            const isCurrentlyFertile = today >= period.fertileStart && today <= period.fertileEnd;
            const daysUntilFertile = isCurrentlyFertile ? 0 : Math.ceil(
                (period.fertileStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            return {
                start: period.fertileStart,
                ovulation: period.ovulationDate,
                end: period.fertileEnd,
                startISO: period.fertileStartISO,
                ovulationISO: period.ovulationDateISO,
                endISO: period.fertileEndISO,
                isCurrentlyFertile,
                daysUntilFertile,
            };
        }
    }

    return null;
};

/**
 * Check if a date is a period day
 */
export const isDateInPeriod = (date, lastPeriodDate, cycleLength = 28, periodDuration = 5) => {
    const checkDate = parseDate(date);
    if (!checkDate) return false;

    const predictions = predictFuturePeriods(lastPeriodDate, cycleLength, periodDuration, 24);

    return predictions.some(p => checkDate >= p.startDate && checkDate <= p.endDate);
};

/**
 * Check if a date is in fertile window
 */
export const isDateInFertileWindow = (date, lastPeriodDate, cycleLength = 28) => {
    const checkDate = parseDate(date);
    if (!checkDate) return false;

    const predictions = predictFuturePeriods(lastPeriodDate, cycleLength, 5, 24);

    return predictions.some(p => checkDate >= p.fertileStart && checkDate <= p.fertileEnd);
};

/**
 * Check if a date is ovulation day
 */
export const isDateOvulation = (date, lastPeriodDate, cycleLength = 28) => {
    const checkDate = parseDate(date);
    if (!checkDate) return false;

    const predictions = predictFuturePeriods(lastPeriodDate, cycleLength, 5, 24);

    return predictions.some(p =>
        checkDate.getTime() === p.ovulationDate.getTime()
    );
};

/**
 * Format date for display
 */
export const formatPeriodDate = (date, format = 'long') => {
    const d = parseDate(date);
    if (!d) return '';

    if (format === 'relative') {
        const today = getToday();
        const diff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff === 0) return 'Today';
        if (diff === 1) return 'Tomorrow';
        if (diff === -1) return 'Yesterday';
        if (diff > 0) return `In ${diff} days`;
        return `${Math.abs(diff)} days ago`;
    }

    if (format === 'short') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

/**
 * BONUS: Calculate cycle statistics from historical data
 */
export const calculateCycleStats = (periodDates) => {
    if (!periodDates || periodDates.length < 2) {
        return null;
    }

    // Parse and sort dates
    const dates = periodDates
        .map(d => parseDate(d))
        .filter(d => d !== null)
        .sort((a, b) => a - b);

    if (dates.length < 2) return null;

    // Calculate cycle lengths
    const cycleLengths = [];
    for (let i = 1; i < dates.length; i++) {
        const diff = Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
        cycleLengths.push(diff);
    }

    // Calculate average
    const avgCycle = Math.round(
        cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length
    );

    // Calculate variability (standard deviation)
    const variance = cycleLengths.reduce((sum, len) => {
        return sum + Math.pow(len - avgCycle, 2);
    }, 0) / cycleLengths.length;
    const stdDev = Math.round(Math.sqrt(variance));

    return {
        averageCycle: avgCycle,
        shortestCycle: Math.min(...cycleLengths),
        longestCycle: Math.max(...cycleLengths),
        variability: stdDev,
        cycleCount: cycleLengths.length,
    };
};

export default {
    predictFuturePeriods,
    getNextUpcomingPeriod,
    getCurrentCyclePhase,
    getFertilityWindow,
    isDateInPeriod,
    isDateInFertileWindow,
    isDateOvulation,
    formatPeriodDate,
    calculateCycleStats,
};