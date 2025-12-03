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
import { AlertTriangle, HelpCircle, Loader2 } from "lucide-react";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
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
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md rounded-3xl border-0 shadow-2xl p-0 overflow-hidden bg-white">
        <div
          className={`${
            variant === "destructive" ? "bg-red-600" : "bg-blue-600"
          } px-6 py-4 text-center`}
        >
          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            {variant === "destructive" ? (
              <AlertTriangle className="w-6 h-6 text-white" />
            ) : (
              <HelpCircle className="w-6 h-6 text-white" />
            )}
          </div>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-white text-center">
              {title}
            </AlertDialogTitle>
          </AlertDialogHeader>
        </div>

        <div className="px-6 py-4 text-center">
          <AlertDialogDescription className="text-gray-600 text-base">
            {description}
          </AlertDialogDescription>
        </div>

        <AlertDialogFooter className="p-6 pt-2 bg-white flex-row gap-3 sm:gap-3 space-x-0">
          <AlertDialogCancel
            disabled={isLoading}
            className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium border-gray-200 mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all ${
              variant === "destructive"
                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-500/20 hover:shadow-red-500/30"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:shadow-blue-500/30"
            }`}
          >
            {isLoading ? (
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