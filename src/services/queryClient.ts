import { QueryClient, focusManager } from "@tanstack/react-query";
import { App as CapacitorApp } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 15,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 1,
      refetchOnMount: true,
    },
  },
});

if (Capacitor.isNativePlatform()) {
  CapacitorApp.addListener("appStateChange", ({ isActive }) => {
    focusManager.setFocused(isActive);
  });
}
