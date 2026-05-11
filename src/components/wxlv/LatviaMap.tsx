import { Fragment, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { warnings, type Station } from "@/data/wxlv";

// Fix default icon paths (not used here but prevents warnings)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const pulseIcon = L.divIcon({
  className: "wxlv-pulse-icon",
  html: `<span class="wxlv-pulse-ring"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface Props {
  stations: Station[];
  selectedStationId?: string | null;
  onSelectStation?: (s: Station) => void;
  pulses?: Record<string, number>;
}

const LatviaMap = ({ stations, selectedStationId, onSelectStation, pulses = {} }: Props) => {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  return (
    <MapContainer
      center={[56.879, 24.6032]}
      zoom={7}
      scrollWheelZoom
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

      {stations.map((s) => {
        const active = s.id === selectedStationId;
        const pulsing = pulses[s.id] != null;
        return (
          <div key={s.id}>
            {pulsing && (
              <Marker
                key={`pulse-${s.id}-${pulses[s.id]}`}
                position={[s.lat, s.lon]}
                icon={pulseIcon}
                interactive={false}
              />
            )}
            <CircleMarker
              center={[s.lat, s.lon]}
              radius={active ? 9 : 6}
              pathOptions={{
                color: active ? "hsl(160 70% 60%)" : "hsl(0 0% 90%)",
                fillColor: active ? "hsl(160 70% 50%)" : "hsl(0 0% 80%)",
                fillOpacity: 0.85,
                weight: 2,
              }}
              eventHandlers={{ click: () => onSelectStation?.(s) }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={1}>
                <span className="text-xs font-medium">{s.name} · {s.location}</span>
              </Tooltip>
            </CircleMarker>
          </div>
        );
      })}

      {warnings.map((w) => (
        <CircleMarker
          key={w.id}
          center={[w.lat, w.lon]}
          radius={14}
          pathOptions={{
            color:
              w.level === "life-threatening"
                ? "hsl(0 85% 60%)"
                : w.level === "dangerous"
                ? "hsl(25 90% 55%)"
                : "hsl(48 95% 55%)",
            fillOpacity: 0.15,
            weight: 1.5,
          }}
        />
      ))}
    </MapContainer>
  );
};

export default LatviaMap;
