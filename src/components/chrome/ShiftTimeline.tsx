import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/cn";

interface DeliveryDot {
  /** 0..1 along the 22:00 → 07:00 axis (9 hours) */
  t: number;
  /** "ok" | "watch" | "risk" */
  tone: "ok" | "watch" | "risk";
}

export interface ShiftTimelineProps {
  className?: string;
  dots?: DeliveryDot[];
  /** Real seconds per demo minute (must match ShiftClock) */
  speed?: number;
}

// Distribute a deterministic delivery curve — heavier from 03:00–06:00
function defaultDots(): DeliveryDot[] {
  const dots: DeliveryDot[] = [];
  const samples = 96;
  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    // density curve, peaks at ~0.55 (around 03:00-04:00 hand-off)
    const density = 0.4 + 0.6 * Math.exp(-Math.pow((t - 0.55) * 2.6, 2));
    const count = Math.round(density * 4);
    for (let k = 0; k < count; k++) {
      const jitter = (Math.sin(i * 17 + k * 3.1) + 1) * 0.005;
      const tone: DeliveryDot["tone"] =
        t > 0.78 && Math.abs(Math.sin(i * 7 + k)) > 0.85
          ? "risk"
          : t > 0.65 && Math.abs(Math.sin(i * 5 + k * 2)) > 0.7
            ? "watch"
            : "ok";
      dots.push({ t: t + jitter, tone });
    }
  }
  return dots;
}

const PHASE_MARKERS: { t: number; label: string }[] = [
  { t: 0, label: "22:00" },
  { t: 3 / 9, label: "01:00" }, // start of line-haul
  { t: 7 / 9, label: "05:00" }, // start of final mile
  { t: 1, label: "07:00" },
];

const SHIFT_START_MIN = 22 * 60 + 30; // 22:30 CET — matches ShiftClock

export function ShiftTimeline({
  className,
  dots,
  speed = 1,
}: ShiftTimelineProps) {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const usedDots = useMemo(() => dots ?? defaultDots(), [dots]);

  useEffect(() => {
    const id = setInterval(
      () => setElapsedMinutes((e) => e + 1),
      speed * 1000,
    );
    return () => clearInterval(id);
  }, [speed]);

  // Current position in the 22:00–07:00 (9-hour) window. 22:00 = 0, 07:00 = 1
  const nowMinutes = SHIFT_START_MIN + elapsedMinutes;
  const startWindow = 22 * 60; // 22:00 baseline
  // wrap to 2160-min frame so 07:00 next day = 31:00
  const nowInWindow = nowMinutes >= startWindow ? nowMinutes : nowMinutes + 1440;
  const winLen = 9 * 60; // 9 hours
  const tCurrent = Math.max(
    0,
    Math.min(1, (nowInWindow - startWindow) / winLen),
  );

  return (
    <div
      className={cn(
        "bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px]",
        "px-5 py-3",
        className,
      )}
    >
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            ∙
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            Tonight's Shift
          </span>
          <span className="font-sans text-[11px] italic text-[color:var(--ink-faint)]">
            22:00 — 07:00 CET · 8h 30m window
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          <Legend tone="ok" label="Planned" />
          <Legend tone="watch" label="Watch" />
          <Legend tone="risk" label="At Risk" />
        </div>
      </div>
      <div className="relative h-12 mt-1">
        {/* Axis */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-[color:var(--hairline-strong)]" />
        {/* Phase tick marks + labels */}
        {PHASE_MARKERS.map((p) => (
          <div
            key={p.label}
            className="absolute top-0 bottom-0 flex flex-col items-center"
            style={{ left: `${p.t * 100}%`, transform: "translateX(-50%)" }}
          >
            <div className="h-3 w-px bg-[color:var(--hairline-strong)]" />
            <div className="grow" />
            <div className="font-mono text-[9px] tracking-wider text-[color:var(--ink-faint)] mt-0.5">
              {p.label}
            </div>
          </div>
        ))}

        {/* Dots */}
        {usedDots.map((d, i) => {
          const top =
            d.tone === "risk"
              ? "calc(50% - 8px)"
              : d.tone === "watch"
                ? "calc(50% - 4px)"
                : "calc(50% + 2px)";
          const color =
            d.tone === "risk"
              ? "var(--breach)"
              : d.tone === "watch"
                ? "var(--at-risk)"
                : "var(--on-time)";
          return (
            <span
              key={i}
              className="absolute h-1 w-1 rounded-full"
              style={{
                left: `${d.t * 100}%`,
                top,
                background: color,
                opacity: d.tone === "ok" ? 0.55 : 0.85,
              }}
            />
          );
        })}

        {/* Current time indicator */}
        <div
          className="absolute top-0 bottom-0 w-px bg-[color:var(--accent)]"
          style={{ left: `${tCurrent * 100}%` }}
        >
          <div className="absolute -top-1 -left-[3px] h-[7px] w-[7px] rounded-full bg-[color:var(--accent)] pulse-risk" />
          <div className="absolute -bottom-5 -translate-x-1/2 left-0 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--accent)] whitespace-nowrap">
            Now
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ tone, label }: { tone: DeliveryDot["tone"]; label: string }) {
  const color =
    tone === "risk"
      ? "var(--breach)"
      : tone === "watch"
        ? "var(--at-risk)"
        : "var(--on-time)";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
