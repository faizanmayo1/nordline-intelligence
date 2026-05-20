import type { Shipment, ShipmentStatus, Priority } from "@/lib/types";
import { CUSTOMERS } from "./customers";
import { ROUTES } from "./routes";
import { NODE_BY_ID, FSLS, PUDOS } from "./network";
import { partsFor } from "./parts";
import { pick, pickWeighted, rng } from "./seed";

const RISK_DRIVERS_POOL: Record<string, string[]> = {
  weather: [
    "Heavy snow on E4 between Gävle and Sundsvall",
    "Freezing rain forecast at Oslo Gardermoen 03:00–05:00",
    "Black ice advisory on Finnish coastal route",
    "Fog warning Skåne — visibility below 200m",
    "Storm front entering Skagerrak corridor",
  ],
  traffic: [
    "Stockholm ring road backlog from earlier incident",
    "Customs queue at Świnoujście ferry slot",
    "Helsinki Vuosaari terminal congestion",
    "Roadworks A3 Hamburg–Lübeck corridor",
  ],
  hub: [
    "Stockholm hub backlog +18 over plan",
    "Riga sortation cut-off slipped 22 min",
    "Warsaw cross-dock pick rate −9% vs forecast",
    "Copenhagen line-haul missed depot consolidation",
  ],
  driver: [
    "Backup driver pool capacity 60%",
    "Driver Lars E. rest-hours expire 04:00",
    "Co-driver swap required at Oslo turn",
  ],
  lane: [
    "Historical breach rate 14% on this lane Mon–Wed",
    "Customer drop-window narrower than route plan",
    "Final-mile partner SLA at 86% past 30 days",
  ],
};

function pickDrivers(r: () => number, count: number): string[] {
  const all = [
    ...RISK_DRIVERS_POOL.weather,
    ...RISK_DRIVERS_POOL.traffic,
    ...RISK_DRIVERS_POOL.hub,
    ...RISK_DRIVERS_POOL.driver,
    ...RISK_DRIVERS_POOL.lane,
  ];
  const out: string[] = [];
  while (out.length < count) {
    const candidate = pick(all, r);
    if (!out.includes(candidate)) out.push(candidate);
  }
  return out;
}

function statusFromRisk(risk: number, r: () => number): ShipmentStatus {
  if (risk >= 78) return r() > 0.45 ? "breach-imminent" : "at-risk";
  if (risk >= 55) return "at-risk";
  if (risk >= 30) return r() > 0.85 ? "exception" : "in-transit";
  return r() > 0.95 ? "staged" : "in-transit";
}

function generate(): Shipment[] {
  const r = rng(505);
  const out: Shipment[] = [];

  for (let i = 0; i < 1847; i++) {
    const route = ROUTES[i % ROUTES.length];
    const customer = CUSTOMERS[Math.floor(r() * CUSTOMERS.length)];
    const vertical = customer.vertical;
    const parts = partsFor(vertical);
    const part = parts[Math.floor(r() * parts.length)];

    const origin = NODE_BY_ID.get(route.startHubId)!;
    const destinationCandidates = [
      ...FSLS.filter((f) => f.country === route.country),
      ...PUDOS.filter((p) => p.country === route.country),
    ];
    const destination =
      destinationCandidates[Math.floor(r() * destinationCandidates.length)] ??
      origin;

    const priorityRoll = r();
    const priority: Priority =
      vertical === "lifesci" && priorityRoll < 0.4
        ? "line-down"
        : priorityRoll < 0.08
          ? "line-down"
          : priorityRoll < 0.32
            ? "critical"
            : "standard";

    // Risk distribution biased low; ~12% above 65 (at-risk territory)
    let risk = pickWeighted(
      [
        { value: 8, weight: 18 },
        { value: 16, weight: 22 },
        { value: 28, weight: 22 },
        { value: 44, weight: 14 },
        { value: 60, weight: 10 },
        { value: 72, weight: 7 },
        { value: 84, weight: 5 },
        { value: 92, weight: 2 },
      ],
      r,
    );
    // jitter
    risk = Math.max(0, Math.min(100, risk + Math.floor(r() * 8) - 4));
    const status = statusFromRisk(risk, r);

    out.push({
      id: `SH-${(i + 100001).toString().padStart(6, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      vertical,
      sku: part.sku,
      partDescription: part.name,
      originId: origin.id,
      destinationId: destination.id,
      routeId: route.id,
      status,
      slaDeadline: r() > 0.5 ? "06:55" : r() > 0.5 ? "06:30" : "07:00",
      etaMinuteOffset: 60 + Math.floor(r() * 480),
      riskScore: risk,
      riskDrivers: risk >= 50 ? pickDrivers(r, 2 + Math.floor(r() * 2)) : undefined,
      priority,
      technicianRequired:
        vertical === "lifesci" ||
        vertical === "industrial" ||
        vertical === "renewables"
          ? r() > 0.45
          : r() > 0.8,
      weightKg: part.weightKg,
      valueEur: part.valueEur,
      country: route.country,
    });
  }
  return out;
}

export const SHIPMENTS: Shipment[] = generate();
export const SHIPMENT_BY_ID = new Map(SHIPMENTS.map((s) => [s.id, s]));

// Convenience selectors
export function shipmentsInFlight() {
  return SHIPMENTS.filter(
    (s) => s.status === "in-transit" || s.status === "at-risk" || s.status === "breach-imminent",
  );
}

export function shipmentsAtRisk() {
  return SHIPMENTS.filter(
    (s) => s.status === "at-risk" || s.status === "breach-imminent",
  ).sort((a, b) => b.riskScore - a.riskScore);
}

export function onTimePercentage() {
  const inflight = shipmentsInFlight();
  const onTime = inflight.filter((s) => s.riskScore < 50).length;
  return (onTime / Math.max(1, inflight.length)) * 100;
}

export function findHeroSiemens() {
  // Find Siemens shipment, preferring critical/breach state.
  const all = SHIPMENTS.filter((s) => s.customerName === "Siemens Healthineers");
  return (
    all.find((s) => s.status === "breach-imminent") ??
    all.find((s) => s.status === "at-risk") ??
    all[0]
  );
}

/**
 * Country-aware hero: returns the most critical Siemens shipment in the country
 * if available; falls back to the highest-risk shipment in the country.
 * Country "ALL" returns the network-wide Siemens hero.
 */
export function findHeroForCountry(country: string) {
  if (country === "ALL") return findHeroSiemens();
  const inCountry = SHIPMENTS.filter((s) => s.country === country);
  const siemensInCountry = inCountry.filter(
    (s) => s.customerName === "Siemens Healthineers",
  );
  return (
    siemensInCountry.find((s) => s.status === "breach-imminent") ??
    siemensInCountry.find((s) => s.status === "at-risk") ??
    siemensInCountry[0] ??
    inCountry.sort((a, b) => b.riskScore - a.riskScore)[0] ??
    findHeroSiemens()
  );
}
