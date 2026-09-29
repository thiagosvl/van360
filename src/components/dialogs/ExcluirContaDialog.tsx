import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { safeCloseDialog } from "@/hooks";
import { usuarioApi } from "@/services/api/usuario.api";
import { sessionManager } from "@/services/sessionManager";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { handleApiError } from "@/utils/errorHandler";

export interface ExcluirContaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONFIRMATION_KEYWORD = "EXCLUIR";

export function ExcluirContaDialog({
  open,
  onOpenChange,
}: ExcluirContaDialogProps) {
  const [typedConfirmation, setTypedConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = typedConfirmation.trim() === CONFIRMATION_KEYWORD;

  const handleClose = () => {
    if (isDeleting) return;
    setTypedConfirmation("");
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleDeleteAccount = async () => {
    if (!isConfirmed || isDeleting) return;

    setIsDeleting(true);
    try {
      await usuarioApi.excluirMinhaConta();
      toast.success("Sua conta e todos os dados vinculados foram excluídos.");
      await sessionManager.signOut();
      setTimeout(() => {
        window.location.href = ROUTES.PUBLIC.LOGIN;
      }, 800);
    } catch (err) {
      const message = handleApiError(err);
      toast.error(message || "Não foi possível excluir a sua conta.");
      setIsDeleting(false);
    }
  };

  return (
    <BaseDialog open={open} onOpenChange={handleClose}>
      <BaseDialog.Header
        title="Excluir minha conta"
        icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          <Banner
            variant="danger"
            description="Todos os seus dados serão permanentemente apagados."
          />

          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Para confirmar a exclusão definitiva da sua conta, digite a palavra{" "}
            <span className="font-bold text-rose-600 select-all">
              {CONFIRMATION_KEYWORD}
            </span>{" "}
            no campo abaixo:
          </p>

          <Input
            value={typedConfirmation}
            onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
            placeholder='Digite "excluir"'
            disabled={isDeleting}
            className="border-slate-300 focus-visible:ring-rose-500 font-semibold tracking-wider uppercase text-center placeholder:normal-case placeholder:font-normal placeholder:tracking-normal"
            autoFocus
          />
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={isDeleting}
          onClick={handleClose}
        />
        <BaseDialog.Action
          label={isDeleting ? "Confirmando..." : "Confirmar"}
          variant="primary"
          isLoading={isDeleting}
          disabled={!isConfirmed || isDeleting}
          onClick={handleDeleteAccount}
          className="bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 text-white"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
