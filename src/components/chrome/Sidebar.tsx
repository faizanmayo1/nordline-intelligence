import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Radio,
  AlertTriangle,
  PackageSearch,
  Route as RouteIcon,
  Sparkles,
  FileText,
  Network,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface NavItem {
  to: string;
  index: string;
  label: string;
  Icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: "/control-tower", index: "01", label: "Control Tower", Icon: Radio },
  { to: "/sla-risk", index: "02", label: "SLA Risk", Icon: AlertTriangle },
  { to: "/inventory", index: "03", label: "Inventory", Icon: PackageSearch },
  { to: "/route-optimization", index: "04", label: "Route Optimization", Icon: RouteIcon },
  { to: "/assistant", index: "05", label: "Assistant", Icon: Sparkles },
  { to: "/customer-report", index: "06", label: "Customer Report", Icon: FileText },
  { to: "/architecture", index: "07", label: "Architecture", Icon: Network },
];

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className={cn(
        "flex flex-col w-[224px] shrink-0 h-screen sticky top-0",
        "bg-[color:var(--paper)] border-r border-[color:var(--hairline)]",
      )}
    >
      {/* Masthead */}
      <div className="px-5 pt-6 pb-5 border-b border-[color:var(--hairline)]">
        <div className="font-mono text-[9px] uppercase tracking-[0.32em] text-[color:var(--ink-faint)] mb-1.5">
          ∙ Nordline ∙
        </div>
        <div
          className="font-serif text-[22px] leading-none text-[color:var(--ink)]"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          Intelligence
        </div>
        <div className="mt-3 font-sans text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
          Night Network · v0.1
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3">
        <div className="px-5 pb-2 font-mono text-[9px] uppercase tracking-[0.32em] text-[color:var(--ink-faint)]">
          Sections
        </div>
        <ul>
          {NAV.map((item) => {
            const isActive =
              pathname === item.to ||
              (item.to !== "/" && pathname.startsWith(item.to));
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive: navActive }) =>
                    cn(
                      "relative group flex items-center gap-3 pl-5 pr-4 h-10 transition-colors",
                      "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)]",
                      (navActive || isActive) &&
                        "text-[color:var(--ink)] bg-[color:var(--accent-soft)]/60",
                    )
                  }
                >
                  {isActive ? (
                    <motion.span
                      layoutId="active-bar"
                      className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[color:var(--accent)] rounded-r-[1px]"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "font-mono text-[10px] tracking-wider tabular-nums w-5",
                      isActive
                        ? "text-[color:var(--accent)]"
                        : "text-[color:var(--ink-faint)] group-hover:text-[color:var(--ink-muted)]",
                    )}
                  >
                    {item.index}
                  </span>
                  <item.Icon
                    size={14}
                    strokeWidth={1.5}
                    className={cn(
                      "shrink-0",
                      isActive
                        ? "text-[color:var(--accent)]"
                        : "text-[color:var(--ink-muted)] group-hover:text-[color:var(--ink)]",
                    )}
                  />
                  <span className="font-sans text-[13px]">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[color:var(--hairline)]">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-1">
          Coverage
        </div>
        <div className="font-sans text-[11px] text-[color:var(--ink-muted)] leading-snug">
          DANX · Nordics, Baltics &amp; Poland
        </div>
        <div className="mt-3 flex items-center gap-1.5">
          <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--on-time)] pulse-risk" />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
            Network Online
          </span>
        </div>
      </div>
    </aside>
  );
}
