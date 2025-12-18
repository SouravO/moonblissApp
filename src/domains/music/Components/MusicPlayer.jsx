import { IonIcon } from "@ionic/react";
import { play, pause, playSkipBack, playSkipForward } from "ionicons/icons";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

const formatTime = (sec = 0) => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const MusicPlayer = ({ playlist, currentTrack, onClose }) => {
  const { isPlaying, currentTime, duration, toggle, seek, next, prev } =
    useAudioPlayer(playlist);

  // Get current track info
  const track = currentTrack || playlist?.[0] || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-sm rounded-3xl bg-[#3d3d4a] p-6 shadow-2xl">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-red-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        )}

        {/* Album Art */}
        <div className="flex justify-center mb-5">
          <div className="w-48 h-48 rounded-xl overflow-hidden shadow-xl bg-gray-700">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
                <span className="text-6xl">🎵</span>
              </div>
            )}
          </div>
        </div>

        {/* Track Info */}
        <div className="text-center mb-4">
          <h3 className="text-white text-lg font-semibold truncate">
            {track.title || "Unknown Track"}
          </h3>
          <p className="text-gray-400 text-sm truncate">
            {track.artist || "Unknown Artist"}
          </p>
        </div>

        {/* Time Display */}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-orange-500 font-medium">
            {formatTime(currentTime)}
          </span>
          <span className="text-gray-400">{formatTime(duration)}</span>
        </div>

        {/* Progress Bar */}
        <div
          className="relative h-1.5 bg-gray-600 rounded-full mb-6 cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
          }}
        >
          <div
            className="absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-100"
            style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-orange-500 rounded-full shadow-md"
            style={{
              left: `calc(${(currentTime / (duration || 1)) * 100}% - 6px)`,
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          {/* Previous */}
          <button
            onClick={prev}
            className="w-14 h-14 rounded-full bg-[#2d2d38] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#35353f] transition-all active:scale-95"
          >
            <IonIcon icon={playSkipBack} className="text-2xl" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={toggle}
            className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all active:scale-95"
          >
            <IonIcon
              icon={isPlaying ? pause : play}
              className="text-3xl ml-0.5"
            />
          </button>

          {/* Next */}
          <button
            onClick={next}
            className="w-14 h-14 rounded-full bg-[#2d2d38] flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#35353f] transition-all active:scale-95"
          >
            <IonIcon icon={playSkipForward} className="text-2xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
