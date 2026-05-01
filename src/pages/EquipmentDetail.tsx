import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Fuse from "fuse.js";
import { ArrowLeft, Copy, Check, Download, Wrench, Anchor, Snowflake, Package, Info, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEquipmentByTag, type SparePart } from "@/data";
import {
  predictWrench, predictToolKit, suggestShackle, safetyLoadKg,
  insulationRecommendation, exportToCsv,
} from "@/lib/industrial";
import { useI18n } from "@/contexts/I18nContext";
import NotFound from "./NotFound";

export default function EquipmentDetail() {
  const { tag = "" } = useParams();
  const { t, lang } = useI18n();
  const eq = getEquipmentByTag(decodeURIComponent(tag));

  if (!eq) return <NotFound />;

  const wrench = predictWrench(eq.technical.bolt_size);
  const tools = predictToolKit(eq.technical.bolt_size);
  const shackle = suggestShackle(eq.technical.weight_kg);
  const safety = safetyLoadKg(eq.technical.weight_kg);
  const insulation = insulationRecommendation(eq.type.code, eq.technical.temperature_c);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/equipment"><ArrowLeft className="h-4 w-4 mr-1" /> {t("back")}</Link>
      </Button>

      {/* Header card */}
      <div className="relative overflow-hidden border border-border rounded-lg bg-gradient-industrial p-6 md:p-8 mb-6 text-white">
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-white/60 mb-2">{eq.type.name}</div>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">{eq.tag}</h1>
              <p className="text-white/80 mt-2 max-w-2xl">{eq.name}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-white/10 border border-white/20 text-white font-mono">{eq.unit}</Badge>
              <Badge className="bg-white/10 border border-white/20 text-white font-mono">{eq.section}</Badge>
              <Badge className="bg-accent text-accent-foreground font-mono">{eq.testing_status}</Badge>
            </div>
          </div>
          {eq.notes && <p className="mt-4 text-sm text-white/70 italic">{eq.notes}</p>}
        </div>
      </div>

      <Tabs defaultValue="tech" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto h-auto bg-secondary/60 p-1">
          <TabsTrigger value="tech" className="gap-1.5"><Info className="h-3.5 w-3.5" /> {t("techInfo")}</TabsTrigger>
          <TabsTrigger value="pdr" className="gap-1.5"><Package className="h-3.5 w-3.5" /> {t("pdr")}</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5"><Wrench className="h-3.5 w-3.5" /> {t("toolPredictor")}</TabsTrigger>
          <TabsTrigger value="lifting" className="gap-1.5"><Anchor className="h-3.5 w-3.5" /> {t("lifting")}</TabsTrigger>
          <TabsTrigger value="insulation" className="gap-1.5"><Snowflake className="h-3.5 w-3.5" /> {t("insulation")}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tech */}
        <TabsContent value="tech" className="mt-5">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <Field label={t("serial")} value={eq.technical.serial_no || "—"} mono />
            <Field label="Test Type" value={eq.testing_status} />
            <Field label="Last Date" value={eq.maintenance.last_tested || "—"} />
            <Field label="Next Due" value={eq.maintenance.next_test_due || "—"} />
            <Field label={t("pressure")} value={eq.technical.pressure_bar} mono accent />
            <Field label={t("volume")} value={eq.technical.volume_m3} mono />
            <Field label={t("weight")} value={eq.technical.weight_kg} mono accent />
            <Field label={t("bolt")} value={eq.technical.bolt_size || "—"} mono />
          </div>
        </TabsContent>

        {/* Tab 2: PDR */}
        <TabsContent value="pdr" className="mt-5"><PdrTab parts={eq.spare_parts.items ?? []} tag={eq.tag} /></TabsContent>

        {/* Tab 3: Tools */}
        <TabsContent value="tools" className="mt-5">
          {!eq.technical.bolt_size ? (
            <EmptyState message={t("noBoltData")} />
          ) : (
            <ToolsTab boltSize={eq.technical.bolt_size} wrench={wrench} tools={tools} liftingMethod={eq.maintenance.lifting_method} extraTools={eq.maintenance.tools} />
          )}
        </TabsContent>

        {/* Tab 4: Lifting */}
        <TabsContent value="lifting" className="mt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BigStat label={t("weight")} value={`${eq.technical.weight_kg} kg`} />
            <BigStat label={t("safetyLoad")} value={`${safety} kg`} accent />
            <BigStat label={t("liftingMethod")} value={eq.maintenance.lifting_method.replace(/_/g, " ")} />
          </div>
          <div className="mt-5 border border-border rounded-lg bg-card p-6">
            <div className="flex items-center gap-2 mb-3">
              <Anchor className="h-4 w-4 text-accent" />
              <h3 className="font-display font-semibold">{t("shackle")}</h3>
            </div>
            {shackle ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Size</div>
                  <div className="text-2xl font-display font-bold text-accent">{shackle.size}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">WLL</div>
                  <div className="text-2xl font-display font-bold font-mono">{shackle.wll_t} t</div>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground border-t border-border pt-3">
                  Calculated from {eq.technical.weight_kg} kg × 1.5 safety factor = {(safety / 1000).toFixed(2)} t. Crosby G-209 reference.
                </div>
              </div>
            ) : (
              <EmptyState message="No mass recorded — shackle cannot be sized." />
            )}
          </div>
        </TabsContent>

        {/* Tab 5: Insulation */}
        <TabsContent value="insulation" className="mt-5">
          <div className="border border-border rounded-lg bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Snowflake className="h-4 w-4 text-accent" />
              <h3 className="font-display font-semibold">{t("insulationReq")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <BigStat label="Status" value={insulation.required ? (lang === "en" ? "Required" : "Requis") : (lang === "en" ? "Not required" : "Non requis")} accent={insulation.required} />
              <BigStat label="Thickness" value={insulation.thickness_mm ? `${insulation.thickness_mm} mm` : "—"} />
              <BigStat label="Material" value={insulation.material} />
            </div>
            <div className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
              <span className="font-semibold text-foreground">Rationale: </span>{insulation.rationale}
            </div>
            <div className="mt-2 text-xs text-muted-foreground font-mono">
              Equipment type: {eq.type.code} ({eq.type.name})
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, value, mono, accent }: { label: string; value: string | number; mono?: boolean; accent?: boolean }) {
  return (
    <div className="border border-border rounded-lg bg-card p-4 shadow-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      <div className={`text-lg font-semibold ${mono ? "font-mono" : "font-display"} ${accent ? "text-accent" : "text-foreground"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function BigStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`border rounded-lg p-5 ${accent ? "border-accent/40 bg-accent/5" : "border-border bg-card"}`}>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className={`text-2xl font-display font-bold ${accent ? "text-accent" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-border rounded-lg p-10 text-center text-muted-foreground bg-card/50">
      {message}
    </div>
  );
}

function PdrTab({ parts, tag }: { parts: SparePart[]; tag: string }) {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const fuse = useMemo(() => new Fuse(parts, { threshold: 0.35, keys: ["code", "description", "category", "reference", "material"] }), [parts]);
  const list = q.trim() ? fuse.search(q).map((r) => r.item) : parts;

  if (!parts.length) return <EmptyState message="No spare parts recorded for this equipment." />;

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search")} className="pl-9 h-10" />
        </div>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => exportToCsv(`${tag}_parts.csv`, list.map((p) => ({
            code: p.code, description: p.description, category: p.category ?? "", qty: p.qty_installed,
            location: p.stock_location ?? "", material: p.material ?? "", size: p.size_nominal ?? "",
          })))}
        >
          <Download className="h-4 w-4" /> {t("exportCsv")}
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card shadow-card">
        <div className="hidden md:grid grid-cols-[120px_1fr_140px_60px_100px] bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground px-4 py-3 font-semibold">
          <div>{t("code")}</div><div>{t("description")}</div><div>{t("category")}</div><div className="text-right">{t("qty")}</div><div>{t("location")}</div>
        </div>
        <div className="divide-y divide-border">
          {list.map((p, i) => (
            <div key={`${p.code}-${i}`} className="grid grid-cols-1 md:grid-cols-[120px_1fr_140px_60px_100px] gap-1 md:gap-0 px-4 py-3 text-sm hover:bg-secondary/30">
              <div className="font-mono text-xs text-accent font-semibold">{p.code}</div>
              <div className="text-sm">{p.description}</div>
              <div className="text-xs text-muted-foreground">{p.category || "—"}</div>
              <div className="md:text-right font-mono">{p.qty_installed}</div>
              <div className="text-xs font-mono text-muted-foreground">{p.stock_location || "—"}</div>
            </div>
          ))}
          {list.length === 0 && <div className="px-4 py-10 text-center text-muted-foreground">{t("noResults")}</div>}
        </div>
      </div>
    </div>
  );
}

function ToolsTab({ boltSize, wrench, tools, liftingMethod, extraTools }: { boltSize: string; wrench: string | null; tools: string[]; liftingMethod: string; extraTools: string[] }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const allTools = [...tools, ...extraTools];

  const copy = async () => {
    await navigator.clipboard.writeText(allTools.map((t, i) => `${i + 1}. ${t}`).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BigStat label={t("bolt")} value={boltSize} />
        <BigStat label="Wrench / Clé" value={wrench ?? "—"} accent={!!wrench} />
        <BigStat label={t("liftingMethod")} value={liftingMethod.replace(/_/g, " ")} />
      </div>

      <div className="border border-border rounded-lg bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-accent" />
            <h3 className="font-display font-semibold">{t("recommendedTools")}</h3>
          </div>
          <Button onClick={copy} variant="outline" size="sm" className="gap-2">
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            {copied ? t("copied") : t("copyToolList")}
          </Button>
        </div>
        <ol className="space-y-2">
          {allTools.map((tool, i) => (
            <li key={i} className="flex items-start gap-3 text-sm border-b border-border last:border-0 pb-2 last:pb-0">
              <span className="font-mono text-xs text-accent w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
              <span>{tool}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
