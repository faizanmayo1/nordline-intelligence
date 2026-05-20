import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

interface ShiftPhase {
  name: string;
  range: [number, number]; // hours: [startInclusive, endExclusive], in 24h
  color: string;
}

const PHASES: ShiftPhase[] = [
  { name: "Sortation", range: [22, 25], color: "var(--info)" }, // 22:00–01:00
  { name: "Line-Haul", range: [25, 29], color: "var(--accent)" }, // 01:00–05:00
  { name: "Final Mile", range: [29, 31], color: "var(--at-risk)" }, // 05:00–07:00
  { name: "Day Ops", range: [31, 46], color: "var(--ink-muted)" }, // 07:00–22:00 (effectively)
];

// 22:30 CET starting point, expressed as minutes from "00:00 of a 46-hour day"
// to make wrap-around simple.
const START_MINUTES = 22 * 60 + 30;

function minutesToTime(min: number) {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
}

function phaseFor(min: number): ShiftPhase {
  const norm = ((min % 1440) + 1440) % 1440;
  const hour = norm / 60;
  // Map to extended scale where 22:00 = 22, 02:00 = 26
  const extended = hour < 22 ? hour + 24 : hour;
  return (
    PHASES.find((p) => extended >= p.range[0] && extended < p.range[1]) ??
    PHASES[3]
  );
}

export interface ShiftClockProps {
  className?: string;
  /** Real seconds per demo minute. Default 1 means 60× speed. */
  speed?: number;
}

export function ShiftClock({ className, speed = 1 }: ShiftClockProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((e) => e + 1), speed * 1000);
    return () => clearInterval(id);
  }, [speed]);

  const minutes = START_MINUTES + elapsed;
  const time = minutesToTime(minutes);
  const phase = phaseFor(minutes);

  return (
    <div className={cn("flex flex-col items-start leading-none", className)}>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[18px] tabular-nums text-[color:var(--ink)] tracking-tight">
          {time}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
          CET
        </span>
      </div>
      <div className="mt-1 inline-flex items-center gap-2">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full pulse-risk"
          style={{ background: phase.color }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={phase.name}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.25 }}
            className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]"
          >
            {phase.name}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
