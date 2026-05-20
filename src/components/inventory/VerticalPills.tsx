import { VERTICALS, VERTICAL_ORDER } from "@/data/verticals";
import type { Vertical } from "@/lib/types";
import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

export interface VerticalPillsProps {
  active: Vertical;
  onChange: (v: Vertical) => void;
  className?: string;
}

export function VerticalPills({ active, onChange, className }: VerticalPillsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {VERTICAL_ORDER.map((key) => {
        const v = VERTICALS[key];
        const isActive = active === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            aria-pressed={isActive}
            className={cn(
              "relative h-9 px-3.5 rounded-[3px] inline-flex items-center gap-2 transition-colors",
              "border",
              isActive
                ? "border-[color:var(--ink)] bg-[color:var(--panel)]"
                : "border-[color:var(--hairline)] bg-[color:var(--panel-soft)]/60 hover:bg-[color:var(--panel)]",
            )}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: `var(${v.varToken})` }}
            />
            <span
              className={cn(
                "font-sans text-[12px] tracking-tight",
                isActive
                  ? "text-[color:var(--ink)]"
                  : "text-[color:var(--ink-muted)]",
              )}
            >
              {v.shortName}
            </span>
            {isActive ? (
              <motion.span
                layoutId="vertical-active"
                className="absolute left-2 right-2 -bottom-px h-[2px] bg-[color:var(--accent)]"
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
