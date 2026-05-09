// Lovable AI-powered LNG & Sonatrach news feed
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const yr = now.getFullYear();

  const system = `You are a real-time energy-market intelligence assistant for the GNL1Z LNG plant (Sonatrach, Arzew, Algeria). Today: ${dateStr}.
Return ONLY a valid JSON object matching the schema below. Use your most recent knowledge of LNG markets and Sonatrach. If a price is uncertain, give the most recent known approximate value and set trend to "flat". Provide EXACTLY 10 lng_news items and EXACTLY 10 sonatrach_news items. Every news item MUST have title, title_fr, summary, summary_fr, date (DD Mon ${yr}), source, url (or "#"), category.

Schema:
{
  "lng_prices":[{"label":"JKM Spot","value":"","unit":"$/MMBtu","trend":"up|down|flat","change":"","note":""}, {"label":"TTF Gas","value":"","unit":"EUR/MWh",...}, {"label":"NBP","value":"","unit":"p/therm",...}, {"label":"Henry Hub","value":"","unit":"$/MMBtu",...}],
  "lng_stats":[{"label":"Global LNG trade","value":"","unit":"MT/yr","trend":"up|down|flat"}, {"label":"Liquefaction capacity","value":"","unit":"MTPA","trend":"..."}, {"label":"Top LNG exporter","value":"","unit":""}, {"label":"Top LNG importer","value":"","unit":""}, {"label":"Spot cargo share","value":"","unit":"% of trade"}],
  "lng_news":[{"title":"","title_fr":"","summary":"","summary_fr":"","date":"DD Mon ${yr}","source":"","url":"","category":"price|market|policy|supply|contract"}],
  "sonatrach_prices":[{"label":"Brent","value":"","unit":"$/bbl",...},{"label":"Saharan Blend","value":"","unit":"$/bbl",...},{"label":"Algeria LNG export","value":"","unit":"$/MMBtu",...},{"label":"DZD / USD","value":"","unit":"DZD",...}],
  "sonatrach_stats":[{"label":"LNG exports","value":"","unit":"MTPA"},{"label":"Hydrocarbon revenues","value":"","unit":"USD bn"},{"label":"Gas production","value":"","unit":"Bcm/yr"},{"label":"LNG trains (Arzew+Skikda)","value":"","unit":"trains"},{"label":"Pipeline gas exports","value":"","unit":"Bcm/yr"},{"label":"Algeria world LNG rank","value":"","unit":""}],
  "sonatrach_news":[{"title":"","title_fr":"","summary":"","summary_fr":"","date":"DD Mon ${yr}","source":"","url":"","category":"contract|production|investment|partnership|policy|market"}],
  "fetched_at":"${now.toISOString()}"
}`;

  try {
    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: "Generate the JSON now. Return ONLY JSON, no markdown fences." },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!r.ok) {
      const t = await r.text();
      return new Response(JSON.stringify({ error: `AI gateway ${r.status}: ${t.slice(0, 400)}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const j = await r.json();
    const text: string = j?.choices?.[0]?.message?.content ?? "";
    const clean = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
    const s = clean.indexOf("{"); const e = clean.lastIndexOf("}");
    if (s < 0 || e < 0) {
      return new Response(JSON.stringify({ error: "No JSON in AI response", preview: clean.slice(0, 300) }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const data = JSON.parse(clean.slice(s, e + 1));
    for (const k of ["lng_news","sonatrach_news","lng_prices","sonatrach_prices","lng_stats","sonatrach_stats"]) {
      if (!Array.isArray(data[k])) data[k] = [];
    }
    data.fetched_at = data.fetched_at ?? now.toISOString();

    return new Response(JSON.stringify(data), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
