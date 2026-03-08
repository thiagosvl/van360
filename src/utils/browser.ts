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
 * Utilitário robusto para compartilhar ou baixar um arquivo PDF.
 * Suporte a APK Nativo, PWA (Chrome/Android) e Browsers Desktop.
 */
export const shareOrDownloadFile = async (blob: Blob, fileName: string, title: string = 'Documento PDF') => {
  const isNative = Capacitor.isNativePlatform();
  
  try {
    // 1. LÓGICA PARA APK NATIVO (Capacitor)
    if (isNative) {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
      
      const base64 = await base64Promise;
      
      const fileResult = await Filesystem.writeFile({
        path: fileName,
        data: base64,
        directory: Directory.Cache,
      });

      await Share.share({
        title: title,
        text: 'Visualizando documento PDF',
        url: fileResult.uri,
        dialogTitle: 'Compartilhar ou Salvar',
      });
      return;
    }

    // 2. LÓGICA PARA WEB / PWA
    // IMPORTANTE: Em PWAs Android, Files com PDF as vezes falham se o blob não for recriado explicitamente.
    const file = new File([blob], fileName, { type: 'application/pdf' });
    
    // Tenta Web Share API (Gaveta nativa do Android no Chrome)
    const canShare = navigator.share && navigator.canShare && navigator.canShare({ files: [file] });

    if (canShare) {
      try {
        // Tentativa de compartilhamento real
        await navigator.share({
          files: [file],
          title: title,
          text: 'PDF do Van Control'
        });
        // Se chegou aqui sem erro, o sistema abriu a gaveta com sucesso.
        return;
      } catch (shareErr: any) {
        // Se o usuário cancelou o compartilhamento, paramos por aqui.
        if (shareErr.name === 'AbortError') return;
        
        // Se for um erro de permissão ou sistema, tentamos o fallback de download.
        console.warn('Web Share API recusada ou falhou. Tentando download...', shareErr);
      }
    }

    // 3. FALLBACK: DOWNLOAD DIRETO (Caso o Share não funcione ou não exista no navegador)
    downloadBlob(blob, fileName);

  } catch (error) {
    console.error('Erro geral no processamento do arquivo:', error);
    // Tenta o download simples como última esperança antes de avisar erro.
    try {
      downloadBlob(blob, fileName);
    } catch (finalErr) {
      toast.error('Não foi possível compartilhar ou baixar o documento no seu dispositivo.');
    }
  }
};

/**
 * Técnica de download silenciosa para PWA e Browsers.
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  try {
    const isAndroid = /Android/.test(navigator.userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;

    // Em PWAs no Android, links blob:// as vezes são bloqueados. Usamos DataURL (Base64).
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
      // Browser padrão (Desktop/Mobile)
      const url = window.URL.createObjectURL(blob);
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
    
    toast.info('Documento enviado para download.');
  } catch (err) {
    console.error('Erro ao baixar documento:', err);
    throw err;
  }
};
