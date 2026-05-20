import type { RouteEntry, NetworkNode } from "@/lib/types";
import type { CountryCode } from "@/state/ui";
import { ALL_NODES, FSLS, HUBS, PUDOS } from "./network";
import { faker, offsetLngLat, rng } from "./seed";

function plate(country: CountryCode, r: () => number) {
  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
  const a = Array.from({ length: 3 }, () => letters[Math.floor(r() * letters.length)]).join(
    "",
  );
  const n = Math.floor(r() * 900 + 100);
  return `${country} ${a} ${n}`;
}

function interpolate(
  a: [number, number],
  b: [number, number],
  steps: number,
  r: () => number,
): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lng = a[0] + (b[0] - a[0]) * t;
    const lat = a[1] + (b[1] - a[1]) * t;
    // Slight jitter to make routes look organic, not straight lines
    const jitterScale = i === 0 || i === steps ? 0 : 0.12 + r() * 0.08;
    pts.push([lng + (r() - 0.5) * jitterScale, lat + (r() - 0.5) * jitterScale * 0.6]);
  }
  return pts;
}

function generate(): RouteEntry[] {
  const r = rng(404);
  const routes: RouteEntry[] = [];

  // For each hub, generate 8-10 routes; total ~500
  const targetTotal = 500;
  for (let i = 0; i < targetTotal; i++) {
    const startHub = HUBS[i % HUBS.length];
    const country = startHub.country;

    // Each route does 3-6 stops mixed FSL + PUDO
    const stopCount = 3 + Math.floor(r() * 4);
    const candidateNodes: NetworkNode[] = [
      ...FSLS.filter((n) => n.country === country),
      ...PUDOS.filter((n) => n.country === country),
    ];

    const stopIds: string[] = [];
    const pathSeed: [number, number][] = [startHub.lngLat];

    let prev = startHub.lngLat;
    for (let s = 0; s < stopCount; s++) {
      const next =
        candidateNodes[
          Math.floor(r() * Math.max(1, candidateNodes.length))
        ] ??
        ALL_NODES[Math.floor(r() * ALL_NODES.length)];
      stopIds.push(next.id);
      const segment = interpolate(prev, next.lngLat, 6 + Math.floor(r() * 4), r);
      pathSeed.push(...segment.slice(1));
      prev = next.lngLat;
    }
    // Final leg back near hub area (return)
    const returnPt = offsetLngLat(startHub.lngLat, 6, r);
    const finalSeg = interpolate(prev, returnPt, 5, r);
    pathSeed.push(...finalSeg.slice(1));

    const distanceKm = Math.round(180 + r() * 520);
    const status = pickStatus(r());

    routes.push({
      id: `RT-${(i + 1).toString().padStart(4, "0")}`,
      driverId: `D-${Math.floor(r() * 9000 + 1000)}`,
      driverName: faker.person.fullName(),
      vehicle: plate(country, r),
      country,
      startHubId: startHub.id,
      stops: stopIds,
      path: pathSeed,
      status,
      shipmentIds: [],
      distanceKm,
      co2Kg: Math.round(distanceKm * 0.62 * 100) / 100,
      costEur: Math.round(distanceKm * 1.15 + 40 + r() * 60),
      priorityShipments: Math.floor(r() * 4),
    });
  }
  return routes;
}

function pickStatus(rnd: number): RouteEntry["status"] {
  if (rnd < 0.78) return "active";
  if (rnd < 0.9) return "planning";
  if (rnd < 0.98) return "disrupted";
  return "completed";
}

export const ROUTES: RouteEntry[] = generate();
export const ROUTE_BY_ID = new Map(ROUTES.map((r) => [r.id, r]));
