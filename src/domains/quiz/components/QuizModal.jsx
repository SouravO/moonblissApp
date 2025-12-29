import React, { useMemo, useState, useCallback } from "react";
import { IonIcon } from "@ionic/react";
import {
  arrowBackOutline,
  searchOutline,
  filterOutline,
  calendarOutline,
  timeOutline,
  callOutline,
  videocamOutline,
  chatbubbleEllipsesOutline,
  checkmarkCircleOutline,
  heartOutline,
  locationOutline,
  shieldCheckmarkOutline,
  pulseOutline,
  leafOutline,
  happyOutline,
  documentTextOutline,
  closeOutline,
} from "ionicons/icons";

/**
 * AppointmentsPage
 * Page version of your modal.
 *
 * Props:
 * - onClose?: () => void  // optional close handler
 */
const AppointmentsPage = ({ onClose }) => {
  // ---------- Mock data ----------
  const experts = useMemo(
    () => [
      {
        id: "d1",
        name: "Dr. Aanya Rao",
        title: "OB-GYN, Menstrual Health",
        tags: ["Periods", "PCOS", "Endometriosis"],
        mode: ["Video", "In-person"],
        language: ["English", "Hindi"],
        city: "Bengaluru",
        expYears: 12,
        rating: 4.8,
        reviews: 1320,
        fee: 899,
        next: "Today",
        about:
          "Cycle irregularities, pain, heavy bleeding, spotting, hormonal patterns, and evidence-based guidance.",
        icon: heartOutline,
        accent: "from-blue-600/25 to-cyan-600/15",
      },
      {
        id: "d2",
        name: "Dr. Meera Iyer",
        title: "Gynaecologist, Fertility & Hormones",
        tags: ["Irregular Cycle", "Fertility", "Hormones"],
        mode: ["Video"],
        language: ["English", "Tamil", "Hindi"],
        city: "Chennai",
        expYears: 9,
        rating: 4.7,
        reviews: 860,
        fee: 799,
        next: "Tomorrow",
        about:
          "Cycle length, ovulation, hormonal labs, fertility planning, and safe next steps.",
        icon: pulseOutline,
        accent: "from-cyan-600/20 to-blue-600/10",
      },
      {
        id: "d3",
        name: "Dr. Sana Farooq",
        title: "Clinical Psychologist, Women's Mental Health",
        tags: ["PMDD", "Anxiety", "Mood"],
        mode: ["Video", "Chat"],
        language: ["English", "Hindi"],
        city: "Delhi",
        expYears: 10,
        rating: 4.9,
        reviews: 540,
        fee: 1199,
        next: "This Week",
        about:
          "PMDD, mood swings, stress, sleep issues, and coping strategies aligned to cycle phases.",
        icon: happyOutline,
        accent: "from-blue-600/20 to-slate-700/10",
      },
      {
        id: "d4",
        name: "Dr. Kavya Nair",
        title: "Nutritionist, Women's Wellness",
        tags: ["Cramps", "Bloating", "Nutrition"],
        mode: ["Video", "Chat"],
        language: ["English", "Malayalam"],
        city: "Kochi",
        expYears: 7,
        rating: 4.6,
        reviews: 410,
        fee: 599,
        next: "Today",
        about:
          "Food plans for cramps, bloating, energy dips, iron support, and sustainable habits.",
        icon: leafOutline,
        accent: "from-cyan-600/18 to-blue-600/12",
      },
      {
        id: "d5",
        name: "Dr. Riya Sharma",
        title: "Psychiatrist, Hormone-Mood Interface",
        tags: ["Depression", "Sleep", "PMDD"],
        mode: ["Video", "In-person"],
        language: ["English", "Hindi"],
        city: "Mumbai",
        expYears: 14,
        rating: 4.7,
        reviews: 760,
        fee: 1499,
        next: "This Week",
        about:
          "Clinical evaluation for mood and sleep concerns that may worsen around periods.",
        icon: shieldCheckmarkOutline,
        accent: "from-blue-600/22 to-cyan-600/10",
      },
      {
        id: "d6",
        name: "Dr. Neha Kapoor",
        title: "Physiotherapist, Pelvic Health",
        tags: ["Pelvic Pain", "Back Pain", "Recovery"],
        mode: ["Video", "In-person"],
        language: ["English", "Hindi"],
        city: "Pune",
        expYears: 8,
        rating: 4.5,
        reviews: 320,
        fee: 699,
        next: "Tomorrow",
        about:
          "Pelvic pain, posture, period-related back pain, and gentle strength routines.",
        icon: documentTextOutline,
        accent: "from-cyan-600/16 to-slate-700/10",
      },
    ],
    []
  );

  // ---------- Helpers ----------
  const cx = (...xs) => xs.filter(Boolean).join(" ");
  const safeJson = (s, fallback) => {
    try {
      const v = JSON.parse(s);
      return v ?? fallback;
    } catch {
      return fallback;
    }
  };
  const fmtINR = (n) => {
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `₹${n}`;
    }
  };

  // ---------- Persistence ----------
  const LS_FAV = "mb_appointments_fav_v1";
  const LS_BOOK = "mb_appointments_bookings_v1";

  const [favorites, setFavorites] = useState(() =>
    safeJson(localStorage.getItem(LS_FAV), [])
  );
  const [bookings, setBookings] = useState(() =>
    safeJson(localStorage.getItem(LS_BOOK), [])
  );

  const persistFav = useCallback((next) => {
    setFavorites(next);
    localStorage.setItem(LS_FAV, JSON.stringify(next));
  }, []);
  const persistBookings = useCallback((next) => {
    setBookings(next);
    localStorage.setItem(LS_BOOK, JSON.stringify(next));
  }, []);

  // ---------- UI state ----------
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState("All");
  const [activeMode, setActiveMode] = useState("All");
  const [activeCity, setActiveCity] = useState("All");
  const [sortBy, setSortBy] = useState("Recommended");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState(null);

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingStep, setBookingStep] = useState("form"); // form | done
  const [bookingMode, setBookingMode] = useState("Video");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingSlot, setBookingSlot] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  const allTags = useMemo(() => {
    const t = new Set(["All"]);
    experts.forEach((e) => e.tags.forEach((x) => t.add(x)));
    return Array.from(t);
  }, [experts]);

  const cities = useMemo(() => {
    const c = new Set(["All"]);
    experts.forEach((e) => c.add(e.city));
    return Array.from(c);
  }, [experts]);

  const modes = useMemo(() => ["All", "Video", "In-person", "Chat"], []);
  const timeSlots = useMemo(
    () => ["09:30", "10:15", "11:00", "12:30", "15:00", "16:15", "18:00", "19:30"],
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = experts.filter((e) => {
      const matchQ =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q) ||
        e.tags.some((t) => t.toLowerCase().includes(q)) ||
        e.city.toLowerCase().includes(q);

      const matchTag = activeTag === "All" ? true : e.tags.includes(activeTag);
      const matchMode = activeMode === "All" ? true : e.mode.includes(activeMode);
      const matchCity = activeCity === "All" ? true : e.city === activeCity;

      return matchQ && matchTag && matchMode && matchCity;
    });

    if (sortBy === "Top Rated") list = list.sort((a, b) => b.rating - a.rating);
    if (sortBy === "Lowest Fee") list = list.sort((a, b) => a.fee - b.fee);
    if (sortBy === "Most Experienced") list = list.sort((a, b) => b.expYears - a.expYears);

    return list;
  }, [experts, query, activeTag, activeMode, activeCity, sortBy]);

  // ---------- Actions ----------
  const toggleFav = useCallback(
    (id) => {
      const next = favorites.includes(id)
        ? favorites.filter((x) => x !== id)
        : [...favorites, id];
      persistFav(next);
    },
    [favorites, persistFav]
  );

  const openProfile = useCallback((expert) => {
    setSelectedExpert(expert);
    setDrawerOpen(true);
  }, []);

  const openBooking = useCallback((expert) => {
    setSelectedExpert(expert);
    setBookingStep("form");
    setBookingMode(expert.mode.includes("Video") ? "Video" : expert.mode[0]);
    setBookingDate("");
    setBookingSlot("");
    setBookingReason("");
    setBookingNotes("");
    setBookingOpen(true);
  }, []);

  const canSubmit =
    selectedExpert &&
    bookingMode &&
    bookingDate &&
    bookingSlot &&
    bookingReason.trim().length >= 6;

  const submitBooking = useCallback(() => {
    if (!canSubmit) return;

    const b = {
      id: `bk_${Date.now()}`,
      expertId: selectedExpert.id,
      expertName: selectedExpert.name,
      mode: bookingMode,
      date: bookingDate,
      slot: bookingSlot,
      reason: bookingReason.trim(),
      notes: bookingNotes.trim(),
      fee: selectedExpert.fee,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
    };

    const next = [b, ...bookings];
    persistBookings(next);
    setBookingStep("done");
  }, [
    canSubmit,
    selectedExpert,
    bookingMode,
    bookingDate,
    bookingSlot,
    bookingReason,
    bookingNotes,
    bookings,
    persistBookings,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl animate-pulse" />
      </div>

      {/* Page container */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 bg-white/60 backdrop-blur-md border-b border-blue-200/30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onClose?.()}
              className="w-10 h-10 rounded-2xl bg-white/60 border border-blue-300/40 flex items-center justify-center hover:bg-white/80 active:scale-95 transition"
              aria-label="Back"
              title="Back"
            >
              <IonIcon icon={arrowBackOutline} className="text-xl text-slate-900" />
            </button>

            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center">
              <IonIcon icon={calendarOutline} className="text-xl text-blue-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-lg font-black leading-tight text-slate-900">
                    Appointments
                  </div>
                  <div className="text-sm text-slate-600">
                    Periods, women&apos;s physical health, mental health
                  </div>
                </div>
              </div>

              {/* Search */}
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 relative">
                  <IonIcon
                    icon={searchOutline}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search doctors, experts, tags, city"
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/60 border border-blue-300/40 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                <button
                  onClick={() => {
                    if (
                      activeTag !== "All" ||
                      activeMode !== "All" ||
                      activeCity !== "All" ||
                      sortBy !== "Recommended"
                    ) {
                      setActiveTag("All");
                      setActiveMode("All");
                      setActiveCity("All");
                      setSortBy("Recommended");
                    } else {
                      setSortBy((s) =>
                        s === "Recommended"
                          ? "Top Rated"
                          : s === "Top Rated"
                          ? "Lowest Fee"
                          : s === "Lowest Fee"
                          ? "Most Experienced"
                          : "Recommended"
                      );
                    }
                  }}
                  className="h-11 px-3 rounded-xl bg-blue-600/20 border border-blue-400/30 hover:bg-blue-600/30 active:scale-[0.98] transition flex items-center gap-2"
                  aria-label="Filters"
                  title="Tap to reset filters, or cycle sort when already reset"
                >
                  <IonIcon icon={filterOutline} className="text-lg text-blue-600" />
                  <span className="text-sm text-slate-700 hidden sm:inline">{sortBy}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 10).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className={cx(
                    "px-3 py-1.5 rounded-full text-sm border transition active:scale-[0.98]",
                    activeTag === t
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-500 text-white"
                      : "bg-blue-50 border-blue-300/50 text-slate-700 hover:bg-blue-100"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={activeMode}
                onChange={(e) => setActiveMode(e.target.value)}
                className="h-11 rounded-xl bg-white/60 border border-blue-300/40 px-3 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900"
              >
                {modes.map((m) => (
                  <option key={m} value={m} className="bg-white text-slate-900">
                    Mode: {m}
                  </option>
                ))}
              </select>

              <select
                value={activeCity}
                onChange={(e) => setActiveCity(e.target.value)}
                className="h-11 rounded-xl bg-white/60 border border-blue-300/40 px-3 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900"
              >
                {cities.map((c) => (
                  <option key={c} value={c} className="bg-white text-slate-900">
                    City: {c}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl bg-white/60 border border-blue-300/40 px-3 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900"
              >
                {["Recommended", "Top Rated", "Lowest Fee", "Most Experienced"].map((s) => (
                  <option key={s} value={s} className="bg-white text-slate-900">
                    Sort: {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-6 overflow-y-auto max-h-[calc(100vh-180px)]">
          {/* Bookings */}
          <div className="mb-6 rounded-2xl bg-blue-50 border border-blue-200/50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-black text-slate-900">Your bookings</div>
                <div className="text-sm text-slate-600">Saved on this device</div>
              </div>
              <div className="text-sm text-slate-700 bg-blue-100 border border-blue-300/50 rounded-full px-3 py-1">
                {bookings.length}
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="mt-3 text-sm text-slate-600">
                No appointments yet. Book from the list below.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {bookings.slice(0, 2).map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl bg-white/60 border border-blue-200/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900">{b.expertName}</div>
                        <div className="text-sm text-slate-600">
                          {b.mode} • {b.date} • {b.slot}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-300/30 text-emerald-700">
                        {b.status}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700">
                      Reason: <span className="text-slate-600">{b.reason}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Experts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((e) => {
              const FavIcon = favorites.includes(e.id)
                ? checkmarkCircleOutline
                : heartOutline;

              return (
                <div
                  key={e.id}
                  className="rounded-3xl border border-blue-400/30 bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden shadow-2xl shadow-blue-600/20"
                >
                  <div className={cx("p-5 bg-gradient-to-br", e.accent)}>
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => openProfile(e)}
                        className="flex-1 text-left"
                        aria-label={`Open profile ${e.name}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center">
                            <IonIcon icon={e.icon} className="text-2xl text-white" />
                          </div>
                          <div>
                            <div className="font-black text-lg text-white">{e.name}</div>
                            <div className="text-sm text-white/80">{e.title}</div>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => toggleFav(e.id)}
                        className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 active:scale-95 transition"
                        aria-label="Favorite"
                        title={favorites.includes(e.id) ? "Saved" : "Save"}
                      >
                        <IonIcon icon={FavIcon} className="text-xl text-white" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.tags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white"
                        >
                          {t}
                        </span>
                      ))}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white flex items-center gap-1">
                        <IonIcon icon={locationOutline} />
                        {e.city}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                        <div className="text-white/70 text-xs">Rating</div>
                        <div className="font-black text-white">{e.rating.toFixed(1)}</div>
                        <div className="text-white/70 text-xs">{e.reviews} reviews</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                        <div className="text-white/70 text-xs">Experience</div>
                        <div className="font-black text-white">{e.expYears} yrs</div>
                        <div className="text-white/70 text-xs">Verified</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 border border-white/20 p-3">
                        <div className="text-white/70 text-xs">Fee</div>
                        <div className="font-black text-white">{fmtINR(e.fee)}</div>
                        <div className="text-white/70 text-xs">Starting</div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-sm text-white flex items-center gap-2">
                        <IonIcon icon={timeOutline} className="text-white/80" />
                        Next: <span className="text-white font-semibold">{e.next}</span>
                      </div>

                      <button
                        onClick={() => openBooking(e)}
                        className="h-11 px-4 rounded-3xl bg-white border border-white text-blue-600 font-bold hover:bg-white/90 active:scale-[0.98] transition flex items-center gap-2"
                      >
                        <IonIcon icon={calendarOutline} />
                        Book
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-blue-700/50">
                    <div className="text-sm text-white/80 leading-relaxed">{e.about}</div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {e.mode.map((m) => (
                        <span
                          key={m}
                          className="text-xs px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white flex items-center gap-1"
                        >
                          <IonIcon
                            icon={
                              m === "Video"
                                ? videocamOutline
                                : m === "Chat"
                                ? chatbubbleEllipsesOutline
                                : callOutline
                            }
                          />
                          {m}
                        </span>
                      ))}
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/20 border border-white/30 text-white">
                        Languages: {e.language.join(", ")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 text-center text-slate-600">
              No results. Change search or filters.
            </div>
          )}

          {/* Footer safety */}
          <div className="mt-8 rounded-2xl bg-emerald-500/10 border border-emerald-300/20 p-4">
            <div className="flex items-start gap-2">
              <IonIcon icon={shieldCheckmarkOutline} className="text-emerald-700 text-xl mt-0.5" />
              <div className="text-sm text-emerald-900/90">
                If you have severe bleeding, fainting, chest pain, or self-harm thoughts, seek urgent care immediately.
              </div>
            </div>
          </div>
        </div>

        {/* Profile Drawer */}
        {drawerOpen && selectedExpert && (
          <div className="fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/55 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-white via-blue-50 to-blue-100 border-l border-blue-200/40 shadow-2xl">
              <div className="p-5 border-b border-blue-200/40 flex items-center justify-between">
                <div className="font-black text-lg text-slate-900">Expert profile</div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/70 border border-blue-200/40 flex items-center justify-center hover:bg-white active:scale-95 transition"
                  aria-label="Close drawer"
                >
                  <IonIcon icon={closeOutline} className="text-2xl text-slate-900" />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center">
                    <IonIcon icon={selectedExpert.icon} className="text-3xl text-blue-600" />
                  </div>
                  <div>
                    <div className="font-black text-xl text-slate-900">{selectedExpert.name}</div>
                    <div className="text-sm text-slate-600">{selectedExpert.title}</div>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-blue-100/60 border border-blue-300/40 p-4">
                  <div className="text-sm text-slate-700">
                    <span className="text-slate-600">City:</span> {selectedExpert.city}
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="text-slate-600">Experience:</span> {selectedExpert.expYears} years
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="text-slate-600">Rating:</span> {selectedExpert.rating.toFixed(1)} (
                    {selectedExpert.reviews} reviews)
                  </div>
                  <div className="text-sm text-slate-700 mt-1">
                    <span className="text-slate-600">Fee:</span> {fmtINR(selectedExpert.fee)}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-bold mb-2 text-slate-900">Focus areas</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300/50 text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="font-bold mb-2 text-slate-900">About</div>
                  <div className="text-sm text-slate-600 leading-relaxed">{selectedExpert.about}</div>
                </div>

                <div className="mt-5">
                  <div className="font-bold mb-2 text-slate-900">Modes</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedExpert.mode.map((m) => (
                      <span
                        key={m}
                        className="text-xs px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300/50 text-slate-700 flex items-center gap-1"
                      >
                        <IonIcon
                          icon={
                            m === "Video"
                              ? videocamOutline
                              : m === "Chat"
                              ? chatbubbleEllipsesOutline
                              : callOutline
                          }
                        />
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => openBooking(selectedExpert)}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-white/10 font-black text-white hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2"
                  >
                    <IonIcon icon={calendarOutline} />
                    Book
                  </button>
                  <button
                    onClick={() => toggleFav(selectedExpert.id)}
                    className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center hover:bg-blue-600/30 active:scale-95 transition"
                    aria-label="Save"
                  >
                    <IonIcon
                      icon={favorites.includes(selectedExpert.id) ? checkmarkCircleOutline : heartOutline}
                      className="text-xl text-blue-600"
                    />
                  </button>
                </div>

                <div className="mt-5 rounded-2xl bg-blue-100/60 border border-blue-300/40 p-4">
                  <div className="flex items-start gap-2">
                    <IonIcon icon={documentTextOutline} className="text-blue-600 text-xl mt-0.5" />
                    <div className="text-sm text-slate-600">
                      Demo booking only. Plug in real provider scheduling and payments later.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Booking Modal (kept as modal on top of page) */}
        {bookingOpen && selectedExpert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setBookingOpen(false)}
            />
            <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-white via-blue-50 to-blue-100 border border-blue-300/40 shadow-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 border-b border-blue-300/40 flex items-center justify-between">
                <div>
                  <div className="font-black text-lg text-white">Book appointment</div>
                  <div className="text-sm text-white/80">
                    {selectedExpert.name} • {fmtINR(selectedExpert.fee)}
                  </div>
                </div>
                <button
                  onClick={() => setBookingOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center hover:bg-white/30 active:scale-95 transition"
                  aria-label="Close booking"
                >
                  <IonIcon icon={closeOutline} className="text-2xl text-white" />
                </button>
              </div>

              <div className="p-6">
                {bookingStep === "form" ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-blue-100/60 border border-blue-300/40 p-3">
                        <div className="text-xs text-slate-600 mb-1">Consultation mode</div>
                        <div className="flex gap-2 flex-wrap">
                          {selectedExpert.mode.map((m) => (
                            <button
                              key={m}
                              onClick={() => setBookingMode(m)}
                              className={cx(
                                "px-3 py-2 rounded-xl border text-sm font-semibold transition active:scale-[0.98] flex items-center gap-2",
                                bookingMode === m
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white"
                                  : "bg-blue-50 border-blue-300/50 text-slate-700 hover:bg-blue-100"
                              )}
                            >
                              <IonIcon
                                icon={
                                  m === "Video"
                                    ? videocamOutline
                                    : m === "Chat"
                                    ? chatbubbleEllipsesOutline
                                    : callOutline
                                }
                              />
                              {m}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-blue-100/60 border border-blue-300/40 p-3">
                        <div className="text-xs text-slate-600 mb-1">Date</div>
                        <input
                          type="date"
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          className="w-full h-11 rounded-xl bg-white/60 border border-blue-300/40 px-3 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-blue-100/60 border border-blue-300/40 p-3">
                      <div className="text-xs text-slate-600 mb-2">Time slot</div>
                      <div className="flex flex-wrap gap-2">
                        {timeSlots.map((t) => (
                          <button
                            key={t}
                            onClick={() => setBookingSlot(t)}
                            className={cx(
                              "px-3 py-2 rounded-xl border text-sm font-semibold transition active:scale-[0.98] flex items-center gap-2",
                              bookingSlot === t
                                ? "bg-gradient-to-r from-blue-600 to-cyan-600 border-blue-400 text-white"
                                : "bg-blue-50 border-blue-300/50 text-slate-700 hover:bg-blue-100"
                            )}
                          >
                            <IonIcon icon={timeOutline} />
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-blue-100/60 border border-blue-300/40 p-3">
                      <div className="text-xs text-slate-600 mb-1">Reason for visit</div>
                      <input
                        value={bookingReason}
                        onChange={(e) => setBookingReason(e.target.value)}
                        placeholder="Example: severe cramps, irregular cycle, mood swings"
                        className="w-full h-11 rounded-xl bg-white/60 border border-blue-300/40 px-3 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900 placeholder:text-slate-500"
                      />
                      <div className="mt-2 text-xs text-slate-500">Minimum 6 characters</div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-blue-100/60 border border-blue-300/40 p-3">
                      <div className="text-xs text-slate-600 mb-1">Notes (optional)</div>
                      <textarea
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="Any extra context you want the expert to know"
                        rows={3}
                        className="w-full rounded-xl bg-white/60 border border-blue-300/40 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400/40 text-slate-900 placeholder:text-slate-500 resize-none"
                      />
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => setBookingOpen(false)}
                        className="flex-1 h-12 rounded-2xl bg-blue-100 border border-blue-300/50 font-black text-slate-700 hover:bg-blue-200 active:scale-[0.98] transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={submitBooking}
                        disabled={!canSubmit}
                        className={cx(
                          "flex-1 h-12 rounded-2xl font-black border transition active:scale-[0.98] flex items-center justify-center gap-2",
                          canSubmit
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 border-blue-400 text-white hover:brightness-110"
                            : "bg-slate-200 border-slate-300 text-slate-400 cursor-not-allowed"
                        )}
                      >
                        <IonIcon icon={checkmarkCircleOutline} />
                        Confirm
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center">
                      <IonIcon icon={checkmarkCircleOutline} className="text-4xl text-emerald-600" />
                    </div>
                    <div className="mt-4 text-2xl font-black text-slate-900">Appointment confirmed</div>
                    <div className="mt-2 text-slate-600">
                      {selectedExpert.name} • {bookingMode} • {bookingDate} • {bookingSlot}
                    </div>

                    <button
                      onClick={() => setBookingOpen(false)}
                      className="mt-6 h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 border border-white/10 font-black text-white hover:brightness-110 active:scale-[0.98] transition"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
