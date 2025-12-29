// App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Single-file Bliss AI-like UI + logic.
 * Requires a backend proxy that streams SSE at POST /api/chat (same-origin recommended)
 * Request body: { model, messages: [{role, content}] }
 * SSE events expected:
 *   event: delta   data: {"delta":"..."}
 *   event: done    data: {}
 *   event: error   data: {"message":"..."}
 */

const API_URL = "/api/chat"; // ✅ same-origin avoids localhost + HTTPS + many CORS issues
const DEFAULT_MODEL = "bliss-ai-v1";
const LS_KEY = "blissai_chat_v3";

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
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);
  return ref;
}

/* ---------------- Markdown renderer: text + **bold** + ```code``` ---------------- */
function splitIntoBlocks(s) {
  const out = [];
  const re = /```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g;
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    const before = s.slice(last, m.index);
    if (before.trim() !== "") out.push({ type: "text", content: before });
    out.push({ type: "code", lang: (m[1] || "").trim(), content: m[2] || "" });
    last = m.index + m[0].length;
  }
  const tail = s.slice(last);
  if (tail.trim() !== "") out.push({ type: "text", content: tail });
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
      <strong key={idx} className="font-semibold text-zinc-100">
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
      setTimeout(() => setCopied(false), 900);
    } catch {}
  }
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.03]">
        <div className="text-[11px] text-zinc-400">{lang || "code"}</div>
        <button
          onClick={copy}
          className="text-[11px] text-zinc-300 hover:text-white rounded-lg px-2 py-1 border border-white/10 bg-white/[0.03]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[12px] text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Markdown({ text }) {
  const blocks = useMemo(() => splitIntoBlocks(String(text || "")), [text]);
  return (
    <div className="space-y-3 leading-relaxed text-[14px]">
      {blocks.map((b, i) => {
        if (b.type === "code") return <CodeBlock key={i} code={b.content} lang={b.lang} />;
        return (
          <p key={i} className="whitespace-pre-wrap break-words text-zinc-200">
            {renderInlineBold(b.content)}
          </p>
        );
      })}
    </div>
  );
}

/* ---------------- Better network diagnostics ---------------- */
function classifyFetchError(err) {
  const msg = String(err?.message || err || "Failed to fetch");

  // Browser often hides details for CORS as generic "Failed to fetch"
  // We still provide likely causes + what to check.
  const hints = [
    "Check DevTools → Network → the /api/chat request.",
    "If UI runs on HTTPS and backend is HTTP, use same-origin /api/chat or HTTPS backend.",
    "If backend is another domain/port, enable CORS + OPTIONS.",
    "If connection refused, ensure backend is running and reachable.",
  ];

  return {
    title: "Failed to fetch",
    detail: msg,
    hints,
  };
}

async function fetchWithTimeout(url, options, timeoutMs = 45000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}

/* ---------------- SSE streaming client (POST) ---------------- */
function streamChat({ url, body, signal, onDelta, onDone, onError }) {
  // Use same AbortController chain: if caller aborts, we abort too.
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
      // Not strict, but helps debugging
      const isLikelySSE = contentType.includes("text/event-stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      // If backend is not SSE, we can still try to read full text.
      if (!isLikelySSE) {
        // Attempt to read as text once and show it.
        const chunks = [];
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          chunks.push(decoder.decode(value, { stream: true }));
        }
        const full = chunks.join("") + decoder.decode();
        onError?.(
          `Backend did not stream SSE.\nExpected Content-Type: text/event-stream\nGot: ${contentType || "unknown"}\n\nResponse:\n${full.slice(
            0,
            2000
          )}`
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
            // Non-JSON payload, ignore safely
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
        `**${info.title}**\n` +
          `\n` +
          `URL: ${url}\n` +
          `Reason: ${info.detail}\n` +
          `\n` +
          `Fix checklist:\n` +
          info.hints.map((h) => `• ${h}`).join("\n")
      );
    })
    .finally(() => {
      if (signal) signal.removeEventListener?.("abort", abortBoth);
    });
}

/* ---------------- Period assistant system prompt ---------------- */
const PERIOD_ASSISTANT_SYSTEM = `
You are MoonBliss Assistant, a helpful menstrual wellness guide.
Answer the user's question directly. Do not reply with keyword-based snippets.
If the user asks about periods, cramps, cycle phases, PMS/PMDD, discharge, spotting, contraception, pregnancy risk, PCOS/endometriosis, hygiene, nutrition, exercise, mood, sleep, or products, give clear steps and explanations.

Safety rules:
- This is not a diagnosis. For severe or urgent symptoms, advise medical care.
- Ask 1-2 clarifying questions only when needed to answer accurately.
- For emergencies or red flags, tell them to seek urgent care.

Red flags (prompt urgent care guidance if mentioned):
- heavy bleeding soaking pads/tampons hourly for 2+ hours
- fainting, severe one-sided pelvic pain, shoulder pain
- pregnancy + bleeding or severe cramps
- fever, foul-smelling discharge, severe pain with sex
- sudden severe pain, dizziness, or signs of anemia

Style:
- Use short paragraphs and bullet points when helpful.
- Be practical. Give “what to do now” plus “when to see a doctor”.
`.trim();

export default function App({ isOpen = true, onClose = () => {} }) {
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

  // Ensure settings exist
  useEffect(() => {
    if (!state.settings) {
      setState((s) => ({ ...s, settings: { periodMode: true } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ensure at least one chat exists
  useEffect(() => {
    if (state.chats.length > 0 && state.activeId) return;

    if (state.chats.length > 0 && !state.activeId) {
      setState((s) => ({ ...s, activeId: s.chats[0].id }));
      return;
    }

    const id = uid();
    const seed = {
      id,
      title: "New chat",
      createdAt: nowISO(),
      messages: [
        {
          id: uid(),
          role: "assistant",
          ts: nowISO(),
          content:
            "Hi.\n\nAsk me anything about periods, cramps, cycle, PMS, discharge, nutrition, and self-care.\n\nIf you see **Failed to fetch**, your backend is not reachable. Use same-origin **/api/chat** or fix CORS.\n\n• Enter to send\n• Shift+Enter new line\n• Stop and Regenerate supported",
        },
      ],
    };
    setState((s) => ({ ...s, activeId: id, chats: [seed] }));
  }, [state.activeId, state.chats.length]);

  // Persist
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  }, [state]);

  // Scroll
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [state.activeId, state.chats, isStreaming]);

  // Toast timeout
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1300);
    return () => clearTimeout(t);
  }, [toast]);

  const activeChat = useMemo(() => {
    return state.chats.find((c) => c.id === state.activeId) || state.chats[0];
  }, [state]);

  function stop() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsStreaming(false);
    setToast("Stopped");
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
      title: "New chat",
      createdAt: nowISO(),
      messages: [{ id: uid(), role: "assistant", ts: nowISO(), content: "Hi. Ask me anything." }],
    };
    setState((s) => ({ ...s, activeId: id, chats: [chat, ...s.chats] }));
  }

  function deleteChat(id) {
    if (isStreaming && state.activeId === id) stop();
    setState((s) => {
      const next = s.chats.filter((c) => c.id !== id);
      const nextActive = s.activeId === id ? (next[0]?.id || null) : s.activeId;
      return { ...s, activeId: nextActive, chats: next };
    });
  }

  function renameFromFirstUser(chatId) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== chatId) return c;
        if (c.title && c.title !== "New chat") return c;
        const firstUser = c.messages.find((m) => m.role === "user");
        if (!firstUser) return c;
        const t = String(firstUser.content || "").trim().slice(0, 34) || "Chat";
        return { ...c, title: t };
      });
      return { ...s, chats };
    });
  }

  function pushMsg(role, content) {
    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        return { ...c, messages: [...c.messages, { id: uid(), role, ts: nowISO(), content }] };
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
      : [{ role: "system", content: "You are a helpful assistant. Answer directly and clearly." }];

    if (justSentUserText) base.push({ role: "user", content: justSentUserText });

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
      const chats = s.chats.map((c) => (c.id === s.activeId ? { ...c, messages: trimmed } : c));
      return { ...s, chats };
    });

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setIsStreaming(true);

    setState((s) => {
      const chats = s.chats.map((c) => {
        if (c.id !== s.activeId) return c;
        return { ...c, messages: [...trimmed, { id: uid(), role: "assistant", ts: nowISO(), content: "" }] };
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
      setToast("Copied");
    } catch {
      setToast("Copy failed");
    }
  }

  function togglePeriodMode() {
    setState((s) => ({
      ...s,
      settings: { ...(s.settings || {}), periodMode: !(s.settings || {}).periodMode },
    }));
    setToast(!periodMode ? "Period mode ON" : "Period mode OFF");
  }

  return (
    <>
      {!isOpen ? null : (
        <div className="fixed inset-0 bg-[#0b0f14] text-white">
          {/* Mobile top bar */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 lg:hidden">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm"
            >
              ← Back
            </button>
            <div className="text-sm text-zinc-200 truncate max-w-[55%]">{activeChat?.title || "Chat"}</div>
            <button
              onClick={newChat}
              className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm"
            >
              New
            </button>
          </div>

          <div className="h-full grid grid-cols-1 lg:grid-cols-[320px_1fr]">
            {/* Sidebar */}
            <div className={cx("border-r border-white/10 bg-[#0b0f14] lg:block", "block")}>
              <div className="p-3 space-y-2">
                <button
                  onClick={newChat}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.06] px-3 py-2 text-sm text-zinc-100"
                >
                  + New chat
                </button>

                <div className="flex items-center gap-2">
                  <div className="text-[11px] text-zinc-500">Model</div>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-2 text-[12px] text-zinc-200 outline-none"
                  >
                    <option value="bliss-ai-v1">Bliss AI Standard</option>
                    <option value="bliss-ai-pro">Bliss AI Pro</option>
                    <option value="bliss-ai-lite">Bliss AI Lite</option>
                  </select>
                </div>

                <button
                  onClick={togglePeriodMode}
                  className={cx(
                    "w-full rounded-xl border px-3 py-2 text-sm text-left",
                    periodMode
                      ? "border-emerald-200/15 bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-100"
                      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-200"
                  )}
                  title="When ON, assistant acts like a menstrual wellness guide."
                >
                  Period Assistant: <span className="font-semibold">{periodMode ? "ON" : "OFF"}</span>
                  <div className="text-[11px] opacity-80 mt-0.5">Direct answers + safety guidance</div>
                </button>

                <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                  <div className="text-[11px] text-zinc-500">Endpoint</div>
                  <div className="text-[12px] text-zinc-200 break-all">{API_URL}</div>
                  <div className="text-[11px] text-zinc-500 mt-1">
                    If this fails, your backend route /api/chat is missing or blocked.
                  </div>
                </div>
              </div>

              <div className="px-2 pb-3 overflow-y-auto h-[calc(100%-260px)]">
                <div className="space-y-1">
                  {state.chats.map((c) => {
                    const active = c.id === state.activeId;
                    return (
                      <div
                        key={c.id}
                        className={cx(
                          "group flex items-center gap-2 rounded-xl px-3 py-2 border",
                          active
                            ? "bg-white/[0.06] border-white/15"
                            : "bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/10"
                        )}
                      >
                        <button onClick={() => setActive(c.id)} className="flex-1 text-left min-w-0" title={c.title}>
                          <div className="text-sm text-zinc-100 truncate">{c.title || "Chat"}</div>
                          <div className="text-[11px] text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</div>
                        </button>

                        <button
                          onClick={() => deleteChat(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300"
                          title="Delete"
                        >
                          Del
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main */}
            <div className="relative flex flex-col">
              {/* Desktop header */}
              <div className="hidden lg:flex items-center justify-between px-5 py-3 border-b border-white/10">
                <div className="text-sm text-zinc-200 truncate">{activeChat?.title || "Chat"}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={regenerate}
                    disabled={isStreaming}
                    className={cx(
                      "rounded-xl border px-3 py-2 text-sm",
                      isStreaming
                        ? "border-white/10 bg-white/[0.02] text-zinc-500 cursor-not-allowed"
                        : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-200"
                    )}
                  >
                    Regenerate
                  </button>

                  {isStreaming ? (
                    <button
                      onClick={stop}
                      className="rounded-xl border border-rose-200/15 bg-rose-500/10 hover:bg-rose-500/15 px-3 py-2 text-sm text-rose-200"
                    >
                      Stop
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Messages */}
              <div ref={listRef} className="flex-1 overflow-y-auto px-3 lg:px-0 pb-20 lg:pb-0">
                <div className="max-w-3xl mx-auto py-6 space-y-6">
                  {(activeChat?.messages || []).map((m) => {
                    const isUser = m.role === "user";
                    return (
                      <div key={m.id} className="w-full">
                        <div className={cx("flex gap-3", isUser ? "justify-end" : "justify-start")}>
                          {!isUser ? (
                            <div className="h-8 w-8 rounded-full bg-emerald-500/15 border border-emerald-200/15 grid place-items-center text-[12px] text-emerald-200">
                              AI
                            </div>
                          ) : null}

                          <div
                            className={cx(
                              "max-w-[92%] lg:max-w-[80%] rounded-2xl border px-4 py-3",
                              isUser ? "bg-white/[0.04] border-white/10" : "bg-black/20 border-white/10",
                              "backdrop-blur"
                            )}
                          >
                            <div className="flex items-center justify-between gap-3 mb-1">
                              <div className="text-[11px] text-zinc-500">
                                {isUser ? "You" : "Assistant"} · {fmtTime(m.ts)}
                              </div>
                              {(m.content || "").trim() ? (
                                <button
                                  onClick={() => copy(m.content)}
                                  className="text-[11px] px-2 py-1 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300"
                                >
                                  Copy
                                </button>
                              ) : null}
                            </div>

                            <Markdown text={m.content} />

                            {!isUser && isStreaming && (m.content || "").length === 0 ? (
                              <div className="mt-2 text-[12px] text-zinc-500">Thinking…</div>
                            ) : null}
                          </div>

                          {isUser ? (
                            <div className="h-8 w-8 rounded-full bg-white/[0.05] border border-white/10 grid place-items-center text-[12px] text-zinc-200">
                              U
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Composer */}
              <div className="fixed bottom-20 lg:relative left-0 right-0 border-t border-white/10 bg-[#0b0f14] lg:bottom-auto z-40">
                <div className="max-w-3xl mx-auto p-3 w-full">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <textarea
                      ref={taRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      rows={1}
                      placeholder={periodMode ? "Ask about periods, cramps, cycle, PMS…" : "Message…"}
                      className="w-full resize-none bg-transparent outline-none text-sm sm:text-base text-zinc-100 placeholder:text-zinc-500"
                    />
                    <div className="flex items-center justify-between pt-2 gap-2">
                      <div className="text-[11px] text-zinc-500 hidden sm:inline">
                        Enter to send · Shift+Enter new line
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        {isStreaming ? (
                          <button
                            onClick={stop}
                            className="rounded-xl border border-rose-200/15 bg-rose-500/10 hover:bg-rose-500/15 px-2 sm:px-3 py-2 text-xs sm:text-sm text-rose-200 whitespace-nowrap"
                          >
                            Stop
                          </button>
                        ) : null}

                        <button
                          onClick={send}
                          disabled={!canSend()}
                          className={cx(
                            "rounded-xl border px-2 sm:px-3 py-2 text-xs sm:text-sm whitespace-nowrap",
                            canSend()
                              ? "border-white/10 bg-white/[0.05] hover:bg-white/[0.08] text-zinc-100"
                              : "border-white/10 bg-white/[0.02] text-zinc-500 cursor-not-allowed"
                          )}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-[11px] text-zinc-600 hidden sm:block">API endpoint: {API_URL}</div>
                </div>
              </div>

              {/* Toast */}
              {toast ? (
                <div className="pointer-events-none fixed bottom-24 lg:bottom-auto lg:absolute left-1/2 -translate-x-1/2 z-50">
                  <div className="rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs text-zinc-200 backdrop-blur">
                    {toast}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
