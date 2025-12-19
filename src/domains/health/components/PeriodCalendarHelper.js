/**
 * PeriodCalendarHelper
 * 
 * SIMPLE helper to map period predictions to calendar display
 * 
 * NOTE: Predictions from periodPredictionService already contain:
 *   - startDate, endDate (period)
 *   - ovulationDate, fertileStart, fertileEnd (fertility)
 */

import { addDays, isSameDay, format, isWithinInterval } from 'date-fns';

// ══════════════════════════════════════════════════════════════
// HELPER: Add days without date-fns (fallback)
// ══════════════════════════════════════════════════════════════
const addDaysSimple = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

// ══════════════════════════════════════════════════════════════
// GET DATES FOR A MONTH
// ══════════════════════════════════════════════════════════════

/**
 * Get all period dates for a month
 */
export const getPeriodDatesForMonth = (predictions, year, month) => {
    if (!predictions?.length) return [];

    const dates = [];

    predictions.forEach(p => {
        const start = new Date(p.startDate);
        const end = new Date(p.endDate);

        let current = new Date(start);
        while (current <= end) {
            if (current.getFullYear() === year && current.getMonth() === month) {
                dates.push(new Date(current));
            }
            current = addDaysSimple(current, 1);
        }
    });

    return dates;
};

/**
 * Get all fertile dates for a month
 * Uses fertileStart and fertileEnd from predictions
 */
export const getFertileDatesForMonth = (predictions, cycleLength, year, month) => {
    if (!predictions?.length) return [];

    const dates = [];

    predictions.forEach(p => {
        // Use pre-calculated fertility data from prediction
        const start = new Date(p.fertileStart);
        const end = new Date(p.fertileEnd);

        let current = new Date(start);
        while (current <= end) {
            if (current.getFullYear() === year && current.getMonth() === month) {
                dates.push(new Date(current));
            }
            current = addDaysSimple(current, 1);
        }
    });

    return dates;
};

/**
 * Get ovulation dates for a month
 */
export const getOvulationDatesForMonth = (predictions, cycleLength, year, month) => {
    if (!predictions?.length) return [];

    const dates = [];

    predictions.forEach(p => {
        const ovulation = new Date(p.ovulationDate);
        if (ovulation.getFullYear() === year && ovulation.getMonth() === month) {
            dates.push(new Date(ovulation));
        }
    });

    return dates;
};

/**
 * Check if a specific date is a period day
 * @param {Date} date - Date to check
 * @param {Array<Date>} periodDates - Array of period dates
 * @returns {boolean}
 */
export const isDateAPeriodDay = (date, periodDates) => {
    if (!periodDates || !Array.isArray(periodDates)) return false;
    return periodDates.some(periodDate => isSameDay(date, periodDate));
};

/**
 * Check if a specific date is a fertile day
 * @param {Date} date - Date to check
 * @param {Array<Date>} fertileDates - Array of fertile dates
 * @returns {boolean}
 */
export const isDateAFertileDay = (date, fertileDates) => {
    if (!fertileDates || !Array.isArray(fertileDates)) return false;
    return fertileDates.some(fertileDate => isSameDay(date, fertileDate));
};

/**
 * Check if a specific date is ovulation day
 * @param {Date} date - Date to check
 * @param {Array<Date>} ovulationDates - Array of ovulation dates
 * @returns {boolean}
 */
export const isDateOvulationDay = (date, ovulationDates) => {
    if (!ovulationDates || !Array.isArray(ovulationDates)) return false;
    return ovulationDates.some(ovulationDate => isSameDay(date, ovulationDate));
};

/**
 * Get the type of a date for calendar styling
 * @param {Date} date - Date to check
 * @param {Object} dateArrays - Object containing { periodDates, fertileDates, ovulationDates }
 * @returns {string|null} 'period' | 'fertile' | 'ovulation' | null
 */
export const getDateType = (date, { periodDates = [], fertileDates = [], ovulationDates = [] }) => {
    if (isDateAPeriodDay(date, periodDates)) return 'period';
    if (isDateOvulationDay(date, ovulationDates)) return 'ovulation';
    if (isDateAFertileDay(date, fertileDates)) return 'fertile';
    return null;
};

/**
 * Get styling classes for a date based on its type
 * @param {string|null} dateType - Type returned from getDateType
 * @returns {Object} Object containing CSS classes and styles
 */
export const getDateStyles = (dateType) => {
    switch (dateType) {
        case 'period':
            return {
                className: 'bg-pink-400 text-white',
                dotColor: 'bg-pink-400',
                borderStyle: 'solid',
            };
        case 'ovulation':
            return {
                className: 'bg-teal-400 text-white',
                dotColor: 'bg-teal-400',
                borderStyle: 'solid',
            };
        case 'fertile':
            return {
                className: 'border-2 border-dashed border-teal-400 text-teal-600',
                dotColor: 'bg-teal-400',
                borderStyle: 'dashed',
            };
        default:
            return {
                className: '',
                dotColor: '',
                borderStyle: 'none',
            };
    }
};

/**
 * Generate calendar data for a specific month
 * Ready to use in calendar component
 * @param {Object} params
 * @param {Array} params.predictions - Period predictions
 * @param {number} params.cycleLength - Cycle length
 * @param {number} params.year - Year
 * @param {number} params.month - Month (0-11)
 * @returns {Object} Calendar data with period, fertile, and ovulation dates
 */
export const getCalendarMonthData = ({ predictions, cycleLength, year, month }) => {
    const periodDates = getPeriodDatesForMonth(predictions, year, month);
    const fertileDates = getFertileDatesForMonth(predictions, cycleLength, year, month);
    const ovulationDates = getOvulationDatesForMonth(predictions, cycleLength, year, month);

    return {
        periodDates,
        fertileDates,
        ovulationDates,

        // Convenience methods
        isDatePeriod: (date) => isDateAPeriodDay(date, periodDates),
        isDateFertile: (date) => isDateAFertileDay(date, fertileDates),
        isDateOvulation: (date) => isDateOvulationDay(date, ovulationDates),
        getDateType: (date) => getDateType(date, { periodDates, fertileDates, ovulationDates }),
        getDateStyles: (date) => getDateStyles(getDateType(date, { periodDates, fertileDates, ovulationDates })),
    };
};

/**
 * Format predictions for display in a list
 * @param {Array} predictions - Array of predictions from service
 * @returns {Array} Formatted predictions for UI display
 */
export const formatPredictionsForList = (predictions) => {
    if (!predictions || !Array.isArray(predictions)) return [];

    return predictions.map((period, index) => {
        const startDate = typeof period.startDate === 'string'
            ? parseISO(period.startDate)
            : period.startDate;
        const endDate = typeof period.endDate === 'string'
            ? parseISO(period.endDate)
            : period.endDate;

        return {
            id: index,
            startDate,
            endDate,
            startFormatted: format(startDate, 'MMM d'),
            endFormatted: format(endDate, 'MMM d'),
            monthYear: format(startDate, 'MMMM yyyy'),
            daysUntil: Math.ceil((startDate - new Date()) / (1000 * 60 * 60 * 24)),
            isPast: startDate < new Date(),
            isCurrent: isWithinInterval(new Date(), { start: startDate, end: endDate }),
        };
    });
};

export default {
    getPeriodDatesForMonth,
    getFertileDatesForMonth,
    getOvulationDatesForMonth,
    isDateAPeriodDay,
    isDateAFertileDay,
    isDateOvulationDay,
    getDateType,
    getDateStyles,
    getCalendarMonthData,
    formatPredictionsForList,
};
