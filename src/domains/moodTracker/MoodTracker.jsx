import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import { closeOutline, checkmarkCircleOutline } from "ionicons/icons";

const moods = [
  {
    emoji: "😢",
    label: "Very Sad",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-100",
  },
  {
    emoji: "😔",
    label: "Sad",
    color: "from-blue-500 to-cyan-600",
    bg: "bg-blue-100",
  },
  {
    emoji: "😐",
    label: "Neutral",
    color: "from-cyan-500 to-cyan-600",
    bg: "bg-cyan-100",
  },
  {
    emoji: "🙂",
    label: "Good",
    color: "from-cyan-400 to-teal-500",
    bg: "bg-cyan-100",
  },
  {
    emoji: "😊",
    label: "Happy",
    color: "from-blue-600 to-blue-500",
    bg: "bg-blue-100",
  },
  {
    emoji: "😄",
    label: "Very Happy",
    color: "from-blue-600 to-cyan-500",
    bg: "bg-blue-100",
  },
  {
    emoji: "🥰",
    label: "Amazing",
    color: "from-blue-500 to-indigo-600",
    bg: "bg-indigo-100",
  },
];

const MoodTracker = ({ isOpen, onClose }) => {
  const [moodIndex, setMoodIndex] = useState(3); // Start at "Good"
  const [saved, setSaved] = useState(false);
  const [todaysMood, setTodaysMood] = useState(null);

  // Load today's mood on mount
  useEffect(() => {
    if (isOpen) {
      const savedMood = localStorage.getItem("moodTrackerData");
      if (savedMood) {
        const data = JSON.parse(savedMood);
        const savedDate = new Date(data.date);
        const today = new Date();
        if (savedDate.toDateString() === today.toDateString()) {
          setTodaysMood(data);
          setMoodIndex(data.moodIndex);
        } else {
          setTodaysMood(null);
          setMoodIndex(3);
        }
      }
      setSaved(false);
    }
  }, [isOpen]);

  const currentMood = moods[moodIndex];

  const handleSliderChange = (e) => {
    setMoodIndex(parseInt(e.target.value));
    setSaved(false);
  };

  const saveMood = () => {
    const moodData = {
      moodIndex,
      emoji: currentMood.emoji,
      label: currentMood.label,
      date: new Date().toISOString(),
    };
    localStorage.setItem("moodTrackerData", JSON.stringify(moodData));
    setTodaysMood(moodData);
    setSaved(true);

    // Auto close after saving
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Animation styles */}
      <style>{`
        @keyframes emoji-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        .emoji-bounce {
          animation: emoji-bounce 0.4s ease-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .float-animation {
          animation: float 2s ease-in-out infinite;
        }
        .mood-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 12px;
          border-radius: 6px;
          outline: none;
        }
        .mood-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid #fff;
          transition: transform 0.2s;
        }
        .mood-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
        }
        .mood-slider::-moz-range-thumb {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid #fff;
        }
      `}</style>

      <div className="relative w-[90%] max-w-md rounded-3xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-blue-600/40 overflow-hidden border border-blue-500/20 group">
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Header */}
        <div
          className={`relative z-10 bg-gradient-to-r ${currentMood.color} px-6 py-4 flex items-center justify-between transition-all duration-300 overflow-hidden`}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
          
          <div className="relative z-20 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl shadow-lg">
              {currentMood.emoji}
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Mood Tracker</h2>
              <p className="text-blue-100 text-sm">
                How are you feeling today?
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110 active:scale-95"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Large Emoji Display */}
          <div className="flex justify-center mb-6">
            <div
              className={`w-40 h-40 ${currentMood.bg} rounded-full flex items-center justify-center transition-all duration-300 border-2 border-blue-400/30 shadow-lg shadow-blue-500/30`}
            >
              <span
                key={moodIndex}
                className="text-8xl emoji-bounce float-animation drop-shadow-lg"
              >
                {currentMood.emoji}
              </span>
            </div>
          </div>

          {/* Mood Label */}
          <div className="text-center mb-6">
            <p className="text-2xl font-black text-white bg-gradient-to-r from-blue-200 via-cyan-100 to-blue-200 bg-clip-text text-transparent transition-all duration-300">
              {currentMood.label}
            </p>
            <p className="text-blue-300/70 text-sm mt-1">
              Slide to change your mood
            </p>
          </div>

          {/* Mood Slider */}
          <div className="mb-6 px-2">
            <div
              className={`relative h-12 bg-gradient-to-r ${currentMood.color} rounded-full p-1 transition-all duration-300 shadow-lg shadow-blue-500/30`}
            >
              <input
                type="range"
                min="0"
                max={moods.length - 1}
                value={moodIndex}
                onChange={handleSliderChange}
                className="mood-slider w-full h-full cursor-pointer"
                style={{
                  background: "transparent",
                }}
              />
            </div>

            {/* Emoji indicators */}
            <div className="flex justify-between mt-4 px-1">
              {moods.map((mood, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMoodIndex(index);
                    setSaved(false);
                  }}
                  className={`text-2xl transition-all duration-200 hover:scale-110 ${
                    index === moodIndex
                      ? "transform scale-125 drop-shadow-lg"
                      : "opacity-60 hover:opacity-85"
                  }`}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Today's recorded mood */}
          {todaysMood && !saved && (
            <div className="bg-blue-600/20 border border-blue-400/30 rounded-xl p-3 mb-4 text-center backdrop-blur-sm">
              <p className="text-sm text-blue-200">
                Today's mood:{" "}
                <span className="text-xl">{todaysMood.emoji}</span>{" "}
                {todaysMood.label}
              </p>
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={saveMood}
            disabled={saved}
            className={`mx-auto block px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${
              saved
                ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/50"
                : `bg-gradient-to-r ${currentMood.color} text-white hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95`
            }`}
            style={{ letterSpacing: '0.05em' }}
          >
            {saved ? (
              <>
                <IonIcon icon={checkmarkCircleOutline} className="text-xl" />
                Mood Saved!
              </>
            ) : (
              <>
                <span className="text-xl">{currentMood.emoji}</span>
                Save Mood
              </>
            )}
          </button>

          {/* Tip */}
          <p className="text-center text-xs text-blue-300/60 mt-4">
            💡 Tracking your mood helps you understand your emotional patterns
          </p>
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
