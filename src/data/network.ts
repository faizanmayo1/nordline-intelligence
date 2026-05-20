import type { NetworkNode, StockHealth } from "@/lib/types";
import type { CountryCode } from "@/state/ui";
import { offsetLngLat, pick, rng } from "./seed";

interface CitySeed {
  city: string;
  country: CountryCode;
  lngLat: [number, number];
}

// Real Nordic/Baltic/Polish city coordinates [lng, lat]
const CITIES: CitySeed[] = [
  // Denmark — 7 hubs
  { city: "Copenhagen", country: "DK", lngLat: [12.5683, 55.6761] },
  { city: "Aarhus", country: "DK", lngLat: [10.2039, 56.1629] },
  { city: "Odense", country: "DK", lngLat: [10.4024, 55.4038] },
  { city: "Aalborg", country: "DK", lngLat: [9.9217, 57.0488] },
  { city: "Esbjerg", country: "DK", lngLat: [8.4527, 55.4761] },
  { city: "Vejle", country: "DK", lngLat: [9.5354, 55.7095] },
  { city: "Randers", country: "DK", lngLat: [10.0364, 56.4607] },

  // Sweden — 12 hubs
  { city: "Stockholm", country: "SE", lngLat: [18.0686, 59.3293] },
  { city: "Gothenburg", country: "SE", lngLat: [11.9746, 57.7089] },
  { city: "Malmö", country: "SE", lngLat: [13.0038, 55.6049] },
  { city: "Uppsala", country: "SE", lngLat: [17.6389, 59.8586] },
  { city: "Linköping", country: "SE", lngLat: [15.6256, 58.4108] },
  { city: "Västerås", country: "SE", lngLat: [16.5448, 59.6099] },
  { city: "Örebro", country: "SE", lngLat: [15.2066, 59.2741] },
  { city: "Helsingborg", country: "SE", lngLat: [12.6943, 56.0467] },
  { city: "Jönköping", country: "SE", lngLat: [14.1618, 57.7826] },
  { city: "Norrköping", country: "SE", lngLat: [16.1924, 58.5877] },
  { city: "Umeå", country: "SE", lngLat: [20.2630, 63.8258] },
  { city: "Sundsvall", country: "SE", lngLat: [17.3063, 62.3908] },

  // Norway — 8 hubs
  { city: "Oslo", country: "NO", lngLat: [10.7522, 59.9139] },
  { city: "Bergen", country: "NO", lngLat: [5.3221, 60.3913] },
  { city: "Trondheim", country: "NO", lngLat: [10.3951, 63.4305] },
  { city: "Stavanger", country: "NO", lngLat: [5.7331, 58.9700] },
  { city: "Tromsø", country: "NO", lngLat: [18.9553, 69.6492] },
  { city: "Drammen", country: "NO", lngLat: [10.2045, 59.7440] },
  { city: "Kristiansand", country: "NO", lngLat: [7.9956, 58.1467] },
  { city: "Fredrikstad", country: "NO", lngLat: [10.9298, 59.2181] },

  // Finland — 8 hubs
  { city: "Helsinki", country: "FI", lngLat: [24.9384, 60.1699] },
  { city: "Espoo", country: "FI", lngLat: [24.6559, 60.2055] },
  { city: "Tampere", country: "FI", lngLat: [23.7610, 61.4978] },
  { city: "Turku", country: "FI", lngLat: [22.2666, 60.4518] },
  { city: "Oulu", country: "FI", lngLat: [25.4720, 65.0121] },
  { city: "Lahti", country: "FI", lngLat: [25.6612, 60.9827] },
  { city: "Kuopio", country: "FI", lngLat: [27.6783, 62.8924] },
  { city: "Jyväskylä", country: "FI", lngLat: [25.7473, 62.2426] },

  // Estonia — 3 hubs
  { city: "Tallinn", country: "EE", lngLat: [24.7536, 59.4370] },
  { city: "Tartu", country: "EE", lngLat: [26.7251, 58.3776] },
  { city: "Pärnu", country: "EE", lngLat: [24.4970, 58.3859] },

  // Latvia — 3 hubs
  { city: "Riga", country: "LV", lngLat: [24.1052, 56.9496] },
  { city: "Daugavpils", country: "LV", lngLat: [26.5337, 55.8714] },
  { city: "Liepāja", country: "LV", lngLat: [21.0094, 56.5046] },

  // Lithuania — 3 hubs
  { city: "Vilnius", country: "LT", lngLat: [25.2797, 54.6872] },
  { city: "Kaunas", country: "LT", lngLat: [23.9036, 54.8985] },
  { city: "Klaipėda", country: "LT", lngLat: [21.1349, 55.7033] },

  // Poland — 12 hubs
  { city: "Warsaw", country: "PL", lngLat: [21.0122, 52.2297] },
  { city: "Kraków", country: "PL", lngLat: [19.9450, 50.0647] },
  { city: "Łódź", country: "PL", lngLat: [19.4560, 51.7592] },
  { city: "Wrocław", country: "PL", lngLat: [17.0386, 51.1079] },
  { city: "Poznań", country: "PL", lngLat: [16.9252, 52.4064] },
  { city: "Gdańsk", country: "PL", lngLat: [18.6466, 54.3520] },
  { city: "Szczecin", country: "PL", lngLat: [14.5528, 53.4285] },
  { city: "Bydgoszcz", country: "PL", lngLat: [18.0085, 53.1235] },
  { city: "Lublin", country: "PL", lngLat: [22.5684, 51.2465] },
  { city: "Białystok", country: "PL", lngLat: [23.1688, 53.1325] },
  { city: "Katowice", country: "PL", lngLat: [19.0238, 50.2649] },
  { city: "Gdynia", country: "PL", lngLat: [18.5305, 54.5189] },
];

function hubCode(country: CountryCode, idx: number) {
  return `${country}-H${(idx + 1).toString().padStart(2, "0")}`;
}

function fslCode(country: CountryCode, idx: number) {
  return `${country}-F${(idx + 1).toString().padStart(2, "0")}`;
}

function pudoCode(idx: number) {
  return `P${(idx + 1).toString().padStart(3, "0")}`;
}

function generate(): {
  hubs: NetworkNode[];
  fsls: NetworkNode[];
  pudos: NetworkNode[];
} {
  const r = rng(101);
  const hubs: NetworkNode[] = [];
  const fsls: NetworkNode[] = [];
  const pudos: NetworkNode[] = [];

  // Hubs = every city in CITIES (56 total by design)
  const countryHubCounts: Record<string, number> = {};
  for (const c of CITIES) {
    const idx = countryHubCounts[c.country] ?? 0;
    countryHubCounts[c.country] = idx + 1;
    hubs.push({
      id: hubCode(c.country, idx),
      kind: "hub",
      name: `${c.city} Hub`,
      country: c.country,
      city: c.city,
      lngLat: c.lngLat,
      backlog: Math.floor(r() * 24),
      capacity: 400 + Math.floor(r() * 600),
    });
  }

  // FSLs distribution (29 total)
  const fslPlan: { country: CountryCode; count: number }[] = [
    { country: "SE", count: 6 },
    { country: "NO", count: 4 },
    { country: "FI", count: 4 },
    { country: "DK", count: 4 },
    { country: "PL", count: 6 },
    { country: "EE", count: 2 },
    { country: "LV", count: 1 },
    { country: "LT", count: 2 },
  ];

  const healthBag: StockHealth[] = [
    "healthy",
    "healthy",
    "healthy",
    "watch",
    "watch",
    "low",
    "critical",
  ];

  const countryFslCounts: Record<string, number> = {};
  for (const plan of fslPlan) {
    const cities = CITIES.filter((c) => c.country === plan.country);
    for (let i = 0; i < plan.count; i++) {
      // Place FSL near a hub (offset 10–60km)
      const baseCity = cities[i % cities.length];
      const lngLat = offsetLngLat(baseCity.lngLat, 12 + r() * 40, r);
      const idx = countryFslCounts[plan.country] ?? 0;
      countryFslCounts[plan.country] = idx + 1;
      fsls.push({
        id: fslCode(plan.country, idx),
        kind: "fsl",
        name: `${baseCity.city} FSL`,
        country: plan.country,
        city: baseCity.city,
        lngLat,
        stockHealth: pick(healthBag, r),
        capacity: 80 + Math.floor(r() * 220),
      });
    }
  }

  // PUDO distribution (86 total) — clustered around hubs
  const pudoPlan: { country: CountryCode; count: number }[] = [
    { country: "SE", count: 18 },
    { country: "NO", count: 12 },
    { country: "FI", count: 12 },
    { country: "DK", count: 12 },
    { country: "PL", count: 22 },
    { country: "EE", count: 3 },
    { country: "LV", count: 3 },
    { country: "LT", count: 4 },
  ];

  for (const plan of pudoPlan) {
    const cities = CITIES.filter((c) => c.country === plan.country);
    for (let i = 0; i < plan.count; i++) {
      const baseCity = cities[i % cities.length];
      const lngLat = offsetLngLat(baseCity.lngLat, 4 + r() * 30, r);
      const idx = pudos.length;
      pudos.push({
        id: pudoCode(idx),
        kind: "pudo",
        name: `${baseCity.city} ${
          r() > 0.6 ? "Locker" : "Partner Shop"
        } #${(i + 1).toString().padStart(2, "0")}`,
        country: plan.country,
        city: baseCity.city,
        lngLat,
        pudoType: r() > 0.55 ? "locker" : "partner",
        capacity: 30 + Math.floor(r() * 60),
      });
    }
  }

  return { hubs, fsls, pudos };
}

const generated = generate();
export const HUBS: NetworkNode[] = generated.hubs;
export const FSLS: NetworkNode[] = generated.fsls;
export const PUDOS: NetworkNode[] = generated.pudos;
export const ALL_NODES: NetworkNode[] = [...HUBS, ...FSLS, ...PUDOS];

export const NODE_BY_ID = new Map(ALL_NODES.map((n) => [n.id, n]));

export const CITY_COORDS = CITIES;
