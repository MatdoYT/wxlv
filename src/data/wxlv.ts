export type Station = {
  id: string;
  name: string;
  location: string;
  lat: number;
  lon: number;
  temperature: number; // °C
  humidity: number; // %
  windSpeed: number; // m/s
  rainfall: number; // mm (last 24h)
};

export type WarningLevel = "warning" | "dangerous" | "life-threatening";

export type Warning = {
  id: string;
  title: string;
  level: WarningLevel;
  description: string;
  issuedAt: string; // ISO
  lat: number;
  lon: number;
  area: string;
};

export const stations: Station[] = [
  { id: "rix", name: "WXLV-RIX", location: "Rīga", lat: 56.9496, lon: 24.1052, temperature: 4.2, humidity: 82, windSpeed: 6.4, rainfall: 3.1 },
  { id: "lpx", name: "WXLV-LPX", location: "Liepāja", lat: 56.5108, lon: 21.0132, temperature: 5.8, humidity: 88, windSpeed: 11.2, rainfall: 8.4 },
  { id: "vnt", name: "WXLV-VNT", location: "Ventspils", lat: 57.3894, lon: 21.5606, temperature: 5.1, humidity: 86, windSpeed: 9.7, rainfall: 5.2 },
  { id: "dgp", name: "WXLV-DGP", location: "Daugavpils", lat: 55.8714, lon: 26.5161, temperature: 2.1, humidity: 78, windSpeed: 3.2, rainfall: 0.4 },
  { id: "rzk", name: "WXLV-RZK", location: "Rēzekne", lat: 56.5089, lon: 27.3322, temperature: 1.8, humidity: 80, windSpeed: 4.1, rainfall: 0.9 },
  { id: "vlk", name: "WXLV-VLK", location: "Valka", lat: 57.7747, lon: 26.0167, temperature: 3.0, humidity: 75, windSpeed: 5.0, rainfall: 1.2 },
  { id: "jkb", name: "WXLV-JKB", location: "Jēkabpils", lat: 56.4949, lon: 25.8615, temperature: 3.4, humidity: 79, windSpeed: 4.6, rainfall: 1.8 },
  { id: "smt", name: "WXLV-SMT", location: "Smiltene", lat: 57.4242, lon: 25.9069, temperature: 2.7, humidity: 81, windSpeed: 5.5, rainfall: 2.3 },
];

export const warnings: Warning[] = [
  {
    id: "w-001",
    title: "Strong coastal winds",
    level: "warning",
    description: "Sustained winds of 11+ m/s observed along the Kurzeme coast. Loose objects may be displaced.",
    issuedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lat: 56.5108,
    lon: 21.0132,
    area: "Liepāja region",
  },
  {
    id: "w-002",
    title: "Heavy rainfall accumulation",
    level: "dangerous",
    description: "Over 8mm of rain in the last 24 hours with continued precipitation expected. Risk of localized flooding.",
    issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lat: 57.3894,
    lon: 21.5606,
    area: "Ventspils region",
  },
  {
    id: "w-003",
    title: "Severe storm system inbound",
    level: "life-threatening",
    description: "Atmospheric models indicate a severe storm system approaching from the Baltic. Wind gusts may exceed 25 m/s. Seek shelter and avoid travel.",
    issuedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    lat: 56.9496,
    lon: 24.1052,
    area: "Rīga & surrounding areas",
  },
];
