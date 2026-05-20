import type { Vertical } from "@/lib/types";

interface PartDef {
  sku: string;
  name: string;
  weightKg: number;
  valueEur: number;
}

export const PARTS_BY_VERTICAL: Record<Vertical, PartDef[]> = {
  lifesci: [
    { sku: "SH-MRI-C42", name: "MRI Gradient Controller Board", weightKg: 6.2, valueEur: 18500 },
    { sku: "SH-CT-X14", name: "CT Detector Module", weightKg: 4.1, valueEur: 22400 },
    { sku: "PHL-VEN-9", name: "Ventilator Flow Sensor", weightKg: 0.4, valueEur: 1480 },
    { sku: "SH-ULT-22", name: "Ultrasound Probe TEE", weightKg: 0.9, valueEur: 9800 },
    { sku: "BMC-DLZ-3", name: "Dialysis Cassette Pump", weightKg: 1.8, valueEur: 3200 },
  ],
  auto: [
    { sku: "VLV-ECU-7", name: "Engine Control Unit", weightKg: 1.8, valueEur: 2400 },
    { sku: "SCN-BRK-12", name: "Brake Caliper Actuator", weightKg: 3.6, valueEur: 880 },
    { sku: "NKN-TYR-205", name: "Studded Winter Tyre 205/55", weightKg: 11.4, valueEur: 220 },
    { sku: "VLV-TRN-44", name: "Transmission Solenoid", weightKg: 1.2, valueEur: 740 },
    { sku: "SCN-AIR-19", name: "Air Compressor Cartridge", weightKg: 2.4, valueEur: 540 },
  ],
  agri: [
    { sku: "JD-HYD-88", name: "Hydraulic Pump Assembly", weightKg: 24, valueEur: 3400 },
    { sku: "JD-GPS-2", name: "AutoTrac GPS Receiver", weightKg: 1.1, valueEur: 4200 },
    { sku: "CNH-PTO-5", name: "PTO Drive Shaft", weightKg: 16, valueEur: 1850 },
    { sku: "JD-COMB-44", name: "Combine Concave Bar Set", weightKg: 38, valueEur: 920 },
  ],
  industrial: [
    { sku: "ABB-SRV-31", name: "Servo Drive Module", weightKg: 4.6, valueEur: 2800 },
    { sku: "KNE-LFT-9", name: "Elevator Door Operator", weightKg: 22, valueEur: 1900 },
    { sku: "AC-CMP-15", name: "Screw Compressor Element", weightKg: 31, valueEur: 4200 },
    { sku: "WTL-INJ-2", name: "Fuel Injector Common Rail", weightKg: 1.4, valueEur: 1600 },
  ],
  renewables: [
    { sku: "VST-PTC-77", name: "Pitch System Controller", weightKg: 8.2, valueEur: 12400 },
    { sku: "VST-BRG-04", name: "Main Bearing Sensor Pack", weightKg: 2.1, valueEur: 3800 },
    { sku: "GE-CNV-3", name: "DC/DC Converter Inverter", weightKg: 18, valueEur: 9200 },
    { sku: "VST-YAW-11", name: "Yaw Drive Motor", weightKg: 42, valueEur: 6400 },
  ],
  materials: [
    { sku: "STE-ROL-2", name: "Conveyor Roller Bearing", weightKg: 9.4, valueEur: 320 },
    { sku: "JCB-FRK-7", name: "Forklift Hydraulic Cylinder", weightKg: 14, valueEur: 1200 },
    { sku: "HYS-MST-3", name: "Mast Chain Set", weightKg: 22, valueEur: 780 },
  ],
  consumer: [
    { sku: "HSQ-CHN-22", name: "Chainsaw Cutter Chain", weightKg: 0.4, valueEur: 48 },
    { sku: "ELX-WSH-9", name: "Washer Motor Capacitor", weightKg: 0.2, valueEur: 32 },
    { sku: "BSH-DSH-4", name: "Dishwasher Pump", weightKg: 1.1, valueEur: 95 },
  ],
};

export function partsFor(vertical: Vertical) {
  return PARTS_BY_VERTICAL[vertical];
}
