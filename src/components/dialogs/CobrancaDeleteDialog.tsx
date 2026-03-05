import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Pencil, Trash2 } from "lucide-react";
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="w-[95vw] max-w-md rounded-3xl border-0 shadow-2xl p-0 bg-white gap-0 overflow-hidden">
        
        {/* Header Visual */}
        <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center relative border-b border-red-100">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-4 ring-white shadow-sm">
                <Trash2 className="w-7 h-7 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 leading-tight">
                Você realmente deseja excluir?
            </AlertDialogTitle>
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/60 flex gap-3 text-left">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <p className="font-bold text-amber-900 text-sm">Editar pode ser melhor!</p>
                    <p className="text-amber-700 text-sm leading-relaxed">
                        Se você deseja apenas corrigir o <strong>valor</strong>, a <strong>data de vencimento</strong> ou o <strong>status</strong>, não é necessário excluir esta mensalidade da lista. Basta editá-la!
                    </p>
                </div>
            </div>

            <AlertDialogDescription className="text-gray-500 text-sm text-center mt-5 mb-2 font-medium">
                O que você prefere fazer agora?
            </AlertDialogDescription>
        </div>

        {/* Actions */}
        <AlertDialogFooter className="p-4 bg-gray-50 border-t border-gray-100 sm:justify-between flex-col sm:flex-row gap-3">
            <Button
                variant="outline"
                disabled={showLoading}
                onClick={handleEdit}
                className="w-full sm:w-auto h-12 sm:h-auto rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 font-bold gap-2 transition-all order-1 sm:order-none"
            >
                <Pencil className="w-4 h-4" />
                Quero Editar
            </Button>
            
            <AlertDialogAction
                onClick={handleConfirm}
                disabled={showLoading}
                className={cn(
                    "w-full sm:w-auto h-12 sm:h-auto rounded-xl font-bold gap-2 transition-all text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 hover:shadow-red-500/30",
                    showLoading && "opacity-70 cursor-not-allowed"
                )}
            >
                {showLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Excluindo...
                    </>
                ) : (
                    <>
                        <Trash2 className="w-4 h-4" />
                        Excluir Mensalidade
                    </>
                )}
            </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
