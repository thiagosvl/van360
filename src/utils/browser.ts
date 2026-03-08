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
  
  // Se for PWA no iOS, o download nativo é bloqueado muitas vezes.
  // A solução é converter o Blob para Base64 e abrir em uma nova aba,
  // ou usar uma técnica de Reader.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && isStandalone) {
    // Para iOS PWA, converter para Base64 e abrir é mais confiável para PDFs
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result;
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <body style="margin:0;">
              <embed width="100%" height="100%" src="${base64data}" type="application/pdf">
            </body>
          </html>
        `);
      } else {
        // Fallback se o pop-up for bloqueado
        window.location.href = url;
      }
    };
    reader.readAsDataURL(blob);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    openBrowserLink(url);
    return;
  }

  // PWA/Web padrão
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    if (document.body.contains(link)) {
        document.body.removeChild(link);
    }
    window.URL.revokeObjectURL(url);
  }, 200);
};
