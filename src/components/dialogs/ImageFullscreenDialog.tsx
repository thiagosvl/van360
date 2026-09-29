import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { cn } from "@/lib/utils";

export interface ImageFullscreenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt?: string;
}

export function ImageFullscreenDialog({
  isOpen,
  onClose,
  imageUrl,
  alt = "Imagem expandida",
}: ImageFullscreenDialogProps) {
  if (!imageUrl) return null;

  return (
    <DialogPrimitive.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          safeCloseDialog(onClose);
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 outline-none focus:outline-none select-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
          onClick={() => safeCloseDialog(onClose)}
        >
          <DialogPrimitive.Title className="sr-only">
            Visualização de imagem em tela cheia
          </DialogPrimitive.Title>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              safeCloseDialog(onClose);
            }}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10 shadow-lg cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-6 w-6" />
          </button>

          <img
            src={imageUrl}
            alt={alt}
            className="max-w-[95vw] max-h-[92vh] object-contain drop-shadow-2xl rounded-md cursor-default"
            onClick={(e) => e.stopPropagation()}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
