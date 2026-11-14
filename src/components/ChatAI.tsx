"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, SendHorizontal, Sparkles, Square } from "lucide-react";

type Msg = { role: "user" | "ai"; text: string };

// ✏️ Edit these clickable questions
const SUGGESTIONS = [
  "how to share your profile link and receive anonymous messages",
  " how to accept, pause, read or delete messages",
  "sign up, email verification and account problems",
  "tips for sending kind, safe anonymous messages",
];

export default function ChatAI() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  // scroll only the chat box (not the whole page) as text streams in
  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages]);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || loading) return;

    setInput("");
    setMessages((p) => [...p, { role: "user", text: question }, { role: "ai", text: "" }]);
    setLoading(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const setLastAnswer = (text: string) =>
      setMessages((p) => {
        const copy = [...p];
        copy[copy.length - 1] = { role: "ai", text };
        return copy;
      });

    let acc = "";
    try {
      const res = await fetch("/api/chat-with-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        setLastAnswer(data?.answer ?? "Something went wrong. Please try again.");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setLastAnswer(acc);
      }
    } catch (e) {
      if ((e as Error).name === "AbortError") setLastAnswer(acc || "Stopped.");
      else setLastAnswer("Network error. Please try again.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  const stop = () => abortRef.current?.abort();
  const reset = () => { stop(); setMessages([]); };

  const chipClass =
    "shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-sm text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="grid size-7 place-items-center rounded-full bg-indigo-50 text-indigo-600">
            <Sparkles className="size-4" />
          </span>
          Assistant
        </div>
        {messages.length > 0 && (
          <button
            onClick={reset}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw className="size-3.5" /> New chat
          </button>
        )}
      </div>

      {/* messages */}
      <div ref={boxRef} role="log" aria-live="polite" className="h-80 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-base font-medium text-slate-900">How can I help?</p>
            <p className="mb-4 mt-1 text-sm text-slate-500">Pick a question or type your own.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className={chipClass}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => {
            const isLast = i === messages.length - 1;
            return m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2 text-sm text-white">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={i} className="flex items-start gap-2">
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                  <Sparkles className="size-4" />
                </span>
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md bg-slate-100 px-4 py-2 text-sm leading-relaxed text-slate-800">
                  {m.text ? (
                    <>
                      {m.text}
                      {loading && isLast && (
                        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-indigo-500 align-middle" />
                      )}
                    </>
                  ) : (
                    <span className="flex gap-1 py-1" aria-label="Thinking">
                      <i className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
                      <i className="size-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
                      <i className="size-1.5 animate-bounce rounded-full bg-slate-400" />
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* suggestions row (after the first message) */}
      {messages.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => ask(s)} disabled={loading} className={chipClass}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form
        onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="flex items-center gap-2 border-t border-slate-100 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
          placeholder="Ask about Mystery Message…"
          aria-label="Your question"
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        {loading ? (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop"
            className="grid size-10 place-items-center rounded-xl bg-slate-900 text-white hover:bg-slate-700"
          >
            <Square className="size-4 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            aria-label="Send"
            className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendHorizontal className="size-4" />
          </button>
        )}
      </form>
    </div>
  );
}