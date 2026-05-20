import { useMemo, useState } from "react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";
import { KpiCard } from "@/components/cards/KpiCard";
import { VerticalPills } from "@/components/inventory/VerticalPills";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { DemandForecastChart } from "@/components/inventory/DemandForecastChart";
import { ShortageHeroCard } from "@/components/inventory/ShortageHeroCard";
import { INVENTORY, inventoryByVertical } from "@/data/inventory";
import { VERTICALS } from "@/data/verticals";
import type { Vertical } from "@/lib/types";
import { useUi } from "@/state/ui";

function sparkSamples(seed: number, n = 22) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(60 + Math.sin(i * 0.42 + seed) * 12 + Math.cos(i * 0.31) * 5);
  }
  return out;
}

export function Inventory() {
  const country = useUi((s) => s.countryFilter);
  const [vertical, setVertical] = useState<Vertical>("lifesci");
  const [authorisedKeys, setAuthorisedKeys] = useState<Set<string>>(new Set());

  const verticalProfile = VERTICALS[vertical];

  const scoped = useMemo(() => {
    let list = inventoryByVertical(vertical);
    if (country !== "ALL") {
      // Filter by FSL country
      list = list.filter((i) => {
        const fslId = i.fslId;
        return fslId.startsWith(country);
      });
    }
    return list.sort((a, b) => a.daysOfCover - b.daysOfCover);
  }, [vertical, country]);

  const heroShortage = useMemo(
    () =>
      scoped.find(
        (i) =>
          i.predictedShortageHours != null &&
          i.predictedShortageHours <= 48,
      ) ?? scoped[0],
    [scoped],
  );

  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const focused =
    scoped.find(
      (i) => `${i.sku}|${i.fslId}` === selectedKey,
    ) ?? heroShortage;

  // KPIs across all inventory (not just the vertical) to give context
  const totalAtRisk = INVENTORY.filter(
    (i) => i.predictedShortageHours != null && i.predictedShortageHours < 48,
  ).length;
  const fslOnWatch = new Set(
    INVENTORY.filter(
      (i) => i.predictedShortageHours != null && i.predictedShortageHours < 72,
    ).map((i) => i.fslId),
  ).size;
  const avgCover = (() => {
    if (scoped.length === 0) return 0;
    return scoped.reduce((sum, i) => sum + i.daysOfCover, 0) / scoped.length;
  })();
  const stockoutsAvoided = 47; // Editorial number for YTD

  const heroAccepted = heroShortage
    ? authorisedKeys.has(`${heroShortage.sku}|${heroShortage.fslId}`)
    : false;

  return (
    <div className="px-8 py-8">
      <SerifHeadline
        kicker="03 ∙ Inventory Intelligence"
        title="Stage Tomorrow's Parts Tonight."
        supporting={
          <>
            FSLs, hubs and PUDO lockers — repositioned by demand the system
            anticipates, not by guesswork. Switch verticals to watch the rules
            and priorities reshape themselves.
          </>
        }
        size="lg"
      />

      {/* Vertical pills */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <VerticalPills
          active={vertical}
          onChange={(v) => {
            setVertical(v);
            setSelectedKey(null);
          }}
        />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
          ∙ Active vertical reshapes SLA, criticality and handling rules
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <KpiCard
          label="SKUs At Risk"
          value={totalAtRisk}
          delta={-2.1}
          tone="at-risk"
          spark={sparkSamples(21)}
          caption="Across all FSLs"
        />
        <KpiCard
          label="FSLs On Watch"
          value={fslOnWatch}
          unit={`of ${29}`}
          delta={+1.2}
          tone="neutral"
          spark={sparkSamples(22)}
          caption="Stock health degrading"
        />
        <KpiCard
          label="Avg Days Cover"
          value={avgCover.toFixed(1)}
          unit="d"
          delta={+0.4}
          tone="on-time"
          spark={sparkSamples(23)}
          caption={`In ${verticalProfile.shortName}`}
        />
        <KpiCard
          label="Stockouts Avoided"
          value={stockoutsAvoided}
          unit="YTD"
          tone="accent"
          caption="By proactive moves"
        />
      </div>

      {/* Shortage hero card */}
      <div className="mt-6">
        <ShortageHeroCard
          item={heroShortage}
          vertical={verticalProfile}
          accepted={heroAccepted}
          onAccept={() => {
            if (heroShortage) {
              const key = `${heroShortage.sku}|${heroShortage.fslId}`;
              setAuthorisedKeys((prev) => new Set(prev).add(key));
            }
          }}
        />
      </div>

      {/* Bottom — table + demand chart */}
      <div className="mt-6 grid grid-cols-[1.4fr_1fr] gap-6">
        <InventoryTable
          items={scoped}
          selectedSku={focused?.sku}
          onSelect={(sku, fslId) => setSelectedKey(`${sku}|${fslId}`)}
        />
        <DemandForecastChart item={focused} />
      </div>
    </div>
  );
}
