import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import { useLocation } from "react-router-dom"; // Não precisa mais de useNavigate

const BackButtonController = () => {
  // Remova: const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let handler: any;

    const setupListener = async () => {
      handler = await App.addListener("backButton", () => {
        const homeRoutes = ["/inicio", "/"];
        const currentPath = location.pathname;

        if (homeRoutes.includes(currentPath)) {
          // 1. TELA INICIAL: Fecha o App
          App.exitApp();
        } else {
          // 2. OUTRAS TELAS: Força o comportamento de VOLTAR do navegador (nativo)
          // Isso ignora o navigate(-1) e replica o que acontece quando o app
          // é acessado diretamente pelo navegador.
          window.history.back(); 
          
          // O fallback para fechar o app se o histórico estiver vazio não é mais
          // estritamente necessário aqui, pois o navegador geralmente lida com isso.
          // O Capacitor, quando a pilha de history.length chega a 1 e o usuário
          // tenta voltar, às vezes trata como um evento de fechar, mas é mais
          // limpo deixar o browser tentar o back. Se falhar, o Capacitor fecha.
        }
      });
    };

    setupListener();

    return () => {
      if (handler) {
        handler.remove();
      }
    };
  }, [location.pathname]); // Remova 'navigate' das dependências, pois não é mais usado

  return null;
};

export default BackButtonController;