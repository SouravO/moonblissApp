import React, { useMemo, useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import {
  play,
  musicalNotes,
  searchOutline,
  closeOutline,
  optionsOutline,
  sparklesOutline,
  moonOutline,
  flashOutline,
  bedOutline,
  heartOutline,
} from "ionicons/icons";
import PageLayout from "../layout/PageLayout";
import MusicPlayer from "../../domains/music/Components/MusicPlayer";
import { useBackHandler } from "@/infrastructure/context/BackButtonContext";
import { getThemeConfig } from "@/infrastructure/theme/themeConfig";
import periodStorage from "@/infrastructure/storage/periodStorage";

/**
 * UI/UX REWORK (functionality unchanged):
 * - Same playlist, grouping, play behavior, MusicPlayer props, back handler logic.
 * - New layout: "orbital" hero, sticky glass header, chip filters, quick search,
 *   category sections with "track pills" and mini cards, bottom open-player dock hint.
 * - No new dependencies. Tailwind only.
 * - Unified theme colors based on period state (dynamic).
 */

const cx = (...xs) => xs.filter(Boolean).join(" ");

// categoryMeta now uses unified theme colors (will be set dynamically in component)

const Music = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);

  // UI states (do not affect existing functionality)
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showControls, setShowControls] = useState(false);

  // ✅ REFACTORED: Cached period data with event listeners
  const [cachedPeriodData, setCachedPeriodData] = useState(() => {
    return periodStorage.get();
  });

  // ✅ FIX: Re-sync cache when component mounts or storage changes
  useEffect(() => {
    const periodData = periodStorage.get();
    setCachedPeriodData(periodData);

    const handlePeriodDataChange = () => {
      console.log("Period data changed, updating cache");
      const updatedData = periodStorage.get();
      setCachedPeriodData(updatedData);
    };

    window.addEventListener("storage", handlePeriodDataChange);
    window.addEventListener("period-data-changed", handlePeriodDataChange);

    return () => {
      window.removeEventListener("storage", handlePeriodDataChange);
      window.removeEventListener("period-data-changed", handlePeriodDataChange);
    };
  }, []);

  const periodState = useMemo(() => {
    if (!cachedPeriodData?.lastPeriodDate) {
      return {
        periodActive: false,
        savedPeriodStartDate: "",
        periodDuration: 5,
      };
    }

    const startDate = new Date(cachedPeriodData.lastPeriodDate);
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const periodDuration = cachedPeriodData.periodDuration || 5;

    return {
      periodActive: daysElapsed < periodDuration,
      savedPeriodStartDate: cachedPeriodData.lastPeriodDate,
      daysElapsed,
      periodDuration,
    };
  }, [cachedPeriodData]);

  const { periodActive } = periodState;

  // Get dynamic theme based on period state
  const theme = useMemo(() => {
    return getThemeConfig(periodActive);
  }, [periodActive]);

  // Generate unified categoryMeta based on theme
  const categoryMeta = useMemo(() => {
    // Use theme's progressBar gradient for all categories uniformly
    const gradColors = theme.progressBar || "from-blue-600 to-sky-400";
    const isPeriod = periodActive;
    
    return {
      calm: {
        label: "Calm",
        icon: moonOutline,
        grad: gradColors,
        chip: isPeriod ? "bg-red-500/15 text-red-900 ring-red-400/25" : "bg-blue-500/15 text-blue-900 ring-blue-400/25",
      },
      energetic: {
        label: "Energy",
        icon: flashOutline,
        grad: gradColors,
        chip: isPeriod ? "bg-red-500/15 text-red-900 ring-red-400/25" : "bg-blue-500/15 text-blue-900 ring-blue-400/25",
      },
      sleep: {
        label: "Sleep",
        icon: bedOutline,
        grad: gradColors,
        chip: isPeriod ? "bg-red-500/15 text-red-900 ring-red-400/25" : "bg-blue-500/15 text-blue-900 ring-blue-400/25",
      },
      "self-care": {
        label: "Self care",
        icon: heartOutline,
        grad: gradColors,
        chip: isPeriod ? "bg-red-500/15 text-red-900 ring-red-400/25" : "bg-blue-500/15 text-blue-900 ring-blue-400/25",
      },
    };
  }, [periodActive, theme]);

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
  }, []); // keep same behavior as your original

  const categories = useMemo(() => {
    const keys = Object.keys(groupedTracks);
    return ["all", ...keys];
  }, [groupedTracks]);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredGrouped = useMemo(() => {
    const result = {};
    Object.entries(groupedTracks).forEach(([cat, tracks]) => {
      if (activeCategory !== "all" && cat !== activeCategory) return;
      const filtered = !normalizedQuery
        ? tracks
        : tracks.filter((t) => {
            const hay = `${t.title} ${t.artist} ${t.category}`.toLowerCase();
            return hay.includes(normalizedQuery);
          });
      if (filtered.length) result[cat] = filtered;
    });
    return result;
  }, [groupedTracks, activeCategory, normalizedQuery]);

  const featuredTrack = playlist[0];

  const playMusic = (track) => {
    setCurrentTrack(track);
    setShowPlayer(true);
  };

  const CategoryChip = ({ value }) => {
    const isAll = value === "all";
    const meta = isAll
      ? {
          label: "All",
          icon: sparklesOutline,
          chip: "bg-white/35 text-slate-900 ring-white/40",
        }
      : categoryMeta[value] || {
          label: value.replace("-", " "),
          icon: musicalNotes,
          chip: "bg-white/35 text-slate-900 ring-white/40",
        };

    const active = activeCategory === value;

    return (
      <button
        onClick={() => setActiveCategory(value)}
        className={cx(
          "shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ring-1 transition",
          "active:scale-[0.98]",
          active
            ? cx(meta.chip, "shadow-sm")
            : "bg-white/20 text-slate-700 ring-white/30 hover:bg-white/30"
        )}
      >
        <IonIcon icon={meta.icon} className="text-sm" />
        <span className="capitalize">{meta.label}</span>
      </button>
    );
  };

  const TrackPill = ({ track }) => {
    const meta = categoryMeta[track.category] || categoryMeta.calm;
    return (
      <button
        onClick={() => playMusic(track)}
        className={cx(
          "group relative flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/30",
          "bg-white/35 backdrop-blur-md hover:bg-white/45 transition",
          "active:scale-[0.99] text-left w-full"
        )}
      >
        {/* mini art */}
        <div
          className={cx(
            "relative h-12 w-12 rounded-xl overflow-hidden",
            "bg-gradient-to-br",
            meta.grad
          )}
        >
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_60%)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <IonIcon icon={musicalNotes} className="text-white text-xl" />
          </div>
        </div>

        {/* text */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="min-w-0 truncate text-sm font-semibold text-slate-900">
              {track.title}
            </h4>
            <span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-900/5 text-slate-700 ring-1 ring-slate-900/10">
              {track.category.replace("-", " ")}
            </span>
          </div>
          <p className="truncate text-xs text-slate-600 mt-0.5">
            {track.artist}
          </p>
        </div>

        {/* play orb */}
        <div className="relative">
          <div
            className={cx(
              "h-11 w-11 rounded-full grid place-items-center ring-1 ring-white/40",
              "bg-gradient-to-br",
              meta.grad,
              "shadow-md"
            )}
          >
            <IonIcon icon={play} className="text-white text-lg ml-0.5" />
          </div>
          <div className="pointer-events-none absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 transition blur-md bg-white/30" />
        </div>
      </button>
    );
  };

  const MiniCard = ({ track }) => {
    const meta = categoryMeta[track.category] || categoryMeta.calm;
    return (
      <div
        onClick={() => playMusic(track)}
        className={cx(
          "min-w-[210px] cursor-pointer select-none",
          "rounded-3xl p-4 ring-1 ring-white/30",
          "bg-white/30 backdrop-blur-md hover:bg-white/40 transition",
          "active:scale-[0.99] flex flex-col"
        )}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-600">
              {track.category.replace("-", " ")}
            </p>
            <h4 className="mt-1 text-sm font-semibold text-slate-900 truncate">
              {track.title}
            </h4>
            <p className="mt-1 text-xs text-slate-600 truncate">{track.artist}</p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              playMusic(track);
            }}
            className={cx(
              "h-11 w-11 rounded-2xl grid place-items-center shadow-md ring-1 ring-white/40",
              "bg-gradient-to-br",
              meta.grad,
              "active:scale-[0.98]"
            )}
          >
            <IonIcon icon={play} className="text-white text-lg ml-0.5" />
          </button>
        </div>

        <div className="flex-1">
          <div
            className={cx(
              "h-full w-full rounded-2xl overflow-hidden",
              "bg-gradient-to-br",
              meta.grad,
              "flex flex-col items-center justify-center gap-3 p-4"
            )}
          >
            <IonIcon icon={meta.icon} className="text-white text-5xl" />
            <p className="text-white font-bold text-center text-sm">
              {track.category.replace("-", " ").toUpperCase()}
            </p>
            <div className="h-1 w-8 bg-white/60 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <PageLayout>
      <div className={`min-h-screen text-slate-900 ${theme.background}`}>
        {/* Background */}
        <div className="fixed inset-0 -z-10">
          <div className={`absolute -top-24 -left-24 h-72 w-72 rounded-full ${theme.blobs.blob1} blur-3xl animate-pulse`} />
          <div className={`absolute top-1/3 -right-20 h-80 w-80 rounded-full ${theme.blobs.blob2} blur-3xl animate-pulse`} />
          <div className={`absolute bottom-[-80px] left-1/4 h-96 w-96 rounded-full ${periodActive ? 'bg-pink-600/15' : 'bg-cyan-300/20'} blur-3xl animate-pulse`} />
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,rgba(15,23,42,1)_1px,transparent_0)] [background-size:20px_20px]" />
        </div>

        {/* Sticky header */}
        <div className="sticky top-0 z-30">
          <div className="px-4 pt-4">
            <div className="rounded-3xl bg-white/35 backdrop-blur-xl ring-1 ring-white/40 shadow-sm">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <h1 className="text-lg font-bold tracking-tight text-slate-900">
                    Wellness Sounds
                  </h1>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Music that matches your rhythm
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowControls((v) => !v)}
                    className="h-11 w-11 rounded-2xl bg-white/40 ring-1 ring-white/40 grid place-items-center active:scale-[0.98]"
                    aria-label="Controls"
                  >
                    <IonIcon icon={optionsOutline} className="text-lg" />
                  </button>
                  {showControls && (
                    <button
                      onClick={() => {
                        setQuery("");
                        setActiveCategory("all");
                        setShowControls(false);
                      }}
                      className="h-11 w-11 rounded-2xl bg-white/40 ring-1 ring-white/40 grid place-items-center active:scale-[0.98]"
                      aria-label="Reset"
                    >
                      <IonIcon icon={closeOutline} className="text-lg" />
                    </button>
                  )}
                </div>
              </div>

              {/* Search + Chips */}
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 rounded-2xl bg-white/45 ring-1 ring-white/50 px-3 py-2">
                  <IonIcon icon={searchOutline} className="text-slate-600" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tracks, moods, artists"
                    className="w-full bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                  {categories.map((c) => (
                    <CategoryChip key={c} value={c} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero: Orbital Featured */}
        <div className="px-4 pt-5">
          <div className="relative overflow-hidden rounded-[32px] ring-1 ring-white/40 bg-white/25 backdrop-blur-xl shadow-lg">
            <div className="absolute inset-0">
              <div className={`absolute -top-24 -left-24 h-72 w-72 rounded-full ${theme.blobs.blob1} blur-3xl animate-pulse`} />
              <div className={`absolute -bottom-28 -right-28 h-96 w-96 rounded-full ${theme.blobs.blob2} blur-3xl animate-pulse`} />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.8),transparent_55%)]" />
            </div>

            <div className="relative p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.26em] text-slate-600">
                    Featured today
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">
                    Evening Calm
                  </h2>
                  <p className="mt-1 text-sm text-slate-700">
                    Unwind your mind and body
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="rounded-2xl bg-white/40 ring-1 ring-white/50 px-3 py-2">
                    <div className="flex items-center gap-2 text-xs text-slate-700">
                      <IonIcon icon={sparklesOutline} className="text-slate-700" />
                      <span className="font-semibold">Daily pick</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Orb + Play */}
              <div className="mt-5 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-7">
                  <div className="relative h-28 rounded-3xl overflow-hidden ring-1 ring-white/40">
                    <div className={`absolute inset-0 bg-gradient-to-br ${theme.progressBar}`} />
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.9),transparent_55%)]" />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <div className="min-w-0">
                        <p className="text-white/85 text-xs uppercase tracking-widest">
                          Now suggested
                        </p>
                        <p className="text-white font-semibold truncate mt-1">
                          {featuredTrack.title}
                        </p>
                        <p className="text-white/80 text-xs truncate mt-0.5">
                          {featuredTrack.artist}
                        </p>
                      </div>
                      <IonIcon icon={musicalNotes} className="text-white text-3xl" />
                    </div>
                  </div>
                </div>

                <div className="col-span-5 flex justify-end">
                  <button
                    onClick={() => playMusic(featuredTrack)}
                    className={cx(
                      "group relative h-16 w-16 rounded-[26px] grid place-items-center",
                      "bg-white/60 ring-1 ring-white/60 shadow-xl",
                      "active:scale-[0.98]"
                    )}
                  >
                    <div className="absolute -inset-3 rounded-[34px] opacity-0 group-hover:opacity-100 transition blur-xl bg-white/35" />
                    <IonIcon icon={play} className={`relative text-2xl ml-1 ${periodActive ? 'text-red-600' : 'text-blue-700'}`} />
                  </button>
                </div>
              </div>

              {/* hint */}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-600">
                  Tap any track to open the player.
                </p>
                {currentTrack && (
                  <button
                    onClick={() => setShowPlayer(true)}
                    className="text-xs font-semibold text-slate-900 rounded-full px-3 py-2 bg-white/40 ring-1 ring-white/50 active:scale-[0.99]"
                  >
                    Resume
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-28 pt-6 space-y-8">
          {Object.entries(filteredGrouped).length === 0 ? (
            <div className="rounded-3xl bg-white/35 backdrop-blur ring-1 ring-white/40 p-6 text-center">
              <p className="text-sm font-semibold text-slate-900">No matches</p>
              <p className="text-xs text-slate-600 mt-1">
                Try a different keyword or switch category.
              </p>
            </div>
          ) : (
            Object.entries(filteredGrouped).map(([category, tracks]) => {
              const meta = categoryMeta[category] || {
                label: category.replace("-", " "),
                icon: musicalNotes,
                grad: theme.progressBar,
              };

              return (
                <section key={category} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={cx(
                          "h-9 w-9 rounded-2xl grid place-items-center ring-1 ring-white/40",
                          "bg-gradient-to-br",
                          meta.grad
                        )}
                      >
                        <IonIcon icon={meta.icon} className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 capitalize">
                          {meta.label}
                        </h3>
                        <p className="text-xs text-slate-600">
                          {tracks.length} track{tracks.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveCategory(category);
                        setQuery("");
                      }}
                      className="text-xs font-semibold text-slate-700 rounded-full px-3 py-2 bg-white/30 ring-1 ring-white/40 hover:bg-white/40 active:scale-[0.99]"
                    >
                      Focus
                    </button>
                  </div>

                  {/* Mini-card rail */}
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                    {tracks.map((t) => (
                      <MiniCard key={`card-${t.id}`} track={t} />
                    ))}
                  </div>

                  {/* Pill list */}
                  <div className="grid grid-cols-1 gap-3">
                    {tracks.map((t) => (
                      <TrackPill key={`pill-${t.id}`} track={t} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        {/* Bottom hint dock (does not replace MusicPlayer) */}
        <div className="fixed bottom-0 left-0 right-0 z-20">
          <div className="px-4 pb-4">
            <div className="rounded-3xl bg-white/35 backdrop-blur-xl ring-1 ring-white/40 shadow-lg px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-600">Player</p>
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {currentTrack ? currentTrack.title : "Pick a sound to begin"}
                </p>
              </div>
              <button
                onClick={() => {
                  if (currentTrack) setShowPlayer(true);
                  else playMusic(featuredTrack);
                }}
                className={cx(
                  "shrink-0 h-11 px-4 rounded-2xl font-semibold text-sm",
                  "bg-slate-900 text-white shadow-md active:scale-[0.99]"
                )}
              >
                {currentTrack ? "Open" : "Start"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Player (unchanged API) */}
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
