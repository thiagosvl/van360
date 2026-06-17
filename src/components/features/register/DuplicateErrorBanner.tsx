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
    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start gap-4 shadow-sm mb-6 animate-in slide-in-from-top-2 duration-300 relative">
      <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-amber-100/50 text-amber-600 shrink-0 border border-amber-200/50">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1 pt-0.5 pr-6">
        <p className="text-[13px] text-amber-900 font-bold leading-relaxed mb-1">
          {error.message}
        </p>
        <p className="text-[12px] text-amber-800/80 font-medium leading-relaxed mb-3">
          Parece que você já possui um cadastro no sistema. Faça login para acessar sua conta.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
          className="inline-flex justify-center items-center text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-200/60 hover:bg-amber-200 px-5 h-10 rounded-2xl transition-all active:scale-95 shadow-sm"
        >
          Fazer Login
        </button>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 text-amber-400 hover:text-amber-600 hover:bg-amber-100/50 rounded-full transition-colors p-1.5"
        aria-label="Fechar"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
