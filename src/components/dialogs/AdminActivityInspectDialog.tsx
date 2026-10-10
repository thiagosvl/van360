import { Link } from "react-router-dom";
import { FileText } from "lucide-react";
import type { AdminUserLogItem } from "@/services/api/admin/admin-log.api";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/utils/notifications/toast";
import { ROUTES } from "@/constants/routes";
import { phoneMask } from "@/utils/masks";
import { formatActivityDescription } from "@/utils/formatters/name";
import { getActionBadgeStyle } from "@/components/features/admin/ActivityLogsList";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { useLayout } from "@/contexts/LayoutContext";

interface AdminActivityInspectDialogProps {
  log: AdminUserLogItem | null;
  onClose: () => void;
}

export function AdminActivityInspectDialog({ log, onClose }: AdminActivityInspectDialogProps) {
  const { openImageFullscreen } = useLayout();
  if (!log) return null;

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  return (
    <AdminBaseDialog
      open={!!log}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      maxWidth="lg"
    >
      <AdminBaseDialog.Header
        title="Detalhes da atividade"
        subtitle="Informações registradas no sistema"
        icon={<FileText className="w-5 h-5 text-primary" />}
        onClose={handleClose}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3 bg-secondary/30 p-3.5 rounded-xl border border-border">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Ação</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border mt-1 ${getActionBadgeStyle(
                  log.acao
                )}`}
              >
                {log.acao.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Entidade</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-foreground border border-border mt-1">
                {log.entidade_tipo}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-secondary/30 rounded-xl border border-border space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground">Usuário / autor</p>
            {log.usuarios ? (
              <div className="flex items-center gap-3">
                {log.usuarios.logo_url?.trim() && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      openImageFullscreen({
                        imageUrl: log.usuarios!.logo_url!,
                        alt: log.usuarios?.nome || "Logo",
                      });
                    }}
                    className="h-12 w-12 rounded-xl bg-card border border-border p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-xs cursor-pointer"
                    title="Visualizar logo"
                  >
                    <img
                      src={log.usuarios.logo_url}
                      alt={log.usuarios.nome}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">
                    {log.usuario_id || log.usuarios?.id ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${log.usuario_id || log.usuarios?.id}`}
                        className="hover:text-primary hover:underline transition-colors"
                        onClick={onClose}
                      >
                        {log.usuarios.apelido || log.usuarios.nome}
                      </Link>
                    ) : (
                      log.usuarios.apelido || log.usuarios.nome
                    )}
                  </p>
                  {log.usuarios.apelido && log.usuarios.nome && (
                    <p className="text-xs text-muted-foreground">Nome: {log.usuarios.nome}</p>
                  )}
                  {log.usuarios.email && (
                    <p className="text-xs text-muted-foreground">{log.usuarios.email}</p>
                  )}
                  {log.usuarios.telefone && (
                    <p className="text-xs font-mono text-muted-foreground">{phoneMask(log.usuarios.telefone)}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground font-semibold">Sistema</p>
            )}
          </div>

          <div className="p-3.5 bg-secondary/30 rounded-xl border border-border space-y-1">
            <p className="text-[10px] font-medium text-muted-foreground">Descrição da ação</p>
            <p className="text-xs font-medium text-foreground leading-relaxed break-words">
              {formatActivityDescription(log.descricao)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-secondary/30 p-3.5 rounded-xl border border-border">
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Data e hora</p>
              <p className="text-xs font-mono font-semibold text-primary mt-0.5">
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-muted-foreground">Endereço IP</p>
              <p className="text-xs font-mono font-semibold text-foreground mt-0.5">{log.ip_address || "—"}</p>
            </div>
            {log.entidade_id && (
              <div className="sm:col-span-2 pt-2 border-t border-border">
                <p className="text-[10px] font-medium text-muted-foreground">ID da entidade</p>
                <p className="text-[11px] font-mono text-muted-foreground mt-0.5 break-all">{log.entidade_id}</p>
              </div>
            )}
          </div>

          {log.meta && Object.keys(log.meta).length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium text-muted-foreground">Metadados completos (JSON)</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(JSON.stringify(log.meta, null, 2));
                    toast.success("Metadados copiados para a área de transferência!");
                  }}
                  className="h-6 px-2 text-[10px] font-semibold text-primary hover:bg-secondary"
                >
                  Copiar JSON
                </Button>
              </div>
              <pre className="bg-card text-emerald-400 border border-border p-3.5 rounded-xl text-[11px] overflow-x-auto font-mono max-h-48 scrollbar-thin select-all leading-tight">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>
    </AdminBaseDialog>
  );
}
