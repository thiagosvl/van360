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
    // 1. Tentar baixar o arquivo e compartilhar pelo navegador (Funciona em Browsers e alguns WebViews de App)
    // Esse método é o único que permite "ANEXAR" o arquivo real no WhatsApp.
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao carregar arquivo do recibo");
    const blob = await response.blob();
    const file = new File([blob], filename, { type: "image/png" });

    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title,
        text,
      });
      return; // Se funcionou, paramos aqui
    }

    // 2. Se o navegador não suportar anexar arquivos (ex: Apps Capacitor Android sem permissão de WebView)
    // Usamos o plugin nativo do Capacitor como plano B (enviando a URL/Texto)
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        title,
        text: `${text}\n\n${url}`, // Incluímos a URL no texto para garantir que chegue algo
        url,
        dialogTitle: "Compartilhar Recibo",
      });
      return;
    }

    // 3. Fallback final para Desktop (onde não há share nativo com arquivos)
    window.open(url, "_blank");

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
