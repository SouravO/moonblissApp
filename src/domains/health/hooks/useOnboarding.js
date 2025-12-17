import { useState, useEffect } from 'react';
import { getOnboardingStatus, setOnboardingComplete, saveUserData } from '@/infrastructure/storage/onboarding';

export const useOnboarding = () => {
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(null);
    const [showPeriodModal, setShowPeriodModal] = useState(false);

    useEffect(() => {
        const status = getOnboardingStatus();
        setIsOnboardingComplete(status);
    }, []);

    const completeNameStep = (name) => {
        saveUserData({ name });
        setShowPeriodModal(true);
    };

    const completePeriodStep = () => {
        setOnboardingComplete();
        setShowPeriodModal(false);
        // Trigger page reload to let router detect completion
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    const skipPeriodStep = () => {
        setOnboardingComplete();
        setShowPeriodModal(false);
        // Trigger page reload to let router detect completion
        setTimeout(() => {
            window.location.reload();
        }, 100);
    };

    return {
        isOnboardingComplete,
        showPeriodModal,
        completeNameStep,
        completePeriodStep,
        skipPeriodStep,
    };
};
