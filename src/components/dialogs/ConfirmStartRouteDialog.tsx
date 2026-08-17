import React, { useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Play, Bell } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export interface ConfirmStartRouteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notificarPais: boolean) => void;
  routeName?: string;
  isLoading?: boolean;
}

export function ConfirmStartRouteDialog({
  isOpen,
  onClose,
  onConfirm,
  routeName,
  isLoading = false,
}: ConfirmStartRouteDialogProps) {
  const [notificarPais, setNotificarPais] = useState<boolean>(true);

  const handleConfirm = () => {
    onConfirm(notificarPais);
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} maxWidth="md">
      <BaseDialog.Header
        title="Iniciar Rota"
        subtitle={routeName || "Execução de itinerário"}
        icon={<Play className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="space-y-4 pt-4">
        <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
          Deseja dar a partida nesta corrida? Você poderá acompanhar as paradas e registrar os alunos em tempo real.
        </p>

        {/* Card de Notificações com Título e Descrição sem Truncamento */}
        <div
          onClick={() => setNotificarPais(!notificarPais)}
          className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 cursor-pointer select-none transition-all hover:bg-emerald-50 active:scale-[0.99] flex items-start gap-3.5"
        >
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <Bell className="w-5 h-5" />
          </div>

          <div className="flex-grow min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-headline font-bold text-[#1a3a5c] text-xs sm:text-sm leading-snug">
                Notificar pais e responsáveis
              </span>
              <Switch
                checked={notificarPais}
                onCheckedChange={(checked) => setNotificarPais(checked)}
                className="data-[state=checked]:bg-emerald-600 shrink-0"
              />
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-normal leading-relaxed break-words">
              Os pais receberão alertas automáticos no celular quando a van estiver a caminho e quando seu filho embarcar ou desembarcar.
            </p>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
        />
        <BaseDialog.Action
          label="Iniciar Rota"
          variant="primary"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          icon={<Play className="w-4 h-4 fill-white" />}
          isLoading={isLoading}
          onClick={handleConfirm}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ConfirmStartRouteDialog;
