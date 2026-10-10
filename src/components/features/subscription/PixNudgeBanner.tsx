import { useState, useEffect } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { Banner } from "@/components/ui/Banner";
import { STORAGE_KEYS } from "@/constants";

interface PixNudgeBannerProps {
  hasPix: boolean;
}

export const PixNudgeBanner = ({ hasPix }: PixNudgeBannerProps) => {
  const { openWhatsAppCobrancaPreviewDialog } = useLayout();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEYS.DISMISSED_PIX_BANNER);
    if (dismissed !== "true") {
      setIsDismissed(false);
    }
  }, []);

  if (hasPix || isDismissed) return null;

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    localStorage.setItem(STORAGE_KEYS.DISMISSED_PIX_BANNER, "true");
    setIsDismissed(true);
  };

  return (
    <Banner
      variant="info"
      icon={<WhatsAppIcon className="h-5 w-5 text-emerald-600" />}
      title="Veja o que os pais recebem no WhatsApp"
      description="Toque para ver como a mensagem de cobrança chega para os pais."
      onClick={() => openWhatsAppCobrancaPreviewDialog({ showPixSetupAction: true })}
      onDismiss={handleDismiss}
      dismissPosition="floating"
      className="mb-4 cursor-pointer"
    />
  );
};
