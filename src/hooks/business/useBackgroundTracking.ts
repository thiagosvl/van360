import { useEffect, useRef } from "react";
import { Capacitor, registerPlugin, PluginListenerHandle } from "@capacitor/core";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import { TrackingGpsPing } from "@/types/tracking";
import { TRACKING_REALTIME_CONFIG, ENABLE_LIVE_TRACKING } from "@/constants/tracking";

const BackgroundGeolocation = registerPlugin<BackgroundGeolocationPlugin>("BackgroundGeolocation");

interface UseBackgroundTrackingProps {
  execucaoId: string | null;
  active: boolean;
  onLocationUpdate?: (ping: TrackingGpsPing) => void;
}

export function useBackgroundTracking({
  execucaoId,
  active,
  onLocationUpdate
}: UseBackgroundTrackingProps) {
  const watcherIdRef = useRef<string | null>(null);
  const onLocationUpdateRef = useRef(onLocationUpdate);

  useEffect(() => {
    onLocationUpdateRef.current = onLocationUpdate;
  }, [onLocationUpdate]);

  useEffect(() => {
    if (!ENABLE_LIVE_TRACKING || !active || !execucaoId) {
      if (watcherIdRef.current && Capacitor.isNativePlatform()) {
        const idToRemove = watcherIdRef.current;
        watcherIdRef.current = null;
        BackgroundGeolocation.removeWatcher({ id: idToRemove }).catch(() => {});
      }
      return;
    }

    if (typeof window !== "undefined") {
      (window as unknown as { __VAN360_DISPATCH_MOCK_GPS_PING__?: (ping: TrackingGpsPing) => void }).__VAN360_DISPATCH_MOCK_GPS_PING__ = (ping: TrackingGpsPing) => {
        onLocationUpdateRef.current?.(ping);
      };
    }

    if (!Capacitor.isNativePlatform()) {
      if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
        return;
      }

      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (typeof window !== "undefined" && (window as unknown as { __VAN360_DEV_SIMULATING__?: boolean }).__VAN360_DEV_SIMULATING__) {
            return;
          }
          const ping: TrackingGpsPing = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            heading: typeof pos.coords.heading === "number" && !isNaN(pos.coords.heading) ? pos.coords.heading : null,
            speed: typeof pos.coords.speed === "number" && !isNaN(pos.coords.speed) ? pos.coords.speed : null,
            accuracy: typeof pos.coords.accuracy === "number" && !isNaN(pos.coords.accuracy) ? pos.coords.accuracy : null,
            timestamp: pos.timestamp || Date.now()
          };
          onLocationUpdateRef.current?.(ping);
        },
        () => {},
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        if (typeof window !== "undefined") {
          delete (window as unknown as { __VAN360_DISPATCH_MOCK_GPS_PING__?: (ping: TrackingGpsPing) => void }).__VAN360_DISPATCH_MOCK_GPS_PING__;
        }
      };
    }

    let isMounted = true;

    async function startWatcher() {
      try {
        const watcherId = await BackgroundGeolocation.addWatcher(
          {
            backgroundTitle: "Van360: Rota em andamento 🚐",
            backgroundMessage: "Transmitindo localização aos responsáveis em tempo real",
            requestPermissions: true,
            stale: false,
            distanceFilter: TRACKING_REALTIME_CONFIG.MIN_DISTANCE_FILTER_METERS
          },
          (location, error) => {
            if (error) {
              return;
            }

            if (!location) return;

            if (location.accuracy && location.accuracy > TRACKING_REALTIME_CONFIG.MAX_GPS_ACCURACY_METERS) {
              return;
            }

            const ping: TrackingGpsPing = {
              latitude: location.latitude,
              longitude: location.longitude,
              heading: typeof location.bearing === "number" && !isNaN(location.bearing) ? location.bearing : null,
              speed: typeof location.speed === "number" && !isNaN(location.speed) ? location.speed : null,
              accuracy: typeof location.accuracy === "number" && !isNaN(location.accuracy) ? location.accuracy : null,
              timestamp: location.time || Date.now()
            };

            onLocationUpdateRef.current?.(ping);
          }
        );

        if (isMounted) {
          watcherIdRef.current = watcherId;
        } else {
          BackgroundGeolocation.removeWatcher({ id: watcherId }).catch(() => {});
        }
      } catch {}
    }

    startWatcher();

    let appStateHandle: PluginListenerHandle | null = null;
    if (Capacitor.isNativePlatform()) {
      import("@capacitor/app").then(({ App }) => {
        App.addListener("appStateChange", (state) => {
          if (state.isActive && !watcherIdRef.current && isMounted) {
            startWatcher();
          }
        }).then((handle) => {
          appStateHandle = handle;
        });
      });
    }

    return () => {
      isMounted = false;
      appStateHandle?.remove();
      if (watcherIdRef.current) {
        const idToRemove = watcherIdRef.current;
        watcherIdRef.current = null;
        BackgroundGeolocation.removeWatcher({ id: idToRemove }).catch(() => {});
      }
    };
  }, [active, execucaoId]);
}
