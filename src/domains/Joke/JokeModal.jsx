// JokeModal.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * BlueGPT: single-file "AI assistant" modal/page component (Tailwind) using free sources.
 * Free sources (no keys): Wikipedia REST + Open-Meteo.
 * Stores chat in localStorage.
 */

const STORAGE_KEY = "bluegpt_chat_v1";

const nowISO = () => new Date().toISOString();
const cx = (...xs) => xs.filter(Boolean).join(" ");

const safeJson = (s, fallback) => {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function useAutosizeTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return ref;
}

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

/* ---------------------- Local mini KB ---------------------- */
const LOCAL_KB = [
  {
    keys: ["period", "cramp", "menstrual", "mens", "menstruation", "pms"],
    title: "Period basics",
    answer:
      "Periods are normal uterine bleeding as part of the menstrual cycle. Cramps are usually caused by prostaglandins.\n\nTry: heat pad, gentle movement, hydration, sleep, and OTC pain relief if safe for you.\n\nSeek urgent care if: severe sudden pain, fainting, heavy bleeding soaking 1+ pad/hour for 2+ hours, pregnancy possibility, fever, or symptoms that feel alarming.",
  },
  {
    keys: ["hydration", "water", "drink"],
    title: "Hydration",
    answer:
      "Sip regularly. If urine is very dark or you feel dizzy, increase fluids and consider electrolytes. If you have kidney/heart conditions, follow clinician guidance.",
  },
  {
    keys: ["panic", "anxiety", "stress"],
    title: "Stress reset",
    answer:
      "Try a 60-second reset: inhale 4 seconds, exhale 6 seconds, repeat 6 times. Reduce caffeine, hydrate, and step away from screens briefly.",
  },
];

/* ---------------------- Routing ---------------------- */
function detectIntent(q) {
  const s = q.toLowerCase().trim();
  const weatherRe =
    /(weather|temperature|forecast|rain|wind|humidity)\s+(in|at|for)\s+(.+)/i;
  const m = s.match(weatherRe);
  if (m && m[3]) return { type: "weather", location: m[3].trim() };

  const wikiCue =
    s.startsWith("who is ") ||
    s.startsWith("what is ") ||
    s.startsWith("define ") ||
    s.startsWith("meaning of ") ||
    s.startsWith("tell me about ") ||
    s.startsWith("explain ");
  if (wikiCue) return { type: "wiki" };

  return { type: "auto" };
}

/* ---------------------- Wikipedia (free) ---------------------- */
async function wikiSearch(query, signal) {
  const url =
    "https://en.wikipedia.org/w/api.php?" +
    new URLSearchParams({
      action: "query",
      list: "search",
      srsearch: query,
      format: "json",
      origin: "*",
      srlimit: "5",
    }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Wikipedia search failed");
  const data = await res.json();
  const hits = data?.query?.search ?? [];
  return hits.map((h) => ({
    title: h.title,
    snippet: (h.snippet || "").replace(/<\/?[^>]+(>|$)/g, ""),
  }));
}

async function wikiSummary(titleOrQuery, signal) {
  const title = encodeURIComponent(titleOrQuery.replaceAll(" ", "_"));
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`;
  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error("Wikipedia summary failed");
  const data = await res.json();
  return {
    title: data?.title || titleOrQuery,
    extract: data?.extract || "",
    url: data?.content_urls?.desktop?.page || "",
    thumbnail: data?.thumbnail?.source || "",
  };
}

/* ---------------------- Open-Meteo (free) ---------------------- */
async function geoLookup(name, signal) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?" +
    new URLSearchParams({
      name,
      count: "1",
      language: "en",
      format: "json",
    }).toString();
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  const r = data?.results?.[0];
  if (!r) return null;
  return {
    name: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    lat: r.latitude,
    lon: r.longitude,
  };
}

async function weatherNow(lat, lon, signal) {
  const url =
    "https://api.open-meteo.com/v1/forecast?" +
    new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
      hourly: "precipitation_probability",
      forecast_days: "1",
      timezone: "auto",
    }).toString();

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("Weather fetch failed");
  const data = await res.json();
  const c = data?.current || {};
  const hourly = data?.hourly || {};
  const p0 = Array.isArray(hourly.precipitation_probability)
    ? hourly.precipitation_probability[0]
    : null;

  return {
    temp: c.temperature_2m,
    feels: c.apparent_temperature,
    humid: c.relative_humidity_2m,
    wind: c.wind_speed_10m,
    precipChance: p0,
    units: data?.current_units || {},
  };
}

/* ---------------------- Assistant core ---------------------- */
function localKbAnswer(q) {
  const s = q.toLowerCase();
  const hit = LOCAL_KB.find((item) => item.keys.some((k) => s.includes(k)));
  if (!hit) return null;
  return { kind: "local", title: hit.title, text: hit.answer };
}

async function answerQuestion(q, signal) {
  const intent = detectIntent(q);

  if (intent.type === "weather") {
    const place = await geoLookup(intent.location, signal);
    if (!place) {
      return {
        kind: "weather",
        title: "Weather",
        text: `I could not find "${intent.location}". Try "weather in Bengaluru".`,
      };
    }
    const w = await weatherNow(place.lat, place.lon, signal);
    const u = w.units || {};
    const line1 = `**${place.name}**`;
    const line2 = `Temperature: **${w.temp}${u.temperature_2m || "°C"}** (feels like **${w.feels}${u.apparent_temperature || "°C"}**)`;
    const line3 = `Humidity: **${w.humid}${u.relative_humidity_2m || "%"}**, Wind: **${w.wind}${u.wind_speed_10m || " km/h"}**`;
    const line4 =
      w.precipChance == null
        ? ""
        : `Chance of precipitation (next hour): **${w.precipChance}%**`;
    return {
      kind: "weather",
      title: "Weather report",
      text: [line1, line2, line3, line4].filter(Boolean).join("\n"),
    };
  }

  const kb = localKbAnswer(q);
  if (kb) return kb;

  if (intent.type === "wiki") {
    const cleaned = q
      .replace(/^who is\s+/i, "")
      .replace(/^what is\s+/i, "")
      .replace(/^define\s+/i, "")
      .replace(/^meaning of\s+/i, "")
      .replace(/^tell me about\s+/i, "")
      .replace(/^explain\s+/i, "")
      .trim();
    try {
      const s = await wikiSummary(cleaned, signal);
      if (s.extract) {
        return {
          kind: "wiki",
          title: s.title,
          text: `${s.extract}\n\nSource: ${s.url || "Wikipedia"}`,
          meta: { url: s.url, thumbnail: s.thumbnail },
        };
      }
    } catch {
      // fall through
    }
  }

  const hits = await wikiSearch(q, signal);
  if (!hits.length) {
    return {
      kind: "fallback",
      title: "No direct source found",
      text:
        "I did not find a reliable public summary for that query.\n\nTry rephrasing with: `what is ...`, `who is ...`, or ask for weather like: `weather in Kochi`.",
    };
  }

  const top = hits[0].title;
  try {
    const s = await wikiSummary(top, signal);
    if (s.extract) {
      const also = hits
        .slice(1, 4)
        .map((h) => `• ${h.title}`)
        .join("\n");
      return {
        kind: "wiki",
        title: s.title,
        text: `${s.extract}\n\nRelated:\n${also}\n\nSource: ${s.url || "Wikipedia"}`,
        meta: { url: s.url, thumbnail: s.thumbnail },
      };
    }
  } catch {
    // ignore
  }

  return {
    kind: "search",
    title: "Search results",
    text: "I found these Wikipedia matches:\n\n" + hits.map((h) => `• ${h.title}: ${h.snippet}`).join("\n"),
  };
}

/* ---------------------- UI bits ---------------------- */
function Markdownish({ text }) {
  const parts = String(text || "").split("\n");
  return (
    <div className="space-y-2 leading-relaxed">
      {parts.map((line, idx) => (
        <p key={idx} className="whitespace-pre-wrap break-words">
          {renderBold(line)}
        </p>
      ))}
    </div>
  );
}

function renderBold(line) {
  const out = [];
  let i = 0;
  while (i < line.length) {
    const a = line.indexOf("**", i);
    if (a === -1) {
      out.push(line.slice(i));
      break;
    }
    const b = line.indexOf("**", a + 2);
    if (b === -1) {
      out.push(line.slice(i));
      break;
    }
    if (a > i) out.push(line.slice(i, a));
    out.push(
      <strong key={`${a}-${b}`} className="font-semibold text-white">
        {line.slice(a + 2, b)}
      </strong>
    );
    i = b + 2;
  }
  return out.map((chunk, idx) => <React.Fragment key={idx}>{chunk}</React.Fragment>);
}

function IconSend(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3.5 12L20.5 3.5L14 20.5L11.2 13.3L3.5 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconSpark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 2l1.2 4.2L17.4 8 13.2 9.2 12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M19 13l.8 2.8L22 17l-2.2.9L19 20l-.8-2.1L16 17l2.2-1.2L19 13z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M5 7h14M10 7V5.8c0-.9.7-1.6 1.6-1.6h.8c.9 0 1.6.7 1.6 1.6V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M8 7l1 14h6l1-14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function IconCopy(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M9 9h10v10H9V9Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------------------- Component ---------------------- */
/**
 * Usage:
 * <JokeModal isOpen={isOpen} onClose={() => setOpen(false)} />
 *
 * If you want it as a full page, just render it with isOpen=true and ignore onClose.
 */
export default function JokeModal({ isOpen = true, open, onClose }) {
  // Support both 'isOpen' and 'open' props for flexibility
  const actualOpen = isOpen !== undefined ? isOpen : open;
  const [messages, setMessages] = useState(() =>
    safeJson(localStorage.getItem(STORAGE_KEY), [
      {
        id: "m0",
        role: "assistant",
        ts: nowISO(),
        title: "BlueGPT",
        content:
          "Ask anything.\n\nTry:\n• **what is quantum computing**\n• **who is Ada Lovelace**\n• **weather in Bengaluru**\n\nFree sources only. Not a full ChatGPT model.",
      },
    ])
  );
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [toast, setToast] = useState(null);

  const abortRef = useRef(null);
  const listRef = useRef(null);
  const taRef = useAutosizeTextarea(input);

  const theme = useMemo(
    () => ({
      bg: "from-slate-950 via-blue-950 to-slate-950",
      card: "bg-white/6 border-white/10",
      card2: "bg-white/7 border-white/12",
      glow:
        "shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_18px_50px_rgba(0,102,255,0.25)]",
      btn: "bg-sky-500/20 hover:bg-sky-500/28 border-sky-300/20",
      ring: "focus:ring-2 focus:ring-sky-400/40 focus:outline-none",
    }),
    []
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isThinking, open]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1400);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!actualOpen) return;
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [actualOpen, onClose]);

  const canSend = input.trim().length > 0 && !isThinking;

  const pushMessage = (m) =>
    setMessages((prev) => [...prev, { ...m, id: `${Date.now()}_${Math.random()}` }]);

  const updateLastAssistant = (patch) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === "assistant") {
          copy[i] = { ...copy[i], ...patch };
          break;
        }
      }
      return copy;
    });
  };

  async function typeChunk(full) {
    const minDelay = 8;
    const maxDelay = 22;
    let built = "";
    for (let i = 0; i < full.length; i++) {
      built += full[i];
      if (i % 2 === 0 || i < 40) {
        updateLastAssistant({ content: built, meta: { typing: true } });
        await sleep(clamp(minDelay + Math.random() * 18, minDelay, maxDelay));
      }
    }
    updateLastAssistant({ content: built, meta: { typing: false } });
  }

  async function handleSend() {
    const q = input.trim();
    if (!q || isThinking) return;

    if (abortRef.current) abortRef.current.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    pushMessage({ role: "user", ts: nowISO(), content: q });
    setInput("");
    setIsThinking(true);

    pushMessage({
      role: "assistant",
      ts: nowISO(),
      title: "BlueGPT",
      content: "",
      meta: { typing: true },
    });

    try {
      const res = await answerQuestion(q, ac.signal);
      const header = res.title ? `**${res.title}**\n` : "";
      const body = res.text || "No answer found.";
      const final = `${header}\n${body}`.trim();
      await typeChunk(final);
      updateLastAssistant({
        meta: {
          typing: false,
          kind: res.kind,
          url: res?.meta?.url || "",
          thumbnail: res?.meta?.thumbnail || "",
        },
      });
    } catch (e) {
      const msg =
        e?.name === "AbortError"
          ? "Request cancelled."
          : "Something failed while fetching free sources. Try again.";
      await typeChunk(`**Error**\n${msg}`);
      updateLastAssistant({ meta: { typing: false, kind: "error" } });
    } finally {
      setIsThinking(false);
    }
  }

  function handleStop() {
    if (abortRef.current) abortRef.current.abort();
    setIsThinking(false);
  }

  function handleClear() {
    // close the modal 
    onClose?.();
    
    if (abortRef.current) abortRef.current.abort();
    const seed = [
      {
        id: "m0",
        role: "assistant",
        ts: nowISO(),
        title: "BlueGPT",
        content:
          "Chat cleared.\n\nTry:\n• **what is blockchain**\n• **who is Marie Curie**\n• **weather in Mumbai**",
      },
    ];
    setMessages(seed);
    setToast("Cleared");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied");
    } catch {
      setToast("Copy failed");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!actualOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={() => onClose?.()}
        aria-label="Close modal backdrop"
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6">
        <div
          className={cx(
            "relative w-full max-w-5xl overflow-hidden rounded-3xl border text-white",
            "bg-gradient-to-b",
            theme.bg,
            "border-white/10",
            theme.glow
          )}
        >
          {/* Background blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
            <div className="absolute top-40 -right-24 h-80 w-80 rounded-full bg-blue-600/16 blur-3xl animate-[pulse_7.5s_ease-in-out_infinite]" />
            <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl animate-[pulse_9s_ease-in-out_infinite]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.10),transparent_35%),radial-gradient(circle_at_80%_25%,rgba(59,130,246,0.12),transparent_40%)]" />
          </div>

          {/* Header */}
          <div className={cx("relative flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6", theme.card, "border-white/10")}>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/18 border border-sky-200/12">
                <IconSpark className="h-5 w-5 text-sky-300" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">
                  BlueGPT Assistant
                </div>
                <div className="text-xs text-white/60">
                  Wikipedia + Open-Meteo + Local KB. No keys.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isThinking ? (
                <button
                  onClick={handleStop}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    "bg-rose-500/12 hover:bg-rose-500/18 border-rose-200/18",
                    theme.ring
                  )}
                >
                  <span className="h-2 w-2 rounded-full bg-rose-300 animate-[pulse_1.2s_ease-in-out_infinite]" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={handleClear}
                  className={cx(
                    "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                    theme.btn,
                    theme.ring
                  )}
                >
                  <IconTrash className="h-4 w-4 text-sky-200" />
                  Clear
                </button>
              )}

              <button
                onClick={() => onClose?.()}
                className={cx(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                  "bg-white/6 hover:bg-white/10 border-white/10",
                  theme.ring
                )}
                aria-label="Close modal"
              >
                <IconClose className="h-4 w-4 text-white/80" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="relative grid grid-rows-[1fr_auto]">
            {/* Messages */}
            <div
              ref={listRef}
              className={cx(
                "h-[70vh] overflow-y-auto p-4 sm:p-6",
                "scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              )}
            >
              <div className="space-y-4">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  const meta = m.meta || {};
                  return (
                    <div key={m.id} className={cx("flex", isUser ? "justify-end" : "justify-start")}>
                      <div
                        className={cx(
                          "max-w-[92%] sm:max-w-[78%] rounded-2xl border px-4 py-3",
                          isUser
                            ? "bg-sky-500/12 border-sky-200/16"
                            : "bg-white/6 border-white/10",
                          "backdrop-blur"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {!isUser ? (
                              <>
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-sky-500/18 border border-sky-200/10">
                                  <IconSpark className="h-4 w-4 text-sky-300" />
                                </span>
                                <span className="text-xs font-medium text-white/70">
                                  {m.title || "Assistant"}
                                </span>
                                {meta.kind ? (
                                  <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] text-white/60 border border-white/10">
                                    {meta.kind}
                                  </span>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-xs font-medium text-white/60">
                                You
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/45">
                              {formatTime(m.ts)}
                            </span>
                            {!isUser && (m.content || "").trim().length > 0 ? (
                              <button
                                onClick={() => copyText(m.content)}
                                className={cx(
                                  "rounded-lg border px-2 py-1 text-[11px] text-white/70 hover:text-white",
                                  "bg-white/5 border-white/10 hover:bg-white/8",
                                  theme.ring
                                )}
                                title="Copy"
                              >
                                <span className="inline-flex items-center gap-1">
                                  <IconCopy className="h-3.5 w-3.5" />
                                  Copy
                                </span>
                              </button>
                            ) : null}
                          </div>
                        </div>

                        {!isUser && meta.thumbnail ? (
                          <div className="mb-3 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                            <img
                              src={meta.thumbnail}
                              alt=""
                              className="h-40 w-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : null}

                        {meta.typing ? (
                          <div className="relative">
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_1.4s_linear_infinite]" />
                            <div className="relative text-sm text-white/90">
                              <Markdownish text={m.content || " "} />
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-white/90">
                            <Markdownish text={m.content} />
                          </div>
                        )}

                        {!isUser && meta.url ? (
                          <div className="mt-3">
                            <a
                              href={meta.url}
                              target="_blank"
                              rel="noreferrer"
                              className={cx(
                                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
                                "bg-sky-500/12 hover:bg-sky-500/18 border-sky-200/14 text-sky-200",
                                theme.ring
                              )}
                            >
                              Source
                            </a>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-white/10 p-3 sm:p-4">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="flex-1">
                  <div className="relative">
                    <textarea
                      ref={taRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Ask anything. Try: what is … | who is … | weather in …"
                      rows={1}
                      className={cx(
                        "w-full resize-none rounded-2xl border bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35",
                        "border-white/10 focus:border-sky-300/30",
                        theme.ring
                      )}
                    />
                    <div className="pointer-events-none absolute right-3 top-3 text-[10px] text-white/35">
                      Enter to send. Shift+Enter new line.
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      "what is artificial intelligence",
                      "who is Alan Turing",
                      "weather in Bengaluru",
                      "define blockchain",
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setInput(chip)}
                        className={cx(
                          "rounded-full border px-3 py-1 text-[11px] text-white/70 hover:text-white",
                          "bg-white/5 border-white/10 hover:bg-white/8",
                          theme.ring
                        )}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={cx(
                    "group inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition",
                    canSend
                      ? "bg-sky-500/20 hover:bg-sky-500/28 border-sky-200/18"
                      : "bg-white/4 border-white/8 opacity-60 cursor-not-allowed",
                    theme.ring
                  )}
                  title="Send"
                >
                  <IconSend className="h-5 w-5 text-sky-200 group-hover:text-sky-100" />
                </button>
              </div>

              <div className="mt-3 text-[11px] text-white/45">
                Free-source assistant. Verify critical info.
              </div>
            </div>
          </div>

          {/* Toast */}
          {toast ? (
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="rounded-full border border-white/12 bg-slate-950/70 px-4 py-2 text-xs text-white/80 backdrop-blur">
                {toast}
              </div>
            </div>
          ) : null}

          {/* Keyframes */}
          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); opacity: .0; }
              30% { opacity: .6; }
              100% { transform: translateX(100%); opacity: .0; }
            }
            .animate-\\[shimmer_1\\.4s_linear_infinite\\]{
              animation: shimmer 1.4s linear infinite;
            }
            .scrollbar-thin::-webkit-scrollbar { width: 10px; }
            .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.10); border-radius: 999px; }
            .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
          `}</style>
        </div>
      </div>
    </div>
  );
}
