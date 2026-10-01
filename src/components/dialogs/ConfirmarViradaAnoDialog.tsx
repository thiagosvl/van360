import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useVirarAnoLetivo } from "@/hooks/api/useRenovacoes";
import { RenovacaoKPIs } from "@/types/renovacao";
import { safeCloseDialog } from "@/utils/dialogUtils";

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
    >
      <BaseDialog.Header
        title={`Iniciar Ano Letivo ${anoDestino}`}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={virarAnoMutation.isPending}
      />

      <BaseDialog.Body className="space-y-4 pb-5">
        {hasPendentes ? (
          <Banner
            variant="warning"
            title={`Você ainda possui ${contadores.pendentes} passageiro(s) pendente(s)`}
            description={`Os alunos pendentes não serão promovidos para ${anoDestino} até que sejam confirmados ou desligados.`}
          />
        ) : (
          <Banner
            variant="success"
            title="Tudo pronto para a virada de ano!"
            description={`Todas as vagas foram respondidas. Os passageiros confirmados serão ativados para o ano letivo de ${anoDestino}.`}
          />
        )}

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-2.5">
            <div className="text-lg font-extrabold text-emerald-700">
              {contadores.confirmados}
            </div>
            <div className="text-[11px] font-semibold text-emerald-800">
              Confirmados
            </div>
          </div>

          <div className="rounded-xl bg-rose-50/80 border border-rose-200/80 p-2.5">
            <div className="text-lg font-extrabold text-rose-700">
              {contadores.saidas}
            </div>
            <div className="text-[11px] font-semibold text-rose-800">
              Saídas
            </div>
          </div>

          <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-2.5">
            <div className="text-lg font-extrabold text-amber-700">
              {contadores.pendentes}
            </div>
            <div className="text-[11px] font-semibold text-amber-800">
              Pendentes
            </div>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t border-slate-100">
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
        />
        <BaseDialog.Action
          label="Confirmar"
          variant="primary"
          onClick={handleConfirm}
          isLoading={virarAnoMutation.isPending}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
