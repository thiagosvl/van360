import { ROUTES } from "@/constants/routes";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { Compass, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  useSEO({
    noindex: true,
    title: "Página Não Encontrada | Van360",
  });

  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[24px] border border-[#e5e5e5] p-8 sm:p-10 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto w-16 h-16 rounded-[20px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a]">
          <Compass className="w-8 h-8 stroke-[1.75]" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373]">
            Erro 404
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0a0a0a]">
            Página não encontrada
          </h1>
          <p className="text-sm text-[#737373] font-normal leading-relaxed max-w-sm mx-auto">
            O link que você tentou acessar não existe, foi movido ou está temporariamente indisponível.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2.5">
          <Button
            type="button"
            onClick={() => navigate(ROUTES.PUBLIC.ROOT)}
            className="w-full h-11 sm:h-12 rounded-[18px] bg-primary hover:bg-primary-hover text-white font-medium text-sm shadow-xs transition-all active:scale-[0.98]"
          >
            Ir para a página inicial
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="w-full h-11 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] font-medium text-sm transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar à página anterior</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
