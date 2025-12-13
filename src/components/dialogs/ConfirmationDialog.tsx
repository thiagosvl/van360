import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
   variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  isLoading = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  const showLoading = isLoading || internalLoading;

  // Cleanup effect to ensure body is unlocked when dialog closes
  // This is a safeguard against race conditions with Drawers/other overlays
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = "";
        document.body.style.removeProperty("overflow");
        document.body.removeAttribute("data-scroll-locked");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[90vw] max-w-sm rounded-2xl border-0 shadow-lg p-6 bg-white gap-6">
        <AlertDialogHeader className="space-y-3 text-left">
          <AlertDialogTitle className="text-xl font-medium text-gray-900 leading-none">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 text-[15px] leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row justify-end gap-2 space-x-0">
          <AlertDialogCancel
            disabled={showLoading}
            className="mt-0 h-10 px-4 rounded-xl border-none bg-transparent hover:bg-gray-100 text-gray-700 font-medium transition-colors"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={async (e) => {
              e.preventDefault();
              if (onConfirm) {
                  const result = onConfirm();
                  if (result instanceof Promise) {
                      setInternalLoading(true);
                      try {
                          await result;
                      } finally {
                          setInternalLoading(false);
                      }
                  }
              }
            }}
            disabled={showLoading}
            className={cn(
              "h-10 px-6 rounded-xl font-semibold shadow-sm transition-all text-white",
              variant === "destructive" && "bg-red-600 hover:bg-red-700",
              variant === "warning" && "bg-amber-600 hover:bg-amber-700",
              variant === "success" && "bg-emerald-600 hover:bg-emerald-700",
              variant === "default" && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {showLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}