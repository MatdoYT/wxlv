const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CKAN = "https://data.gov.lv/dati/lv/api/action/datastore_search";
const STATIONS_RES = "c32c7afd-0d05-44fd-8b24-1de85b4bf11d";
const METEO_RES = "17460efb-ae99-4d1d-8144-1068f184b05f";

// Parameter abbreviations we want (latest available per station)
const PARAMS = ["HTDRY", "HRLH", "HWNDS", "HPRAB", "HWSMX", "HATMX", "HATMN", "TDRY", "RLH"];

async function ckan(resource_id: string, params: Record<string, string | number>) {
  const qs = new URLSearchParams({ resource_id, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const r = await fetch(`${CKAN}?${qs}`);
  if (!r.ok) throw new Error(`CKAN ${resource_id} ${r.status}`);
  const j = await r.json();
  return j.result.records as any[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Stations metadata
    const stationsRaw = await ckan(STATIONS_RES, { limit: 1000 });

    // 2. For each parameter, fetch latest 500 records (sorted by _id desc -> newest first)
    const paramResults = await Promise.all(
      PARAMS.map((abbr) =>
        ckan(METEO_RES, { limit: 500, filters: JSON.stringify({ ABBREVIATION: abbr }), sort: "_id desc" })
      )
    );

    // Build map: stationId -> { abbr: { value, datetime } }
    const latest: Record<string, Record<string, { value: number; datetime: string }>> = {};
    PARAMS.forEach((abbr, i) => {
      for (const rec of paramResults[i]) {
        const sid = rec.STATION_ID;
        if (!latest[sid]) latest[sid] = {};
        if (!latest[sid][abbr] || rec.DATETIME > latest[sid][abbr].datetime) {
          latest[sid][abbr] = { value: Number(rec.VALUE), datetime: rec.DATETIME };
        }
      }
    });

    const stations = stationsRaw
      .filter((s) => s.GEOGR1 && s.GEOGR2 && new Date(s.END_DATE).getFullYear() > 2020)
      .map((s) => {
        const obs = latest[s.STATION_ID] || {};
        const pick = (...keys: string[]) => {
          for (const k of keys) if (obs[k] != null) return obs[k].value;
          return null;
        };
        const lastTime = Object.values(obs).reduce<string | null>(
          (acc, v) => (!acc || v.datetime > acc ? v.datetime : acc),
          null,
        );
        return {
          id: s.STATION_ID,
          name: `LVGMC-${s.STATION_ID.slice(0, 4)}`,
          location: s.NAME,
          lat: Number(s.GEOGR2),
          lon: Number(s.GEOGR1),
          elevation: Number(s.ELEVATION),
          temperature: pick("HTDRY", "TDRY"),
          humidity: pick("HRLH", "RLH"),
          windSpeed: pick("HWNDS"),
          windGust: pick("HWSMX"),
          rainfall: pick("HPRAB"),
          tempMax: pick("HATMX"),
          tempMin: pick("HATMN"),
          updatedAt: lastTime,
        };
      })
      .filter((s) => s.temperature != null && s.temperature !== 0);

    return new Response(JSON.stringify({ stations, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
