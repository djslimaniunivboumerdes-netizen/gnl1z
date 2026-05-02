import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Cpu, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/contexts/I18nContext";
import { getDcsPanel, driveImageUrl, driveViewUrl } from "@/data/dcs_panels";
import { getEquipmentByTag } from "@/data";
import NotFound from "./NotFound";

export default function DcsDetail() {
  const { id = "" } = useParams();
  const { t, lang } = useI18n();
  const panel = getDcsPanel(id);
  if (!panel) return <NotFound />;

  const related = (panel.related_tags ?? [])
    .map((tag) => getEquipmentByTag(tag))
    .filter((e): e is NonNullable<typeof e> => !!e);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/dcs"><ArrowLeft className="h-4 w-4 mr-1" /> {t("back")}</Link>
      </Button>

      <div className="relative overflow-hidden border border-border rounded-lg bg-gradient-industrial p-6 md:p-8 mb-6 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-white/60 font-mono uppercase tracking-widest mb-2">
            <Cpu className="h-3.5 w-3.5" /> {t("panelDetail")}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            {lang === "en" ? panel.title_en : panel.title_fr}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className="bg-white/10 border border-white/20 text-white font-mono">{panel.section}</Badge>
            {panel.unit && <Badge className="bg-white/10 border border-white/20 text-white font-mono">{panel.unit}</Badge>}
          </div>
          {(panel.description_en || panel.description_fr) && (
            <p className="mt-4 text-sm text-white/80 max-w-3xl">
              {lang === "en" ? panel.description_en : panel.description_fr}
            </p>
          )}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card mb-6 shadow-card">
        <div className="bg-secondary/60 px-4 py-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-muted-foreground font-mono">DCS Screen</span>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <a href={driveViewUrl(panel.drive_id)} target="_blank" rel="noopener noreferrer">
              {t("openInDrive")} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
        <div className="bg-black">
          <img
            src={driveImageUrl(panel.drive_id)}
            alt={lang === "en" ? panel.title_en : panel.title_fr}
            className="w-full h-auto"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card p-5">
        <h2 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          {t("related")}
        </h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {lang === "en" ? "No equipment linked yet to this panel." : "Aucun équipement lié à ce panneau."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((eq) => (
              <Link
                key={eq.tag}
                to={`/equipment/${encodeURIComponent(eq.tag)}`}
                className="group flex items-center justify-between border border-border rounded p-3 hover:border-accent/50 hover:bg-secondary/30 transition-all"
              >
                <div>
                  <div className="font-mono text-xs text-accent font-semibold">{eq.tag}</div>
                  <div className="text-sm font-medium line-clamp-1">{eq.name}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
