import React, { useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import { closeOutline, checkmarkCircle, closeCircle } from "ionicons/icons";

/**
 * Quiz Modal Component
 * Displays 5 questions with options, tracks score, shows celebration on completion
 */
const QuizModal = ({ isOpen, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Quiz questions
  const questions = [
    {
      id: 1,
      question: "How many phases are in a typical menstrual cycle?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "4",
      emoji: "🌙",
    },
    {
      id: 2,
      question: "What is the average length of a menstrual cycle?",
      options: ["21 days", "28 days", "35 days", "40 days"],
      correctAnswer: "28 days",
      emoji: "📅",
    },
    {
      id: 3,
      question: "Which hormone is responsible for ovulation?",
      options: ["Estrogen", "Progesterone", "LH (Luteinizing Hormone)", "FSH"],
      correctAnswer: "LH (Luteinizing Hormone)",
      emoji: "🧬",
    },
    {
      id: 4,
      question: "What is the fertile window typically?",
      options: ["Day 1-5", "Day 7-10", "Day 11-16", "Day 20-25"],
      correctAnswer: "Day 11-16",
      emoji: "🌸",
    },
    {
      id: 5,
      question: "Which vitamin helps reduce menstrual cramps?",
      options: ["Vitamin A", "Vitamin B6", "Vitamin C", "Vitamin K"],
      correctAnswer: "Vitamin B6",
      emoji: "💊",
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSelect = useCallback(
    (answer) => {
      if (answered) return;

      setSelectedAnswer(answer);
      setAnswered(true);

      if (answer === currentQuestion.correctAnswer) {
        setScore((prev) => prev + 1);
      }

      // Auto advance after 1.5 seconds
      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setAnswered(false);
        } else {
          setShowResult(true);
        }
      }, 1500);
    },
    [answered, currentQuestion, currentQuestionIndex, totalQuestions]
  );

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswered(false);
  };

  const handleClose = () => {
    handleRestart();
    onClose();
  };

  const getScoreMessage = () => {
    const percentage = (score / totalQuestions) * 100;
    if (percentage === 100)
      return { text: "Perfect! 🎉", color: "text-emerald-500" };
    if (percentage >= 80)
      return { text: "Excellent! 🌟", color: "text-emerald-500" };
    if (percentage >= 60)
      return { text: "Good job! 👏", color: "text-blue-500" };
    if (percentage >= 40)
      return { text: "Keep learning! 📚", color: "text-orange-500" };
    return { text: "Try again! 💪", color: "text-pink-500" };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Confetti Animation for Results */}
      {showResult && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-10%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div
                className="w-3 h-3 rounded-sm"
                style={{
                  backgroundColor: [
                    "#10b981",
                    "#ec4899",
                    "#f59e0b",
                    "#3b82f6",
                    "#8b5cf6",
                    "#ef4444",
                  ][Math.floor(Math.random() * 6)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* CSS for animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti-fall 3s ease-out forwards;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      <div className="relative w-[90%] max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Health Quiz</h2>
              <p className="text-white/80 text-sm">
                {showResult
                  ? "Results"
                  : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Progress Bar */}
        {!showResult && (
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!showResult ? (
            <>
              {/* Question */}
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">
                  {currentQuestion.emoji}
                </span>
                <h3 className="text-xl font-bold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const showCorrectness = answered;

                  let buttonStyle =
                    "bg-gray-100 text-gray-700 hover:bg-gray-200";
                  if (showCorrectness) {
                    if (isCorrect) {
                      buttonStyle =
                        "bg-emerald-100 text-emerald-700 border-2 border-emerald-500";
                    } else if (isSelected && !isCorrect) {
                      buttonStyle =
                        "bg-red-100 text-red-700 border-2 border-red-500 animate-shake";
                    } else {
                      buttonStyle = "bg-gray-100 text-gray-400";
                    }
                  } else if (isSelected) {
                    buttonStyle =
                      "bg-purple-100 text-purple-700 border-2 border-purple-500";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answered}
                      className={`w-full p-4 rounded-xl font-medium text-left transition-all duration-200 flex items-center justify-between ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {showCorrectness && isCorrect && (
                        <IonIcon
                          icon={checkmarkCircle}
                          className="text-emerald-500 text-xl"
                        />
                      )}
                      {showCorrectness && isSelected && !isCorrect && (
                        <IonIcon
                          icon={closeCircle}
                          className="text-red-500 text-xl"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            /* Results Screen */
            <div className="text-center py-6 animate-bounce-in">
              {/* Trophy/Medal */}
              <div className="text-7xl mb-4">
                {score === totalQuestions ? "🏆" : score >= 3 ? "🥈" : "🎯"}
              </div>

              {/* Score */}
              <h3
                className={`text-3xl font-bold mb-2 ${getScoreMessage().color}`}
              >
                {getScoreMessage().text}
              </h3>

              <p className="text-gray-600 text-lg mb-2">Your Score</p>

              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-5xl font-bold text-gray-800">
                  {score}
                </span>
                <span className="text-2xl text-gray-400">
                  / {totalQuestions}
                </span>
              </div>

              {/* Score percentage */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleRestart}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                >
                  Play Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
