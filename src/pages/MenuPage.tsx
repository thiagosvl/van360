import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  SearchX,
  X,
  Gift,
  SlidersHorizontal,
  User,
  Lock,
  LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { pagesItems, PageItem } from "@/utils/domain/pages/pagesUtils";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { useBottomNavPreferences } from "@/hooks/business/useBottomNavPreferences";
import { useLayout } from "@/contexts/LayoutContext";
import { WhatsAppSupportButton } from "@/components/ui/WhatsAppSupportButton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  title: string;
  href?: string;
  icon: LucideIcon | PageItem["icon"];
  onClick?: () => void;
  permission?: PageItem["permission"];
  isSpecial?: boolean;
}

export default function MenuPage() {
  const navigate = useNavigate();
  const { can, isGestor } = usePermissions();
  const { user } = useSession();
  const { isBlocked: isSubscriptionBlocked } = useSubscriptionAccess(user?.id);
  const { isEligibleToCustomize } = useBottomNavPreferences(user?.id);
  const { openReferAndEarnDialog, openPersonalizarMenuDialog, setPageTitle } = useLayout();

  useEffect(() => {
    setPageTitle("Menu");
  }, [setPageTitle]);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        navigate(ROUTES.PRIVATE.MOTORISTA.HOME, { replace: true });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const allMenuItems = useMemo<MenuItem[]>(() => {
    const regularItems: MenuItem[] = pagesItems
      .filter((item) => item.href !== ROUTES.PRIVATE.MOTORISTA.HOME)
      .filter((item) => {
        if (isGestor && item.href === ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS) return false;
        if (!item.permission) return true;
        return can(item.permission);
      })
      .map((item) => ({
        id: item.href,
        title: item.title,
        href: item.href,
        icon: item.icon,
        permission: item.permission,
      }));

    const additionalItems: MenuItem[] = [];

    if (isGestor && !isSubscriptionBlocked) {
      additionalItems.push({
        id: "indique-e-ganhe",
        title: "Indique e Ganhe",
        icon: Gift,
        onClick: () => openReferAndEarnDialog(),
        isSpecial: true,
      });
    }

    additionalItems.push({
      id: "minha-conta",
      title: "Minha Conta",
      href: ROUTES.PRIVATE.MOTORISTA.ACCOUNT,
      icon: User,
    });

    return [...regularItems, ...additionalItems];
  }, [can, isGestor, isSubscriptionBlocked, openReferAndEarnDialog]);

  const filteredItems = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return allMenuItems;
    return allMenuItems.filter((item) => item.title.toLowerCase().includes(term));
  }, [allMenuItems, searchQuery]);

  const handleItemClick = (item: MenuItem, e: React.MouseEvent) => {
    const isItemBlocked =
      isSubscriptionBlocked &&
      item.href !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION &&
      item.href !== ROUTES.PRIVATE.MOTORISTA.ACCOUNT;

    if (isItemBlocked) {
      e.preventDefault();
      toast.warning("Acesso suspenso. Contrate um plano para reativar suas funcionalidades.");
      return;
    }

    if (item.onClick) {
      item.onClick();
    }
  };

  return (
    <div className="flex flex-col gap-3 px-2 min-[360px]:px-3 min-[390px]:px-4 pb-8 max-w-lg mx-auto w-full pt-1">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
          <Input
            type="text"
            inputMode="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O que você procura?"
            className="w-full h-11 min-[360px]:h-12 pl-10 pr-9 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm font-normal text-[#0a0a0a] placeholder:text-[#737373] transition-all shadow-xs [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {isEligibleToCustomize && (
          <button
            type="button"
            onClick={() => {
              if (isSubscriptionBlocked) {
                toast.warning("Acesso suspenso. Contrate um plano para reativar suas funcionalidades.");
                return;
              }
              openPersonalizarMenuDialog();
            }}
            aria-label="Personalizar atalhos"
            title="Personalizar atalhos"
            className="h-11 w-11 min-[360px]:h-12 min-[360px]:w-12 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] hover:border-[#737373]/60 flex items-center justify-center text-[#0a0a0a] hover:text-primary hover:bg-[#fafafa] active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4 min-[360px]:h-5 min-[360px]:w-5 stroke-[1.75]" />
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-white rounded-[20px] border border-[#e5e5e5] shadow-xs mt-1">
          <div className="h-12 w-12 rounded-full bg-[#f5f5f5] flex items-center justify-center text-[#737373] mb-2.5">
            <SearchX className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-[#0a0a0a]">
            Nenhum resultado encontrado
          </p>
          <p className="text-xs text-[#737373] mt-1 max-w-[240px]">
            Não encontramos nenhuma opção para "{searchQuery}".
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
          >
            Limpar busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 min-[360px]:gap-2.5 min-[390px]:gap-3 pt-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isItemBlocked =
              isSubscriptionBlocked &&
              item.href !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION &&
              item.href !== ROUTES.PRIVATE.MOTORISTA.ACCOUNT;

            const content = (
              <>
                <div
                  className={cn(
                    "w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 rounded-[12px] min-[360px]:rounded-[14px] flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 relative",
                    item.isSpecial
                      ? "bg-amber-100 text-amber-600"
                      : "bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="w-[18px] h-[18px] min-[360px]:w-5 min-[360px]:h-5 stroke-[1.75]" />
                  {isItemBlocked && (
                    <Lock className="absolute -top-1 -right-1 h-3.5 w-3.5 text-[#737373] bg-white rounded-full p-0.5 border border-[#e5e5e5]" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] min-[360px]:text-xs font-medium leading-[1.2] text-center w-full px-0.5 line-clamp-2 transition-colors",
                    item.isSpecial
                      ? "text-amber-800 font-semibold"
                      : "text-[#171717] group-hover:text-primary"
                  )}
                >
                  {item.title}
                </span>
              </>
            );

            const tileClassName = cn(
              "flex flex-col items-center justify-center p-2 min-[360px]:p-2.5 rounded-[18px] min-[360px]:rounded-[20px] bg-white border border-[#e5e5e5] shadow-2xs hover:shadow-xs hover:border-[#d4d4d4] active:scale-[0.97] transition-all group cursor-pointer w-full aspect-square text-center gap-1.5 relative",
              item.isSpecial
                ? "bg-amber-50/60 border-amber-200/90 hover:bg-amber-50 hover:border-amber-300"
                : "hover:bg-[#fafafa]",
              isItemBlocked && "opacity-50"
            );

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  to={isItemBlocked ? "#" : item.href}
                  onClick={(e) => handleItemClick(item, e)}
                  className={tileClassName}
                >
                  {content}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleItemClick(item, e)}
                className={tileClassName}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}

      <div className="pt-2 min-[390px]:pt-3">
        <h3 className="text-[11px] sm:text-xs font-semibold text-[#737373] uppercase tracking-wider px-1 mb-2">
          Suporte
        </h3>
        <WhatsAppSupportButton
          variant="clean"
          title="Falar com Suporte"
          subtitle="Atendimento rápido para tirar dúvidas sobre o app"
          message="Olá, preciso de ajuda com o Van360"
        />
      </div>
    </div>
  );
}
