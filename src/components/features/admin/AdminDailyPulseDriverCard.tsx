import { Link } from "react-router-dom";
import { type MotoristaDailyPulseItem } from "@/services/api/admin/admin-user.api";
import { ROUTES } from "@/constants/routes";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { formatDateBR } from "@/utils/formatters";
import { openBrowserLink } from "@/utils/browser";
import { Clock, Repeat, Sparkles } from "lucide-react";

interface AdminDailyPulseDriverCardProps {
  driver: MotoristaDailyPulseItem;
}

export function AdminDailyPulseDriverCard({ driver }: AdminDailyPulseDriverCardProps) {
  const cleanPhone = driver.telefone?.replace(/\D/g, "");
  const displayName = driver.apelido?.trim() || driver.nome;
  const isNovo = driver.tipo_usuario_dia === "novo";

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanPhone) return;
    openBrowserLink(`https://wa.me/55${cleanPhone}`);
  };

  const formatHora = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all hover:bg-slate-900/95 shadow-md flex flex-col gap-2.5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <Link
            to={`${ROUTES.PRIVATE.ADMIN.USERS}/${driver.id}`}
            className="text-sm font-bold text-white hover:text-blue-400 hover:underline transition-colors truncate"
          >
            {displayName}
          </Link>
          <span className="text-xs text-slate-500 font-medium">
            • Cadastrado em {formatDateBR(driver.cadastrado_em)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {isNovo ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
              <Sparkles className="h-3 w-3" />
              Novo Cadastro
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border bg-sky-500/15 text-sky-400 border-sky-500/30">
              <Repeat className="h-3 w-3" />
              Recorrente (Veterano)
            </span>
          )}

          {driver.reengajou_no_dia && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border bg-purple-500/15 text-purple-300 border-purple-500/30">
              Reengajado
            </span>
          )}

          <SubscriptionStatusBadge
            status={driver.assinatura_status}
            dataVencimento={driver.assinatura_vencimento}
            className="text-[10px] px-2.5 py-0.5"
          />

          {cleanPhone && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleWhatsApp}
              className="h-6 w-6 p-0 rounded-lg border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors"
              title="Chamar no WhatsApp"
            >
              <WhatsAppIcon className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
            <Clock className="h-3 w-3 text-slate-500" />
            <span>
              1º acesso: <strong className="text-slate-200">{formatHora(driver.primeiro_acesso_dia)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Último: <strong className="text-slate-200">{formatHora(driver.ultimo_acesso_dia)}</strong>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            • <strong className="text-blue-400">{driver.total_atividades_dia}</strong> {driver.total_atividades_dia === 1 ? "ação registrada" : "ações registradas"}
          </span>
        </div>

        {driver.ultima_acao_dia && (
          <div className="flex items-center gap-1.5 min-w-0 max-w-full sm:max-w-[45%]">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0">
              {driver.ultima_acao_dia.replace(/_/g, " ")}
            </span>
            {driver.ultima_descricao_dia && (
              <span className="text-xs text-slate-400 truncate" title={driver.ultima_descricao_dia}>
                {driver.ultima_descricao_dia}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
