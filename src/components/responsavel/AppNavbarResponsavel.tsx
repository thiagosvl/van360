import { Button } from "@/components/ui/button";
import { clearLoginStorageResponsavel } from "@/utils/responsavelUtils";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AppNavbarResponsavelProps {
  title: string;
  subTitle?: string;
}

export default function AppNavbarResponsavel({
  title,
  subTitle,
}: AppNavbarResponsavelProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearLoginStorageResponsavel();

    navigate("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between px-4 sm:px-6 bg-white border-b shadow-sm sticky top-0 z-30">
      <div>
        <h1 className="text-base sm:text-lg font-semibold leading-tight">
          {title || "Carteirinha Digital"}
        </h1>
        {subTitle != "" && (
          <p className="text-xs text-muted-foreground">{subTitle}</p>
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
