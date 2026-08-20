import React from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { ArrowDownToLine, AlertTriangle } from "lucide-react";
import { PLAY_STORE_MARKET_URL, PLAY_STORE_URL } from "@/utils/detectPlatform";

export interface NativeUpdateDialogProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  message?: string;
  isMandatory?: boolean;
  storeUrl?: string;
}

export function NativeUpdateDialog({
  isOpen,
  onClose,
  title,
  message = "Uma nova versão do Van360 está disponível com melhorias de estabilidade, desempenho e novos recursos. Atualize para continuar aproveitando a melhor experiência.",
  isMandatory = false,
  storeUrl = PLAY_STORE_MARKET_URL,
}: NativeUpdateDialogProps) {
  const defaultTitle = isMandatory ? "Atualização Obrigatória" : "Atualização Disponível";
  const displayTitle = title || defaultTitle;

  const handleOpenStore = () => {
    try {
      window.open(storeUrl || PLAY_STORE_MARKET_URL, "_system");
    } catch {
      window.open(PLAY_STORE_URL, "_system");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={() => {}} lockClose={true} maxWidth="md">
      <BaseDialog.Header
        title={displayTitle}
        icon={
          isMandatory ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <ArrowDownToLine className="w-5 h-5 text-emerald-600" />
          )
        }
        hideCloseButton={true}
      />

      <BaseDialog.Body className="space-y-4 pt-4">
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            O que há de novo:
          </p>
          <div className="text-xs sm:text-sm text-slate-700 font-normal leading-relaxed whitespace-pre-line space-y-1">
            {message}
          </div>
        </div>

        {isMandatory && (
          <p className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 rounded-xl p-3 text-center">
            Para garantir a segurança e o correto funcionamento dos dados, é necessário atualizar o aplicativo para continuar.
          </p>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {!isMandatory && onClose && (
          <BaseDialog.Action
            label="Mais tarde"
            variant="outline"
            onClick={onClose}
          />
        )}

        <BaseDialog.Action
          label="Atualizar"
          variant="primary"
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
          onClick={handleOpenStore}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
