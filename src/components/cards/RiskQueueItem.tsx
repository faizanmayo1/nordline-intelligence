import type { Shipment } from "@/lib/types";
import { NordicEqualizer } from "@/components/charts/NordicEqualizer";
import { Badge } from "@/components/primitives/Badge";
import { cn } from "@/lib/cn";
import { VERTICALS } from "@/data/verticals";

export interface RiskQueueItemProps {
  shipment: Shipment;
  selected?: boolean;
  onSelect?: (id: string) => void;
  index?: number;
}

export function RiskQueueItem({
  shipment,
  selected,
  onSelect,
  index,
}: RiskQueueItemProps) {
  const vertical = VERTICALS[shipment.vertical];

  return (
    <button
      type="button"
      onClick={() => onSelect?.(shipment.id)}
      className={cn(
        "w-full text-left grid grid-cols-[28px_1fr_auto] items-center gap-3",
        "px-4 py-3 transition-colors group cursor-pointer",
        "border-b border-[color:var(--hairline)] last:border-b-0",
        selected
          ? "bg-[color:var(--accent-soft)]/60"
          : "hover:bg-[color:var(--panel-soft)]",
      )}
    >
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums tracking-wider",
          selected
            ? "text-[color:var(--accent)]"
            : "text-[color:var(--ink-faint)]",
        )}
      >
        {(index ?? 0).toString().padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-[10px] text-[color:var(--ink-faint)] tabular-nums">
            {shipment.id}
          </span>
          <Badge variant="neutral" uppercase>
            {vertical.shortName}
          </Badge>
          {shipment.priority === "line-down" ? (
            <Badge variant="breach" uppercase>
              Line-Down
            </Badge>
          ) : shipment.priority === "critical" ? (
            <Badge variant="at-risk" uppercase>
              Critical
            </Badge>
          ) : null}
        </div>
        <div className="font-sans text-[13px] text-[color:var(--ink)] truncate">
          {shipment.partDescription}
        </div>
        <div className="font-mono text-[10px] text-[color:var(--ink-muted)] truncate">
          {shipment.customerName} · SLA {shipment.slaDeadline} · {shipment.country}
        </div>
      </div>

      <NordicEqualizer
        score={shipment.riskScore}
        size="sm"
        drivers={shipment.riskDrivers}
        showLabel
      />
    </button>
  );
}
