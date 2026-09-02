import { Banner } from "@/components/ui/Banner";

interface IncompletePassengerBannerProps {
  onEdit: () => void;
}

export const IncompletePassengerBanner = ({ onEdit }: IncompletePassengerBannerProps) => {
  return (
    <Banner
      variant="warning"
      title="Cadastro Incompleto"
      description="Para que as cobranças automáticas funcionem, finalize o preenchimento do cadastro do aluno."
      action={{
        label: "Completar Cadastro",
        onClick: onEdit,
      }}
      className="mb-6"
    />
  );
};
