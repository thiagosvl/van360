import React, { useEffect, useRef } from "react";
import { Map, Marker, NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  DEFAULT_MAP_TILES,
  animateVanMovement,
  createVanMarkerElement,
  updateVanMarkerHeading
} from "@/utils/tracking.utils";
import { TRACKING_REALTIME_CONFIG } from "@/constants/tracking";

interface TrackingMapProps {
  vanCoord: [number, number] | null;
  heading: number | null;
  className?: string;
}

export const TrackingMap: React.FC<TrackingMapProps> = ({
  vanCoord,
  heading,
  className = "w-full h-64 rounded-2xl overflow-hidden shadow-inner border border-slate-200"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const vanMarkerRef = useRef<Marker | null>(null);
  const prevCoordRef = useRef<[number, number] | null>(null);
  const initialCenterRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter = vanCoord || TRACKING_REALTIME_CONFIG.DEFAULT_CENTER_FALLBACK;

    const map = new Map({
      container: mapContainerRef.current,
      style: DEFAULT_MAP_TILES,
      center: initialCenter,
      zoom: 15,
      attributionControl: false
    });

    map.scrollZoom.setWheelZoomRate(1 / 75);
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
    };
  }, []);

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
      if (prevCoordRef.current) {
        animateVanMovement(
          vanMarkerRef.current,
          prevCoordRef.current,
          vanCoord,
          400
        );
      } else {
        vanMarkerRef.current.setLngLat(vanCoord);
      }
      updateVanMarkerHeading(vanMarkerRef.current, heading);
      prevCoordRef.current = vanCoord;
    }

    if (!initialCenterRef.current) {
      map.easeTo({ center: vanCoord, zoom: 15, duration: 800 });
      initialCenterRef.current = true;
    }
  }, [vanCoord, heading]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl">
      <div ref={mapContainerRef} className={className} />
    </div>
  );
};
