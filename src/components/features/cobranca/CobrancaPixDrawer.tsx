import { ComoFuncionaPixSheet } from "@/components/features/pagamento/ComoFuncionaPixSheet";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { meses } from "@/utils/formatters";
import { toast } from "@/utils/notifications/toast";
import { AlertTriangle, Copy, CopyCheck, HelpCircle, X } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

interface CobrancaPixDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCodePayload: string;
  valor: number;
  passageiroNome: string;
  mes?: number;
  ano?: number;
}

export function CobrancaPixDrawer({
  open,
  onOpenChange,
  qrCodePayload,
  valor,
  passageiroNome,
  mes,
  ano,
}: CobrancaPixDrawerProps) {
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  // Formatar tempo MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  useEffect(() => {
    if (open && qrCodePayload) {
      QRCode.toDataURL(qrCodePayload)
        .then(setQrCodeImage)
        .catch((err) => {
          console.error("Erro ao gerar QR Code:", err);
          setQrCodeImage(null);
        });
    }
  }, [open, qrCodePayload]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(qrCodePayload);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar código PIX");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-full max-w-md p-0 gap-0 bg-white h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogTitle className="sr-only">
          Pagamento PIX - {passageiroNome}
        </DialogTitle>

        {/* Botão fechar flutuante */}
        <DialogClose className="absolute right-4 top-4 z-50 text-gray-400 hover:text-gray-600 transition-colors bg-white/50 backdrop-blur-sm rounded-full p-1 border border-gray-100/50">
          <X className="h-5 w-5" />
          <span className="sr-only">Fechar</span>
        </DialogClose>

        <div className="flex flex-col h-full w-full bg-white">
          {/* ÁREA ROLÁVEL: Conteúdo principal */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center justify-start pt-10 sm:pt-16">
            {/* Ícone */}
            <div className="relative mb-4 mt-4 shrink-0">
              {/* Crachá de Responsável */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[11px] font-bold uppercase tracking-wider border border-amber-100 shadow-sm mb-1">
                <AlertTriangle className="w-4 h-4" />
                ATENÇÃO: O Responsável é quem deve pagar
              </div>
            </div>

            {/* Contexto do Passageiro */}
            <div className="text-center mb-2 px-6 space-y-1">
              <p className="text-sm text-gray-500 leading-tight">
                <b>{passageiroNome}</b> -{" "}
                {mes && ano && (
                  <span>
                    <b>
                      {meses[mes - 1]}/{ano}
                    </b>{" "}
                  </span>
                )}
              </p>
            </div>

            {/* Valor da Cobrança (Minimalista) */}
            <div className="flex flex-col items-center mb-4 shrink-0">
              <div className="bg-blue-50/30 px-3 py-1 rounded-lg border border-blue-100/30">
                <span className="text-xl font-bold text-blue-900 tracking-tight">
                  {valor.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>

            <p className="text-gray-500 text-center text-xs mb-2 max-w-[200px] shrink-0 font-medium leading-tight">
              Copie o código abaixo e pague no app do seu banco:
            </p>

            {/* Código PIX Box (Dashed Standard) */}
            <div className="w-full border-2 mt-1 border-gray-100 border-dashed rounded-xl px-4 py-1 mb-6 flex items-center justify-between gap-3 overflow-hidden shrink-0 bg-gray-50/50">
              <div className="flex-1 min-w-0">
                <code className="text-xs text-gray-500 font-mono truncate block">
                  {qrCodePayload}
                </code>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 shrink-0"
              >
                {isCopied ? (
                  <CopyCheck className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* QR Code */}
            {qrCodeImage && (
              <div className="flex flex-col items-center mb-4 bg-white shrink-0">
                <span className="text-[10px] text-gray-400 mb-3 uppercase tracking-wider font-bold">
                  Ou escaneie o código
                </span>
                <div className="p-1 border border-gray-100 rounded-2xl shadow-sm">
                  <img
                    src={qrCodeImage}
                    alt="QR Code PIX"
                    className="w-40 h-40"
                  />
                </div>
              </div>
            )}
          </div>

          <ComoFuncionaPixSheet
            open={isInstructionsOpen}
            onOpenChange={setIsInstructionsOpen}
            context="cobranca_passageiro"
          />

          {/* RODAPÉ FIXO: Ações */}
          <div className="shrink-0 p-4 border-t bg-white/80 backdrop-blur-sm space-y-3">
            <Button
              variant="ghost"
              onClick={() => setIsInstructionsOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-semibold h-10 rounded-xl"
            >
              <HelpCircle className="w-4 h-4" />
              Como fazer o pagamento?
            </Button>
            <Button
              className={`w-full hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/10 ${
                isCopied ? "opacity-75 cursor-not-allowed" : "bg-blue-600"
              }`}
              onClick={handleCopy}
            >
              {isCopied ? "Código Copiado!" : "Copiar código PIX"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
