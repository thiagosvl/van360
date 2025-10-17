import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BackButtonController = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      // Retorna imediatamente se não for plataforma nativa
      return;
    }

    // Variável para armazenar a referência do listener (fora do async)
    let handler: any;

    const setupListener = async () => {
      // 1. Usa 'await' para obter a referência real do listener
      handler = await App.addListener("backButton", () => {
        const homeRoutes = ["/inicio", "/"];
        const currentPath = location.pathname;

        if (homeRoutes.includes(currentPath)) {
          // Tela inicial = sempre fechar/minimizar
          App.exitApp();
        } else if (window.history.length > 1) {
          // ⭐️ NOVO: Verifica o histórico REAL do navegador
          // Se não está na tela inicial, mas tem histórico para onde voltar, usa navigate.
          navigate(-1);
        } else {
          // Se não está na tela inicial, mas o histórico está vazio (ex: deep link), fecha o app.
          // Isso garante que o usuário não fique preso.
          App.exitApp();
        }
      });
    };

    setupListener();

    // A função de cleanup (retorno do useEffect) agora chama o remove()
    // no objeto 'handler' real, que foi obtido com await.
    return () => {
      if (handler) {
        // 2. Chama .remove() de forma assíncrona
        handler.remove();
      }
    };
  }, [location.pathname, navigate]);

  return null;
};

export default BackButtonController;
