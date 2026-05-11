// Subtle gradient backgrounds based on metric values.
// Returns inline style with linear-gradient.

const grad = (from: string, to: string) =>
  `linear-gradient(135deg, ${from}, ${to})`;

// Clamp helper
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

// Interpolate between two HSL hues, returns hsl string
const lerpHsl = (h1: number, s1: number, l1: number, h2: number, s2: number, l2: number, t: number) => {
  const h = h1 + (h2 - h1) * t;
  const s = s1 + (s2 - s1) * t;
  const l = l1 + (l2 - l1) * t;
  return `hsl(${h.toFixed(0)} ${s.toFixed(0)}% ${l.toFixed(0)}%)`;
};

export function tempGradient(temp: number): string {
  // -25 (bright blue) -> 0 (cyan/teal) -> 20 (warm) -> 40 (dark red)
  const t = clamp((temp + 25) / 65, 0, 1);
  // hue: 210 (blue) -> 0 (red); lightness 55 -> 28
  const base = lerpHsl(210, 80, 50, 0, 75, 30, t);
  const accent = lerpHsl(220, 70, 35, 0, 80, 18, t);
  return grad(`${base.replace("hsl", "hsla").replace(")", " / 0.22)")}`, `${accent.replace("hsl", "hsla").replace(")", " / 0.10)")}`);
}

export function humidityGradient(h: number): string {
  // 0 gray -> 50 yellow -> 100 dark green
  const t = clamp(h / 100, 0, 1);
  let base: string, accent: string;
  if (t < 0.5) {
    const k = t / 0.5;
    base = lerpHsl(0, 0, 55, 50, 80, 55, k); // gray -> yellow
    accent = lerpHsl(0, 0, 30, 50, 70, 35, k);
  } else {
    const k = (t - 0.5) / 0.5;
    base = lerpHsl(50, 80, 55, 145, 70, 32, k); // yellow -> dark green
    accent = lerpHsl(50, 70, 35, 145, 75, 18, k);
  }
  return grad(
    base.replace("hsl", "hsla").replace(")", " / 0.22)"),
    accent.replace("hsl", "hsla").replace(")", " / 0.10)"),
  );
}

export function windGradient(w: number): string {
  // 0 chill green -> 15 yellow -> 25+ red
  const t = clamp(w / 25, 0, 1);
  let base: string, accent: string;
  if (w < 15) {
    const k = w / 15;
    base = lerpHsl(140, 65, 50, 50, 85, 55, k);
    accent = lerpHsl(140, 60, 30, 50, 70, 35, k);
  } else {
    const k = clamp((w - 15) / 10, 0, 1);
    base = lerpHsl(50, 85, 55, 0, 80, 50, k);
    accent = lerpHsl(50, 70, 35, 0, 75, 28, k);
  }
  return grad(
    base.replace("hsl", "hsla").replace(")", " / 0.22)"),
    accent.replace("hsl", "hsla").replace(")", " / 0.10)"),
  );
}

export function rainGradient(r: number): string {
  // 0 light slate -> 20mm deep blue
  const t = clamp(r / 20, 0, 1);
  const base = lerpHsl(210, 20, 55, 215, 80, 40, t);
  const accent = lerpHsl(210, 25, 30, 220, 85, 22, t);
  return grad(
    base.replace("hsl", "hsla").replace(")", " / 0.22)"),
    accent.replace("hsl", "hsla").replace(")", " / 0.10)"),
  );
}

export function metricGradient(key: "temperature" | "humidity" | "windSpeed" | "rainfall", value: number): string {
  switch (key) {
    case "temperature": return tempGradient(value);
    case "humidity": return humidityGradient(value);
    case "windSpeed": return windGradient(value);
    case "rainfall": return rainGradient(value);
  }
}
