// Industrial engineering helpers: bolt→wrench, shackle sizing, insulation rules, CSV export.

// Standard bolt → hex wrench across-flats lookup (UNC + metric).
const BOLT_TO_WRENCH: Record<string, string> = {
  "M8": "13 mm",
  "M10": "17 mm",
  "M12": "19 mm",
  "M14": "22 mm",
  "M16": "24 mm",
  "M18": "27 mm",
  "M20": "30 mm",
  "M22": "32 mm",
  "M24": "36 mm",
  "M27": "41 mm",
  "M30": "46 mm",
  "M33": "50 mm",
  "M36": "55 mm",
  "M42": "65 mm",
  "M48": "75 mm",
  "1/4\"": "7/16\"",
  "5/16\"": "1/2\"",
  "3/8\"": "9/16\"",
  "7/16\"": "5/8\"",
  "1/2\"": "3/4\"",
  "9/16\"": "13/16\"",
  "5/8\"": "1-1/16\"",
  "3/4\"": "1-1/4\"",
  "7/8\"": "1-7/16\"",
  "1\"": "1-5/8\"",
  "1-1/8\"": "1-13/16\"",
  "1-1/4\"": "2\"",
  "1-3/8\"": "2-3/16\"",
  "1-1/2\"": "2-3/8\"",
};

// Default bolt sizes per equipment type (used when no recorded bolt on equipment).
const DEFAULT_BOLT_BY_TYPE: Record<string, string> = {
  E: "M20", // shell-and-tube exchangers — typical flange bolt
  F: "M24", // columns / vessels
  G: "M20", // separators / drums
  P: "M16", // pumps
  K: "M30", // compressors
  R: "M20", // reactors
};

export function defaultBoltForType(typeCode: string): string {
  return DEFAULT_BOLT_BY_TYPE[typeCode] ?? "M16";
}

export function predictWrench(boltSize: string): string | null {
  if (!boltSize) return null;
  const key = boltSize.trim();
  if (BOLT_TO_WRENCH[key]) return BOLT_TO_WRENCH[key];
  const metric = key.match(/^M\s*(\d+)$/i);
  if (metric) return BOLT_TO_WRENCH[`M${metric[1]}`] ?? null;
  return null;
}

export function predictToolKit(boltSize: string): string[] {
  const wrench = predictWrench(boltSize);
  const tools: string[] = [];
  if (wrench) {
    tools.push(`Hex wrench / Clé plate ${wrench}`);
    tools.push(`Impact socket / Douille à choc ${wrench}`);
    tools.push(`Torque wrench / Clé dynamométrique ${wrench}`);
  }
  tools.push("Joint scraper / Racloir de joint");
  tools.push("Anti-seize compound / Pâte anti-grippage");
  return tools;
}

// Suggested shackle (Crosby G-209 working load limits, tons)
const SHACKLE_TABLE: Array<{ size: string; wll_t: number }> = [
  { size: "1/2\" (12mm)", wll_t: 2 },
  { size: "5/8\" (16mm)", wll_t: 3.25 },
  { size: "3/4\" (19mm)", wll_t: 4.75 },
  { size: "7/8\" (22mm)", wll_t: 6.5 },
  { size: "1\" (25mm)", wll_t: 8.5 },
  { size: "1-1/8\" (28mm)", wll_t: 9.5 },
  { size: "1-1/4\" (32mm)", wll_t: 12 },
  { size: "1-3/8\" (35mm)", wll_t: 13.5 },
  { size: "1-1/2\" (38mm)", wll_t: 17 },
  { size: "1-3/4\" (45mm)", wll_t: 25 },
  { size: "2\" (50mm)", wll_t: 35 },
  { size: "2-1/2\" (65mm)", wll_t: 55 },
  { size: "3\" (75mm)", wll_t: 85 },
  { size: "3-1/2\" (90mm)", wll_t: 120 },
];

export function suggestShackle(massKg: number): { size: string; wll_t: number } | null {
  if (!massKg || massKg <= 0) return null;
  const safety = (massKg * 1.5) / 1000; // tons
  return SHACKLE_TABLE.find((s) => s.wll_t >= safety) ?? SHACKLE_TABLE[SHACKLE_TABLE.length - 1];
}

export function safetyLoadKg(massKg: number) {
  return Math.round(massKg * 1.5);
}

// Insulation logic by equipment type + (optional) temperature
export function insulationRecommendation(typeCode: string, tempC?: number): {
  required: boolean;
  thickness_mm: number;
  material: string;
  rationale: string;
} {
  const t = tempC ?? estimateTempByType(typeCode);
  if (t >= 60 && t < 150) return { required: true, thickness_mm: 50, material: "Mineral wool + aluminium jacket", rationale: `Hot service ${t}°C — personnel protection.` };
  if (t >= 150 && t < 350) return { required: true, thickness_mm: 80, material: "Rock wool + stainless steel jacket", rationale: `High-temp service ${t}°C — heat conservation.` };
  if (t >= 350) return { required: true, thickness_mm: 120, material: "Calcium silicate + SS jacket", rationale: `Very high temp ${t}°C — refractory insulation.` };
  if (t < 0 && t > -50) return { required: true, thickness_mm: 60, material: "Cellular glass (Foamglas)", rationale: `Cold service ${t}°C — anti-condensation.` };
  if (t <= -50) return { required: true, thickness_mm: 150, material: "Polyurethane + vapour barrier", rationale: `Cryogenic ${t}°C — LNG-grade insulation.` };
  return { required: false, thickness_mm: 0, material: "—", rationale: "Ambient service, no insulation required." };
}

function estimateTempByType(code: string): number {
  // Rough defaults so insulation tab still gives guidance when no temp recorded.
  switch (code) {
    case "E": return 120; // exchanger
    case "F": return 90;  // column
    case "G": return 40;  // separator
    case "P": return 60;  // pump
    case "K": return 80;  // compressor
    default: return 25;
  }
}

// CSV export
export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    if (v == null) return "";
    const s = typeof v === "string" ? v : JSON.stringify(v);
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
