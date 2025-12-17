import { useState, useEffect } from 'react';
import { storageService } from '../../../infrastructure/storage/storageService.js';

/**
 * Hook for retrieving menstrual tracking data
 * Fetches data from storage and updates on component mount
 */
export const usePeriodTracking = () => {
    const [menstrualData, setMenstrualData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            const data = storageService.menstrualDataService.get();
            setMenstrualData(data);
            setError(null);
        } catch (err) {
            console.error('Error loading menstrual data:', err);
            setError(err.message);
            setMenstrualData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        menstrualData,
        loading,
        error,
        hasPeriodData: !!menstrualData?.lastPeriodDate,
    };
};
