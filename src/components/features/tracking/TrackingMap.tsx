import React, { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl, LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_MAP_TILES,
  animateVanMovement,
  createVanMarkerElement,
  createDestinationMarkerElement
} from "@/utils/tracking.utils";
import { TRACKING_REALTIME_CONFIG } from "@/constants/tracking";

interface TrackingMapProps {
  vanCoord: [number, number] | null;
  destCoord: [number, number] | null;
  heading: number | null;
  className?: string;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  vanCoord,
  destCoord,
  heading,
  className = "w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vanMarkerRef = useRef<Marker | null>(null);
  const destMarkerRef = useRef<Marker | null>(null);
  const prevCoordRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = vanCoord || destCoord || TRACKING_REALTIME_CONFIG.DEFAULT_CENTER_FALLBACK;

    const map = new Map({
      container: mapContainerRef.current,
      style: DEFAULT_MAP_TILES,
      center: initialCenter,
      zoom: 14,
      attributionControl: false
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
      vanMarkerRef.current = null;
      destMarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destCoord) {
      if (!destMarkerRef.current) {
        const el = createDestinationMarkerElement();
        destMarkerRef.current = new Marker({ element: el })
          .setLngLat(destCoord)
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat(destCoord);
      }
    }
  }, [destCoord]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !vanCoord) return;

    if (!vanMarkerRef.current) {
      const el = createVanMarkerElement(heading);
      vanMarkerRef.current = new Marker({ element: el })
        .setLngLat(vanCoord)
        .addTo(map);
      prevCoordRef.current = vanCoord;
    } else {
      const el = vanMarkerRef.current.getElement();
      const inner = el.querySelector("div");
      if (inner && heading !== null && !isNaN(heading)) {
        inner.style.transform = `rotate(${heading}deg)`;
      }

      if (prevCoordRef.current) {
        animateVanMovement(
          vanMarkerRef.current,
          prevCoordRef.current,
          vanCoord,
          TRACKING_REALTIME_CONFIG.INTERPOLATION_DURATION_MS
        );
      } else {
        vanMarkerRef.current.setLngLat(vanCoord);
      }
      prevCoordRef.current = vanCoord;
    }
  }, [vanCoord, heading]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (vanCoord && destCoord) {
      const bounds = new LngLatBounds();
      bounds.extend(vanCoord);
      bounds.extend(destCoord);
      map.fitBounds(bounds, {
        padding: { top: 40, bottom: 40, left: 40, right: 40 },
        maxZoom: 16,
        duration: 1000
      });
    } else if (vanCoord) {
      map.easeTo({ center: vanCoord, zoom: 15, duration: 800 });
    }
  }, [vanCoord === null, destCoord === null]);

  return (
    <div className="relative w-full">
      <div ref={mapContainerRef} className={className} />
    </div>
  );
};
