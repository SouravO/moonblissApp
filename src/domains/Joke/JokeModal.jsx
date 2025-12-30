import React, { useEffect, useMemo, useRef, useState } from "react";
import { useModal } from "@/infrastructure/context/ModalContext";

/**
 * Premium Chat Assistant UI
 * Requires backend at POST /api/chat with SSE streaming
 * Request: { model, messages: [{role, content}] }
 * SSE events: delta, done, error
 */

const API_URL = "/api/chat";
const DEFAULT_MODEL = "bliss-ai-v1";
const LS_KEY = "premium_chat_v1";

// Utilities
const uid = () => `${Date.now()}_${Math.random().toString(16).slice(2)}`;
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

function fmtTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function useAutoGrowTextarea(value) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);
  return ref;
}

// Markdown renderer
function splitIntoBlocks(s) {
  const out = [];
  const re = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    const before = s.slice(last, m.index);
    if (before.trim()) out.push({ type: "text", content: before });
    out.push({ type: "code", lang: (m[1] || "").trim(), content: m[2] || "" });
    last = m.index + m[0].length;
  }
  const tail = s.slice(last);
  if (tail.trim()) out.push({ type: "text", content: tail });
  if (out.length === 0) out.push({ type: "text", content: s });
  return out;
}

function renderInlineBold(line) {
  const parts = [];
  let i = 0;
  while (i < line.length) {
    const a = line.indexOf("**", i);
    if (a === -1) {
      parts.push({ t: "text", v: line.slice(i) });
      break;
    }
    const b = line.indexOf("**", a + 2);
    if (b === -1) {
      parts.push({ t: "text", v: line.slice(i) });
      break;
    }
    if (a > i) parts.push({ t: "text", v: line.slice(i, a) });
    parts.push({ t: "bold", v: line.slice(a + 2, b) });
    i = b + 2;
  }
  return parts.map((p, idx) =>
    p.t === "bold" ? (
      <strong key={idx} className="font-semibold text-white">
        {p.v}
      </strong>
    ) : (
      <React.Fragment key={idx}>{p.v}</React.Fragment>
    )
  );
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  }
  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="text-xs font-medium text-slate-300">
          {lang || "code"}
        </div>
        <button
          onClick={copy}
          className="text-xs font-medium text-slate-300 hover:text-white transition-colors rounded-lg px-3 py-1.5 border border-white/10 bg-white/[0.05] hover:bg-white/[0.1]"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-slate-100 font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Markdown({ text }) {
  const blocks = useMemo(() => splitIntoBlocks(String(text || "")), [text]);
  return (
    <div className="space-y-4 leading-relaxed text-[15px]">
      {blocks.map((b, i) => {
        if (b.type === "code")
          return <CodeBlock key={i} code={b.content} lang={b.lang} />;
        return (
          <p key={i} className="whitespace-pre-wrap break-words text-slate-100">
            {renderInlineBold(b.content)}
          </p>
        );
      })}
    </div>
  );
}

// Network utilities
function classifyFetchError(err) {
  const msg = String(err?.message || err || "Failed to fetch");
  const hints = [
    "Check DevTools → Network → the /api/chat request",
    "Ensure backend is running and reachable",
    "If using HTTPS frontend with HTTP backend, use same-origin or HTTPS backend",
    "If cross-origin, enable CORS + OPTIONS on backend",
  ];
  return { title: "Connection Failed", detail: msg, hints };
}

async function fetchWithTimeout(url, options, timeoutMs = 45000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

// SSE streaming
function streamChat({ url, body, signal, onDelta, onDone, onError }) {
  const chained = new AbortController();
  const abortBoth = () => {
    try {
      chained.abort();
    } catch {}
  };
  if (signal) {
    if (signal.aborted) abortBoth();
    signal.addEventListener("abort", abortBoth, { once: true });
  }

  fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: chained.signal,
    },
    45000
  )
    .then(async (res) => {
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        const statusLine = `HTTP ${res.status} ${res.statusText || ""}`.trim();
        throw new Error(`${statusLine}${t ? `\n${t}` : ""}`);
      }

      const contentType = res.headers.get("content-type") || "";
      const isLikelySSE = contentType.includes("text/event-stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      if (!isLikelySSE) {
        const chunks = [];
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value, { stream: true }));
        }
        const full = chunks.join("") + decoder.decode();
        onError?.(
          `Backend not streaming SSE.\nExpected: text/event-stream\nGot: ${
            contentType || "unknown"
          }\n\nResponse:\n${full.slice(0, 2000)}`
        );
        onDone?.();
        return;
      }

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          const evLine = lines.find((l) => l.startsWith("event:"));
          const dataLine = lines.find((l) => l.startsWith("data:"));
          const ev = (evLine || "event: message").slice(6).trim();
          const raw = (dataLine || "data: {}").slice(5).trim();

          let payload = {};
          try {
            payload = JSON.parse(raw);
          } catch {
            payload = {};
          }

          if (ev === "delta") onDelta?.(payload.delta || "");
          if (ev === "done") onDone?.();
          if (ev === "error") onError?.(payload.message || "Stream error");
        }
      }

      onDone?.();
    })
    .catch((e) => {
      if (e?.name === "AbortError") return;
      const info = classifyFetchError(e);
      onError?.(
        `**${info.title}**\n\nURL: ${url}\nReason: ${
          info.detail
        }\n\nFix checklist:\n${info.hints.map((h) => `• ${h}`).join("\n")}`
      );
    })
    .finally(() => {
      if (signal) signal.removeEventListener?.("abort", abortBoth);
    });
}

// System prompt
const PERIOD_ASSISTANT_SYSTEM =
  `You are MoonBliss Assistant, a helpful menstrual wellness guide.
Answer questions directly about periods, cramps, cycle phases, PMS/PMDD, discharge, spotting, contraception, pregnancy risk, PCOS/endometriosis, hygiene, nutrition, exercise, mood, sleep, and products.

Safety: This is not medical diagnosis. For severe symptoms, advise medical care. Ask clarifying questions only when needed.

Red flags (prompt urgent care): heavy bleeding soaking pads hourly 2+ hours, fainting, severe one-sided pelvic pain, shoulder pain, pregnancy + bleeding/severe cramps, fever with foul discharge, severe pain with sex, sudden severe pain or anemia signs.

Style: Short paragraphs, bullet points when helpful, practical "what to do now" + "when to see doctor".`.trim();

export default function App({ isOpen = true, onClose = () => {}, showInput = true }) {
  const { openModal, closeModal } = useModal();
  
  const [state, setState] = useState(() =>
    safeJson(localStorage.getItem(LS_KEY), {
      activeId: null,
      chats: [],
      settings: { periodMode: true },
    })
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toast, setToast] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);

  const abortRef = useRef(null);
  const listRef = useRef(null);
  const taRef = useAutoGrowTextarea(input);

  const periodMode = !!state?.settings?.periodMode;

  // Track modal open/close state
  useEffect(() => {
    if (isOpen) {
      openModal();
    } else {
      closeModal();
    }
  }, [isOpen, openModal, closeModal]);

  // Initialize
  useEffect(() => {
    if (!state.settings) {
      setState((s) => ({ ...s, settings: { periodMode: true } }));
    }
  }, [state.settings]);

  useEffect(() => {
    if (state.chats.length > 0 && state.activeId) return;

    if (state.chats.length > 0 && !state.activeId) {
      setState((s) => ({ ...s, activeId: s.chats[0].id }));
      return;
    }

    const id = uid();
    const seed = {
      id,
      title: "New conversation",
      createdAt: nowISO(),
      messages: [
        {
          id: uid(),
          role: "assistant",
          ts: nowISO(),
          content:
            "Hi! 👋\n\nI'm your AI assistant. Ask me anything about menstrual wellness, health, or general topics.\n\n**Quick tips:**\n• Press Enter to send\n• Shift+Enter for new line\n• Use Stop to halt responses\n• Regenerate to retry answers",
        },
      ],
    };
    setState((s) => ({ ...s, activeId: id, chats: [seed] }));
  }, [state.activeId, state.chats.length]);

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.activeId, state.chats, isStreaming]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const activeChat = useMemo(() => {
    return state.chats.find((c) => c.id === state.activeId) || state.chats[0];
  }, [state]);

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setToast("Response stopped");
  }

  function setActive(id) {
    if (isStreaming) stop();
    setState((s) => ({ ...s, activeId: id }));
  }

  function newChat() {
    if (isStreaming) stop();
    const id = uid();
    const chat = {
      id,
      title: "New conversation",
      createdAt: nowISO(),
      messages: [
        {
          id: uid(),
          role: "assistant",
          ts: nowISO(),
          content: "Hi! How can I help you today?",
        },
      ],
    };
    setState((s) => ({ ...s, activeId: id, chats: [chat, ...s.chats] }));
  }

  function deleteChat(id) {
    if (isStreaming && state.activeId === id) stop();
    setState((s) => {
      const next = s.chats.filter((c) => c.id !== id);
      const nextActive = s.activeId === id ? next[0]?.id || null : s.activeId;
      return { ...s, activeId: nextActive, chats: next };
    });
    setToast("Chat deleted");
  }

  function renameFromFirstUser(chatId) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== chatId) return c;
        if (c.title && c.title !== "New conversation") return c;
        const firstUser = c.messages.find((m) => m.role === "user");
        if (!firstUser) return c;
        const t =
          String(firstUser.content || "")
            .trim()
            .slice(0, 40) || "Conversation";
        return { ...c, title: t };
      });
      return { ...s, chats };
    });
  }

  function pushMsg(role, content) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        return {
          ...c,
          messages: [...c.messages, { id: uid(), role, ts: nowISO(), content }],
        };
      });
      return { ...s, chats };
    });
  }

  function updateLastAssistant(delta) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        const ms = [...c.messages];
        for (let i = ms.length - 1; i >= 0; i--) {
          if (ms[i].role === "assistant") {
            ms[i] = { ...ms[i], content: (ms[i].content || "") + delta };
            break;
          }
        }
        return { ...c, messages: ms };
      });
      return { ...s, chats };
    });
  }

  function replaceLastAssistant(content) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        const ms = [...c.messages];
        for (let i = ms.length - 1; i >= 0; i--) {
          if (ms[i].role === "assistant") {
            ms[i] = { ...ms[i], content };
            break;
          }
        }
        return { ...c, messages: ms };
      });
      return { ...s, chats };
    });
  }

  function canSend() {
    return input.trim().length > 0 && !isStreaming;
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function buildMessagesForAPI({ justSentUserText, fromMessages }) {
    const base = (fromMessages || [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    const sys = periodMode
      ? [{ role: "system", content: PERIOD_ASSISTANT_SYSTEM }]
      : [
          {
            role: "system",
            content:
              "You are a helpful assistant. Answer directly and clearly.",
          },
        ];

    if (justSentUserText)
      base.push({ role: "user", content: justSentUserText });

    return [...sys, ...base];
  }

  function send() {
    const q = input.trim();
    if (!q || isStreaming) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setInput("");
    setIsStreaming(true);

    pushMsg("user", q);
    pushMsg("assistant", "");

    const messages = buildMessagesForAPI({
      justSentUserText: q,
      fromMessages: activeChat?.messages || [],
    });

    streamChat({
      url: API_URL,
      body: { model, messages },
      signal: ac.signal,
      onDelta: (d) => updateLastAssistant(d),
      onDone: () => {
        setIsStreaming(false);
        renameFromFirstUser(state.activeId);
      },
      onError: (msg) => {
        setIsStreaming(false);
        replaceLastAssistant(msg || "**Error**\nRequest failed");
      },
    });
  }

  function regenerate() {
    if (isStreaming) return;

    const msgs = activeChat?.messages || [];
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === "user") {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx < 0) return;

    const trimmed = msgs.slice(0, lastUserIdx + 1);

    setState((s) => {
      const chats = s.chats.map((c) =>
        c.id === s.activeId ? { ...c, messages: trimmed } : c
      );
      return { ...s, chats };
    });

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsStreaming(true);

    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        return {
          ...c,
          messages: [
            ...trimmed,
            { id: uid(), role: "assistant", ts: nowISO(), content: "" },
          ],
        };
      });
      return { ...s, chats };
    });

    const messages = buildMessagesForAPI({
      justSentUserText: null,
      fromMessages: trimmed,
    });

    streamChat({
      url: API_URL,
      body: { model, messages },
      signal: ac.signal,
      onDelta: (d) => updateLastAssistant(d),
      onDone: () => setIsStreaming(false),
      onError: (msg) => {
        setIsStreaming(false);
        replaceLastAssistant(msg || "**Error**\nRequest failed");
      },
    });
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied to clipboard");
    } catch {
      setToast("Copy failed");
    }
  }

  function togglePeriodMode() {
    setState((s) => ({
      ...s,
      settings: {
        ...(s.settings || {}),
        periodMode: !(s.settings || {}).periodMode,
      },
    }));
    setToast(!periodMode ? "Period Mode enabled" : "Period Mode disabled");
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden z-50">
      {/* Mobile header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 backdrop-blur-xl bg-slate-900/50 lg:hidden safe-top">
        <button
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] transition-all"
          title="Close chat"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="text-sm font-medium text-slate-200 truncate max-w-[50%]">
          {activeChat?.title || "Chat"}
        </div>
        <button
          onClick={newChat}
          className="px-3 py-2 rounded-xl border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-sm font-medium transition-all"
        >
          + New
        </button>
      </div>

      <div className="h-full grid grid-cols-1 lg:grid-cols-[340px_1fr]">
        {/* Sidebar */}
        <div className="border-r border-white/10 bg-slate-950/50 backdrop-blur-xl overflow-hidden flex flex-col">
          {/* Sidebar header */}
          <div className="p-4 border-b border-white/10">
            <button
              onClick={newChat}
              className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 px-4 py-3 text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">+</span>
              New Conversation
            </button>
          </div>

          {/* Settings */}
          <div className="p-4 space-y-3 border-b border-white/10">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              >
                <option value="bliss-ai-v1">Standard</option>
                <option value="bliss-ai-pro">Pro</option>
                <option value="bliss-ai-lite">Lite</option>
              </select>
            </div>

            <button
              onClick={togglePeriodMode}
              className={cx(
                "w-full rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all",
                periodMode
                  ? "border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 text-emerald-100"
                  : "border-white/10 bg-slate-900/30 hover:bg-slate-900/50 text-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span>Period Assistant</span>
                <span
                  className={cx(
                    "text-xs px-2 py-1 rounded-lg",
                    periodMode ? "bg-emerald-500/20" : "bg-slate-700/50"
                  )}
                >
                  {periodMode ? "ON" : "OFF"}
                </span>
              </div>
              <div className="text-xs opacity-70 mt-1">
                Menstrual wellness guidance
              </div>
            </button>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-2">
              {state.chats.map((c) => {
                const active = c.id === state.activeId;
                return (
                  <div
                    key={c.id}
                    className={cx(
                      "group relative rounded-xl border transition-all",
                      active
                        ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/20 shadow-lg"
                        : "bg-slate-900/30 border-transparent hover:bg-slate-900/50 hover:border-white/10"
                    )}
                  >
                    <button
                      onClick={() => setActive(c.id)}
                      className="w-full text-left px-4 py-3"
                      title={c.title}
                    >
                      <div className="text-sm font-medium text-slate-100 truncate pr-8">
                        {c.title || "Chat"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                    <button
                      onClick={() => deleteChat(c.id)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg border border-white/10 bg-slate-900/50 hover:bg-red-500/20 hover:border-red-400/30 text-slate-300 hover:text-red-300 transition-all"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main chat area */}
        <div className="relative flex flex-col">
          {/* Desktop header */}
          <div className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-white/10 backdrop-blur-xl bg-slate-900/30">
            <div className="text-base font-semibold text-slate-100 truncate">
              {activeChat?.title || "Chat"}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={regenerate}
                disabled={isStreaming}
                className={cx(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition-all",
                  isStreaming
                    ? "border-white/10 bg-slate-900/30 text-slate-600 cursor-not-allowed"
                    : "border-white/10 bg-slate-900/50 hover:bg-slate-900/70 text-slate-200 hover:text-white"
                )}
              >
                ↻ Regenerate
              </button>

              {isStreaming && (
                <button
                  onClick={stop}
                  className="rounded-xl border border-red-400/20 bg-gradient-to-br from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 px-4 py-2 text-sm font-medium text-red-200 transition-all"
                >
                  ■ Stop
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto px-4 lg:px-0 pb-40 lg:pb-44"
          >
            <div className="max-w-4xl mx-auto py-8 space-y-6">
              {(activeChat?.messages || []).map((m) => {
                const isUser = m.role === "user";
                return (
                  <div key={m.id} className="w-full">
                    <div
                      className={cx(
                        "flex gap-4",
                        isUser ? "justify-end" : "justify-start"
                      )}
                    >
                      {!isUser && (
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 grid place-items-center text-sm font-semibold text-blue-200 flex-shrink-0">
                          AI
                        </div>
                      )}

                      <div
                        className={cx(
                          "max-w-[85%] lg:max-w-[75%] rounded-2xl border px-5 py-4 backdrop-blur-sm transition-all",
                          isUser
                            ? "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-white/15 shadow-lg"
                            : "bg-slate-900/40 border-white/10"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="text-xs font-medium text-slate-400">
                            {isUser ? "You" : "Assistant"} · {fmtTime(m.ts)}
                          </div>
                          {(m.content || "").trim() && (
                            <button
                              onClick={() => copy(m.content)}
                              className="text-xs font-medium px-2.5 py-1 rounded-lg border border-white/10 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white transition-all"
                            >
                              Copy
                            </button>
                          )}
                        </div>

                        <Markdown text={m.content} />

                        {!isUser &&
                          isStreaming &&
                          (m.content || "").length === 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex gap-1">
                                <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                                <div
                                  className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"
                                  style={{ animationDelay: "0.2s" }}
                                ></div>
                                <div
                                  className="w-2 h-2 rounded-full bg-pink-400 animate-pulse"
                                  style={{ animationDelay: "0.4s" }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-400">
                                Thinking...
                              </span>
                            </div>
                          )}
                      </div>

                      {isUser && (
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-600/50 border border-white/10 grid place-items-center text-sm font-semibold text-slate-200 flex-shrink-0">
                          U
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Input composer */}
          {showInput && (
            <div className="fixed bottom-0 left-0 right-0 lg:absolute border-t border-white/10 backdrop-blur-xl bg-slate-900/95 p-3 pb-20 lg:pb-4 lg:p-6 z-30">
              <div className="max-w-4xl mx-auto">
                <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl shadow-2xl overflow-hidden">
                  <textarea
                    ref={taRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKeyDown}
                    rows={1}
                    placeholder={
                      periodMode
                        ? "Ask about periods, cramps, PMS, or wellness..."
                        : "Type your message here..."
                    }
                    className="w-full resize-none bg-transparent outline-none text-base text-slate-100 placeholder:text-slate-500 px-5 py-4"
                  />
                  <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-white/[0.02]">
                    <div className="text-xs text-slate-500 hidden sm:block">
                      <span className="font-medium">Enter</span> to send ·{" "}
                      <span className="font-medium">Shift+Enter</span> for new
                      line
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {isStreaming && (
                        <button
                          onClick={stop}
                          className="rounded-xl border border-red-400/20 bg-gradient-to-br from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20 px-4 py-2 text-sm font-medium text-red-200 transition-all"
                        >
                          ■ Stop
                        </button>
                      )}

                      <button
                        onClick={send}
                        disabled={!canSend()}
                        className={cx(
                          "rounded-xl border px-5 py-2 text-sm font-semibold transition-all",
                          canSend()
                            ? "border-blue-400/30 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white shadow-lg shadow-blue-500/10"
                            : "border-white/10 bg-slate-900/30 text-slate-600 cursor-not-allowed"
                        )}
                      >
                        Send →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center text-xs text-slate-600 hidden lg:block">
                  Endpoint:{" "}
                  <span className="font-mono text-slate-500">{API_URL}</span>
                </div>
              </div>
            </div>
          )}

          {/* Toast notification */}
          {toast && (
            <div className="pointer-events-none fixed bottom-32 lg:bottom-48 left-1/2 -translate-x-1/2 z-50">
              <div className="rounded-2xl border border-white/20 bg-slate-900/90 backdrop-blur-xl px-6 py-3 text-sm font-medium text-slate-100 shadow-2xl">
                {toast}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
