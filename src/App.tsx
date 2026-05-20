import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/chrome/AppShell";
import { ControlTower } from "@/pages/ControlTower";
import { SlaRisk } from "@/pages/SlaRisk";
import { Inventory } from "@/pages/Inventory";
import { RouteOptimization } from "@/pages/RouteOptimization";
import { Assistant } from "@/pages/Assistant";
import { CustomerReport } from "@/pages/CustomerReport";
import { Architecture } from "@/pages/Architecture";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/control-tower" replace />} />
        <Route path="/control-tower" element={<ControlTower />} />
        <Route path="/sla-risk" element={<SlaRisk />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/route-optimization" element={<RouteOptimization />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/customer-report" element={<CustomerReport />} />
        <Route path="/architecture" element={<Architecture />} />
      </Routes>
    </AppShell>
  );
}
