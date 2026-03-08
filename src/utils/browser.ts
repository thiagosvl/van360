import { toast } from '@/utils/notifications/toast';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

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

/**
 * Utilitário robusto para compartilhar ou baixar um arquivo PDF
 * Funciona em PWA (Android/iOS) e APK Nativo (Capacitor).
 */
export const shareOrDownloadFile = async (blob: Blob, fileName: string, title: string = 'Documento PDF') => {
  const isNative = Capacitor.isNativePlatform();
  
  try {
    if (isNative) {
      // --- LÓGICA NATIVA (APK) ---
      // 1. Converter Blob para Base64 (Requisito do Capacitor Filesystem)
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1]); // Remove o prefixo data:*/*;base64,
        };
        reader.readAsDataURL(blob);
      });
      
      const base64 = await base64Promise;
      
      // 2. Gravar no sistema de arquivos temporário
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      // 3. Compartilhar o arquivo gravado (Isso abre a gaveta nativa do Android)
      await Share.share({
        title: title,
        text: 'Visualizando documento PDF',
        url: fileResult.uri, // URI nativo do arquivo no dispositivo
        dialogTitle: 'Compartilhar ou Salvar Contrato',
      });
      
    } else {
      // --- LÓGICA WEB / PWA ---
      const file = new File([blob], fileName, { type: 'application/pdf' });
      
      // Tentar Web Share API se disponível e for mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: title,
            text: 'Visualizando documento PDF no Van Control',
          });
          return;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') return;
          console.warn('Web Share falhou, tentando download direto:', shareErr);
        }
      }

      // Fallback para Download Direto
      downloadBlob(blob, fileName);
    }
  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    toast.error('Erro ao compartilhar ou baixar o documento.');
    // Fallback final: tenta download simples
    downloadBlob(blob, fileName);
  }
};

/**
 * Técnica clássica de download por link <a> com suporte a PWA Android
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  
  // No Android Standalone, preferimos DataURL para evitar bloqueio de Blob URL
  const isAndroid = /Android/.test(navigator.userAgent);
  const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

  if (isAndroid && isStandalone) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      const link = document.createElement('a');
      link.href = base64data;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => document.body.removeChild(link), 500);
    };
    reader.readAsDataURL(blob);
  } else {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 500);
  }
  
  toast.info('Documento baixado com sucesso.');
};
