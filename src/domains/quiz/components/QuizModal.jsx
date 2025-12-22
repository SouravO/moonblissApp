import React, { useState, useCallback, useMemo } from "react";
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

      setTimeout(() => {
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setAnswered(false);
        } else {
          setShowResult(true);
        }
      }, 900);
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
    if (percentage === 100) return { text: "Perfect! 🎉", color: "text-blue-200" };
    if (percentage >= 80) return { text: "Excellent! 🌟", color: "text-blue-200" };
    if (percentage >= 60) return { text: "Good job! 👏", color: "text-blue-200" };
    if (percentage >= 40) return { text: "Keep learning! 📚", color: "text-blue-200" };
    return { text: "Try again! 💪", color: "text-blue-200" };
  };

  // Standard button system
  const btnBase =
    "relative w-full min-h-[52px] px-4 py-3 rounded-xl font-semibold text-[15px] tracking-wide " +
    "flex items-center justify-center gap-2 select-none " +
    "transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50 " +
    "disabled:cursor-not-allowed";

  const btnDefault =
    "bg-slate-800/60 text-white border border-slate-600/50 " +
    "shadow-[0_8px_18px_rgba(0,0,0,0.35)] " +
    "hover:bg-slate-700/60 hover:border-slate-500/70";

  const btnSelected =
    "bg-slate-700/70 text-white border border-cyan-400/40 " +
    "shadow-[0_10px_22px_rgba(34,211,238,0.12)]";

  const btnCorrect =
    "bg-emerald-600/85 text-white border border-emerald-300/60 " +
    "shadow-[0_12px_26px_rgba(16,185,129,0.20)]";

  const btnWrong =
    "bg-rose-600/85 text-white border border-rose-300/60 " +
    "shadow-[0_12px_26px_rgba(244,63,94,0.20)]";

  const btnMuted =
    "bg-slate-900/40 text-slate-400 border border-slate-700/50 shadow-none";

  const getOptionClass = useCallback(
    (option) => {
      const isSelected = selectedAnswer === option;
      const isCorrect = option === currentQuestion.correctAnswer;

      if (answered) {
        if (isCorrect) return `${btnBase} ${btnCorrect}`;
        if (isSelected && !isCorrect) return `${btnBase} ${btnWrong}`;
        return `${btnBase} ${btnMuted}`;
      }

      if (isSelected) return `${btnBase} ${btnSelected}`;
      return `${btnBase} ${btnDefault}`;
    },
    [
      answered,
      selectedAnswer,
      currentQuestion.correctAnswer,
      btnBase,
      btnCorrect,
      btnWrong,
      btnMuted,
      btnSelected,
      btnDefault,
    ]
  );

  const primaryBtn =
    "min-h-[52px] rounded-xl px-4 py-3 font-semibold text-[15px] tracking-wide " +
    "transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-400/50";

  const primarySolid =
    "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border border-white/10 " +
    "shadow-[0_10px_24px_rgba(59,130,246,0.18)] hover:brightness-110";

  const secondaryGhost =
    "bg-slate-800/50 text-white border border-slate-600/50 " +
    "shadow-[0_8px_18px_rgba(0,0,0,0.25)] hover:bg-slate-700/50 hover:border-slate-500/70";

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
                  backgroundColor: ["#1e40af", "#0369a1", "#0284c7", "#0ea5e9", "#06b6d4", "#22d3ee"][
                    Math.floor(Math.random() * 6)
                  ],
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
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti-fall 3s ease-out forwards; }
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.45s ease-out forwards; }
      `}</style>

      <div className="relative w-[90%] max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-blue-600/40 overflow-hidden border border-blue-500/20 group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Header */}
        <div className="relative z-10 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-4 flex items-center justify-between overflow-hidden">
          <div className="relative z-20 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-xl">🧠</span>
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Health Quiz</h2>
              <p className="text-blue-100 text-sm">
                {showResult ? "Results" : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="relative z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all active:scale-95"
            aria-label="Close"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Progress Bar */}
        {!showResult && (
          <div className="relative z-10 h-2 bg-slate-700/50 border-b border-blue-500/20">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 transition-all duration-500 shadow-lg shadow-blue-500/50"
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 p-6">
          {!showResult ? (
            <>
              {/* Question */}
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block drop-shadow-lg">{currentQuestion.emoji}</span>
                <h3 className="text-2xl font-black text-white leading-snug bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isCorrect = option === currentQuestion.correctAnswer;
                  const isSelected = selectedAnswer === option;

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={answered}
                      className={getOptionClass(option)}
                    >
                      {answered && isCorrect && (
                        <IonIcon icon={checkmarkCircle} className="text-white text-xl" />
                      )}
                      {answered && isSelected && !isCorrect && (
                        <IonIcon icon={closeCircle} className="text-white text-xl" />
                      )}
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-8 animate-bounce-in">
              <div className="text-8xl mb-6 drop-shadow-2xl">
                {score === totalQuestions ? "🏆" : score >= 3 ? "🥈" : "🎯"}
              </div>

              <h3 className={`text-4xl font-black mb-2 ${getScoreMessage().color}`}>
                {getScoreMessage().text}
              </h3>

              <p className="text-blue-300/80 text-lg mb-4">Your Score</p>

              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {score}
                </span>
                <span className="text-2xl text-blue-300/60">/ {totalQuestions}</span>
              </div>

              <div className="w-full bg-slate-700/50 rounded-full h-5 mb-8 overflow-hidden border border-blue-500/30 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 transition-all duration-700 shadow-lg shadow-blue-500/50"
                  style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={handleRestart} className={`flex-1 ${primaryBtn} ${primarySolid}`}>
                  Play Again 🔄
                </button>
                <button onClick={handleClose} className={`flex-1 ${primaryBtn} ${secondaryGhost}`}>
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
