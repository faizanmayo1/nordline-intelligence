import { Download, Calendar, Share2, Mail, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/primitives/Button";
import { Badge } from "@/components/primitives/Badge";
import { useToast } from "@/components/primitives/Toast";
import { ANCHOR_CUSTOMER } from "@/data/customers";

const SLA_HISTORY = [
  { week: "W08", sla: 95.6, target: 96 },
  { week: "W09", sla: 96.2, target: 96 },
  { week: "W10", sla: 95.9, target: 96 },
  { week: "W11", sla: 96.4, target: 96 },
  { week: "W12", sla: 97.1, target: 96 },
  { week: "W13", sla: 96.8, target: 96 },
  { week: "W14", sla: 95.5, target: 96 },
  { week: "W15", sla: 96.3, target: 96 },
  { week: "W16", sla: 97.4, target: 96 },
  { week: "W17", sla: 96.9, target: 96 },
  { week: "W18", sla: 97.2, target: 96 },
  { week: "W19", sla: 96.8, target: 96 },
];

const EXCEPTIONS = [
  { cause: "Weather Hold", count: 3, color: "var(--info)" },
  { cause: "Hub Backlog", count: 3, color: "var(--at-risk)" },
  { cause: "Customer Access", count: 2, color: "var(--breach)" },
  { cause: "Wrong Drop", count: 1, color: "var(--accent)" },
];

const TOTAL_EXC = EXCEPTIONS.reduce((s, e) => s + e.count, 0);

export function CustomerReport() {
  const toast = useToast();
  const customer = ANCHOR_CUSTOMER; // Siemens Healthineers

  const handleAction = (kicker: string, title: string, description: string) => {
    toast.push({ kicker, title, description });
  };

  return (
    <div className="bg-[color:var(--paper)] min-h-[calc(100vh-64px)]">
      <div className="max-w-[1180px] mx-auto px-10 py-10">
        {/* Top utility bar */}
        <div className="flex items-center justify-between mb-10 pb-3 border-b border-[color:var(--hairline)]">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
            <span className="text-[color:var(--accent)]">∙</span>
            Customer Performance Report
            <span className="text-[color:var(--ink-faint)]">/</span>
            Issue No. 19, 2026
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                handleAction(
                  "Export Ready",
                  "Week-19 report.pdf prepared",
                  "Branded with Nordline + Siemens cover · ready for review.",
                )
              }
            >
              <Download size={12} strokeWidth={1.5} />
              Export PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleAction(
                  "Scheduled",
                  "Weekly delivery to Siemens ops",
                  "Friday 09:00 CET · primary contact Mira Karlsson · cc procurement",
                )
              }
            >
              <Calendar size={12} strokeWidth={1.5} />
              Schedule Weekly
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleAction(
                  "Share Link",
                  "Read-only portal link generated",
                  "Expires 2026-05-26 · audit log enabled",
                )
              }
            >
              <Share2 size={12} strokeWidth={1.5} />
              Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                handleAction("Print", "Sent to system print queue", "A4, two-up")
              }
            >
              <Printer size={12} strokeWidth={1.5} />
            </Button>
          </div>
        </div>

        {/* Cover */}
        <header className="grid grid-cols-[1.5fr_1fr] gap-12 mb-12">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-muted)] mb-4">
              {customer.name} · Week 19, 2026 · {formatWeek()}
            </div>
            <h1
              className="font-serif font-normal text-[68px] leading-[0.96] tracking-[-0.018em] text-[color:var(--ink)] mb-5"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              A Quiet Week.
              <br />
              <span className="text-[color:var(--accent)]">By Design.</span>
            </h1>
            <p className="font-sans text-[15px] italic text-[color:var(--ink-muted)] leading-[1.55] max-w-[52ch]">
              Two hundred and eighty-seven critical spare-parts deliveries
              crossed seven countries on the {customer.name} contract. Three
              were saved by a 02:00 reroute that the night dispatcher never had
              to touch. This is what the system did, and what it suggests next.
            </p>
            <div className="mt-6 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)]">
              <Badge variant="accent" uppercase>
                Tier 1 · Enterprise
              </Badge>
              <span>Account lead · Mira Karlsson</span>
              <span>·</span>
              <span>YTD Revenue €{(customer.ytdRevenueEur / 1e6).toFixed(1)}M</span>
            </div>
          </div>
          <div className="border-l border-[color:var(--hairline)] pl-12 flex flex-col justify-end">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
              ∙ This Week At A Glance
            </div>
            <PullStat
              label="Shipments"
              value="287"
              caption="across in-night, FSL replenishment, and technician chain"
            />
            <PullStat
              label="SLA Performance"
              value="96.8%"
              caption="above renewal threshold of 96%"
              tone="accent"
            />
            <PullStat
              label="Cost-To-Serve"
              value="€148,640"
              caption="−2.1% vs. four-week average"
            />
          </div>
        </header>

        <hr className="border-0 h-px bg-[color:var(--hairline-strong)] mb-10" />

        {/* SLA trend section */}
        <section className="grid grid-cols-[1.4fr_1fr] gap-12 mb-12">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
              I · Performance
            </div>
            <h2
              className="font-serif text-[32px] leading-[1.05] text-[color:var(--ink)] mb-4"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Twelve weeks of SLA performance, against the renewal threshold.
            </h2>
            <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] leading-[1.55] mb-5 max-w-[58ch]">
              The contractual floor is 96%. {customer.name} has cleared it for
              eleven of the past twelve weeks — the W14 dip was tied to a
              Stockholm consolidation outage, since resolved.
            </p>
            <div className="bg-[color:var(--panel)] border border-[color:var(--hairline)] rounded-[3px] p-5">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={SLA_HISTORY}
                    margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="sla-grad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--hairline)" vertical={false} />
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "var(--ink-faint)", fontFamily: "JetBrains Mono", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--hairline-strong)" }}
                    />
                    <YAxis
                      domain={[94, 98]}
                      tick={{ fill: "var(--ink-faint)", fontFamily: "JetBrains Mono", fontSize: 10 }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--hairline-strong)" }}
                      width={28}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--panel)",
                        border: "1px solid var(--hairline-strong)",
                        borderRadius: 3,
                        fontFamily: "JetBrains Mono",
                        fontSize: 11,
                        color: "var(--ink)",
                      }}
                      labelStyle={{ color: "var(--ink-muted)", fontSize: 9, textTransform: "uppercase" }}
                      formatter={(v: number) => [`${v.toFixed(1)}%`, "SLA"]}
                    />
                    <ReferenceLine
                      y={96}
                      stroke="var(--at-risk)"
                      strokeDasharray="3 3"
                      label={{
                        value: "Renewal floor 96%",
                        position: "insideTopLeft",
                        fill: "var(--at-risk)",
                        fontSize: 9,
                        fontFamily: "JetBrains Mono",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="sla"
                      stroke="var(--accent)"
                      strokeWidth={1.5}
                      fill="url(#sla-grad)"
                      isAnimationActive={false}
                      dot={{ r: 2.5, fill: "var(--accent)" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <aside className="border-l border-[color:var(--hairline)] pl-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-3">
              ∙ Notable Saves
            </div>
            <div className="space-y-5">
              <Save
                idx="01"
                title="MRI gradient controller, Tampere"
                detail="Predicted breach at 87%. Auto-rerouted via PUDO Locker #14. Downtime exposure avoided: €48k."
              />
              <Save
                idx="02"
                title="CT detector module, Berlin RDC"
                detail="Cold-chain seal flag triggered at Copenhagen line-haul. Recovered without customer notification."
              />
              <Save
                idx="03"
                title="Ventilator flow sensor, Helsinki"
                detail="Hub backlog caught at 22:34. Cut-off held; arrival on plan."
              />
            </div>
          </aside>
        </section>

        <hr className="border-0 h-px bg-[color:var(--hairline-strong)] mb-10" />

        {/* Exceptions + cost */}
        <section className="grid grid-cols-[1fr_1fr] gap-12 mb-12">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
              II · Exceptions
            </div>
            <h2
              className="font-serif text-[28px] leading-[1.08] text-[color:var(--ink)] mb-2"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Nine exceptions, none unresolved.
            </h2>
            <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] leading-[1.55] mb-5 max-w-[52ch]">
              Half the week's exceptions resolved themselves through auto-triage. The remainder closed within the hour by hub or driver intervention.
            </p>
            <div className="grid grid-cols-[160px_1fr] gap-6 items-center">
              <div className="h-[160px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EXCEPTIONS}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={2}
                      isAnimationActive={false}
                    >
                      {EXCEPTIONS.map((e, i) => (
                        <Cell key={i} fill={e.color} stroke="var(--panel)" strokeWidth={2} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span
                    className="font-serif text-[36px] leading-none text-[color:var(--ink)]"
                    style={{ fontVariationSettings: '"opsz" 144' }}
                  >
                    {TOTAL_EXC}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                    Total
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {EXCEPTIONS.map((e) => (
                  <li key={e.cause} className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: e.color }}
                    />
                    <span className="font-sans text-[12px] text-[color:var(--ink)] flex-1">
                      {e.cause}
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-[color:var(--ink-muted)]">
                      {e.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l border-[color:var(--hairline)] pl-12">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
              III · Cost-To-Serve
            </div>
            <h2
              className="font-serif text-[28px] leading-[1.08] text-[color:var(--ink)] mb-2"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Two-percent down. Coverage up.
            </h2>
            <p className="font-sans text-[13px] italic text-[color:var(--ink-muted)] leading-[1.55] mb-5">
              Route density improvements on the Helsinki–Tampere corridor reduced cost per shipment from €534 to €517.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <CostStat label="Total this week" value="€148,640" />
              <CostStat label="Per shipment" value="€517" delta={-3.2} tone="on-time" />
              <CostStat label="Failed-delivery cost" value="€2,140" delta={-18.4} tone="on-time" />
              <CostStat
                label="Exposure avoided"
                value="€127k"
                tone="accent"
                caption="By proactive interventions"
              />
            </div>
          </div>
        </section>

        <hr className="border-0 h-px bg-[color:var(--hairline-strong)] mb-10" />

        {/* Analyst note */}
        <section className="grid grid-cols-[1fr_2fr] gap-12">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-3">
              ∙ From The Analyst
            </div>
            <div
              className="font-serif text-[24px] leading-[1.18] text-[color:var(--ink)] mb-3"
              style={{ fontVariationSettings: '"opsz" 144' }}
            >
              Three recommended changes for Week 20.
            </div>
            <p className="font-sans text-[12px] italic text-[color:var(--ink-muted)] leading-[1.55]">
              The system has identified three small structural changes that
              would absorb most of the residual exception volume without
              changing your service envelope.
            </p>
          </div>
          <ol className="space-y-5">
            <Recommendation
              idx="01"
              title="Pre-approve Tampere PUDO Locker #14"
              body="Make Tampere PUDO Locker #14 a permanent alternative drop for MRI controller boards on the FI route. Two W19 saves followed exactly this path."
            />
            <Recommendation
              idx="02"
              title="Tighten Stockholm cut-off"
              body="Move Mon and Tue Stockholm cut-offs to 00:45. Two of three W19 backlog exceptions trace to a 22:10 line-haul slip we can absorb upstream."
            />
            <Recommendation
              idx="03"
              title="Refresh Berlin RDC cold-chain SOP"
              body="Berlin RDC drivers will benefit from a January refresh of the 2°C–8°C handling SOP. We can run the certification through our partner Linder."
            />
          </ol>
        </section>

        {/* Footer */}
        <footer className="mt-16 pt-6 border-t border-[color:var(--hairline)] flex items-center justify-between text-[color:var(--ink-faint)]">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em]">
            Nordline Intelligence · Customer Performance Report · Issue No. 19, 2026
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={11} strokeWidth={1.5} /> Delivered Friday 09:00 CET
            </span>
            <span>·</span>
            <span>Confidential — for {customer.name} only</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PullStat({
  label,
  value,
  caption,
  tone,
}: {
  label: string;
  value: string;
  caption: string;
  tone?: "accent";
}) {
  return (
    <div className="border-t border-[color:var(--hairline)] py-4 first:border-t-0 first:pt-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1.5">
        {label}
      </div>
      <div className="flex items-baseline justify-between gap-3">
        <span
          className="font-serif text-[44px] leading-none tracking-[-0.018em]"
          style={{
            color: tone === "accent" ? "var(--accent)" : "var(--ink)",
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {value}
        </span>
      </div>
      <div className="mt-1.5 font-sans text-[11px] italic text-[color:var(--ink-muted)] leading-snug">
        {caption}
      </div>
    </div>
  );
}

function Save({
  idx,
  title,
  detail,
}: {
  idx: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid grid-cols-[26px_1fr] gap-3">
      <span className="font-mono text-[10px] tabular-nums text-[color:var(--accent)] tracking-wider pt-1">
        {idx}
      </span>
      <div>
        <div className="font-serif text-[14px] text-[color:var(--ink)] leading-tight mb-1">
          {title}
        </div>
        <p className="font-sans text-[12px] italic text-[color:var(--ink-muted)] leading-snug">
          {detail}
        </p>
      </div>
    </div>
  );
}

function CostStat({
  label,
  value,
  delta,
  tone,
  caption,
}: {
  label: string;
  value: string;
  delta?: number;
  tone?: "on-time" | "accent";
  caption?: string;
}) {
  const color =
    tone === "on-time" ? "var(--on-time)" : tone === "accent" ? "var(--accent)" : "var(--ink)";
  return (
    <div className="border border-[color:var(--hairline)] rounded-[3px] p-4">
      <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className="font-serif text-[24px] leading-none tracking-[-0.018em]"
          style={{ color, fontVariationSettings: '"opsz" 144' }}
        >
          {value}
        </span>
        {delta != null ? (
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: delta < 0 ? "var(--on-time)" : "var(--at-risk)" }}
          >
            {delta > 0 ? "+" : ""}
            {delta.toFixed(1)}%
          </span>
        ) : null}
      </div>
      {caption ? (
        <div className="mt-1.5 font-sans text-[11px] italic text-[color:var(--ink-muted)] leading-snug">
          {caption}
        </div>
      ) : null}
    </div>
  );
}

function Recommendation({
  idx,
  title,
  body,
}: {
  idx: string;
  title: string;
  body: string;
}) {
  return (
    <li className="grid grid-cols-[40px_1fr] gap-4 items-baseline">
      <span
        className="font-serif text-[28px] tracking-[-0.02em] text-[color:var(--accent)] leading-none"
        style={{ fontVariationSettings: '"opsz" 144' }}
      >
        {idx}
      </span>
      <div>
        <div className="font-serif text-[18px] leading-[1.2] text-[color:var(--ink)] mb-1.5">
          {title}
        </div>
        <p className="font-sans text-[13px] text-[color:var(--ink-muted)] leading-[1.55] max-w-[64ch]">
          {body}
        </p>
      </div>
    </li>
  );
}

function formatWeek() {
  // Editorial label; date is fixed for the demo
  return "11–17 May 2026";
}
