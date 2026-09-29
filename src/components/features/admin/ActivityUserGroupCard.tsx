import { Link } from "react-router-dom";
import { Clock, Eye, FileText, Sparkles, Zap, Flame, ExternalLink } from "lucide-react";
import type { AdminUserGroupLogItem, AdminUserLogItem } from "@/services/api/admin/admin-log.api";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/formatters/date";
import { formatActivityDescription } from "@/utils/formatters/name";
import { phoneMask } from "@/utils/masks";
import { openBrowserLink } from "@/utils/browser";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getActionBadgeStyle } from "./ActivityLogsList";

interface ActivityUserGroupCardProps {
  userGroup: AdminUserGroupLogItem;
  onInspectLog: (log: AdminUserLogItem) => void;
  onOpenDetails: (userGroup: AdminUserGroupLogItem) => void;
  isFirst?: boolean;
}

export function ActivityUserGroupCard({
  userGroup,
  onInspectLog,
  onOpenDetails,
  isFirst = false,
}: ActivityUserGroupCardProps) {
  const displayName = userGroup.usuario_apelido?.trim() || userGroup.usuario_nome?.trim() || "Usuário";
  const fullName = userGroup.usuario_apelido && userGroup.usuario_nome ? userGroup.usuario_nome : null;
  const cleanPhone = userGroup.usuario_telefone?.replace(/\D/g, "");
  const activities = userGroup.ultimas_atividades || [];
  const latestLog = activities.length > 0 ? activities[0] : null;
  const secondaryLogs = activities.slice(1);

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!cleanPhone) return;
    openBrowserLink(`https://wa.me/55${cleanPhone}`);
  };

  const isHighVolume = userGroup.total_atividades >= 50;

  return (
    <div
      className={`p-4 rounded-3xl bg-slate-900/90 border transition-all space-y-3.5 text-left ${
        isFirst
          ? "border-blue-500/50 shadow-xl shadow-blue-500/5 bg-[#121a2d]"
          : "border-slate-800/80 hover:border-slate-700/80 shadow-md"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-headline font-black text-sm shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userGroup.usuario_id}`}
                className="text-sm font-bold text-white hover:text-blue-400 hover:underline transition-colors truncate"
              >
                {displayName}
              </Link>
              {cleanPhone && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleWhatsApp}
                  className="h-6 px-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors text-[10px] font-mono flex items-center gap-1"
                  title="Chamar no WhatsApp"
                >
                  <WhatsAppIcon className="h-3 w-3" />
                  <span className="hidden md:inline">{phoneMask(userGroup.usuario_telefone || "")}</span>
                </Button>
              )}
            </div>
            {fullName && (
              <p className="text-[11px] text-slate-400 truncate">
                {fullName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between sm:justify-end">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
              isHighVolume
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-blue-500/15 text-blue-300 border-blue-500/30"
            }`}
          >
            {isHighVolume ? <Flame className="h-3.5 w-3.5 text-amber-400" /> : <Zap className="h-3.5 w-3.5 text-blue-400" />}
            <span>{userGroup.total_atividades} {userGroup.total_atividades === 1 ? "atividade" : "atividades"}</span>
          </span>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenDetails(userGroup)}
            className="h-8 rounded-xl border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors px-3"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Ver detalhes</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2.5">
        {latestLog && (
          <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-500/40 shadow-sm relative space-y-2.5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${getActionBadgeStyle(
                      latestLog.acao
                    )}`}
                  >
                    {latestLog.acao.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-100 leading-relaxed break-words">
                  {formatActivityDescription(latestLog.descricao)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInspectLog(latestLog)}
                className="h-7 px-2.5 bg-blue-600 text-white hover:bg-blue-500 rounded-lg shadow-sm flex items-center gap-1 shrink-0 text-[10px] font-black uppercase tracking-wider"
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">INSPECIONAR</span>
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-500/20 text-[11px] font-mono text-blue-300">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" />
                {formatRelativeTime(latestLog.created_at)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">
                Última atividade
              </span>
            </div>
          </div>
        )}

        {secondaryLogs.map((log) => (
          <div
            key={log.id}
            className="p-2.5 sm:px-3 sm:py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:bg-slate-950/90 transition-colors text-left"
          >
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-400 shrink-0">
              <Clock className="h-3 w-3 text-slate-500" />
              {formatRelativeTime(log.created_at)}
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs text-slate-200 truncate">
                {formatActivityDescription(log.descricao)}
              </p>
              <div className="flex items-center gap-2 sm:hidden">
                <span className="text-[10px] font-mono text-slate-400">
                  {formatRelativeTime(log.created_at)}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border ${getActionBadgeStyle(
                    log.acao
                  )}`}
                >
                  {log.acao.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getActionBadgeStyle(
                  log.acao
                )}`}
              >
                {log.acao.replace(/_/g, " ")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInspectLog(log)}
                className="h-6 w-6 p-0 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white"
                title="Inspecionar atividade"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {userGroup.total_atividades > 5 && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800/60 text-xs text-slate-400">
          <span>Mostrando as 5 atividades mais recentes ({userGroup.total_atividades} no total).</span>
          <Button
            type="button"
            variant="link"
            size="sm"
            onClick={() => onOpenDetails(userGroup)}
            className="h-auto p-0 text-blue-400 hover:text-blue-300 font-bold text-xs"
          >
            Ver todas as {userGroup.total_atividades} atividades →
          </Button>
        </div>
      )}
    </div>
  );
}
