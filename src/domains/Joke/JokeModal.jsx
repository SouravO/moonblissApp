import React, { useEffect, useMemo, useRef, useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  closeOutline,
  refreshOutline,
  heartOutline,
  heart,
  shareOutline,
  happyOutline,
} from "ionicons/icons";

/**
 * BLISSS: General + period-support assistant (client-side)
 *
 * Free sources used (no API keys):
 * 1) Local curated knowledge base (offline, instant)
 * 2) Wikipedia REST summary endpoint (general concepts/terms)
 * 3) DuckDuckGo Instant Answer API (basic facts + topic summaries)
 *
 * Safety:
 * - Blocks sensitive topics (self-harm, sexual content involving minors, etc.)
 * - Medical: general info only. Shows red flags for urgent care.
 * - No personal data required.
 *
 * Persistence:
 * - Stores chat history + liked answers + mini profile in localStorage.
 */

const STORAGE_KEY = "blisss_chat_v2";
const LIKED_KEY = "blisss_liked_v2";
const PROFILE_KEY = "blisss_profile_v2";

const nowTs = () => new Date().toISOString();
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const safeJsonParse = (s, fallback) => {
  try {
    const v = JSON.parse(s);
    return v ?? fallback;
  } catch {
    return fallback;
  }
};

const normalize = (t) =>
  (t || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const hasAny = (text, arr) => arr.some((k) => text.includes(k));
const formatBullets = (items) => items.map((x) => `• ${x}`).join("\n");

/* -------------------------------
   Quick chips (broader now)
-------------------------------- */
const QUICK_CHIPS = [
  { label: "Bad cramps", q: "I have bad period cramps. What can I do?" },
  { label: "Heavy bleeding", q: "My bleeding is heavy. When is it concerning?" },
  { label: "Late period", q: "My period is late. What are possible reasons?" },
  { label: "Mood swings", q: "I feel very emotional before periods. Tips?" },
  { label: "Food cravings", q: "I crave sugar before periods. Any food tips?" },
  { label: "Sleep", q: "How can I sleep better during periods?" },
  { label: "Science", q: "Explain black holes in simple terms." },
  { label: "Study help", q: "Make a 7-day study plan for biology." },
];

/* -------------------------------
   Safety: Sensitive topic filter
-------------------------------- */
const SENSITIVE = {
  selfHarm: [
    "kill myself",
    "suicide",
    "self harm",
    "self-harm",
    "cut myself",
    "end my life",
    "want to die",
  ],
  minorsSexual: ["child porn", "underage sex", "minor nude", "nude minor"],
  explicitSex: ["porn", "sex video", "nudes", "onlyfans", "blowjob"],
  illegal: ["how to make a bomb", "make a bomb", "buy cocaine", "sell drugs"],
};

function checkSensitive(text) {
  const t = normalize(text);
  if (hasAny(t, SENSITIVE.minorsSexual)) return { block: true, type: "minorsSexual" };
  if (hasAny(t, SENSITIVE.illegal)) return { block: true, type: "illegal" };
  if (hasAny(t, SENSITIVE.selfHarm)) return { block: true, type: "selfHarm" };
  // Allow general sex-ed questions, but block explicit porn requests
  if (hasAny(t, SENSITIVE.explicitSex)) return { block: true, type: "explicitSex" };
  return { block: false, type: null };
}

function sensitiveReply(type) {
  if (type === "selfHarm") {
    return {
      text:
        "I can’t help with self-harm requests.\n\nIf you feel at risk right now, seek urgent help:\n• Call your local emergency number\n• Reach out to a trusted person nearby\n• If you are in India: AASRA 24/7 helpline: +91-22-27546669\n\nIf you want, tell me what you’re feeling in plain words and I can help you find safer next steps.",
      sources: [],
    };
  }
  if (type === "minorsSexual") {
    return { text: "I can’t help with any sexual content involving minors.", sources: [] };
  }
  if (type === "illegal") {
    return { text: "I can’t help with illegal wrongdoing. Ask for legal, safe alternatives.", sources: [] };
  }
  if (type === "explicitSex") {
    return {
      text: "I can’t help with explicit sexual content. If you want, ask a health or relationship question in non-explicit terms.",
      sources: [],
    };
  }
  return { text: "I can’t help with that request.", sources: [] };
}

/* -------------------------------
   Period red flags (kept)
-------------------------------- */
const RED_FLAGS = [
  "soaking through a pad/tampon every hour for 2+ hours",
  "fainting, severe dizziness, or signs of shock",
  "severe one-sided pelvic pain with nausea/vomiting",
  "fever with pelvic pain or foul-smelling discharge",
  "sudden severe pain or pain after a missed period",
  "bleeding between periods or after sex repeatedly",
  "period pain that is new and very intense",
];

/* -------------------------------
   Local knowledge base (expanded)
-------------------------------- */
const KB = [
  {
    id: "cramps",
    match: (t) =>
      hasAny(t, [
        "cramp",
        "cramps",
        "period pain",
        "painful period",
        "dysmenorrhea",
        "stomach pain",
        "lower belly pain",
      ]),
    title: "Cramps support",
    answer: ({ profile }) => {
      const dur = profile?.periodDurationDays || null;
      const cycle = profile?.cycleLengthDays || null;

      const selfCare = [
        "Heat: hot water bag or warm shower for 15–20 min.",
        "Gentle movement: short walk, light stretching, yoga.",
        "Hydration and warm fluids.",
        "Magnesium-rich foods (nuts, leafy greens).",
        "Sleep and reduce caffeine if it worsens symptoms.",
      ];

      const meds = [
        "If you can take them: NSAIDs like ibuprofen can help cramps when taken early (follow label).",
        "Avoid mixing medicines. Do not exceed dose limits on the pack.",
        "If you have ulcers, kidney disease, are on blood thinners, or are pregnant, ask a clinician first.",
      ];

      const whenConcerned = [
        "Pain that stops you from normal activity every cycle.",
        "Pain that suddenly got much worse than usual.",
        "Pain with fever, vomiting, fainting, or severe one-sided pain.",
      ];

      const context = [];
      if (cycle) context.push(`Noted: cycle length ${cycle} days.`);
      if (dur) context.push(`Noted: period duration ${dur} days.`);

      return [
        `Here are practical ways to reduce cramps:`,
        formatBullets(selfCare),
        "",
        `Medicine options (general info):`,
        formatBullets(meds),
        "",
        `When to get medical help:`,
        formatBullets(whenConcerned),
        context.length ? "" : null,
        context.length ? context.join(" ") : null,
      ]
        .filter(Boolean)
        .join("\n");
    },
    sourcesHint: ["Wikipedia: Dysmenorrhea (optional lookup)"],
    wikiTerms: ["Dysmenorrhea"],
  },
  {
    id: "heavy_bleeding",
    match: (t) =>
      hasAny(t, [
        "heavy",
        "soaking",
        "flooding",
        "too much blood",
        "menorrhagia",
        "pads every hour",
        "tampon every hour",
      ]),
    title: "Heavy bleeding guidance",
    answer: () => {
      const normalVsConcern = [
        "Some variation is normal. Flow is usually heaviest on day 1–2.",
        "Concerning signs: soaking through a pad/tampon every hour for 2+ hours, large clots repeatedly, dizziness, shortness of breath, fainting.",
        "If heavy flow lasts >7 days often, or you feel tired/pale, consider anemia screening.",
      ];
      const immediateSteps = [
        "Track: how many pads/tampons per day and for how many hours you soak through.",
        "Hydrate. Rest.",
        "If you feel faint, have chest pain, or cannot stay upright, seek urgent care.",
      ];
      return [
        `Heavy bleeding can happen, but some patterns need quick attention.`,
        "",
        `What’s normal vs concerning:`,
        formatBullets(normalVsConcern),
        "",
        `What to do now:`,
        formatBullets(immediateSteps),
        "",
        `If you want, tell me: how many pads/tampons per hour, how many days, and any dizziness.`,
      ].join("\n");
    },
    sourcesHint: ["Wikipedia: Menorrhagia (optional lookup)"],
    wikiTerms: ["Menorrhagia"],
  },
  {
    id: "late_period",
    match: (t) =>
      hasAny(t, [
        "late",
        "missed period",
        "period not coming",
        "no period",
        "delayed",
        "spotting",
      ]),
    title: "Late period reasons",
    answer: ({ profile }) => {
      const cycle = profile?.cycleLengthDays || 28;
      const reasons = [
        "Pregnancy (if sexually active).",
        "Stress, travel, sleep disruption.",
        "Sudden weight changes or intense exercise.",
        "Hormonal conditions like PCOS or thyroid issues.",
        "Recent illness or medications.",
      ];
      const nextSteps = [
        "If pregnancy is possible: consider a home test.",
        "Track dates: last period start date, usual cycle length.",
        "If you miss 2+ cycles (and not pregnant) or have severe pain, see a clinician.",
      ];
      return [
        `A late period is common. Typical cycle range varies.`,
        "",
        `Common reasons:`,
        formatBullets(reasons),
        "",
        `Next steps:`,
        formatBullets(nextSteps),
        "",
        `Your stored cycle length looks like ~${cycle} days (if that’s correct). Want to share your last period start date?`,
      ].join("\n");
    },
    sourcesHint: [
      "Wikipedia: Menstrual cycle (optional lookup)",
      "Wikipedia: Polycystic ovary syndrome (optional lookup)",
    ],
    wikiTerms: ["Menstrual cycle", "Polycystic ovary syndrome"],
  },
  {
    id: "mood_pms",
    match: (t) =>
      hasAny(t, [
        "mood",
        "mood swings",
        "irritable",
        "sad",
        "anxiety",
        "pms",
        "pmdd",
        "stress",
        "overthinking",
      ]),
    title: "Mood support",
    answer: () => {
      const tips = [
        "Stabilize blood sugar: regular meals, protein + fiber.",
        "Light movement daily.",
        "Reduce caffeine/alcohol if it worsens anxiety.",
        "Sleep: consistent schedule for 5–7 days.",
        "Breathing: 4-7-8 breathing for 3 minutes.",
        "If it helps: write a 2-minute brain dump then pick 1 small next action.",
      ];
      const whenHelp = [
        "If symptoms severely impact work/relationships.",
        "If you feel hopeless or have thoughts of self-harm. Seek urgent help.",
        "If symptoms are predictable monthly and intense: ask about PMDD support.",
      ];
      return [
        `Mood changes can happen with PMS or stress. Practical steps:`,
        "",
        formatBullets(tips),
        "",
        `When to get extra support:`,
        formatBullets(whenHelp),
      ].join("\n");
    },
    sourcesHint: [
      "Wikipedia: Premenstrual syndrome (optional lookup)",
      "Wikipedia: Premenstrual dysphoric disorder (optional lookup)",
    ],
    wikiTerms: ["Premenstrual syndrome", "Premenstrual dysphoric disorder"],
  },
  {
    id: "food_nutrition",
    match: (t) =>
      hasAny(t, [
        "food",
        "diet",
        "nutrition",
        "craving",
        "cravings",
        "what should i eat",
        "meal plan",
        "protein",
        "iron",
        "hydration",
      ]),
    title: "Food and nutrition support",
    answer: () => {
      const basics = [
        "Protein each meal (eggs, dal, tofu, chicken, yogurt).",
        "Fiber + color (vegetables, fruits).",
        "Iron sources if heavy flow: spinach, lentils, beans, meat. Pair with vitamin C (lemon, amla) for absorption.",
        "Hydration: water + electrolytes if you feel weak.",
        "Limit very sugary spikes if you crash after.",
      ];
      const simpleDay = [
        "Breakfast: idli/dosa + sambar OR oats + yogurt + fruit.",
        "Lunch: rice/roti + dal + veg + curd.",
        "Snack: nuts + fruit OR chana.",
        "Dinner: roti + paneer/tofu + veg soup.",
      ];
      return [
        `Food tips (general):`,
        "",
        formatBullets(basics),
        "",
        `Simple sample day:`,
        formatBullets(simpleDay),
        "",
        `Tell me your goal (energy, cramps, weight loss, muscle, anemia) and cuisine preference.`,
      ].join("\n");
    },
    sourcesHint: ["Wikipedia: Iron deficiency anemia (optional lookup)"],
    wikiTerms: ["Iron deficiency anemia"],
  },
  {
    id: "science_explain",
    match: (t) =>
      hasAny(t, [
        "explain",
        "what is",
        "define",
        "meaning of",
        "science",
        "physics",
        "chemistry",
        "biology",
        "black hole",
        "quantum",
        "dna",
      ]),
    title: "Explain a concept",
    answer: () => {
      return [
        `Ask your concept in 1 line and tell me your level:`,
        formatBullets(["School", "College", "Beginner adult", "Advanced"]),
        "",
        `I will answer in:`,
        formatBullets(["Simple explanation", "Analogy", "Key facts", "Common misconceptions", "2 sources"]),
      ].join("\n");
    },
    sourcesHint: [],
    wikiTerms: [],
  },
  {
    id: "general_help",
    match: () => true,
    title: "General assistant",
    answer: () => {
      const options = [
        "Periods: cramps, heavy bleeding, late period, mood swings",
        "Food: meal ideas, cravings, nutrition basics",
        "Mood: stress, anxiety, routines",
        "Science: explain concepts, quick study plans",
        "Productivity: plans, checklists, summaries",
      ];
      return [
        `Ask any non-sensitive question. I’ll answer with free public sources when useful.`,
        "",
        `Common topics:`,
        formatBullets(options),
        "",
        `Tip: If you ask about a specific term (example: “endometriosis”, “black hole”), I can fetch a short public summary.`,
      ].join("\n");
    },
    sourcesHint: [],
    wikiTerms: [],
  },
];

/* -------------------------------
   Free sources: Wikipedia + DDG
-------------------------------- */
async function fetchWikipediaSummary(term) {
  const t = (term || "").trim();
  if (!t) return null;

  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(t)}`;
  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const data = await res.json();
  const extract = data?.extract || "";
  const page = data?.content_urls?.desktop?.page || "";
  const title = data?.title || t;
  if (!extract) return null;

  return { title, extract, url: page, source: "Wikipedia" };
}

async function fetchDuckDuckGoInstantAnswer(query) {
  const q = (query || "").trim();
  if (!q) return null;

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(
    q
  )}&format=json&no_redirect=1&no_html=1&skip_disambig=0`;

  const res = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });
  if (!res.ok) return null;

  const data = await res.json();
  const abstractText = data?.AbstractText || "";
  const abstractURL = data?.AbstractURL || "";
  const heading = data?.Heading || "";

  if (!abstractText) return null;

  return {
    title: heading || q,
    extract: abstractText,
    url: abstractURL || "",
    source: "DuckDuckGo",
  };
}

/* -------------------------------
   Query routing for sources
-------------------------------- */
function looksLikeGeneralInfoQuestion(tnorm) {
  return (
    tnorm.startsWith("what is ") ||
    tnorm.startsWith("define ") ||
    tnorm.includes("meaning of") ||
    tnorm.includes("tell me about") ||
    tnorm.includes("explain ")
  );
}

function pickWikiTermsFromUser(text) {
  const t = normalize(text);

  const TERMS = [
    "endometriosis",
    "polycystic ovary syndrome",
    "pcos",
    "premenstrual syndrome",
    "pms",
    "pmdd",
    "dysmenorrhea",
    "menorrhagia",
    "menstruation",
    "menstrual cycle",
    "ovulation",
    "migraine",
    "menstrual migraine",
    "black hole",
    "photosynthesis",
    "dna",
    "atom",
    "gravity",
  ];

  const hits = TERMS.filter((k) => t.includes(k));
  return hits.map((h) => {
    if (h === "pcos") return "Polycystic ovary syndrome";
    if (h === "pms") return "Premenstrual syndrome";
    return h;
  });
}

function buildAssistantReply({ text, profile }) {
  const t = normalize(text);

  const redFlagHit = hasAny(t, [
    "soaking",
    "faint",
    "fainted",
    "passed out",
    "severe",
    "unbearable",
    "fever",
    "vomit",
    "vomiting",
    "one sided",
    "one-sided",
    "chest pain",
    "shortness of breath",
    "pregnant",
    "positive test",
  ]);

  const kb = KB.find((x) => x.match(t)) || KB[KB.length - 1];
  const base = kb.answer({ profile });

  const red = redFlagHit
    ? [
        "",
        `⚠️ Red flags: if you have any of these, seek urgent medical care:`,
        formatBullets(RED_FLAGS),
      ].join("\n")
    : "";

  return { kb, text: `${base}${red}` };
}

/* -------------------------------
   UI components
-------------------------------- */
const Bubble = ({ role, children }) => {
  const isUser = role === "user";
  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={[
          "max-w-[86%] rounded-2xl px-4 py-3 whitespace-pre-wrap leading-relaxed text-[14px]",
          isUser
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20"
            : "bg-slate-800/60 text-slate-100 border border-blue-500/20 backdrop-blur-sm",
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
};

const BlisssModal = ({ isOpen, onClose }) => {
  const [liked, setLiked] = useState({});
  const [busy, setBusy] = useState(false);

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(PROFILE_KEY);
    return safeJsonParse(saved, { cycleLengthDays: 28, periodDurationDays: 5 });
  });

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = safeJsonParse(saved, null);
    if (Array.isArray(parsed) && parsed.length) return parsed;

    return [
      {
        id: "m0",
        role: "assistant",
        ts: nowTs(),
        text:
          "Hi. I’m BLISSS.\nAsk any non-sensitive question (periods, mood, food, science, study help).\n\nTip: For health topics, share symptoms + duration + severity.",
        sources: [],
      },
    ];
  });

  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(LIKED_KEY);
    const parsed = safeJsonParse(saved, {});
    setLiked(parsed && typeof parsed === "object" ? parsed : {});
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  // scroll-to-bottom on new message
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, isOpen]);

  // autofocus input
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus?.(), 180);
  }, [isOpen]);

  // auto-grow textarea (chatbot feel)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const toggleLikeMessage = (msgId) => {
    const next = { ...liked, [msgId]: !liked[msgId] };
    if (!next[msgId]) delete next[msgId];
    setLiked(next);
    localStorage.setItem(LIKED_KEY, JSON.stringify(next));
  };

  const shareLastAssistant = async () => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    if (!last) return;

    const payload = `BLISSS says:\n\n${last.text}\n${
      last.sources?.length
        ? `\nSources:\n${last.sources
            .map((s) => `- ${s.title}${s.url ? `: ${s.url}` : ""}`)
            .join("\n")}`
        : ""
    }`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "BLISSS", text: payload });
      } catch {
        // ignore
      }
    } else {
      await navigator.clipboard.writeText(payload);
      alert("Copied to clipboard!");
    }
  };

  const clearChat = () => {
    const fresh = [
      {
        id: `m_${Date.now()}`,
        role: "assistant",
        ts: nowTs(),
        text:
          "Chat cleared.\nAsk anything non-sensitive.\nExample: “Explain photosynthesis” or “Cramps day 1-2, pain 7/10.”",
        sources: [],
      },
    ];
    setMessages(fresh);
    setShowQuick(true);
  };

  const send = async (text) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || busy) return;

    setBusy(true);
    setShowQuick(false);

    // Safety check first
    const sensitive = checkSensitive(trimmed);
    if (sensitive.block) {
      const blocked = sensitiveReply(sensitive.type);
      const userMsg = {
        id: `u_${Date.now()}`,
        role: "user",
        ts: nowTs(),
        text: trimmed,
        sources: [],
      };
      const assistantMsg = {
        id: `a_${Date.now() + 1}`,
        role: "assistant",
        ts: nowTs(),
        text: blocked.text,
        sources: blocked.sources || [],
      };
      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setInput("");
      setBusy(false);
      return;
    }

    const userMsg = {
      id: `u_${Date.now()}`,
      role: "user",
      ts: nowTs(),
      text: trimmed,
      sources: [],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Base response from local KB
    const { kb, text: baseText } = buildAssistantReply({ text: trimmed, profile });

    // Free-source lookup logic
    const tnorm = normalize(trimmed);
    const userTerms = pickWikiTermsFromUser(trimmed);

    const wantsDefinition = looksLikeGeneralInfoQuestion(tnorm);
    const shouldLookup = userTerms.length > 0 || wantsDefinition;

    let sources = [];
    let append = "";

    if (shouldLookup) {
      const termsToTry = [...new Set([...(userTerms || []), ...(kb.wikiTerms || [])])].slice(0, 2);

      // 1) Wikipedia
      for (const term of termsToTry) {
        try {
          const summary = await fetchWikipediaSummary(term);
          if (summary) {
            sources.push({ title: `${summary.title} (Wikipedia)`, url: summary.url });
            append += `\n\nPublic summary (Wikipedia: ${summary.title}):\n${summary.extract}`;
            break;
          }
        } catch {
          // ignore
        }
      }

      // 2) DuckDuckGo IA fallback
      if (!sources.length) {
        try {
          const ddg = await fetchDuckDuckGoInstantAnswer(trimmed);
          if (ddg) {
            sources.push({
              title: `${ddg.title} (DuckDuckGo Instant Answer)`,
              url: ddg.url || "",
            });
            append += `\n\nPublic summary (DuckDuckGo):\n${ddg.extract}`;
          }
        } catch {
          // ignore
        }
      }

      // 3) If both fail
      if (!sources.length) {
        append += `\n\nI could not fetch a public summary right now. Try rephrasing or ask for a simpler explanation.`;
      }
    }

    const assistantMsg = {
      id: `a_${Date.now() + 1}`,
      role: "assistant",
      ts: nowTs(),
      text: `${baseText}${append}`,
      sources,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setBusy(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const lastAssistantId = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return last?.id || null;
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center">
      {/* Keyboard-safe + chatbot layout */}
      <div
        className="w-full sm:max-w-md bg-slate-900 flex flex-col border border-blue-500/20"
        style={{
          height: "100dvh",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <style>{`
          @keyframes pulse-dot {
            0%, 100% { transform: scale(1); opacity: .7; }
            50% { transform: scale(1.25); opacity: 1; }
          }
          .pulse-dot { animation: pulse-dot 0.9s ease-in-out infinite; }

          /* Better mobile typing behavior */
          textarea { -webkit-text-size-adjust: 100%; }

          /* iOS momentum scrolling */
          .chat-scroll { -webkit-overflow-scrolling: touch; }
        `}</style>

        {/* Header: sticky, never overlaps */}
        <header className="sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <IonIcon icon={happyOutline} className="text-white text-2xl" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-white font-bold text-base truncate">BLISSS</h2>
                {busy ? <span className="w-1.5 h-1.5 rounded-full bg-white pulse-dot" /> : null}
              </div>
              <p className="text-xs text-white/70">
                General + period support
                {busy ? <span className="ml-2 text-white/70 hidden sm:inline">typing</span> : null}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center hover:bg-white/25 transition"
            aria-label="Close"
          >
            <IonIcon icon={closeOutline} className="text-white text-2xl" />
          </button>
        </header>

        {/* Mini profile: sticky under header */}
        {/* <div className="sticky top-[64px] z-20 bg-slate-900/92 backdrop-blur border-b border-blue-500/20 px-4 py-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-slate-200/85">
              Cycle: <span className="text-slate-100 font-semibold">{profile.cycleLengthDays}d</span>
              <span className="mx-2 text-slate-500">•</span>
              Duration:{" "}
              <span className="text-slate-100 font-semibold">{profile.periodDurationDays}d</span>
            </div>
            <div className="text-[11px] text-slate-300/70 hidden sm:block">
              General info only. Emergencies: seek care.
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 text-blue-200 border border-blue-500/20 hover:bg-slate-800/80 transition"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    cycleLengthDays: clamp((p.cycleLengthDays || 28) - 1, 20, 45),
                  }))
                }
                aria-label="Cycle minus"
              >
                Cycle -
              </button>
              <button
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 text-blue-200 border border-blue-500/20 hover:bg-slate-800/80 transition"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    cycleLengthDays: clamp((p.cycleLengthDays || 28) + 1, 20, 45),
                  }))
                }
                aria-label="Cycle plus"
              >
                Cycle +
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 text-blue-200 border border-blue-500/20 hover:bg-slate-800/80 transition"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    periodDurationDays: clamp((p.periodDurationDays || 5) - 1, 1, 12),
                  }))
                }
                aria-label="Duration minus"
              >
                Dur -
              </button>
              <button
                className="text-xs px-3 py-1.5 rounded-xl bg-slate-800/60 text-blue-200 border border-blue-500/20 hover:bg-slate-800/80 transition"
                onClick={() =>
                  setProfile((p) => ({
                    ...p,
                    periodDurationDays: clamp((p.periodDurationDays || 5) + 1, 1, 12),
                  }))
                }
                aria-label="Duration plus"
              >
                Dur +
              </button>
            </div>
          </div>
        </div> */}

        {/* Chat area: scrollable */}
        <div
          ref={listRef}
          className="chat-scroll flex-1 overflow-y-auto px-4 py-4 space-y-4"
        >
          {messages.map((m) => (
            <div key={m.id} className="space-y-2">
              <Bubble role={m.role}>
                <div className="space-y-2">
                  <div>{m.text}</div>

                  {/* Sources (kept) */}
                  {m.role === "assistant" && Array.isArray(m.sources) && m.sources.length ? (
                    <div className="text-[12px] text-slate-200/80 border-t border-blue-500/15 pt-2">
                      <div className="font-semibold text-slate-100/90 mb-1">Sources</div>
                      <ul className="list-disc pl-5 space-y-1">
                        {m.sources.map((s, idx) => (
                          <li key={`${m.id}_s_${idx}`}>
                            {s.url ? (
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-300 hover:underline"
                              >
                                {s.title}
                              </a>
                            ) : (
                              <span className="text-slate-200/80">{s.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </Bubble>

              {/* Like/save (kept) */}
              {m.role === "assistant" ? (
                <div className="flex items-center gap-2 px-1">
                  <button
                    onClick={() => toggleLikeMessage(m.id)}
                    className={[
                      "px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border backdrop-blur-sm",
                      liked[m.id]
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-300/20"
                        : "bg-slate-800/40 text-blue-200 border-blue-500/20 hover:bg-slate-800/60",
                    ].join(" ")}
                    aria-label="Save answer"
                  >
                    <IonIcon icon={liked[m.id] ? heart : heartOutline} className="text-base" />
                    {liked[m.id] ? "Saved" : "Save"}
                  </button>
                </div>
              ) : null}
            </div>
          ))}

          {/* Quick chips (kept), inside scroll so it never gets hidden behind composer */}
          {showQuick ? (
            <div className="pt-2">
              <div className="flex flex-wrap gap-2">
                {QUICK_CHIPS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => send(c.q)}
                    className="text-xs px-3 py-2 rounded-xl bg-slate-800/60 text-blue-200 border border-blue-500/20 hover:bg-slate-800/80 transition"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {/* spacer so last message is never hidden behind sticky composer */}
          <div className="h-28" />
        </div>

        {/* Composer: sticky bottom, keyboard-safe */}
        <div
          className="sticky bottom-0 z-30 bg-slate-900/92 backdrop-blur border-t border-blue-500/20 px-4 py-3"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder='Ask anything non-sensitive. Example: “Explain gravity” or “Food tips for cramps”.'
            className="w-full resize-none rounded-2xl bg-slate-800/60 border border-blue-500/20 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-400/80 outline-none focus:ring-2 focus:ring-blue-500/30"
          />

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => send()}
              disabled={busy || !input.trim()}
              className={[
                "flex-1 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg active:scale-[0.99] text-sm",
                busy || !input.trim()
                  ? "bg-slate-700/40 text-slate-300 cursor-not-allowed border border-blue-500/10"
                  : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/20",
              ].join(" ")}
            >
              Send
            </button>

            <button
              onClick={clearChat}
              className="px-3 py-3 rounded-xl font-semibold flex items-center justify-center bg-slate-800/60 text-blue-200 hover:bg-slate-800/80 transition border border-blue-500/20"
              aria-label="Clear"
              title="Clear chat"
            >
              <IonIcon icon={refreshOutline} className="text-lg" />
            </button>

            <button
              onClick={shareLastAssistant}
              className="px-3 py-3 rounded-xl font-semibold flex items-center justify-center bg-slate-800/60 text-blue-200 hover:bg-slate-800/80 transition border border-blue-500/20"
              aria-label="Share"
              title="Share answer"
            >
              <IonIcon icon={shareOutline} className="text-lg" />
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300/70 gap-2 mt-2">
            <div className="truncate">
              Saved answers:{" "}
              <span className="text-slate-100 font-semibold">
                {Object.keys(liked || {}).length}
              </span>
            </div>
            <button
              onClick={() => setShowQuick((s) => !s)}
              className="text-blue-300 hover:underline whitespace-nowrap"
              type="button"
            >
              {showQuick ? "Hide" : "Show"}
            </button>
          </div>

          <div className="mt-2 bg-gradient-to-r from-blue-600/15 to-cyan-600/10 rounded-xl p-3 border border-blue-500/20 backdrop-blur-sm">
            <p className="text-center text-xs text-blue-100/80 font-medium">
              BLISSS answers with general guidance and free public sources when available. For emergencies, seek urgent medical care.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlisssModal;
