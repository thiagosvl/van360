import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive" | "warning" | "success";
  isLoading?: boolean;
  allowClose?: boolean;
}

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isLoading = false,
  allowClose = false,
}: ConfirmationDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const showLoading = isLoading || internalLoading;

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

  // Shared Logic for Action Button
  const handleConfirm = async (e: React.MouseEvent) => {
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
  };

  const ActionContent = () => (
    <div className="flex items-center justify-center gap-2">
      {showLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processando</span>
        </>
      ) : (
        <span>{confirmText}</span>
      )}
    </div>
  );

  // If allowClose is true, use Dialog (Dismissible)
  if (allowClose) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[92vw] max-w-[400px] rounded-[2.5rem] border-0 shadow-2xl p-0 bg-white overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-4 text-left">
              <DialogTitle className="text-2xl font-black text-[#1a3a5c] tracking-tight leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm font-medium leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>
          </div>

          <DialogFooter className="p-6 pt-0 flex flex-row gap-3">
            <button
              disabled={showLoading}
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
              className="flex-1 mt-0 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
            >
              {cancelText}
            </button>

            <button
              onClick={handleConfirm}
              disabled={showLoading}
              className={cn(
                "flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 shadow-lg",
                "bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
              )}
            >
              <ActionContent />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: AlertDialog (Blocking)
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92vw] max-w-[400px] rounded-[2.5rem] border-0 shadow-2xl p-0 bg-white overflow-hidden">
        <div className="p-8 pb-0 space-y-6">
          <AlertDialogHeader className="space-y-4 text-left">
            <AlertDialogTitle className="text-2xl font-black text-[#1a3a5c] tracking-tight leading-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm font-medium leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter className="p-5 sm:p-6 bg-slate-50/40 flex flex-row gap-3">
          <AlertDialogCancel
            disabled={showLoading}
            onClick={() => onCancel?.()}
            className="flex-1 mt-0 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider border border-slate-100 text-slate-400 hover:text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={showLoading}
            className={cn(
              "flex-1 h-12 rounded-2xl font-black uppercase text-[10px] tracking-wider transition-all active:scale-95 shadow-lg",
              "bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white shadow-[#1a3a5c]/20"
            )}
          >
            <ActionContent />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}