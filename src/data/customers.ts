import type { Customer, Vertical } from "@/lib/types";
import type { CountryCode } from "@/state/ui";
import { faker, pick, pickWeighted, rng } from "./seed";

// Named anchor customers for the demo. The remaining 243 are generated.
const NAMED: Array<Omit<Customer, "weeklyShipments" | "ytdRevenueEur" | "slaPctYtd">> = [
  { id: "C-001", name: "Siemens Healthineers", vertical: "lifesci", tier: "enterprise", country: "DK" },
  { id: "C-002", name: "Volvo Trucks", vertical: "auto", tier: "enterprise", country: "SE" },
  { id: "C-003", name: "John Deere Nordic", vertical: "agri", tier: "enterprise", country: "FI" },
  { id: "C-004", name: "Vestas Wind Systems", vertical: "renewables", tier: "enterprise", country: "DK" },
  { id: "C-005", name: "ABB Robotics", vertical: "industrial", tier: "enterprise", country: "SE" },
  { id: "C-006", name: "Tetra Pak", vertical: "industrial", tier: "enterprise", country: "SE" },
  { id: "C-007", name: "Husqvarna Group", vertical: "consumer", tier: "enterprise", country: "SE" },
  { id: "C-008", name: "Wärtsilä", vertical: "industrial", tier: "enterprise", country: "FI" },
  { id: "C-009", name: "Kone Elevators", vertical: "industrial", tier: "enterprise", country: "FI" },
  { id: "C-010", name: "Nokian Tyres", vertical: "auto", tier: "enterprise", country: "FI" },
  { id: "C-011", name: "Stora Enso", vertical: "materials", tier: "enterprise", country: "FI" },
  { id: "C-012", name: "Atlas Copco", vertical: "industrial", tier: "enterprise", country: "SE" },
  { id: "C-013", name: "Philips Healthcare", vertical: "lifesci", tier: "enterprise", country: "DK" },
  { id: "C-014", name: "GE Renewable Energy", vertical: "renewables", tier: "enterprise", country: "NO" },
  { id: "C-015", name: "Scania CV", vertical: "auto", tier: "enterprise", country: "SE" },
];

const COMPANY_PREFIXES = [
  "Nordic",
  "Baltic",
  "Skandia",
  "Helsinki",
  "Vasa",
  "Polar",
  "Aurora",
  "Fjord",
  "Karelia",
  "Sigma",
  "Delta",
  "Helios",
  "Ursa",
  "Tellus",
];
const COMPANY_SUFFIXES = [
  "Systems",
  "Engineering",
  "Industries",
  "Technik",
  "Group",
  "Holding",
  "Mechatronics",
  "Robotik",
  "Power",
  "Diagnostics",
];

const COUNTRIES: CountryCode[] = ["DK", "SE", "NO", "FI", "EE", "LV", "LT", "PL"];

function generateGenerated(): Customer[] {
  const r = rng(202);
  const out: Customer[] = [];
  for (let i = 0; i < 235; i++) {
    const id = `C-${(i + 16).toString().padStart(3, "0")}`;
    const vertical = pickWeighted(
      [
        { value: "auto" as Vertical, weight: 25 },
        { value: "industrial" as Vertical, weight: 22 },
        { value: "agri" as Vertical, weight: 12 },
        { value: "lifesci" as Vertical, weight: 10 },
        { value: "renewables" as Vertical, weight: 9 },
        { value: "materials" as Vertical, weight: 12 },
        { value: "consumer" as Vertical, weight: 10 },
      ],
      r,
    );
    const tier = pickWeighted(
      [
        { value: "enterprise" as const, weight: 1 },
        { value: "mid-market" as const, weight: 5 },
        { value: "standard" as const, weight: 4 },
      ],
      r,
    );
    const country = pick(COUNTRIES, r);
    const name = `${pick(COMPANY_PREFIXES, r)} ${faker.company.name().split(" ")[0]} ${pick(
      COMPANY_SUFFIXES,
      r,
    )}`;
    out.push({
      id,
      name,
      vertical,
      tier,
      country,
      weeklyShipments: 4 + Math.floor(r() * 220),
      ytdRevenueEur: Math.round(40000 + r() * 4_200_000),
      slaPctYtd: 88 + r() * 11,
    });
  }
  return out;
}

const generated = generateGenerated();

// Hydrate named with metrics
const r = rng(303);
const namedHydrated: Customer[] = NAMED.map((c, i) => ({
  ...c,
  weeklyShipments:
    c.tier === "enterprise"
      ? 180 + Math.floor(r() * 320)
      : c.tier === "mid-market"
        ? 60 + Math.floor(r() * 80)
        : 8 + Math.floor(r() * 40),
  ytdRevenueEur:
    c.tier === "enterprise"
      ? Math.round(2_400_000 + r() * 6_800_000)
      : Math.round(120_000 + r() * 800_000),
  slaPctYtd: i === 0 ? 96.8 : 92 + r() * 7,
}));

export const CUSTOMERS: Customer[] = [...namedHydrated, ...generated];
export const CUSTOMER_BY_ID = new Map(CUSTOMERS.map((c) => [c.id, c]));

export const ANCHOR_CUSTOMER = CUSTOMERS[0]; // Siemens Healthineers
