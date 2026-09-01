import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import {
  IdCard,
  Route,
  User,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function AppNavbar({ role }: { role: "motorista" }) {
  const { pageTitle } = useLayout();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSession();
  const { profile, isLoading: isLoadingProfile } = useProfile(user?.id);

  let currentPage: any = pagesItems.find(item => item.href === location.pathname);
  if (!currentPage && location.pathname.startsWith("/passageiros/")) {
    currentPage = {
      title: "Carteirinha",
      href: location.pathname,
      icon: IdCard,
    };
  }
  if (!currentPage && location.pathname === ROUTES.PRIVATE.MOTORISTA.ACCOUNT) {
    currentPage = {
      title: "Conta",
      href: location.pathname,
      icon: User,
    };
  }

  const displayTitle = currentPage?.title || pageTitle;
  const isAccountActive = location.pathname === ROUTES.PRIVATE.MOTORISTA.ACCOUNT;

  return (
    <header className="fixed top-0 right-0 left-0 md:left-72 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md h-[calc(4rem+var(--safe-area-top))] sm:h-[calc(5rem+var(--safe-area-top))] pt-[var(--safe-area-top)] transition-all">
      <div className="flex h-full items-center justify-between px-4 sm:px-8 relative">
        <div className="flex-1 flex items-center min-w-0">
          <div className="flex md:hidden shrink-0">
            <img
              src="/assets/logo-van360.webp"
              alt="Van360"
              className="h-8 sm:h-9 w-auto cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.HOME)}
            />
          </div>

          <div className="hidden md:flex items-center gap-3 min-w-0">
            {displayTitle && (
              <>
                <div className="h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-[#1a3a5c]">
                  {currentPage?.icon ? (
                    <currentPage.icon className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Route className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-xl font-bold text-[#1a3a5c] tracking-tight leading-none truncate">
                    {displayTitle}
                  </h2>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center md:hidden max-w-[55%] sm:max-w-[60%] pointer-events-none">
          {displayTitle && (
            <h2 className="text-[15px] sm:text-base font-bold text-[#1a3a5c] tracking-tight leading-tight truncate text-center">
              {displayTitle}
            </h2>
          )}
        </div>

        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.ACCOUNT)}
            className="group flex flex-col items-center justify-center outline-none p-0.5 transition-all cursor-pointer"
          >
            <div
              className={cn(
                "h-[34px] w-[34px] md:h-[37px] md:w-[37px] rounded-full border flex items-center justify-center shadow-xs transition-all",
                isAccountActive
                  ? "bg-[#1a3a5c] border-[#1a3a5c] text-white"
                  : "bg-slate-50 border-slate-200 text-[#1a3a5c] group-hover:bg-slate-200/80 group-hover:border-slate-300"
              )}
            >
              {isLoadingProfile ? (
                <Skeleton className="h-full w-full rounded-full" />
              ) : (
                <User
                  className={cn(
                    "h-5 w-5 md:h-[21px] md:w-[21px]",
                    isAccountActive ? "text-white" : "text-[#1a3a5c]"
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "text-[10px] md:text-[11.5px] font-medium leading-none mt-0.5 md:mt-1 transition-colors",
                isAccountActive
                  ? "text-[#1a3a5c] font-bold"
                  : "text-slate-500 group-hover:text-slate-800"
              )}
            >
              Conta
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
