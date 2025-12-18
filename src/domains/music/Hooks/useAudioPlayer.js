import { useEffect, useRef, useState } from "react";

export function useAudioPlayer(playlist = []) {
    const audioRef = useRef(new Audio());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Get the audio source - handle both string URLs and track objects
    const getTrackSrc = (track) => {
        if (!track) return null;
        if (typeof track === "string") return track;
        return track.src || null;
    };

    // Load track
    useEffect(() => {
        if (!playlist.length) return;
        const src = getTrackSrc(playlist[currentIndex]);
        if (src) {
            audioRef.current.src = src;
            audioRef.current.load();
        }
        setCurrentTime(0);
        setIsPlaying(false);
    }, [currentIndex, playlist]);

    // Audio listeners
    useEffect(() => {
        const audio = audioRef.current;

        const onTimeUpdate = () => setCurrentTime(audio.currentTime);
        const onLoaded = () => setDuration(audio.duration || 0);
        const onEnded = () => next();

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.pause();
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("ended", onEnded);
        };
    }, []);

    const play = async () => {
        await audioRef.current.play();
        setIsPlaying(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setIsPlaying(false);
    };

    const toggle = () => (isPlaying ? pause() : play());

    const seek = (time) => {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const next = () => {
        setCurrentIndex((i) => (i + 1) % playlist.length);
    };

    const prev = () => {
        setCurrentIndex((i) => (i - 1 + playlist.length) % playlist.length);
    };

    return {
        isPlaying,
        currentTime,
        duration,
        toggle,
        seek,
        next,
        prev,
    };
}
