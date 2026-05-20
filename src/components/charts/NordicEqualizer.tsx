import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/cn";

export interface NordicEqualizerProps {
  score: number; // 0–100
  drivers?: string[];
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

// 9 segments with ascending heights — equalizer profile
const SEG_HEIGHTS: Record<NonNullable<NordicEqualizerProps["size"]>, number[]> = {
  sm: [4, 6, 8, 10, 12, 14, 17, 20, 23],
  md: [5, 8, 11, 14, 17, 20, 24, 28, 32],
  lg: [7, 11, 15, 19, 24, 29, 34, 40, 46],
};

const SEG_WIDTH: Record<NonNullable<NordicEqualizerProps["size"]>, number> = {
  sm: 3,
  md: 4,
  lg: 5,
};

const SEG_GAP: Record<NonNullable<NordicEqualizerProps["size"]>, number> = {
  sm: 2,
  md: 3,
  lg: 4,
};

function colorForSegment(idx: number): string {
  // idx is 0-based; 9 total
  if (idx <= 2) return "var(--on-time)";
  if (idx <= 5) return "var(--at-risk)";
  return "var(--breach)";
}

function severityLabel(score: number) {
  if (score < 33) return "On-Track";
  if (score < 66) return "At Risk";
  return "Breach Imminent";
}

export function NordicEqualizer({
  score,
  drivers,
  size = "md",
  className,
  showLabel = true,
}: NordicEqualizerProps) {
  const clamped = Math.max(0, Math.min(100, score));
  // 0..100 → 0..9 lit
  const lit = Math.max(1, Math.round((clamped / 100) * 9));
  const heights = SEG_HEIGHTS[size];
  const tipColor =
    score < 33 ? "var(--on-time)" : score < 66 ? "var(--at-risk)" : "var(--breach)";

  const bars = (
    <div className="inline-flex items-end gap-[3px]" style={{ gap: SEG_GAP[size] }}>
      {heights.map((h, idx) => {
        const isLit = idx < lit;
        const color = colorForSegment(idx);
        return (
          <span
            key={idx}
            className={cn(
              "inline-block rounded-[1px] transition-colors",
              isLit ? "" : "opacity-30",
            )}
            style={{
              height: h,
              width: SEG_WIDTH[size],
              background: isLit ? color : "var(--hairline-strong)",
              boxShadow: isLit
                ? `0 0 6px 0 ${color}33`
                : "none",
            }}
          />
        );
      })}
    </div>
  );

  const visual = (
    <div
      className={cn(
        "inline-flex flex-col items-start gap-1 select-none cursor-default",
        className,
      )}
    >
      {bars}
      {showLabel ? (
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: tipColor }}
          >
            {clamped.toFixed(0)}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
            {severityLabel(clamped)}
          </span>
        </div>
      ) : null}
    </div>
  );

  if (!drivers || drivers.length === 0) return visual;

  return (
    <TooltipPrimitive.Provider delayDuration={150}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{visual}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            sideOffset={8}
            className="z-50 bg-[color:var(--panel)] border border-[color:var(--hairline-strong)] rounded-[3px] px-3 py-2 max-w-[260px]"
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1.5">
              Risk Drivers
            </div>
            <ul className="space-y-1">
              {drivers.map((d, i) => (
                <li
                  key={i}
                  className="font-sans text-[12px] text-[color:var(--ink)] flex items-start gap-1.5"
                >
                  <span
                    className="mt-1.5 inline-block h-1 w-1 rounded-full shrink-0"
                    style={{ background: tipColor }}
                  />
                  {d}
                </li>
              ))}
            </ul>
            <TooltipPrimitive.Arrow className="fill-[color:var(--panel)]" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
