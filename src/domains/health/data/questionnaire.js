/**
 * 20 Medically-Relevant Menstrual Health Onboarding Questions
 * Organized by category for easier management
 */

export const QUESTIONNAIRE_CATEGORIES = {
    CYCLE_BASICS: 'cycle_basics',
    SYMPTOMS: 'symptoms',
    LIFESTYLE: 'lifestyle',
    HEALTH_HISTORY: 'health_history',
};

export const QUESTIONS = [
    // ========== CYCLE BASICS (5 questions) ==========
    {
        id: 'q1_age',
        category: QUESTIONNAIRE_CATEGORIES.CYCLE_BASICS,
        question: 'How old are you?',
        type: 'number',
        min: 13,
        max: 80,
        required: true,
        helpText: 'This helps us understand your cycle patterns better.',
    },
    {
        id: 'q2_cycle_length',
        category: QUESTIONNAIRE_CATEGORIES.CYCLE_BASICS,
        question: 'What is your average menstrual cycle length (in days)?',
        type: 'number',
        min: 21,
        max: 35,
        default: 28,
        required: true,
        helpText: 'Count from the first day of your period to the first day of your next period.',
    },
    {
        id: 'q3_period_duration',
        category: QUESTIONNAIRE_CATEGORIES.CYCLE_BASICS,
        question: 'How many days does your period typically last?',
        type: 'number',
        min: 1,
        max: 10,
        default: 5,
        required: true,
        helpText: 'Average duration of menstrual bleeding.',
    },
    {
        id: 'q4_last_period_date',
        category: QUESTIONNAIRE_CATEGORIES.CYCLE_BASICS,
        question: 'When did your last period start?',
        type: 'date',
        required: true,
        helpText: 'The first day of your last menstrual period.',
    },
    {
        id: 'q5_regularity',
        category: QUESTIONNAIRE_CATEGORIES.CYCLE_BASICS,
        question: 'How would you describe your menstrual cycle?',
        type: 'select',
        options: [
            { value: 'very_regular', label: 'Very regular (same day each month)' },
            { value: 'regular', label: 'Regular (within a few days)' },
            { value: 'somewhat_irregular', label: 'Somewhat irregular' },
            { value: 'very_irregular', label: 'Very irregular (unpredictable)' },
        ],
        required: true,
    },

    // ========== SYMPTOMS (7 questions) ==========
    {
        id: 'q6_cramps',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'Do you experience menstrual cramps?',
        type: 'select',
        options: [
            { value: 'none', label: 'No cramps' },
            { value: 'mild', label: 'Mild cramps' },
            { value: 'moderate', label: 'Moderate cramps' },
            { value: 'severe', label: 'Severe cramps' },
        ],
        required: true,
    },
    {
        id: 'q7_flow_heaviness',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'How would you describe your menstrual flow?',
        type: 'select',
        options: [
            { value: 'light', label: 'Light' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'heavy', label: 'Heavy' },
            { value: 'very_heavy', label: 'Very heavy' },
        ],
        required: true,
    },
    {
        id: 'q8_spotting',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'Do you experience spotting between periods?',
        type: 'select',
        options: [
            { value: 'never', label: 'Never' },
            { value: 'occasionally', label: 'Occasionally' },
            { value: 'frequently', label: 'Frequently' },
        ],
        required: true,
    },
    {
        id: 'q9_pms_symptoms',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'Which PMS symptoms do you experience? (Select all that apply)',
        type: 'multiselect',
        options: [
            { value: 'bloating', label: 'Bloating' },
            { value: 'breast_tenderness', label: 'Breast tenderness' },
            { value: 'mood_changes', label: 'Mood changes' },
            { value: 'fatigue', label: 'Fatigue' },
            { value: 'headaches', label: 'Headaches' },
            { value: 'food_cravings', label: 'Food cravings' },
            { value: 'acne', label: 'Acne' },
            { value: 'none', label: 'None' },
        ],
        required: false,
    },
    {
        id: 'q10_clotting',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'Do you pass blood clots during your period?',
        type: 'select',
        options: [
            { value: 'no', label: 'No' },
            { value: 'small_occasional', label: 'Occasional small clots' },
            { value: 'large_frequent', label: 'Frequent or large clots' },
        ],
        required: true,
    },
    {
        id: 'q11_pain_location',
        category: QUESTIONNAIRE_CATEGORIES.SYMPTOMS,
        question: 'Where do you typically experience period pain?',
        type: 'multiselect',
        options: [
            { value: 'lower_abdomen', label: 'Lower abdomen' },
            { value: 'lower_back', label: 'Lower back' },
            { value: 'thighs', label: 'Thighs' },
            { value: 'no_pain', label: 'No pain' },
        ],
        required: false,
    },

    // ========== LIFESTYLE (5 questions) ==========
    {
        id: 'q12_stress_level',
        category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
        question: 'How would you rate your current stress level?',
        type: 'select',
        options: [
            { value: 'low', label: 'Low' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'high', label: 'High' },
            { value: 'very_high', label: 'Very high' },
        ],
        required: true,
    },
    {
        id: 'q13_exercise_frequency',
        category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
        question: 'How often do you exercise?',
        type: 'select',
        options: [
            { value: 'never', label: 'Never/rarely' },
            { value: '1_2_weekly', label: '1-2 times per week' },
            { value: '3_4_weekly', label: '3-4 times per week' },
            { value: 'daily', label: 'Daily' },
        ],
        required: true,
    },
    {
        id: 'q14_sleep_quality',
        category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
        question: 'How would you rate your typical sleep quality?',
        type: 'select',
        options: [
            { value: 'poor', label: 'Poor' },
            { value: 'fair', label: 'Fair' },
            { value: 'good', label: 'Good' },
            { value: 'excellent', label: 'Excellent' },
        ],
        required: true,
    },
    {
        id: 'q15_sleep_hours',
        category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
        question: 'How many hours of sleep do you typically get per night?',
        type: 'number',
        min: 3,
        max: 12,
        required: true,
    },
    {
        id: 'q16_diet',
        category: QUESTIONNAIRE_CATEGORIES.LIFESTYLE,
        question: 'How would you describe your diet?',
        type: 'select',
        options: [
            { value: 'poor', label: 'Poor (mostly processed foods)' },
            { value: 'fair', label: 'Fair (mix of processed and whole foods)' },
            { value: 'good', label: 'Good (mostly whole foods)' },
            { value: 'excellent', label: 'Excellent (balanced, nutritious)' },
        ],
        required: true,
    },

    // ========== HEALTH HISTORY (3 questions) ==========
    {
        id: 'q17_medical_conditions',
        category: QUESTIONNAIRE_CATEGORIES.HEALTH_HISTORY,
        question: 'Do you have any relevant medical conditions? (Select all that apply)',
        type: 'multiselect',
        options: [
            { value: 'pcos', label: 'PCOS (Polycystic Ovary Syndrome)' },
            { value: 'endometriosis', label: 'Endometriosis' },
            { value: 'thyroid_disorder', label: 'Thyroid disorder' },
            { value: 'diabetes', label: 'Diabetes' },
            { value: 'hormonal_imbalance', label: 'Hormonal imbalance' },
            { value: 'none', label: 'None' },
        ],
        required: false,
    },
    {
        id: 'q18_medications',
        category: QUESTIONNAIRE_CATEGORIES.HEALTH_HISTORY,
        question: 'Are you taking any hormonal medications or birth control?',
        type: 'select',
        options: [
            { value: 'no', label: 'No' },
            { value: 'oral_contraceptive', label: 'Oral contraceptive (pill)' },
            { value: 'hormonal_iud', label: 'Hormonal IUD' },
            { value: 'injection', label: 'Injectable (Depo)' },
            { value: 'patch', label: 'Patch' },
            { value: 'other', label: 'Other hormonal medication' },
        ],
        required: true,
    },
    {
        id: 'q19_goals',
        category: QUESTIONNAIRE_CATEGORIES.HEALTH_HISTORY,
        question: 'What is your primary goal with period tracking?',
        type: 'select',
        options: [
            { value: 'general_health', label: 'General health awareness' },
            { value: 'symptom_management', label: 'Manage symptoms' },
            { value: 'fertility', label: 'Fertility/pregnancy planning' },
            { value: 'contraception', label: 'Contraception planning' },
            { value: 'irregular_cycles', label: 'Track irregular cycles' },
        ],
        required: true,
    },
    {
        id: 'q20_preferences',
        category: QUESTIONNAIRE_CATEGORIES.HEALTH_HISTORY,
        question: 'What types of health insights would be most helpful?',
        type: 'multiselect',
        options: [
            { value: 'cycle_predictions', label: 'Period cycle predictions' },
            { value: 'symptom_tracking', label: 'Symptom tracking' },
            { value: 'wellness_tips', label: 'Wellness tips' },
            { value: 'nutrition_advice', label: 'Nutrition advice' },
            { value: 'exercise_recommendations', label: 'Exercise recommendations' },
            { value: 'community_support', label: 'Community support' },
        ],
        required: false,
    },
];

/**
 * Get all questions
 */
export const getAllQuestions = () => {
    return QUESTIONS;
};

/**
 * Get questions by category
 */
export const getQuestionsByCategory = (category) => {
    return QUESTIONS.filter((q) => q.category === category);
};

/**
 * Get total question count
 */
export const getTotalQuestionCount = () => {
    return QUESTIONS.length;
};

/**
 * Get question by ID
 */
export const getQuestionById = (id) => {
    return QUESTIONS.find((q) => q.id === id);
};

/**
 * Validate answer against question constraints
 * Returns error string or null if valid
 */
export const validateAnswer = (questionId, answer) => {
    const question = getQuestionById(questionId);
    if (!question) return 'Question not found';

    if (question.required && !answer) return 'This field is required';

    if (question.type === 'number') {
        const num = Number(answer);
        if (isNaN(num)) return 'Please enter a valid number';
        if (question.min !== undefined && num < question.min) return `Value must be at least ${question.min}`;
        if (question.max !== undefined && num > question.max) return `Value must be at most ${question.max}`;
    }

    if (question.type === 'select') {
        const validOptions = question.options.map((opt) => opt.value);
        if (answer && !validOptions.includes(answer)) return 'Invalid selection';
    }

    if (question.type === 'multiselect') {
        if (answer && Array.isArray(answer)) {
            const validOptions = question.options.map((opt) => opt.value);
            const invalid = answer.filter((ans) => !validOptions.includes(ans));
            if (invalid.length > 0) return 'One or more selections are invalid';
        }
    }

    return null; // Valid
};
