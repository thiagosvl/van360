import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { BadgePercent } from "lucide-react";
import { Cobranca } from "@/types/cobranca";
import { useIsentarEncargosCobranca } from "@/hooks/api/useCobrancaMutations";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { formatNomeAlunoExibicao, getMesNome } from "@/utils/formatters";

export interface IsentarEncargosCobrancaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cobranca: Cobranca;
  onSuccess?: () => void;
}

export function IsentarEncargosCobrancaDialog({
  open,
  onOpenChange,
  cobranca,
  onSuccess,
}: IsentarEncargosCobrancaDialogProps) {
  const isentarMutation = useIsentarEncargosCobranca();

  const handleConfirm = async () => {
    try {
      await isentarMutation.mutateAsync(cobranca.id);
      safeCloseDialog(() => onOpenChange(false));
      onSuccess?.();
    } catch {
    }
  };

  const alunoNome = formatNomeAlunoExibicao(cobranca.passageiro?.nome || "Aluno");
  const mesAnoTexto = `${getMesNome(cobranca.mes)}/${cobranca.ano}`;

  return (
    <BaseDialog open={open} onOpenChange={(val) => safeCloseDialog(() => onOpenChange(val))}>
      <BaseDialog.Header
        title="Isentar multa e juros"
        icon={<BadgePercent className="w-5 h-5 text-amber-500" />}
        onClose={() => safeCloseDialog(() => onOpenChange(false))}
      />
      <BaseDialog.Body>
        <div className="space-y-4">
          <p className="text-[#737373] text-sm font-normal leading-relaxed">
            Deseja isentar os juros e a multa por atraso da parcela de{" "}
            <strong className="text-[#0a0a0a]">{mesAnoTexto}</strong> de{" "}
            <strong className="text-[#0a0a0a]">{alunoNome}</strong>?
          </p>

          <Banner
            variant="info"
            title="Como funciona a isenção?"
            description="O código Pix anterior será cancelado e um novo Pix com o valor original será emitido com vencimento para hoje. O responsável receberá a notificação no WhatsApp já com o botão para copiar o código Pix."
          />
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Voltar"
          variant="secondary"
          disabled={isentarMutation.isPending}
          onClick={() => safeCloseDialog(() => onOpenChange(false))}
        />
        <BaseDialog.Action
          label={isentarMutation.isPending ? "Processando..." : "Confirmar Isenção"}
          variant="primary"
          isLoading={isentarMutation.isPending}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
