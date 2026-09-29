import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BUCKET_LOGOS } from "@/constants";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg"];

interface UploadLogoParams {
  userId: string;
  file: File;
}

async function optimizeImageForUpload(file: File, maxDimension = 1200): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const { width, height } = img;

      if (width <= maxDimension && height <= maxDimension && file.size <= 1024 * 1024) {
        resolve(file);
        return;
      }

      const scale = Math.min(maxDimension / width, maxDimension / height, 1);
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputType === "image/jpeg" ? 0.9 : undefined;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const optimizedFile = new File([blob], file.name, {
            type: outputType,
            lastModified: Date.now(),
          });
          resolve(optimizedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

export function useLogoStorage() {
  const uploadLogoMutation = useMutation({
    mutationFn: async ({ userId, file }: UploadLogoParams): Promise<string> => {
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        throw new Error("Formato inválido. Selecione uma imagem PNG ou JPG.");
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        throw new Error("Arquivo muito grande. O tamanho máximo permitido é 5MB.");
      }

      const optimizedFile = await optimizeImageForUpload(file);
      const extension = optimizedFile.name.split(".").pop() || (optimizedFile.type === "image/png" ? "png" : "jpg");
      const filePath = `${userId}/logo_${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_LOGOS)
        .upload(filePath, optimizedFile, {
          upsert: true,
          contentType: optimizedFile.type,
        });

      if (uploadError) {
        throw new Error(`Falha no upload do logotipo: ${uploadError.message}`);
      }

      const { data } = supabase.storage.from(BUCKET_LOGOS).getPublicUrl(filePath);
      return data.publicUrl;
    },
  });

  const removeLogoMutation = useMutation({
    mutationFn: async (logoUrl: string): Promise<void> => {
      if (!logoUrl.includes(BUCKET_LOGOS)) return;

      const parts = logoUrl.split(`${BUCKET_LOGOS}/`);
      if (parts.length < 2) return;

      const path = parts[1];
      const { error } = await supabase.storage.from(BUCKET_LOGOS).remove([path]);
      if (error) {
        throw new Error(`Falha ao remover arquivo: ${error.message}`);
      }
    },
  });

  return {
    uploadLogo: uploadLogoMutation.mutateAsync,
    isUploading: uploadLogoMutation.isPending,
    removeLogo: removeLogoMutation.mutateAsync,
    isRemoving: removeLogoMutation.isPending,
  };
}
