import type { InventoryItem } from "@/lib/types";
import { Badge } from "@/components/primitives/Badge";
import { StockBar } from "./StockBar";
import { NODE_BY_ID } from "@/data/network";
import { cn } from "@/lib/cn";

export interface InventoryTableProps {
  items: InventoryItem[];
  selectedSku?: string;
  onSelect?: (sku: string, fslId: string) => void;
  className?: string;
}

export function InventoryTable({
  items,
  selectedSku,
  onSelect,
  className,
}: InventoryTableProps) {
  return (
    <div
      className={cn(
        "bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] overflow-hidden",
        className,
      )}
    >
      <div className="px-4 py-3 border-b border-[color:var(--hairline)] flex items-baseline justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            SKUs in Vertical
          </div>
          <div className="font-serif text-[14px] text-[color:var(--ink)] leading-none mt-1">
            Ordered by days of cover
          </div>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-[color:var(--ink-faint)]">
          {items.length} SKUs
        </span>
      </div>

      <div className="max-h-[460px] overflow-y-auto">
        {/* Header */}
        <div className="grid grid-cols-[140px_1.4fr_100px_60px_70px_1fr] gap-3 px-4 py-2 border-b border-[color:var(--hairline)] bg-[color:var(--panel-soft)] sticky top-0 z-10">
          <Th>SKU</Th>
          <Th>Part / FSL</Th>
          <Th>Stock</Th>
          <Th align="right">On Hand</Th>
          <Th align="right">Cover (d)</Th>
          <Th>Health</Th>
        </div>

        {items.map((item) => {
          const fsl = NODE_BY_ID.get(item.fslId);
          const isSelected = selectedSku === item.sku && onSelect != null;
          const ratio = item.onHand / Math.max(1, item.reorderPoint);
          const tone =
            item.onHand === 0
              ? "breach"
              : ratio < 0.5
                ? "breach"
                : ratio < 1
                  ? "at-risk"
                  : ratio < 1.2
                    ? "at-risk"
                    : "on-time";
          const healthLabel =
            tone === "breach"
              ? item.predictedShortageHours != null && item.predictedShortageHours < 24
                ? `Stockout ~${item.predictedShortageHours}h`
                : "Critical"
              : tone === "at-risk"
                ? item.predictedShortageHours != null
                  ? `Shortage ${item.predictedShortageHours}h`
                  : "Watch"
                : "Healthy";

          return (
            <button
              key={`${item.sku}-${item.fslId}`}
              type="button"
              onClick={() => onSelect?.(item.sku, item.fslId)}
              className={cn(
                "w-full text-left grid grid-cols-[140px_1.4fr_100px_60px_70px_1fr] gap-3 items-center",
                "px-4 py-3 border-b border-[color:var(--hairline)] last:border-b-0",
                "transition-colors",
                isSelected
                  ? "bg-[color:var(--accent-soft)]/60"
                  : "hover:bg-[color:var(--panel-soft)]",
              )}
            >
              <span className="font-mono text-[11px] tabular-nums text-[color:var(--ink)]">
                {item.sku}
              </span>
              <div className="min-w-0">
                <div className="font-sans text-[12px] text-[color:var(--ink)] truncate">
                  {item.partName}
                </div>
                <div className="font-mono text-[10px] text-[color:var(--ink-muted)]">
                  {fsl?.name} · {fsl?.country}
                </div>
              </div>
              <StockBar onHand={item.onHand} reorderPoint={item.reorderPoint} />
              <span className="font-mono text-[12px] tabular-nums text-[color:var(--ink)] text-right">
                {item.onHand}
              </span>
              <span
                className="font-mono text-[12px] tabular-nums text-right"
                style={{
                  color:
                    item.daysOfCover < 1
                      ? "var(--breach)"
                      : item.daysOfCover < 3
                        ? "var(--at-risk)"
                        : "var(--ink-muted)",
                }}
              >
                {item.daysOfCover.toFixed(1)}
              </span>
              <span>
                <Badge variant={tone} dot uppercase>
                  {healthLabel}
                </Badge>
              </span>
            </button>
          );
        })}
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center font-sans text-[12px] italic text-[color:var(--ink-faint)]">
            No SKUs in this vertical for the current scope.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <span
      className={cn(
        "font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]",
        align === "right" && "text-right",
      )}
    >
      {children}
    </span>
  );
}
