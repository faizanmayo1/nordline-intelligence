import { Bell, Search } from "lucide-react";
import { ShiftClock } from "./ShiftClock";
import { CountryFilter } from "./CountryFilter";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/cn";

export interface TopBarProps {
  className?: string;
  alertCount?: number;
}

export function TopBar({ className, alertCount = 12 }: TopBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-16 bg-[color:var(--paper)]/95 backdrop-blur-sm",
        "border-b border-[color:var(--hairline)]",
        className,
      )}
    >
      <div className="h-full px-6 flex items-center gap-6">
        {/* Shift clock — anchor on the left */}
        <ShiftClock />

        {/* Spacer with a hairline */}
        <span className="h-8 w-px bg-[color:var(--hairline)]" />

        {/* Wordmark crumb */}
        <div className="hidden xl:flex items-baseline gap-2 min-w-0">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Live ∙
          </span>
          <span className="font-sans text-[13px] text-[color:var(--ink-muted)] truncate">
            DANX Night Network · 7 countries · 500 routes
          </span>
        </div>

        {/* Right cluster */}
        <div className="ml-auto flex items-center gap-3">
          <CountryFilter />
          <button
            type="button"
            aria-label="Search"
            className={cn(
              "h-9 w-9 inline-flex items-center justify-center rounded-[3px]",
              "border border-[color:var(--hairline-strong)] bg-[color:var(--panel)]",
              "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--panel-soft)] transition-colors",
            )}
          >
            <Search size={14} strokeWidth={1.5} />
          </button>
          <ThemeToggle />
          <AlertBell count={alertCount} />
        </div>
      </div>
    </header>
  );
}

function AlertBell({ count }: { count: number }) {
  return (
    <button
      type="button"
      aria-label={`${count} alerts`}
      className={cn(
        "relative h-9 w-9 inline-flex items-center justify-center rounded-[3px]",
        "border border-[color:var(--hairline-strong)] bg-[color:var(--panel)]",
        "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--panel-soft)] transition-colors",
      )}
    >
      <Bell size={14} strokeWidth={1.5} />
      {count > 0 ? (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 inline-flex items-center justify-center bg-[color:var(--breach)] text-[color:var(--paper)] font-mono text-[9px] tracking-tight rounded-[2px]">
          {count}
        </span>
      ) : null}
    </button>
  );
}
