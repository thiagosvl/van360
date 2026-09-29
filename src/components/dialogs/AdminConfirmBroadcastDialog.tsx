import React, { useState } from "react";
import { Send, Bell, Smartphone, Users, MapPin } from "lucide-react";
import { AdminBaseDialog } from "@/components/ui/AdminBaseDialog";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface AdminConfirmBroadcastDialogProps {
  isOpen: boolean;
  onClose: () => void;
  publicoDescricao: string;
  totalEligivel: number;
  totalComPush: number;
  selectedActionConfig?: { label: string; route: string } | null;
  notificationTitle: string;
  notificationMessage: string;
  onConfirm: () => Promise<void> | void;
  isSubmitting?: boolean;
}

export default function AdminConfirmBroadcastDialog({
  isOpen,
  onClose,
  publicoDescricao,
  totalEligivel,
  totalComPush,
  selectedActionConfig,
  notificationTitle,
  notificationMessage,
  onConfirm,
  isSubmitting = false,
}: AdminConfirmBroadcastDialogProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = isSubmitting || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      safeCloseDialog(onClose);
    } catch {
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <AdminBaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !loading) {
          safeCloseDialog(onClose);
        }
      }}
      maxWidth="lg"
      description="Confirmação de disparo em massa de notificação push"
    >
      <AdminBaseDialog.Header
        title="Confirmar Disparo de Notificação"
        subtitle="Verifique o público-alvo e a prévia do comunicado antes de realizar o envio."
        icon={<Send className="h-5 w-5 text-blue-400" />}
        onClose={loading ? undefined : () => safeCloseDialog(onClose)}
        hideCloseButton={loading}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-4 py-1 text-left">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3 shadow-inner">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                Público Destinatário
              </span>
              <span className="text-xs font-bold text-slate-100 text-right max-w-[65%]">
                {publicoDescricao}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-medium">Motoristas no filtro:</span>
              <span className="font-mono font-bold text-slate-200">
                {totalEligivel} {totalEligivel === 1 ? "motorista" : "motoristas"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                Com app instalado (Push ativo):
              </span>
              <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {totalComPush} {totalComPush === 1 ? "aparelho" : "aparelhos"}
              </span>
            </div>

            {selectedActionConfig && (
              <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/80">
                <span className="text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" />
                  Destino ao tocar (Deep Link):
                </span>
                <span className="font-mono text-[11px] font-semibold text-blue-300 truncate max-w-[55%]" title={selectedActionConfig.route}>
                  {selectedActionConfig.label} ({selectedActionConfig.route})
                </span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[11px] font-black text-blue-300 uppercase tracking-wider">
                Prévia da Notificação no Celular
              </span>
            </div>
            <p className="text-xs font-bold text-white leading-snug">
              {notificationTitle || "Título não preenchido"}
            </p>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
              {notificationMessage || "Mensagem não preenchida"}
            </p>
          </div>
        </div>
      </AdminBaseDialog.Body>

      <AdminBaseDialog.Footer>
        <AdminBaseDialog.Action
          label="Cancelar"
          variant="secondary"
          disabled={loading}
          onClick={() => safeCloseDialog(onClose)}
        />
        <AdminBaseDialog.Action
          label={loading ? "Disparando..." : "Enviar Notificação Agora"}
          variant="primary"
          icon={<Send className="h-4 w-4" />}
          isLoading={loading}
          disabled={loading}
          onClick={handleConfirm}
        />
      </AdminBaseDialog.Footer>
    </AdminBaseDialog>
  );
}
