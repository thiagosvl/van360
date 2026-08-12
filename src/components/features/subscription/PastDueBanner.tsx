import { AlertOctagon } from "lucide-react";
import { Banner } from "@/components/ui/Banner";

interface PastDueBannerProps {
  onRegularize?: () => void;
}

export const PastDueBanner = ({ onRegularize }: PastDueBannerProps) => {
  return (
    <Banner
      variant="danger"
      icon={<AlertOctagon className="h-5 w-5" />}
      title="Assinatura em Atraso"
      description="Sua assinatura ainda não foi renovada. Regularize agora para evitar o bloqueio do seu acesso."
      action={
        onRegularize
          ? {
              label: "Regularizar",
              onClick: onRegularize,
            }
          : undefined
      }
      className="mb-6"
    />
  );
};
