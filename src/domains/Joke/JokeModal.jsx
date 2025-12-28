// App.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Single-file ChatGPT-like UI + logic.
 * Requires a backend proxy that streams SSE at POST http://localhost:8787/api/chat
 * Request body: { model, messages: [{role, content}] }
 * SSE events expected:
 *   event: delta   data: {"delta":"..."}
 *   event: done    data: {}
 *   event: error   data: {"message":"..."}
 */

const API_URL = "http://localhost:8787/api/chat";
const DEFAULT_MODEL = "gpt-4.1-mini";
const LS_KEY = "chatgpt_single_file_v1";

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

/* ---------------- SSE streaming client (POST) ---------------- */
function streamChat({ url, body, signal, onDelta, onDone, onError }) {
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  })
    .then(async (res) => {
      if (!res.ok || !res.body) {
        const t = await res.text().catch(() => "");
        throw new Error(t || "Bad response");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

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
          } catch {}

          if (ev === "delta") onDelta?.(payload.delta || "");
          if (ev === "done") onDone?.();
          if (ev === "error") onError?.(payload.message || "Stream error");
        }
      }

      onDone?.();
    })
    .catch((e) => {
      if (e?.name === "AbortError") return;
      onError?.(e?.message || "Network error");
    });
}

export default function App({ isOpen = true, onClose = () => {} }) {
  const [state, setState] = useState(() =>
    safeJson(localStorage.getItem(LS_KEY), { activeId: null, chats: [] })
  );

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [toast, setToast] = useState(null);
  const [model, setModel] = useState(DEFAULT_MODEL);

  const abortRef = useRef(null);
  const listRef = useRef(null);
  const taRef = useAutoGrowTextarea(input);

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
            "Hi.\n\nThis is a ChatGPT-like UI.\n\n• Enter to send\n• Shift+Enter new line\n• Stop and Regenerate supported\n\nBackend required at /api/chat for real AI.",
        },
      ],
    };
    setState({ activeId: id, chats: [seed] });
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
    setState((s) => ({ activeId: id, chats: [chat, ...s.chats] }));
  }

  function deleteChat(id) {
    if (isStreaming && state.activeId === id) stop();
    setState((s) => {
      const next = s.chats.filter((c) => c.id !== id);
      const nextActive = s.activeId === id ? (next[0]?.id || null) : s.activeId;
      return { activeId: nextActive, chats: next };
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

  function send() {
    const q = input.trim();
    if (!q || isStreaming) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;

    setInput("");
    setIsStreaming(true);

    pushMsg("user", q);
    pushMsg("assistant", ""); // placeholder for streaming output

    const base = (activeChat?.messages || [])
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.content }));

    // Add the just-sent user msg (state updates async)
    base.push({ role: "user", content: q });

    streamChat({
      url: API_URL,
      body: { model, messages: base },
      signal: ac.signal,
      onDelta: (d) => updateLastAssistant(d),
      onDone: () => {
        setIsStreaming(false);
        renameFromFirstUser(state.activeId);
      },
      onError: (msg) => {
        setIsStreaming(false);
        replaceLastAssistant(`**Error**\n${msg || "Request failed"}`);
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

    const history = trimmed.map((m) => ({ role: m.role, content: m.content }));

    streamChat({
      url: API_URL,
      body: { model, messages: history },
      signal: ac.signal,
      onDelta: (d) => updateLastAssistant(d),
      onDone: () => setIsStreaming(false),
      onError: (msg) => {
        setIsStreaming(false);
        replaceLastAssistant(`**Error**\n${msg || "Request failed"}`);
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
        <div className="text-sm text-zinc-200 truncate max-w-[55%]">
          {activeChat?.title || "Chat"}
        </div>
        <button
          onClick={newChat}
          className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.03] text-sm"
        >
          New
        </button>
      </div>

      <div className="h-full grid grid-cols-1 lg:grid-cols-[320px_1fr]">
        {/* Sidebar */}
        <div className={cx("border-r border-white/10 bg-[#0b0f14] lg:block", sidebarOpen ? "block" : "hidden")}>
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
                <option value="gpt-4.1-mini">gpt-4.1-mini</option>
                <option value="gpt-4.1">gpt-4.1</option>
                <option value="gpt-4o-mini">gpt-4o-mini</option>
              </select>
            </div>
          </div>

          <div className="px-2 pb-3 overflow-y-auto h-[calc(100%-108px)]">
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
                      <div className="text-[11px] text-zinc-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
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
                  placeholder="Message…"
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
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-zinc-600 hidden sm:block">
                API endpoint: {API_URL}
              </div>
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
