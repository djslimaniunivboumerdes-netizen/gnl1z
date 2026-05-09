import { useState, useCallback, useEffect, useRef } from "react";
import {
  RefreshCw, TrendingUp, TrendingDown, Minus, Newspaper,
  ExternalLink, Flame, BarChart3, Globe, Zap, Clock,
  AlertCircle, Activity, DollarSign, Signal, Radio,
  ChevronRight, Star, Bookmark,
} from "lucide-react";
import { Button }  from "@/components/ui/button";
import { Badge }   from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/contexts/I18nContext";
import { cn }      from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatItem  { label: string; value: string; unit?: string; trend?: "up"|"down"|"flat" }
interface PriceItem { label: string; value: string; unit: string; trend?: "up"|"down"|"flat"; note?: string; change?: string }
interface NewsItem  {
  title: string; title_fr?: string;
  summary: string; summary_fr?: string;
  date: string; source: string; url?: string; category: string;
}
interface NewsData {
  lng_prices:        PriceItem[];
  lng_stats:         StatItem[];
  lng_news:          NewsItem[];
  sonatrach_prices:  PriceItem[];
  sonatrach_stats:   StatItem[];
  sonatrach_news:    NewsItem[];
  fetched_at:        string;
}

// ─── Category config ──────────────────────────────────────────────────────────

const CAT: Record<string, { color: string; dot: string; label: string; labelFr: string }> = {
  price:       { color: "bg-amber-500/15 text-amber-400 border-amber-500/40",    dot: "bg-amber-400",   label: "Price",       labelFr: "Prix"        },
  market:      { color: "bg-sky-500/15 text-sky-400 border-sky-500/40",          dot: "bg-sky-400",     label: "Market",      labelFr: "Marché"      },
  policy:      { color: "bg-violet-500/15 text-violet-400 border-violet-500/40", dot: "bg-violet-400",  label: "Policy",      labelFr: "Politique"   },
  supply:      { color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/40",dot:"bg-emerald-400", label: "Supply",      labelFr: "Appro."      },
  contract:    { color: "bg-orange-500/15 text-orange-400 border-orange-500/40", dot: "bg-orange-400",  label: "Contract",    labelFr: "Contrat"     },
  production:  { color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/40",       dot: "bg-cyan-400",    label: "Production",  labelFr: "Production"  },
  investment:  { color: "bg-green-500/15 text-green-400 border-green-500/40",    dot: "bg-green-400",   label: "Investment",  labelFr: "Invest."     },
  partnership: { color: "bg-pink-500/15 text-pink-400 border-pink-500/40",       dot: "bg-pink-400",    label: "Partnership", labelFr: "Partenariat" },
  default:     { color: "bg-accent/15 text-accent border-accent/40",             dot: "bg-accent",      label: "News",        labelFr: "Actualité"   },
};

// ─── Trend icon ───────────────────────────────────────────────────────────────

function TrendIcon({ trend, size = 4 }: { trend?: "up"|"down"|"flat"; size?: number }) {
  const s = `h-${size} w-${size}`;
  if (trend === "up")   return <TrendingUp   className={cn(s, "text-emerald-400")} />;
  if (trend === "down") return <TrendingDown className={cn(s, "text-rose-400")}    />;
  return <Minus className={cn(s, "text-muted-foreground/40")} />;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-muted/40 rounded", className)} />;
}

// ─── Live ticker strip ────────────────────────────────────────────────────────

function TickerStrip({ lng_prices, sonatrach_prices }: { lng_prices: PriceItem[]; sonatrach_prices: PriceItem[] }) {
  const all = [...lng_prices, ...sonatrach_prices];
  if (!all.length) return null;
  const items = [...all, ...all];
  return (
    <div className="overflow-hidden border-y border-border/50 bg-secondary/20 py-2 mb-6 relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      <div className="flex gap-8 whitespace-nowrap" style={{ animation: "ticker 45s linear infinite" }}>
        {items.map((p, i) => {
          const isUp = p.trend === "up"; const isDown = p.trend === "down";
          return (
            <span key={i} className="inline-flex items-center gap-2 text-xs">
              <span className="font-mono font-semibold text-muted-foreground uppercase tracking-wider">{p.label}</span>
              <span className={cn("font-mono font-bold", isUp && "text-emerald-400", isDown && "text-rose-400", !isUp && !isDown && "text-foreground")}>
                {p.value} <span className="font-normal opacity-60">{p.unit}</span>
              </span>
              {p.change && <span className={cn("text-[10px] font-mono", isUp && "text-emerald-400/70", isDown && "text-rose-400/70")}>{p.change}</span>}
              <TrendIcon trend={p.trend} size={3} />
              <span className="text-border/60 ml-2">·</span>
            </span>
          );
        })}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

// ─── Price card ───────────────────────────────────────────────────────────────

function PriceCard({ p }: { p: PriceItem }) {
  const isUp = p.trend === "up"; const isDown = p.trend === "down";
  return (
    <div className={cn("relative overflow-hidden border rounded-xl p-4 flex flex-col gap-2 bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/10",
      isUp && "border-emerald-500/30 hover:border-emerald-500/50",
      isDown && "border-rose-500/30 hover:border-rose-500/50",
      !isUp && !isDown && "border-border hover:border-accent/30")}>
      <div className={cn("absolute inset-x-0 top-0 h-0.5",
        isUp && "bg-gradient-to-r from-emerald-400 to-transparent",
        isDown && "bg-gradient-to-r from-rose-400 to-transparent",
        !isUp && !isDown && "bg-gradient-to-r from-accent/50 to-transparent")} />
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{p.label}</span>
        <TrendIcon trend={p.trend} size={3} />
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-mono font-bold leading-none">{p.value}</span>
        <span className="text-xs text-muted-foreground pb-0.5">{p.unit}</span>
      </div>
      <div className="flex items-center gap-2 min-h-[16px] flex-wrap">
        {p.change && (
          <span className={cn("text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded",
            isUp && "bg-emerald-400/10 text-emerald-400",
            isDown && "bg-rose-400/10 text-rose-400",
            !isUp && !isDown && "bg-secondary text-muted-foreground")}>{p.change}</span>
        )}
        {p.note && <span className="text-[10px] text-muted-foreground/60">{p.note}</span>}
      </div>
    </div>
  );
}

// ─── Stats panel ──────────────────────────────────────────────────────────────

function StatsPanel({ stats, lang }: { stats: StatItem[]; lang: string }) {
  if (!stats.length) return null;
  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/30">
        <Activity className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
          {lang === "en" ? "Key Statistics" : "Statistiques Clés"}
        </span>
      </div>
      <div className="px-4 divide-y divide-border">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5">
            <TrendIcon trend={s.trend} size={3} />
            <span className="text-xs text-muted-foreground flex-1 truncate">{s.label}</span>
            <span className="font-mono font-bold text-sm">{s.value}</span>
            {s.unit && <span className="text-[10px] text-muted-foreground w-16 truncate text-right">{s.unit}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Featured article ─────────────────────────────────────────────────────────

function FeaturedCard({ item, lang }: { item: NewsItem; lang: string }) {
  const cat     = CAT[item.category] ?? CAT.default;
  const title   = lang === "fr" && item.title_fr   ? item.title_fr   : item.title;
  const summary = lang === "fr" && item.summary_fr ? item.summary_fr : item.summary;
  return (
    <article className="group relative border border-border rounded-xl bg-card overflow-hidden hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 hover:-translate-y-0.5">
      <div className="h-1 w-full bg-gradient-to-r from-accent via-accent/50 to-transparent" />
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Star className="h-3.5 w-3.5 text-accent" />
          <span className="text-[10px] font-mono font-bold text-accent uppercase tracking-wider">
            {lang === "en" ? "Featured" : "À la Une"}
          </span>
          <span className="text-border/60">·</span>
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider border font-bold px-2 py-0", cat.color)}>
            {lang === "fr" ? cat.labelFr : cat.label}
          </Badge>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono flex items-center gap-1">
            <Clock className="h-3 w-3" />{item.date}
          </span>
        </div>
        <h2 className="font-display font-bold text-lg md:text-xl leading-tight mb-3 group-hover:text-accent transition-colors">{title}</h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{summary}</p>
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground font-semibold">{item.source}</span>
          {item.url && item.url !== "#" ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-medium">
              {lang === "en" ? "Read full article" : "Lire l'article"} <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : <Bookmark className="h-4 w-4 text-muted-foreground/30" />}
        </div>
      </div>
    </article>
  );
}

// ─── Standard news card ───────────────────────────────────────────────────────

function NewsCard({ item, index, lang }: { item: NewsItem; index: number; lang: string }) {
  const cat     = CAT[item.category] ?? CAT.default;
  const title   = lang === "fr" && item.title_fr   ? item.title_fr   : item.title;
  const summary = lang === "fr" && item.summary_fr ? item.summary_fr : item.summary;
  return (
    <article className="group relative border border-border rounded-xl bg-card overflow-hidden hover:border-accent/30 hover:shadow-md hover:shadow-black/5 transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <div className="h-0.5 w-full bg-gradient-to-r from-accent/30 via-accent/10 to-transparent" />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
          <span className="font-mono text-[10px] font-bold text-muted-foreground/30 w-5 shrink-0">{String(index + 1).padStart(2, "0")}</span>
          <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", cat.dot)} />
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider border font-bold px-1.5 py-0", cat.color)}>
            {lang === "fr" ? cat.labelFr : cat.label}
          </Badge>
          <span className="ml-auto text-[10px] text-muted-foreground font-mono">{item.date}</span>
        </div>
        <h3 className="font-display font-semibold text-sm leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2 flex-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{summary}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border mt-auto">
          <span className="text-[10px] text-muted-foreground">{item.source}</span>
          {item.url && item.url !== "#"
            ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline"><ExternalLink className="h-3 w-3" />{lang === "en" ? "Read" : "Lire"}</a>
            : <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
        </div>
      </div>
    </article>
  );
}

// ─── News section ─────────────────────────────────────────────────────────────

function NewsSection({ prices, stats, news, lang, icon }: {
  prices: PriceItem[]; stats: StatItem[]; news: NewsItem[]; lang: string; icon: React.ReactNode;
}) {
  const [featured, ...rest] = news;
  return (
    <div className="space-y-6">
      {prices.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            <DollarSign className="h-3.5 w-3.5 text-accent" />
            {lang === "en" ? "Live Prices" : "Prix en Direct"}
            <span className="ml-auto text-accent font-mono">{prices.length} indicators</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {prices.map((p, i) => <PriceCard key={i} p={p} />)}
          </div>
        </div>
      )}
      {stats.length > 0 && <StatsPanel stats={stats} lang={lang} />}
      {news.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-4 text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
            {icon}
            {lang === "en" ? "Top 10 Headlines" : "Top 10 Actualités"}
            <span className="ml-auto font-mono text-accent">{news.length} articles</span>
          </div>
          <div className="space-y-4">
            {featured && <FeaturedCard item={featured} lang={lang} />}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rest.map((item, i) => <NewsCard key={i} item={item} index={i + 1} lang={lang} />)}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
          {lang === "en" ? "No articles found." : "Aucun article trouvé."}
        </div>
      )}
    </div>
  );
}

// ─── Loading view ─────────────────────────────────────────────────────────────

const STEPS = {
  en: ["Initiating live web search…","Fetching LNG spot prices — JKM · TTF · NBP · Henry Hub…","Scanning global LNG statistics…","Searching LNG market headlines — Reuters · Argus · Platts…","Pulling Sonatrach news and contracts…","Retrieving Brent & Saharan Blend prices…","Compiling Algeria LNG export data…","Translating and formatting bilingual results…"],
  fr: ["Lancement de la recherche web en direct…","Récupération des prix GNL spot — JKM · TTF · NBP · Henry Hub…","Analyse des statistiques mondiales GNL…","Recherche actualités marché GNL — Reuters · Argus · Platts…","Collecte des actualités Sonatrach et contrats…","Prix Brent & Saharan Blend en cours…","Compilation des données d'export GNL Algérie…","Traduction et mise en forme des résultats bilingues…"],
};

function LoadingView({ lang }: { lang: string }) {
  const steps = STEPS[lang as keyof typeof STEPS] ?? STEPS.en;
  const [step, setStep] = useState(0);
  useEffect(() => { const id = setInterval(() => setStep((s) => Math.min(s + 1, steps.length - 1)), 3500); return () => clearInterval(id); }, [steps.length]);
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-xl bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Signal className="h-5 w-5 text-accent animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent animate-ping" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium mb-2 text-foreground truncate">{steps[step]}</div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-[3500ms] ease-linear" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground shrink-0">{step + 1}/{steps.length}</span>
        </div>
        <div className="flex gap-1.5">{steps.map((_, i) => <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-500", i <= step ? "bg-accent" : "bg-secondary")} />)}</div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-52 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
    </div>
  );
}

// ─── Error view ───────────────────────────────────────────────────────────────

function ErrorView({ message, onRetry, lang }: { message: string; onRetry: () => void; lang: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5 text-center border border-dashed border-destructive/30 rounded-xl">
      <AlertCircle className="h-10 w-10 text-destructive/60" />
      <div>
        <p className="font-semibold text-sm">{lang === "en" ? "Failed to fetch data" : "Échec de récupération"}</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm font-mono break-all">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />{lang === "en" ? "Try again" : "Réessayer"}
      </Button>
    </div>
  );
}

// ─── Countdown to auto-refresh ────────────────────────────────────────────────

function Countdown({ target, lang }: { target: number; lang: string }) {
  const [rem, setRem] = useState(0);
  useEffect(() => { const tick = () => setRem(Math.max(0, Math.round((target - Date.now()) / 1000))); tick(); const id = setInterval(tick, 1000); return () => clearInterval(id); }, [target]);
  const m = Math.floor(rem / 60); const s = rem % 60;
  return <span className="text-[10px] text-white/30 font-mono">{lang === "en" ? "auto-refresh in" : "refresh dans"} {m}:{String(s).padStart(2, "0")}</span>;
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(): string {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const yr = now.getFullYear();
  return `You are a real-time energy-market intelligence assistant for the GNL1Z LNG plant (Sonatrach, Arzew, Algeria).
Today: ${dateStr}. Use real current data from web search — never hallucinate prices or headlines.

SEARCH QUERIES TO RUN IN ORDER:
1. "LNG spot price JKM TTF NBP Henry Hub ${yr}"
2. "LNG market news ${dateStr}"
3. "global LNG trade statistics ${yr}"
4. "Sonatrach news ${dateStr}"
5. "Sonatrach LNG export contract ${yr}"
6. "Brent crude oil price today"
7. "Saharan Blend crude Algeria ${yr}"
8. "Algeria LNG export statistics ${yr}"

Return ONLY a valid JSON object — no markdown, no preamble.

{
  "lng_prices": [
    { "label": "JKM Spot",  "value": "XX.XX", "unit": "$/MMBtu", "trend": "up|down|flat", "change": "+X.XX (+X%)", "note": "Asia Pacific benchmark" },
    { "label": "TTF Gas",   "value": "XX.XX", "unit": "EUR/MWh", "trend": "up|down|flat", "change": "...", "note": "European hub" },
    { "label": "NBP",       "value": "XXX",   "unit": "p/therm", "trend": "up|down|flat", "change": "...", "note": "UK benchmark" },
    { "label": "Henry Hub", "value": "X.XX",  "unit": "$/MMBtu", "trend": "up|down|flat", "change": "...", "note": "US reference" }
  ],
  "lng_stats": [
    { "label": "Global LNG trade",      "value": "XXX", "unit": "MT/yr",    "trend": "up|down|flat" },
    { "label": "Liquefaction capacity", "value": "XXX", "unit": "MTPA",     "trend": "up|down|flat" },
    { "label": "Active FID projects",   "value": "XX",  "unit": "projects", "trend": "up|down|flat" },
    { "label": "Top LNG exporter",      "value": "...", "unit": "" },
    { "label": "Top LNG importer",      "value": "...", "unit": "" },
    { "label": "Spot cargo share",      "value": "XX",  "unit": "% of trade", "trend": "up|down|flat" }
  ],
  "lng_news": [
    { "title": "...", "title_fr": "...", "summary": "2-3 sentences EN with figures.", "summary_fr": "2-3 phrases FR avec chiffres.", "date": "DD Mon ${yr}", "source": "Reuters|Bloomberg|Argus|Platts|S&P Global|LNG World News", "url": "https://... or #", "category": "price|market|policy|supply|contract" }
  ],
  "sonatrach_prices": [
    { "label": "Brent",              "value": "XXX.XX", "unit": "$/bbl",   "trend": "up|down|flat", "change": "...", "note": "ICE front-month" },
    { "label": "Saharan Blend",      "value": "XXX.XX", "unit": "$/bbl",   "trend": "up|down|flat", "change": "...", "note": "Algeria crude" },
    { "label": "Algeria LNG export", "value": "XX.XX",  "unit": "$/MMBtu", "trend": "up|down|flat", "change": "...", "note": "avg est." },
    { "label": "DZD / USD",          "value": "XXX.X",  "unit": "DZD",     "trend": "up|down|flat", "change": "...", "note": "FX rate" }
  ],
  "sonatrach_stats": [
    { "label": "LNG exports",              "value": "XX.X", "unit": "MTPA",    "trend": "up|down|flat" },
    { "label": "Hydrocarbon revenues",     "value": "XX",   "unit": "USD bn",  "trend": "up|down|flat" },
    { "label": "Gas production",           "value": "XXX",  "unit": "Bcm/yr",  "trend": "up|down|flat" },
    { "label": "LNG trains (Arzew+Skikda)","value": "XX",   "unit": "trains" },
    { "label": "Pipeline gas exports",     "value": "XX",   "unit": "Bcm/yr",  "trend": "up|down|flat" },
    { "label": "Algeria world LNG rank",   "value": "...",  "unit": "" }
  ],
  "sonatrach_news": [
    { "title": "...", "title_fr": "...", "summary": "...", "summary_fr": "...", "date": "DD Mon ${yr}", "source": "...", "url": "https://... or #", "category": "contract|production|investment|partnership|policy|market" }
  ],
  "fetched_at": "${now.toISOString()}"
}

RULES:
1. lng_news MUST contain EXACTLY 10 items.
2. sonatrach_news MUST contain EXACTLY 10 items.
3. Use real articles found by web search. Never invent headlines.
4. title_fr and summary_fr are MANDATORY for every item.
5. If a price cannot be found, write "N/A".
6. Return ONLY the JSON object.`;
}

// ─── Multi-turn API fetch ─────────────────────────────────────────────────────

const API_URL   = "https://api.anthropic.com/v1/messages";
const MAX_TURNS = 8;

async function fetchWithSearch(signal: AbortSignal): Promise<NewsData> {
  type Block   = { type: string; id?: string; text?: string };
  type Msg     = { role: "user"|"assistant"; content: Block[]|string };

  const messages: Msg[] = [{
    role: "user",
    content: "Search the web now and return the JSON as specified in your instructions. Run all 8 search queries. Return ONLY valid JSON — no markdown fences.",
  }];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await fetch(API_URL, {
      method:  "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model:      "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system:     buildPrompt(),
        tools:      [{ type: "web_search_20250305", name: "web_search" }],
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${body.slice(0, 300)}`);
    }

    const raw     = await res.json();
    const content: Block[] = raw.content ?? [];
    const stop: string     = raw.stop_reason ?? "end_turn";

    if (stop === "end_turn" || stop === "max_tokens") {
      const text  = content.filter((b) => b.type === "text").map((b) => b.text ?? "").join("\n");
      const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
      const s     = clean.indexOf("{"); const e = clean.lastIndexOf("}");
      if (s === -1 || e === -1 || s > e) throw new Error("No JSON in response. Preview: " + clean.slice(0, 300));
      const parsed: NewsData = JSON.parse(clean.slice(s, e + 1));
      for (const k of ["lng_news","sonatrach_news","lng_prices","sonatrach_prices","lng_stats","sonatrach_stats"] as const) {
        if (!Array.isArray(parsed[k])) parsed[k] = [] as never;
      }
      return parsed;
    }

    if (stop === "tool_use") {
      messages.push({ role: "assistant", content });
      const results = content.filter((b) => b.type === "tool_use" && b.id).map((b) => ({
        type: "tool_result" as const, tool_use_id: b.id!, content: "Search executed.",
      }));
      if (!results.length) break;
      messages.push({ role: "user", content: results as unknown as Block[] });
      continue;
    }
    break;
  }
  throw new Error("Max conversation turns reached without a complete JSON response.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const AUTO_REFRESH_MS = 30 * 60 * 1000;

export default function News() {
  const { lang } = useI18n();
  const [data,    setData]    = useState<NewsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [tab,     setTab]     = useState("lng");
  const [nextAt,  setNextAt]  = useState<number>(0);
  const abortRef = useRef<AbortController | null>(null);

  const fetchNews = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    setLoading(true); setError(null);
    try {
      const result = await fetchWithSearch(ctrl.signal);
      setData(result); setNextAt(Date.now() + AUTO_REFRESH_MS);
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(e instanceof Error ? e.message : String(e));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNews(); return () => { abortRef.current?.abort(); }; }, [fetchNews]);

  useEffect(() => {
    if (!nextAt) return;
    const ms = nextAt - Date.now(); if (ms <= 0) return;
    const id = setTimeout(fetchNews, ms); return () => clearTimeout(id);
  }, [nextAt, fetchNews]);

  const fetchedAt = data?.fetched_at
    ? new Date(data.fetched_at).toLocaleString(lang === "fr" ? "fr-DZ" : "en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-7xl mx-auto">

      {/* Hero */}
      <div className="relative overflow-hidden border border-border rounded-xl bg-gradient-industrial p-6 md:p-8 mb-4 text-white">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 stripe-warning" />
        <div className="relative flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-white/50 mb-2 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /><Radio className="h-3 w-3" />
              {lang === "en" ? "Live Intelligence Feed" : "Fil d'Intelligence en Direct"}
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight flex items-center gap-3">
              <Newspaper className="h-7 w-7 text-accent shrink-0" />
              {lang === "en" ? "LNG & Sonatrach Intelligence" : "Intelligence GNL & Sonatrach"}
            </h1>
            <p className="text-white/60 mt-2 text-sm max-w-xl leading-relaxed">
              {lang === "en"
                ? "AI-powered live feed — top 10 LNG market headlines, spot prices, key statistics, and Sonatrach updates retrieved in real time via web search."
                : "Fil IA en direct — top 10 actualités marché GNL, prix spot, statistiques clés et mises à jour Sonatrach récupérés en temps réel par recherche web."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <Button onClick={fetchNews} disabled={loading} size="lg"
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-lg">
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              {loading ? (lang === "en" ? "Fetching…" : "Récupération…") : (lang === "en" ? "Refresh" : "Actualiser")}
            </Button>
            {fetchedAt && (
              <span className="text-[10px] text-white/40 font-mono flex items-center gap-1.5">
                <Clock className="h-3 w-3" />{lang === "en" ? "Updated" : "Mis à jour"}: {fetchedAt}
              </span>
            )}
            {!loading && nextAt > 0 && <Countdown target={nextAt} lang={lang} />}
          </div>
        </div>
      </div>

      {/* Live ticker */}
      {data && !loading && (data.lng_prices.length > 0 || data.sonatrach_prices.length > 0) && (
        <TickerStrip lng_prices={data.lng_prices} sonatrach_prices={data.sonatrach_prices} />
      )}

      {/* Empty */}
      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center py-24 gap-6 border border-dashed border-border rounded-xl text-center">
          <div className="relative"><Globe className="h-14 w-14 text-muted-foreground/20" /><Zap className="h-5 w-5 text-accent absolute -bottom-1 -right-1" /></div>
          <div>
            <p className="font-display font-semibold text-base">{lang === "en" ? "Ready to fetch" : "Prêt à récupérer"}</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">{lang === "en" ? "Click Refresh to pull current LNG prices and Sonatrach news." : "Cliquez sur Actualiser pour récupérer les prix GNL et l'actualité Sonatrach."}</p>
          </div>
          <Button onClick={fetchNews} size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90 font-bold">
            <RefreshCw className="h-4 w-4" />{lang === "en" ? "Fetch now" : "Récupérer maintenant"}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && !loading && <ErrorView message={error} onRetry={fetchNews} lang={lang} />}

      {/* Tabs */}
      {(data || loading) && (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start bg-secondary/60 p-1 h-auto mb-5">
            <TabsTrigger value="lng" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              {lang === "en" ? "LNG Market" : "Marché GNL"}
              {data && <Badge className="bg-accent/20 text-accent text-[10px] px-1.5 py-0 ml-1">{data.lng_news.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="sonatrach" className="gap-2">
              <Flame className="h-4 w-4" />
              Sonatrach
              {data && <Badge className="bg-accent/20 text-accent text-[10px] px-1.5 py-0 ml-1">{data.sonatrach_news.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lng">
            {loading ? <LoadingView lang={lang} /> : data
              ? <NewsSection prices={data.lng_prices} stats={data.lng_stats} news={data.lng_news} lang={lang} icon={<BarChart3 className="h-3.5 w-3.5 text-accent" />} />
              : null}
          </TabsContent>
          <TabsContent value="sonatrach">
            {loading ? <LoadingView lang={lang} /> : data
              ? <NewsSection prices={data.sonatrach_prices} stats={data.sonatrach_stats} news={data.sonatrach_news} lang={lang} icon={<Flame className="h-3.5 w-3.5 text-accent" />} />
              : null}
          </TabsContent>
        </Tabs>
      )}

      {/* Disclaimer */}
      {data && !loading && (
        <p className="mt-10 text-[10px] text-muted-foreground text-center max-w-2xl mx-auto leading-relaxed border-t border-border pt-5">
          {lang === "en"
            ? "Data retrieved via AI web search (Claude Sonnet · Anthropic). Prices are indicative only — for trading or official purposes always verify with Reuters, Argus, Platts S&P Global, or official Sonatrach publications. Auto-refreshes every 30 minutes."
            : "Données récupérées par recherche web IA (Claude Sonnet · Anthropic). Les prix sont indicatifs — pour usage commercial ou officiel, toujours vérifier avec Reuters, Argus, Platts S&P Global ou les publications officielles Sonatrach. Actualisation automatique toutes les 30 minutes."}
        </p>
      )}
    </div>
  );
}
