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
      await Browser.open({ url });
    } else {
      // Para Web/PWA, simular um clique em um link real é mais robusto em mobile/standalone
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
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      window.location.href = url;
    }
  }
};
