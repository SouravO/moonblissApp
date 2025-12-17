/**
 * Storage Service Abstraction Layer
 * Single source of truth for all localStorage operations
 * Never access localStorage directly from components
 */

import {
    STORAGE_KEYS_EXPORT as STORAGE_KEYS,
    createUserProfile,
    createMenstrualData,
    createQuestionnaireAnswers,
} from './schema';

/**
 * User Profile Operations
 */
export const userProfileService = {
    get: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
            return data ? JSON.parse(data) : createUserProfile();
        } catch (error) {
            console.error('Failed to get user profile:', error);
            return createUserProfile();
        }
    },

    save: (profile) => {
        try {
            localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    },

    update: (updates) => {
        const current = userProfileService.get();
        const updated = { ...current, ...updates };
        userProfileService.save(updated);
        return updated;
    },

    exists: () => {
        return localStorage.getItem(STORAGE_KEYS.USER_PROFILE) !== null;
    },
};

/**
 * Menstrual Data Operations
 */
export const menstrualDataService = {
    get: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.MENSTRUAL_DATA);
            return data ? JSON.parse(data) : createMenstrualData();
        } catch (error) {
            console.error('Failed to get menstrual data:', error);
            return createMenstrualData();
        }
    },

    save: (data) => {
        try {
            localStorage.setItem(STORAGE_KEYS.MENSTRUAL_DATA, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save menstrual data:', error);
        }
    },

    update: (updates) => {
        const current = menstrualDataService.get();
        const updated = {
            ...current,
            ...updates,
            recordedAt: new Date().toISOString(),
        };
        menstrualDataService.save(updated);
        return updated;
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.MENSTRUAL_DATA);
    },
};

/**
 * Questionnaire Answers Operations
 */
export const questionnaireService = {
    get: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.QUESTIONNAIRE_ANSWERS);
            return data ? JSON.parse(data) : createQuestionnaireAnswers();
        } catch (error) {
            console.error('Failed to get questionnaire answers:', error);
            return createQuestionnaireAnswers();
        }
    },

    save: (answers) => {
        try {
            localStorage.setItem(STORAGE_KEYS.QUESTIONNAIRE_ANSWERS, JSON.stringify(answers));
        } catch (error) {
            console.error('Failed to save questionnaire answers:', error);
        }
    },

    addAnswer: (questionId, answer) => {
        const current = questionnaireService.get();
        current.questions[questionId] = answer;
        questionnaireService.save(current);
        return current;
    },

    getAnswer: (questionId) => {
        const current = questionnaireService.get();
        return current.questions[questionId] || null;
    },

    complete: () => {
        const current = questionnaireService.get();
        current.completedAt = new Date().toISOString();
        questionnaireService.save(current);
        return current;
    },

    clear: () => {
        localStorage.removeItem(STORAGE_KEYS.QUESTIONNAIRE_ANSWERS);
    },
};

/**
 * Onboarding Status Operations
 */
export const onboardingService = {
    isComplete: () => {
        const profile = userProfileService.get();
        return profile.onboardingCompleted === true;
    },

    markComplete: () => {
        userProfileService.update({ onboardingCompleted: true });
    },

    reset: () => {
        userProfileService.update({ onboardingCompleted: false });
        menstrualDataService.clear();
        questionnaireService.clear();
    },
};

/**
 * Composite operation: Save complete onboarding
 */
export const saveCompleteOnboarding = (email, menstrualData, answers) => {
    userProfileService.update({ email, onboardingCompleted: true });
    menstrualDataService.save(menstrualData);
    questionnaireService.save({ ...answers, completedAt: new Date().toISOString() });
};

/**
 * Composite operation: Get all user data
 */
export const getAllUserData = () => ({
    profile: userProfileService.get(),
    menstrualData: menstrualDataService.get(),
    questionnaire: questionnaireService.get(),
});

/**
 * Reset all data (for development/testing)
 */
export const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    localStorage.removeItem(STORAGE_KEYS.MENSTRUAL_DATA);
    localStorage.removeItem(STORAGE_KEYS.QUESTIONNAIRE_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_STATUS);
};

/**
 * Export all services as a single object for convenience
 */
export const storageService = {
    userProfileService,
    menstrualDataService,
    questionnaireService,
    onboardingService,
    saveCompleteOnboarding,
    getAllUserData,
    clearAllData,
};
