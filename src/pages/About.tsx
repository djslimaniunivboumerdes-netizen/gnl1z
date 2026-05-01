import { useI18n } from "@/contexts/I18nContext";
import { META, EQUIPMENT, SECTIONS } from "@/data";
import { Factory, MapPin, Layers, Activity } from "lucide-react";

export default function About() {
  const { t, lang } = useI18n();

  return (
    <div className="px-4 md:px-10 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-2">/ {t("about")}</div>
      <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight mb-3">{META.project}</h1>
      <p className="text-lg md:text-xl text-muted-foreground font-light leading-relaxed mb-10">
        {lang === "en"
          ? "A natural gas liquefaction complex operated by Sonatrach in Arzew/Bethioua, Algeria, employing the Air Products AP-C3MR™ propane-precooled mixed refrigerant process across six parallel trains."
          : "Un complexe de liquéfaction de gaz naturel exploité par Sonatrach à Arzew/Bethioua, Algérie, utilisant le procédé Air Products AP-C3MR™ à pré-refroidissement propane et réfrigérant mixte sur six trains parallèles."}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        <Stat icon={MapPin} label={lang === "en" ? "Location" : "Emplacement"} value={META.location} />
        <Stat icon={Factory} label={t("process")} value={META.process} />
        <Stat icon={Layers} label={t("trains")} value={META.trains} />
        <Stat icon={Activity} label={t("equipCount")} value={EQUIPMENT.length} />
      </div>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <h2 className="text-2xl font-display font-bold mt-10 mb-4 border-l-4 border-accent pl-4">{t("exec_summary")}</h2>
        <p className="text-foreground/80 leading-relaxed">
          {lang === "en"
            ? "GNL1Z is one of the cornerstone LNG production assets of Sonatrach. The facility integrates feed gas decarbonation, dehydration, mercury removal, and cryogenic liquefaction in a tightly coupled process. This asset management workspace consolidates the equipment master file, spare parts inventory (713 references), DCS instrument mapping, and the operational manual library into one searchable, bilingual interface."
            : "GNL1Z est l'un des actifs de production GNL stratégiques de Sonatrach. L'installation intègre la décarbonatation du gaz d'alimentation, la déshydratation, l'élimination du mercure et la liquéfaction cryogénique dans un procédé étroitement couplé. Cet espace de gestion d'actifs consolide le fichier maître des équipements, l'inventaire des pièces de rechange (713 références), le mapping des instruments DCS et la bibliothèque des manuels opérationnels en une interface unique, recherchable et bilingue."}
        </p>

        <h3 className="text-xl font-display font-semibold mt-8 mb-3">{lang === "en" ? "Process sections covered" : "Sections procédé couvertes"}</h3>
        <div className="flex flex-wrap gap-2 not-prose">
          {SECTIONS.map((s) => (
            <span key={s} className="px-3 py-1.5 rounded border border-border bg-secondary/60 text-sm font-mono">{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="border border-border rounded-lg bg-card p-4">
      <Icon className="h-4 w-4 text-accent mb-2" />
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display font-bold text-lg mt-0.5">{value}</div>
    </div>
  );
}
