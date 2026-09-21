import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { toast } from "sonner";

export interface ShareContratoData {
  url: string;
  filename: string;
  title: string;
  text?: string;
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

export async function shareContratoFile(data: ShareContratoData): Promise<void> {
  const { url, filename, title, text = "" } = data;

  if (!url) {
    toast.error("O documento do contrato não está disponível.");
    return;
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Falha ao carregar arquivo do contrato");
    }
    const blob = await response.blob();

    if (Capacitor.isNativePlatform()) {
      try {
        const base64Data = await blobToBase64(blob);

        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache,
        });

        await Share.share({
          title,
          text,
          files: [savedFile.uri],
          dialogTitle: "Compartilhar Contrato",
        });
        return;
      } catch (nativeError) {
        if (isShareCancelError(nativeError)) {
          return;
        }

        try {
          await Share.share({
            title,
            text: text ? `${text}\n${url}` : url,
            url,
            dialogTitle: "Compartilhar Contrato",
          });
          return;
        } catch (urlShareError) {
          if (isShareCancelError(urlShareError)) {
            return;
          }
        }
      }
    }

    if (navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: "application/pdf" });
      const canShareFile = navigator.canShare({ files: [file] });

      if (canShareFile) {
        await navigator.share({
          title,
          text,
          files: [file],
        });
        return;
      }
    }

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    if (!isShareCancelError(err)) {
      toast.error("Não foi possível compartilhar o contrato.");
    }
  }
}
