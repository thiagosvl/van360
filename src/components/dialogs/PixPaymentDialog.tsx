import QRCode from "qrcode";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Copy, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { useSession } from "@/hooks/business/useSession";
import { formatCurrency } from "@/utils/formatters";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";

export interface PixPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrcode: string;
  imagem_qrcode?: string;
  txid: string;
  valor: number;
  onSuccess?: () => void;
  onSwitchPaymentMethod?: () => void;
}

export default function PixPaymentDialog({
  isOpen,
  onClose,
  qrcode,
  imagem_qrcode,
  txid,
  valor,
  onSuccess,
  onSwitchPaymentMethod,
}: PixPaymentDialogProps) {
  const { user } = useSession();
  const { isActive, refetch: refetchStatus } = useSubscriptionAccess(user?.id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedQrCode, setGeneratedQrCode] = useState<string>("");

  useEffect(() => {
    if (qrcode && !imagem_qrcode) {
      QRCode.toDataURL(qrcode, { width: 400, margin: 2, color: { dark: "#0b1a2e" } })
        .then(url => setGeneratedQrCode(url))
        .catch(err => console.error("Erro ao gerar QR Code:", err));
    }
  }, [qrcode, imagem_qrcode]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      handleVerify(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (isActive && isOpen) {
      toast.success("Pagamento confirmado com sucesso!");
      onSuccess?.();
      safeCloseDialog(onClose);
    }
  }, [isActive, isOpen]);

  const handleVerify = async (silent = false) => {
    if (!silent) setIsVerifying(true);
    try {
      await refetchStatus();
    } catch (error) {
      if (!silent) toast.error("Erro ao verificar status.");
    } finally {
      if (!silent) setIsVerifying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrcode);
    toast.success("Código Pix copiado!");
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)}>
      <BaseDialog.Header
        title="Pagamento Assinatura"
        icon={<QrCode className="w-5 h-5 text-foreground" />}
        onClose={() => safeCloseDialog(onClose)}
      />
      <BaseDialog.Body>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Valor a pagar</p>
            <h2 className="text-3xl font-black text-foreground">{formatCurrency(valor)}</h2>
          </div>

          <div className="bg-white p-4 rounded-[20px] border border-[#e5e5e5] shadow-xs">
            {(imagem_qrcode || generatedQrCode) ? (
              <img src={imagem_qrcode || generatedQrCode} alt="QR Code Pix" className="w-60 h-60 sm:w-64 sm:h-64" />
            ) : (
              <div className="w-60 h-60 sm:w-64 sm:h-64 bg-[#f5f5f5] flex items-center justify-center rounded-[18px] border border-dashed border-[#e5e5e5]">
                <QrCode className="w-12 h-12 text-muted-foreground animate-pulse" />
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-center">
              Escaneie o código no app do seu banco
            </p>

            <div className="bg-[#f5f5f5] p-4 rounded-[18px] border border-[#e5e5e5] mt-2 space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase text-center leading-relaxed">
                Ou use o código Pix Copia e Cola abaixo:
              </p>
              <div className="flex gap-2">
                <div className="bg-white border border-[#e5e5e5] rounded-[14px] px-4 py-2.5 text-xs font-mono text-foreground flex-1 truncate select-all shadow-xs">
                  {qrcode}
                </div>
                <Button
                  size="icon"
                  className="shrink-0 rounded-[14px] bg-primary text-white hover:bg-primary-hover shadow-xs transition-all"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
              <RefreshCw className={isVerifying ? "w-3 h-3 text-muted-foreground animate-spin" : "w-3 h-3 text-muted-foreground"} />
              Verificando pagamento automaticamente...
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying}
              className="text-[10px] font-bold uppercase text-foreground hover:underline"
            >
              Verificar agora
            </button>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer className="bg-[#f5f5f5]/80 border-t border-[#e5e5e5] flex items-center justify-between p-4 sm:px-6">
        {onSwitchPaymentMethod ? (
          <button
            onClick={onSwitchPaymentMethod}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Alterar forma de pagamento
          </button>
        ) : (
          <div />
        )}
        <BaseDialog.Action
          label="Fechar"
          variant="outline"
          onClick={() => safeCloseDialog(onClose)}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
