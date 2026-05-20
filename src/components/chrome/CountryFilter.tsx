import { useUi, COUNTRIES, type CountryCode } from "@/state/ui";
import { cn } from "@/lib/cn";

export interface CountryFilterProps {
  className?: string;
}

export function CountryFilter({ className }: CountryFilterProps) {
  const active = useUi((s) => s.countryFilter);
  const setActive = useUi((s) => s.setCountryFilter);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 h-9 px-1 rounded-[3px]",
        "bg-[color:var(--panel-soft)] border border-[color:var(--hairline)]",
        className,
      )}
      role="tablist"
      aria-label="Country filter"
    >
      <Chip
        code={"ALL"}
        label="ALL"
        active={active === "ALL"}
        onClick={() => setActive("ALL")}
      />
      <span className="h-4 w-px bg-[color:var(--hairline)] mx-0.5" />
      {COUNTRIES.map((c) => (
        <Chip
          key={c.code}
          code={c.code}
          label={c.code}
          active={active === c.code}
          onClick={() => setActive(c.code)}
          tooltip={c.name}
        />
      ))}
    </div>
  );
}

interface ChipProps {
  code: CountryCode | "ALL";
  label: string;
  active: boolean;
  onClick: () => void;
  tooltip?: string;
}

function Chip({ label, active, onClick, tooltip }: ChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      title={tooltip}
      onClick={onClick}
      className={cn(
        "h-7 px-2 font-mono text-[10px] tracking-[0.18em] rounded-[2px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[color:var(--accent)]",
        active
          ? "bg-[color:var(--accent)] text-[color:var(--ink-on-accent)]"
          : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--panel)]",
      )}
    >
      {label}
    </button>
  );
}
