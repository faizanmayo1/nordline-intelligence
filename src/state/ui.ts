import { create } from "zustand";

export type Theme = "day" | "night";
export type CountryCode = "DK" | "SE" | "NO" | "FI" | "EE" | "LV" | "LT" | "PL";

export const COUNTRIES: { code: CountryCode; name: string }[] = [
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "FI", name: "Finland" },
  { code: "EE", name: "Estonia" },
  { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" },
  { code: "PL", name: "Poland" },
];

export type MapLayerKey = "hub" | "fsl" | "pudo";

interface UiState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  countryFilter: CountryCode | "ALL";
  setCountryFilter: (c: CountryCode | "ALL") => void;
  selectedShipmentId: string | null;
  setSelectedShipment: (id: string | null) => void;
  selectedNodeId: string | null;
  setSelectedNode: (id: string | null) => void;
  visibleLayers: Record<MapLayerKey, boolean>;
  toggleLayer: (k: MapLayerKey) => void;
}

export const useUi = create<UiState>((set) => ({
  theme: "night",
  setTheme: (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((s) => {
      const next: Theme = s.theme === "day" ? "night" : "day";
      document.documentElement.setAttribute("data-theme", next);
      return { theme: next };
    }),
  countryFilter: "ALL",
  setCountryFilter: (countryFilter) => set({ countryFilter }),
  selectedShipmentId: null,
  setSelectedShipment: (selectedShipmentId) => set({ selectedShipmentId }),
  selectedNodeId: null,
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  visibleLayers: { hub: true, fsl: true, pudo: true },
  toggleLayer: (k) =>
    set((s) => ({
      visibleLayers: { ...s.visibleLayers, [k]: !s.visibleLayers[k] },
    })),
}));

// Initialize theme attribute on first import
if (typeof document !== "undefined") {
  document.documentElement.setAttribute("data-theme", "night");
}
