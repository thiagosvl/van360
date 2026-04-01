import { BaseDialog } from "@/components/ui/BaseDialog";
import { Download, Share2, ReceiptText, Loader2 } from "lucide-react";
import { isMobilePlatform } from "@/utils/detectPlatform";
import { useCallback, useState } from "react";

interface ReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  cobrancaDescricao?: string;
}

export const ReceiptDialog = ({
  isOpen,
  onClose,
  receiptUrl,
  cobrancaDescricao = "Recibo de Pagamento",
}: ReceiptDialogProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleDownload = useCallback(async () => {
    if (!receiptUrl) return;
    
    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar recibo:", error);
    }
  }, [receiptUrl]);

  const handleShare = useCallback(async () => {
    if (!receiptUrl) return;

    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const file = new File([blob], "recibo.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Recibo Van360",
          text: cobrancaDescricao,
        });
      } else {
        window.open(receiptUrl, "_blank");
      }
    } catch (error) {
      console.error("Erro ao compartilhar recibo:", error);
      window.open(receiptUrl, "_blank");
    }
  }, [receiptUrl, cobrancaDescricao]);

  if (!receiptUrl) return null;

  const isMobile = isMobilePlatform();

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} className="max-w-xl">
      <BaseDialog.Header 
        title="Recibo" 
        subtitle="Comprovante de Pagamento"
        icon={<ReceiptText className="h-5 w-5" />}
        onClose={onClose}
      />
      
      <BaseDialog.Body className="p-4 sm:p-6 bg-slate-50/30">
        <div className="relative w-full aspect-[4/5] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center p-2">
          {isImageLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 animate-pulse">
              <Loader2 className="h-8 w-8 text-slate-300 animate-spin mb-2" />
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Carregando...</p>
            </div>
          )}
          <img
            src={receiptUrl}
            alt="Recibo"
            onLoad={() => setIsImageLoading(false)}
            className={`max-w-full max-h-full object-contain rounded-xl transition-opacity duration-300 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="gap-2 sm:gap-3">
        <BaseDialog.Action
          label="Fechar"
          variant="outline"
          onClick={onClose}
          className="sm:flex-none sm:w-28 text-slate-500 order-first"
        />

        {isMobile ? (
          <BaseDialog.Action
            label="Enviar"
            onClick={handleShare}
            disabled={isImageLoading}
            icon={<Share2 className="h-4 w-4" />}
            className="bg-slate-800 hover:bg-slate-900 text-white"
          />
        ) : (
          <BaseDialog.Action
            label="Download"
            onClick={handleDownload}
            disabled={isImageLoading}
            icon={<Download className="h-4 w-4" />}
            className="bg-slate-800 hover:bg-slate-900 text-white"
          />
        )}
      </BaseDialog.Footer>
    </BaseDialog>
  );
};
