import { ArrowRight, CheckCircle2, GitFork, AlertOctagon, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import type { RecommendationPlan } from "@/lib/risk";
import type { Shipment } from "@/lib/types";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/primitives/Toast";

export interface RecommendationCardProps {
  shipment: Shipment;
  plan: RecommendationPlan;
  accepted?: boolean;
  onAccept?: () => void;
  onModify?: () => void;
  onEscalate?: () => void;
  className?: string;
}

export function RecommendationCard({
  shipment,
  plan,
  accepted,
  onAccept,
  onModify,
  onEscalate,
  className,
}: RecommendationCardProps) {
  const toast = useToast();

  const handleAccept = () => {
    onAccept?.();
    toast.push({
      kicker: "Intervention Logged",
      title: `Action propagated: ${plan.title}`,
      description:
        "TMS, customer portal, driver app & SLA dashboard updated. Hub manager notified.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative bg-[color:var(--panel)] border border-[color:var(--hairline-strong)] rounded-[3px] p-6",
        "[html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
        className,
      )}
    >
      {/* Accent rail */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-[color:var(--accent)]" />

      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={12} strokeWidth={1.5} className="text-[color:var(--accent)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)]">
          Recommended Intervention
        </span>
        <span className="font-mono text-[10px] text-[color:var(--ink-faint)]">
          · model v3.4
        </span>
      </div>

      <h3
        className="font-serif text-[26px] leading-tight text-[color:var(--ink)] mb-3"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {plan.title}
      </h3>

      <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] leading-snug mb-5 max-w-[60ch]">
        {plan.rationale}
      </p>

      {/* Outcome strip */}
      <div className="grid grid-cols-4 gap-4 py-4 border-y border-[color:var(--hairline)]">
        <OutcomeStat label="New ETA" value={plan.newEta} highlight />
        <OutcomeStat
          label="Buffer"
          value={`+${plan.bufferMinutes}m`}
          tone="on-time"
        />
        <OutcomeStat
          label="Risk After"
          value={plan.preservedRiskScore.toString()}
          subscript={`from ${shipment.riskScore}`}
          tone="on-time"
        />
        <OutcomeStat label="Cost" value={`€${plan.costEur}`} />
      </div>

      <ul className="mt-4 space-y-1.5">
        {plan.bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-2 font-sans text-[12px] text-[color:var(--ink-muted)] leading-snug"
          >
            <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-[color:var(--accent)] shrink-0" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center gap-2">
        {accepted ? (
          <span className="inline-flex items-center gap-2 h-9 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--on-time)] border border-[color:var(--on-time)]/40 rounded-[3px]">
            <CheckCircle2 size={14} strokeWidth={1.5} />
            Intervention Live
          </span>
        ) : (
          <>
            <Button onClick={handleAccept} variant="primary" size="md">
              <CheckCircle2 size={14} strokeWidth={1.5} />
              Accept & Propagate
              <ArrowRight size={14} strokeWidth={1.5} />
            </Button>
            <Button onClick={onModify} variant="secondary" size="md">
              <GitFork size={13} strokeWidth={1.5} />
              Modify
            </Button>
            <Button onClick={onEscalate} variant="outline" size="md">
              <AlertOctagon size={13} strokeWidth={1.5} />
              Escalate
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function OutcomeStat({
  label,
  value,
  subscript,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  subscript?: string;
  highlight?: boolean;
  tone?: "on-time" | "at-risk";
}) {
  const color = tone === "on-time" ? "var(--on-time)" : tone === "at-risk" ? "var(--at-risk)" : "var(--ink)";
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1.5">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "font-serif tracking-[-0.02em] leading-none",
            highlight ? "text-[24px]" : "text-[20px]",
          )}
          style={{ color, fontVariationSettings: '"opsz" 144' }}
        >
          {value}
        </span>
        {subscript ? (
          <span className="font-mono text-[10px] text-[color:var(--ink-faint)] tabular-nums">
            {subscript}
          </span>
        ) : null}
      </div>
    </div>
  );
}
