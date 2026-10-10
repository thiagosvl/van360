import { useState, useEffect } from "react";
import { Copy, Check, RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface PixPaymentViewProps {
  qrcode: string;
  imagem_qrcode?: string;
  valor: number;
  isVerifying?: boolean;
  onVerify?: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
}

export function PixPaymentView({ qrcode, imagem_qrcode, valor, isVerifying, onVerify, onCopy, isCopied: isCopiedProp }: PixPaymentViewProps) {
  const [generatedQrCode, setGeneratedQrCode] = useState<string>("");
  const [localCopied, setLocalCopied] = useState(false);

  const isCopied = isCopiedProp !== undefined ? isCopiedProp : localCopied;

  useEffect(() => {
    if (qrcode && !imagem_qrcode) {
      QRCode.toDataURL(qrcode, { width: 400, margin: 2, color: { dark: "#0b1a2e" } })
        .then(url => setGeneratedQrCode(url))
        .catch(err => console.error("Erro ao gerar QR Code:", err));
    }
  }, [qrcode, imagem_qrcode]);

  const handleCopy = () => {
    setLocalCopied(true);
    setTimeout(() => setLocalCopied(false), 2500);

    if (onCopy) {
      onCopy();
    } else {
      navigator.clipboard.writeText(qrcode);
      toast.success("Código Pix copiado!");
    }
  };

  const qrSrc = imagem_qrcode || generatedQrCode;

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="relative p-0.5">
        <div className="bg-white p-3 sm:p-4 rounded-[20px] shadow-xs border border-[#e5e5e5]">
          {qrSrc ? (
            <img src={qrSrc} alt="QR Code Pix" className="w-36 h-36 sm:w-40 sm:h-40" />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#f5f5f5] flex items-center justify-center rounded-[18px] border-2 border-dashed border-[#e5e5e5]">
              <QrCode className="w-10 h-10 text-muted-foreground animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[340px] px-1">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full group flex items-center justify-between bg-[#f5f5f5] rounded-[18px] p-2.5 sm:p-3 pl-4 sm:pl-5 cursor-pointer hover:bg-[#ebebeb] transition-all duration-200 border border-[#e5e5e5] active:scale-[0.98] text-left focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-[13px] font-mono text-foreground truncate tracking-tight">
              {qrcode}
            </p>
          </div>

          <div className="flex items-center shrink-0">
            <div className="w-[1px] h-4 bg-[#e5e5e5] mr-2.5" />
            {isCopied ? (
              <div className="flex items-center gap-1 text-emerald-600 font-semibold text-xs animate-in zoom-in-95 duration-200">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>Copiado!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[#0a0a0a] group-hover:text-[#0a0a0a]/80 transition-colors font-semibold text-xs">
                <Copy className="w-3.5 h-3.5 shrink-0" />
                <span>Copiar</span>
              </div>
            )}
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 pb-1">
        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />
        <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-widest">Aguardando pagamento...</span>
      </div>

      <div className="w-full max-w-[340px] pt-2 sm:pt-3 border-t border-[#e5e5e5]">
        <h4 className="text-[10px] font-semibold text-[#737373] uppercase tracking-widest mb-2 px-1">Como funciona:</h4>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-[12px]">
            <div className="w-5 h-5 rounded-[8px] bg-[#f5f5f5] flex items-center justify-center text-[10px] font-semibold text-[#0a0a0a] shrink-0 border border-[#e5e5e5]">1</div>
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">Copie o código <strong className="font-semibold text-[#0a0a0a]">Pix Copia e Cola</strong></p>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-[12px]">
            <div className="w-5 h-5 rounded-[8px] bg-[#f5f5f5] flex items-center justify-center text-[10px] font-semibold text-[#0a0a0a] shrink-0 border border-[#e5e5e5]">2</div>
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">Pague no app do seu banco via <strong className="font-semibold text-[#0a0a0a]">Pix Copia e Cola</strong></p>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-[12px]">
            <div className="w-5 h-5 rounded-[8px] bg-[#f5f5f5] flex items-center justify-center text-[10px] font-semibold text-[#0a0a0a] shrink-0 border border-[#e5e5e5]">3</div>
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">Após o pagamento, basta aguardar a <strong className="font-semibold text-[#0a0a0a]">confirmação automática</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
