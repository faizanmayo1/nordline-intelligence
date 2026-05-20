import { Users, Gauge, Coins, Leaf } from "lucide-react";
import { cn } from "@/lib/cn";

export interface FleetDriverCardProps {
  /** When the disruption is active, fleet metrics shift slightly */
  disrupted?: boolean;
  className?: string;
}

interface DriverRow {
  initials: string;
  name: string;
  hub: string;
  hours: number; // hours of service used (max 10)
  state: "rest-ok" | "tight" | "swap-needed";
}

const DRIVERS_BASE: DriverRow[] = [
  { initials: "LE", name: "Lars Eriksson", hub: "SE-H01", hours: 6.4, state: "rest-ok" },
  { initials: "MK", name: "Mira Kallio", hub: "FI-H01", hours: 7.8, state: "tight" },
  { initials: "JN", name: "Jonas Nordbø", hub: "NO-H01", hours: 5.2, state: "rest-ok" },
  { initials: "AP", name: "Anna Petersen", hub: "DK-H01", hours: 8.9, state: "swap-needed" },
  { initials: "TW", name: "Tomasz Wójcik", hub: "PL-H01", hours: 6.0, state: "rest-ok" },
];

export function FleetDriverCard({ disrupted, className }: FleetDriverCardProps) {
  const drivers = disrupted
    ? DRIVERS_BASE.map((d) => ({
        ...d,
        hours: Math.min(10, d.hours + 0.4),
        state: d.state === "rest-ok" && d.hours + 0.4 > 7.5 ? "tight" : d.state,
      }))
    : DRIVERS_BASE;

  const utilisation = disrupted ? 88.4 : 84.1;
  const idleMin = disrupted ? 42 : 38;
  const costPerShip = disrupted ? 549 : 534;
  const co2PerShip = disrupted ? 0.84 : 0.81;

  return (
    <div
      className={cn(
        "bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5",
        className,
      )}
    >
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            ∙ Fleet &amp; Driver
          </div>
          <div className="font-serif text-[16px] text-[color:var(--ink)] leading-none mt-1">
            Tonight's utilisation
          </div>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
          {disrupted ? "Post-detour" : "Pre-disruption"}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <Stat icon={Gauge} label="Utilisation" value={`${utilisation.toFixed(1)}%`} />
        <Stat icon={Users} label="Active Drivers" value="412 / 500" />
        <Stat icon={Coins} label="Cost / Ship" value={`€${costPerShip}`} />
        <Stat icon={Leaf} label="Idle Avg" value={`${idleMin}m`} />
      </div>

      <div className="mt-5 pt-4 border-t border-[color:var(--hairline)]">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-3">
          ∙ Top Drivers · Hours of Service
        </div>
        <ul className="space-y-2">
          {drivers.map((d) => (
            <li key={d.initials} className="grid grid-cols-[28px_1fr_70px_90px] items-center gap-3">
              <span className="h-7 w-7 inline-flex items-center justify-center bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] font-mono text-[10px] text-[color:var(--ink)] rounded-[2px]">
                {d.initials}
              </span>
              <div className="min-w-0">
                <div className="font-sans text-[12px] text-[color:var(--ink)] truncate">
                  {d.name}
                </div>
                <div className="font-mono text-[10px] text-[color:var(--ink-muted)]">
                  {d.hub}
                </div>
              </div>
              <HoursBar hours={d.hours} />
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-right"
                style={{
                  color:
                    d.state === "swap-needed"
                      ? "var(--breach)"
                      : d.state === "tight"
                        ? "var(--at-risk)"
                        : "var(--on-time)",
                }}
              >
                {d.state === "swap-needed"
                  ? "Swap 04:00"
                  : d.state === "tight"
                    ? "Tight"
                    : "Rest OK"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 pt-4 border-t border-[color:var(--hairline)]">
        <div className="grid grid-cols-3 gap-3">
          <MiniRow label="CO₂ / Ship" value={`${co2PerShip.toFixed(2)} kg`} />
          <MiniRow label="Capacity / Region" value="73% avg" />
          <MiniRow label="Failed-Del. Cost" value="€2,140" tone="on-time" caption="−18%" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
}) {
  return (
    <div className="p-3 border border-[color:var(--hairline)] rounded-[3px]">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1">
        <Icon size={11} strokeWidth={1.5} />
        {label}
      </div>
      <div
        className="font-serif text-[18px] leading-none text-[color:var(--ink)]"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {value}
      </div>
    </div>
  );
}

function HoursBar({ hours }: { hours: number }) {
  const pct = Math.min(100, (hours / 10) * 100);
  const color =
    hours >= 8.5
      ? "var(--breach)"
      : hours >= 7.5
        ? "var(--at-risk)"
        : "var(--on-time)";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-1 w-full bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] rounded-[1px] overflow-hidden">
        <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="font-mono text-[10px] tabular-nums text-[color:var(--ink-muted)]">
        {hours.toFixed(1)}h
      </span>
    </div>
  );
}

function MiniRow({
  label,
  value,
  tone,
  caption,
}: {
  label: string;
  value: string;
  tone?: "on-time";
  caption?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="font-mono text-[12px] tabular-nums leading-none"
          style={{ color: tone === "on-time" ? "var(--on-time)" : "var(--ink)" }}
        >
          {value}
        </span>
        {caption ? (
          <span
            className="font-mono text-[9px] tabular-nums"
            style={{ color: "var(--on-time)" }}
          >
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
}
