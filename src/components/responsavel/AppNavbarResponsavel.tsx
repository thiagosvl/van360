import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppNavbarResponsavelProps {
  nomePassageiro?: string;
  anoSelecionado?: number | null;
}

export default function AppNavbarResponsavel({
  nomePassageiro,
  anoSelecionado,
}: AppNavbarResponsavelProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("responsavel_id");
    localStorage.removeItem("responsavel_cpf");
    localStorage.removeItem("responsavel_email");
    localStorage.removeItem("responsavel_usuario_id");
    localStorage.removeItem("responsavel_is_logged");
    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b shadow-sm">
      <div>
        <h1 className="text-base sm:text-lg font-semibold leading-tight">
          {nomePassageiro || "Carteirinha Digital"}
        </h1>
        {nomePassageiro === "Selecione o Passageiro" ? null : (
          <p className="text-xs text-muted-foreground">
            Carteirinha Digital{anoSelecionado ? ` - ${anoSelecionado}` : ""}
          </p>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        title="Sair"
        className="text-red-600 hover:text-red-700"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  );
}
