import { useMemo } from "react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";
import { KpiCard } from "@/components/cards/KpiCard";
import { ShiftTimeline } from "@/components/chrome/ShiftTimeline";
import { MapView, type MapPoint, type MapLineString } from "@/components/map/MapView";
import { MapHud } from "@/components/map/MapHud";
import { NodeDetailDrawer } from "@/components/panels/NodeDetailDrawer";
import { useUi } from "@/state/ui";
import { HUBS, FSLS, PUDOS } from "@/data/network";
import {
  shipmentsInFlight,
  shipmentsAtRisk,
  onTimePercentage,
} from "@/data/shipments";
import { ROUTES } from "@/data/routes";

// Bounds covering Nordics + Baltics + Poland
const BOUNDS: [[number, number], [number, number]] = [
  [4, 50.5],
  [31, 69.8],
];

function sparkSamples(seed: number, n = 22): number[] {
  // Deterministic gentle wave
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(50 + Math.sin(i * 0.55 + seed) * 14 + Math.cos(i * 0.31) * 6);
  }
  return out;
}

export function ControlTower() {
  const country = useUi((s) => s.countryFilter);
  const layers = useUi((s) => s.visibleLayers);
  const setSelectedNode = useUi((s) => s.setSelectedNode);
  const theme = useUi((s) => s.theme);

  const filteredHubs = useMemo(
    () => HUBS.filter((h) => country === "ALL" || h.country === country),
    [country],
  );
  const filteredFsls = useMemo(
    () => FSLS.filter((f) => country === "ALL" || f.country === country),
    [country],
  );
  const filteredPudos = useMemo(
    () => PUDOS.filter((p) => country === "ALL" || p.country === country),
    [country],
  );
  const filteredRoutes = useMemo(
    () => ROUTES.filter((r) => country === "ALL" || r.country === country),
    [country],
  );

  const inFlight = useMemo(() => shipmentsInFlight(), []);
  const atRisk = useMemo(() => shipmentsAtRisk(), []);
  const onTime = useMemo(() => onTimePercentage(), []);

  // Country-scoped KPIs
  const scopedInFlight =
    country === "ALL"
      ? inFlight
      : inFlight.filter((s) => s.country === country);
  const scopedAtRisk =
    country === "ALL"
      ? atRisk
      : atRisk.filter((s) => s.country === country);
  const scopedRoutesCount = filteredRoutes.filter((r) => r.status === "active").length;

  // Build map points
  const points: MapPoint[] = useMemo(() => {
    const acc: MapPoint[] = [];
    if (layers.hub) {
      for (const h of filteredHubs) {
        acc.push({
          id: h.id,
          kind: "hub",
          lngLat: h.lngLat,
          size: country === "ALL" ? "sm" : "md",
          pulse: (h.backlog ?? 0) > 18,
          onClick: (id) => setSelectedNode(id),
        });
      }
    }
    if (layers.fsl) {
      for (const f of filteredFsls) {
        acc.push({
          id: f.id,
          kind: "fsl",
          lngLat: f.lngLat,
          tone:
            f.stockHealth === "critical"
              ? "breach"
              : f.stockHealth === "low"
                ? "at-risk"
                : "on-time",
          pulse: f.stockHealth === "critical",
          size: country === "ALL" ? "sm" : "md",
          onClick: (id) => setSelectedNode(id),
        });
      }
    }
    if (layers.pudo) {
      for (const p of filteredPudos) {
        acc.push({
          id: p.id,
          kind: "pudo",
          lngLat: p.lngLat,
          size: "sm",
          onClick: (id) => setSelectedNode(id),
        });
      }
    }
    return acc;
  }, [filteredHubs, filteredFsls, filteredPudos, layers, country, setSelectedNode]);

  // Sample of route lines — every 9th to keep the map readable
  const lines: MapLineString[] = useMemo(() => {
    const accentColor = theme === "night" ? "#5ee9a6" : "#2e5e4e";
    const riskColor = theme === "night" ? "#ff7a6a" : "#a0322b";
    const sampled = filteredRoutes.filter((_, i) => i % 9 === 0).slice(0, 64);
    return sampled.map((r) => ({
      id: r.id,
      coordinates: r.path,
      color: r.status === "disrupted" ? riskColor : accentColor,
      width: r.priorityShipments > 1 ? 1.6 : 1.0,
      opacity: r.status === "disrupted" ? 0.85 : 0.45,
    }));
  }, [filteredRoutes, theme]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      <div className="px-8 pt-8 pb-5 shrink-0">
        <SerifHeadline
          kicker="01 ∙ Control Tower"
          title="The Night, At A Glance."
          supporting={
            <>
              {scopedInFlight.length.toLocaleString()} shipments across{" "}
              {country === "ALL" ? "seven countries" : "the selected region"} are
              moving toward a pre-07:00 deadline. This is where the whole shift
              becomes visible.
            </>
          }
          size="lg"
        />
      </div>

      {/* KPI strip */}
      <div className="px-8 shrink-0">
        <div className="grid grid-cols-5 gap-4">
          <KpiCard
            label="Active Routes"
            value={scopedRoutesCount}
            unit="rt"
            delta={+1.2}
            tone="neutral"
            spark={sparkSamples(1)}
            caption="500 scheduled · 12 disrupted"
          />
          <KpiCard
            label="On-Time Projection"
            value={`${onTime.toFixed(1)}`}
            unit="%"
            delta={+0.4}
            tone="on-time"
            spark={sparkSamples(2)}
            caption="vs. 7-day average"
          />
          <KpiCard
            label="At-Risk Shipments"
            value={scopedAtRisk.length}
            delta={-3.6}
            tone="at-risk"
            spark={sparkSamples(3)}
            caption="Auto-triage active"
          />
          <KpiCard
            label="SLA Window"
            value="06h 23m"
            tone="accent"
            caption="To pre-07:00 cut-off"
          />
          <KpiCard
            label="Disruption Index"
            value="2.4"
            unit="/10"
            delta={+0.6}
            tone="neutral"
            spark={sparkSamples(4)}
            caption="Composite of weather, traffic & hub backlog"
          />
        </div>
      </div>

      {/* Shift timeline */}
      <div className="px-8 mt-5 shrink-0">
        <ShiftTimeline />
      </div>

      {/* Map */}
      <div className="px-8 mt-5 pb-8 flex-1 min-h-0">
        <div className="relative h-full border border-[color:var(--hairline)] rounded-[3px] overflow-hidden">
          <MapView
            bounds={BOUNDS}
            points={points}
            lines={lines}
            className="absolute inset-0"
            overlay={
              <MapHud
                counts={{
                  hub: filteredHubs.length,
                  fsl: filteredFsls.length,
                  pudo: filteredPudos.length,
                  routes: scopedRoutesCount,
                }}
              />
            }
          />
        </div>
      </div>

      <NodeDetailDrawer />
    </div>
  );
}
