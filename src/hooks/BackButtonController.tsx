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
          console.log("Back Button: Fechando/Minimizando o app.");
          App.exitApp();
        } else {
          console.log(
            `Back Button: Navegando para a tela anterior a ${currentPath}.`
          );
          navigate(-1);
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
