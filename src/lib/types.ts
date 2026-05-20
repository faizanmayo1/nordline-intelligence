import type { CountryCode } from "@/state/ui";

export type NodeKind = "hub" | "fsl" | "pudo";

export type StockHealth = "healthy" | "watch" | "low" | "critical";

export type Vertical =
  | "auto"
  | "agri"
  | "lifesci"
  | "industrial"
  | "renewables"
  | "materials"
  | "consumer";

export type ShipmentStatus =
  | "staged"
  | "in-transit"
  | "at-risk"
  | "breach-imminent"
  | "delivered"
  | "exception";

export type Priority = "standard" | "critical" | "line-down";

export interface NetworkNode {
  id: string;
  kind: NodeKind;
  name: string;
  country: CountryCode;
  city: string;
  lngLat: [number, number];
  stockHealth?: StockHealth;
  backlog?: number;
  pudoType?: "locker" | "partner";
  capacity?: number;
}

export interface VerticalProfile {
  key: Vertical;
  name: string;
  shortName: string;
  criticality: "critical" | "high" | "medium";
  slaWindowHours: number;
  downtimeCostEurPerHour: number;
  handlingRules: string[];
  color: string; // CSS var name e.g. var(--v-auto)
  varToken: string; // CSS var ID e.g. "--v-auto"
}

export interface Customer {
  id: string;
  name: string;
  vertical: Vertical;
  tier: "enterprise" | "mid-market" | "standard";
  country: CountryCode;
  weeklyShipments: number;
  ytdRevenueEur: number;
  slaPctYtd: number;
}

export interface Shipment {
  id: string;
  customerId: string;
  customerName: string;
  vertical: Vertical;
  sku: string;
  partDescription: string;
  originId: string;
  destinationId: string;
  routeId: string;
  status: ShipmentStatus;
  /** Time string HH:MM */
  slaDeadline: string;
  /** Current ETA expressed in minutes from a 22:30 CET shift start */
  etaMinuteOffset: number;
  riskScore: number; // 0-100
  riskDrivers?: string[];
  priority: Priority;
  technicianRequired: boolean;
  weightKg: number;
  valueEur: number;
  country: CountryCode;
}

export interface RouteEntry {
  id: string;
  driverId: string;
  driverName: string;
  vehicle: string; // license plate
  country: CountryCode;
  startHubId: string;
  stops: string[];
  path: [number, number][];
  status: "planning" | "active" | "completed" | "disrupted";
  shipmentIds: string[];
  distanceKm: number;
  co2Kg: number;
  costEur: number;
  priorityShipments: number;
}

export interface InventoryItem {
  sku: string;
  partName: string;
  vertical: Vertical;
  fslId: string;
  onHand: number;
  reorderPoint: number;
  daysOfCover: number;
  predictedShortageHours: number | null;
  weeklyDemand: number;
  unitValueEur: number;
}

export interface ExceptionEntry {
  id: string;
  shipmentId: string;
  category:
    | "delayed"
    | "failed-delivery"
    | "missing-part"
    | "wrong-drop"
    | "route-disruption"
    | "hub-backlog"
    | "customer-escalation";
  severity: "low" | "medium" | "high" | "critical";
  openedAtMin: number;
  rootCause?: string;
  recommendation?: string;
  status: "open" | "in-progress" | "resolved";
}
