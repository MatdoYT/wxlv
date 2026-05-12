import { Fragment, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { warnings, type Station } from "@/data/wxlv";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;

const pulseIcon = L.divIcon({
  className: "wxlv-pulse-icon",
  html: `<span class="wxlv-pulse-ring"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const radioPulseIcon = L.divIcon({
  className: "wxlv-pulse-icon",
  html: `<span class="wxlv-radio-ring"></span><span class="wxlv-radio-ring wxlv-radio-ring--delay"></span>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export type MapMetric = "temperature" | "humidity" | "windSpeed" | "rainfall";

const formatMetric = (m: MapMetric, v: number): string => {
  if (v == null || isNaN(v)) return "—";
  switch (m) {
    case "temperature": return `${Math.round(v)}°`;
    case "humidity": return `${Math.round(v)}%`;
    case "windSpeed": return `${Math.round(v)}m/s`;
    case "rainfall": return `${v.toFixed(1)}mm`;
  }
};

interface Props {
  stations: Station[];
  selectedStationId?: string | null;
  hoveredStationId?: string | null;
  onSelectStation?: (s: Station) => void;
  pulses?: Record<string, number>;
  metric?: MapMetric;
}

const LatviaMap = ({ stations, selectedStationId, hoveredStationId, onSelectStation, pulses = {}, metric = "temperature" }: Props) => {
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, []);

  const stationIcons = useMemo(() => {
    const map: Record<string, L.DivIcon> = {};
    for (const s of stations) {
      const active = s.id === selectedStationId;
      const value = (s as any)[metric] as number;
      const label = formatMetric(metric, value);
      const html = `
        <div class="wxlv-marker ${active ? "wxlv-marker--active" : ""}">
          <span class="wxlv-marker__value">${label}</span>
          <span class="wxlv-marker__name">${s.name}</span>
        </div>`;
      map[s.id] = L.divIcon({
        className: "wxlv-marker-icon",
        html,
        iconSize: [64, 30],
        iconAnchor: [32, 15],
      });
    }
    return map;
  }, [stations, selectedStationId, metric]);

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
        const pulsing = pulses[s.id] != null;
        return (
          <Fragment key={s.id}>
            {pulsing && (
              <Marker
                key={`pulse-${s.id}-${pulses[s.id]}`}
                position={[s.lat, s.lon]}
                icon={pulseIcon}
                interactive={false}
              />
            )}
            <Marker
              position={[s.lat, s.lon]}
              icon={stationIcons[s.id]}
              eventHandlers={{ click: () => onSelectStation?.(s) }}
            />
          </Fragment>
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
