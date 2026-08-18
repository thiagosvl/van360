import type { Marker } from "maplibre-gl";

export const DEFAULT_MAP_TILES = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: [
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors"
    }
  },
  layers: [
    {
      id: "osm-tiles",
      type: "raster" as const,
      source: "osm",
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function lerp(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function animateVanMovement(
  marker: Marker,
  startCoord: [number, number],
  targetCoord: [number, number],
  durationMs: number = 3000
) {
  const startTime = performance.now();

  function frame(currentTime: number) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);

    const currentLng = lerp(startCoord[0], targetCoord[0], progress);
    const currentLat = lerp(startCoord[1], targetCoord[1], progress);

    marker.setLngLat([currentLng, currentLat]);

    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

export function createVanMarkerElement(heading: number | null): HTMLElement {
  const container = document.createElement("div");
  container.className = "van360-van-marker flex items-center justify-center";
  container.style.width = "42px";
  container.style.height = "42px";
  container.style.cursor = "pointer";

  const inner = document.createElement("div");
  inner.className = "w-10 h-10 rounded-full bg-[#1a3a5c] border-2 border-white shadow-lg flex items-center justify-center text-white";
  inner.style.transition = "transform 0.4s ease-out";
  inner.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
      <circle cx="7" cy="17" r="2"/>
      <path d="M9 17h6"/>
      <circle cx="17" cy="17" r="2"/>
    </svg>
  `;

  if (heading !== null && !isNaN(heading)) {
    inner.style.transform = `rotate(${heading}deg)`;
  }

  container.appendChild(inner);
  return container;
}

export function createDestinationMarkerElement(): HTMLElement {
  const el = document.createElement("div");
  el.className = "w-8 h-8 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center text-white animate-bounce";
  el.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  `;
  return el;
}
