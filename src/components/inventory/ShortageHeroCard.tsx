import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import type { InventoryItem, VerticalProfile } from "@/lib/types";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { NODE_BY_ID, HUBS } from "@/data/network";
import { useToast } from "@/components/primitives/Toast";
import { cn } from "@/lib/cn";

export interface ShortageHeroCardProps {
  item?: InventoryItem;
  vertical: VerticalProfile;
  accepted?: boolean;
  onAccept?: () => void;
}

interface ReplenishmentPlan {
  fromHubName: string;
  fromHubCountry: string;
  toFslName: string;
  units: number;
  truckSlot: string;
  arrival: string;
  costEur: number;
  exposureAvoidedEur: number;
}

function planFor(item: InventoryItem, vertical: VerticalProfile): ReplenishmentPlan {
  const fsl = NODE_BY_ID.get(item.fslId);
  // Find a nearby healthier hub in another country (or same)
  const candidates = HUBS.filter((h) => h.country !== fsl?.country);
  const sourceHub = candidates[item.sku.length % Math.max(1, candidates.length)] ?? HUBS[0];

  const units = Math.max(8, item.reorderPoint * 2 - item.onHand);
  const exposureHours = item.predictedShortageHours ?? 24;
  const exposureAvoided = Math.round(
    vertical.downtimeCostEurPerHour * Math.min(8, exposureHours),
  );

  return {
    fromHubName: sourceHub.name,
    fromHubCountry: sourceHub.country,
    toFslName: fsl?.name ?? item.fslId,
    units,
    truckSlot: "23:40",
    arrival: "05:10",
    costEur: 280 + units * 11,
    exposureAvoidedEur: exposureAvoided,
  };
}

export function ShortageHeroCard({
  item,
  vertical,
  accepted,
  onAccept,
}: ShortageHeroCardProps) {
  const toast = useToast();
  if (!item) {
    return (
      <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          ∙ Inventory Healthy
        </div>
        <h2
          className="font-serif text-[28px] leading-none text-[color:var(--ink)] mt-2"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          No predicted shortages in this vertical.
        </h2>
        <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] mt-2 max-w-[64ch]">
          Stock levels at every FSL clear the {vertical.slaWindowHours}-hour SLA window. The system will surface the next shortage as soon as the demand model crosses its threshold.
        </p>
      </div>
    );
  }

  const plan = planFor(item, vertical);
  const fsl = NODE_BY_ID.get(item.fslId);

  const handleAccept = () => {
    onAccept?.();
    toast.push({
      kicker: "Replenishment Authorised",
      title: `${plan.units} units · ${plan.fromHubName} → ${plan.toFslName}`,
      description: `Truck slot ${plan.truckSlot}, ETA ${plan.arrival}. Customer ops and FSL manager notified.`,
    });
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={item.sku + item.fslId}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28 }}
        className={cn(
          "relative bg-[color:var(--panel)] border border-[color:var(--hairline-strong)] rounded-[3px] overflow-hidden",
          "[html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
        )}
      >
        <div className="grid grid-cols-[1.3fr_1fr]">
          {/* Left — the alert + AI plan */}
          <div className="p-6 border-r border-[color:var(--hairline)]">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle size={12} strokeWidth={1.5} className="text-[color:var(--breach)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--breach)]">
                Predicted Shortage
              </span>
              <span className="font-mono text-[10px] text-[color:var(--ink-faint)]">
                · {vertical.shortName}
              </span>
            </div>
            <h2
              className="font-serif text-[34px] leading-[1.04] text-[color:var(--ink)] mb-2"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {item.partName}
            </h2>
            <p className="font-sans text-[14px] text-[color:var(--ink-muted)] italic max-w-[52ch] leading-snug mb-5">
              {fsl?.name} projected to hit zero stock in{" "}
              <span className="not-italic text-[color:var(--breach)] font-mono tabular-nums">
                {item.predictedShortageHours ?? "—"}h
              </span>
              . The downtime exposure for a {vertical.shortName.toLowerCase()} customer is approximately{" "}
              <span className="not-italic font-mono text-[color:var(--ink)] tabular-nums">
                €{vertical.downtimeCostEurPerHour.toLocaleString()}
              </span>{" "}
              per hour.
            </p>

            <div className="border-t border-[color:var(--hairline)] pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={12} strokeWidth={1.5} className="text-[color:var(--accent)]" />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--accent)]">
                  Recommended Replenishment
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <PlanNode label="From" name={plan.fromHubName} sub={plan.fromHubCountry} />
                <ArrowRight size={16} strokeWidth={1.5} className="text-[color:var(--ink-faint)]" />
                <PlanNode label="To" name={plan.toFslName} sub={fsl?.country ?? ""} />
                <span className="ml-auto inline-flex items-baseline gap-1.5">
                  <span
                    className="font-serif text-[32px] leading-none text-[color:var(--ink)]"
                    style={{ fontVariationSettings: '"opsz" 144' }}
                  >
                    {plan.units}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                    units
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-5">
                <Stat label="Truck slot" value={plan.truckSlot} />
                <Stat label="Arrival" value={plan.arrival} tone="on-time" />
                <Stat label="Move cost" value={`€${plan.costEur.toLocaleString()}`} />
                <Stat
                  label="Exposure avoided"
                  value={`€${(plan.exposureAvoidedEur / 1000).toFixed(0)}k`}
                  tone="accent"
                />
              </div>

              {accepted ? (
                <span className="inline-flex items-center gap-2 h-9 px-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--on-time)] border border-[color:var(--on-time)]/40 rounded-[3px]">
                  <CheckCircle2 size={14} strokeWidth={1.5} />
                  Move Authorised
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Button onClick={handleAccept} variant="primary" size="md">
                    Authorise Move
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </Button>
                  <Button variant="secondary" size="md">
                    Defer 6h
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right — vertical rule profile */}
          <div className="p-6 bg-[color:var(--panel-soft)]/60">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-3">
              ∙ {vertical.shortName} Rule Profile
            </div>
            <div className="space-y-3.5">
              <RuleRow label="Criticality" value={vertical.criticality} highlight />
              <RuleRow label="SLA Window" value={`${vertical.slaWindowHours}h`} />
              <RuleRow
                label="Downtime cost"
                value={`€${vertical.downtimeCostEurPerHour.toLocaleString()}/h`}
                tone="breach"
              />
            </div>
            <div className="mt-5 pt-4 border-t border-[color:var(--hairline)]">
              <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
                Handling Rules
              </div>
              <ul className="space-y-1.5">
                {vertical.handlingRules.map((rule, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 font-sans text-[12px] text-[color:var(--ink-muted)] leading-snug"
                  >
                    <span
                      className="mt-1.5 inline-block h-1 w-1 rounded-full shrink-0"
                      style={{ background: `var(${vertical.varToken})` }}
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <Badge
              variant="accent"
              className="mt-5"
              uppercase
            >
              Active Profile
            </Badge>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function PlanNode({ label, name, sub }: { label: string; name: string; sub: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
        {label}
      </div>
      <div className="font-sans text-[13px] text-[color:var(--ink)] truncate max-w-[160px]">
        {name}
      </div>
      <div className="font-mono text-[10px] text-[color:var(--ink-muted)] tabular-nums">
        {sub}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "on-time" | "accent" | "breach";
}) {
  const color =
    tone === "on-time"
      ? "var(--on-time)"
      : tone === "accent"
        ? "var(--accent)"
        : tone === "breach"
          ? "var(--breach)"
          : "var(--ink)";
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1">
        {label}
      </div>
      <div
        className="font-mono text-[15px] tabular-nums leading-none"
        style={{ color }}
      >
        {value}
      </div>
    </div>
  );
}

function RuleRow({
  label,
  value,
  highlight,
  tone,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: "breach";
}) {
  const color = tone === "breach" ? "var(--breach)" : "var(--ink)";
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
        {label}
      </span>
      <span
        className={cn(
          "font-serif tracking-[-0.01em] capitalize",
          highlight ? "text-[18px]" : "text-[15px]",
        )}
        style={{ color, fontVariationSettings: '"opsz" 144' }}
      >
        {value}
      </span>
    </div>
  );
}
