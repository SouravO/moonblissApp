import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { IonIcon } from "@ionic/react";
import {
  footstepsOutline,
  flameOutline,
  trendingUpOutline,
  timeOutline,
  musicalNotesOutline,
  helpCircleOutline,
  analyticsOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import PageLayout from "../layout/PageLayout";
import ColorBg from "@/components/ColorBg";
import QuizModal from "../../domains/quiz/components/QuizModal";
import StepTrackerModal from "../../domains/tracker/components/StepTrackerModal";
import MoodTracker from "../../domains/moodTracker/MoodTracker";
import JokeModal from "../../domains/Joke/JokeModal";
import { Bell } from "lucide-react";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

/* Animation presets */
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Activities = () => {
  const history = useHistory();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const [showMoodTracker, setShowMoodTracker] = useState(false);
  const [showJoke, setShowJoke] = useState(false);

  const [stepData, setStepData] = useState({
    steps: 0,
    calories: 0,
    distance: 0,
    duration: 0,
  });

  useEffect(() => {
    const savedData = localStorage.getItem("stepTrackerData");
    if (savedData) {
      setStepData(JSON.parse(savedData));
    }
  }, [showTracker]);

  const formatDuration = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const dailyGoal = 6000;
  const progress = useMemo(() => Math.min((stepData.steps / dailyGoal) * 100, 100), [stepData.steps]);

  // Handle back button for modals
  useBackHandler(() => {
    if (showQuiz) {
      setShowQuiz(false);
      return;
    }
    if (showTracker) {
      setShowTracker(false);
      return;
    }
    if (showMoodTracker) {
      setShowMoodTracker(false);
      return;
    }
    if (showJoke) {
      setShowJoke(false);
      return;
    }
  });

  return (
    <PageLayout>
      <ColorBg />

      <div className="relative bg-black text-gray-100">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pt-6 pb-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Activities
              </h1>
              <p className="text-sm text-gray-400 mt-1">Track your wellness journey</p>
            </div>
            <button className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition">
              <Bell className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </motion.header>

        <div className="px-5 space-y-6">
          {/* Progress Overview - Simple Progress Bar */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div>
              <p className="text-sm text-gray-400 mb-2">Today's Progress</p>
              <p className="text-5xl font-bold text-white">
                {Math.round(progress)}%
              </p>
            </div>
            <div className="w-full h-4 bg-gray-500 rounded-full overflow-hidden border-2 border-black flex">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.section>

          {/* Main Stats Card - Yellow */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="rounded-[50px] bg-[#ede339] p-6 border border-yellow-200/50 relative overflow-hidden cursor-pointer hover:border-yellow-300/70 transition-all"
            onClick={() => setShowTracker(true)}
          >
            {/* Decorative emoji */}
            <div className="absolute top-4 right-6 text-4xl opacity-80">👟</div>
            
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                Steps Today
              </h2>
              <p className="text-sm text-gray-700 mb-4">
                Keep moving towards your daily goal
              </p>

              {/* Stats Display */}
              <div className="flex items-end gap-3 mt-4">
                <div>
                  <p className="text-5xl font-bold text-gray-900">
                    {stepData.steps.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    / {dailyGoal.toLocaleString()} goal
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Two Column Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Pink - Calories Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="rounded-[60px] bg-[#de699f] p-6 border border-pink-400/30 text-white cursor-pointer hover:border-pink-300/60 transition-all"
            >
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-xs text-white/80 mb-1 font-semibold">CALORIES BURNED</p>
              <p className="text-4xl font-bold text-white">{stepData.calories}</p>
              <p className="text-xs text-white/60 mt-2">kcal today</p>
            </motion.section>

            {/* Blue - Distance Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.35 }}
              className="rounded-[50px] bg-gradient-to-br from-blue-500 to-blue-600 p-6 border border-blue-400/30 text-white cursor-pointer hover:border-blue-300/60 transition-all"
            >
              <div className="text-3xl mb-2">📍</div>
              <p className="text-xs text-white/80 mb-1 font-semibold">DISTANCE</p>
              <p className="text-4xl font-bold text-white">{stepData.distance}</p>
              <p className="text-xs text-white/60 mt-2">km covered</p>
            </motion.section>
          </div>

          {/* Duration and Progress Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Purple - Duration Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
              className="rounded-[50px] bg-gradient-to-br from-purple-600 to-purple-700 p-6 border border-purple-500/30 text-white cursor-pointer hover:border-purple-400/60 transition-all"
            >
              <div className="text-3xl mb-2">⏱️</div>
              <p className="text-xs text-white/80 mb-1 font-semibold">ACTIVE TIME</p>
              <p className="text-3xl font-bold text-white">{formatDuration(stepData.duration)}</p>
              <p className="text-xs text-white/60 mt-2">minutes active</p>
            </motion.section>

            {/* Green - Goal Progress Card */}
            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45 }}
              className="rounded-[50px] bg-gradient-to-br from-green-500 to-green-600 p-6 border border-green-400/30 text-white cursor-pointer hover:border-green-400/60 transition-all"
            >
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-xs text-white/80 mb-1 font-semibold">GOAL PROGRESS</p>
              <p className="text-3xl font-bold text-white">{Math.round(progress)}%</p>
              <p className="text-xs text-white/60 mt-2">to daily target</p>
            </motion.section>
          </div>

          {/* Activities Grid Section */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-lg font-semibold text-white px-2">Quick Access</h2>

            {/* First Row - 2 Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Music - Orange */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.55 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => history.push("/music")}
                className="rounded-[40px] bg-gradient-to-br from-orange-500 to-orange-600 p-6 border border-orange-400/30 cursor-pointer text-white"
              >
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="text-lg font-bold mb-1">Music</h3>
                <p className="text-xs text-white/70">Relax & unwind</p>
              </motion.div>

              {/* Quiz - Teal */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.6 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuiz(true)}
                className="rounded-[40px] bg-gradient-to-br from-teal-500 to-teal-600 p-6 border border-teal-400/30 cursor-pointer text-white"
              >
                <div className="text-4xl mb-3">❓</div>
                <h3 className="text-lg font-bold mb-1">Quiz</h3>
                <p className="text-xs text-white/70">Test yourself</p>
              </motion.div>
            </div>

            {/* Second Row - 2 Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Tracker - Indigo */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.65 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTracker(true)}
                className="rounded-[40px] bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 border border-indigo-500/30 cursor-pointer text-white"
              >
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-lg font-bold mb-1">Track</h3>
                <p className="text-xs text-white/70">Log your steps</p>
              </motion.div>

              {/* Mood - Pink */}
              <motion.div
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.7 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMoodTracker(true)}
                className="rounded-[40px] bg-[#de699f] p-6 border border-pink-400/30 cursor-pointer text-white"
              >
                <div className="text-4xl mb-3">😊</div>
                <h3 className="text-lg font-bold mb-1">Mood</h3>
                <p className="text-xs text-white/70">Check yourself</p>
              </motion.div>
            </div>

            {/* Full Width - Jokes Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.75 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJoke(true)}
              className="rounded-[40px] bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 p-6 border border-rose-400/30 cursor-pointer text-white"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl mb-2">😂</div>
                  <h3 className="text-lg font-bold">Jokes</h3>
                  <p className="text-xs text-white/70 mt-1">Laugh & feel good</p>
                </div>
                <div className="text-5xl opacity-70">🤣</div>
              </div>
            </motion.div>
          </motion.section>

          {/* Wellness Tips Section */}
          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold text-white px-2">Wellness Tips</h2>

            {/* Tip 1 - Yellow Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.85 }}
              className="rounded-[40px] bg-[#ede339] p-5 border border-yellow-200/50 text-gray-900"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎯</span>
                <div>
                  <h3 className="font-bold text-sm mb-1">Stay Active</h3>
                  <p className="text-xs text-gray-700">
                    Aim for at least 6000 steps daily for optimal wellness
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tip 2 - Blue Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.9 }}
              className="rounded-[40px] bg-gradient-to-br from-blue-500 to-blue-600 p-5 border border-blue-400/30 text-white"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">🧘</span>
                <div>
                  <h3 className="font-bold text-sm mb-1">Mind & Body</h3>
                  <p className="text-xs text-white/80">
                    Use our mood tracker to monitor your mental wellbeing
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Tip 3 - Green Card */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.95 }}
              className="rounded-[40px] bg-gradient-to-br from-green-500 to-green-600 p-5 border border-green-400/30 text-white"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">🎵</span>
                <div>
                  <h3 className="font-bold text-sm mb-1">Relax & Enjoy</h3>
                  <p className="text-xs text-white/80">
                    Listen to curated music to relax and unwind
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        </div>
      </div>

      <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
      <StepTrackerModal
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
      />
      <MoodTracker isOpen={showMoodTracker} onClose={() => setShowMoodTracker(false)} />
      <JokeModal isOpen={showJoke} onClose={() => setShowJoke(false)} />
    </PageLayout>
  );
};

export default Activities;
