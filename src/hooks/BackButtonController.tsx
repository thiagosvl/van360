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
    
    // Assinatura imediata (sem async/await no useEffect)
    const handler = App.addListener("backButton", () => {
        
        // Use a lógica "Se tem histórico para onde voltar, volte. Caso contrário, feche."
        if (window.history.length > 1) {
            // Se tem histórico no webview, volte. Isso simula o comportamento do navegador.
            console.log(`[BACK] voltando de: ${location.pathname}. Histórico: ${window.history.length}`);
            window.history.back(); 
            
        } else {
            // Último item na pilha = Fechar o app
            console.log(`[BACK] Histórico Vazio. Fechando o app em: ${location.pathname}`);
            App.exitApp();
        }
    });

    // O retorno agora é síncrono e limpa o listener
    return () => {
        // Remove o listener de forma assíncrona, se ele foi criado
        handler.then(h => h.remove()); 
    };
    
    // Dependências vazias (o melhor para listeners de app)
  }, []); 

  return null;
};

export default BackButtonController;