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
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Erro ao abrir link:', error);
    window.open(url, '_blank');
  }
};
