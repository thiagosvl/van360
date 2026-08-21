import { useState, useEffect } from "react";
import { Copy, RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface PixPaymentViewProps {
  qrcode: string;
  imagem_qrcode?: string;
  valor: number;
  isVerifying?: boolean;
  onVerify?: () => void;
  onCopy?: () => void;
}

export function PixPaymentView({ qrcode, imagem_qrcode, valor, isVerifying, onVerify, onCopy }: PixPaymentViewProps) {
  const [generatedQrCode, setGeneratedQrCode] = useState<string>("");

  useEffect(() => {
    if (qrcode && !imagem_qrcode) {
      QRCode.toDataURL(qrcode, { width: 400, margin: 2, color: { dark: "#002444" } })
        .then(url => setGeneratedQrCode(url))
        .catch(err => console.error("Erro ao gerar QR Code:", err));
    }
  }, [qrcode, imagem_qrcode]);

  const handleCopy = () => {
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
        <div className="bg-white p-2.5 sm:p-3 rounded-xl shadow-[0px_8px_24px_rgba(25,28,30,0.06)] border border-slate-100">
          {qrSrc ? (
            <img src={qrSrc} alt="QR Code Pix" className="w-36 h-36 sm:w-40 sm:h-40" />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 bg-[#f2f4f6] flex items-center justify-center rounded-xl border-2 border-dashed border-[#c3c6cf]">
              <QrCode className="w-10 h-10 text-[#c3c6cf] animate-pulse" />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-[320px] px-1">
        <button
          type="button"
          onClick={handleCopy}
          className="w-full group flex items-center justify-between bg-[#f1f3f5] rounded-2xl p-2.5 sm:p-3 pl-4 sm:pl-5 cursor-pointer hover:bg-[#e9ecef] transition-all duration-200 border border-slate-200/60 active:scale-[0.98] text-left focus:outline-none focus:ring-2 focus:ring-[#002444]/20"
        >
          <div className="flex-1 min-w-0 pr-3">
            <p className="text-xs sm:text-[13px] font-mono text-[#002444] truncate tracking-tight">
              {qrcode}
            </p>
          </div>

          <div className="flex items-center shrink-0">
            <div className="w-[1px] h-4 bg-[#002444]/15 mr-3" />
            <Copy className="w-4 h-4 text-[#002444]/70 group-hover:text-[#002444] transition-colors" />
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 pt-1 pb-1">
        <RefreshCw className="w-3.5 h-3.5 text-[#002444]/50 animate-spin" />
        <span className="text-[10px] sm:text-[11px] font-bold text-[#002444]/60 uppercase tracking-widest">Aguardando pagamento...</span>
      </div>

      <div className="w-full max-w-[320px] pt-2 sm:pt-3 border-t border-slate-100">
        <h4 className="text-[10px] font-black text-[#43474e]/60 uppercase tracking-widest mb-2 px-1">Como pagar:</h4>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg">
            <div className="w-4 h-4 rounded bg-[#002444]/5 flex items-center justify-center text-[9px] font-black text-[#002444] shrink-0 border border-[#002444]/10">1</div>
            <p className="text-[11px] font-medium text-[#43474e] leading-tight">Copie o código <strong className="font-bold text-[#002444]">Pix Copia e Cola</strong></p>
          </div>
          <div className="flex items-center gap-2.5 px-2 py-1 rounded-lg">
            <div className="w-4 h-4 rounded bg-[#002444]/5 flex items-center justify-center text-[9px] font-black text-[#002444] shrink-0 border border-[#002444]/10">2</div>
            <p className="text-[11px] font-medium text-[#43474e] leading-tight">Pague no app do seu banco via <strong className="font-bold text-[#002444]">Pix Copia e Cola</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}
