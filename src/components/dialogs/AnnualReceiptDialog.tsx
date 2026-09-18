import { BaseDialog } from "@/components/ui/BaseDialog";
import { Download, Share2, ReceiptText, Loader2 } from "lucide-react";
import { isMobilePlatform } from "@/utils/detectPlatform";
import { shareReceiptFile } from "@/utils/domain/cobranca/shareReceipt";
import { useCallback, useEffect, useState } from "react";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

interface AnnualReceiptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  receiptUrl: string | null;
  ano: number;
  alunoNome?: string;
}

export const AnnualReceiptDialog = ({
  isOpen,
  onClose,
  receiptUrl,
  ano,
  alunoNome = "Aluno",
}: AnnualReceiptDialogProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (isOpen && receiptUrl) {
      setIsImageLoading(true);
    }
  }, [isOpen, receiptUrl]);

  const handleSafeClose = useCallback(() => {
    safeCloseDialog(onClose);
  }, [onClose]);

  const handleDownload = useCallback(async () => {
    if (!receiptUrl) return;

    try {
      const response = await fetch(receiptUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `recibo-anual-${ano}-${alunoNome.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao baixar recibo anual:", error);
    }
  }, [receiptUrl, ano, alunoNome]);

  const handleShare = useCallback(async () => {
    if (!receiptUrl) return;
    await shareReceiptFile({
      url: receiptUrl,
      filename: `recibo-anual-${ano}.png`,
      title: "Recibo Anual - Van360",
      text: `Olá! Segue o Recibo Anual de Pagamento referente ao ano letivo de ${ano} do aluno ${alunoNome}.`,
    });
  }, [receiptUrl, ano, alunoNome]);

  if (!receiptUrl) return null;

  const isMobile = isMobilePlatform();

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleSafeClose()} className="max-w-xl">
      <BaseDialog.Header
        title={`Recibo Anual • ${ano}`}
        icon={<ReceiptText className="h-5 w-5" />}
        onClose={handleSafeClose}
      />

      <BaseDialog.Body className="p-4 sm:p-6 bg-slate-50/30 max-h-[82vh] overflow-y-auto flex items-center justify-center">
        <div className="relative w-full min-h-[480px] bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center p-2">
          {isImageLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/70 z-10 animate-pulse">
              <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-2" />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Carregando recibo...</p>
            </div>
          )}
          <img
            src={receiptUrl}
            alt={`Recibo Anual ${ano}`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            className={`max-w-full max-h-full object-contain rounded-xl transition-opacity duration-300 ${
              isImageLoading ? "opacity-0" : "opacity-100"
            }`}
          />
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="gap-2 sm:gap-3">
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
