import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export interface SerifHeadlineProps {
  kicker?: string;
  title: string;
  supporting?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  align?: "left" | "center";
}

const SIZE_CLASSES: Record<NonNullable<SerifHeadlineProps["size"]>, string> = {
  sm: "text-[26px] leading-[1.05]",
  md: "text-[34px] leading-[1.02]",
  lg: "text-[44px] leading-[1.0]",
  xl: "text-[56px] leading-[0.98]",
};

export function SerifHeadline({
  kicker,
  title,
  supporting,
  size = "md",
  className,
  align = "left",
}: SerifHeadlineProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {kicker ? (
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          <span className="text-[color:var(--accent)]">∙</span>{" "}
          <span>{kicker}</span>
        </div>
      ) : null}
      <h1
        className={cn(
          "font-serif font-normal tracking-[-0.012em] text-[color:var(--ink)]",
          SIZE_CLASSES[size],
        )}
        style={{ fontVariationSettings: '"opsz" 120' }}
      >
        {title}
      </h1>
      {supporting ? (
        <p className="max-w-[68ch] font-sans text-[14px] leading-[1.55] text-[color:var(--ink-muted)] italic">
          {supporting}
        </p>
      ) : null}
    </header>
  );
}
