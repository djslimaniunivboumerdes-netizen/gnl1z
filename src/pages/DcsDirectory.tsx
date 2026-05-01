import { useState } from "react";
import { Cpu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { UNITS } from "@/data";

// Placeholder DCS panel data — replace with real I/O list when available.
const DCS_PANELS = UNITS.flatMap((unit, i) => [
  { panel: `${unit}-PNL-01`, unit, type: "Process Control", io: 64 + (i * 8) % 96, location: `Control Room ${unit}` },
  { panel: `${unit}-PNL-02`, unit, type: "Safety / ESD", io: 32 + (i * 4) % 32, location: `Field Aux Room ${unit}` },
]);

export default function DcsDirectory() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const list = DCS_PANELS.filter((p) =>
    !q.trim() ||
    p.panel.toLowerCase().includes(q.toLowerCase()) ||
    p.unit.toLowerCase().includes(q.toLowerCase()) ||
    p.type.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">/ {t("dcs")}</div>
      <div className="flex items-center gap-3 mb-2">
        <Cpu className="h-7 w-7 text-accent" />
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t("dcs")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        {lang === "en"
          ? "Instrument-to-panel mapping. Placeholder data — connect your real I/O list when available."
          : "Mapping instrument-vers-panneau. Données fictives — connectez votre liste I/O réelle dès que disponible."}
      </p>

      <div className="relative mb-5 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="pl-9 h-11" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {list.map((p) => (
          <div key={p.panel} className="border border-border rounded-lg bg-card p-5 hover:border-accent/50 transition-colors shadow-card">
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-sm font-semibold text-accent">{p.panel}</div>
              <Badge variant="outline" className="font-mono text-[10px]">{p.unit}</Badge>
            </div>
            <div className="font-display font-medium">{p.type}</div>
            <div className="text-xs text-muted-foreground mt-1">{p.location}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-accent">{p.io}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest">I/O</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
