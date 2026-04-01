import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { toast } from "sonner";

export interface ShareReceiptData {
  url: string;
  filename: string;
  title: string;
  text: string;
}

/**
 * Utilitário padronizado para compartilhamento de recibos.
 * Resolve a inconsistência entre Browser e SPA Capacitor.
 */
export async function shareReceiptFile(data: ShareReceiptData) {
  const { url, filename, title, text } = data;

  if (!url) {
    toast.error("O link do recibo não está disponível.");
    return;
  }

  try {
    // 1. Cenário: App Nativo (Android/iOS via Capacitor)
    // O plugin @capacitor/share é a forma correta de interagir com o SO nativo
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title,
        text,
        url, // Passamos a URL; o WhatsApp no Android/iOS resolve o preview da imagem
        dialogTitle: "Compartilhar Recibo",
      });
      return;
    }

    // 2. Cenário: Browser Mobile ou Desktop moderno
    // No browser, baixamos o blob para que o 'navigator.share' anexe o arquivo REAL (imagem)
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao baixar imagem do recibo");
    const blob = await response.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text,
      });
    } else {
      // Fallback para Desktop (Chrome/Safari desktop não compartilham arquivos via share API)
      window.open(url, "_blank");
    }
  } catch (error) {
    console.error("[ShareReceipt] Erro técnico detalhado:", error);
    
    // Se for um cancelamento do usuário, não mostramos erro
    if ((error as any).name === "AbortError" || (error as any).message?.includes("Share canceled")) {
      return;
    }

    // Mostra o erro real se for algo importante (como plugin faltando)
    const errorMessage = (error as Error).message || "Erro desconhecido";
    toast.error(`Falha no compartilhamento: ${errorMessage === "Plugin not implemented" ? "App precisa ser atualizado (sync/build)" : errorMessage}`);
  }
}
