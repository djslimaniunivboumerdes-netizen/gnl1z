import { BookOpen, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";

const MANUALS = [
  { id: "S01", titleEn: "General Plant Description", titleFr: "Description générale de l'usine", category: "General" },
  { id: "S02", titleEn: "Feed Gas System", titleFr: "Système de gaz d'alimentation", category: "Process" },
  { id: "S03", titleEn: "Decarbonation (MEA)", titleFr: "Décarbonatation (MEA)", category: "Process" },
  { id: "S04", titleEn: "Dehydration & Mercury Removal", titleFr: "Déshydratation & Élimination Hg", category: "Process" },
  { id: "S05", titleEn: "Liquefaction (AP-C3MR™)", titleFr: "Liquéfaction (AP-C3MR™)", category: "Process" },
  { id: "S06", titleEn: "Propane Refrigeration", titleFr: "Réfrigération propane", category: "Refrigeration" },
  { id: "S07", titleEn: "MR Refrigeration", titleFr: "Réfrigération MR", category: "Refrigeration" },
  { id: "S08", titleEn: "Fractionation", titleFr: "Fractionnement", category: "Process" },
  { id: "S09", titleEn: "LNG Storage & Loading", titleFr: "Stockage & chargement GNL", category: "Storage" },
  { id: "S10", titleEn: "Utilities — Steam & Power", titleFr: "Utilités — Vapeur & Énergie", category: "Utilities" },
  { id: "S11", titleEn: "Utilities — Cooling Water", titleFr: "Utilités — Eau de refroidissement", category: "Utilities" },
  { id: "S12", titleEn: "Instrument Air & Nitrogen", titleFr: "Air instrument & Azote", category: "Utilities" },
  { id: "S13", titleEn: "Flare & Vent Systems", titleFr: "Systèmes torche & évent", category: "Safety" },
  { id: "S14", titleEn: "Fire & Gas Detection", titleFr: "Détection feu & gaz", category: "Safety" },
  { id: "S15", titleEn: "Emergency Shutdown (ESD)", titleFr: "Arrêt d'urgence (ESD)", category: "Safety" },
  { id: "OP-01", titleEn: "Startup Procedures", titleFr: "Procédures de démarrage", category: "Operations" },
  { id: "OP-02", titleEn: "Normal Shutdown", titleFr: "Arrêt normal", category: "Operations" },
  { id: "OP-03", titleEn: "Emergency Operations", titleFr: "Opérations d'urgence", category: "Operations" },
  { id: "MN-01", titleEn: "Equipment Maintenance Schedule", titleFr: "Planning maintenance équipements", category: "Maintenance" },
  { id: "MN-02", titleEn: "Spare Parts Catalogue", titleFr: "Catalogue pièces de rechange", category: "Maintenance" },
  { id: "HSE-01", titleEn: "HSE Manual", titleFr: "Manuel HSE", category: "Safety" },
  { id: "HSE-02", titleEn: "Permit-to-Work", titleFr: "Permis de travail", category: "Safety" },
  { id: "QA-01", titleEn: "Quality Control & Testing", titleFr: "Contrôle qualité & essais", category: "Quality" },
];

const categoryColors: Record<string, string> = {
  Process: "border-accent/40 text-accent",
  Refrigeration: "border-primary/40 text-primary",
  Storage: "border-success/40 text-success",
  Utilities: "border-muted-foreground/30 text-muted-foreground",
  Safety: "border-destructive/40 text-destructive",
  Operations: "border-accent/40 text-accent",
  Maintenance: "border-warning/40 text-warning-foreground",
  Quality: "border-primary/40 text-primary",
  General: "border-muted-foreground/30 text-muted-foreground",
};

export default function Manuals() {
  const { t, lang } = useI18n();
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">/ {t("manuals")}</div>
      <div className="flex items-center gap-3 mb-2">
        <BookOpen className="h-7 w-7 text-accent" />
        <h1 className="text-3xl md:text-4xl font-display font-bold">{t("manuals")}</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">{MANUALS.length} {lang === "en" ? "documents" : "documents"} · S01 → HSE</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MANUALS.map((m) => (
          <button
            key={m.id}
            className="text-left group border border-border rounded-lg bg-card p-5 hover:border-accent/50 hover:shadow-card transition-all"
            onClick={() => alert(`${m.id} — ${lang === "en" ? "PDF link not yet wired."  : "Lien PDF non encore relié."}`)}
          >
            <div className="flex items-start justify-between mb-3">
              <FileText className="h-5 w-5 text-accent" />
              <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="font-mono text-xs font-bold text-accent mb-1">{m.id}</div>
            <div className="font-display font-semibold leading-tight mb-3">
              {lang === "en" ? m.titleEn : m.titleFr}
            </div>
            <Badge variant="outline" className={`font-mono text-[10px] ${categoryColors[m.category]}`}>{m.category}</Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
