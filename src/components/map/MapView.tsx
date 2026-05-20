import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import maplibregl, { type Map as MapLibreMap, Marker as MlMarker } from "maplibre-gl";
import { useUi } from "@/state/ui";
import { MarkerByKind, type MarkerKind, type MarkerProps } from "./markers";

export interface MapPoint extends MarkerProps {
  id: string;
  lngLat: [number, number];
  kind: MarkerKind;
  onClick?: (id: string) => void;
}

export interface MapLineString {
  id: string;
  coordinates: [number, number][];
  color?: string;
  width?: number;
  dashed?: boolean;
  opacity?: number;
}

export interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  points?: MapPoint[];
  lines?: MapLineString[];
  className?: string;
  /** Bounds override — pairs of [west, south] and [east, north] */
  bounds?: [[number, number], [number, number]];
  interactive?: boolean;
  /** Overlay rendered above the map (HUD, legend, etc.) */
  overlay?: ReactNode;
}

function styleFor(theme: "day" | "night"): maplibregl.StyleSpecification {
  // CartoDB raster tiles — no token required, attribution required
  const tiles =
    theme === "night"
      ? [
          "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png",
        ]
      : [
          "https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png",
        ];
  return {
    version: 8,
    sources: {
      carto: {
        type: "raster",
        tiles,
        tileSize: 256,
        attribution: "© OpenStreetMap contributors · © CARTO",
      },
    },
    layers: [
      {
        id: "carto-raster",
        type: "raster",
        source: "carto",
        minzoom: 0,
        maxzoom: 19,
      },
    ],
  };
}

export function MapView({
  center = [18, 62],
  zoom = 4.1,
  points = [],
  lines = [],
  className,
  bounds,
  interactive = true,
  overlay,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, { marker: MlMarker; el: HTMLDivElement }>>(
    new Map(),
  );
  const theme = useUi((s) => s.theme);
  const [ready, setReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: styleFor(theme),
      center,
      zoom,
      attributionControl: false,
      interactive,
      dragRotate: false,
      pitchWithRotate: false,
    });
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left",
    );
    if (interactive) {
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "top-right",
      );
    }
    mapRef.current = map;
    map.on("load", () => setReady(true));
    if (bounds) {
      map.fitBounds(bounds, { padding: 40, duration: 0 });
    }
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change → swap style
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(styleFor(theme));
    const onStyleLoad = () => {
      // Re-add line layers after style change
      drawLines(map, lines);
    };
    map.once("style.load", onStyleLoad);
    return () => {
      map.off("style.load", onStyleLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  // Re-render line sources/layers on change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    drawLines(map, lines);
  }, [lines, ready]);

  // Sync markers with points
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const current = markersRef.current;
    const nextIds = new Set(points.map((p) => p.id));

    // Remove stale
    for (const [id, entry] of current.entries()) {
      if (!nextIds.has(id)) {
        entry.marker.remove();
        current.delete(id);
      }
    }

    // Add or update
    for (const p of points) {
      let entry = current.get(p.id);
      if (!entry) {
        const el = document.createElement("div");
        el.style.display = "inline-flex";
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat(p.lngLat)
          .addTo(map);
        if (p.onClick) {
          el.style.cursor = "pointer";
          el.addEventListener("click", (ev) => {
            ev.stopPropagation();
            p.onClick?.(p.id);
          });
        }
        entry = { marker, el };
        current.set(p.id, entry);
      } else {
        entry.marker.setLngLat(p.lngLat);
      }
    }
  }, [points, ready]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          background: "var(--map-bg)",
        }}
      />
      {/* Marker portals */}
      {ready
        ? points.map((p) => {
            const entry = markersRef.current.get(p.id);
            if (!entry) return null;
            return createPortal(
              <MarkerByKind
                kind={p.kind}
                pulse={p.pulse}
                label={p.label}
                tone={p.tone}
                size={p.size}
              />,
              entry.el,
              p.id,
            );
          })
        : null}
      {overlay ? (
        <div className="absolute inset-0 pointer-events-none">{overlay}</div>
      ) : null}
    </div>
  );
}

function drawLines(map: MapLibreMap, lines: MapLineString[]) {
  // Remove previous nordline-lines source/layers
  const layersToRemove = map
    .getStyle()
    .layers?.filter((l) => l.id.startsWith("nl-line-"))
    .map((l) => l.id) ?? [];
  for (const id of layersToRemove) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  const sourcesToRemove = Object.keys(
    (map.getStyle().sources ?? {}) as Record<string, unknown>,
  ).filter((s) => s.startsWith("nl-line-"));
  for (const id of sourcesToRemove) {
    if (map.getSource(id)) map.removeSource(id);
  }

  for (const line of lines) {
    const sourceId = `nl-line-src-${line.id}`;
    const layerId = `nl-line-${line.id}`;
    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: line.coordinates,
        },
      },
    });
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      paint: {
        "line-color": line.color ?? "#5ee9a6",
        "line-width": line.width ?? 1.5,
        "line-opacity": line.opacity ?? 0.7,
        ...(line.dashed ? { "line-dasharray": [2, 2] } : {}),
      },
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
    });
  }
}
