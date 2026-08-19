import { ROUTES } from "@/constants/routes";
import { DuplicateError } from "@/hooks/register/useRegisterController";
import { useNavigate } from "react-router-dom";
import { Banner } from "@/components/ui/Banner";

interface DuplicateErrorBannerProps {
  error: DuplicateError;
  onDismiss: () => void;
}

export function DuplicateErrorBanner({
  error,
  onDismiss,
}: DuplicateErrorBannerProps) {
  const navigate = useNavigate();

  return (
    <Banner
      variant="warning"
      title={error.message}
      description="Parece que você já possui um cadastro. Faça login para acessar sua conta."
      action={{
        label: "Fazer Login",
        onClick: () => navigate(`${ROUTES.PUBLIC.LOGIN}?tipo=motorista`),
      }}
      onDismiss={onDismiss}
      className="mb-6"
    />
  );
}
