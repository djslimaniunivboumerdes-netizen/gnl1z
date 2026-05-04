import { useState } from "react";
import { useI18n } from "@/contexts/I18nContext";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACCENT = "#f97316";

interface Node {
  id: string;
  x: number; // 0-100
  y: number; // 0-100
  label: string;
  name: { en: string; fr: string };
  category: "absorber" | "exchanger" | "compressor" | "column" | "drum";
  description: { en: string; fr: string };
  specs: { label: string; value: string }[];
}

const NODES: Node[] = [
  {
    id: "x01", x: 8, y: 50, label: "X01", category: "absorber",
    name: { en: "MEA CO₂ Absorber", fr: "Absorbeur CO₂ MEA" },
    description: {
      en: "Removes CO₂ from feed gas using mono-ethanolamine solution down to LNG grade (<50 ppmv).",
      fr: "Élimine le CO₂ du gaz d'alimentation par solution MEA aux spécifications GNL (<50 ppmv).",
    },
    specs: [
      { label: "Design Pressure", value: "48 bar" }, { label: "Diameter", value: '120"' },
      { label: "Height", value: "32 m" }, { label: "Service", value: "Amine treating" },
    ],
  },
  {
    id: "x02", x: 22, y: 50, label: "X02", category: "drum",
    name: { en: "Mol-Sieve Dehydrator", fr: "Déshydrateur Tamis Mol." },
    description: {
      en: "Dries gas via molecular-sieve adsorption to <1 ppmv H₂O before cryogenic section.",
      fr: "Sèche le gaz par adsorption sur tamis moléculaires (<1 ppmv H₂O) avant cryogénie.",
    },
    specs: [
      { label: "Beds", value: "3 × parallel" }, { label: "Regen Temp", value: "280 °C" },
      { label: "Cycle", value: "8 h" },
    ],
  },
  {
    id: "x05", x: 38, y: 35, label: "X05", category: "exchanger",
    name: { en: "Propane Pre-Cooler", fr: "Pré-refroidisseur Propane" },
    description: {
      en: "Kettle-type chiller cools feed and MCR streams using propane refrigeration loop.",
      fr: "Chiller type kettle refroidissant gaz et MCR via boucle propane.",
    },
    specs: [
      { label: "Type", value: "Kettle (E)" }, { label: "Outlet T", value: "−35 °C" },
      { label: "Duty", value: "85 MW" },
    ],
  },
  {
    id: "k01", x: 38, y: 78, label: "K01", category: "compressor",
    name: { en: "Propane Compressor", fr: "Compresseur Propane" },
    description: {
      en: "Centrifugal compressor driving the propane pre-cooling loop, steam-turbine driven.",
      fr: "Compresseur centrifuge entraînant la boucle propane, turbine vapeur.",
    },
    specs: [
      { label: "Stages", value: "4" }, { label: "Power", value: "32 MW" },
      { label: "Driver", value: "Steam turbine" },
    ],
  },
  {
    id: "x04", x: 56, y: 35, label: "MCHE", category: "exchanger",
    name: { en: "Main Cryogenic Heat Exchanger", fr: "Échangeur Cryogénique Principal" },
    description: {
      en: "Coil-wound exchanger (Air Products) liquefying natural gas at −162 °C using MCR refrigerant.",
      fr: "Échangeur bobiné (Air Products) liquéfiant le gaz à −162 °C via réfrigérant MCR.",
    },
    specs: [
      { label: "Type", value: "Coil-wound" }, { label: "Outlet T", value: "−162 °C" },
      { label: "Height", value: "55 m" }, { label: "Duty", value: "180 MW" },
    ],
  },
  {
    id: "k02", x: 56, y: 78, label: "K02", category: "compressor",
    name: { en: "MCR Compressor", fr: "Compresseur MCR" },
    description: {
      en: "Mixed-Component Refrigerant compressor — heart of the AP-C3MR™ liquefaction loop.",
      fr: "Compresseur MCR — cœur de la boucle de liquéfaction AP-C3MR™.",
    },
    specs: [
      { label: "Stages", value: "3 + 2" }, { label: "Power", value: "55 MW" },
      { label: "Refrigerant", value: "N₂/C1/C2/C3" },
    ],
  },
  {
    id: "x07", x: 76, y: 25, label: "X07", category: "column",
    name: { en: "Demethaniser", fr: "Déméthaniseur" },
    description: { en: "Separates methane overhead from heavier hydrocarbons.", fr: "Sépare le méthane en tête des hydrocarbures plus lourds." },
    specs: [{ label: "Trays", value: "32" }, { label: "Top T", value: "−95 °C" }],
  },
  {
    id: "x08", x: 88, y: 40, label: "X08", category: "column",
    name: { en: "Deethaniser", fr: "Déethaniseur" },
    description: { en: "Recovers ethane overhead, sends C3+ to depropaniser.", fr: "Récupère l'éthane en tête, envoie C3+ au dépropaniseur." },
    specs: [{ label: "Trays", value: "40" }, { label: "Pressure", value: "28 bar" }],
  },
  {
    id: "x09", x: 88, y: 60, label: "X09", category: "column",
    name: { en: "Depropaniser", fr: "Dépropaniseur" },
    description: { en: "Produces commercial propane overhead.", fr: "Produit du propane commercial en tête." },
    specs: [{ label: "Trays", value: "45" }, { label: "Pressure", value: "18 bar" }],
  },
  {
    id: "x10", x: 76, y: 75, label: "X10", category: "column",
    name: { en: "Debutaniser", fr: "Débutaniseur" },
    description: { en: "Splits butane (top) from natural gasoline (bottom).", fr: "Sépare le butane (tête) de l'essence naturelle (fond)." },
    specs: [{ label: "Trays", value: "38" }, { label: "Pressure", value: "8 bar" }],
  },
];

const EDGES: [string, string][] = [
  ["x01", "x02"], ["x02", "x05"], ["x05", "x04"], ["x04", "x07"],
  ["x07", "x08"], ["x08", "x09"], ["x09", "x10"],
  ["k01", "x05"], ["k02", "x04"],
];

const RADIUS_BY_CAT: Record<Node["category"], number> = {
  absorber: 3.2, exchanger: 3.6, compressor: 3, column: 2.8, drum: 2.6,
};

const CAT_LABEL: Record<Node["category"], { en: string; fr: string; color: string }> = {
  absorber: { en: "Absorber", fr: "Absorbeur", color: "#3b82f6" },
  exchanger: { en: "Heat Exchanger", fr: "Échangeur", color: "#06b6d4" },
  compressor: { en: "Compressor", fr: "Compresseur", color: "#a855f7" },
  column: { en: "Column", fr: "Colonne", color: "#10b981" },
  drum: { en: "Vessel", fr: "Capacité", color: "#eab308" },
};

export default function ProcessFlow() {
  const { lang } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const selected = NODES.find((n) => n.id === selectedId) ?? null;
  const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]));

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest font-mono mb-2" style={{ color: ACCENT }}>
        / {lang === "en" ? "Process Flow" : "Schéma Procédé"}
      </div>
      <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight mb-2">
        {lang === "en" ? "LNG Liquefaction Flow" : "Schéma de Liquéfaction GNL"}
      </h1>
      <p className="text-muted-foreground mb-6 max-w-2xl">
        {lang === "en"
          ? "Interactive AP-C3MR™ process diagram. Tap any equipment node for details."
          : "Schéma interactif AP-C3MR™. Cliquez sur un équipement pour les détails."}
      </p>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(CAT_LABEL).map(([k, v]) => (
          <div key={k} className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-card text-xs font-mono">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: v.color }} />
            {lang === "en" ? v.en : v.fr}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-[hsl(220_25%_8%)] overflow-hidden shadow-card">
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-auto block" style={{ aspectRatio: "16 / 10" }}>
          <defs>
            <pattern id="pf-grid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.1" />
            </pattern>
            <marker id="pf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.45)" />
            </marker>
          </defs>
          <rect width="100" height="100" fill="url(#pf-grid)" />

          {/* Edges */}
          {EDGES.map(([a, b], i) => {
            const na = nodeMap[a]; const nb = nodeMap[b];
            const active = selectedId === a || selectedId === b || hoverId === a || hoverId === b;
            return (
              <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={active ? ACCENT : "rgba(255,255,255,0.25)"}
                strokeWidth={active ? 0.45 : 0.3}
                markerEnd="url(#pf-arrow)"
                style={{ transition: "stroke 200ms" }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((n) => {
            const isSel = selectedId === n.id;
            const isHover = hoverId === n.id;
            const r = RADIUS_BY_CAT[n.category];
            const color = CAT_LABEL[n.category].color;
            return (
              <g key={n.id} style={{ cursor: "pointer" }}
                onClick={() => setSelectedId(n.id)}
                onMouseEnter={() => setHoverId(n.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                {(isSel || isHover) && (
                  <circle cx={n.x} cy={n.y} r={r + 1.8} fill="none" stroke={ACCENT} strokeWidth="0.4" opacity={isSel ? 0.9 : 0.5}>
                    {isSel && <animate attributeName="r" values={`${r + 1.5};${r + 2.5};${r + 1.5}`} dur="2s" repeatCount="indefinite" />}
                  </circle>
                )}
                <circle cx={n.x} cy={n.y} r={r}
                  fill={isSel ? ACCENT : color}
                  stroke={isSel ? ACCENT : "rgba(255,255,255,0.6)"}
                  strokeWidth="0.25"
                  style={{ transition: "fill 200ms" }}
                />
                <text x={n.x} y={n.y + 0.7} textAnchor="middle" fontSize="1.6" fontFamily="monospace" fontWeight="700" fill="white" pointerEvents="none">
                  {n.label}
                </text>
                <text x={n.x} y={n.y + r + 2.2} textAnchor="middle" fontSize="1.5" fill="rgba(255,255,255,0.7)" pointerEvents="none">
                  {(lang === "en" ? n.name.en : n.name.fr).slice(0, 22)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {selected && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: CAT_LABEL[selected.category].color }} />
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    {lang === "en" ? CAT_LABEL[selected.category].en : CAT_LABEL[selected.category].fr} · {selected.label}
                  </span>
                </div>
                <SheetTitle className="text-2xl font-display">
                  {lang === "en" ? selected.name.en : selected.name.fr}
                </SheetTitle>
                <SheetDescription className="text-base text-foreground/80 leading-relaxed pt-2">
                  {lang === "en" ? selected.description.en : selected.description.fr}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-widest font-mono mb-3" style={{ color: ACCENT }}>
                  {lang === "en" ? "Technical Specifications" : "Spécifications Techniques"}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {selected.specs.map((s) => (
                    <div key={s.label} className="border border-border rounded-lg bg-card p-3">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
                      <div className="font-display font-bold text-base mt-1">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Button variant="outline" className="mt-6 w-full" onClick={() => setSelectedId(null)}>
                <X className="h-4 w-4 mr-2" /> {lang === "en" ? "Close" : "Fermer"}
              </Button>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
