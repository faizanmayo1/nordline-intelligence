import type { InventoryItem, Vertical } from "@/lib/types";
import { FSLS } from "./network";
import { PARTS_BY_VERTICAL } from "./parts";
import { pickWeighted, rng } from "./seed";

function generate(): InventoryItem[] {
  const r = rng(606);
  const out: InventoryItem[] = [];
  const verticals = Object.keys(PARTS_BY_VERTICAL) as Vertical[];

  for (const fsl of FSLS) {
    // Each FSL stocks 5-9 SKUs across 2-4 verticals
    const vCount = 2 + Math.floor(r() * 3);
    const vSet = new Set<Vertical>();
    while (vSet.size < vCount) {
      vSet.add(verticals[Math.floor(r() * verticals.length)]);
    }

    for (const vertical of vSet) {
      const parts = PARTS_BY_VERTICAL[vertical];
      const partCount = 1 + Math.floor(r() * Math.min(3, parts.length));
      const partIndices = new Set<number>();
      while (partIndices.size < partCount) {
        partIndices.add(Math.floor(r() * parts.length));
      }

      for (const idx of partIndices) {
        const part = parts[idx];
        const reorderPoint = 6 + Math.floor(r() * 16);
        const stockState = pickWeighted(
          [
            { value: "healthy", weight: 60 },
            { value: "watch", weight: 22 },
            { value: "low", weight: 12 },
            { value: "critical", weight: 6 },
          ],
          r,
        );
        let onHand = 0;
        if (stockState === "healthy") {
          onHand = reorderPoint * 2 + Math.floor(r() * reorderPoint);
        } else if (stockState === "watch") {
          onHand = Math.floor(reorderPoint * 1.1 + r() * reorderPoint * 0.3);
        } else if (stockState === "low") {
          onHand = Math.floor(reorderPoint * 0.5 + r() * reorderPoint * 0.4);
        } else {
          onHand = Math.max(0, Math.floor(r() * reorderPoint * 0.3));
        }
        const weeklyDemand = 3 + Math.floor(r() * 24);
        const daysOfCover = onHand === 0 ? 0 : (onHand / weeklyDemand) * 7;
        const predictedShortageHours =
          stockState === "critical"
            ? Math.floor(r() * 18)
            : stockState === "low"
              ? 20 + Math.floor(r() * 30)
              : null;

        out.push({
          sku: part.sku,
          partName: part.name,
          vertical,
          fslId: fsl.id,
          onHand,
          reorderPoint,
          daysOfCover: Math.round(daysOfCover * 10) / 10,
          predictedShortageHours,
          weeklyDemand,
          unitValueEur: part.valueEur,
        });
      }
    }
  }
  return out;
}

export const INVENTORY: InventoryItem[] = generate();

export function inventoryByVertical(v: Vertical) {
  return INVENTORY.filter((i) => i.vertical === v);
}

export function inventoryShortages() {
  return INVENTORY.filter(
    (i) => i.predictedShortageHours != null && i.predictedShortageHours < 48,
  ).sort(
    (a, b) =>
      (a.predictedShortageHours ?? 999) - (b.predictedShortageHours ?? 999),
  );
}
