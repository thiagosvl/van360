import { Capacitor } from '@capacitor/core';

/**
 * Abre um link no navegador externo no mobile (Capacitor)
 * ou em uma nova aba no desktop (Web).
 */
export const openBrowserLink = (url: string) => {
  if (!url) return;

  if (Capacitor.isNativePlatform()) {
    // No Capacitor, o target '_system' força a abertura no navegador padrão do dispositivo
    window.open(url, '_system');
  } else {
    // No web padrão, abre em nova aba
    window.open(url, '_blank');
  }
};
