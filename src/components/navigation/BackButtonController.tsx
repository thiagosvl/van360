import { App } from "@capacitor/app";
import { Capacitor, PluginListenerHandle } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useBiometricLock } from "@/hooks/business/useBiometricLock";

const BackButtonController = () => {
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  const { isLocked } = useBiometricLock();
  const isLockedRef = useRef(isLocked);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    
    let handler: PluginListenerHandle | null = null;

    const setupListener = async () => {
      handler = await App.addListener("backButton", () => {
        if (isLockedRef.current) {
          App.exitApp();
          return;
        }

        const currentPath = locationRef.current; 
        const homeRoutes = ["/inicio", "/"];
        
        if (homeRoutes.includes(currentPath) && window.history.length > 1) {
          App.exitApp();
        } else if (window.history.length > 1) {
          window.history.back();
        } else {
          App.exitApp();
        }
      });
    };

    void setupListener();

    return () => {
      handler?.remove();
    };
  }, []);

  return null;
};

export default BackButtonController;
