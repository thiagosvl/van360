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
  variant = "default",
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

  const actionButtonClass = cn(
    "h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/10 transition-all text-white active:scale-95 disabled:opacity-50",
    variant === "destructive" ? "bg-rose-500 hover:bg-rose-600 shadow-rose-200" : "bg-[#1a3a5c] hover:bg-[#1e446d] shadow-blue-200"
  );

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
        <DialogContent className="w-[92vw] max-w-[400px] rounded-[2rem] border-0 shadow-2xl p-0 bg-white overflow-hidden">
          <div className="p-8 space-y-6">
            <DialogHeader className="space-y-4 text-left">
              <DialogTitle className="text-2xl font-black text-[#1a3a5c] tracking-tight leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm font-medium leading-relaxed">
                {description}
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <button
                disabled={showLoading}
                onClick={() => {
                  onCancel?.();
                  onOpenChange(false);
                }}
                className="flex-1 h-12 rounded-2xl bg-slate-50 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={showLoading}
                className={cn("flex-1", actionButtonClass)}
              >
                <ActionContent />
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Default: AlertDialog (Blocking)
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[92vw] max-w-[400px] rounded-[2rem] border-0 shadow-2xl p-0 bg-white overflow-hidden">
        <div className="p-8 space-y-6">
          <AlertDialogHeader className="space-y-4 text-left">
            <AlertDialogTitle className="text-2xl font-black text-[#1a3a5c] tracking-tight leading-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 text-sm font-medium leading-relaxed">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <AlertDialogCancel
              disabled={showLoading}
              onClick={() => onCancel?.()}
              className="flex-1 mt-0 h-12 rounded-2xl bg-slate-50 border-0 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={showLoading}
              className={cn("flex-1", actionButtonClass)}
            >
              <ActionContent />
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}