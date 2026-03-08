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
  
  // Detecção de iOS PWA
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

  if (isIOS && isStandalone) {
    // No iOS PWA, o comando 'download' é bloqueado.
    // Abrimos uma nova janela IMEDIATAMENTE (gesto do usuário) e depois populamos.
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<html><head><title>Carregando...</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666;">Preparando documento...</body></html>');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        // Substitui o conteúdo para exibir o PDF de forma que o iOS permita salvar/compartilhar
        newWindow.document.documentElement.innerHTML = `
          <html>
            <head>
              <title>${fileName}</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;background:#525659;display:flex;flex-direction:column;height:100vh;">
              <embed src="${base64data}" type="application/pdf" style="width:100%;height:100%; border:none;" />
            </body>
          </html>
        `;
      };
      reader.readAsDataURL(blob);
    } else {
      // Fallback via redirecionamento de tela (menos desejável mas funcional)
      window.location.href = url;
    }
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
