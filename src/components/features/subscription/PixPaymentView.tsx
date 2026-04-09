import { useState, useEffect } from "react";
import { Copy, RefreshCw, QrCode } from "lucide-react";
import { formatCurrency } from "@/utils/formatters/currency";
import { toast } from "sonner";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col items-center space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-400">


      {/* QR Code com cantos decorativos */}
      <div className="relative p-1">
        <div className="bg-white p-3 rounded-xl shadow-[0px_8px_24px_rgba(25,28,30,0.06)]">
          {qrSrc ? (
            <img src={qrSrc} alt="QR Code Pix" className="w-40 h-40" />
          ) : (
            <div className="w-40 h-40 bg-[#f2f4f6] flex items-center justify-center rounded-xl border-2 border-dashed border-[#c3c6cf]">
              <QrCode className="w-10 h-10 text-[#c3c6cf] animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Pix Copia e Cola - Estilo Pill (Conforme Anexo 2) */}
      <div className="w-full max-w-[320px] px-2 pt-2">
        <div
          onClick={handleCopy}
          className="group flex items-center justify-between bg-[#f1f3f5] rounded-[22px] p-3.5 pl-6 cursor-pointer hover:bg-[#e9ecef] transition-all duration-200 border border-transparent active:scale-[0.98]"
        >
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[13px] font-mono font-bold text-[#002444] truncate tracking-tight">
              {qrcode}
            </p>
          </div>

          <div className="flex items-center shrink-0">
            <div className="w-[1.5px] h-5 bg-[#002444]/10 mr-4" />
            <div className="p-1 rounded-lg">
              <Copy className="w-5 h-5 text-[#002444]/80 group-hover:text-[#002444] transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Aguardando Pagamento */}
      <div className="flex items-center justify-center gap-3 pt-2 pb-2 animate-in fade-in duration-700">
        <RefreshCw className="w-4 h-4 text-[#002444]/40 animate-spin" />
        <span className="text-[11px] font-bold text-[#002444]/40 uppercase tracking-[0.15em]">Aguardando pagamento...</span>
      </div>

      {/* Tutorial Rápido (Como Pagar) */}
      <div className="w-full max-w-[320px] pt-4 mt-2 border-t border-[#f2f4f6]">
        <h4 className="text-[10px] font-black text-[#43474e]/60 uppercase tracking-widest mb-3 px-1">Precisa de ajuda?</h4>
        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f4f6]/40 transition-colors">
            <div className="w-5 h-5 rounded-md bg-[#002444]/5 flex items-center justify-center text-[10px] font-black text-[#002444] shrink-0 border border-[#002444]/10">1</div>
            <p className="text-[11px] font-medium text-[#43474e] leading-tight">Copie o código <span className="font-bold text-[#002444]">Pix Copia e Cola</span> acima</p>
          </div>
          <div className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-[#f2f4f6]/40 transition-colors">
            <div className="w-5 h-5 rounded-md bg-[#002444]/5 flex items-center justify-center text-[10px] font-black text-[#002444] shrink-0 border border-[#002444]/10">2</div>
            <p className="text-[11px] font-medium text-[#43474e] leading-tight">No aplicativo do seu banco, escolha a opção de pagar via <span className="font-bold text-[#002444]">Pix Copia e Cola</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
