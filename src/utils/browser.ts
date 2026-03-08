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
      // Usa o plugin Browser para melhor integração nativa
      await Browser.open({ url });
    } else {
      // No web padrão, abre em nova aba
      window.open(url, '_blank');
    }
  } catch (error) {
    console.error('Erro ao abrir link:', error);
    // Fallback de segurança
    window.open(url, '_blank');
  }
};

/**
 * Técnica para forçar o download ou abertura de BLOB em PWA/Mobile
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  
  if (Capacitor.isNativePlatform()) {
    // Native (Capacitor) handles blobs better via Browser plugin with standard URL
    openBrowserLink(url);
    return;
  }

  // PWA/Web
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  
  // Important for iOS PWA: Some versions require the link to be in the DOM
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    if (document.body.contains(link)) {
        document.body.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }, 100);
};
