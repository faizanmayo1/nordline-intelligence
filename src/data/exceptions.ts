import type { ExceptionEntry } from "@/lib/types";
import { shipmentsAtRisk } from "./shipments";
import { pick, pickWeighted, rng } from "./seed";

const ROOT_CAUSES: Partial<Record<ExceptionEntry["category"], string[]>> = {
  delayed: ["Weather hold", "Sortation cut-off slip", "Line-haul depot miss"],
  "failed-delivery": ["Drop-point inaccessible", "Recipient absent", "Access code rotated"],
  "missing-part": ["WMS pick error", "Mis-scan at consolidation", "Substitution rejected"],
  "wrong-drop": ["Routing index mismatch", "PUDO partner re-shelved"],
  "route-disruption": ["Roadworks", "Border queue", "Accident closure"],
  "hub-backlog": ["Picker capacity short", "Conveyor lane down"],
  "customer-escalation": ["Pre-arrival SLA dispute", "Tier-1 customer call"],
};

const RECOS: Partial<Record<ExceptionEntry["category"], string[]>> = {
  delayed: ["Reroute via nearest PUDO", "Promote to next available driver"],
  "failed-delivery": ["Schedule re-delivery to PUDO locker", "Escalate to customer ops"],
  "missing-part": ["Recall to hub for re-pick", "Substitute SKU with customer approval"],
  "wrong-drop": ["Driver swap-in", "Manual retrieval from PUDO partner"],
  "route-disruption": ["Re-sequence route", "Hand off to neighbouring lane"],
  "hub-backlog": ["Reassign pickers from low-priority lane", "Move cut-off +20 min"],
  "customer-escalation": ["Account manager call within 30 min", "Compensation credit"],
};

function generate(): ExceptionEntry[] {
  const r = rng(707);
  const riskQueue = shipmentsAtRisk().slice(0, 84);
  const out: ExceptionEntry[] = riskQueue.map((sh, i) => {
    const category = pickWeighted(
      [
        { value: "delayed" as const, weight: 28 },
        { value: "hub-backlog" as const, weight: 16 },
        { value: "route-disruption" as const, weight: 14 },
        { value: "failed-delivery" as const, weight: 10 },
        { value: "missing-part" as const, weight: 12 },
        { value: "wrong-drop" as const, weight: 8 },
        { value: "customer-escalation" as const, weight: 12 },
      ],
      r,
    );
    const severity =
      sh.riskScore >= 80
        ? "critical"
        : sh.riskScore >= 65
          ? "high"
          : sh.riskScore >= 45
            ? "medium"
            : "low";
    return {
      id: `EX-${(i + 9001).toString().padStart(5, "0")}`,
      shipmentId: sh.id,
      category,
      severity,
      openedAtMin: Math.floor(r() * 240),
      rootCause: pick(ROOT_CAUSES[category] ?? [], r),
      recommendation: pick(RECOS[category] ?? [], r),
      status: r() < 0.65 ? "open" : r() < 0.92 ? "in-progress" : "resolved",
    };
  });
  return out;
}

export const EXCEPTIONS: ExceptionEntry[] = generate();
export const EXCEPTION_BY_SHIPMENT = new Map(
  EXCEPTIONS.map((e) => [e.shipmentId, e]),
);
