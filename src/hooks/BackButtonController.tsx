import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const BackButtonController = () => {
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let handler: any;

    const setupListener = async () => {
      // ⭐️ IMPORTANTE: Usamos App.addListener() sem dependências complexas
      handler = await App.addListener("backButton", () => {
        
        // 1. Verifica se há algum histórico para onde voltar
        //    (Length > 1 geralmente significa que há uma página ANTES da atual)
        if (window.history.length > 1) {
          
          console.log(`[BACK] Histórico > 1. Tentando voltar de: ${location.pathname}`);
          // 2. Tenta voltar para a tela anterior (comportamento do browser)
          window.history.back(); 
          
        } else {
          // 3. Se não houver histórico, fecha o app (último recurso)
          console.log(`[BACK] Histórico vazio. Fechando o app em: ${location.pathname}`);
          App.exitApp();
        }
      });
    };

    setupListener();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, []); // ⭐️ ARRAY DE DEPENDÊNCIAS VAZIO!

  return null;
};

export default BackButtonController;