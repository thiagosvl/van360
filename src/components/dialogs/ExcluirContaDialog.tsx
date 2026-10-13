import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import { safeCloseDialog } from "@/hooks";
import { usuarioApi } from "@/services/api/usuario.api";
import { sessionManager } from "@/services/sessionManager";
import { ROUTES } from "@/constants/routes";
import { toast } from "@/utils/notifications/toast";
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
    <BaseDialog open={open} onOpenChange={handleClose} maxWidth="sm">
      <BaseDialog.Header
        title="Excluir conta"
        subtitle="Esta ação é permanente e irreversível."
        icon={<Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />
      <BaseDialog.Body>
        <div className="space-y-4 pt-1">
          <p className="text-xs sm:text-sm text-[#737373] leading-relaxed">
            Ao confirmar, todos os seus dados cadastrais, rotas, alunos e registros financeiros serão permanentemente apagados dos nossos servidores.
          </p>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-[#0a0a0a] block">
              Para confirmar, digite <span className="font-semibold text-[#0a0a0a] bg-[#f5f5f5] px-1.5 py-0.5 rounded-[6px] border border-[#e5e5e5] tracking-wider">EXCLUIR</span> abaixo:
            </label>
            <Input
              value={typedConfirmation}
              onChange={(e) => setTypedConfirmation(e.target.value.toUpperCase())}
              placeholder='Digite "EXCLUIR"'
              disabled={isDeleting}
              className="h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] focus:border-[#0a0a0a] focus:bg-white text-sm text-[#0a0a0a] text-center uppercase tracking-widest font-semibold placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-[#737373] transition-all focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none"
              autoFocus
            />
          </div>
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
          label={isDeleting ? "Excluindo..." : "Confirmar Exclusão"}
          variant="destructive"
          isLoading={isDeleting}
          disabled={!isConfirmed || isDeleting}
          onClick={handleDeleteAccount}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
