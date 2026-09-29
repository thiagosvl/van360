import { useState } from "react";
import {
  Send,
  Calendar,
  DollarSign,
  User,
  Phone,
  Mail,
  GraduationCap,
  Clock,
} from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/button";
import { useDispatchPassengerCobrancaAdmin } from "@/hooks/api/adminHooks";
import { AdminUserPassengerItem } from "@/services/api/admin.api";
import { formatCurrency } from "@/utils/formatters/currency";
import { phoneMask } from "@/utils/masks";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AdminPassengerSendCobrancaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  passageiro: AdminUserPassengerItem;
  motoristaNome?: string;
}

function getSituacaoVencimento(dataVencimentoStr: string) {
  const cleanDate = dataVencimentoStr.split("T")[0];
  const [anoVenc, mesVenc, diaVenc] = cleanDate.split("-").map(Number);
  const now = new Date();
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const venc = new Date(anoVenc, mesVenc - 1, diaVenc);

  const diffMs = venc.getTime() - hoje.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    return {
      texto: `Vence em ${diffDays} ${diffDays === 1 ? "dia" : "dias"}`,
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    };
  }
  if (diffDays === 0) {
    return {
      texto: "Vence hoje",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    };
  }
  const diasAtraso = Math.abs(diffDays);
  return {
    texto: `Atrasada há ${diasAtraso} ${diasAtraso === 1 ? "dia" : "dias"}`,
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };
}

function formatarDataVencimento(dataVencimentoStr: string) {
  const cleanDate = dataVencimentoStr.split("T")[0];
  const [ano, mes, dia] = cleanDate.split("-");
  return `${dia}/${mes}/${ano}`;
}

export default function AdminPassengerSendCobrancaDialog({
  isOpen,
  onClose,
  userId,
  passageiro,
  motoristaNome,
}: AdminPassengerSendCobrancaDialogProps) {
  const dispatchMutation = useDispatchPassengerCobrancaAdmin(userId);
  const [force, setForce] = useState(false);

  const cobranca = passageiro.cobranca_mes_atual;
  const resp = passageiro.responsavel_principal;
  const situacao = cobranca?.data_vencimento
    ? getSituacaoVencimento(cobranca.data_vencimento)
    : null;

  const handleConfirm = async () => {
    try {
      await dispatchMutation.mutateAsync({
        passengerId: passageiro.id,
        cobrancaId: cobranca?.id,
        force,
      });
      safeCloseDialog(onClose);
    } catch {
    }
  };

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          safeCloseDialog(onClose);
        }
      }}
      maxWidth="md"
      description="Confirmação de envio forçado do lembrete de cobrança"
    >
      <AdminBaseDialog.Header
        title="Forçar Lembrete de Cobrança"
        subtitle="Disparo da parcela do mês para o responsável"
        icon={<Send className="h-5 w-5" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <AdminBaseDialog.Body className="space-y-4">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-2.5">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-blue-400" />
            Carteirinha do Aluno
          </span>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-headline font-bold text-white leading-tight">
                {passageiro.nome}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                <GraduationCap className="h-3 w-3 text-purple-400" />
                <span>{passageiro.escolas?.nome || "Escola não informada"}</span>
                {passageiro.turno && <span>• Turno {passageiro.turno}</span>}
              </div>
            </div>
            {motoristaNome && (
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-slate-500 block">
                  Motorista
                </span>
                <span className="text-xs font-semibold text-slate-300 block">
                  {motoristaNome}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Responsável:</span>
              <span className="text-slate-200 font-semibold">
                {resp?.nome || "Não informado"}
                {resp?.parentesco ? ` (${resp.parentesco})` : ""}
              </span>
            </div>
            {resp?.telefone && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  WhatsApp:
                </span>
                <span className="text-emerald-400 font-mono font-bold">
                  {phoneMask(resp.telefone)}
                </span>
              </div>
            )}
            {resp?.email && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" />
                  E-mail:
                </span>
                <span className="text-slate-300 font-mono">
                  {resp.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {cobranca && (
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-left space-y-3">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              Parcela de Cobrança ({cobranca.mes}/{cobranca.ano})
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Valor da Parcela
                </span>
                <span className="text-base font-black text-emerald-400 font-headline mt-0.5 block">
                  {formatCurrency(Number(cobranca.valor))}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Data de Vencimento
                </span>
                <span className="text-xs font-bold text-slate-200 mt-0.5 block flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-blue-400" />
                  {formatarDataVencimento(cobranca.data_vencimento)}
                </span>
              </div>
            </div>

            {situacao && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-slate-400" />
                  Situação temporal:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${situacao.badgeClass}`}>
                  {situacao.texto}
                </span>
              </div>
            )}

            {cobranca.data_envio_ultima_notificacao && (
              <div className="text-[10px] text-slate-400 italic pt-1">
                Último envio registrado em: {formatarDataVencimento(cobranca.data_envio_ultima_notificacao)}
              </div>
            )}
          </div>
        )}

        <Banner
          variant="warning"
          title="Envio Imediato e Real"
          description="A notificação será disparada imediatamente ao WhatsApp do responsável em nome do motorista, atualizando o registro de último envio."
        />

        {cobranca?.desativar_lembretes && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span className="text-[11px]">
              Lembretes automáticos estão desativados nesta cobrança.
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 h-4 w-4"
              />
              <span className="text-[11px]">Forçar mesmo assim</span>
            </label>
          </div>
        )}
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <Button
          type="button"
          variant="ghost"
          onClick={() => safeCloseDialog(onClose)}
          disabled={dispatchMutation.isPending}
          className="rounded-xl text-slate-400 hover:text-white"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={dispatchMutation.isPending || (!force && cobranca?.desativar_lembretes)}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <Send className="h-4 w-4" />
          {dispatchMutation.isPending ? "Disparando..." : "Enviar Lembrete Agora"}
        </Button>
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}
