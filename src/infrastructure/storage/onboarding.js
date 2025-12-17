const ONBOARDING_KEY = 'moonbliss_onboarding';
const USER_DATA_KEY = 'moonbliss_user_data';

export const getOnboardingStatus = () => {
    const status = localStorage.getItem(ONBOARDING_KEY);
    return status === 'completed';
};

export const setOnboardingComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'completed');
};

export const saveUserData = (data) => {
    const existing = getUserData();
    const updated = { ...existing, ...data };
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(updated));
};

export const getUserData = () => {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : {};
};

export const savePeriodData = (lastPeriodDate, cycleLength) => {
    const periodData = {
        lastPeriodDate,
        cycleLength,
        recordedAt: new Date().toISOString(),
    };
    saveUserData({ periodData });
};

export const getPeriodData = () => {
    const userData = getUserData();
    return userData.periodData || null;
};
