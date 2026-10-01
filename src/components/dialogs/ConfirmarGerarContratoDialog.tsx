import { BaseDialog } from "@/components/ui/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { Passageiro } from "@/types/passageiro";
import { formatFirstName } from "@/utils/formatters";
import { useCreateContrato, useSubstituirContrato } from "@/hooks/api/useContratos";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { FileSignature, FileText } from "lucide-react";
import { useState } from "react";

export interface ConfirmarGerarContratoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  passageiro: Passageiro;
  valorMensal?: number;
  diaVencimento?: number;
  dataInicio?: string;
  dataFim?: string;
  isSubstituicao?: boolean;
  contratoIdParaSubstituir?: string;
  onSuccess?: () => void;
}

export function ConfirmarGerarContratoDialog({
  open,
  onOpenChange,
  passageiro,
  valorMensal,
  diaVencimento,
  dataInicio,
  dataFim,
  isSubstituicao = false,
  contratoIdParaSubstituir,
  onSuccess,
}: ConfirmarGerarContratoDialogProps) {
  const [notificarResponsavel, setNotificarResponsavel] = useState(true);
  const createContrato = useCreateContrato();
  const substituirContrato = useSubstituirContrato();

  const isSubmitting = createContrato.isPending || substituirContrato.isPending;

  const valorExibicao = valorMensal ?? (passageiro?.valor_cobranca ? Number(passageiro.valor_cobranca) : undefined);
  const diaExibicao = diaVencimento ?? passageiro?.dia_vencimento ?? undefined;
  const firstName = formatFirstName(passageiro.nome);

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleConfirm = async () => {
    if (!passageiro?.id) return;

    try {
      if (isSubstituicao) {
        const idAlvo = contratoIdParaSubstituir || passageiro.contrato_id;
        if (!idAlvo) return;
        await substituirContrato.mutateAsync({
          contratoId: idAlvo,
          notificarResponsavel,
        });
      } else {
        await createContrato.mutateAsync({
          passageiroId: passageiro.id,
          valorMensal: valorExibicao,
          diaVencimento: diaExibicao ? Number(diaExibicao) : undefined,
          dataInicio: dataInicio || passageiro.data_inicio_transporte || undefined,
          dataFim: dataFim || passageiro.data_fim_transporte || undefined,
          notificarResponsavel,
        });
      }

      handleClose();
      onSuccess?.();
    } catch { }
  };

  const dialogTitle = isSubstituicao ? "Substituir Contrato" : "Gerar Contrato";
  const actionLabel = isSubstituicao
    ? (notificarResponsavel ? "Substituir e Enviar" : "Apenas Substituir")
    : (notificarResponsavel ? "Gerar e Enviar" : "Apenas Gerar");

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={isSubmitting}>
      <BaseDialog.Header
        title={dialogTitle}
        icon={isSubstituicao ? <FileSignature className="w-5 h-5 opacity-80" /> : <FileText className="w-5 h-5 opacity-80" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 font-medium">
            {isSubstituicao
              ? `Confirme a atualização do contrato de ${firstName}.`
              : `Confirme a geração do contrato de ${firstName}.`}
          </p>

          <div
            className="flex flex-row items-center justify-between rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 shadow-2xs cursor-pointer select-none"
            onClick={() => !isSubmitting && setNotificarResponsavel((prev) => !prev)}
          >
            <div className="space-y-0.5 pr-4">
              <span className="text-slate-800 font-bold text-sm">
                Enviar para os pais no WhatsApp
              </span>
              <div className="text-xs text-slate-500 font-normal leading-relaxed">
                {notificarResponsavel
                  ? "Os pais receberão o link de assinatura assim que o contrato for gerado."
                  : "O contrato será gerado sem envio. Você poderá enviar aos pais quando preferir."}
              </div>
            </div>
            <Switch
              checked={notificarResponsavel}
              onCheckedChange={setNotificarResponsavel}
              disabled={isSubmitting}
              aria-label="Enviar para os pais no WhatsApp"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          label={actionLabel}
          onClick={handleConfirm}
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
