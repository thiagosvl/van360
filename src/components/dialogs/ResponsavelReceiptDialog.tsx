import { BaseDialog } from "@/components/ui/BaseDialog";
import { Download, ReceiptText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { getNowBR } from "@/utils/dateUtils";
import { openBrowserLink } from "@/utils/browser";

interface ResponsavelReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  cobrancaDescricao?: string;
}

export const ResponsavelReceiptDialog = ({
  isOpen,
  onClose,
  receiptUrl,
  cobrancaDescricao = "Recibo de Pagamento",
}: ResponsavelReceiptDialogProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleDownload = useCallback(async () => {
    if (!receiptUrl) return;

    try {
      if (receiptUrl.startsWith("http")) {
        const response = await fetch(receiptUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `comprovante-${getNowBR().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        openBrowserLink(receiptUrl);
      }
    } catch {
      openBrowserLink(receiptUrl);
    }
  }, [receiptUrl]);

  if (!receiptUrl) return null;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-xl">
      <BaseDialog.Header
        title={cobrancaDescricao}
        icon={<ReceiptText className="h-5 w-5" />}
        onClose={onClose}
      />

      <BaseDialog.Body className="p-4 sm:p-6 bg-slate-50/30">
        <div className="relative w-full aspect-[4/5] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center p-2">
          {isImageLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 animate-pulse">
              <Loader2 className="h-8 w-8 text-slate-300 animate-spin mb-2" />
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Carregando comprovante...</p>
            </div>
          )}
          <img
            src={receiptUrl}
            alt="Comprovante"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            className={`max-w-full max-h-full object-contain rounded-xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="gap-2 sm:gap-3">
        <BaseDialog.Action
          label="Baixar Comprovante"
          onClick={handleDownload}
          disabled={isImageLoading}
          icon={<Download className="h-4 w-4" />}
          className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
