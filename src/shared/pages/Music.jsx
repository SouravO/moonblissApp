import React, { useState, useMemo } from "react";
import { IonIcon } from "@ionic/react";
import {
  play,
  musicalNotes,
  musicalNote,
  arrowBack,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import PageLayout from "../layout/PageLayout";
import MusicPlayer from "../../domains/music/Components/MusicPlayer";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";

const Music = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const history = useHistory();

  useBackHandler(() => {
    if (showPlayer) {
      setShowPlayer(false);
      return;
    }
  });

  const playlist = [
    { id: 1, title: "Relaxing Nature Sounds", artist: "Moonbliss", category: "calm", src: "/audio/relax.mp3" },
    { id: 2, title: "Calm Piano Music", artist: "Moonbliss", category: "calm", src: "/audio/calm_piano.mp3" },
    { id: 3, title: "Upbeat Pop Tune", artist: "Moonbliss", category: "energetic", src: "/audio/upbeat_pop.mp3" },
    { id: 4, title: "Deep Sleep Waves", artist: "Moonbliss", category: "sleep", src: "/audio/sleep.mp3" },
    { id: 5, title: "Self Love Affirmations", artist: "Moonbliss", category: "self-care", src: "/audio/affirmations.mp3" },
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
      <div className="relative min-h-screen bg-[#f8fafc] overflow-hidden text-slate-900">

        {/* ---------------- BACK BUTTON ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute top-4 left-4 z-30"
        >
          <button
            onClick={() => {
              if (showPlayer) {
                setShowPlayer(false);
              } else {
                history.goBack();
              }
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur shadow-md active:scale-95 transition"
          >
            <IonIcon icon={arrowBack} className="text-xl text-slate-800" />
          </button>
        </motion.div>

        {/* ---------------- BACKGROUND ---------------- */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div
            animate={{ x: [-20, 40, -20], y: [0, 50, 0], rotate: [0, 90, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -left-10 w-72 h-72 bg-blue-400/30 rounded-full blur-[60px]"
          />
          <motion.div
            animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[80px]"
          />

          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "110vh", x: Math.random() * 100 + "%", opacity: 0 }}
              animate={{ y: "-10vh", opacity: [0, 0.5, 0] }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: i * 2,
                ease: "linear",
              }}
              className="absolute text-blue-300/40"
            >
              <IonIcon icon={musicalNote} className="text-4xl" />
            </motion.div>
          ))}
        </div>

        {/* ---------------- CONTENT ---------------- */}
        <div className="relative z-10">
          <div className="flex items-end justify-center gap-1 h-12 pt-6 opacity-30">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [10, 30, 15, 25, 10] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                className="w-1 bg-blue-600 rounded-full"
              />
            ))}
          </div>

          <div className="px-5 pt-4 pb-4">
            <h1 className="text-2xl font-bold tracking-tight">Wellness Sounds</h1>
            <p className="text-slate-500 text-sm">Tap a track to start your journey</p>
          </div>

          <div className="px-5 mb-8">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden rounded-3xl bg-blue-600 p-6 shadow-xl shadow-blue-200"
            >
              <div className="relative z-10">
                <p className="text-white/80 text-xs uppercase font-bold tracking-widest">Featured</p>
                <h2 className="text-2xl font-bold mt-1 text-white">Daily Zen Mix</h2>
                <button
                  onClick={() => playMusic(playlist[0])}
                  className="mt-4 px-6 py-2 bg-white text-blue-600 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg"
                >
                  <IonIcon icon={play} /> Listen Now
                </button>
              </div>

              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -right-10 -top-10 w-40 h-40 border-4 border-white/10 rounded-full"
              />
            </motion.div>
          </div>

          <div className="space-y-10 pb-32">
            {Object.entries(groupedTracks).map(([category, tracks]) => (
              <div key={category}>
                <h3 className="px-5 text-lg font-bold capitalize mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-blue-500 rounded-full" />
                  {category}
                </h3>

                <div className="flex gap-4 overflow-x-auto px-5 scrollbar-hide">
                  {tracks.map((track) => (
                    <motion.div
                      key={track.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => playMusic(track)}
                      className="min-w-[170px] bg-white rounded-2xl p-4 shadow-md border border-slate-100"
                    >
                      <div className="relative h-32 w-full rounded-xl bg-slate-100 mb-3 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <IonIcon icon={musicalNotes} className="text-white/40 text-4xl" />
                        </div>
                        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-lg">
                            <IonIcon icon={play} />
                          </div>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 truncate">{track.title}</h4>
                      <p className="text-xs text-slate-500">{track.artist}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

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
