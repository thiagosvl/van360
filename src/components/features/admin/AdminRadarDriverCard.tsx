import { Link } from "react-router-dom";
import { Clock, Eye, Calendar, Mail, Phone, ExternalLink } from "lucide-react";
import { type MotoristaLatestActivityItem } from "@/services/api/admin/admin-user.api";
import { ROUTES } from "@/constants/routes";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { phoneMask } from "@/utils/masks";
import { formatRelativeTime } from "@/utils/formatters";
import { openBrowserLink } from "@/utils/browser";

interface AdminRadarDriverCardProps {
  driver: MotoristaLatestActivityItem;
}

function formatDateBR(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTimeBR(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AdminRadarDriverCard({ driver }: AdminRadarDriverCardProps) {
  const hasActivity = Boolean(driver.ultima_atividade_at);
  const cleanPhone = driver.telefone?.replace(/\D/g, "");

  let badgeBg = "bg-slate-800 text-slate-400 border-slate-700";
  let badgeText = `Sem atividade (${driver.dias_inativo}d)`;

  if (hasActivity) {
    if (driver.dias_inativo <= 2) {
      badgeBg = "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      badgeText = `Ativo • ${formatRelativeTime(driver.ultima_atividade_at!)}`;
    } else if (driver.dias_inativo <= 7) {
      badgeBg = "bg-amber-500/15 text-amber-400 border-amber-500/30";
      badgeText = `Alerta • ${driver.dias_inativo}d sem uso`;
    } else {
      badgeBg = "bg-rose-500/15 text-rose-400 border-rose-500/30";
      badgeText = `Em Risco • ${driver.dias_inativo}d sem uso`;
    }
  }

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanPhone) return;
    const url = `https://wa.me/55${cleanPhone}`;
    openBrowserLink(url);
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all hover:bg-slate-900/95 shadow-md flex flex-col justify-between gap-3 text-left">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${driver.id}`}
                className="text-sm font-bold text-white hover:text-blue-400 hover:underline transition-colors break-words flex items-center gap-1.5"
              >
                <span>{driver.nome}</span>
                <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
              </Link>
              {driver.apelido && (
                <span className="text-xs text-slate-400 font-medium">
                  ({driver.apelido})
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
              <div className="flex items-center gap-1 font-mono">
                <Phone className="h-3 w-3 text-slate-500" />
                <span>{phoneMask(driver.telefone)}</span>
              </div>
              {driver.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-500" />
                  <span className="truncate max-w-[200px]">{driver.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <Calendar className="h-3 w-3 text-slate-500" />
                <span>Cadastrado em {formatDateBR(driver.cadastrado_em)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
            <SubscriptionStatusBadge
              status={driver.assinatura_status}
              dataVencimento={driver.assinatura_vencimento}
              className="text-[10px] px-2.5 py-0.5"
            />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}
            >
              {badgeText}
            </span>
          </div>
        </div>

        {hasActivity ? (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {driver.ultima_acao?.replace(/_/g, " ")}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400" title={formatDateTimeBR(driver.ultima_atividade_at!)}>
                <Clock className="h-3 w-3 text-slate-500" />
                {formatDateTimeBR(driver.ultima_atividade_at!)}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed break-words">
              {driver.ultima_descricao}
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800/50">
            <p className="text-xs text-slate-500 italic">
              Nenhuma ação registrada desde o cadastro em {formatDateBR(driver.cadastrado_em)}.
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 gap-2 flex-wrap">
        <div className="text-[11px] text-slate-500 font-mono">
          Inativo há: <strong className="text-slate-300">{driver.dias_inativo} dias</strong>
        </div>

        <div className="flex items-center gap-2">
          {cleanPhone && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleWhatsApp}
              className="h-8 px-3 rounded-xl border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white text-xs font-bold gap-1.5 transition-all"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </Button>
          )}

          <Link to={`${ROUTES.PRIVATE.ADMIN.USERS}/${driver.id}`}>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 transition-all shadow-md shadow-blue-600/20"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ver Carteirinha</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
