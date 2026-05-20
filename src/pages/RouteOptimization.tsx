import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, RotateCw, Zap, CheckCircle2, ArrowDownRight, ArrowUpRight, Info } from "lucide-react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { AnimatedNumber } from "@/components/route/AnimatedNumber";
import { FleetDriverCard } from "@/components/route/FleetDriverCard";
import { MapView, type MapLineString, type MapPoint } from "@/components/map/MapView";
import { useToast } from "@/components/primitives/Toast";
import { ROUTES } from "@/data/routes";
import { HUBS } from "@/data/network";
import { useUi } from "@/state/ui";

// E18 corridor — Stockholm → Oslo (the closure zone)
const E18_CORRIDOR: [number, number][] = [
  [18.07, 59.33], // Stockholm
  [16.55, 59.61], // Västerås
  [15.21, 59.27], // Örebro
  [11.97, 59.4], // toward Oslo
  [10.75, 59.91], // Oslo
];

// Bounds focusing on Sweden + Norway for the disruption story
const BOUNDS: [[number, number], [number, number]] = [
  [4, 54.5],
  [22, 64.5],
];

const BEFORE_STATS = {
  totalDistance: 187420,
  co2Kg: 116200,
  costEur: 247800,
  slaPreservation: 96.4,
  disruptedRoutes: 0,
  priorityPreserved: 100,
};

const AFTER_STATS = {
  totalDistance: 192840,
  co2Kg: 119560,
  costEur: 254200,
  slaPreservation: 94.1,
  disruptedRoutes: 47,
  priorityPreserved: 100,
};

function reroute(path: [number, number][]): [number, number][] {
  // Apply a small northward offset to mid-segments to visualize detour
  return path.map((p, i) => {
    if (i < 2 || i > path.length - 3) return p;
    // Offset northward (lat +0.4°) for points crossing 11°-17° lon range at ~59° lat
    if (p[0] > 11 && p[0] < 17 && p[1] > 58.6 && p[1] < 60.1) {
      return [p[0] - 0.3, p[1] + 0.55] as [number, number];
    }
    return p;
  });
}

export function RouteOptimization() {
  const country = useUi((s) => s.countryFilter);
  const setCountry = useUi((s) => s.setCountryFilter);
  const theme = useUi((s) => s.theme);
  const toast = useToast();
  const [disrupted, setDisrupted] = useState(false);

  const accentColor = theme === "night" ? "#5ee9a6" : "#2e5e4e";
  const breachColor = theme === "night" ? "#ff7a6a" : "#a0322b";

  // The E18 closure scenario is anchored to Sweden ↔ Norway. If the user has
  // filtered to a non-SE/NO country, surface a clear note instead of silently
  // showing SE/NO routes.
  const scopeMismatch =
    country !== "ALL" && country !== "SE" && country !== "NO";

  // Sample of routes — focus on SE/NO since that's where E18 is
  const sampledRoutes = useMemo(() => {
    let pool = ROUTES.filter((r) => r.country === "SE" || r.country === "NO");
    if (country !== "ALL" && (country === "SE" || country === "NO")) {
      pool = pool.filter((r) => r.country === country);
    }
    // Take every 3rd to keep readable
    return pool.filter((_, i) => i % 3 === 0).slice(0, 64);
  }, [country]);

  const affected = useMemo(() => {
    return sampledRoutes.filter((r) =>
      r.path.some(
        (p) => p[0] > 11 && p[0] < 17 && p[1] > 58.6 && p[1] < 60.1,
      ),
    );
  }, [sampledRoutes]);

  const unaffected = sampledRoutes.filter((r) => !affected.includes(r));

  const lines: MapLineString[] = useMemo(() => {
    const acc: MapLineString[] = [];

    // Unaffected routes: stay accent
    for (const r of unaffected) {
      acc.push({
        id: r.id,
        coordinates: r.path,
        color: accentColor,
        width: 1.1,
        opacity: disrupted ? 0.35 : 0.55,
      });
    }

    // Affected routes: original (dimmed) + rerouted (highlighted)
    for (const r of affected) {
      if (disrupted) {
        acc.push({
          id: `${r.id}-old`,
          coordinates: r.path,
          color: breachColor,
          width: 0.9,
          opacity: 0.18,
          dashed: true,
        });
        acc.push({
          id: `${r.id}-new`,
          coordinates: reroute(r.path),
          color: accentColor,
          width: 1.6,
          opacity: 0.9,
        });
      } else {
        acc.push({
          id: r.id,
          coordinates: r.path,
          color: accentColor,
          width: 1.3,
          opacity: 0.65,
        });
      }
    }

    // E18 corridor — visualized as a heavy line when disrupted
    if (disrupted) {
      acc.push({
        id: "e18-closure",
        coordinates: E18_CORRIDOR,
        color: breachColor,
        width: 6,
        opacity: 0.5,
      });
      acc.push({
        id: "e18-closure-core",
        coordinates: E18_CORRIDOR,
        color: breachColor,
        width: 2.5,
        opacity: 0.95,
        dashed: true,
      });
    }
    return acc;
  }, [affected, unaffected, disrupted, accentColor, breachColor]);

  const hubPoints: MapPoint[] = useMemo(
    () =>
      HUBS.filter((h) => h.country === "SE" || h.country === "NO").map((h) => ({
        id: h.id,
        kind: "hub",
        lngLat: h.lngLat,
        size: "sm",
      })),
    [],
  );

  const stats = disrupted ? AFTER_STATS : BEFORE_STATS;

  const handleInject = () => {
    setDisrupted(true);
    toast.push({
      kicker: "Disruption Injected",
      title: "E18 closure 02:00–05:00 between Stockholm and Oslo",
      description: `${AFTER_STATS.disruptedRoutes} routes recalculated. All priority deliveries preserved.`,
    });
  };

  const handleReset = () => {
    setDisrupted(false);
  };

  return (
    <div className="px-8 py-8 flex flex-col">
      <SerifHeadline
        kicker="04 ∙ Route Optimization"
        title="Five Hundred Routes. Four Seconds."
        supporting={
          <>
            Inject a closure on the E18 between Stockholm and Oslo; watch every
            overnight route reweave around it without losing a technician
            delivery. Cost, CO₂, and SLA preservation update live.
          </>
        }
        size="lg"
      />

      {/* Scope mismatch banner */}
      <AnimatePresence>
        {scopeMismatch ? (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex items-center justify-between gap-4 px-4 py-3 border border-[color:var(--at-risk)]/40 bg-[color:var(--at-risk)]/8 rounded-[3px]"
          >
            <div className="flex items-start gap-2.5">
              <Info
                size={14}
                strokeWidth={1.5}
                className="text-[color:var(--at-risk)] mt-0.5 shrink-0"
              />
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--at-risk)] mb-0.5">
                  Scenario Scope · Sweden ↔ Norway
                </div>
                <div className="font-sans text-[12px] text-[color:var(--ink)] leading-snug">
                  The E18 closure simulation runs across the Stockholm–Oslo
                  corridor. The country filter is currently set to{" "}
                  <span className="font-mono">{country}</span> — reset it to
                  Sweden, Norway, or All to run the scenario.
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCountry("ALL")}
            >
              Reset Filter
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Controls + stats summary */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        {!disrupted ? (
          <Button onClick={handleInject} variant="danger" size="md">
            <AlertTriangle size={14} strokeWidth={1.5} />
            Inject Disruption — E18 Closure
          </Button>
        ) : (
          <Button onClick={handleReset} variant="secondary" size="md">
            <RotateCw size={14} strokeWidth={1.5} />
            Reset Network
          </Button>
        )}
        <AnimatePresence>
          {disrupted ? (
            <motion.div
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="inline-flex items-center gap-2 h-9 px-3 border border-[color:var(--breach)]/40 rounded-[3px] bg-[color:var(--breach)]/8"
            >
              <Zap size={14} strokeWidth={1.5} className="text-[color:var(--breach)]" />
              <span className="font-mono text-[11px] tracking-wide text-[color:var(--breach)]">
                E18 02:00–05:00 closure active · 47 routes detoured
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
          ∙ Simulation · safe to demo live
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        <DeltaKpi
          label="Total Distance"
          before={BEFORE_STATS.totalDistance}
          after={stats.totalDistance}
          unit="km"
          higherIsWorse
          disrupted={disrupted}
        />
        <DeltaKpi
          label="CO₂ Tonight"
          before={BEFORE_STATS.co2Kg}
          after={stats.co2Kg}
          unit="kg"
          higherIsWorse
          disrupted={disrupted}
        />
        <DeltaKpi
          label="Network Cost"
          before={BEFORE_STATS.costEur}
          after={stats.costEur}
          unit="€"
          unitBefore
          higherIsWorse
          disrupted={disrupted}
        />
        <DeltaKpi
          label="SLA Preservation"
          before={BEFORE_STATS.slaPreservation}
          after={stats.slaPreservation}
          unit="%"
          decimals={1}
          higherIsBetter
          disrupted={disrupted}
        />
        <DeltaKpi
          label="Priority Preserved"
          before={BEFORE_STATS.priorityPreserved}
          after={stats.priorityPreserved}
          unit="%"
          higherIsBetter
          disrupted={disrupted}
          tone="accent"
        />
      </div>

      {/* Map + affected routes */}
      <div className="mt-6 grid grid-cols-[1.5fr_1fr] gap-6">
        <div className="relative h-[520px] border border-[color:var(--hairline)] rounded-[3px] overflow-hidden">
          <MapView
            bounds={BOUNDS}
            points={hubPoints}
            lines={lines}
            className="absolute inset-0"
            overlay={
              <div className="absolute top-4 left-4 pointer-events-auto">
                <div className="bg-[color:var(--panel)]/92 backdrop-blur-sm border border-[color:var(--hairline)] rounded-[3px] px-3 py-2 max-w-[260px]">
                  <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-0.5">
                    ∙ {disrupted ? "Network Detoured" : "Tonight's Network"}
                  </div>
                  <div className="font-serif text-[14px] text-[color:var(--ink)] leading-tight">
                    {disrupted
                      ? "Affected routes recalculated, priority shipments preserved."
                      : "Sweden ↔ Norway corridor at planned utilisation."}
                  </div>
                </div>
              </div>
            }
          />
        </div>

        <div className="space-y-4">
          <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1.5">
              ∙ Affected Routes
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <AnimatedNumber
                value={disrupted ? AFTER_STATS.disruptedRoutes : 0}
                className="font-serif text-[44px] leading-none text-[color:var(--ink)]"
                style={{
                  color: disrupted ? "var(--breach)" : "var(--ink)",
                  fontVariationSettings: '"opsz" 144',
                }}
              />
              <span className="font-mono text-[12px] text-[color:var(--ink-muted)]">
                of 500 routes tonight
              </span>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto -mx-1 px-1">
              {(disrupted ? affected.slice(0, 12) : sampledRoutes.slice(0, 6)).map(
                (r) => {
                  const isAffected = disrupted && affected.includes(r);
                  return (
                    <RouteCard
                      key={r.id}
                      routeId={r.id}
                      driver={r.driverName}
                      vehicle={r.vehicle}
                      affected={isAffected}
                      distanceKm={r.distanceKm}
                      priorityShipments={r.priorityShipments}
                    />
                  );
                },
              )}
            </div>
          </div>

          <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-3">
              ∙ Optimisation Summary
            </div>
            <ul className="space-y-2 font-sans text-[12px] text-[color:var(--ink-muted)] leading-snug">
              {disrupted ? (
                <>
                  <SummaryRow icon="ok" text="47 routes recalculated in under 4 seconds." />
                  <SummaryRow icon="ok" text="All 24 technician deliveries kept on original ETA." />
                  <SummaryRow icon="warn" text="Average detour adds 12 km per affected route." />
                  <SummaryRow icon="ok" text="Two life-sciences shipments rerouted via Karlstad PUDO." />
                </>
              ) : (
                <>
                  <SummaryRow icon="ok" text="500 routes at planned utilisation." />
                  <SummaryRow icon="ok" text="Cut-offs holding at every sortation hub." />
                  <SummaryRow icon="info" text="Disruption simulator ready — inject to begin." />
                </>
              )}
            </ul>
          </div>

          <FleetDriverCard disrupted={disrupted} />
        </div>
      </div>
    </div>
  );
}

interface DeltaKpiProps {
  label: string;
  before: number;
  after: number;
  unit?: string;
  unitBefore?: boolean;
  decimals?: number;
  higherIsWorse?: boolean;
  higherIsBetter?: boolean;
  tone?: "accent";
  disrupted: boolean;
}

function DeltaKpi({
  label,
  before,
  after,
  unit,
  unitBefore,
  decimals = 0,
  higherIsWorse,
  higherIsBetter,
  tone,
  disrupted,
}: DeltaKpiProps) {
  const delta = after - before;
  const deltaPct = before === 0 ? 0 : (delta / before) * 100;
  const isWorse = (higherIsWorse && delta > 0) || (higherIsBetter && delta < 0);
  const isBetter = (higherIsWorse && delta < 0) || (higherIsBetter && delta > 0);
  const color = tone === "accent"
    ? "var(--accent)"
    : !disrupted
      ? "var(--ink)"
      : isWorse
        ? "var(--breach)"
        : isBetter
          ? "var(--on-time)"
          : "var(--ink)";

  return (
    <KpiCardLike
      label={label}
      value={
        <AnimatedNumber
          value={disrupted ? after : before}
          format={(n) =>
            (unitBefore ? unit + " " : "") +
            n.toLocaleString("en-US", {
              maximumFractionDigits: decimals,
              minimumFractionDigits: decimals > 0 ? decimals : 0,
            }) +
            (!unitBefore && unit ? unit : "")
          }
        />
      }
      unit={!unitBefore ? undefined : undefined}
      color={color}
      delta={disrupted ? deltaPct : null}
      deltaSign={disrupted ? (isWorse ? "down" : "up") : "flat"}
    />
  );
}

function KpiCardLike({
  label,
  value,
  color,
  delta,
  deltaSign,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  color?: string;
  delta?: number | null;
  deltaSign?: "up" | "down" | "flat";
}) {
  const arrowColor =
    deltaSign === "down" ? "var(--breach)" : deltaSign === "up" ? "var(--on-time)" : "var(--ink-muted)";
  return (
    <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5 flex flex-col gap-3 [html[data-theme='night']_&]:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]">
      <div className="flex items-start justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          {label}
        </span>
        {delta != null ? (
          <span
            className="inline-flex items-center gap-1 font-mono text-[11px] tabular-nums"
            style={{ color: arrowColor }}
          >
            {deltaSign === "down" ? (
              <ArrowDownRight size={12} />
            ) : deltaSign === "up" ? (
              <ArrowUpRight size={12} />
            ) : null}
            {delta > 0 ? "+" : ""}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
      </div>
      <div
        className="font-serif text-[36px] leading-none tracking-[-0.02em]"
        style={{ color, fontVariationSettings: '"opsz" 144' }}
      >
        {value}
      </div>
    </div>
  );
}

function RouteCard({
  routeId,
  driver,
  vehicle,
  affected,
  distanceKm,
  priorityShipments,
}: {
  routeId: string;
  driver: string;
  vehicle: string;
  affected: boolean;
  distanceKm: number;
  priorityShipments: number;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 border rounded-[2px] ${
        affected
          ? "border-[color:var(--breach)]/40 bg-[color:var(--breach)]/5"
          : "border-[color:var(--hairline)] bg-[color:var(--panel-soft)]/40"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          affected ? "bg-[color:var(--breach)] pulse-risk" : "bg-[color:var(--on-time)]"
        }`}
      />
      <div className="min-w-0">
        <div className="font-mono text-[11px] tabular-nums text-[color:var(--ink)]">
          {routeId} · {vehicle}
        </div>
        <div className="font-sans text-[11px] text-[color:var(--ink-muted)] truncate">
          {driver} · {distanceKm} km
        </div>
      </div>
      <div className="text-right flex flex-col items-end gap-0.5">
        {priorityShipments > 0 ? (
          <Badge variant={affected ? "at-risk" : "on-time"} uppercase>
            +{priorityShipments} priority
          </Badge>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            Standard
          </span>
        )}
        {affected ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--breach)]">
            Detoured · +12 km
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SummaryRow({ icon, text }: { icon: "ok" | "warn" | "info"; text: string }) {
  const color =
    icon === "ok"
      ? "var(--on-time)"
      : icon === "warn"
        ? "var(--at-risk)"
        : "var(--info)";
  return (
    <li className="flex items-start gap-2">
      {icon === "ok" ? (
        <CheckCircle2 size={12} strokeWidth={1.5} style={{ color }} className="mt-0.5 shrink-0" />
      ) : icon === "warn" ? (
        <AlertTriangle size={12} strokeWidth={1.5} style={{ color }} className="mt-0.5 shrink-0" />
      ) : (
        <Zap size={12} strokeWidth={1.5} style={{ color }} className="mt-0.5 shrink-0" />
      )}
      <span>{text}</span>
    </li>
  );
}
