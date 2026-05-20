import { cn } from "@/lib/cn";

export type MarkerKind = "hub" | "fsl" | "pudo";

export interface MarkerProps {
  pulse?: boolean;
  label?: string;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "at-risk" | "breach" | "on-time";
  className?: string;
}

const SIZE_MAP: Record<NonNullable<MarkerProps["size"]>, number> = {
  sm: 10,
  md: 14,
  lg: 18,
};

function toneColor(tone: NonNullable<MarkerProps["tone"]>) {
  switch (tone) {
    case "at-risk":
      return "var(--at-risk)";
    case "breach":
      return "var(--breach)";
    case "on-time":
      return "var(--on-time)";
    default:
      return "var(--accent)";
  }
}

export function HubMarker({
  pulse,
  label,
  size = "md",
  tone = "default",
  className,
}: MarkerProps) {
  const s = SIZE_MAP[size];
  const color = toneColor(tone);
  return (
    <div
      className={cn("relative flex flex-col items-center", className)}
      style={{ pointerEvents: "auto" }}
    >
      {pulse ? (
        <span
          className="absolute"
          style={{
            width: s * 2.2,
            height: s * 2.2,
            top: -s * 0.6,
            left: `calc(50% - ${s * 1.1}px)`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}33 0%, transparent 60%)`,
            animation: "nordline-pulse 1.8s ease-in-out infinite",
            zIndex: 0,
          }}
        />
      ) : null}
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        style={{ transform: "rotate(45deg)", zIndex: 1 }}
      >
        <rect
          x={1}
          y={1}
          width={s - 2}
          height={s - 2}
          fill="var(--panel)"
          stroke={color}
          strokeWidth={1.5}
        />
        <rect
          x={s / 2 - 1.5}
          y={s / 2 - 1.5}
          width={3}
          height={3}
          fill={color}
        />
      </svg>
      {label ? (
        <span className="mt-1 font-mono text-[8px] tracking-wider text-[color:var(--ink-muted)] bg-[color:var(--panel)]/85 px-1">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function FslMarker({
  pulse,
  label,
  size = "md",
  tone = "on-time",
  className,
}: MarkerProps) {
  const s = SIZE_MAP[size] - 2;
  const color = toneColor(tone);
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {pulse ? (
        <span
          className="absolute"
          style={{
            width: s * 2.4,
            height: s * 2.4,
            top: -s * 0.7,
            left: `calc(50% - ${s * 1.2}px)`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}40 0%, transparent 60%)`,
            animation: "nordline-pulse 1.8s ease-in-out infinite",
          }}
        />
      ) : null}
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ zIndex: 1 }}>
        <rect
          x={1}
          y={1}
          width={s - 2}
          height={s - 2}
          rx={1}
          fill={color}
          stroke="var(--panel)"
          strokeWidth={1}
        />
      </svg>
      {label ? (
        <span className="mt-1 font-mono text-[8px] tracking-wider text-[color:var(--ink-muted)] bg-[color:var(--panel)]/85 px-1">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function PudoMarker({
  pulse,
  label,
  size = "sm",
  tone = "default",
  className,
}: MarkerProps) {
  const s = SIZE_MAP[size];
  const color = tone === "default" ? "var(--ink-muted)" : toneColor(tone);
  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {pulse ? (
        <span
          className="absolute"
          style={{
            width: s * 2.2,
            height: s * 2.2,
            top: -s * 0.6,
            left: `calc(50% - ${s * 1.1}px)`,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${color}33 0%, transparent 60%)`,
            animation: "nordline-pulse 1.8s ease-in-out infinite",
          }}
        />
      ) : null}
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ zIndex: 1 }}>
        <circle
          cx={s / 2}
          cy={s / 2}
          r={s / 2 - 1}
          fill="var(--panel)"
          stroke={color}
          strokeWidth={1.25}
        />
        <circle cx={s / 2} cy={s / 2} r={1.5} fill={color} />
      </svg>
      {label ? (
        <span className="mt-1 font-mono text-[8px] tracking-wider text-[color:var(--ink-muted)] bg-[color:var(--panel)]/85 px-1">
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function MarkerByKind({
  kind,
  ...rest
}: MarkerProps & { kind: MarkerKind }) {
  if (kind === "hub") return <HubMarker {...rest} />;
  if (kind === "fsl") return <FslMarker {...rest} />;
  return <PudoMarker {...rest} />;
}
