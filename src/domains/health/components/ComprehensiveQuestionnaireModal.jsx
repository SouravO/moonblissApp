import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import { IonIcon } from "@ionic/react";
import { closeOutline } from "ionicons/icons";
import { getAllQuestions, validateAnswer } from "../data/questionnaire.js";
import { storageService } from "@/infrastructure/storage/storageService.js";

/**
 * Floating Image Component - Individual image in the carousel
 * Images float above the white card and swipe independently  
 * Uses percentage-based positioning for responsivenessbb
 */
const FloatingImage = React.memo(
  ({ question, position, dragOffset, containerWidth }) => {
    const [imageError, setImageError] = useState(false);

    // Calculate transform based on position and drag offset
    // Use percentage of container width for responsive spacing
    const getImageStyle = () => {
      // Responsive spacing: 40% of container width between images, clamped
      const spacing = Math.min(Math.max(containerWidth * 0.35, 120), 200);
      const baseOffset = position * spacing;
      const totalOffset = baseOffset + dragOffset;

      // Scale based on distance from center (relative to container)
      const distanceFromCenter = Math.abs(totalOffset);
      const maxDistance = containerWidth * 0.5;
      const scale = Math.max(0.5, 1 - (distanceFromCenter / maxDistance) * 0.5);

      // Opacity based on distance
      const opacity = Math.max(
        0.2,
        1 - (distanceFromCenter / maxDistance) * 0.8
      );

      // Blur for side items
      const blur =
        distanceFromCenter > 30 ? Math.min(2, distanceFromCenter / 80) : 0;

      // 360° rotation effect based on drag offset
      const rotationAngle = (dragOffset / containerWidth) * 360;

      return {
        transform: `translateX(calc(-50% + ${totalOffset}px)) translateY(-50%) scale(${scale}) rotateZ(${rotationAngle}deg)`,
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : "none",
        zIndex: 100 - Math.abs(position),
      };
    };

    const renderImage = () => {
      if (question?.image && !imageError) {
        return (
          <img
            src={question.image}
            alt=""
            onError={() => setImageError(true)}
            className="w-36 h-36 xs:w-40 xs:h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 object-contain drop-shadow-2xl"
            draggable={false}
          />
        );
      }
      if (question?.emoji) {
        return (
          <div className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl drop-shadow-lg select-none">
            {question.emoji}
          </div>
        );
      }
      return (
        <div className="w-28 h-28 xs:w-32 xs:h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
          <span className="text-3xl xs:text-4xl sm:text-5xl">✨</span>
        </div>
      );
    };

    return (
      <div
        className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out pointer-events-none"
        style={getImageStyle()}
      >
        {renderImage()}
      </div>
    );
  }
);

FloatingImage.displayName = "FloatingImage";

/**
 * Main Questionnaire Modal with Swipeable Images + Fixed Card
 * Like Starbucks UI: images swipe, white card content updates
 */
const ComprehensiveQuestionnaireModal = ({ isOpen, onClose, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(360);
  const [rotation, setRotation] = useState(0);

  // Touch handling refs
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  // Track container width for responsive image positioning
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [isOpen]);

  // Get all questions
  const allQuestions = useMemo(() => getAllQuestions(), []);
  const totalQuestions = allQuestions.length;
  const currentQuestion = allQuestions[currentQuestionIndex];

  /**
   * Handle touch/mouse start
   */
  const handleDragStart = useCallback((clientX) => {
    touchStartX.current = clientX;
    setIsDragging(true);
  }, []);

  /**
   * Handle touch/mouse move
   */
  const handleDragMove = useCallback(
    (clientX) => {
      if (!isDragging) return;
      const diff = clientX - touchStartX.current;
      setDragOffset(diff);
    },
    [isDragging]
  );

  /**
   * Handle touch/mouse end - determine swipe direction
   */
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 80;

    if (dragOffset < -threshold && currentQuestionIndex < totalQuestions - 1) {
      // Swipe left - next question (if answered)
      const answer = answers[currentQuestion?.id];
      if (answer !== undefined && answer !== null && answer !== "") {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setErrors((prev) => ({
          ...prev,
          [currentQuestion?.id]: "Please answer this question",
        }));
      }
    } else if (dragOffset > threshold && currentQuestionIndex > 0) {
      // Swipe right - previous question
      setCurrentQuestionIndex((prev) => prev - 1);
    }

    setDragOffset(0);
  }, [
    isDragging,
    dragOffset,
    currentQuestionIndex,
    totalQuestions,
    answers,
    currentQuestion,
  ]);

  // Touch event handlers
  const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleDragEnd();

  // Mouse event handlers for desktop testing
  const handleMouseDown = (e) => handleDragStart(e.clientX);
  const handleMouseMove = (e) => handleDragMove(e.clientX);
  const handleMouseUp = () => handleDragEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleDragEnd();
  };

  /**
   * Handle answer change
   */
  const handleAnswerChange = useCallback(
    (questionId, value, shouldAutoAdvance = false) => {
      const question = allQuestions.find((q) => q.id === questionId);
      if (!question) return;

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

      // Auto-advance for select/radio
      if (
        shouldAutoAdvance &&
        !error &&
        currentQuestionIndex < totalQuestions - 1
      ) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 400);
      }
    },
    [allQuestions, currentQuestionIndex, totalQuestions]
  );

  /**
   * Handle next question
   */
  const handleNext = useCallback(() => {
    const answer = answers[currentQuestion?.id];

    if (answer === undefined || answer === null || answer === "") {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion?.id]: "Please answer this question",
      }));
      return;
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, totalQuestions, currentQuestion, answers]);

  /**
   * Handle submission
   */
  const handleSubmit = useCallback(async () => {
    const answer = answers[currentQuestion?.id];

    if (answer === undefined || answer === null || answer === "") {
      setErrors((prev) => ({
        ...prev,
        [currentQuestion?.id]: "Please answer this question",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      allQuestions.forEach((question) => {
        if (answers[question.id] !== undefined) {
          storageService.questionnaireService.addAnswer(
            question.id,
            answers[question.id]
          );
        }
      });

      storageService.questionnaireService.complete();

      if (onComplete) {
        onComplete(answers);
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      alert("Error saving your responses. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [currentQuestion, allQuestions, answers, onComplete]);

  /**
   * Render input based on question type
   */
  const renderInput = () => {
    if (!currentQuestion) return null;
    const value = answers[currentQuestion.id];

    switch (currentQuestion.type) {
      case "select":
      case "radio":
        return (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-3">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() =>
                    handleAnswerChange(currentQuestion.id, option.value, true)
                  }
                  className={`relative px-6 sm:px-7 py-3.5 sm:py-3 rounded-[20px] sm:rounded-2xl font-bold text-sm sm:text-sm transition-all duration-300 overflow-hidden group active:scale-95 transform ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-600/60 scale-105"
                      : "bg-white border-2.5 border-blue-200 text-blue-700 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-200/50"
                  }`}
                  style={{
                    animation: isSelected ? `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both` : `slideUp 0.3s ease-out both`,
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Pulse background for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse" />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-2">
                    {isSelected && <span className="text-lg">✓</span>}
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case "multiselect":
        return (
          <div className="flex flex-wrap justify-center gap-3 sm:gap-3">
            {currentQuestion.options?.map((option, idx) => {
              const isSelected = (value || []).includes(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    const newValue = Array.isArray(value) ? [...value] : [];
                    if (isSelected) {
                      newValue.splice(newValue.indexOf(option.value), 1);
                    } else {
                      newValue.push(option.value);
                    }
                    handleAnswerChange(currentQuestion.id, newValue, false);
                  }}
                  className={`relative px-6 sm:px-7 py-3.5 sm:py-3 rounded-[20px] sm:rounded-2xl font-bold text-sm sm:text-sm transition-all duration-300 overflow-hidden group active:scale-95 transform ${
                    isSelected
                      ? "bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-600/60 scale-105"
                      : "bg-white border-2.5 border-blue-200 text-blue-700 hover:border-blue-500 hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-200/50"
                  }`}
                  style={{
                    animation: isSelected ? `popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both` : `slideUp 0.3s ease-out both`,
                    animationDelay: `${idx * 0.05}s`,
                  }}
                >
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  {/* Pulse background for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 animate-pulse" />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-2">
                    {isSelected && <span className="text-lg">✓</span>}
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        );

      case "number":
        return (
          <div className="flex justify-center">
            <input
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleAnswerChange(
                  currentQuestion.id,
                  parseInt(e.target.value, 10) || null,
                  false
                )
              }
              placeholder={currentQuestion.placeholder || "0"}
              min={currentQuestion.min}
              max={currentQuestion.max}
              className="w-32 px-4 py-3 text-center text-2xl font-bold bg-blue-50 text-blue-900 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        );

      case "date":
        return (
          <div className="flex justify-center">
            <input
              type="date"
              value={value || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value, false)
              }
              className="px-5 py-3 text-lg font-medium bg-blue-50 text-blue-900 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        );

      case "text":
      default:
        return (
          <div className="flex justify-center">
            <input
              type="text"
              value={value || ""}
              onChange={(e) =>
                handleAnswerChange(currentQuestion.id, e.target.value, false)
              }
              placeholder={currentQuestion.placeholder || "Type here..."}
              className="w-full px-5 py-3 text-lg text-center bg-blue-50 text-blue-900 placeholder-blue-400 rounded-2xl border-2 border-blue-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
        );
    }
  };

  if (!isOpen) return null;

  // Get visible question indices for image carousel (show 2 on each side)
  const visibleIndices = [];
  for (let i = currentQuestionIndex - 2; i <= currentQuestionIndex + 2; i++) {
    if (i >= 0 && i < totalQuestions) {
      visibleIndices.push(i);
    }
  }

  const isLast = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="fixed inset-0 z-50 bg-blue-600 overflow-hidden">
      {/* Top Half - Header + Progress + Image Carousel (50% height) */}
      <div className="h-[50vh] flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-4 sm:px-6 pt-8 sm:pt-10 pb-2 sm:pb-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-lg sm:text-xl">🌙</span>
            </div>
            <span className="text-white font-semibold text-base sm:text-lg">
              Moonbliss
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <IonIcon
              icon={closeOutline}
              className="text-white text-xl sm:text-2xl"
            />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex-shrink-0 flex justify-center gap-1 sm:gap-1.5 px-4 sm:px-6 py-1.5 sm:py-2">
          {allQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                idx === currentQuestionIndex
                  ? "w-6 sm:w-8 bg-white"
                  : idx < currentQuestionIndex
                  ? "w-1.5 sm:w-2 bg-white/80"
                  : "w-1.5 sm:w-2 bg-white/40"
              }`}
            />
          ))}
        </div>

        {/* Image Carousel Area - Takes remaining space in top 50% */}
        <div
          ref={containerRef}
          className="flex-1 relative flex items-center justify-center overflow-hidden  "
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          {/* Floating images - centered in available space */}
          {visibleIndices.map((index) => (
            <FloatingImage
              key={allQuestions[index].id}
              question={allQuestions[index]}
              position={index - currentQuestionIndex}
              dragOffset={isDragging ? dragOffset : 0}
              containerWidth={containerWidth}
            />
          ))}
        </div>
      </div>

      {/* Bottom Half - White Question Card (50% height) */}
      <div className="h-[50vh] bg-white rounded-t-[2.5rem] shadow-2xl overflow-y-auto">
        <div className="px-5 sm:px-8 md:px-12 pt-5 sm:pt-6 pb-4 max-w-lg mx-auto">
          {/* Question number and progress */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-xl sm:text-2xl font-bold text-gray-900">
              Q{currentQuestionIndex + 1}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-xs sm:text-sm font-medium text-gray-500">
              {currentQuestionIndex + 1} of {totalQuestions}
            </span>
          </div>

          {/* Question text */}
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 leading-snug mb-1 sm:mb-1.5">
            {currentQuestion?.question}
          </h2>

          {/* Help text */}
          {currentQuestion?.helpText && (
            <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 leading-relaxed">
              {currentQuestion.helpText}
            </p>
          )}

          {/* Error message */}
          {errors[currentQuestion?.id] && (
            <p className="text-xs sm:text-sm text-red-500 mb-3 text-center bg-red-50 rounded-xl py-2 font-medium">
              {errors[currentQuestion?.id]}
            </p>
          )}

          {/* Input area */}
          <div className="mb-6 sm:mb-5">{renderInput()}</div>

          {/* Action button */}
          <button
            onClick={isLast ? handleSubmit : handleNext}
            disabled={isSubmitting}
            className="relative w-full py-4 sm:py-3.5 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 text-white text-sm sm:text-base font-black rounded-[24px] sm:rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-600/60 hover:-translate-y-1.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:translate-y-0 shadow-xl shadow-blue-600/50 overflow-hidden group"
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />
            
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-[24px] sm:rounded-2xl bg-blue-500 opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-300" />
            
            <span className="relative z-10 flex items-center justify-center gap-2.5">
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin text-lg">⚙️</span>
                  <span>Saving...</span>
                </>
              ) : isLast ? (
                <>
                  <span className="text-lg animate-bounce">✓</span>
                  <span>Complete</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span className="inline-block animate-pulse">→</span>
                </>
              )}
            </span>
          </button>

          {/* Animated decorative elements below button */}
          <div className="mt-4 sm:mt-3 flex justify-center items-center gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                style={{
                  animation: `float 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                  opacity: 0.6,
                }}
              />
            ))}
          </div>

          <style>{`
            @keyframes popIn {
              0% {
                transform: scale(0.6);
                opacity: 0;
              }
              50% {
                transform: scale(1.15);
              }
              100% {
                transform: scale(1);
                opacity: 1;
              }
            }

            @keyframes slideUp {
              0% {
                transform: translateY(10px);
                opacity: 0;
              }
              100% {
                transform: translateY(0);
                opacity: 1;
              }
            }

            @keyframes float {
              0%, 100% {
                transform: translateY(0px);
              }
              50% {
                transform: translateY(-8px);
              }
            }

            @keyframes shimmer {
              0% {
                transform: translateX(-100%);
              }
              100% {
                transform: translateX(100%);
              }
            }

            .animate-shimmer {
              animation: shimmer 3s infinite;
            }
          `}</style>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-4" />
      </div>
    </div>
  );
};

export default ComprehensiveQuestionnaireModal;

