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
        title="Confirmar disparo de notificação"
        subtitle="Verifique o público-alvo e a prévia do comunicado antes de realizar o envio."
        icon={<Send className="h-5 w-5 text-primary" />}
        onClose={loading ? undefined : () => safeCloseDialog(onClose)}
        hideCloseButton={loading}
      />

      <AdminBaseDialog.Body>
        <div className="space-y-4 py-1 text-left">
          <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-border">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                Público destinatário
              </span>
              <span className="text-xs font-semibold text-foreground text-right max-w-[65%]">
                {publicoDescricao}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground font-medium">Motoristas no filtro:</span>
              <span className="font-mono font-semibold text-foreground">
                {totalEligivel} {totalEligivel === 1 ? "motorista" : "motoristas"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
                Com app instalado (Push ativo):
              </span>
              <span className="font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                {totalComPush} {totalComPush === 1 ? "aparelho" : "aparelhos"}
              </span>
            </div>

            {selectedActionConfig && (
              <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-border">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  Destino ao tocar (Deep link):
                </span>
                <span className="font-mono text-[11px] font-semibold text-primary truncate max-w-[55%]" title={selectedActionConfig.route}>
                  {selectedActionConfig.label} ({selectedActionConfig.route})
                </span>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-left">
            <div className="flex items-center gap-2">
              <Bell className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">
                Prévia da notificação no celular
              </span>
            </div>
            <p className="text-xs font-semibold text-foreground leading-snug">
              {notificationTitle || "Título não preenchido"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
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
          label={loading ? "Disparando..." : "Enviar notificação agora"}
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
