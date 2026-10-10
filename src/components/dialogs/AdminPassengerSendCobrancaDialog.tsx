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
        title="Forçar lembrete de cobrança"
        subtitle="Disparo da parcela do mês para o responsável"
        icon={<Send className="h-5 w-5 text-primary" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <AdminBaseDialog.Body className="space-y-4">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border text-left space-y-2.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            Carteirinha do aluno
          </span>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                {passageiro.nome}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                <GraduationCap className="h-3 w-3 text-purple-400" />
                <span>{passageiro.escolas?.nome || "Escola não informada"}</span>
                {passageiro.turno && <span>• Turno {passageiro.turno}</span>}
              </div>
            </div>
            {motoristaNome && (
              <div className="text-right">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Motorista
                </span>
                <span className="text-xs font-semibold text-foreground block">
                  {motoristaNome}
                </span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-border flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Responsável:</span>
              <span className="text-foreground font-semibold">
                {resp?.nome || "Não informado"}
                {resp?.parentesco ? ` (${resp.parentesco})` : ""}
              </span>
            </div>
            {resp?.telefone && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Phone className="h-3 w-3 text-emerald-400" />
                  WhatsApp:
                </span>
                <span className="text-emerald-400 font-mono font-semibold">
                  {phoneMask(resp.telefone)}
                </span>
              </div>
            )}
            {resp?.email && (
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  E-mail:
                </span>
                <span className="text-foreground font-mono">
                  {resp.email}
                </span>
              </div>
            )}
          </div>
        </div>

        {cobranca && (
          <div className="p-3.5 sm:p-4 rounded-2xl bg-secondary/30 border border-border text-left space-y-3">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              Parcela de cobrança ({cobranca.mes}/{cobranca.ano})
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Valor da parcela
                </span>
                <span className="text-sm sm:text-base font-bold text-emerald-400 font-headline mt-0.5 block">
                  {formatCurrency(Number(cobranca.valor))}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-card border border-border">
                <span className="text-[10px] font-medium text-muted-foreground block">
                  Data de vencimento
                </span>
                <span className="text-xs font-semibold text-foreground mt-0.5 block flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  {formatarDataVencimento(cobranca.data_vencimento)}
                </span>
              </div>
            </div>

            {situacao && (
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-muted-foreground text-[11px] font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  Situação temporal:
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${situacao.badgeClass}`}>
                  {situacao.texto}
                </span>
              </div>
            )}

            {cobranca.data_envio_ultima_notificacao && (
              <div className="text-[10px] text-muted-foreground italic pt-1">
                Último envio registrado em: {formatarDataVencimento(cobranca.data_envio_ultima_notificacao)}
              </div>
            )}
          </div>
        )}

        <Banner
          variant="warning"
          title="Envio imediato e real"
          description="A notificação será disparada imediatamente ao WhatsApp do responsável em nome do motorista, atualizando o registro de último envio."
        />

        {cobranca?.desativar_lembretes && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span className="text-[11px]">
              Lembretes automáticos estão desativados nesta cobrança.
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold">
              <input
                type="checkbox"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
                className="rounded border-border bg-card text-amber-500 focus:ring-amber-500 h-4 w-4"
              />
              <span className="text-[11px]">Forçar mesmo assim</span>
            </label>
          </div>
        )}
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={() => safeCloseDialog(onClose)}
          disabled={dispatchMutation.isPending}
        />
        <AdminBaseDialog.Action
          label={dispatchMutation.isPending ? "Disparando..." : "Enviar lembrete agora"}
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          onClick={handleConfirm}
          isLoading={dispatchMutation.isPending}
          disabled={dispatchMutation.isPending || (!force && cobranca?.desativar_lembretes)}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}
