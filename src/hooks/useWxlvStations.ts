import { useEffect, useRef, useState } from "react";
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
  const [pulses, setPulses] = useState<Record<string, number>>({});
  const lastUpdatedRef = useRef<Record<string, string>>({});
  const firstLoadRef = useRef(true);

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

        // Detect new updates (skip first load to avoid pulsing everything)
        if (!firstLoadRef.current) {
          const newPulses: Record<string, number> = {};
          for (const s of normalized) {
            const prev = lastUpdatedRef.current[s.id];
            if (s.updatedAt && prev && s.updatedAt !== prev) {
              newPulses[s.id] = Date.now();
            }
          }
          if (Object.keys(newPulses).length) {
            setPulses((p) => ({ ...p, ...newPulses }));
            // Clear after animation
            setTimeout(() => {
              setPulses((p) => {
                const next = { ...p };
                for (const id of Object.keys(newPulses)) delete next[id];
                return next;
              });
            }, 2500);
          }
        }
        for (const s of normalized) {
          if (s.updatedAt) lastUpdatedRef.current[s.id] = s.updatedAt;
        }
        firstLoadRef.current = false;

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

  return { stations, loading, error, fetchedAt, pulses };
}
