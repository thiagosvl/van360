import { useState, useEffect } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import { Banner } from "@/components/ui/Banner";

interface PixNudgeBannerProps {
  hasPix: boolean;
}

const STORAGE_KEY = "van360_dismissed_pix_banner";

export const PixNudgeBanner = ({ hasPix }: PixNudgeBannerProps) => {
  const { openWhatsAppCobrancaPreviewDialog } = useLayout();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed !== "true") {
      setIsDismissed(false);
    }
  }, []);

  if (hasPix || isDismissed) return null;

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    localStorage.setItem(STORAGE_KEY, "true");
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
