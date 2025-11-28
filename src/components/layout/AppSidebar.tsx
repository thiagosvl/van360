import { Button } from "@/components/ui/button";
import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { cn } from "@/lib/utils";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink, useNavigate } from "react-router-dom";

interface AppSidebarProps {
  role: "motorista";
  onLinkClick?: () => void;
  plano?: any;
}

export function AppSidebar({ role, onLinkClick, plano }: AppSidebarProps) {
  const navigate = useNavigate();
  const userItems = pagesItems.map((item) => ({
    ...item,
  }));

  // Obter slug principal do plano (usa parent se existir)
  const getMainPlanSlug = () => {
    if (!plano?.planoCompleto) return null;
    return plano.planoCompleto.parent?.slug ?? plano.planoCompleto.slug ?? plano?.slug ?? null;
  };

  const getPlanTitle = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";
    
    if (slug === PLANO_GRATUITO) {
      return "Cresça sem limites 🚀";
    }
    
    if (slug === PLANO_ESSENCIAL) {
      return "Automatize tudo ⚡";
    }
    
    if (slug === PLANO_COMPLETO) {
      return "Automatize ainda mais 🎯";
    }
    
    return "Eleve seu negócio 🚀";
  };

  const getPlanMessage = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";
    
    if (slug === PLANO_GRATUITO) {
      return "Cadastre quantos passageiros quiser, cobre automaticamente e veja seus gastos e lucros em tempo real.";
    }
    
    if (slug === PLANO_ESSENCIAL) {
      return "Foque só em dirigir! Nós cobramos, recebemos, damos baixa e enviamos os recibos automaticamente.";
    }
    
    if (slug === PLANO_COMPLETO) {
      return "Adicione mais passageiros com cobrança automática e ganhe tempo para focar no que realmente importa.";
    }
    
    return "Acesse todos os recursos e mantenha seu painel sempre atualizado.";
  };

  const getPlanCTA = (planSlug?: string) => {
    const slug = planSlug?.toLowerCase() || "";
    
    if (slug === PLANO_GRATUITO) {
      return "Quero mais recursos →";
    }
    
    if (slug === PLANO_ESSENCIAL) {
      return "Quero automação total →";
    }
    
    if (slug === PLANO_COMPLETO) {
      return "Quero automatizar mais →";
    }
    
    return "Ver benefícios";
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {userItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-2.5",
                isActive
                  ? "bg-blue-600 text-white shadow-[0_12px_35px_-25px_rgba(59,130,246,0.7)]"
                  : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-base",
                    isActive
                      ? "bg-white/20 text-white"
                      : "hover:text-blue-600"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-inherit"
                    )}
                  />
                </span>
                <span>{item.title}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="hidden sm:block rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 p-5 text-white shadow-lg">
        <p className="text-sm font-semibold">
          {getPlanTitle(plano?.slug)}
        </p>
        <p className="text-xs text-white/80">
          {getPlanMessage(plano?.slug)}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            const mainSlug = getMainPlanSlug();
            const url = mainSlug ? `/planos?plano=${mainSlug}` : "/planos";
            navigate(url);
            onLinkClick?.();
          }}
          className="mt-4 w-full rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-semibold"
        >
          {getPlanCTA(plano?.slug)}
        </Button>
      </div>
    </div>
  );
}
