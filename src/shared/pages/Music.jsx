import React, { useState, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import { play, musicalNotes } from "ionicons/icons";
import PageLayout from "../layout/PageLayout";
import MusicPlayer from "../../domains/music/Components/MusicPlayer";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

const Music = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  useBackHandler(() => {
    if (showPlayer) {
      setShowPlayer(false);
      return;
    }
  });

  const playlist = [
    {
      id: 1,
      title: "Relaxing Nature Sounds",
      artist: "Moonbliss",
      category: "calm",
      src: "/audio/relax.mp3",
    },
    {
      id: 2,
      title: "Calm Piano Music",
      artist: "Moonbliss",
      category: "calm",
      src: "/audio/calm_piano.mp3",
    },
    {
      id: 3,
      title: "Upbeat Pop Tune",
      artist: "Moonbliss",
      category: "energetic",
      src: "/audio/upbeat_pop.mp3",
    },
    {
      id: 4,
      title: "Deep Sleep Waves",
      artist: "Moonbliss",
      category: "sleep",
      src: "/audio/sleep.mp3",
    },
    {
      id: 5,
      title: "Self Love Affirmations",
      artist: "Moonbliss",
      category: "self-care",
      src: "/audio/affirmations.mp3",
    },
  ];

  const groupedTracks = useMemo(() => {
    return playlist.reduce((acc, track) => {
      acc[track.category] = acc[track.category] || [];
      acc[track.category].push(track);
      return acc;
    }, {});
  }, []);

  const playMusic = (track) => {
    setCurrentTrack(track);
    setShowPlayer(true);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 text-slate-900">
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Wellness Sounds
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Music that matches your rhythm
          </p>
        </div>

        {/* Hero / Featured */}
        <div className="px-5 mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 shadow-2xl">
            <p className="text-white/90 text-xs uppercase tracking-widest">
              Featured Today
            </p>
            <h2 className="text-2xl font-bold mt-2 leading-tight text-white">
              Evening Calm
            </h2>
            <p className="text-white/90 text-sm mt-1">
              Unwind your mind and body
            </p>

            <button
              onClick={() => playMusic(playlist[0])}
              className="absolute bottom-5 right-5 w-14 h-14 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-xl active:scale-95"
            >
              <IonIcon icon={play} className="text-2xl ml-1" />
            </button>
          </div>
        </div>

        {/* Spotify-style Rows */}
        <div className="space-y-8 pb-24">
          {Object.entries(groupedTracks).map(([category, tracks]) => (
            <div key={category}>
              <div className="px-5 mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold capitalize text-slate-900">
                  {category.replace("-", " ")}
                </h3>
              </div>

              {/* Horizontal Scroll */}
              <div className="flex gap-4 overflow-x-auto px-5 scrollbar-hide">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playMusic(track)}
                    className="min-w-[160px] bg-white/60 backdrop-blur rounded-2xl p-4 cursor-pointer hover:bg-white/80 transition shadow-sm border border-white/40"
                  >
                    {/* Artwork */}
                    <div className="relative mb-3">
                      <div className="h-36 w-full rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                        <IonIcon
                          icon={musicalNotes}
                          className="text-white text-3xl"
                        />
                      </div>

                      <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center shadow-lg">
                        <IonIcon
                          icon={play}
                          className="text-white text-lg ml-0.5"
                        />
                      </button>
                    </div>

                    {/* Info */}
                    <h4 className="text-sm font-semibold truncate text-slate-900">
                      {track.title}
                    </h4>
                    <p className="text-xs text-slate-600 truncate mt-1">
                      {track.artist}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Player */}
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
