import { BaseDialog } from "@/components/ui/BaseDialog";
import { Share2, ReceiptText, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

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

  const handleClose = useCallback(() => {
    safeCloseDialog(onClose);
  }, [onClose]);

  const handleShare = useCallback(async () => {
    if (!receiptUrl) return;

    await shareReceiptFile({
      url: receiptUrl,
      filename: "recibo.png",
      title: "Recibo Van360",
      text: cobrancaDescricao,
    });
  }, [receiptUrl, cobrancaDescricao]);

  if (!receiptUrl) return null;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} className="max-w-xl">
      <BaseDialog.Header
        title={cobrancaDescricao}
        icon={<ReceiptText className="h-5 w-5" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="p-4 sm:p-6 bg-[#f5f5f5]/60">
        <div className="relative w-full aspect-[4/5] bg-white rounded-[20px] overflow-hidden border border-[#e5e5e5] shadow-xs flex items-center justify-center p-2">
          {isImageLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f5f5f5]/80 animate-pulse">
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Carregando recibo...</p>
            </div>
          )}
          <img
            src={receiptUrl}
            alt="Recibo"
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            className={`max-w-full max-h-full object-contain rounded-[14px] transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="gap-2 sm:gap-3">
        <BaseDialog.Action
          label="Compartilhar"
          onClick={handleShare}
          disabled={isImageLoading}
          icon={<Share2 className="h-4 w-4" />}
          className="bg-primary hover:bg-primary-hover text-white font-semibold rounded-[18px] shadow-xs"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
