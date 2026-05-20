import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, MessageCircle } from "lucide-react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";
import { AssistantMessage } from "@/components/copilot/AssistantMessage";
import {
  SUGGESTED_PROMPTS,
  FOLLOWUP,
  routeFreeFormQuery,
  type AssistantAnswer,
} from "@/data/assistant";
import { cn } from "@/lib/cn";

interface ThreadItem {
  id: string;
  kind: "user" | "assistant";
  // user
  text?: string;
  // assistant
  answer?: AssistantAnswer;
  timestamp: string;
}

const nowStamp = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

export function Assistant() {
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [pending, setPending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTo({
        top: scrollerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [thread, pending]);

  const ask = (answer: AssistantAnswer, displayedQuestion?: string) => {
    if (pending) return;
    const ts = nowStamp();
    setThread((t) => [
      ...t,
      {
        id: `${Date.now()}-u`,
        kind: "user",
        text: displayedQuestion ?? answer.question,
        timestamp: ts,
      },
    ]);
    setPending(true);
    window.setTimeout(() => {
      setThread((t) => [
        ...t,
        {
          id: `${Date.now()}-a`,
          kind: "assistant",
          answer,
          timestamp: nowStamp(),
        },
      ]);
      setPending(false);
    }, 650);
  };

  const submitFreeForm = () => {
    const text = inputValue.trim();
    if (!text) {
      // Empty Enter — fire the Siemens follow-up as the curated next step
      ask(FOLLOWUP);
      return;
    }
    const answer = routeFreeFormQuery(text);
    ask(answer, text);
    setInputValue("");
  };

  return (
    <div className="px-8 py-8 h-[calc(100vh-64px)] flex flex-col">
      <SerifHeadline
        kicker="05 ∙ Operations Assistant"
        title="Ask The Night."
        supporting={
          <>
            The questions your dispatcher used to phone three people to answer —
            in a single sentence, grounded in tonight's data, with the action
            ready to apply.
          </>
        }
        size="lg"
      />

      <div className="mt-6 flex-1 min-h-0 grid grid-cols-[1fr_320px] gap-6">
        {/* Conversation area */}
        <div className="flex flex-col min-h-0">
          <div
            ref={scrollerRef}
            className="flex-1 min-h-0 overflow-y-auto pr-2 space-y-4"
          >
            {thread.length === 0 ? (
              <EmptyState />
            ) : null}

            {thread.map((item) =>
              item.kind === "user" ? (
                <UserBubble
                  key={item.id}
                  text={item.text ?? ""}
                  timestamp={item.timestamp}
                />
              ) : (
                <AssistantMessage
                  key={item.id}
                  answer={item.answer!}
                  timestamp={item.timestamp}
                />
              ),
            )}

            <AnimatePresence>
              {pending ? (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[color:var(--hairline)] rounded-[3px] bg-[color:var(--panel-soft)] w-fit"
                >
                  <Sparkles
                    size={12}
                    strokeWidth={1.5}
                    className="text-[color:var(--accent)] animate-pulse"
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                    Composing answer …
                  </span>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Input row */}
          <div className="mt-5 pt-4 border-t border-[color:var(--hairline)]">
            <div className="flex items-center gap-3 bg-[color:var(--panel)] border border-[color:var(--hairline-strong)] rounded-[3px] px-4 h-12">
              <MessageCircle
                size={14}
                strokeWidth={1.5}
                className="text-[color:var(--ink-muted)]"
              />
              <input
                type="text"
                placeholder="Ask the night network anything…"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-transparent font-sans text-[13px] text-[color:var(--ink)] placeholder:text-[color:var(--ink-faint)] focus:outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitFreeForm();
                  }
                }}
              />
              <button
                type="button"
                onClick={submitFreeForm}
                className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)] hover:text-[color:var(--ink)] transition-colors inline-flex items-center gap-1.5"
              >
                Send <Send size={11} strokeWidth={1.5} />
              </button>
            </div>
            <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
              ∙ Pre-loaded for the demo · press Send to chain a follow-up
            </div>
          </div>
        </div>

        {/* Right: suggested prompts + tips */}
        <aside className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5 flex flex-col gap-4 min-h-0">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
              ∙ Suggested Questions
            </div>
            <div className="font-serif text-[15px] text-[color:var(--ink)] leading-tight mt-1">
              Start here, or type your own.
            </div>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto -mx-1 px-1">
            {SUGGESTED_PROMPTS.map((p) => {
              const asked = thread.some(
                (t) => t.kind === "user" && t.text === p.question,
              );
              return (
                <button
                  key={p.promptId}
                  type="button"
                  disabled={asked || pending}
                  onClick={() => ask(p)}
                  className={cn(
                    "text-left p-3 border rounded-[3px] transition-colors",
                    asked
                      ? "border-[color:var(--hairline)] bg-[color:var(--panel-soft)]/40 opacity-50 cursor-default"
                      : "border-[color:var(--hairline)] bg-[color:var(--panel-soft)]/30 hover:bg-[color:var(--accent-soft)]/40 hover:border-[color:var(--accent)]/60 cursor-pointer",
                  )}
                >
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-1">
                    {p.shortKicker}
                  </div>
                  <div className="font-sans text-[12px] text-[color:var(--ink)] leading-snug">
                    {p.question}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-4 border-t border-[color:var(--hairline)]">
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-2">
              ∙ Sources
            </div>
            <p className="font-sans text-[11px] italic text-[color:var(--ink-muted)] leading-snug">
              Tonight's shipments, route plans, weather feeds, hub telemetry,
              and the last 90 days of SLA history.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function UserBubble({ text, timestamp }: { text: string; timestamp: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
    >
      <div className="max-w-[80%] bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] rounded-[3px] px-4 py-3">
        <div className="flex items-baseline gap-2 mb-1 justify-end">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Dispatcher · {timestamp}
          </span>
        </div>
        <div className="font-sans text-[14px] text-[color:var(--ink)] leading-snug text-right">
          {text}
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <div className="h-full min-h-[300px] flex flex-col items-start justify-center max-w-[560px]">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-3">
        ∙ Awaiting Query
      </div>
      <h3
        className="font-serif text-[28px] leading-[1.1] text-[color:var(--ink)] mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        The assistant has read tonight's plan.
      </h3>
      <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] leading-snug">
        Pick a question on the right, or type your own. Answers are grounded in
        live shipments, route plans, weather feeds, and ninety days of SLA
        history.
      </p>
    </div>
  );
}
