import QRCode from "qrcode";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Copy, QrCode, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useSession } from "@/hooks/business/useSession";
import { formatCurrency } from "@/utils/formatters";
import { SubscriptionStatus } from "@/types/enums";

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
  const { subscription, refetch: refetchStatus } = useSubscriptionStatus(user?.id);
  const [isVerifying, setIsVerifying] = useState(false);
  const [generatedQrCode, setGeneratedQrCode] = useState<string>("");

  // Gerar QR Code se não houver imagem
  useEffect(() => {
    if (qrcode && !imagem_qrcode) {
      QRCode.toDataURL(qrcode, { width: 400, margin: 2 })
        .then(url => setGeneratedQrCode(url))
        .catch(err => console.error("Erro ao gerar QR Code:", err));
    }
  }, [qrcode, imagem_qrcode]);

  // Polling automático a cada 10 segundos
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      handleVerify(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Monitorar mudança de status para fechar o diálogo
  useEffect(() => {
    if (subscription?.status === SubscriptionStatus.ACTIVE && isOpen) {
      toast.success("Pagamento confirmado com sucesso!");
      onSuccess?.();
      onClose();
    }
  }, [subscription?.status, isOpen]);

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
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <BaseDialog.Header
        title="Pagamento Assinatura"
        icon={<QrCode className="w-5 h-5 opacity-80" />}
      />
      <BaseDialog.Body>
        <div className="flex flex-col items-center space-y-6 py-4">
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Valor a pagar</p>
            <h2 className="text-3xl font-black text-[#1a3a5c]">{formatCurrency(valor)}</h2>
          </div>

          <div className="bg-white p-4 rounded-3xl border-4 border-slate-50 shadow-xl shadow-slate-200/50">
            {(imagem_qrcode || generatedQrCode) ? (
              <img src={imagem_qrcode || generatedQrCode} alt="QR Code Pix" className="w-64 h-64 scale-110" />
            ) : (
              <div className="w-64 h-64 bg-slate-50 flex items-center justify-center rounded-2xl border border-dashed border-slate-200">
                <QrCode className="w-12 h-12 text-slate-300 animate-pulse" />
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">
              Escaneie o código no app do seu banco
            </p>

            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 mt-2 space-y-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase text-center leading-relaxed">
                Ou use o código Pix Copia e Cola abaixo:
              </p>
              <div className="flex gap-2">
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[11px] font-medium text-slate-600 flex-1 truncate select-all">
                  {qrcode}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 rounded-xl bg-white shadow-sm border-slate-200 hover:border-[#1a3a5c] hover:text-[#1a3a5c] transition-all"
                  onClick={handleCopy}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
              <RefreshCw className={isVerifying ? "w-3 h-3 animate-spin" : "w-3 h-3"} />
              Verificando pagamento automaticamente...
            </div>
            <button
              onClick={() => handleVerify()}
              disabled={isVerifying}
              className="text-[10px] font-black uppercase text-[#1a3a5c] hover:underline"
            >
              Verificar agora
            </button>
          </div>
        </div>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <div className="flex w-full justify-between items-center px-6 pb-6">
          {onSwitchPaymentMethod && (
            <button
              onClick={onSwitchPaymentMethod}
              className="text-xs font-bold text-slate-400 hover:text-[#1a3a5c] transition-colors"
            >
              Alterar forma de pagamento
            </button>
          )}
          <BaseDialog.Action
            label="Fechar"
            variant="secondary"
            onClick={onClose}
          />
        </div>
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
