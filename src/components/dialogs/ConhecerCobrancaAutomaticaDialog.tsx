import { useNavigate } from "react-router-dom";
import BaseDialog from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA } from "@/constants/tutorials";
import { useLayout } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import { ArrowRight, Play, Sparkles } from "lucide-react";

export interface ConhecerCobrancaAutomaticaDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConhecerCobrancaAutomaticaDialog({
  isOpen,
  onClose,
}: ConhecerCobrancaAutomaticaDialogProps) {
  const navigate = useNavigate();
  const { openVideoStoriesDialog } = useLayout();

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleGoToConfig = () => {
    safeCloseDialog(() => {
      onClose();
      navigate(`${ROUTES.PRIVATE.MOTORISTA.ACCOUNT}?tab=cobrancas`);
    });
  };

  const handleWatchVideo = () => {
    openVideoStoriesDialog({
      videosData: [VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA],
      title: VIDEO_APRESENTACAO_COBRANCA_AUTOMATICA.title,
      showCta: true,
      ctaText: "Ir para Cobranças & Pix",
      onCtaClick: handleGoToConfig,
      loop: false,
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="md">
      <BaseDialog.Header
        title="Baixa Automática de Parcelas"
        subtitle="Receba via Pix sem conferir comprovantes"
        icon={<Sparkles className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body className="space-y-4">
        <p className="text-xs sm:text-sm text-[#525252] leading-relaxed">
          Assim que o pai paga o Pix, o Van360 dá baixa na hora, envia o recibo no WhatsApp e transfere o valor para a sua conta.
        </p>

        <button
          type="button"
          onClick={handleWatchVideo}
          className="w-full p-3.5 sm:p-4 rounded-[18px] bg-primary/[0.06] hover:bg-primary/[0.10] border border-primary/20 flex items-center justify-between gap-3 transition-all cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] leading-snug">
                Veja como funciona na prática
              </p>
              <p className="text-xs text-[#525252] mt-0.5">
                Assista ao vídeo rápido de demonstração
              </p>
            </div>
          </div>

          <span className="shrink-0 inline-flex items-center justify-center h-8 px-3 rounded-[14px] bg-white border border-primary/20 text-xs font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            Assistir
          </span>
        </button>

        <Button
          type="button"
          onClick={handleGoToConfig}
          className="w-full h-11 rounded-[18px] bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>Ir para Cobranças & Pix</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </BaseDialog.Body>
    </BaseDialog>
  );
}
