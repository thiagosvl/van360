import { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { useNotificarLoteRenovacao } from "@/hooks/api/useRenovacoes";
import { RenovacaoPassageiroItem } from "@/types/renovacao";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatarTelefone } from "@/utils/formatters/phone";
import { useAppPreferences } from "@/hooks/business/useAppPreferences";
import { Loader2, Users, CheckCircle2 } from "lucide-react";
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
  const { formatAlunoNome } = useAppPreferences();
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
      description={`Disparo de propostas de renovação via WhatsApp para o ano letivo de ${anoDestino}`}
    >
      <BaseDialog.Header
        title="Disparar Propostas via WhatsApp"
        subtitle={`Envio de link exclusivo aos responsáveis para o ano letivo de ${anoDestino}`}
        icon={<WhatsAppIcon className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSending}
      />

      <BaseDialog.Body className="space-y-4 px-4 py-4 sm:px-6">
        <Banner
          variant="info"
          title="Notificação Oficial de Proposta"
          description={`Cada responsável receberá um link individual no WhatsApp para conferir os dados e confirmar a vaga para ${anoDestino}.`}
        />

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-3.5">
            <div className="flex items-center gap-1.5 text-[#0a0a0a]">
              <CheckCircle2 className="w-4 h-4 text-[#0a0a0a] shrink-0" />
              <span className="text-xs font-medium">Com WhatsApp</span>
            </div>
            <span className="text-xl font-bold text-[#0a0a0a] mt-1 block tracking-tight">
              {aptos.length} {aptos.length === 1 ? "aluno" : "alunos"}
            </span>
          </div>

          <div className="rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-3.5">
            <div className="flex items-center gap-1.5 text-[#737373]">
              <Users className="w-4 h-4 text-[#737373] shrink-0" />
              <span className="text-xs font-medium">Total Selecionado</span>
            </div>
            <span className="text-xl font-bold text-[#0a0a0a] mt-1 block tracking-tight">
              {passageiros.length} {passageiros.length === 1 ? "aluno" : "alunos"}
            </span>
          </div>
        </div>

        {semTelefone.length > 0 && (
          <Banner
            variant="warning"
            title={`${semTelefone.length} aluno(s) sem telefone`}
            description="Serão desconsiderados deste envio. Atualize o telefone na carteirinha do aluno para notificar."
          />
        )}

        {jaNotificados.length > 0 && (
          <Banner
            variant="info"
            title={`${jaNotificados.length} aluno(s) já notificado(s)`}
            description="Para evitar mensagens duplicadas, foram ignorados no lote. O reenvio pode ser feito individualmente no card do aluno."
          />
        )}

        <div className="space-y-2">
          <span className="text-[11px] font-medium text-[#737373] uppercase tracking-wider block">
            Destinatários ({aptos.length})
          </span>
          <div className="max-h-44 overflow-y-auto divide-y divide-[#e5e5e5] rounded-[18px] border border-[#e5e5e5] bg-[#fafafa]">
            {aptos.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#737373]">
                Nenhum aluno apto para envio nesta seleção.
              </div>
            ) : (
              aptos.map((p) => {
                const alunoNome = formatAlunoNome(p.nome);
                const tel = p.responsavel_principal?.telefone || "";
                return (
                  <div
                    key={p.passageiro_id}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                  >
                    <span className="font-semibold text-[#0a0a0a] truncate mr-2">
                      {alunoNome}
                    </span>
                    <span className="text-[#737373] font-mono shrink-0">
                      {formatarTelefone(tel)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={isSending}
        />
        <button
          type="button"
          onClick={handleConfirm}
          disabled={aptos.length === 0 || isSending}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-[18px] bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-white text-xs font-medium transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-xs"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <WhatsAppIcon className="w-4 h-4 fill-current text-white" />
          )}
          <span>
            {isSending
              ? "Disparando..."
              : `Disparar para ${aptos.length} ${aptos.length === 1 ? "aluno" : "alunos"}`}
          </span>
        </button>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
