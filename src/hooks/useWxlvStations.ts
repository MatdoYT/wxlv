import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Station } from "@/data/wxlv";

interface ApiStation extends Station {
  elevation?: number;
  windGust?: number | null;
  tempMax?: number | null;
  tempMin?: number | null;
  updatedAt?: string | null;
}

export function useWxlvStations() {
  const [stations, setStations] = useState<ApiStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("wxlv-data");
        if (error) throw error;
        if (cancelled) return;
        const normalized: ApiStation[] = (data.stations as ApiStation[]).map((s) => ({
          ...s,
          temperature: s.temperature ?? 0,
          humidity: s.humidity ?? 0,
          windSpeed: s.windSpeed ?? 0,
          rainfall: s.rainfall ?? 0,
        }));
        setStations(normalized);
        setFetchedAt(data.fetchedAt);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return { stations, loading, error, fetchedAt };
}
