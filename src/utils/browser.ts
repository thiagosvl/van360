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
      if (url.includes('wa.me/')) {
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

/**
 * Abre uma URL de PDF (Blob ou HTTP) de forma 100% compatível com Web e Capacitor.
 */
export const openPdfLink = async (pdfUrl: string) => {
  if (!pdfUrl) return;

  try {
    if (Capacitor.isNativePlatform()) {
      if (pdfUrl.startsWith('blob:')) {
        // Converte o Blob em Data URI Base64 para ser legível pelo navegador nativo do Android/iOS
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          if (base64data) {
            await Browser.open({ url: base64data });
          }
        };
        reader.readAsDataURL(blob);
        return;
      }
      await Browser.open({ url: pdfUrl });
    } else {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Erro ao abrir PDF:', error);
    window.open(pdfUrl, '_blank');
  }
};
