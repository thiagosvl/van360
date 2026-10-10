import { Link } from "react-router-dom";
import { Clock, Eye, FileText, Sparkles, Zap, Flame } from "lucide-react";
import type { AdminUserGroupLogItem, AdminUserLogItem } from "@/services/api/admin/admin-log.api";
import { Button } from "@/components/ui/button";
import { SubscriptionStatusBadge } from "@/components/ui/SubscriptionStatusBadge";
import { useLayout } from "@/contexts/LayoutContext";
import { ROUTES } from "@/constants/routes";
import { formatRelativeTime } from "@/utils/formatters/date";
import { formatActivityDescription } from "@/utils/formatters/name";
import { phoneMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";
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
  const { openImageFullscreen } = useLayout();
  const displayName = userGroup.usuario_apelido?.trim() || userGroup.usuario_nome?.trim() || "Usuário";
  const fullName = userGroup.usuario_apelido && userGroup.usuario_nome ? userGroup.usuario_nome : null;
  const cleanPhone = userGroup.usuario_telefone?.replace(/\D/g, "");
  const activities = userGroup.ultimas_atividades || [];
  const latestLog = activities.length > 0 ? activities[0] : null;
  const secondaryLogs = activities.slice(1, 3);

  const handleCopyPhone = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!userGroup.usuario_telefone) return;
    navigator.clipboard.writeText(phoneMask(userGroup.usuario_telefone));
    toast.success("Telefone copiado!");
  };

  const isHighVolume = userGroup.total_atividades >= 50;

  return (
    <div
      className={`p-4 rounded-xl bg-card border transition-all space-y-3.5 text-left ${
        isFirst
          ? "border-primary/50 shadow-sm"
          : "border-border hover:border-border/80 shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          {userGroup.usuario_logo_url?.trim() ? (
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                openImageFullscreen({ imageUrl: userGroup.usuario_logo_url!, alt: displayName });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  openImageFullscreen({ imageUrl: userGroup.usuario_logo_url!, alt: displayName });
                }
              }}
              className="h-10 w-10 rounded-lg bg-background border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
              title="Visualizar logo"
            >
              <img
                src={userGroup.usuario_logo_url}
                alt={displayName}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userGroup.usuario_id}`}
                className="text-sm font-semibold text-foreground hover:text-primary hover:underline transition-colors truncate"
              >
                {displayName}
              </Link>

              {userGroup.assinatura_status && (
                <SubscriptionStatusBadge
                  status={userGroup.assinatura_status}
                  className="text-[10px] px-2 py-0.5 shrink-0"
                />
              )}

              {userGroup.tipo_usuario === "novo" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shrink-0">
                  <Sparkles className="h-2.5 w-2.5" />
                  Novo
                </span>
              )}

              {cleanPhone && (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={handleCopyPhone}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleCopyPhone();
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[11px] font-mono cursor-pointer select-all shrink-0"
                  title="Clique para copiar o número"
                >
                  <WhatsAppIcon className="h-3 w-3 shrink-0" />
                  <span>{phoneMask(userGroup.usuario_telefone || "")}</span>
                </div>
              )}
            </div>
            {fullName && (
              <p className="text-xs text-muted-foreground truncate">
                {fullName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-between sm:justify-end">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isHighVolume
                ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {isHighVolume ? <Flame className="h-3.5 w-3.5 text-amber-400" /> : <Zap className="h-3.5 w-3.5 text-primary" />}
            <span>{userGroup.total_atividades} {userGroup.total_atividades === 1 ? "atividade" : "atividades"}</span>
          </span>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenDetails(userGroup)}
            className="h-8 rounded-lg border-primary/30 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-medium flex items-center gap-1.5 transition-colors px-3"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Ver detalhes</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {latestLog && (
          <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 shadow-xs relative space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${getActionBadgeStyle(
                      latestLog.acao
                    )}`}
                  >
                    {latestLog.acao.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-xs font-normal text-foreground leading-relaxed break-words">
                  {formatActivityDescription(latestLog.descricao)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInspectLog(latestLog)}
                className="h-7 px-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md shadow-xs flex items-center gap-1 shrink-0 text-xs font-medium border-transparent"
              >
                <Eye className="h-3 w-3" />
                <span className="hidden sm:inline">Inspecionar</span>
              </Button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-primary/15 text-[11px] font-mono text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                {formatRelativeTime(latestLog.created_at)}
              </span>
              <span className="text-[10px] text-muted-foreground font-sans font-medium">
                Última atividade
              </span>
            </div>
          </div>
        )}

        {secondaryLogs.map((log) => (
          <div
            key={log.id}
            className="p-2.5 sm:px-3 sm:py-2.5 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between gap-3 hover:bg-secondary/70 transition-colors text-left"
          >
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono font-medium text-muted-foreground shrink-0">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {formatRelativeTime(log.created_at)}
            </span>

            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-xs text-foreground truncate">
                {formatActivityDescription(log.descricao)}
              </p>
              <div className="flex items-center gap-2 sm:hidden">
                <span className="text-[10px] font-mono text-muted-foreground">
                  {formatRelativeTime(log.created_at)}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-medium border ${getActionBadgeStyle(
                    log.acao
                  )}`}
                >
                  {log.acao.replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`hidden md:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium border ${getActionBadgeStyle(
                  log.acao
                )}`}
              >
                {log.acao.replace(/_/g, " ")}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onInspectLog(log)}
                className="h-6 w-6 p-0 rounded-md bg-secondary text-primary hover:bg-primary hover:text-primary-foreground"
                title="Inspecionar atividade"
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
