import { Link, useParams } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ArrowLeft, AlertTriangle, ShieldAlert, Skull, Clock, MapPin } from "lucide-react";
import { warnings, type WarningLevel } from "@/data/wxlv";
import { cn } from "@/lib/utils";

const meta: Record<WarningLevel, { label: string; cls: string; ring: string; icon: typeof AlertTriangle; color: string }> = {
  warning: { label: "Warning", cls: "border-yellow-500/40 bg-yellow-500/10 text-yellow-200", ring: "ring-yellow-500/40", icon: AlertTriangle, color: "hsl(48 95% 55%)" },
  dangerous: { label: "Dangerous", cls: "border-orange-500/50 bg-orange-500/10 text-orange-200", ring: "ring-orange-500/50", icon: ShieldAlert, color: "hsl(25 90% 55%)" },
  "life-threatening": { label: "Life Threatening", cls: "border-red-500/60 bg-red-500/15 text-red-200", ring: "ring-red-500/60", icon: Skull, color: "hsl(0 85% 60%)" },
};

const WarningDetail = () => {
  const { id } = useParams();
  const w = warnings.find((x) => x.id === id);

  if (!w) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-foreground">
        <p className="text-muted-foreground">Warning not found.</p>
        <Link to="/dashboard-test" className="mt-3 text-sm underline">Back to dashboard</Link>
      </div>
    );
  }

  const m = meta[w.level];
  const Icon = m.icon;
  const issued = new Date(w.issuedAt);

  return (
    <div className="min-h-screen bg-black text-foreground">
      <header className="flex items-center gap-3 border-b border-border/40 px-4 py-3">
        <Link to="/dashboard-test" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className={cn("mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em]", m.cls)}>
          <Icon className="h-3.5 w-3.5" /> {m.label}
        </div>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">{w.title}</h1>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {w.area}</span>
          <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {issued.toLocaleString()}</span>
        </div>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/85">{w.description}</p>

        <div className={cn("mt-8 overflow-hidden rounded-xl border ring-1", m.cls, m.ring)}>
          <div className="h-[420px] w-full">
            <MapContainer
              center={[w.lat, w.lon]}
              zoom={9}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%", background: "hsl(var(--background))" }}
              attributionControl={false}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
              />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
              />
              <CircleMarker
                center={[w.lat, w.lon]}
                radius={32}
                pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 0.18, weight: 1 }}
              />
              <CircleMarker
                center={[w.lat, w.lon]}
                radius={6}
                pathOptions={{ color: m.color, fillColor: m.color, fillOpacity: 1, weight: 2 }}
              />
            </MapContainer>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WarningDetail;
