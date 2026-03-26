import { ROUTES } from "@/constants/routes";
import { DuplicateError } from "@/hooks/register/useRegisterController";
import { AlertTriangle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-amber-800">
            {error.message}
          </p>
          <p className="text-sm text-amber-700 mt-1">
            Parece que você já tem uma conta!
            <br />
            Use "Já tenho conta" para entrar com seu CPF e senha.
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            className="inline-flex items-center mt-3 text-sm font-bold text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-4 py-2 rounded-lg transition-colors"
          >
            Ir para login
          </button>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-400 hover:text-amber-600 transition-colors p-1"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
