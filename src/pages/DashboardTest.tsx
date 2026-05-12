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
  const [selected, setSelected] = useState<Station | null>(null);
  const { stations, loading, error, fetchedAt, pulses } = useWxlvStations();

  const sorted = useMemo(
    () => [...stations].sort((a, b) => (b[sortKey] ?? 0) - (a[sortKey] ?? 0)),
    [stations, sortKey]
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
            <div className="flex items-center gap-1">
              <ArrowDownUp className="h-3 w-3 text-muted-foreground" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="bg-transparent text-xs text-muted-foreground outline-none"
              >
                {(Object.keys(sortMeta) as SortKey[]).map((k) => (
                  <option key={k} value={k} className="bg-black">
                    Sort: {sortMeta[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ul className="flex-1 overflow-y-auto">
            {sorted.map((s) => {
              const isActive = selected?.id === s.id;
              const SortIcon = sortMeta[sortKey].icon;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setSelected(s)}
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
            <LatviaMap stations={stations} selectedStationId={selected?.id ?? null} onSelectStation={setSelected} pulses={pulses} metric={sortKey} />
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
                  {(Object.keys(sortMeta) as SortKey[]).map((k) => {
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
