import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Fuse from "fuse.js";
import { Cpu, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { DCS_PANELS, DCS_SECTIONS, driveImageUrl } from "@/data/dcs_panels";

export default function DcsDirectory() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState("");
  const [section, setSection] = useState<string>("all");

  const fuse = useMemo(() => new Fuse(DCS_PANELS, {
    threshold: 0.35,
    keys: ["title_en", "title_fr", "section", "unit", "related_tags"],
  }), []);

  const list = useMemo(() => {
    let l = q.trim() ? fuse.search(q).map((r) => r.item) : DCS_PANELS;
    if (section !== "all") l = l.filter((p) => p.section === section);
    return l;
  }, [q, section, fuse]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">/ {t("dcs")}</div>
      <div className="flex items-center gap-3 mb-2">
        <Cpu className="h-7 w-7 text-accent" />
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t("dcs")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
        {lang === "en"
          ? `${DCS_PANELS.length} DCS screen captures from the Sonatrach GNL1Z control room. Click any panel for details.`
          : `${DCS_PANELS.length} captures DCS de la salle de contrôle GNL1Z Sonatrach. Cliquez sur un panneau pour les détails.`}
      </p>

      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="pl-9 h-11" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSection("all")}
            className={`px-3 h-11 rounded border text-xs font-mono uppercase tracking-wider transition-colors ${
              section === "all" ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border hover:border-accent/50"
            }`}
          >
            {lang === "en" ? "All" : "Tout"}
          </button>
          {DCS_SECTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-3 h-11 rounded border text-xs font-mono uppercase tracking-wider transition-colors ${
                section === s ? "bg-accent text-accent-foreground border-accent" : "bg-card border-border hover:border-accent/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <Link
            key={p.id}
            to={`/dcs/${p.id}`}
            className="group relative overflow-hidden border border-border rounded-lg bg-card hover:border-accent/50 hover:shadow-industrial transition-all"
          >
            <div className="aspect-video bg-secondary/40 overflow-hidden border-b border-border">
              <img
                src={driveImageUrl(p.drive_id)}
                alt={lang === "en" ? p.title_en : p.title_fr}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="outline" className="font-mono text-[10px]">{p.section}</Badge>
                {p.unit && <span className="font-mono text-[10px] text-muted-foreground">{p.unit}</span>}
              </div>
              <div className="flex items-start justify-between gap-2">
                <div className="font-display font-semibold leading-tight">
                  {lang === "en" ? p.title_en : p.title_fr}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
              </div>
            </div>
          </Link>
        ))}
        {list.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">{t("noResults")}</div>
        )}
      </div>
    </div>
  );
}
