import { cn } from "@/lib/cn";

export interface StockBarProps {
  /** current on-hand */
  onHand: number;
  /** reorder threshold */
  reorderPoint: number;
  /** max for the visualization (typically 2.5x reorderPoint) */
  max?: number;
  className?: string;
}

export function StockBar({
  onHand,
  reorderPoint,
  max,
  className,
}: StockBarProps) {
  const top = max ?? Math.max(reorderPoint * 2.5, onHand * 1.2, 1);
  const stockPct = Math.min(100, (onHand / top) * 100);
  const reorderPct = Math.min(100, (reorderPoint / top) * 100);

  const color =
    onHand === 0
      ? "var(--breach)"
      : onHand < reorderPoint * 0.5
        ? "var(--breach)"
        : onHand < reorderPoint
          ? "var(--at-risk)"
          : "var(--on-time)";

  return (
    <div className={cn("relative h-[6px] w-full bg-[color:var(--panel-soft)] border border-[color:var(--hairline)] rounded-[1px] overflow-hidden", className)}>
      {/* Reorder threshold tick */}
      <div
        className="absolute top-0 bottom-0 w-px bg-[color:var(--hairline-strong)]"
        style={{ left: `${reorderPct}%` }}
      />
      {/* Stock fill */}
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${stockPct}%`,
          background: color,
          boxShadow: `0 0 4px ${color}55`,
        }}
      />
    </div>
  );
}
