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
        title="Detalhes da Atividade"
        subtitle="Informações registradas no sistema"
        icon={<FileText className="w-5 h-5 text-blue-400" />}
        onClose={handleClose}
      />
      <AdminBaseDialog.Body>
        <div className="space-y-3.5 text-left">
          <div className="grid grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Ação</p>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border mt-1 ${getActionBadgeStyle(
                  log.acao
                )}`}
              >
                {log.acao.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Entidade</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700/80 mt-1">
                {log.entidade_tipo}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Usuário / Autor</p>
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
                    className="h-12 w-12 rounded-xl bg-white border border-slate-700/50 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm cursor-pointer"
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
                  <p className="text-sm font-bold text-white uppercase">
                    {log.usuario_id || log.usuarios?.id ? (
                      <Link
                        to={`${ROUTES.PRIVATE.ADMIN.USERS}/${log.usuario_id || log.usuarios?.id}`}
                        className="hover:text-blue-400 hover:underline transition-colors"
                        onClick={onClose}
                      >
                        {log.usuarios.apelido || log.usuarios.nome}
                      </Link>
                    ) : (
                      log.usuarios.apelido || log.usuarios.nome
                    )}
                  </p>
                  {log.usuarios.apelido && log.usuarios.nome && (
                    <p className="text-xs text-slate-400">Nome: {log.usuarios.nome}</p>
                  )}
                  {log.usuarios.email && (
                    <p className="text-xs font-semibold text-slate-400">{log.usuarios.email}</p>
                  )}
                  {log.usuarios.telefone && (
                    <p className="text-xs font-mono text-slate-400">{phoneMask(log.usuarios.telefone)}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 uppercase font-semibold">Sistema</p>
            )}
          </div>

          <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Descrição da Ação</p>
            <p className="text-xs font-semibold text-slate-200 leading-relaxed break-words">
              {formatActivityDescription(log.descricao)}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Data e Hora</p>
              <p className="text-xs font-mono font-bold text-blue-400 mt-0.5">
                {new Date(log.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Endereço IP</p>
              <p className="text-xs font-mono font-bold text-slate-300 mt-0.5">{log.ip_address || "—"}</p>
            </div>
            {log.entidade_id && (
              <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ID da Entidade</p>
                <p className="text-[11px] font-mono text-slate-400 mt-0.5 break-all">{log.entidade_id}</p>
              </div>
            )}
          </div>

          {log.meta && Object.keys(log.meta).length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Metadados Completos (JSON)</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    await navigator.clipboard.writeText(JSON.stringify(log.meta, null, 2));
                    toast.success("Metadados copiados para a área de transferência!");
                  }}
                  className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-blue-400 hover:bg-slate-800 hover:text-blue-300"
                >
                  Copiar JSON
                </Button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 border border-slate-800 p-3.5 rounded-xl text-[11px] overflow-x-auto font-mono max-h-48 scrollbar-thin select-all leading-tight">
                {JSON.stringify(log.meta, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </AdminBaseDialog.Body>
    </AdminBaseDialog>
  );
}
