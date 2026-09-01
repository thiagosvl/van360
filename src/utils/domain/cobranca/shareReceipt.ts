import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { toast } from "sonner";
import { openBrowserLink } from "@/utils/browser";

export interface ShareReceiptData {
  url: string;
  filename: string;
  title: string;
  text: string;
}

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

const isShareCancelError = (error: unknown): boolean => {
  if (!error) return false;
  if (typeof error === "string") {
    const lower = error.toLowerCase();
    return lower.includes("canceled") || lower.includes("cancelled") || lower.includes("abort");
  }
  const err = error as { name?: string; message?: string; code?: number };
  const message = String(err.message || "").toLowerCase();
  const name = String(err.name || "").toLowerCase();
  return (
    name === "aborterror" ||
    err.code === 20 ||
    message.includes("canceled") ||
    message.includes("cancelled") ||
    message.includes("share canceled") ||
    message.includes("user canceled") ||
    message.includes("user cancelled") ||
    message.includes("dismissed") ||
    message.includes("abort")
  );
};

export async function shareReceiptFile(data: ShareReceiptData) {
  const { url, filename, title, text } = data;

  if (!url) {
    toast.error("O link do recibo não está disponível.");
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Falha ao carregar arquivo do recibo");
    const blob = await response.blob();

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = await blobToBase64(blob);

        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title,
          text,
          files: [savedFile.uri],
          dialogTitle: "Compartilhar Recibo",
        });
        return;
      } catch (nativeError) {
        if (isShareCancelError(nativeError)) {
          return;
        }

        try {
          await Share.share({
            title,
            text: `${text}\n${url}`,
            url,
            dialogTitle: "Compartilhar Recibo",
          });
          return;
        } catch (urlShareError) {
          if (isShareCancelError(urlShareError)) {
            return;
          }
        }
      }
    }

    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
          text,
        });
        return;
      } catch (webShareError) {
        if (isShareCancelError(webShareError)) {
          return;
        }
      }
    }

    openBrowserLink(url);
  } catch (error) {
    if (isShareCancelError(error)) {
      return;
    }

    const errorMessage = (error as Error).message || "Erro desconhecido";
    toast.error(`Falha no compartilhamento: ${errorMessage === "Plugin not implemented" ? "App precisa ser rebuildado (novo APK)" : errorMessage}`);
  }
}
