import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "neutral"
  | "on-time"
  | "at-risk"
  | "breach"
  | "info"
  | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  uppercase?: boolean;
  dot?: boolean;
}

const VARIANT_TEXT: Record<BadgeVariant, string> = {
  neutral: "text-[color:var(--ink-muted)] border-[color:var(--hairline-strong)]",
  "on-time": "text-[color:var(--on-time)] border-[color:var(--on-time)]/40",
  "at-risk": "text-[color:var(--at-risk)] border-[color:var(--at-risk)]/40",
  breach: "text-[color:var(--breach)] border-[color:var(--breach)]/40",
  info: "text-[color:var(--info)] border-[color:var(--info)]/40",
  accent: "text-[color:var(--accent)] border-[color:var(--accent)]/40",
};

const VARIANT_DOT: Record<BadgeVariant, string> = {
  neutral: "bg-[color:var(--ink-muted)]",
  "on-time": "bg-[color:var(--on-time)]",
  "at-risk": "bg-[color:var(--at-risk)]",
  breach: "bg-[color:var(--breach)]",
  info: "bg-[color:var(--info)]",
  accent: "bg-[color:var(--accent)]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      className,
      variant = "neutral",
      uppercase = true,
      dot = false,
      children,
      ...rest
    },
    ref,
  ) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.18em]",
        "border rounded-[2px] px-1.5 h-5 leading-none",
        "bg-transparent",
        VARIANT_TEXT[variant],
        uppercase && "uppercase",
        className,
      )}
      {...rest}
    >
      {dot ? (
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            VARIANT_DOT[variant],
          )}
        />
      ) : null}
      {children}
    </span>
  ),
);
Badge.displayName = "Badge";
