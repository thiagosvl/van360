import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ArrowDownToLine, AlertTriangle } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import {
  PLAY_STORE_MARKET_URL,
  PLAY_STORE_URL,
  APP_STORE_MARKET_URL,
  APP_STORE_URL,
} from "@/utils/detectPlatform";

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
  storeUrl,
}: NativeUpdateDialogProps) {
  const defaultTitle = isMandatory ? "Atualização Obrigatória" : "Atualização Disponível";
  const displayTitle = title || defaultTitle;

  const handleOpenStore = () => {
    const isIos = Capacitor.getPlatform() === "ios";
    const targetUrl = storeUrl || (isIos ? APP_STORE_MARKET_URL : PLAY_STORE_MARKET_URL);
    const fallbackUrl = isIos ? APP_STORE_URL : PLAY_STORE_URL;
    try {
      window.open(targetUrl, "_system");
    } catch {
      window.open(fallbackUrl, "_system");
    }
  };

  const handleClose = () => {
    if (onClose) {
      safeCloseDialog(onClose);
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isMandatory) {
          handleClose();
        }
      }}
      lockClose={isMandatory}
      maxWidth="md"
    >
      <BaseDialog.Header
        title={displayTitle}
        icon={
          isMandatory ? (
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          ) : (
            <ArrowDownToLine className="w-5 h-5 text-primary" />
          )
        }
        hideCloseButton={isMandatory}
        onClose={!isMandatory ? handleClose : undefined}
      />

      <BaseDialog.Body className="space-y-4 pt-4">
        <div className="rounded-[20px] border border-[#e5e5e5] bg-[#f5f5f5] p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            O que há de novo:
          </p>
          <div className="text-xs sm:text-sm text-foreground font-normal leading-relaxed whitespace-pre-line space-y-1">
            {message}
          </div>
        </div>

        {isMandatory && (
          <Banner
            variant="warning"
            title="Atualização necessária"
            description="Para garantir a segurança e o correto funcionamento dos dados, é necessário atualizar o aplicativo para continuar."
          />
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        {!isMandatory && onClose && (
          <BaseDialog.Action
            label="Mais tarde"
            variant="outline"
            onClick={handleClose}
          />
        )}

        <BaseDialog.Action
          label="Atualizar"
          variant="primary"
          onClick={handleOpenStore}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
