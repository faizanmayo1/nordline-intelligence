import type { RiskFactor } from "@/lib/risk";
import { cn } from "@/lib/cn";

export interface RiskFactorBarProps {
  factor: RiskFactor;
  className?: string;
}

function colorForIntensity(i: number) {
  if (i >= 65) return "var(--breach)";
  if (i >= 40) return "var(--at-risk)";
  return "var(--on-time)";
}

export function RiskFactorBar({ factor, className }: RiskFactorBarProps) {
  const color = colorForIntensity(factor.intensity);
  return (
    <div className={cn("grid grid-cols-[120px_1fr_44px] items-center gap-3", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
        {factor.label}
      </span>
      <div className="relative h-1.5 bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] rounded-[1px] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
          style={{
            width: `${factor.intensity}%`,
            background: color,
            boxShadow: `0 0 6px ${color}55`,
          }}
        />
      </div>
      <span
        className="font-mono text-[11px] tabular-nums text-right"
        style={{ color }}
      >
        {factor.intensity}
      </span>
      <span className="col-span-3 -mt-1 font-sans text-[11px] italic text-[color:var(--ink-muted)] leading-snug pl-[124px]">
        {factor.detail}
      </span>
    </div>
  );
}
