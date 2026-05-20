import { type ReactNode } from "react";
import {
  ResponsiveContainer,
  Area,
  AreaChart,
  YAxis,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

export interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number | null;
  deltaLabel?: string;
  spark?: number[];
  tone?: "neutral" | "on-time" | "at-risk" | "breach" | "accent";
  caption?: ReactNode;
  size?: "md" | "lg";
  className?: string;
}

const TONE_COLOR: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  neutral: "var(--ink)",
  "on-time": "var(--on-time)",
  "at-risk": "var(--at-risk)",
  breach: "var(--breach)",
  accent: "var(--accent)",
};

function formatValue(v: string | number) {
  if (typeof v === "number") {
    return v.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  return v;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  spark,
  tone = "neutral",
  caption,
  size = "md",
  className,
}: KpiCardProps) {
  const trend =
    delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  const TrendIcon =
    trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  // For most KPIs, "up" is good. Caller can flip by inverting sign.
  const trendColor =
    trend === "flat"
      ? "var(--ink-muted)"
      : trend === "up"
        ? "var(--on-time)"
        : "var(--breach)";

  const numberSize =
    size === "lg" ? "text-[56px]" : "text-[44px]";

  const sparkColor = TONE_COLOR[tone];
  const sparkData =
    spark && spark.length
      ? spark.map((v, i) => ({ i, v }))
      : null;

  return (
    <div
      className={cn(
        "relative bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5 flex flex-col gap-4",
        "[html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          {label}
        </span>
        {delta != null ? (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] tracking-wide"
            style={{ color: trendColor }}
            title={deltaLabel ?? `${delta > 0 ? "+" : ""}${delta}%`}
          >
            <TrendIcon size={12} />
            {delta > 0 ? "+" : ""}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>

      <div className="flex items-baseline gap-2 min-h-[60px]">
        <span
          className={cn(
            "font-serif font-normal tracking-[-0.02em] leading-none",
            numberSize,
          )}
          style={{
            color: TONE_COLOR[tone],
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {formatValue(value)}
        </span>
        {unit ? (
          <span className="font-mono text-[12px] text-[color:var(--ink-muted)] uppercase tracking-wider">
            {unit}
          </span>
        ) : null}
      </div>

      {caption ? (
        <div className="font-sans text-[12px] text-[color:var(--ink-muted)] leading-snug">
          {caption}
        </div>
      ) : null}

      {sparkData ? (
        <div className="mt-auto pt-3 border-t border-[color:var(--hairline)] -mx-5 -mb-5 px-5 pb-3">
          <div className="h-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={sparkData}
                margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id={`spark-${label.replace(/\W/g, "")}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={sparkColor} stopOpacity={0.22} />
                    <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fill={`url(#spark-${label.replace(/\W/g, "")})`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}
    </div>
  );
}
