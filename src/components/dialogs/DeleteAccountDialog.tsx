import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAccount } from "@/hooks/api/useDeleteAccount";
import { AlertTriangle, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONFIRMATION_TEXT = "EXCLUIR";

export default function DeleteAccountDialog({
  isOpen,
  onClose,
}: DeleteAccountDialogProps) {
  useEffect(() => {
    return () => {
      // Force cleanup of Radix UI styles that might persist on sudden navigation/logout
      document.body.style.pointerEvents = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const [confirmationInfo, setConfirmationInfo] = useState("");
  const { mutate: deleteAccount, isPending } = useDeleteAccount();

  const isConfirmed = confirmationInfo.toUpperCase() === CONFIRMATION_TEXT;

  const handleConfirm = () => {
    if (!isConfirmed) return;
    deleteAccount(undefined, {
      onError: (error) => {
        console.error("Erro ao deletar conta:", error);
      },
    });
  };


  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isPending && onClose()}>
      <DialogContent
        className="w-full max-w-md p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl z-[60]"
        hideCloseButton
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="bg-red-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogTitle className="text-xl max-[320px]:w-[200px] mx-auto font-bold text-white">
            Excluir Minha Conta
          </DialogTitle>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col items-center text-center">
          <div className="bg-red-50 p-3 rounded-[2rem] mb-8 border border-red-100 w-full shadow-sm">
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-lg font-bold text-red-600 tracking-tight">
                <AlertTriangle className="h-6 w-6 text-red-600 inline" /> Atenção!
              </h3>
            </div>
            
            <div className="space-y-4 text-red-800/80 font-medium text-[0.95rem] leading-relaxed px-2">
              <p>
                Esta ação é <span className="underline decoration-red-400 decoration-2 underline-offset-2 font-bold text-red-700">irreversível</span>. Todos os seus dados pessoais serão anonimizados e você perderá acesso ao sistema imediatamente.
              </p>
              <p>
                A sua assinatura será cancelada imediatamente, sem direito a reembolso.
              </p>
              <p className="text-[11px] text-red-700 pt-2">
                Seus registros financeiros passados serão mantidos para fins fiscais.
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-4">
            <Label
              htmlFor="confirmation"
              className="block text-center font-medium text-gray-600 text-sm"
            >
              Para confirmar, digite{" "}
              <span className="text-red-600 font-bold select-none">
                "{CONFIRMATION_TEXT}"
              </span>{" "}
              abaixo:
            </Label>
            <Input
              id="confirmation"
              value={confirmationInfo}
              onChange={(e) => setConfirmationInfo(e.target.value)}
              placeholder={CONFIRMATION_TEXT}
              className="h-14 rounded-xl border-2 focus-visible:ring-4 focus-visible:ring-red-500/20 focus-visible:border-red-500 font-bold text-xl text-center tracking-[0.2em] uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-semibold placeholder:text-gray-400 transition-all bg-white shadow-sm placeholder:tracking-wider"
              autoComplete="off"
            />
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!isConfirmed || isPending}
            className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all hover:-translate-y-0.5"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Confirmar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
