import React, { useState, useCallback, useMemo } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { chevronForward, chevronBack } from "ionicons/icons";
import {
  getAllQuestions,
  getQuestionsByCategory,
  validateAnswer,
} from "../data/questionnaire.js";
import { storageService } from "@/infrastructure/storage/storageService.js";

/**
 * Multi-Step Questionnaire Modal Component
 * Displays 20 medical questions in paginated steps
 * - 5 questions per step
 * - Full validation and error handling
 * - Progressive save to localStorage
 */
const ComprehensiveQuestionnaireModal = ({ isOpen, onClose, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get all questions and organize into steps (5 per step)
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const questionsPerStep = 5;
  const totalSteps = Math.ceil(allQuestions.length / questionsPerStep);

  // Get questions for current step
  const currentQuestions = useMemo(() => {
    const start = currentStep * questionsPerStep;
    const end = start + questionsPerStep;
    return allQuestions.slice(start, end);
  }, [currentStep, allQuestions]);

  // Calculate step labels
  const stepLabels = useMemo(() => {
    return [
      "Cycle Basics",
      "Symptoms",
      "Symptoms (Continued)",
      "Lifestyle",
      "Health History",
    ];
  }, []);

  /**
   * Handle answer change
   */
  const handleAnswerChange = useCallback(
    (questionId, value) => {
      const question = allQuestions.find((q) => q.id === questionId);
      if (!question) return;

      // Validate answer - validateAnswer now returns error string or null
      const error = validateAnswer(questionId, value);
      if (error) {
        setErrors((prev) => ({ ...prev, [questionId]: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[questionId];
          return newErrors;
        });
      }

      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    [allQuestions]
  );

  /**
   * Check if current step is complete
   */
  const isStepComplete = useCallback(() => {
    return currentQuestions.every(
      (question) =>
        answers[question.id] !== undefined &&
        answers[question.id] !== null &&
        answers[question.id] !== ""
    );
  }, [currentQuestions, answers]);

  /**
   * Handle next step
   */
  const handleNextStep = useCallback(() => {
    if (!isStepComplete()) {
      // Mark incomplete questions as having errors
      const newErrors = {};
      currentQuestions.forEach((question) => {
        if (!answers[question.id]) {
          newErrors[question.id] = "This field is required";
        }
      });
      setErrors(newErrors);
      return;
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep, totalSteps, currentQuestions, answers, isStepComplete]);

  /**
   * Handle previous step
   */
  const handlePreviousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo(0, 0);
    }
  }, [currentStep]);

  /**
   * Handle submission
   */
  const handleSubmit = useCallback(async () => {
    if (!isStepComplete()) {
      const newErrors = {};
      currentQuestions.forEach((question) => {
        if (!answers[question.id]) {
          newErrors[question.id] = "This field is required";
        }
      });
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Save all answers to storage
      allQuestions.forEach((question) => {
        storageService.questionnaireService.addAnswer(
          question.id,
          answers[question.id]
        );
      });

      // Mark questionnaire as complete
      storageService.questionnaireService.complete();

      // Call completion callback
      if (onComplete) {
        onComplete(answers);
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      alert("Error saving your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestions, isStepComplete, answers, allQuestions, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-6 border-b border-gray-200 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Health Questionnaire
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {stepLabels[currentStep]}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">
                {currentStep + 1}
              </p>
              <p className="text-xs text-gray-600">of {totalSteps} steps</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="px-6 py-6 space-y-6">
          {currentQuestions.map((question) => (
            <QuestionField
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => handleAnswerChange(question.id, value)}
              error={errors[question.id]}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
          {currentStep > 0 && (
            <IonButton
              expand="block"
              fill="outline"
              onClick={handlePreviousStep}
              disabled={isSubmitting}
            >
              <IonIcon slot="start" icon={chevronBack} />
              Previous
            </IonButton>
          )}

          {currentStep < totalSteps - 1 ? (
            <IonButton
              expand="block"
              color="primary"
              onClick={handleNextStep}
              disabled={isSubmitting}
            >
              Next
              <IonIcon slot="end" icon={chevronForward} />
            </IonButton>
          ) : (
            <IonButton
              expand="block"
              color="success"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Complete Questionnaire"}
            </IonButton>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Question Field Component
 * Handles different question types (text, select, multiselect, number, date)
 */
const QuestionField = React.memo(({ question, value, onChange, error }) => {
  const renderField = () => {
    switch (question.type) {
      case "text":
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter your answer"}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(parseInt(e.target.value, 10) || null)}
            placeholder={question.placeholder || "Enter a number"}
            min={question.min}
            max={question.max}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        );

      case "select":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "multiselect":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(value || []).includes(option.value)}
                  onChange={(e) => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) {
                      newValue.push(option.value);
                    } else {
                      newValue.splice(newValue.indexOf(option.value), 1);
                    }
                    onChange(newValue);
                  }}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-5 h-5 text-purple-600 border-gray-300 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return <p className="text-gray-500">Unknown question type</p>;
    }
  };

  return (
    <div>
      <div className="mb-2">
        <label className="block text-sm font-semibold text-gray-800 mb-1">
          {question.question}
        </label>
        {question.helpText && (
          <p className="text-xs text-gray-500 italic">{question.helpText}</p>
        )}
      </div>

      {renderField()}

      {error && (
        <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
          <span>⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
});

QuestionField.displayName = "QuestionField";

export default ComprehensiveQuestionnaireModal;
