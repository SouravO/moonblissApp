/**
 * Normalized data schema for all user data in localStorage
 * Uses namespace-based keys for safe coexistence with other apps
 */

const NAMESPACE = 'moonbliss_';
const STORAGE_KEYS = {
    USER_PROFILE: `${NAMESPACE}user_profile`,
    MENSTRUAL_DATA: `${NAMESPACE}menstrual_data`,
    QUESTIONNAIRE_ANSWERS: `${NAMESPACE}questionnaire_answers`,
    ONBOARDING_STATUS: `${NAMESPACE}onboarding_status`,
};

/**
 * Normalized UserProfile Schema
 */
export const createUserProfile = (overrides = {}) => ({
    userId: generateUserId(),
    createdAt: new Date().toISOString(),
    email: null,
    onboardingCompleted: false,
    ...overrides,
});

/**
 * Normalized Menstrual Data Schema
 */
export const createMenstrualData = (overrides = {}) => ({
    lastPeriodDate: null,
    avgCycleLength: 28,
    avgPeriodLength: 5,
    symptoms: [],
    lifestyleFactors: {
        stressLevel: null,
        exerciseFrequency: null,
        sleepQuality: null,
        diet: null,
    },
    recordedAt: new Date().toISOString(),
    ...overrides,
});

/**
 * Normalized Questionnaire Answers Schema
 * Stores all 20 medical questions and answers
 */
export const createQuestionnaireAnswers = (overrides = {}) => ({
    questions: {},
    completedAt: null,
    ...overrides,
});

/**
 * Generate simple UUID for user
 */
const generateUserId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const STORAGE_KEYS_EXPORT = STORAGE_KEYS;
