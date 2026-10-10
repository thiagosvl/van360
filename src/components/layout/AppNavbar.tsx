import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import {
  IdCard,
  Route,
  User,
  Users,
  Compass,
  ChevronRight,
  LayoutGrid,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { PageItem, pagesItems } from "@/utils/domain/pages/pagesUtils";
import { cn } from "@/lib/utils";
import { useSubscriptionAccess } from "@/hooks/business/useSubscriptionAccess";
import { formatFirstName } from "@/utils/formatters";

export function AppNavbar({ role }: { role: "motorista" }) {
  const { pageTitle } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { isBlocked: isSubscriptionBlocked } = useSubscriptionAccess(user?.id);

  const hasLogo = Boolean(profile?.logo_url && profile.logo_url.trim().length > 0);
  const displayName = profile?.apelido || (profile?.nome ? formatFirstName(profile.nome) : null) || "Minha Conta";

  let currentPage: PageItem | undefined = pagesItems.find(item => item.href === location.pathname);
  if (!currentPage && location.pathname === ROUTES.PRIVATE.MOTORISTA.PASSENGERS_BATCH) {
    currentPage = {
      title: "Atualização Rápida",
      href: location.pathname,
      icon: Users,
    };
  } else if (!currentPage && location.pathname.startsWith(`${ROUTES.PRIVATE.MOTORISTA.PASSENGERS}/`)) {
    currentPage = {
      title: "Carteirinha",
      href: location.pathname,
      icon: IdCard,
    };
  } else if (!currentPage && location.pathname.startsWith(ROUTES.PRIVATE.MOTORISTA.CHARTERS)) {
    currentPage = {
      title: location.pathname === ROUTES.PRIVATE.MOTORISTA.CHARTERS ? "Fretamentos" : "Detalhes do Passeio",
      href: location.pathname,
      icon: Compass,
    };
  }
  if (!currentPage && location.pathname === ROUTES.PRIVATE.MOTORISTA.ACCOUNT) {
    currentPage = {
      title: "Conta",
      href: location.pathname,
      icon: User,
    };
  } else if (!currentPage && location.pathname === ROUTES.PRIVATE.MOTORISTA.MENU) {
    currentPage = {
      title: "Menu",
      href: location.pathname,
      icon: LayoutGrid,
    };
  }

  const displayTitle = (pageTitle && pageTitle !== "Carregando...") ? pageTitle : (currentPage?.title || "");
  const isAccountActive = location.pathname === ROUTES.PRIVATE.MOTORISTA.ACCOUNT;

  const handleLogoClick = () => {
    if (isSubscriptionBlocked) {
      if (location.pathname !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION) {
        navigate(ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION);
      }
      return;
    }
    navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-[#e5e5e5] bg-white/95 backdrop-blur-md h-[calc(4rem+var(--safe-area-top))] sm:h-[calc(4.5rem+var(--safe-area-top))] pt-[var(--safe-area-top)] transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 relative">
        <div className="flex-1 flex items-center min-w-0">
          <div className="flex md:hidden shrink-0">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer transition-opacity hover:opacity-80"
              onClick={handleLogoClick}
            />
          </div>

          <div className="hidden md:flex items-center gap-3.5 min-w-0">
            {displayTitle && (
              <>
                <div className="h-10 w-10 shrink-0 rounded-[14px] bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5] flex items-center justify-center">
                  {currentPage?.icon ? (
                    <currentPage.icon className="h-5 w-5 text-[#0a0a0a]" />
                  ) : (
                    <Route className="h-5 w-5 text-[#0a0a0a]" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h1 className="text-lg sm:text-xl font-semibold text-[#0a0a0a] tracking-tight truncate leading-none">
                    {displayTitle}
                  </h1>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden max-w-[55%] sm:max-w-[60%] pointer-events-none">
          {displayTitle && (
            <h1 className="text-base font-semibold text-[#0a0a0a] tracking-tight leading-tight truncate text-center">
              {displayTitle}
            </h1>
          )}
        </div>

        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Desktop User / Profile Chip */}
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ACCOUNT)}
            className={cn(
              "hidden md:flex items-center gap-2.5 h-10 pl-2 pr-3 rounded-[18px] border cursor-pointer active:scale-98 text-xs",
              isAccountActive
                ? "bg-[#fafafa] border-[#d5d5d5] shadow-xs"
                : "bg-white border-[#e5e5e5] hover:border-[#a3a3a3] hover:bg-[#fafafa] shadow-xs"
            )}
          >
            <div
              className={cn(
                "h-7 w-7 rounded-full overflow-hidden bg-[#f5f5f5] border border-[#e5e5e5] shrink-0 flex items-center justify-center",
                !hasLogo && "p-0.5"
              )}
            >
              {hasLogo ? (
                <img
                  src={profile?.logo_url || ""}
                  alt={displayName}
                  className="h-full w-full object-cover rounded-full"
                />
              ) : (
                <User className="h-3.5 w-3.5 text-[#0a0a0a]" />
              )}
            </div>
            <div className="flex flex-col text-left min-w-0 pr-0.5">
              <span className="text-xs font-semibold text-[#0a0a0a] truncate leading-tight max-w-[130px]">
                {displayName}
              </span>
              <span className="text-[10px] text-[#737373] font-medium leading-tight">
                Conta
              </span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-[#a3a3a3] shrink-0 ml-0.5" />
          </button>

          {/* Mobile Close Button on Menu Page, or Profile Button elsewhere */}
          {location.pathname === ROUTES.PRIVATE.MOTORISTA.MENU ? (
            <button
              type="button"
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate(ROUTES.PRIVATE.MOTORISTA.HOME);
                }
              }}
              aria-label="Fechar Menu"
              className="flex md:hidden items-center justify-center h-9 w-9 rounded-full bg-[#f5f5f5] text-[#0a0a0a] hover:bg-[#e5e5e5] active:scale-95 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ACCOUNT)}
              aria-label="Minha Conta"
              className="flex md:hidden flex-col items-center justify-center outline-none p-1 cursor-pointer group active:scale-95"
            >
              <div
                className={cn(
                  "h-9 w-9 rounded-full border flex items-center justify-center overflow-hidden",
                  hasLogo
                    ? "border-[#e5e5e5] bg-white shadow-xs"
                    : isAccountActive
                      ? "bg-primary border-primary text-primary-foreground shadow-xs"
                      : "bg-white border-[#e5e5e5] text-[#737373] group-hover:text-[#0a0a0a]"
                )}
              >
                {hasLogo ? (
                  <img
                    src={profile?.logo_url || ""}
                    alt="Conta"
                    className="h-full w-full object-cover rounded-full"
                  />
                ) : (
                  <User className="h-4.5 w-4.5" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] leading-none mt-1",
                  isAccountActive ? "text-[#0a0a0a] font-semibold" : "text-[#737373] font-medium"
                )}
              >
                Conta
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
