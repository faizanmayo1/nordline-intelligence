import { useUi, type MapLayerKey } from "@/state/ui";
import { cn } from "@/lib/cn";
import { HubMarker, FslMarker, PudoMarker } from "./markers";

export interface MapHudProps {
  className?: string;
  /** counts for the legend, optional */
  counts?: { hub?: number; fsl?: number; pudo?: number; routes?: number };
}

export function MapHud({ className, counts }: MapHudProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0", className)}>
      {/* Top-left: corner kicker */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-[color:var(--panel)]/90 backdrop-blur-sm border border-[color:var(--hairline)] rounded-[3px] px-3 py-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-faint)] mb-0.5">
            ∙ Live Network
          </div>
          <div className="font-serif text-[14px] text-[color:var(--ink)] leading-none">
            Nordics · Baltics · Poland
          </div>
        </div>
      </div>

      {/* Bottom-left: legend */}
      <div className="absolute bottom-6 left-4 pointer-events-auto">
        <div className="bg-[color:var(--panel)]/92 backdrop-blur-sm border border-[color:var(--hairline)] rounded-[3px] px-4 py-3 flex flex-col gap-2 min-w-[180px]">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)] mb-1">
            Legend
          </div>
          <LegendRow
            marker={<HubMarker size="sm" />}
            label="Hub"
            count={counts?.hub}
          />
          <LegendRow
            marker={<FslMarker size="sm" />}
            label="FSL"
            count={counts?.fsl}
          />
          <LegendRow
            marker={<PudoMarker size="sm" />}
            label="PUDO"
            count={counts?.pudo}
          />
          <div className="h-px bg-[color:var(--hairline)] my-1.5" />
          <div className="flex items-center justify-between font-mono text-[10px] text-[color:var(--ink-muted)]">
            <span>Active Routes</span>
            <span className="tabular-nums text-[color:var(--ink)]">
              {counts?.routes ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-right: layer toggle */}
      <div className="absolute bottom-6 right-4 pointer-events-auto">
        <LayerToggle />
      </div>
    </div>
  );
}

function LegendRow({
  marker,
  label,
  count,
}: {
  marker: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="w-4 inline-flex justify-center">{marker}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">
          {label}
        </span>
      </div>
      {count != null ? (
        <span className="font-mono text-[10px] tabular-nums text-[color:var(--ink)]">
          {count}
        </span>
      ) : null}
    </div>
  );
}

function LayerToggle() {
  const layers = useUi((s) => s.visibleLayers);
  const toggle = useUi((s) => s.toggleLayer);

  const items: { key: MapLayerKey; label: string }[] = [
    { key: "hub", label: "Hubs" },
    { key: "fsl", label: "FSL" },
    { key: "pudo", label: "PUDO" },
  ];

  return (
    <div className="inline-flex bg-[color:var(--panel)]/92 backdrop-blur-sm border border-[color:var(--hairline)] rounded-[3px] p-1 gap-0.5">
      {items.map((it) => {
        const on = layers[it.key];
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => toggle(it.key)}
            aria-pressed={on}
            className={cn(
              "h-7 px-2.5 font-mono text-[10px] uppercase tracking-[0.18em] rounded-[2px] transition-colors",
              on
                ? "bg-[color:var(--accent)] text-[color:var(--ink-on-accent)]"
                : "text-[color:var(--ink-muted)] hover:text-[color:var(--ink)] hover:bg-[color:var(--panel-soft)]",
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
