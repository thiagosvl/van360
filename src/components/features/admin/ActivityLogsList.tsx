import { useState } from "react";
import { Link } from "react-router-dom";
import { Terminal, Eye, FileText, Clock, Loader2 } from "lucide-react";
import { AdminUserLogItem } from "@/services/api/admin.api";
import { Button } from "@/components/ui/button";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { toast } from "@/utils/notifications/toast";
import { ROUTES } from "@/constants/routes";
import { AdminEmptyState } from "@/components/ui/AdminEmptyState";
import { phoneMask } from "@/utils/masks";
import { formatRelativeTime } from "@/utils/formatters/date";
import { formatActivityDescription } from "@/utils/formatters/name";
import { safeCloseDialog } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";

interface ActivityLogsListProps {
  logs: AdminUserLogItem[];
  isLoading?: boolean;
  hideUserColumn?: boolean;
  highlightFirst?: boolean;
}

export function getActionBadgeStyle(acao: string) {
  const normalized = acao.toUpperCase();
  if (normalized.includes("LOGIN") || normalized.includes("SESSAO")) {
    return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  }
  if (normalized.includes("CRIAR") || normalized.includes("CRIAD") || normalized.includes("CADASTRO") || normalized.includes("CADASTRAD") || normalized.includes("ADICIONAR")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  if (normalized.includes("PRINCIPAL")) {
    return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
  }
  if (normalized.includes("NOTIFICACAO")) {
    return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
  }
  if (normalized.includes("ATUALIZAR") || normalized.includes("ATUALIZAD") || normalized.includes("ALTERAR") || normalized.includes("ALTERAD") || normalized.includes("EDITAR") || normalized.includes("EDITAD") || normalized.includes("CONCEDER")) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  }
  if (normalized.includes("EXCLUIR") || normalized.includes("EXCLUID") || normalized.includes("DELETAR") || normalized.includes("DELETAD") || normalized.includes("CANCELAR") || normalized.includes("CANCELAD") || normalized.includes("RESETAR") || normalized.includes("RESETAD")) {
    return "bg-rose-500/15 text-rose-400 border-rose-500/30";
  }
  return "bg-purple-500/15 text-purple-400 border-purple-500/30";
}

export function ActivityLogsList({
  logs,
  isLoading,
  hideUserColumn = false,
  highlightFirst = true,
}: ActivityLogsListProps) {
  const { openImageFullscreen } = useLayout();
  const [selectedLog, setSelectedLog] = useState<AdminUserLogItem | null>(null);

  const handleCloseModal = () => {
    safeCloseDialog(() => setSelectedLog(null));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <AdminEmptyState
        icon={Terminal}
        title="Nenhum log de atividade encontrado"
        description="Não há registros de atividades registradas para este filtro de busca."
      />
    );
  }

  const latestLog = highlightFirst && logs.length > 0 ? logs[0] : null;
  const remainingLogs = highlightFirst ? logs.slice(1) : logs;

  const latestUserName = latestLog
    ? hideUserColumn
      ? latestLog.acao.replace(/_/g, " ")
      : (latestLog.usuarios?.apelido || latestLog.usuarios?.nome || latestLog.entidade_tipo)
    : "";
  const latestFullName = !hideUserColumn && latestLog?.usuarios?.apelido && latestLog?.usuarios?.nome && latestLog.usuarios.apelido !== latestLog.usuarios.nome
    ? latestLog.usuarios.nome
    : null;
  const latestLogoUrl = !hideUserColumn ? latestLog?.usuarios?.logo_url : null;

  return (
    <>
      <div className="space-y-3">
        {latestLog && (
          <div
            key={latestLog.id}
            className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative space-y-3 animate-in fade-in slide-in-from-top-3 duration-300 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {latestLogoUrl?.trim() && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageFullscreen({ imageUrl: latestLogoUrl, alt: latestUserName });
                    }}
                    className="h-10 w-10 rounded-lg bg-background border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                    title="Visualizar logo"
                  >
                    <img
                      src={latestLogoUrl}
                      alt={latestUserName}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 break-words">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse shrink-0" />
                    {!hideUserColumn && (latestLog.usuario_id || latestLog.usuarios?.id) ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${latestLog.usuario_id || latestLog.usuarios?.id}`}
                        className="hover:text-primary hover:underline transition-colors truncate"
                      >
                        {latestUserName}
                      </Link>
                    ) : (
                      <span className="truncate">{latestUserName}</span>
                    )}
                    {latestFullName && (
                      <span className="text-[11px] font-normal text-muted-foreground shrink-0">
                        ({latestFullName})
                      </span>
                    )}
                  </h4>
                  <p className="text-xs font-normal text-muted-foreground leading-relaxed break-words">
                    {formatActivityDescription(latestLog.descricao)}
                  </p>
                </div>
              </div>
              <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20 shrink-0">
                <FileText className="h-4 w-4" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-primary/15 gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium font-mono">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {formatRelativeTime(latestLog.created_at)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(latestLog)}
                className="h-8 px-3 rounded-lg flex items-center gap-1.5 shrink-0 bg-background border-border text-foreground hover:bg-secondary"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="text-xs font-medium hidden sm:inline">Inspecionar</span>
              </Button>
            </div>
          </div>
        )}

        {remainingLogs.map((log) => {
          const userId = log.usuario_id || log.usuarios?.id;
          const displayName = hideUserColumn
            ? log.acao.replace(/_/g, " ")
            : (log.usuarios?.apelido || log.usuarios?.nome || log.entidade_tipo);
          const fullName = !hideUserColumn && log.usuarios?.apelido && log.usuarios?.nome && log.usuarios.apelido !== log.usuarios.nome
            ? log.usuarios.nome
            : null;
          const logoUrl = !hideUserColumn ? log.usuarios?.logo_url : null;

          return (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-secondary/40 border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-4 transition-colors hover:bg-secondary/70"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-medium font-mono text-muted-foreground bg-background px-2.5 py-1 rounded-lg border border-border shrink-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatRelativeTime(log.created_at)}
                </span>

                {logoUrl?.trim() && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageFullscreen({ imageUrl: logoUrl, alt: displayName });
                    }}
                    className="h-10 w-10 rounded-lg bg-background border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                    title="Visualizar logo"
                  >
                    <img
                      src={logoUrl}
                      alt={displayName}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="space-y-1 md:space-y-0.5 min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between gap-2 md:block">
                    <h5 className="text-xs font-semibold text-foreground break-words md:truncate leading-tight flex items-center gap-1.5 flex-wrap">
                      {!hideUserColumn && userId ? (
                        <Link
                          to={`${ROUTES.PRIVATE.ADMIN.USERS}/${userId}`}
                          className="hover:text-primary hover:underline transition-colors"
                        >
                          {displayName}
                        </Link>
                      ) : (
                        <span>{displayName}</span>
                      )}
                      {fullName && (
                        <span className="text-[10px] font-normal text-muted-foreground">
                          ({fullName})
                        </span>
                      )}
                    </h5>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedLog(log)}
                      className="md:hidden h-7 px-2 text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 md:truncate leading-normal">
                    {formatActivityDescription(log.descricao)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
                <span className="md:hidden text-[10px] font-mono text-muted-foreground">
                  {formatRelativeTime(log.created_at)}
                </span>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedLog(log)}
                  className="hidden md:inline-flex h-8 px-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg text-xs gap-1.5 font-medium"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Detalhes</span>
                </Button>
              </div>
            </div>
          );
        })}

      </div>

      {selectedLog && (
        <AdminBaseDialog
          open={!!selectedLog}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
          maxWidth="lg"
        >
          <AdminBaseDialog.Header
            title="Detalhes da atividade"
            subtitle="Informações registradas no sistema"
            icon={<FileText className="w-5 h-5 text-primary" />}
            onClose={handleCloseModal}
          />
          <AdminBaseDialog.Body>
            <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-3.5 rounded-xl border border-border">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Ação</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-1 ${getActionBadgeStyle(selectedLog.acao)}`}>
                  {selectedLog.acao.replace(/_/g, " ")}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Entidade</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border mt-1">
                  {selectedLog.entidade_tipo}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-secondary/40 rounded-xl border border-border space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Usuário / Autor</p>
              {selectedLog.usuarios ? (
                <div className="flex items-center gap-3">
                  {selectedLog.usuarios.logo_url?.trim() && (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openImageFullscreen({
                          imageUrl: selectedLog.usuarios!.logo_url!,
                          alt: selectedLog.usuarios?.nome || "Logo",
                        });
                      }}
                      className="h-12 w-12 rounded-lg bg-background border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                      title="Visualizar logo"
                    >
                      <img
                        src={selectedLog.usuarios.logo_url}
                        alt={selectedLog.usuarios.nome}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {(selectedLog.usuario_id || selectedLog.usuarios?.id) ? (
                        <Link
                          to={`${ROUTES.PRIVATE.ADMIN.USERS}/${selectedLog.usuario_id || selectedLog.usuarios?.id}`}
                          className="hover:text-primary hover:underline transition-colors"
                          onClick={handleCloseModal}
                        >
                          {selectedLog.usuarios.apelido || selectedLog.usuarios.nome}
                        </Link>
                      ) : (
                        selectedLog.usuarios.apelido || selectedLog.usuarios.nome
                      )}
                    </p>
                    {selectedLog.usuarios.apelido && selectedLog.usuarios.nome && (
                      <p className="text-xs text-muted-foreground">Nome: {selectedLog.usuarios.nome}</p>
                    )}
                    {selectedLog.usuarios.email && (
                      <p className="text-xs font-medium text-muted-foreground">{selectedLog.usuarios.email}</p>
                    )}
                    {selectedLog.usuarios.telefone && (
                      <p className="text-xs font-mono text-muted-foreground">{phoneMask(selectedLog.usuarios.telefone)}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground font-medium">Sistema</p>
              )}
            </div>

            <div className="p-3.5 bg-secondary/40 rounded-xl border border-border space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Descrição da ação</p>
              <p className="text-xs font-normal text-foreground leading-relaxed break-words">{formatActivityDescription(selectedLog.descricao)}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/40 p-3.5 rounded-xl border border-border">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Data e hora</p>
                <p className="text-xs font-mono font-medium text-primary mt-0.5">
                  {new Date(selectedLog.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Endereço IP</p>
                <p className="text-xs font-mono font-medium text-foreground mt-0.5">{selectedLog.ip_address || "—"}</p>
              </div>
              {selectedLog.entidade_id && (
                <div className="sm:col-span-2 pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground">ID da entidade</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5 break-all">{selectedLog.entidade_id}</p>
                </div>
              )}
            </div>

            {selectedLog.meta && Object.keys(selectedLog.meta).length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Metadados completos (JSON)</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={async () => {
                      await navigator.clipboard.writeText(JSON.stringify(selectedLog.meta, null, 2));
                      toast.success("Metadados copiados para a área de transferência!");
                    }}
                    className="h-6 px-2 text-xs font-medium text-primary hover:bg-secondary"
                  >
                    Copiar JSON
                  </Button>
                </div>
                <pre className="bg-background text-emerald-400 border border-border p-3.5 rounded-xl text-xs overflow-x-auto font-mono max-h-48 scrollbar-thin select-all leading-tight">
                  {JSON.stringify(selectedLog.meta, null, 2)}
                </pre>
              </div>
            )}
          </AdminBaseDialog.Body>
        </AdminBaseDialog>
      )}
    </>
  );
}
