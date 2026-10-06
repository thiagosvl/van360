import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { useNotificarLoteRenovacao } from "@/hooks/api/useRenovacoes";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatarTelefone } from "@/utils/formatters/phone";
import { formatShortName } from "@/utils/formatters";
import { Loader2, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface ConfirmarDisparoWabaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiros: RenovacaoPassageiroItem[];
  anoDestino: number;
  onSuccess?: () => void;
}

export function ConfirmarDisparoWabaDialog({
  isOpen,
  onClose,
  passageiros,
  anoDestino,
  onSuccess,
}: ConfirmarDisparoWabaDialogProps) {
  const notificarMutation = useNotificarLoteRenovacao();
  const [isSending, setIsSending] = useState(false);

  const aptos = passageiros.filter(
    (p) => Boolean(p.responsavel_principal?.telefone) && !p.notificacao_enviada_em
  );
  const jaNotificados = passageiros.filter(
    (p) => Boolean(p.responsavel_principal?.telefone) && Boolean(p.notificacao_enviada_em)
  );
  const semTelefone = passageiros.filter((p) => !p.responsavel_principal?.telefone);

  const handleConfirm = async () => {
    if (aptos.length === 0 || isSending) return;
    setIsSending(true);

    try {
      const ids = aptos.map((p) => p.passageiro_id);
      await notificarMutation.mutateAsync({
        anoDestino,
        passageiroIds: ids,
      });

      toast.success(`${aptos.length} mensagem(ns) de renovação disparada(s) com sucesso!`);
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Ocorreu uma falha ao disparar as notificações.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={() => !isSending && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Disparar WhatsApp de Renovação"
        icon={<WhatsAppIcon className="w-5 h-5 text-emerald-600 fill-current" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSending}
      />

      <BaseDialog.Body className="space-y-4 pb-4">
        <Banner
          variant="info"
          title="Notificação Oficial de Renovação"
          description={`Cada responsável receberá via WhatsApp o link exclusivo para visualizar as condições e confirmar a vaga para ${anoDestino}.`}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3">
            <div className="flex items-center gap-1.5 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold">Com WhatsApp</span>
            </div>
            <span className="text-lg font-bold text-emerald-900 mt-1 block">
              {aptos.length} {aptos.length === 1 ? "aluno" : "alunos"}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="text-xs font-semibold">Total Selecionado</span>
            </div>
            <span className="text-lg font-bold text-slate-900 mt-1 block">
              {passageiros.length} {passageiros.length === 1 ? "aluno" : "alunos"}
            </span>
          </div>
        </div>

        {semTelefone.length > 0 && (
          <Banner
            variant="warning"
            title={`${semTelefone.length} aluno(s) sem telefone cadastrado`}
            description="Esses alunos serão ignorados no envio. Você pode atualizar o contato na carteirinha do aluno."
          />
        )}

        {jaNotificados.length > 0 && (
          <Banner
            variant="info"
            title={`${jaNotificados.length} aluno(s) já notificado(s) anteriormente`}
            description="Para evitar cobrança de envio em duplicidade, esses alunos foram desconsiderados do disparo em lote. Você pode reenviar manualmente pelo WhatsApp individualmente no card de cada um."
          />
        )}

        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Destinatários ({aptos.length})
          </span>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50">
            {aptos.map((p) => {
              const shortName = formatShortName(p.nome, true);
              const tel = p.responsavel_principal?.telefone || "";
              return (
                <div
                  key={p.passageiro_id}
                  className="flex items-center justify-between px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-slate-800 truncate mr-2">
                    {shortName}
                  </span>
                  <span className="text-slate-500 font-mono shrink-0">
                    {formatarTelefone(tel)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
          disabled={isSending}
          className="w-full sm:w-auto h-10 px-4 rounded-xl border-slate-200 text-slate-700 font-bold text-xs"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={aptos.length === 0 || isSending}
          className="w-full sm:flex-1 h-10 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm gap-2 active:scale-98 transition-all"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <WhatsAppIcon className="w-4 h-4 fill-current text-white" />
          )}
          <span>
            {isSending
              ? "Disparando mensagens..."
              : `Disparar para ${aptos.length} ${aptos.length === 1 ? "aluno" : "alunos"}`}
          </span>
        </Button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
