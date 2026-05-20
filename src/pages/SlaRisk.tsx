import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Truck, MapPin, Clock } from "lucide-react";
import { SerifHeadline } from "@/components/editorial/SerifHeadline";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/primitives/Tabs";
import { RiskQueueItem } from "@/components/cards/RiskQueueItem";
import { RiskFactorBar } from "@/components/cards/RiskFactorBar";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { NordicEqualizer } from "@/components/charts/NordicEqualizer";
import { Badge } from "@/components/primitives/Badge";
import { KpiCard } from "@/components/cards/KpiCard";
import {
  shipmentsAtRisk,
  findHeroForCountry,
  SHIPMENTS,
} from "@/data/shipments";
import { NODE_BY_ID } from "@/data/network";
import { VERTICALS } from "@/data/verticals";
import { decomposeRisk, recommendIntervention } from "@/lib/risk";
import { useUi } from "@/state/ui";

type FilterKey = "all" | "critical" | "customer" | "regional";

function sparkSamples(seed: number, n = 22) {
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    out.push(40 + Math.sin(i * 0.7 + seed) * 12 + Math.cos(i * 0.4) * 5);
  }
  return out;
}

export function SlaRisk() {
  const country = useUi((s) => s.countryFilter);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [acceptedIds, setAcceptedIds] = useState<Set<string>>(new Set());

  const heroSiemens = useMemo(() => findHeroForCountry(country), [country]);
  const allAtRisk = useMemo(() => shipmentsAtRisk(), []);

  const filtered = useMemo(() => {
    let list = allAtRisk;
    if (country !== "ALL") list = list.filter((s) => s.country === country);
    if (filter === "critical") {
      list = list.filter(
        (s) =>
          s.priority === "line-down" ||
          s.vertical === "lifesci" ||
          s.riskScore >= 75,
      );
    } else if (filter === "customer") {
      list = list.filter(
        (s) =>
          s.customerName === "Siemens Healthineers" ||
          s.customerName === "Volvo Trucks" ||
          s.customerName === "John Deere Nordic" ||
          s.customerName === "Vestas Wind Systems" ||
          s.customerName === "ABB Robotics",
      );
    } else if (filter === "regional") {
      // Sort/group by country distribution
      list = list.slice();
    }
    return list.slice(0, 40);
  }, [allAtRisk, country, filter]);

  const [selectedId, setSelectedId] = useState<string>(
    heroSiemens?.id ?? filtered[0]?.id ?? "",
  );

  // When country filter changes, re-anchor selection to the new hero so the
  // detail pane never shows an out-of-scope shipment.
  useEffect(() => {
    if (heroSiemens) setSelectedId(heroSiemens.id);
  }, [country, heroSiemens]);

  const selected = useMemo(
    () => SHIPMENTS.find((s) => s.id === selectedId) ?? heroSiemens ?? filtered[0],
    [selectedId, heroSiemens, filtered],
  );

  if (!selected) {
    return (
      <div className="px-8 py-10">
        <SerifHeadline
          kicker="02 ∙ SLA Risk"
          title="Predict, Then Prevent."
          supporting="No at-risk shipments tonight — exceptional shift."
        />
      </div>
    );
  }

  const factors = decomposeRisk(selected);
  const plan = recommendIntervention(selected);
  const accepted = acceptedIds.has(selected.id);
  const origin = NODE_BY_ID.get(selected.originId);
  const destination = NODE_BY_ID.get(selected.destinationId);
  const vertical = VERTICALS[selected.vertical];

  // KPI numbers
  const totalAtRisk = allAtRisk.length;
  const breachImminent = allAtRisk.filter(
    (s) => s.status === "breach-imminent",
  ).length;
  const avgRisk =
    allAtRisk.reduce((sum, s) => sum + s.riskScore, 0) /
    Math.max(1, allAtRisk.length);
  const interventionsTonight = acceptedIds.size;

  return (
    <div className="px-8 py-8">
      <SerifHeadline
        kicker="02 ∙ SLA Risk"
        title="Predict, Then Prevent."
        supporting={
          <>
            {breachImminent} shipments are forecast to miss pre-07:00 cut-offs.
            The system has staged an intervention for each — review and accept
            in the time it used to take to phone the hub.
          </>
        }
        size="lg"
      />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mt-6">
        <KpiCard
          label="At-Risk Total"
          value={totalAtRisk}
          delta={-3.6}
          tone="at-risk"
          spark={sparkSamples(11)}
          caption="vs. 7-day avg"
        />
        <KpiCard
          label="Breach Imminent"
          value={breachImminent}
          tone="breach"
          caption="Action required"
        />
        <KpiCard
          label="Avg Risk Score"
          value={avgRisk.toFixed(0)}
          unit="/100"
          delta={-1.4}
          spark={sparkSamples(13)}
          caption="Across queue"
        />
        <KpiCard
          label="Interventions Tonight"
          value={interventionsTonight}
          tone="accent"
          caption={
            interventionsTonight === 0
              ? "Awaiting dispatcher"
              : "Auto-propagated"
          }
        />
      </div>

      {/* Tabs */}
      <div className="mt-7">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as FilterKey)}
        >
          <TabsList>
            <TabsTrigger value="all">All Risk</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="customer">Customer-Flagged</TabsTrigger>
            <TabsTrigger value="regional">Regional</TabsTrigger>
          </TabsList>
          <TabsContent value={filter} />
        </Tabs>
      </div>

      {/* Split layout */}
      <div className="mt-5 grid grid-cols-[minmax(420px,460px)_1fr] gap-6">
        {/* Left — risk queue */}
        <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] overflow-hidden">
          <div className="px-4 py-3 border-b border-[color:var(--hairline)] flex items-baseline justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                Risk Queue
              </div>
              <div className="font-serif text-[14px] text-[color:var(--ink)] leading-none mt-1">
                Ranked by breach probability
              </div>
            </div>
            <span className="font-mono text-[10px] tabular-nums text-[color:var(--ink-faint)]">
              {filtered.length} of {allAtRisk.length}
            </span>
          </div>
          <div className="max-h-[680px] overflow-y-auto">
            {filtered.map((sh, i) => (
              <RiskQueueItem
                key={sh.id}
                shipment={sh}
                index={i + 1}
                selected={sh.id === selected.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>
        </div>

        {/* Right — detail */}
        <div className="space-y-5">
          {/* Hero shipment card */}
          <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2.5">
                  <span className="text-[color:var(--accent)]">∙</span>
                  <span>{selected.id}</span>
                  <span className="text-[color:var(--ink-faint)]">/</span>
                  <span>{vertical.shortName}</span>
                  {selected.priority !== "standard" ? (
                    <>
                      <span className="text-[color:var(--ink-faint)]">/</span>
                      <Badge
                        variant={
                          selected.priority === "line-down" ? "breach" : "at-risk"
                        }
                        uppercase
                      >
                        {selected.priority}
                      </Badge>
                    </>
                  ) : null}
                </div>
                <h2
                  className="font-serif text-[34px] leading-[1.05] text-[color:var(--ink)] mb-1"
                  style={{ fontVariationSettings: '"opsz" 144' }}
                >
                  {selected.partDescription}
                </h2>
                <div className="font-sans text-[14px] text-[color:var(--ink-muted)] mb-4">
                  {selected.customerName} · €
                  {selected.valueEur.toLocaleString()} ·{" "}
                  {selected.weightKg.toFixed(1)} kg
                </div>

                <div className="grid grid-cols-[1fr_28px_1fr] items-center gap-3 max-w-[480px]">
                  <Endpoint
                    icon={<Truck size={12} strokeWidth={1.5} />}
                    kicker="Origin"
                    name={origin?.name ?? selected.originId}
                    city={origin?.city ?? ""}
                  />
                  <ArrowUpRight
                    size={16}
                    strokeWidth={1.5}
                    className="text-[color:var(--ink-faint)] mx-auto"
                  />
                  <Endpoint
                    icon={<MapPin size={12} strokeWidth={1.5} />}
                    kicker="Destination"
                    name={destination?.name ?? selected.destinationId}
                    city={destination?.city ?? ""}
                  />
                </div>

                <div className="mt-4 flex items-center gap-4 font-mono text-[11px] text-[color:var(--ink-muted)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock size={12} strokeWidth={1.5} />
                    SLA Deadline{" "}
                    <span className="text-[color:var(--ink)] tabular-nums">
                      {selected.slaDeadline}
                    </span>
                  </span>
                  <span className="h-3 w-px bg-[color:var(--hairline)]" />
                  <span>
                    Technician on-site{" "}
                    <span className="text-[color:var(--ink)]">
                      {selected.technicianRequired ? "required" : "not required"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-end">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
                  Risk Score
                </div>
                <NordicEqualizer
                  score={selected.riskScore}
                  size="lg"
                  drivers={selected.riskDrivers}
                  showLabel={false}
                />
                <div className="mt-3 text-right">
                  <span
                    className="font-serif text-[40px] leading-none"
                    style={{
                      color:
                        selected.riskScore >= 65
                          ? "var(--breach)"
                          : selected.riskScore >= 40
                            ? "var(--at-risk)"
                            : "var(--on-time)",
                      fontVariationSettings: '"opsz" 144',
                    }}
                  >
                    {selected.riskScore}
                  </span>
                  <span className="font-mono text-[11px] text-[color:var(--ink-muted)] ml-1">
                    /100
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Risk factor breakdown */}
          <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                  ∙ Why The System Sees Risk
                </div>
                <div className="font-serif text-[18px] text-[color:var(--ink)] mt-1">
                  Six drivers, ranked by contribution
                </div>
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
                Updated 22:34 CET
              </span>
            </div>
            <div className="space-y-4">
              {factors.map((f) => (
                <RiskFactorBar key={f.key} factor={f} />
              ))}
            </div>
          </div>

          {/* AI Recommendation */}
          <RecommendationCard
            shipment={selected}
            plan={plan}
            accepted={accepted}
            onAccept={() =>
              setAcceptedIds((prev) => new Set(prev).add(selected.id))
            }
          />
        </div>
      </div>
    </div>
  );
}

function Endpoint({
  icon,
  kicker,
  name,
  city,
}: {
  icon: React.ReactNode;
  kicker: string;
  name: string;
  city: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-1">
        {icon}
        {kicker}
      </div>
      <div className="font-sans text-[13px] text-[color:var(--ink)] leading-tight truncate">
        {name}
      </div>
      <div className="font-mono text-[10px] text-[color:var(--ink-muted)] truncate">
        {city}
      </div>
    </div>
  );
}
