import { BaseDialog } from "@/components/ui/BaseDialog";
import { Switch } from "@/components/ui/switch";
import { Passageiro } from "@/types/passageiro";
import { formatFirstName } from "@/utils/formatters";
import { formatCurrency } from "@/utils/formatters/currency";
import { useCreateContrato, useSubstituirContrato } from "@/hooks/api/useContratos";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const createContrato = useCreateContrato();
  const substituirContrato = useSubstituirContrato();

  const isSubmitting = createContrato.isPending || substituirContrato.isPending;

  const cachedPassageiro = passageiro?.id ? queryClient.getQueryData<Passageiro>(["passageiro", passageiro.id]) : null;
  const currentPassageiro = cachedPassageiro || passageiro;

  const valorExibicao = valorMensal ?? (currentPassageiro?.valor_cobranca ? Number(currentPassageiro.valor_cobranca) : undefined);
  const diaExibicao = diaVencimento ?? currentPassageiro?.dia_vencimento ?? undefined;
  const firstName = formatFirstName(currentPassageiro?.nome || "");

  const responsavelNome =
    currentPassageiro?.responsavel_principal?.nome ||
    currentPassageiro?.responsaveis?.[0]?.nome ||
    null;

  const handleClose = () => {
    safeCloseDialog(() => onOpenChange(false));
  };

  const handleConfirm = async () => {
    if (!currentPassageiro?.id) return;

    try {
      if (isSubstituicao) {
        const idAlvo = contratoIdParaSubstituir || currentPassageiro.contrato_id;
        if (!idAlvo) return;
        await substituirContrato.mutateAsync({
          contratoId: idAlvo,
          notificarResponsavel,
        });
      } else {
        await createContrato.mutateAsync({
          passageiroId: currentPassageiro.id,
          valorMensal: valorExibicao,
          diaVencimento: diaExibicao ? Number(diaExibicao) : undefined,
          dataInicio: dataInicio || currentPassageiro.data_inicio_transporte || undefined,
          dataFim: dataFim || currentPassageiro.data_fim_transporte || undefined,
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
    : (notificarResponsavel ? "Gerar e Enviar" : "Gerar Contrato");

  return (
    <BaseDialog open={open} onOpenChange={onOpenChange} lockClose={isSubmitting} maxWidth="md">
      <BaseDialog.Header
        title={dialogTitle}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <div className="space-y-3.5">
          <div className="p-4 rounded-[20px] bg-[#fafafa] border border-[#e5e5e5] flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold truncate text-[#0a0a0a] leading-tight">
                {currentPassageiro?.nome}
              </h4>
              {responsavelNome && (
                <p className="text-xs text-[#737373] truncate mt-1 font-normal">
                  {responsavelNome}
                </p>
              )}
            </div>
            {valorExibicao !== undefined && (
              <div className="text-right shrink-0">
                <span className="text-xs font-semibold text-[#0a0a0a] block">
                  {formatCurrency(valorExibicao)}
                </span>
                {diaExibicao && (
                  <span className="text-[11px] text-[#737373] block mt-0.5">
                    Venc. dia {diaExibicao}
                  </span>
                )}
              </div>
            )}
          </div>

          <div
            className="flex items-center justify-between rounded-[20px] bg-white border border-[#e5e5e5] p-4 transition-all hover:bg-[#fafafa] cursor-pointer shadow-xs select-none gap-4"
            onClick={() => !isSubmitting && setNotificarResponsavel((prev) => !prev)}
          >
            <div className="space-y-0.5 pr-2 flex-1 min-w-0">
              <span className="text-sm font-semibold text-[#0a0a0a] block">
                Enviar para os pais no WhatsApp
              </span>
              <p className="text-xs text-[#737373] leading-relaxed">
                {notificarResponsavel
                  ? "O responsável receberá o link de assinatura automaticamente no WhatsApp."
                  : "O contrato será gerado, mas você terá que enviar o link manualmente para o responsável."}
              </p>
            </div>
            <Switch
              checked={notificarResponsavel}
              onCheckedChange={setNotificarResponsavel}
              disabled={isSubmitting}
              className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-[#e5e5e5] shrink-0"
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
