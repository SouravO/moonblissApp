import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import {
  closeOutline,
  refreshOutline,
  heartOutline,
  heart,
  shareOutline,
  happyOutline,
} from "ionicons/icons";

const jokes = [
  {
    setup: "Why don't scientists trust atoms?",
    punchline: "Because they make up everything!",
    emoji: "🔬",
  },
  {
    setup: "What do you call a fake noodle?",
    punchline: "An impasta!",
    emoji: "🍝",
  },
  {
    setup: "Why did the scarecrow win an award?",
    punchline: "He was outstanding in his field!",
    emoji: "🌾",
  },
  {
    setup: "What do you call a bear with no teeth?",
    punchline: "A gummy bear!",
    emoji: "🐻",
  },
  {
    setup: "Why don't eggs tell jokes?",
    punchline: "They'd crack each other up!",
    emoji: "🥚",
  },
  {
    setup: "What do you call a sleeping dinosaur?",
    punchline: "A dino-snore!",
    emoji: "🦕",
  },
  {
    setup: "Why did the cookie go to the doctor?",
    punchline: "Because it was feeling crummy!",
    emoji: "🍪",
  },
  {
    setup: "What do you call a fish without eyes?",
    punchline: "A fsh!",
    emoji: "🐟",
  },
  {
    setup: "Why can't you give Elsa a balloon?",
    punchline: "Because she will let it go!",
    emoji: "❄️",
  },
  {
    setup: "What do you call a pig that does karate?",
    punchline: "A pork chop!",
    emoji: "🐷",
  },
  {
    setup: "Why did the math book look so sad?",
    punchline: "Because it had too many problems!",
    emoji: "📚",
  },
  {
    setup: "What do you call a lazy kangaroo?",
    punchline: "A pouch potato!",
    emoji: "🦘",
  },
  {
    setup: "Why did the banana go to the doctor?",
    punchline: "Because it wasn't peeling well!",
    emoji: "🍌",
  },
  {
    setup: "What's a cat's favorite color?",
    punchline: "Purr-ple!",
    emoji: "🐱",
  },
  {
    setup: "Why do bees have sticky hair?",
    punchline: "Because they use honeycombs!",
    emoji: "🐝",
  },
];

const JokeModal = ({ isOpen, onClose }) => {
  const [currentJokeIndex, setCurrentJokeIndex] = useState(0);
  const [showPunchline, setShowPunchline] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likedJokes, setLikedJokes] = useState([]);

  // Load liked jokes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("likedJokes");
    if (saved) {
      setLikedJokes(JSON.parse(saved));
    }
  }, []);

  // Check if current joke is liked
  useEffect(() => {
    setLiked(likedJokes.includes(currentJokeIndex));
  }, [currentJokeIndex, likedJokes]);

  // Get random joke on open
  useEffect(() => {
    if (isOpen) {
      getRandomJoke();
    }
  }, [isOpen]);

  const currentJoke = jokes[currentJokeIndex];

  const getRandomJoke = () => {
    const randomIndex = Math.floor(Math.random() * jokes.length);
    setCurrentJokeIndex(randomIndex);
    setShowPunchline(false);
  };

  const revealPunchline = () => {
    setShowPunchline(true);
  };

  const toggleLike = () => {
    let newLikedJokes;
    if (liked) {
      newLikedJokes = likedJokes.filter((i) => i !== currentJokeIndex);
    } else {
      newLikedJokes = [...likedJokes, currentJokeIndex];
    }
    setLikedJokes(newLikedJokes);
    localStorage.setItem("likedJokes", JSON.stringify(newLikedJokes));
    setLiked(!liked);
  };

  const shareJoke = async () => {
    const jokeText = `${currentJoke.setup}\n\n${currentJoke.punchline} ${currentJoke.emoji}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this joke! 😂",
          text: jokeText,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(jokeText);
      alert("Joke copied to clipboard!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      {/* Animation styles */}
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .wiggle {
          animation: wiggle 0.5s ease-in-out;
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .float-up {
          animation: float-up 0.4s ease-out;
        }
        @keyframes heart-pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .heart-pop {
          animation: heart-pop 0.3s ease-out;
        }
      `}</style>

      <div className="relative w-[90%] max-w-md rounded-3xl bg-white shadow-2xl overflow-hidden bounce-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl wiggle">
              😂
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Daily Laughs</h2>
              <p className="text-white/80 text-sm">Brighten your day!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Joke Emoji */}
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-6xl" key={currentJokeIndex}>
                {currentJoke.emoji}
              </span>
            </div>
          </div>

          {/* Joke Card */}
          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 mb-4 min-h-[180px] flex flex-col justify-center">
            {/* Setup */}
            <p className="text-gray-800 text-lg font-medium text-center mb-4">
              {currentJoke.setup}
            </p>

            {/* Punchline */}
            {showPunchline ? (
              <div className="float-up">
                <p className="text-pink-600 text-xl font-bold text-center">
                  {currentJoke.punchline}
                </p>
                <div className="flex justify-center mt-3 text-3xl">🤣</div>
              </div>
            ) : (
              <button
                onClick={revealPunchline}
                className="mx-auto bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-all active:scale-95"
              >
                Reveal Punchline 👀
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <button
              onClick={toggleLike}
              className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                liked
                  ? "bg-pink-500 text-white"
                  : "bg-pink-100 text-pink-600 hover:bg-pink-200"
              }`}
            >
              <IonIcon
                icon={liked ? heart : heartOutline}
                className={`text-xl ${liked ? "heart-pop" : ""}`}
              />
              {liked ? "Liked!" : "Like"}
            </button>

            <button
              onClick={shareJoke}
              className="flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
            >
              <IonIcon icon={shareOutline} className="text-xl" />
              Share
            </button>
          </div>

          {/* Next Joke Button */}
          <button
            onClick={getRandomJoke}
            className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:opacity-90 transition-all"
          >
            <IonIcon icon={refreshOutline} className="text-xl" />
            Next Joke
          </button>

          {/* Stats */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="text-center">
              <p className="text-pink-500 font-bold">{likedJokes.length}</p>
              <p className="text-xs text-gray-500">Liked</p>
            </div>
            <div className="text-center">
              <p className="text-pink-500 font-bold">{jokes.length}</p>
              <p className="text-xs text-gray-500">Total Jokes</p>
            </div>
          </div>

          {/* Tip */}
          <p className="text-center text-xs text-gray-400 mt-4">
            💡 Laughter is the best medicine for a happy heart
          </p>
        </div>
      </div>
    </div>
  );
};

export default JokeModal;
