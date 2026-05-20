import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Bookmark } from "lucide-react";
import type { AssistantAnswer } from "@/data/assistant";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/primitives/Toast";

export interface AssistantMessageProps {
  answer: AssistantAnswer;
  timestamp: string;
  className?: string;
}

export function AssistantMessage({
  answer,
  timestamp,
  className,
}: AssistantMessageProps) {
  const toast = useToast();
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className={cn(
        "relative bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-6",
        "[html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[color:var(--accent)]" />

      <header className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={12} strokeWidth={1.5} className="text-[color:var(--accent)]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)]">
            Nordline Assistant
          </span>
          <span className="font-mono text-[10px] text-[color:var(--ink-faint)]">
            · {answer.shortKicker} · {timestamp}
          </span>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
          ∙ Grounded in tonight's data
        </span>
      </header>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="font-serif text-[24px] leading-[1.15] text-[color:var(--ink)] mb-4 max-w-[60ch]"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {answer.headline}
      </motion.h3>

      <div className="space-y-3.5">
        {answer.evidence.map((e, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.12 + i * 0.08, duration: 0.32 }}
            className="grid grid-cols-[14px_140px_1fr] gap-3 items-baseline"
          >
            <span className="font-mono text-[10px] tabular-nums text-[color:var(--ink-faint)]">
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)]">
              {e.kicker}
            </span>
            <div className="font-sans text-[13px] text-[color:var(--ink)] leading-snug">
              {e.detail}
              {e.refs && e.refs.length ? (
                <span className="ml-2 inline-flex flex-wrap gap-1.5 align-middle">
                  {e.refs.map((ref) => (
                    <span
                      key={ref}
                      className="font-mono text-[10px] tabular-nums text-[color:var(--ink-muted)] border border-[color:var(--hairline)] rounded-[2px] px-1 py-0.5"
                    >
                      {ref}
                    </span>
                  ))}
                </span>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>

      {answer.recommendations.length ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: 0.12 + answer.evidence.length * 0.08 + 0.1,
            duration: 0.32,
          }}
          className="mt-5 pt-4 border-t border-[color:var(--hairline)]"
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
            ∙ Recommended Actions
          </div>
          <ul className="space-y-1.5">
            {answer.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex items-start gap-2 font-sans text-[13px] text-[color:var(--ink)]"
              >
                <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-[color:var(--accent)] shrink-0" />
                {r}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() =>
                toast.push({
                  kicker: "Plan Applied",
                  title: `${answer.recommendations.length} action${
                    answer.recommendations.length === 1 ? "" : "s"
                  } propagated`,
                  description: "Dispatchers, drivers, and customer ops notified.",
                })
              }
            >
              Apply All
              <ArrowRight size={14} strokeWidth={1.5} />
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                toast.push({
                  kicker: "Saved",
                  title: "Saved as Playbook",
                  description: "Recurring trigger: nightly 22:30 review.",
                })
              }
            >
              <Bookmark size={13} strokeWidth={1.5} />
              Save as Playbook
            </Button>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
}
