import React, { useState, useEffect } from "react";
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
import PageLayout from "../layout/PageLayout";
import QuizModal from "../../domains/quiz/components/QuizModal";
import StepTrackerModal from "../../domains/tracker/components/StepTrackerModal";
import MoodTracker from "../../domains/moodTracker/MoodTracker";
import JokeModal from "../../domains/Joke/JokeModal";

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

  // Load step data from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("stepTrackerData");
    if (savedData) {
      setStepData(JSON.parse(savedData));
    }
  }, [showTracker]); // Refresh when tracker closes

  const handleMusic = () => {
    history.push("/music");
  };

  const handleQuiz = () => {
    setShowQuiz(true);
  };

  const handleTrack = () => {
    setShowTracker(true);
  };

  // Format duration
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate goal progress
  const dailyGoal = 6000;
  const progress = Math.min((stepData.steps / dailyGoal) * 100, 100);

  return (
    <PageLayout title={"Activities"}>
      <div className="flex flex-col h-full pb-4">
        {/* Greeting Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 mx-3 mt-2 p-4 rounded-2xl shadow-lg">
          <h2 className="text-white font-bold text-xl">Hello, There! 👋</h2>
          <p className="text-white/80 text-sm mt-1">
            Track your daily wellness journey
          </p>
        </div>

        {/* Today's Stats Section */}
        <div className="mx-3 mt-4">
          <h3 className="text-gray-700 font-semibold text-sm mb-3 px-1">
            📊 Today's Progress
          </h3>

          {/* Step Progress Card */}
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 shadow-lg mb-3 cursor-pointer active:scale-[0.98] transition-transform"
            onClick={handleTrack}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                  <IonIcon
                    icon={footstepsOutline}
                    className="text-white text-3xl"
                  />
                </div>
                <div>
                  <p className="text-white/80 text-xs">Steps Today</p>
                  <p className="text-white font-bold text-2xl">
                    {stepData.steps.toLocaleString()}
                  </p>
                  <p className="text-white/70 text-xs">
                    / {dailyGoal.toLocaleString()} goal
                  </p>
                </div>
              </div>
              {/* Circular Progress */}
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="white"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-orange-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={flameOutline}
                className="text-orange-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">
                {stepData.calories}
              </p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={trendingUpOutline}
                className="text-blue-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">
                {stepData.distance}
              </p>
              <p className="text-xs text-gray-500">km</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <IonIcon
                icon={timeOutline}
                className="text-purple-500 text-xl mb-1"
              />
              <p className="text-lg font-bold text-gray-800">
                {formatDuration(stepData.duration)}
              </p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
          </div>
        </div>

        {/* Activity Cards Section */}
        <div className="mx-3 mt-5">
          <h3 className="text-gray-700 font-semibold text-sm mb-3 px-1">
            🎯 Quick Activities
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {/* Music Card */}
            <div
              className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer active:scale-95 transition-transform"
              onClick={handleMusic}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <IonIcon
                  icon={musicalNotesOutline}
                  className="text-white text-2xl"
                />
              </div>
              <span className="text-white font-semibold text-sm">Music</span>
            </div>

            {/* Quiz Card */}
            <div
              className="bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer active:scale-95 transition-transform"
              onClick={handleQuiz}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <IonIcon
                  icon={helpCircleOutline}
                  className="text-white text-2xl"
                />
              </div>
              <span className="text-white font-semibold text-sm">Quiz</span>
            </div>

            {/* Track Card */}
            <div
              className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer active:scale-95 transition-transform"
              onClick={handleTrack}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <IonIcon
                  icon={analyticsOutline}
                  className="text-white text-2xl"
                />
              </div>
              <span className="text-white font-semibold text-sm">Track</span>
            </div>
            {/* mood selector */}
            <div
              className="bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer active:scale-95 transition-transform"
              onClick={() => setShowMoodTracker(true)}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">😊</span>
              </div>
              <span className="text-white font-semibold text-sm">Mood</span>
            </div>
            {/* Joke  */}
            <div
              className="bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl p-4 shadow-lg flex flex-col items-center justify-center aspect-square cursor-pointer active:scale-95 transition-transform"
              onClick={() => setShowJoke(true)}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                <span className="text-2xl">😂</span>
              </div>
              <span className="text-white font-semibold text-sm">Jokes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      <QuizModal isOpen={showQuiz} onClose={() => setShowQuiz(false)} />

      {/* Step Tracker Modal */}
      <StepTrackerModal
        isOpen={showTracker}
        onClose={() => setShowTracker(false)}
      />
      {/* Mood Tracker Component */}
      <MoodTracker
        isOpen={showMoodTracker}
        onClose={() => setShowMoodTracker(false)}
      />
      {/* Joke Modal */}
      <JokeModal isOpen={showJoke} onClose={() => setShowJoke(false)} />
    </PageLayout>
  );
};

export default Activities;
