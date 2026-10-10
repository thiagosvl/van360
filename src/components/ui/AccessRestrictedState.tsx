import { memo } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { formatUserRoleLabel } from "@/utils/formatters/user";

interface AccessRestrictedStateProps {
  moduleName?: string;
  description?: string;
}

export const AccessRestrictedState = memo(function AccessRestrictedState({
  moduleName = "esta área",
  description,
}: AccessRestrictedStateProps) {
  const navigate = useNavigate();
  const { role } = usePermissions();
  const userRoleLabel = formatUserRoleLabel(role);

  return (
    <div className="max-w-md mx-auto my-8 p-6 sm:p-8 bg-white rounded-[24px] border border-[#e5e5e5] shadow-xs text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
      <div className="h-16 w-16 rounded-[18px] bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center mx-auto shadow-xs">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-[#0a0a0a] font-headline tracking-tight">
          Acesso Restrito
        </h3>
        <p className="text-xs sm:text-sm text-[#737373] leading-relaxed max-w-xs mx-auto">
          {description ||
            `Seu perfil de usuário (${userRoleLabel}) não possui permissão para acessar o módulo de ${moduleName}.`}
        </p>
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-[18px] bg-primary text-white font-semibold text-xs sm:text-sm hover:bg-primary-hover active:scale-[0.98] transition-all shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o Início
        </button>
      </div>
    </div>
  );
});

export default AccessRestrictedState;
