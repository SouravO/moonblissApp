/**
 * usePeriodPrediction Hook
 * 
 * Single reusable hook for consuming period prediction data
 * UI components must ONLY use this hook for period data
 * 
 * DO NOT duplicate prediction logic in components
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import periodStorage from '../../../infrastructure/storage/periodStorage.js';
import periodPredictionService from '../services/periodPredictionService.js';

/**
 * Hook for period prediction data
 * @param {Object} options - Hook options
 * @param {number} options.monthsAhead - Number of months to predict (default: 12)
 * @returns {Object} Period prediction data and utilities
 */
export const usePeriodPrediction = (options = {}) => {
    const { monthsAhead = 12 } = options;

    const [periodData, setPeriodData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load period data from storage
    const loadPeriodData = useCallback(() => {
        try {
            setLoading(true);

            // Migrate legacy data if exists
            periodStorage.migrate();

            const data = periodStorage.get();
            setPeriodData(data);
            setError(null);
        } catch (err) {
            console.error('[usePeriodPrediction] Error loading data:', err);
            setError(err.message);
            setPeriodData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadPeriodData();
    }, [loadPeriodData]);

    // Derived: Check if we have valid period data
    const hasPeriodData = useMemo(() => {
        return !!periodData?.lastPeriodDate;
    }, [periodData]);

    // Derived: Next upcoming period
    const nextPeriod = useMemo(() => {
        if (!hasPeriodData) return null;
        return periodPredictionService.getNextUpcomingPeriod(
            periodData.lastPeriodDate,
            periodData.avgCycleLength,
            periodData.periodDuration
        );
    }, [hasPeriodData, periodData]);

    // Derived: Current cycle phase
    const currentPhase = useMemo(() => {
        if (!hasPeriodData) return null;
        return periodPredictionService.getCurrentCyclePhase(
            periodData.lastPeriodDate,
            periodData.avgCycleLength,
            periodData.periodDuration
        );
    }, [hasPeriodData, periodData]);

    // Derived: Future period predictions
    const futurePeriods = useMemo(() => {
        if (!hasPeriodData) return [];
        return periodPredictionService.predictFuturePeriods(
            periodData.lastPeriodDate,
            periodData.avgCycleLength,
            periodData.periodDuration,
            monthsAhead
        );
    }, [hasPeriodData, periodData, monthsAhead]);

    // Derived: Fertility window
    const fertilityWindow = useMemo(() => {
        if (!hasPeriodData) return null;
        return periodPredictionService.getFertilityWindow(
            periodData.lastPeriodDate,
            periodData.avgCycleLength
        );
    }, [hasPeriodData, periodData]);

    // Utility: Check if a date is in period
    const isDateInPeriod = useCallback((date) => {
        if (!hasPeriodData) return false;
        return periodPredictionService.isDateInPeriod(
            date,
            periodData.lastPeriodDate,
            periodData.avgCycleLength,
            periodData.periodDuration
        );
    }, [hasPeriodData, periodData]);

    // Utility: Check if a date is in fertile window
    const isDateFertile = useCallback((date) => {
        if (!hasPeriodData) return false;
        return periodPredictionService.isDateInFertileWindow(
            date,
            periodData.lastPeriodDate,
            periodData.avgCycleLength
        );
    }, [hasPeriodData, periodData]);

    // Utility: Format date
    const formatDate = useCallback((date, format = 'long') => {
        return periodPredictionService.formatPeriodDate(date, format);
    }, []);

    // Action: Update period data
    const updatePeriodData = useCallback((updates) => {
        try {
            const updated = periodStorage.update(updates);
            setPeriodData(updated);
            return updated;
        } catch (err) {
            console.error('[usePeriodPrediction] Error updating data:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    // Action: Save new period data (for onboarding)
    const savePeriodData = useCallback((data) => {
        try {
            const saved = periodStorage.save(data);
            setPeriodData(saved);
            return saved;
        } catch (err) {
            console.error('[usePeriodPrediction] Error saving data:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    // Action: Clear period data
    const clearPeriodData = useCallback(() => {
        periodStorage.clear();
        setPeriodData(null);
    }, []);

    // Action: Refresh data from storage
    const refresh = useCallback(() => {
        loadPeriodData();
    }, [loadPeriodData]);

    return {
        // State
        loading,
        error,
        hasPeriodData,

        // Raw data
        periodData,
        lastPeriodDate: periodData?.lastPeriodDate || null,
        cycleLength: periodData?.avgCycleLength || 28,
        periodDuration: periodData?.periodDuration || 5,

        // Predictions
        nextPeriod,
        currentPhase,
        futurePeriods,
        fertilityWindow,

        // Utilities
        isDateInPeriod,
        isDateFertile,
        formatDate,

        // Actions
        updatePeriodData,
        savePeriodData,
        clearPeriodData,
        refresh,
    };
};

export default usePeriodPrediction;
