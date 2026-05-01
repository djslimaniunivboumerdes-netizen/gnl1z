import { Mail, Linkedin, ExternalLink, Award, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { useState } from "react";

const AUTHOR = {
  name: "Slimani Djamel",
  email: "dj.slimani.univ.boumerdes@gmail.com",
  orcid: "0009-0006-9893-2800",
  linkedin: "slimani-djamel-3b15a4212",
};

export default function Author() {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(AUTHOR.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="px-4 md:px-8 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="text-[10px] uppercase tracking-widest text-accent font-mono mb-1">/ {t("author")}</div>

      <div className="relative overflow-hidden border border-border rounded-lg bg-gradient-industrial p-8 md:p-10 text-white mb-8">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/20 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning" />
        <div className="relative flex items-start gap-6 flex-wrap">
          <div className="h-24 w-24 rounded-full bg-gradient-accent grid place-items-center font-display font-bold text-3xl text-accent-foreground shadow-accent">
            SD
          </div>
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{AUTHOR.name}</h1>
            <p className="text-white/70 mt-2">
              {lang === "en"
                ? "Author & maintainer — GNL1Z Asset Management workspace."
                : "Auteur & mainteneur — espace de gestion d'actifs GNL1Z."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ContactCard icon={Mail} label="Email" value={AUTHOR.email} mono action={
          <Button size="sm" variant="ghost" onClick={copy} className="gap-1.5">
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? t("copied") : t("copy")}
          </Button>
        } href={`mailto:${AUTHOR.email}`} />

        <ContactCard icon={Award} label="ORCID" value={AUTHOR.orcid} mono href={`https://orcid.org/${AUTHOR.orcid}`} />

        <ContactCard icon={Linkedin} label="LinkedIn" value={AUTHOR.linkedin} mono href={`https://linkedin.com/in/${AUTHOR.linkedin}`} />
      </div>
    </div>
  );
}

function ContactCard({ icon: Icon, label, value, mono, href, action }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; mono?: boolean; href?: string; action?: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg bg-card p-5 hover:border-accent/40 transition-colors">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-accent" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className={`text-sm hover:text-accent break-all ${mono ? "font-mono" : ""}`}>
            {value}
          </a>
        ) : (
          <span className={`text-sm break-all ${mono ? "font-mono" : ""}`}>{value}</span>
        )}
        {action ?? <ExternalLink className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}
