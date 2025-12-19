/**
 * Period Storage Module
 * Dedicated storage for period-related data
 * Single source of truth for all period data in the app
 * 
 * DO NOT use localStorage directly in UI components
 * Always use these functions via the service layer
 */

const PERIOD_STORAGE_KEY = 'moonbliss_period_data';

/**
 * Default period data structure
 */
const createDefaultPeriodData = () => ({
    lastPeriodDate: null,      // ISO date string (YYYY-MM-DD)
    avgCycleLength: 28,        // Average cycle length in days
    periodDuration: 5,         // Period duration in days
    recordedAt: null,          // When data was first recorded
    updatedAt: null,           // When data was last updated
});

/**
 * Get period data from storage
 * @returns {Object} Period data object
 */
export const getPeriodData = () => {
    try {
        const data = localStorage.getItem(PERIOD_STORAGE_KEY);
        if (data) {
            return { ...createDefaultPeriodData(), ...JSON.parse(data) };
        }
        return createDefaultPeriodData();
    } catch (error) {
        console.error('[PeriodStorage] Failed to get period data:', error);
        return createDefaultPeriodData();
    }
};

/**
 * Save period data to storage
 * @param {Object} data - Period data to save
 */
export const savePeriodData = (data) => {
    try {
        const existingData = getPeriodData();
        const updatedData = {
            ...existingData,
            ...data,
            updatedAt: new Date().toISOString(),
            recordedAt: existingData.recordedAt || new Date().toISOString(),
        };
        localStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify(updatedData));
        return updatedData;
    } catch (error) {
        console.error('[PeriodStorage] Failed to save period data:', error);
        throw error;
    }
};

/**
 * Update specific period data fields
 * @param {Object} updates - Fields to update
 * @returns {Object} Updated period data
 */
export const updatePeriodData = (updates) => {
    const current = getPeriodData();
    return savePeriodData({ ...current, ...updates });
};

/**
 * Check if period data has been collected
 * @returns {boolean}
 */
export const hasPeriodDataStored = () => {
    const data = getPeriodData();
    return !!data.lastPeriodDate;
};

/**
 * Clear all period data
 */
export const clearPeriodData = () => {
    try {
        localStorage.removeItem(PERIOD_STORAGE_KEY);
    } catch (error) {
        console.error('[PeriodStorage] Failed to clear period data:', error);
    }
};

/**
 * Migrate data from legacy storage (if exists)
 * Call this during app initialization
 */
export const migrateLegacyPeriodData = () => {
    try {
        // Check for legacy menstrual data
        const legacyKey = 'moonbliss_menstrual_data';
        const legacyData = localStorage.getItem(legacyKey);

        if (legacyData && !hasPeriodDataStored()) {
            const parsed = JSON.parse(legacyData);
            if (parsed.lastPeriodDate) {
                savePeriodData({
                    lastPeriodDate: parsed.lastPeriodDate,
                    avgCycleLength: parsed.avgCycleLength || 28,
                    periodDuration: parsed.avgPeriodLength || 5,
                });
            }
        }
    } catch (error) {
        console.error('[PeriodStorage] Migration failed:', error);
    }
};

export default {
    get: getPeriodData,
    save: savePeriodData,
    update: updatePeriodData,
    hasData: hasPeriodDataStored,
    clear: clearPeriodData,
    migrate: migrateLegacyPeriodData,
};
