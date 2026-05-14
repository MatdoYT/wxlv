import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, CloudRain, Droplets, Thermometer, Wind, AlertTriangle, Skull, ShieldAlert, ChevronDown } from "lucide-react";
import LatviaMap from "@/components/wxlv/LatviaMap";
import wxlvLogo from "@/assets/wxlv-logo.png";
import { warnings, type Station, type WarningLevel } from "@/data/wxlv";
import { useWxlvStations } from "@/hooks/useWxlvStations";
import { metricGradient } from "@/lib/wxlvGradients";
import { cn } from "@/lib/utils";

type SortKey = "temperature" | "humidity" | "windSpeed" | "rainfall";

const sortMeta: Record<SortKey, { label: string; icon: typeof Thermometer; unit: string }> = {
  temperature: { label: "Temp", icon: Thermometer, unit: "°C" },
  humidity: { label: "Humidity", icon: Droplets, unit: "%" },
  windSpeed: { label: "Wind", icon: Wind, unit: "m/s" },
  rainfall: { label: "Rain", icon: CloudRain, unit: "mm" },
};

const warningStyles: Record<WarningLevel, { label: string; cls: string; icon: typeof AlertTriangle }> = {
  warning: { label: "Warning", cls: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300", icon: AlertTriangle },
  dangerous: { label: "Dangerous", cls: "border-orange-500/50 bg-orange-500/10 text-orange-300", icon: ShieldAlert },
  "life-threatening": { label: "Life Threatening", cls: "border-red-500/60 bg-red-500/15 text-red-300", icon: Skull },
};

const DashboardTest = () => {
  const [sortKey, setSortKey] = useState<SortKey>("rainfall");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Station | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [showLV, setShowLV] = useState(true);
  const [showEE, setShowEE] = useState(false);
  const { stations, loading, error, fetchedAt, pulses } = useWxlvStations();

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const visibleStations = useMemo(
    () => stations.filter((s) => {
      const c = (s as any).country;
      if (c === "EE") {
        if (!showEE) return false;
        // Drop Estonian stations missing humidity or wind data
        if ((s.humidity ?? 0) <= 0 || (s.windSpeed ?? 0) <= 0) return false;
        return true;
      }
      return showLV; // LV or undefined
    }),
    [stations, showLV, showEE]
  );

  const sorted = useMemo(
    () => [...visibleStations].sort((a, b) => {
      const diff = (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
      return sortDir === "desc" ? diff : -diff;
    }),
    [visibleStations, sortKey, sortDir]
  );

  return (
    <div className="flex h-screen w-full flex-col bg-black text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-border/40 px-4 py-2">
        <Link to="/" className="flex items-center gap-3">
          <img src={wxlvLogo} alt="WXLV" className="h-7 w-auto" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Dashboard · Test</span>
        </Link>
        <span className="text-xs text-muted-foreground">
          {loading ? "Loading…" : error ? "Offline" : `${stations.length} stations online`}
          {fetchedAt && !loading && !error && (
            <span className="ml-2 opacity-60">· {new Date(fetchedAt).toLocaleTimeString()}</span>
          )}
        </span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Stations sidebar */}
        <aside className="flex w-[340px] flex-col border-r border-border/40 bg-black/60">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <h2 className="text-sm font-semibold tracking-wide">Stations</h2>
            <div ref={sortRef} className="relative flex items-center gap-1">
              <button
                onClick={() => setSortOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
              >
                <span>{sortMeta[sortKey].label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", sortOpen && "rotate-180")} />
              </button>
              <button
                onClick={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))}
                title={sortDir === "desc" ? "Descending" : "Ascending"}
                className="flex h-[26px] w-[26px] items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
              >
                {sortDir === "desc" ? <ArrowDown className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
              </button>
              {sortOpen && (
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-40 overflow-hidden rounded-md border border-white/10 bg-black/95 shadow-2xl backdrop-blur-md animate-scale-in">
                  {(Object.keys(sortMeta) as SortKey[]).map((k) => {
                    const Icon = sortMeta[k].icon;
                    return (
                      <button
                        key={k}
                        onClick={() => { setSortKey(k); setSortOpen(false); }}
                        className={cn(
                          "flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-white/[0.08]",
                          sortKey === k ? "text-foreground" : "text-muted-foreground"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{sortMeta[k].label}</span>
                        {sortKey === k && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <ul className="wxlv-scroll flex-1 overflow-y-auto">
            {sorted.map((s) => {
              const isActive = selected?.id === s.id;
              const SortIcon = sortMeta[sortKey].icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
                    onMouseEnter={() => setHovered(s.id)}
                    onMouseLeave={() => setHovered((h) => (h === s.id ? null : h))}
                    className={cn(
                      "w-full border-b border-border/20 px-4 py-3 text-left transition-colors hover:bg-white/5",
                      isActive && "bg-white/[0.06]"
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">{s.name}</span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.location}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-emerald-300">
                        <SortIcon className="h-3 w-3" />
                        <span className="font-mono">
                          {s[sortKey].toFixed(1)} {sortMeta[sortKey].unit}
                        </span>
                      </div>
                      <div className="flex gap-3 text-muted-foreground">
                        <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" />{s.temperature.toFixed(1)}°</span>
                        <span className="flex items-center gap-1"><Wind className="h-3 w-3" />{s.windSpeed.toFixed(1)}</span>
                        <span className="flex items-center gap-1"><CloudRain className="h-3 w-3" />{s.rainfall.toFixed(1)}</span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Map + warnings */}
        <main className="flex flex-1 flex-col">
          <div className="relative flex-1">
            <LatviaMap stations={visibleStations} selectedStationId={selected?.id ?? null} hoveredStationId={hovered} onSelectStation={setSelected} pulses={pulses} metric={sortKey} />
            <div className="absolute bottom-4 right-4 z-[400] flex gap-1.5 rounded-lg border border-white/10 bg-black/80 p-1 backdrop-blur-md shadow-2xl">
              <button onClick={() => setShowLV((v) => !v)} className={cn("rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors", showLV ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground")}>Latvia</button>
              <button onClick={() => setShowEE((v) => !v)} className={cn("rounded-md px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors", showEE ? "bg-white/[0.12] text-foreground" : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground")}>Estonia</button>
            </div>
            {selected && (
              <div className="absolute right-4 top-4 z-[400] w-[420px] rounded-xl border border-border/50 bg-black/85 p-5 backdrop-blur-md shadow-2xl animate-scale-in">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xl font-bold tracking-tight">{selected.name}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{selected.location}</div>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-2xl leading-none text-muted-foreground hover:text-foreground">×</button>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {(Object.keys(sortMeta) as SortKey[]).filter((k) => (selected[k] ?? 0) > 0).map((k) => {
                    const Icon = sortMeta[k].icon;
                    const value = selected[k] ?? 0;
                    return (
                      <div
                        key={k}
                        className="rounded-lg border border-white/10 px-3 py-3"
                        style={{ background: metricGradient(k, value) }}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-white/70">
                          <Icon className="h-3.5 w-3.5" />
                          <span>{sortMeta[k].label}</span>
                        </div>
                        <div className="mt-1 font-mono text-2xl font-semibold text-white">
                          {value.toFixed(1)}
                          <span className="ml-1 text-sm font-normal text-white/60">{sortMeta[k].unit}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Warnings */}
          <section className="border-t border-border/40 bg-black/80 p-3">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Active Warnings</h2>
              <span className="text-[10px] text-muted-foreground">{warnings.length} active</span>
            </div>
            {warnings.length === 0 ? (
              <div className="rounded-md border border-border/30 bg-white/[0.02] px-3 py-4 text-center text-xs text-muted-foreground">
                No active warnings.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                {warnings.map((w) => {
                  const meta = warningStyles[w.level];
                  const Icon = meta.icon;
                  return (
                    <Link
                      key={w.id}
                      to={`/dashboard-test/warning/${w.id}`}
                      className={cn(
                        "group flex items-start gap-3 rounded-md border p-3 transition-all hover:scale-[1.01] hover:brightness-125",
                        meta.cls
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-semibold">{w.title}</span>
                          <span className="shrink-0 text-[10px] uppercase tracking-wider opacity-70">{meta.label}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] opacity-70">{w.area}</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardTest;
