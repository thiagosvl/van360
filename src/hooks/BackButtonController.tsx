import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

const BackButtonController = () => {
  const location = useLocation();
  const locationRef = useRef(location.pathname);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);


  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    
    let handler: any;

    const setupListener = async () => {
      handler = await App.addListener("backButton", () => {
        
        const currentPath = locationRef.current; 
        const homeRoutes = ['/inicio', '/'];
        
        if (homeRoutes.includes(currentPath) && window.history.length > 1) {
            console.log(`[BACK] Home e Histórico BUGADO (${window.history.length}). Forçando o fechamento.`);
            App.exitApp();
        } 
        
        else if (window.history.length > 1) {
            console.log(`[BACK] Voltando de: ${currentPath}. Histórico: ${window.history.length}`);
            window.history.back();
        }
        
        else {
            console.log(`[BACK] Histórico Vazio ou 1. Fechando o app em: ${currentPath}`);
            App.exitApp();
        }
      });
    };

    setupListener();

    return () => {
        if (handler) {
             handler.then(h => h.remove()); 
        }
    };
    
  }, []);

  return null;
};

export default BackButtonController;