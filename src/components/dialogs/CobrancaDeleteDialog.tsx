import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

export interface CobrancaDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onEdit: () => void;
  isLoading?: boolean;
}

export default function CobrancaDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  onEdit,
  isLoading = false,
}: CobrancaDeleteDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  
  const showLoading = isLoading || internalLoading;

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

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange(false);
    onEdit();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="w-full max-w-md p-0 gap-0 bg-white h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-[32px] border-0 shadow-2xl"
        hideCloseButton
      >
        {/* Header Visual - Red for Destructive */}
        <div className="bg-red-600 p-6 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Fechar</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner ring-1 ring-white/30">
            <Trash2 className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white leading-tight">
            Deseja mesmo excluir?
          </DialogTitle>
        </div>

        {/* Content Section - Flexible and scrollable if needed */}
        <div className="p-6 pt-8 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100 flex gap-4 text-left shadow-sm">
            <div className="bg-orange-100 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-1.5 pt-0.5">
              <p className="font-bold text-orange-900 text-sm tracking-tight">Editar pode ser melhor!</p>
              <p className="text-orange-800/80 text-[13px] leading-relaxed font-medium">
                Se você deseja apenas corrigir o <strong className="text-orange-900">valor</strong>, a <strong className="text-orange-900">data</strong> ou o <strong className="text-orange-900">status</strong>, não é necessário excluir. Basta editar!
              </p>
            </div>
          </div>

          <p className="text-gray-500 text-sm text-center font-medium px-4">
            A exclusão é irreversível. O que você prefere fazer agora?
          </p>
        </div>

        {/* Fixed Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            disabled={showLoading}
            onClick={handleEdit}
            className="w-full h-11 rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 font-bold gap-2 transition-all transition-colors"
          >
            <Pencil className="w-4 h-4" />
            <span className="truncate">Editar</span>
          </Button>
          
          <Button
            onClick={handleConfirm}
            disabled={showLoading}
            className="w-full h-11 rounded-xl font-bold gap-2 transition-all text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 hover:shadow-red-500/30 active:scale-[0.98]"
          >
            {showLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            ) : (
              <Trash2 className="w-4 h-4 shrink-0" />
            )}
            <span className="truncate">{showLoading ? "Excluindo" : "Excluir"}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
