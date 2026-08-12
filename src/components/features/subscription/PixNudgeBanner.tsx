import { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { Banner } from "@/components/ui/Banner";

interface PixNudgeBannerProps {
  hasPix: boolean;
}

const STORAGE_KEY = "van360_dismissed_pix_banner";

export const PixNudgeBanner = ({ hasPix }: PixNudgeBannerProps) => {
  const { openEditarPixDialog } = useLayout();
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
      icon={<KeyRound className="h-5 w-5" />}
      title="Facilite o pagamento para os pais"
      description="Cadastre sua chave Pix. Ela será enviada automaticamente junto com os lembretes de cobrança no WhatsApp dos responsáveis."
      action={{
        label: "Configurar Chave Pix",
        onClick: openEditarPixDialog,
      }}
      onDismiss={handleDismiss}
      className="mb-6"
    />
  );
};
