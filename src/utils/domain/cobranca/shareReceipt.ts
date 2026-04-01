import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { toast } from "sonner";

export interface ShareReceiptData {
  url: string;
  filename: string;
  title: string;
  text: string;
}

/**
 * Helper para converter Blob em Base64 (necessário para o Filesystem.writeFile)
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Utilitário padronizado para compartilhamento de recibos.
 * Resolve a inconsistência entre Browser e App Nativo/Capacitor.
 */
export async function shareReceiptFile(data: ShareReceiptData) {
  const { url, filename, title, text } = data;

  if (!url) {
    toast.error("O link do recibo não está disponível.");
    return;
  }

  try {
    // 1. Download do arquivo (Comum para todos os fluxos)
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao carregar arquivo do recibo");
    const blob = await response.blob();

    // 2. Fluxo Nativo (Capacitor + Android/iOS)
    // Para anexar de verdade no WhatsApp, precisamos salvar o arquivo fisicamente no cache do App
    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = await blobToBase64(blob);
        
        // Salva na pasta de cache temporário do app
        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title,
          text,
          files: [savedFile.uri], // USANDO O URI DO ARQUIVO LOCAL!
          dialogTitle: "Compartilhar Recibo",
        });
        return;
      } catch (nativeError) {
        console.error("[ShareReceipt] Erro no fluxo nativo (Filesystem), tentando fallback:", nativeError);
        // Se falhar (ex: plugin não instalado ainda), cai para o fluxo básico abaixo
      }
    }

    // 3. Fluxo Mobile Browser (File API)
    // Esse método anexa o arquivo se o navegador suportar (ex: Chrome no Android)
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return;
    }

    // 4. Fallback final para Desktop ou navegadores sem Share API
    window.open(url, "_blank");

  } catch (error) {
    console.error("[ShareReceipt] Erro técnico detalhado:", error);
    
    // Se for um cancelamento do usuário, ignoramos
    if ((error as any).name === "AbortError" || (error as any).message?.includes("Share canceled")) {
      return;
    }

    const errorMessage = (error as Error).message || "Erro desconhecido";
    toast.error(`Falha no compartilhamento: ${errorMessage === "Plugin not implemented" ? "App precisa ser rebuildado (novo APK)" : errorMessage}`);
  }
}
