import { IonIcon } from "@ionic/react";
import { play, pause, playSkipBack, playSkipForward, musicalNote } from "ionicons/icons";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { motion, AnimatePresence } from "framer-motion"; // Added Framer Motion

const formatTime = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MusicPlayer = ({ playlist, currentTrack, onClose }) => {
  const { isPlaying, currentTime, duration, toggle, seek, next, prev } =
    useAudioPlayer(playlist);

  const track = currentTrack || playlist?.[0] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
      />

      {/* Player Container */}
      <motion.div 
        initial={{ y: 100, opacity: 0, scale: 0.9 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        className="relative w-full max-w-sm rounded-[40px] bg-white/10 backdrop-blur-2xl p-8 shadow-2xl border border-white/20 overflow-hidden"
      >
        
        {/* Animated Background Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ 
                        y: [0, -100], 
                        x: [0, Math.sin(i) * 50],
                        opacity: [0, 1, 0] 
                    }}
                    transition={{ duration: 5, repeat: Infinity, delay: i * 1, ease: "linear" }}
                    className="absolute bottom-0 text-white"
                    style={{ left: `${20 * i}%` }}
                >
                    <IonIcon icon={musicalNote} />
                </motion.div>
            ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition"
        >
          ✕
        </button>

        {/* Album Art Section with Pulse */}
        <div className="relative flex justify-center mb-8 mt-4">
          {/* Rhythmic Glow Pulse */}
          <AnimatePresence>
            {isPlaying && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-blue-500 rounded-full blur-3xl"
              />
            )}
          </AnimatePresence>

          <motion.div 
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className={`w-56 h-56 rounded-full p-1 border-4 border-white/20 shadow-2xl overflow-hidden relative z-10 ${!isPlaying && 'transition-transform duration-700'}`}
          >
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <span className="text-7xl">🎵</span>
              </div>
            )}
            {/* Center Vinyl Hole */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-[#111] rounded-full border-4 border-white/10 shadow-inner" />
            </div>
          </motion.div>
        </div>

        {/* Text Info with Staggered Fade */}
        <motion.div 
            key={track.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8 relative z-10"
        >
          <h3 className="text-white text-2xl font-bold truncate px-2">
            {track.title || "Unknown Track"}
          </h3>
          <p className="text-blue-400 font-medium mt-1">
            {track.artist || "Unknown Artist"}
          </p>
        </motion.div>

        {/* Progress Bar & Time */}
        <div className="mb-8 px-2">
            <div className="flex justify-between text-xs mb-3">
            <span className="text-blue-300 font-mono tracking-tighter">
                {formatTime(currentTime)}
            </span>
            <span className="text-white/40 font-mono tracking-tighter">
                {formatTime(duration)}
            </span>
            </div>

            <div
            className="group relative h-2 bg-white/10 rounded-full cursor-pointer"
            onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                seek(percent * duration);
            }}
            >
            <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{
                    left: `calc(${(currentTime / (duration || 1)) * 100}% - 8px)`,
                }}
                whileHover={{ scale: 1.5 }}
            />
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-8 mb-4">
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={prev}
            className="text-white/70 hover:text-white transition"
          >
            <IonIcon icon={playSkipBack} className="text-3xl" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="w-20 h-20 rounded-full bg-white text-indigo-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <IonIcon
              icon={isPlaying ? pause : play}
              className="text-4xl ml-1"
            />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={next}
            className="text-white/70 hover:text-white transition"
          >
            <IonIcon icon={playSkipForward} className="text-3xl" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default MusicPlayer;