import { motion } from "framer-motion";
import {
  Truck,
  Warehouse,
  Database,
  Satellite,
  Package,
  ScanLine,
  CloudSnow,
  TrafficCone,
  Workflow,
  Shield,
  Globe,
  type LucideIcon,
} from "lucide-react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";

interface Connector {
  key: string;
  name: string;
  kicker: string;
  icon: LucideIcon;
  bullets: string[];
  /** Angle on the circle in degrees */
  angle: number;
}

const CONNECTORS: Connector[] = [
  {
    key: "tms",
    name: "TMS",
    kicker: "Transportation Mgmt",
    icon: Truck,
    bullets: ["Shipment lifecycle events", "Driver and vehicle plans", "Routing constraints"],
    angle: 0,
  },
  {
    key: "wms",
    name: "WMS",
    kicker: "Warehouse Mgmt",
    icon: Warehouse,
    bullets: ["Pick + pack confirmations", "Cross-dock cut-off signals", "Stock movements at FSL"],
    angle: 45,
  },
  {
    key: "erp",
    name: "ERP",
    kicker: "Customer SAP / Oracle",
    icon: Database,
    bullets: ["Service order intake", "Customer master + SLAs", "Invoicing reconciliation"],
    angle: 90,
  },
  {
    key: "telematics",
    name: "Telematics",
    kicker: "GPS / Vehicle Bus",
    icon: Satellite,
    bullets: ["Real-time vehicle positions", "Driver hours-of-service", "Engine + temperature signals"],
    angle: 135,
  },
  {
    key: "pudo",
    name: "PUDO",
    kicker: "Locker & Partner Network",
    icon: Package,
    bullets: ["Locker availability + access codes", "Partner shop opening hours", "Drop-off confirmations"],
    angle: 180,
  },
  {
    key: "pod",
    name: "POD",
    kicker: "Proof-of-Delivery",
    icon: ScanLine,
    bullets: ["Photo + signature capture", "Cold-chain seal verification", "Geo-fenced confirmations"],
    angle: 225,
  },
  {
    key: "weather",
    name: "Weather",
    kicker: "Met. Feeds (DMI / SMHI / FMI)",
    icon: CloudSnow,
    bullets: ["Hourly forecasts per corridor", "Storm + advisory alerts", "Visibility + road-surface state"],
    angle: 270,
  },
  {
    key: "traffic",
    name: "Traffic",
    kicker: "HERE / TomTom / National",
    icon: TrafficCone,
    bullets: ["Live congestion overlay", "Roadworks + closures", "Border + customs wait times"],
    angle: 315,
  },
];

const EVENT_FLOW = [
  {
    time: "22:34:02",
    title: "WMS pick complete",
    detail: "SKU SH-MRI-C42 packed at Helsinki Hub",
  },
  {
    time: "22:34:02",
    title: "Shipment event ingested",
    detail: "Bus published, durable to ledger",
  },
  {
    time: "22:34:03",
    title: "ETA engine recalculated",
    detail: "Route RT-0287 promoted to active",
  },
  {
    time: "22:34:03",
    title: "Customer portal pushed",
    detail: "Siemens ops sees updated ETA 06:42",
  },
  {
    time: "22:34:03",
    title: "SLA dashboard refreshed",
    detail: "Screen 02 + executive deck in sync",
  },
];

const CANVAS_W = 880;
const CANVAS_H = 560;
const CENTER = { x: CANVAS_W / 2, y: CANVAS_H / 2 };
const RADIUS = 230;

function position(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + Math.cos(rad) * RADIUS,
    y: CENTER.y + Math.sin(rad) * RADIUS,
  };
}

export function Architecture() {
  return (
    <div className="px-8 py-8">
      <SerifHeadline
        kicker="07 ∙ Integration & Architecture"
        title="The Connectors Underneath."
        supporting={
          <>
            TMS, WMS, ERP, telematics, PUDO lockers, weather and traffic feeds —
            and the event bus that keeps every screen in this product honest.
            Built for DANX's existing landscape, not a greenfield rewrite.
          </>
        }
        size="lg"
      />

      {/* Architecture canvas */}
      <div className="mt-8 bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] overflow-hidden">
        <div className="px-6 py-4 border-b border-[color:var(--hairline)] flex items-baseline justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
              ∙ Operating Layer
            </div>
            <div className="font-serif text-[18px] text-[color:var(--ink)] leading-none mt-1">
              Event-driven core with eight external surfaces
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Multi-country · multi-currency · audit-logged
          </span>
        </div>

        <div className="relative">
          <svg
            viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
            className="w-full h-auto"
            style={{ background: "var(--panel-soft)" }}
          >
            {/* Subtle dot grid */}
            <defs>
              <pattern id="grid-dots" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.8" fill="var(--hairline-strong)" opacity="0.35" />
              </pattern>
              <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={CANVAS_W} height={CANVAS_H} fill="url(#grid-dots)" />

            {/* Connection lines */}
            {CONNECTORS.map((c, i) => {
              const p = position(c.angle);
              return (
                <g key={`line-${c.key}`}>
                  <line
                    x1={CENTER.x}
                    y1={CENTER.y}
                    x2={p.x}
                    y2={p.y}
                    stroke="var(--hairline-strong)"
                    strokeWidth={1}
                    strokeDasharray="3 4"
                  />
                  {/* Animated dot traveling along the line */}
                  <motion.circle
                    r={3}
                    fill="var(--accent)"
                    initial={{ cx: CENTER.x, cy: CENTER.y, opacity: 0 }}
                    animate={{
                      cx: [CENTER.x, p.x, CENTER.x],
                      cy: [CENTER.y, p.y, CENTER.y],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3.4,
                      repeat: Infinity,
                      delay: i * 0.32,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              );
            })}

            {/* Core node halo */}
            <circle cx={CENTER.x} cy={CENTER.y} r={120} fill="url(#core-glow)" />

            {/* Core node */}
            <g transform={`translate(${CENTER.x - 90}, ${CENTER.y - 56})`}>
              <rect
                x="0"
                y="0"
                width="180"
                height="112"
                rx="3"
                fill="var(--panel)"
                stroke="var(--accent)"
                strokeWidth="1.5"
              />
              <text
                x="90"
                y="34"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="9"
                letterSpacing="2.5"
                fill="var(--accent)"
              >
                ∙ NORDLINE ∙
              </text>
              <text
                x="90"
                y="64"
                textAnchor="middle"
                fontFamily="Fraunces, serif"
                fontSize="22"
                fill="var(--ink)"
              >
                Intelligence Core
              </text>
              <text
                x="90"
                y="86"
                textAnchor="middle"
                fontFamily="JetBrains Mono"
                fontSize="9"
                letterSpacing="2"
                fill="var(--ink-muted)"
              >
                EVENT BUS · ETA · SLA · AI
              </text>
            </g>

            {/* Connector nodes */}
            {CONNECTORS.map((c) => {
              const p = position(c.angle);
              // Anchor the box outward from the center
              const offsetX =
                Math.cos((c.angle * Math.PI) / 180) > 0.2
                  ? 8
                  : Math.cos((c.angle * Math.PI) / 180) < -0.2
                    ? -116
                    : -54;
              const offsetY =
                Math.sin((c.angle * Math.PI) / 180) > 0.2
                  ? 8
                  : Math.sin((c.angle * Math.PI) / 180) < -0.2
                    ? -52
                    : -22;

              return (
                <g
                  key={c.key}
                  transform={`translate(${p.x + offsetX}, ${p.y + offsetY})`}
                >
                  <rect
                    x="0"
                    y="0"
                    width="108"
                    height="44"
                    rx="2"
                    fill="var(--panel)"
                    stroke="var(--hairline-strong)"
                    strokeWidth="1"
                  />
                  <text
                    x="12"
                    y="18"
                    fontFamily="JetBrains Mono"
                    fontSize="9"
                    letterSpacing="2"
                    fill="var(--ink-muted)"
                  >
                    {c.kicker.toUpperCase()}
                  </text>
                  <text
                    x="12"
                    y="35"
                    fontFamily="Fraunces, serif"
                    fontSize="16"
                    fill="var(--ink)"
                  >
                    {c.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Event flow strip */}
      <div className="mt-6 bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-6">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
              ∙ Event Choreography
            </div>
            <div className="font-serif text-[20px] text-[color:var(--ink)] leading-none mt-1.5">
              One pick → five updates → under a second
            </div>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Tonight at 22:34:02 CET · trace ID 0xA3F1D9
          </span>
        </div>

        <div className="relative grid grid-cols-5 gap-3">
          {/* Connector line */}
          <div className="absolute top-[18px] left-[6%] right-[6%] h-px bg-[color:var(--hairline-strong)]" />

          {EVENT_FLOW.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.15, duration: 0.3 }}
              className="relative pl-1"
            >
              <div className="relative h-[36px] flex items-center">
                <span className="z-10 h-3 w-3 rounded-full bg-[color:var(--accent)] shadow-[0_0_0_3px_var(--panel)]" />
              </div>
              <div className="font-mono text-[10px] tabular-nums text-[color:var(--ink-faint)] mt-1">
                {step.time}
              </div>
              <div className="font-serif text-[15px] leading-tight text-[color:var(--ink)] mt-0.5">
                {step.title}
              </div>
              <div className="font-sans text-[11px] italic text-[color:var(--ink-muted)] leading-snug mt-1">
                {step.detail}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connector detail cards */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        {CONNECTORS.map((c) => (
          <div
            key={c.key}
            className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <c.icon size={14} strokeWidth={1.5} className="text-[color:var(--accent)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                {c.kicker}
              </span>
            </div>
            <h3
              className="font-serif text-[18px] leading-none text-[color:var(--ink)] mb-3"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              {c.name}
            </h3>
            <ul className="space-y-1.5">
              {c.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-sans text-[11.5px] text-[color:var(--ink-muted)] leading-snug"
                >
                  <span className="mt-1.5 inline-block h-1 w-1 rounded-full bg-[color:var(--accent)] shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Cross-cutting capabilities */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <CrossCard
          icon={Workflow}
          title="Multi-Country, Multi-Currency"
          body="Country-aware SLA rules, currency-aware cost reporting, and a single tenant model that scales from the seven launch countries to a wider EU operation without re-platforming."
        />
        <CrossCard
          icon={Shield}
          title="Audit-Logged Operational Events"
          body="Every event — pick, route change, intervention, exception — written to an append-only ledger. Replayable for post-incident review or customer reporting."
        />
        <CrossCard
          icon={Globe}
          title="Role-Based Dashboards"
          body="Dispatchers see queues. Hub managers see backlogs. Account leads see customer-facing scorecards. Configurable SLA rules per customer and per service type."
        />
      </div>
    </div>
  );
}

function CrossCard({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} strokeWidth={1.5} className="text-[color:var(--accent)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          ∙ Cross-Cutting
        </span>
      </div>
      <h3
        className="font-serif text-[18px] leading-tight text-[color:var(--ink)] mb-2"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {title}
      </h3>
      <p className="font-sans text-[12px] italic text-[color:var(--ink-muted)] leading-[1.55]">
        {body}
      </p>
    </div>
  );
}
