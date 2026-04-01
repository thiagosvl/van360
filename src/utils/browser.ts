import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Abre um link no navegador externo no mobile (Capacitor)
 * ou em uma nova aba no desktop (Web).
 */
export const openBrowserLink = async (url: string) => {
  if (!url) return;

  try {
    if (Capacitor.isNativePlatform()) {
      // Melhoria para WhatsApp no Android/iOS:
      // Se for um link wa.me, tentamos usar o protocolo nativo whatsapp://
      // Isso evita o diálogo "Abrir com" e resolve problemas de codificação de emojis no WebView.
      if (url.includes('wa.me/')) {
        // Converte https://wa.me/55119... para whatsapp://send?phone=55119...
        // E garante que se houver um ?text=, ele vire &text= para ser um parâmetro extra válido.
        const nativeUrl = url
          .replace('https://wa.me/', 'whatsapp://send?phone=')
          .replace('?text=', '&text=');
        
        window.location.href = nativeUrl;
        return;
      }

      await Browser.open({ url });
    } else {
      // Para Web/PWA, simular um clique em um link real
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Erro ao abrir link:', error);
    // Fallback de segurança
    try {
      if (Capacitor.isNativePlatform()) {
         window.location.href = url;
      } else {
         window.open(url, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      window.location.href = url;
    }
  }
};
