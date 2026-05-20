import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useUi } from "@/state/ui";
import { cn } from "@/lib/cn";

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const theme = useUi((s) => s.theme);
  const toggle = useUi((s) => s.toggleTheme);
  const isNight = theme === "night";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isNight ? "day" : "night"} mode`}
      title={`Switch to ${isNight ? "Day" : "Night"} Mode`}
      className={cn(
        "group relative inline-flex items-center gap-2 h-9 pl-2 pr-3 rounded-[3px]",
        "border border-[color:var(--hairline-strong)] bg-[color:var(--panel)]",
        "hover:bg-[color:var(--panel-soft)] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent)]",
        className,
      )}
    >
      <span className="relative inline-flex h-6 w-6 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          {isNight ? (
            <motion.span
              key="moon"
              initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute inline-flex"
            >
              <Moon size={14} strokeWidth={1.5} color="var(--accent)" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ rotate: 90, opacity: 0, scale: 0.7 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: -90, opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="absolute inline-flex"
            >
              <Sun size={14} strokeWidth={1.5} color="var(--accent)" />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] group-hover:text-[color:var(--ink)] transition-colors">
        {isNight ? "Night" : "Day"}
      </span>
    </button>
  );
}
