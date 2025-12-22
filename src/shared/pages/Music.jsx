import React, { useState, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { play, musicalNotes, leaf, flash, heart, moon } from "ionicons/icons";
import PageLayout from "../layout/PageLayout";
import MusicPlayer from "../../domains/music/Components/MusicPlayer";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

const Music = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  // Handle back button for music player modal
  useBackHandler(() => {
    if (showPlayer) {
      setShowPlayer(false);
      return;
    }
  });

  // Playlist with categories
  const playlist = [
    {
      id: 1,
      title: "Relaxing Nature Sounds",
      artist: "Moonbliss",
      category: "calm",
    //   duration: "5:32",
      src: "/audio/relax.mp3",
      coverUrl: null,
    },
    {
      id: 2,
      title: "Calm Piano Music",
      artist: "Moonbliss",
      category: "calm",
      duration: "4:15",
      src: "public/audio/calm_piano.mp3",
      coverUrl: null,
    },
    {
      id: 3,
      title: "Upbeat Pop Tune",
      artist: "Moonbliss",
      category: "energetic",
      duration: "3:45",
      src: "public/audio/upbeat_pop.mp3",
      coverUrl: null,
    },
    {
      id: 4,
      title: "Deep Sleep Waves",
      artist: "Moonbliss",
      category: "sleep",
      duration: "8:00",
      src: "public/audio/sleep.mp3",
      coverUrl: null,
    },
    {
      id: 5,
      title: "Self Love Affirmations",
      artist: "Moonbliss",
      category: "self-care",
      duration: "6:20",
      src: "public/audio/affirmations.mp3",
      coverUrl: null,
    },
  ];

  // Category config with icons and colors
  const categoryConfig = {
    calm: {
      label: "Calm & Relaxing",
      icon: leaf,
      gradient: "from-emerald-400 to-teal-500",
      bgLight: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    energetic: {
      label: "Energetic & Upbeat",
      icon: flash,
      gradient: "from-orange-400 to-pink-500",
      bgLight: "bg-orange-50",
      textColor: "text-orange-600",
    },
    sleep: {
      label: "Sleep & Rest",
      icon: moon,
      gradient: "from-indigo-400 to-purple-500",
      bgLight: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    "self-care": {
      label: "Self Care",
      icon: heart,
      gradient: "from-pink-400 to-rose-500",
      bgLight: "bg-pink-50",
      textColor: "text-pink-600",
    },
  };

  // Group tracks by category
  const groupedTracks = useMemo(() => {
    return playlist.reduce((acc, track) => {
      if (!acc[track.category]) {
        acc[track.category] = [];
      }
      acc[track.category].push(track);
      return acc;
    }, {});
  }, []);

  const playMusic = (track) => {
    setCurrentTrack(track);
    setShowPlayer(true);
  };

  return (
    <PageLayout >
      <div className="bg-[#1a43bf]">
        {/* Header */}
        <div className="px-4 pt-2 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Your Wellness Sounds
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Curated music for your mind & body
          </p>
        </div>

        {/* Quick Play Banner */}
        <div className="px-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-5">
            <div className="relative z-10">
              <p className="text-white/80 text-sm font-medium">Today's Pick</p>
              <h3 className="text-white text-xl font-bold mt-1">
                Evening Relaxation
              </h3>
              <button
                onClick={() => playMusic(playlist[0])}
                className="mt-3 px-5 py-2 bg-white rounded-full text-purple-600 font-semibold text-sm flex items-center gap-2 hover:bg-white/90 transition-colors"
              >
                <IonIcon icon={play} />
                Play Now
              </button>
            </div>
            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -right-4 -bottom-10 w-24 h-24 bg-white/10 rounded-full" />
          </div>
        </div>

        {/* Categories with tracks */}
        {Object.entries(groupedTracks).map(([category, tracks]) => {
          const config = categoryConfig[category] || {
            label: category,
            icon: musicalNotes,
            gradient: "from-gray-400 to-gray-500",
            bgLight: "bg-gray-50",
            textColor: "text-gray-600",
          };

          return (
            <div key={category} className="mb-6">
              {/* Category Header */}
              <div className="px-4 flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}
                >
                  <IonIcon icon={config.icon} className="text-white text-lg" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">
                  {config.label}
                </h2>
              </div>

              {/* Track List */}
              <div className="px-4 space-y-2">
                {tracks.map((track, index) => (
                  <div
                    key={track.id}
                    onClick={() => playMusic(track)}
                    className={`flex items-center gap-3 p-3 rounded-xl ${config.bgLight} cursor-pointer hover:shadow-md transition-all active:scale-[0.98]`}
                  >
                    {/* Track Number / Cover */}
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-md`}
                    >
                      {track.coverUrl ? (
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      ) : (
                        <IonIcon
                          icon={musicalNotes}
                          className="text-white text-xl"
                        />
                      )}
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 truncate">
                        {track.title}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {track.artist} • {track.duration}
                      </p>
                    </div>

                    {/* Play Button */}
                    <button
                      className={`w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center ${config.textColor} hover:scale-105 transition-transform`}
                    >
                      <IonIcon icon={play} className="text-xl ml-0.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Music Player Modal */}
      {showPlayer && (
        <MusicPlayer
          playlist={playlist}
          currentTrack={currentTrack}
          onClose={() => setShowPlayer(false)}
        />
      )}
    </PageLayout>
  );
};

export default Music;
