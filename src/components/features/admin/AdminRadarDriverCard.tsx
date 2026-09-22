import { Link } from "react-router-dom";
import { type MotoristaLatestActivityItem } from "@/services/api/admin/admin-user.api";
import { ROUTES } from "@/constants/routes";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { formatRelativeTime, formatDateBR, formatDateTimeToBR } from "@/utils/formatters";
import { openBrowserLink } from "@/utils/browser";

interface AdminRadarDriverCardProps {
  driver: MotoristaLatestActivityItem;
}

export function AdminRadarDriverCard({ driver }: AdminRadarDriverCardProps) {
  const hasActivity = Boolean(driver.ultima_atividade_at);
  const cleanPhone = driver.telefone?.replace(/\D/g, "");
  const displayName = driver.apelido?.trim() || driver.nome;

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
    openBrowserLink(`https://wa.me/55${cleanPhone}`);
  };

  return (
    <div className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 transition-all hover:bg-slate-900/95 shadow-md flex flex-col gap-2 text-left">
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

      {hasActivity ? (
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/25 shrink-0">
              {driver.ultima_acao?.replace(/_/g, " ")}
            </span>
            <span
              className="text-xs text-slate-300 truncate"
              title={driver.ultima_descricao || ""}
            >
              {driver.ultima_descricao}
            </span>
          </div>
          <span
            className="text-[11px] font-mono text-slate-400 shrink-0"
            title={formatDateTimeToBR(driver.ultima_atividade_at!)}
          >
            {formatDateTimeToBR(driver.ultima_atividade_at!)}
          </span>
        </div>
      ) : (
        <div className="px-2.5 py-1.5 rounded-xl bg-slate-950/40 border border-slate-800/40">
          <p className="text-xs text-slate-500 italic">
            Nenhuma ação registrada desde o cadastro.
          </p>
        </div>
      )}
    </div>
  );
}
