import type { NetworkNode } from "@/lib/types";
import { cn } from "@/lib/cn";

export interface HubOperationsBlockProps {
  hub: NetworkNode;
  className?: string;
}

interface LaneState {
  id: "A" | "B" | "C";
  description: string;
  utilization: number; // 0-100
  state: "ok" | "watch" | "slow";
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function laneStateFromHash(seed: number, idx: number): LaneState {
  const r = ((seed >> (idx * 3)) & 0xff) / 255;
  const utilization = Math.round(58 + r * 40);
  const state: LaneState["state"] =
    utilization >= 94 ? "slow" : utilization >= 86 ? "watch" : "ok";
  return {
    id: (idx === 0 ? "A" : idx === 1 ? "B" : "C") as LaneState["id"],
    description:
      idx === 0
        ? "Inbound consolidation"
        : idx === 1
          ? "Outbound sortation"
          : "Cross-dock fast lane",
    utilization,
    state,
  };
}

export function HubOperationsBlock({ hub, className }: HubOperationsBlockProps) {
  const seed = hashStr(hub.id);
  const pickRate = Math.round(86 + ((seed >> 4) & 0xf) * 0.8); // 86–98
  const queue = (hub.backlog ?? 0) + ((seed >> 8) & 0x7);
  const labor = 5 + ((seed >> 12) & 0x3); // 5-8
  const laborActive = Math.max(2, labor - ((seed >> 16) & 0x1));
  const cutOffMin = 18 + ((seed >> 20) & 0x1f); // 18-49 minutes
  const trailerReady = 70 + ((seed >> 22) & 0x1f); // 70-101
  const dwellHrs = (((seed >> 24) & 0xff) / 255) * 3.2 + 0.4; // 0.4–3.6

  const lanes: LaneState[] = [0, 1, 2].map((i) => laneStateFromHash(seed, i));

  const backlogTone =
    (hub.backlog ?? 0) > 16
      ? "breach"
      : (hub.backlog ?? 0) > 8
        ? "at-risk"
        : "on-time";

  return (
    <div className={cn("space-y-5", className)}>
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            ∙ Warehouse Operations
          </div>
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Cut-off in {cutOffMin}m
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Metric
            label="Pick Rate"
            value={`${pickRate}%`}
            caption={pickRate < 92 ? "Below plan" : "On plan"}
            tone={pickRate < 92 ? "at-risk" : "on-time"}
          />
          <Metric
            label="Cross-Dock Queue"
            value={queue.toString()}
            caption={`Vs. plan +${hub.backlog ?? 0}`}
            tone={backlogTone}
          />
          <Metric
            label="Labor Active"
            value={`${laborActive} / ${labor}`}
            caption="Pickers + packers"
            tone={laborActive < labor - 1 ? "at-risk" : "on-time"}
          />
          <Metric
            label="Trailer Readiness"
            value={`${trailerReady}%`}
            caption="Outbound loaded"
            tone={trailerReady < 80 ? "at-risk" : "on-time"}
          />
          <Metric
            label="Avg Dwell"
            value={`${dwellHrs.toFixed(1)}h`}
            caption="Inbound → outbound"
            tone="neutral"
          />
          <Metric
            label="Inventory Aging"
            value="< 24h"
            caption="98% turnover today"
            tone="on-time"
          />
        </div>
      </div>

      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
          ∙ Sortation Lanes
        </div>
        <div className="space-y-2">
          {lanes.map((lane) => (
            <LaneBar key={lane.id} lane={lane} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  caption,
  tone = "neutral",
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "on-time" | "at-risk" | "breach" | "neutral";
}) {
  const color =
    tone === "on-time"
      ? "var(--on-time)"
      : tone === "at-risk"
        ? "var(--at-risk)"
        : tone === "breach"
          ? "var(--breach)"
          : "var(--ink)";
  return (
    <div className="p-3 border border-[color:var(--hairline)] rounded-[3px]">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1">
        {label}
      </div>
      <div
        className="font-serif text-[20px] leading-none"
        style={{ color, fontVariationSettings: '"opsz" 144' }}
      >
        {value}
      </div>
      <div className="font-sans text-[10px] italic text-[color:var(--ink-muted)] mt-1 leading-tight">
        {caption}
      </div>
    </div>
  );
}

function LaneBar({ lane }: { lane: LaneState }) {
  const color =
    lane.state === "slow"
      ? "var(--breach)"
      : lane.state === "watch"
        ? "var(--at-risk)"
        : "var(--on-time)";
  const stateLabel =
    lane.state === "slow"
      ? "Slow"
      : lane.state === "watch"
        ? "Watch"
        : "On Plan";
  return (
    <div className="grid grid-cols-[28px_1fr_60px] items-center gap-3">
      <span className="font-mono text-[11px] text-[color:var(--ink)] tabular-nums">
        Ln {lane.id}
      </span>
      <div className="min-w-0">
        <div className="font-sans text-[11px] text-[color:var(--ink-muted)] leading-tight truncate">
          {lane.description}
        </div>
        <div className="relative h-1 bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] rounded-[1px] overflow-hidden mt-1">
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${lane.utilization}%`, background: color }}
          />
        </div>
      </div>
      <span
        className="font-mono text-[10px] uppercase tracking-[0.18em] text-right"
        style={{ color }}
      >
        {stateLabel}
      </span>
    </div>
  );
}
