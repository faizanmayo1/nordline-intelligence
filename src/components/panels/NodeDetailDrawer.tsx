import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useUi, COUNTRIES } from "@/state/ui";
import { NODE_BY_ID } from "@/data/network";
import { SHIPMENTS } from "@/data/shipments";
import { Badge } from "@/components/primitives/Badge";
import { HubOperationsBlock } from "@/components/panels/HubOperationsBlock";
import { cn } from "@/lib/cn";

export function NodeDetailDrawer() {
  const selectedId = useUi((s) => s.selectedNodeId);
  const setSelected = useUi((s) => s.setSelectedNode);
  const open = !!selectedId;
  const node = selectedId ? NODE_BY_ID.get(selectedId) : null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) setSelected(null);
      }}
    >
      <AnimatePresence>
        {open && node ? (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-40 bg-[color:var(--ink)]/20 backdrop-blur-[1px]"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 36 }}
                className={cn(
                  "fixed top-0 right-0 bottom-0 z-50 w-[420px] max-w-[92vw]",
                  "bg-[color:var(--panel)] border-l border-[color:var(--hairline-strong)]",
                  "flex flex-col",
                )}
              >
                <NodeDetailBody nodeId={selectedId!} />
                <DialogPrimitive.Close className="absolute top-4 right-4 text-[color:var(--ink-faint)] hover:text-[color:var(--ink)] transition-colors">
                  <X size={16} strokeWidth={1.5} />
                </DialogPrimitive.Close>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

function NodeDetailBody({ nodeId }: { nodeId: string }) {
  const node = NODE_BY_ID.get(nodeId)!;
  const inbound = SHIPMENTS.filter((s) => s.destinationId === nodeId).slice(0, 6);
  const outbound = SHIPMENTS.filter((s) => s.originId === nodeId).slice(0, 4);
  const countryName =
    COUNTRIES.find((c) => c.code === node.country)?.name ?? node.country;

  const kindLabel =
    node.kind === "hub"
      ? "Hub"
      : node.kind === "fsl"
        ? "Forward Stock Location"
        : "PUDO";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-6 pb-5 border-b border-[color:var(--hairline)]">
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-2">
          <span className="text-[color:var(--accent)]">∙</span>
          <span>{kindLabel}</span>
          <span className="text-[color:var(--ink-faint)]">/</span>
          <span className="tabular-nums text-[color:var(--ink-faint)]">
            {node.id}
          </span>
        </div>
        <h2
          className="font-serif text-[28px] leading-none text-[color:var(--ink)] mb-2"
          style={{ fontVariationSettings: '"opsz" 144' }}
        >
          {node.name}
        </h2>
        <div className="font-sans text-[12px] text-[color:var(--ink-muted)]">
          {node.city}, {countryName}
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Node-specific stats */}
        {node.kind === "hub" ? (
          <HubOperationsBlock hub={node} />
        ) : node.kind === "fsl" ? (
          <StatGrid
            items={[
              {
                label: "Stock",
                value: node.stockHealth ?? "—",
                tone:
                  node.stockHealth === "critical"
                    ? "breach"
                    : node.stockHealth === "low"
                      ? "at-risk"
                      : node.stockHealth === "watch"
                        ? "at-risk"
                        : "on-time",
              },
              { label: "Capacity", value: node.capacity ?? "—" },
              { label: "SKUs", value: "≈ 42" },
            ]}
          />
        ) : (
          <StatGrid
            items={[
              { label: "Type", value: node.pudoType ?? "—" },
              { label: "Capacity", value: node.capacity ?? "—" },
              { label: "Open", value: "06:00–22:00" },
            ]}
          />
        )}

        <Section title="Inbound Tonight" count={inbound.length}>
          {inbound.length ? (
            <ul className="space-y-2">
              {inbound.map((sh) => (
                <ShipmentRow key={sh.id} sh={sh} />
              ))}
            </ul>
          ) : (
            <EmptyRow />
          )}
        </Section>

        {outbound.length ? (
          <Section title="Outbound" count={outbound.length}>
            <ul className="space-y-2">
              {outbound.map((sh) => (
                <ShipmentRow key={sh.id} sh={sh} />
              ))}
            </ul>
          </Section>
        ) : null}
      </div>
    </div>
  );
}

function StatGrid({
  items,
}: {
  items: {
    label: string;
    value: string | number;
    tone?: "on-time" | "at-risk" | "breach";
  }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="p-3 border border-[color:var(--hairline)] rounded-[3px]"
        >
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1.5">
            {it.label}
          </div>
          <div
            className="font-serif text-[20px] leading-none text-[color:var(--ink)] capitalize"
            style={{
              color: it.tone
                ? it.tone === "on-time"
                  ? "var(--on-time)"
                  : it.tone === "at-risk"
                    ? "var(--at-risk)"
                    : "var(--breach)"
                : undefined,
            }}
          >
            {it.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
          {title}
        </div>
        {count != null ? (
          <span className="font-mono text-[10px] text-[color:var(--ink-faint)] tabular-nums">
            {count}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function EmptyRow() {
  return (
    <div className="font-sans text-[12px] italic text-[color:var(--ink-faint)]">
      No shipments staged.
    </div>
  );
}

function ShipmentRow({ sh }: { sh: (typeof SHIPMENTS)[number] }) {
  const variant =
    sh.status === "breach-imminent"
      ? "breach"
      : sh.status === "at-risk"
        ? "at-risk"
        : sh.status === "exception"
          ? "at-risk"
          : "on-time";
  return (
    <li className="flex items-center justify-between gap-3 py-1.5 border-b border-[color:var(--hairline)] last:border-b-0">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-[color:var(--ink-faint)]">
            {sh.id}
          </span>
          <Badge variant={variant} dot uppercase={false}>
            {sh.status}
          </Badge>
        </div>
        <div className="font-sans text-[12px] text-[color:var(--ink)] truncate mt-0.5">
          {sh.partDescription}
        </div>
        <div className="font-mono text-[10px] text-[color:var(--ink-muted)] tabular-nums">
          {sh.customerName}
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[color:var(--ink-muted)]">
          SLA
        </div>
        <div className="font-mono text-[12px] tabular-nums text-[color:var(--ink)]">
          {sh.slaDeadline}
        </div>
      </div>
    </li>
  );
}
