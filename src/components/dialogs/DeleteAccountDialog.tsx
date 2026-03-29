import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeleteAccount } from "@/hooks/api/useDeleteAccount";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface DeleteAccountDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CONFIRMATION_TEXT = "EXCLUIR";

export default function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
  useEffect(() => {
    return () => {
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
      onError: (error) => console.error("Erro ao deletar conta:", error),
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isPending}>
      <BaseDialog.Header
        title="Excluir Minha Conta"
        onClose={!isPending ? onClose : undefined}
        hideCloseButton={isPending}
      />
      <BaseDialog.Body>
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-[2rem] border border-red-100 shadow-sm">
            <div className="flex flex-col items-center mb-4">
              <h3 className="text-lg font-bold text-red-600 tracking-tight">
                <AlertTriangle className="h-6 w-6 text-red-600 inline" /> Atenção!
              </h3>
            </div>
            <div className="space-y-4 text-red-800/80 font-medium text-[0.95rem] leading-relaxed px-2">
              <p>
                Esta ação é{" "}
                <span className="underline decoration-red-400 decoration-2 underline-offset-2 font-bold text-red-700">
                  irreversível
                </span>
                . Todos os seus dados pessoais serão anonimizados e você perderá acesso ao sistema imediatamente.
              </p>
              <p className="text-[11px] text-red-700 pt-2">
                Seus registros financeiros passados serão mantidos para fins fiscais.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Label htmlFor="confirmation" className="block text-center font-medium text-gray-600 text-sm">
              Para confirmar, digite{" "}
              <span className="text-red-600 font-bold select-none">"{CONFIRMATION_TEXT}"</span>{" "}
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
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action label="Cancelar" variant="secondary" onClick={onClose} disabled={isPending} />
        <BaseDialog.Action
          label="Confirmar"
          onClick={handleConfirm}
          disabled={!isConfirmed || isPending}
          isLoading={isPending}
          className="bg-red-600 hover:bg-red-700 shadow-red-500/20"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
