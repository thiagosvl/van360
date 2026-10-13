import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useVirarAnoLetivo } from "@/hooks/api/useRenovacoes";
import { RenovacaoKPIs } from "@/types/renovacao";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { CalendarCheck2 } from "lucide-react";

interface ConfirmarViradaAnoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  anoDestino: number;
  kpis: RenovacaoKPIs;
  onSuccess?: () => void;
  onRevisarPendentes?: () => void;
}

export function ConfirmarViradaAnoDialog({
  isOpen,
  onClose,
  anoDestino,
  kpis,
  onSuccess,
}: ConfirmarViradaAnoDialogProps) {
  const virarAnoMutation = useVirarAnoLetivo();
  const { contadores } = kpis;
  const hasPendentes = contadores.pendentes > 0;

  const handleConfirm = async () => {
    await virarAnoMutation.mutateAsync({
      ano_destino: anoDestino,
    });
    onSuccess?.();
    safeCloseDialog(onClose);
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !virarAnoMutation.isPending && safeCloseDialog(onClose)}
      maxWidth="md"
      description={`Confirmação para inicialização e virada oficial do ano letivo de ${anoDestino}`}
    >
      <BaseDialog.Header
        title={`Iniciar Ano Letivo ${anoDestino}`}
        subtitle="Efetivação de alunos e transição para o novo período letivo"
        icon={<CalendarCheck2 className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={virarAnoMutation.isPending}
      />

      <BaseDialog.Body className="space-y-4 px-4 py-4 sm:px-6">
        {hasPendentes ? (
          <Banner
            variant="warning"
            title={`Ainda existem ${contadores.pendentes} aluno(s) pendente(s)`}
            description={`Os alunos pendentes não serão promovidos para ${anoDestino} até que sejam confirmados ou desligados.`}
          />
        ) : (
          <Banner
            variant="success"
            title="Tudo pronto para a virada de ano!"
            description={`Todas as vagas foram respondidas. Os alunos confirmados serão ativados para o ano letivo de ${anoDestino}.`}
          />
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3">
            <span className="text-xl font-bold tracking-tight text-[#0a0a0a] block">
              {contadores.confirmados}
            </span>
            <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block mt-0.5">
              Confirmados
            </span>
          </div>

          <div className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3">
            <span className="text-xl font-bold tracking-tight text-[#737373] block">
              {contadores.saidas}
            </span>
            <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block mt-0.5">
              Saídas
            </span>
          </div>

          <div className="rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3">
            <span className="text-xl font-bold tracking-tight text-[#0a0a0a] block">
              {contadores.pendentes}
            </span>
            <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block mt-0.5">
              Pendentes
            </span>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={virarAnoMutation.isPending}
        />
        <BaseDialog.Action
          label={`Iniciar ${anoDestino}`}
          variant="primary"
          onClick={handleConfirm}
          isLoading={virarAnoMutation.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
