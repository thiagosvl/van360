import { Banner } from "@/components/ui/Banner";

interface IncompletePassengerBannerProps {
  onEdit: () => void;
}

export const IncompletePassengerBanner = ({ onEdit }: IncompletePassengerBannerProps) => {
  return (
    <Banner
      variant="warning"
      title="Cobrança Automática Pendente"
      description="O aluno já está registrado na sua van! Para ativar os lembretes automáticos no WhatsApp, configure o valor da mensalidade e o contato do responsável."
      action={{
        label: "Configurar Cobrança",
        onClick: onEdit,
      }}
      className="mb-6"
    />
  );
};
