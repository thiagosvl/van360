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
 * Técnica para forçar o download ou abertura de BLOB em PWA/Mobile (Android/Chrome focus)
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  
  // Detecção de plataforma
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

  // No Android PWA/Chrome, Blobs costumam funcionar bem com <a> download, 
  // mas o link PRECISA estar no DOM e ser visível ou ter layout.
  if (isAndroid && isStandalone) {
    // Técnica de DataURL para Android PWA (mais estável para evitar bloqueio de Blob URL)
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const link = document.createElement('a');
      link.href = base64data;
      link.download = fileName;
      link.style.opacity = '0';
      link.style.position = 'fixed';
      link.style.pointerEvents = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 500);
    };
    reader.readAsDataURL(blob);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    // Se for APK Nativo, tentamos abrir o navegador do sistema com o URL
    // Nota: URLs de Blob podem não funcionar em navegadores externos no Android Nativo
    // se o Chrome Custom Tab não tiver acesso ao processo. 
    // O ideal seria usar o Filesystem plugin aqui se estivesse disponível.
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
  }, 300);
};
