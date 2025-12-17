import { useState, useCallback } from 'react';
import { storageService } from '@/infrastructure/storage/storageService.js';

/**
 * Hook for managing questionnaire flow during onboarding
 * Handles questionnaire modal state and integration with storage
 */
export const useQuestionnaireFlow = () => {
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [isQuestionnaireComplete, setIsQuestionnaireComplete] = useState(false);

    /**
     * Open questionnaire modal
     */
    const openQuestionnaire = useCallback(() => {
        setShowQuestionnaire(true);
    }, []);

    /**
     * Close questionnaire modal
     */
    const closeQuestionnaire = useCallback(() => {
        setShowQuestionnaire(false);
    }, []);

    /**
     * Handle questionnaire completion
     * Saves answers to storage and updates state
     */
    const handleQuestionnaireComplete = useCallback((answers) => {
        try {
            // Save answers to storage
            Object.entries(answers).forEach(([questionId, answer]) => {
                storageService.questionnaireService.addAnswer(questionId, answer);
            });

            // Mark questionnaire as complete
            storageService.questionnaireService.complete();

            // Extract period-related answers for menstrual data
            const extractPeriodData = () => {
                const menstrualData = {
                    lastPeriodDate: answers.q4_last_period_date, // Last period date from questionnaire
                    avgCycleLength: parseInt(answers.q2_cycle_length, 10) || 28,
                    avgPeriodLength: parseInt(answers.q3_period_duration, 10) || 5,
                    isCycleRegular: answers.q5_regularity !== 'very_irregular' && answers.q5_regularity !== 'somewhat_irregular',
                    recordedAt: new Date().toISOString().split('T')[0],
                };

                // Add symptoms if provided
                menstrualData.symptoms = [];
                if (answers.q6_cramps && answers.q6_cramps !== 'none') {
                    menstrualData.symptoms.push('cramps_' + answers.q6_cramps);
                }
                if (answers.q7_flow_heaviness && answers.q7_flow_heaviness !== 'light') {
                    menstrualData.symptoms.push('heavy_flow');
                }
                if (answers.q8_spotting && answers.q8_spotting !== 'Never') {
                    menstrualData.symptoms.push('spotting');
                }

                // Add lifestyle factors
                menstrualData.lifestyleFactors = {
                    stressLevel: answers.q11_stress_level || 'moderate',
                    exerciseFrequency: answers.q12_exercise_frequency || 'moderate',
                    sleepQuality: answers.q13_sleep_quality || 'fair',
                    sleepHours: parseInt(answers.q14_sleep_hours, 10) || 7,
                    diet: answers.q15_diet || 'balanced',
                };

                return menstrualData;
            };

            // Update menstrual data with answers
            const menstrualData = extractPeriodData();
            storageService.menstrualDataService.update(menstrualData);

            setIsQuestionnaireComplete(true);
            setShowQuestionnaire(false);

            return true;
        } catch (error) {
            console.error('Error completing questionnaire:', error);
            throw error;
        }
    }, []);

    return {
        showQuestionnaire,
        isQuestionnaireComplete,
        openQuestionnaire,
        closeQuestionnaire,
        handleQuestionnaireComplete,
    };
};
