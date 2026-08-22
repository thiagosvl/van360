import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Rocket, CheckCircle2, ListFilter } from "lucide-react";
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
  onRevisarPendentes,
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

  const handleRevisar = () => {
    safeCloseDialog(onClose);
    onRevisarPendentes?.();
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
        {/* Aviso de Validação dos Pendentes */}
        {hasPendentes ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-950">
                Você ainda possui {contadores.pendentes} passageiro(s) pendente(s)
              </span>
              <p className="text-amber-800">
                Os alunos pendentes <strong>não serão promovidos</strong> para {anoDestino} e continuarão com o ano base atual até que sejam confirmados ou desligados.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-950">
                Tudo pronto para a virada de ano!
              </span>
              <p className="text-emerald-800 mt-0.5">
                Todas as vagas foram respondidas. Os passageiros confirmados serão ativados para o ano letivo de {anoDestino}.
              </p>
            </div>
          </div>
        )}

        {/* Resumo dos Contadores */}
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
