import type { Shipment } from "@/lib/types";

export interface RiskFactor {
  key: "weather" | "hub" | "driver" | "traffic" | "lane" | "customer";
  label: string;
  intensity: number; // 0..100
  detail: string;
}

const FACTOR_LABELS: Record<RiskFactor["key"], string> = {
  weather: "Weather",
  hub: "Hub Backlog",
  driver: "Driver Avail.",
  traffic: "Traffic & Customs",
  lane: "Lane History",
  customer: "Customer Window",
};

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDetail(key: RiskFactor["key"], seed: number): string {
  const POOLS: Record<RiskFactor["key"], string[]> = {
    weather: [
      "Heavy snow advisory · E4 corridor",
      "Freezing rain · Oslo Gardermoen 03:00–05:00",
      "Black ice forecast · Finnish coastal route",
      "Fog · Skåne visibility <200m",
      "Storm front · Skagerrak crossing",
    ],
    hub: [
      "Stockholm sortation backlog +18",
      "Riga cut-off slip 22 min",
      "Warsaw cross-dock pick rate −9%",
      "Copenhagen line-haul consolidation miss",
    ],
    driver: [
      "Backup driver pool capacity 60%",
      "Rest-hours expire 04:00",
      "Co-driver swap needed at Oslo turn",
      "Night-shift staffing −2 below plan",
    ],
    traffic: [
      "Customs queue · Świnoujście ferry slot",
      "Roadworks · A3 Hamburg–Lübeck",
      "Stockholm ring road residual delay",
      "Helsinki Vuosaari terminal congestion",
    ],
    lane: [
      "Historical breach rate 14% Mon–Wed",
      "Partner SLA 86% past 30 days",
      "Drop-window narrower than route plan",
      "Mode change +12 min vs forecast",
    ],
    customer: [
      "Site receiving 06:30–07:00 only",
      "Pre-arrival call required",
      "Cold-chain seal verification on dock",
      "Tier-1 enterprise · zero tolerance",
    ],
  };
  const list = POOLS[key];
  return list[seed % list.length];
}

/** Deterministic risk decomposition for a shipment. */
export function decomposeRisk(s: Shipment): RiskFactor[] {
  const seed = hashStr(s.id);
  const r = (offset: number) => ((seed >> (offset % 24)) & 0xff) / 255;
  const score = s.riskScore;

  // Distribute the total risk across factors with a deterministic pattern.
  // Weights sum to roughly 1; we scale by overall risk.
  const weights = {
    weather: 0.18 + r(1) * 0.12,
    hub: 0.16 + r(2) * 0.10,
    driver: 0.12 + r(3) * 0.10,
    traffic: 0.14 + r(4) * 0.10,
    lane: 0.18 + r(5) * 0.08,
    customer: 0.10 + r(6) * 0.10,
  };
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = Object.fromEntries(
    Object.entries(weights).map(([k, v]) => [k, v / total]),
  ) as Record<RiskFactor["key"], number>;

  // Each factor's intensity = its share of the total weighted toward the score.
  // Use a mild non-linear function so large contributors stand out.
  const factors: RiskFactor[] = (Object.keys(normalized) as RiskFactor["key"][])
    .map((key) => {
      const share = normalized[key];
      const base = score * share * 4.2; // amplify so visible bars fill nicely
      const jitter = (r(key.length) - 0.5) * 18;
      const intensity = Math.max(8, Math.min(100, Math.round(base + jitter)));
      return {
        key,
        label: FACTOR_LABELS[key],
        intensity,
        detail: pickDetail(key, seed + key.length),
      };
    })
    .sort((a, b) => b.intensity - a.intensity);

  return factors;
}

export interface RecommendationPlan {
  title: string;
  rationale: string;
  newEta: string;
  bufferMinutes: number;
  costEur: number;
  preservedRiskScore: number;
  bullets: string[];
}

/** Generate a recommended intervention for a shipment, deterministic by id. */
export function recommendIntervention(s: Shipment): RecommendationPlan {
  const seed = hashStr(s.id);
  const r = (i: number) => ((seed >> (i % 24)) & 0xff) / 255;

  const buffer = 18 + Math.floor(r(1) * 32);
  const cost = 180 + Math.floor(r(2) * 420);
  const newRisk = Math.max(14, Math.round(s.riskScore - 38 - r(3) * 12));
  const newEtaH = 6;
  const newEtaM = 30 + Math.floor(r(4) * 28);

  const lifesci = s.vertical === "lifesci";
  const title = lifesci
    ? "Reroute via Tampere PUDO Locker #14"
    : s.vertical === "auto"
      ? "Hand-off via Gothenburg backup driver"
      : "Re-sequence stops · early consolidation";

  return {
    title,
    rationale: lifesci
      ? "Swap to backup driver Lars E., reuse Tampere PUDO Locker #14 for 06:30 cold-chain handoff."
      : "Reassign to night-shift backup pool and tighten consolidation cut-off by 20 minutes.",
    newEta: `0${newEtaH}:${newEtaM.toString().padStart(2, "0")}`,
    bufferMinutes: buffer,
    costEur: cost,
    preservedRiskScore: newRisk,
    bullets: [
      "Customer portal & technician app updated automatically",
      "Driver app pushes new route at 23:42",
      "Hub manager notified — Stockholm cut-off held",
    ],
  };
}
