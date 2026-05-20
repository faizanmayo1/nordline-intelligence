import { useMemo } from "react";
import {
  ResponsiveContainer,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import type { InventoryItem } from "@/lib/types";

export interface DemandForecastChartProps {
  item?: InventoryItem;
  className?: string;
}

interface SeriesPoint {
  day: number;
  label: string;
  onHand: number;
  demand: number;
  inbound: number;
}

function generateSeries(item: InventoryItem): SeriesPoint[] {
  // Build a 30-day projection: 14 days history + today + 15 days forward.
  // Deterministic by sku hash.
  let seed = 0;
  for (let i = 0; i < item.sku.length; i++) {
    seed = (seed * 31 + item.sku.charCodeAt(i)) | 0;
  }
  const r = (x: number) => {
    seed = (seed * 1103515245 + 12345 + x) | 0;
    return ((seed >>> 16) & 0x7fff) / 0x7fff;
  };

  const dailyDemand = item.weeklyDemand / 7;
  let onHandBack = item.onHand + dailyDemand * 14;
  const pts: SeriesPoint[] = [];
  for (let d = -14; d <= 15; d++) {
    const noise = (r(d + 100) - 0.5) * dailyDemand * 0.6;
    const demand = Math.max(0, Math.round(dailyDemand + noise));
    const inbound = d === 5 ? Math.round(item.weeklyDemand * 1.4) : 0;
    if (d <= 0) {
      onHandBack -= demand;
      pts.push({
        day: d,
        label: d === 0 ? "Today" : `D${d}`,
        onHand: Math.max(0, Math.round(onHandBack)),
        demand,
        inbound: 0,
      });
    } else {
      const prev = pts[pts.length - 1];
      const projected = Math.max(0, prev.onHand - demand + inbound);
      pts.push({
        day: d,
        label: `D+${d}`,
        onHand: projected,
        demand,
        inbound,
      });
    }
  }
  return pts;
}

export function DemandForecastChart({ item, className }: DemandForecastChartProps) {
  const series = useMemo(
    () => (item ? generateSeries(item) : []),
    [item],
  );

  return (
    <div
      className={"bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5 " + (className ?? "")}
    >
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            ∙ Demand Projection
          </div>
          <div className="font-serif text-[16px] text-[color:var(--ink)] leading-none mt-1.5">
            {item ? item.partName : "Select a SKU"}
          </div>
          <div className="font-mono text-[10px] tabular-nums text-[color:var(--ink-muted)] mt-1">
            {item ? `${item.sku} · 30-day projection · weekly demand ${item.weeklyDemand}` : "—"}
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          <Legend color="var(--accent)" label="On Hand" />
          <Legend color="var(--at-risk)" label="Demand" />
          <Legend color="var(--info)" label="Inbound" dotted />
        </div>
      </div>

      <div className="h-[200px]">
        {series.length === 0 ? null : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={series} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="onhand-grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--hairline)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--ink-faint)", fontFamily: "JetBrains Mono", fontSize: 9 }}
                tickLine={false}
                axisLine={{ stroke: "var(--hairline-strong)" }}
                interval={5}
              />
              <YAxis
                tick={{ fill: "var(--ink-faint)", fontFamily: "JetBrains Mono", fontSize: 9 }}
                tickLine={false}
                axisLine={{ stroke: "var(--hairline-strong)" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--panel)",
                  border: "1px solid var(--hairline-strong)",
                  borderRadius: 3,
                  fontFamily: "JetBrains Mono",
                  fontSize: 11,
                  color: "var(--ink)",
                }}
                labelStyle={{ color: "var(--ink-muted)", fontSize: 9, textTransform: "uppercase" }}
                cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "2 3" }}
              />
              <ReferenceLine
                x="Today"
                stroke="var(--accent)"
                strokeWidth={1}
                strokeDasharray="3 3"
                label={{
                  value: "Today",
                  position: "top",
                  fill: "var(--accent)",
                  fontSize: 9,
                  fontFamily: "JetBrains Mono",
                }}
              />
              <Area
                type="monotone"
                dataKey="onHand"
                stroke="var(--accent)"
                strokeWidth={1.5}
                fill="url(#onhand-grad)"
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="demand"
                stroke="var(--at-risk)"
                strokeWidth={1.2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="step"
                dataKey="inbound"
                stroke="var(--info)"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={{ r: 2.5, fill: "var(--info)" }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function Legend({ color, label, dotted }: { color: string; label: string; dotted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-[2px] w-4"
        style={{
          background: dotted
            ? `repeating-linear-gradient(to right, ${color} 0 2px, transparent 2px 5px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}
