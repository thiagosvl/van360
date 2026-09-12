import { cn } from "@/lib/utils";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { Gift, Lock, SlidersHorizontal } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { usePermissions } from "@/hooks/business/usePermissions";
import { useSession } from "@/hooks/business/useSession";
import { useBottomNavPreferences } from "@/hooks/business/useBottomNavPreferences";
import { ROUTES } from "@/constants/routes";
import { UserType } from "@/types/enums";
import { toast } from "sonner";

interface AppSidebarProps {
  role?: UserType | string;
  onLinkClick?: () => void;
  excludeBottomNavItems?: boolean;
  isSubscriptionBlocked?: boolean;
}

export function AppSidebar({ onLinkClick, excludeBottomNavItems, isSubscriptionBlocked }: AppSidebarProps) {
  const { openReferAndEarnDialog, openPersonalizarMenuDialog } = useLayout();
  const { can, isGestor } = usePermissions();
  const { user } = useSession();
  const { activeHrefs: activeBottomHrefs, isEligibleToCustomize } = useBottomNavPreferences(user?.id);

  const isMobile = !!excludeBottomNavItems;

  const itemsToRender = (isMobile
    ? pagesItems.filter((item) => !activeBottomHrefs.includes(item.href))
    : pagesItems
  ).filter((item) => {
    if (isGestor && item.href === ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS) return false;
    if (!item.permission) return true;
    return can(item.permission);
  });

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className={isMobile ? "space-y-2 py-2" : "space-y-1 py-1"}>
        {itemsToRender.map((item) => {
          const isItemBlocked =
            isSubscriptionBlocked &&
            item.href !== ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION &&
            item.href !== ROUTES.PRIVATE.MOTORISTA.ACCOUNT;

          return (
            <NavLink
              key={item.href}
              to={isItemBlocked ? "#" : item.href}
              onClick={(e) => {
                if (isItemBlocked) {
                  e.preventDefault();
                  toast.warning("Acesso suspenso. Contrate um plano para reativar suas funcionalidades.");
                  return;
                }
                onLinkClick?.();
              }}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3.5 rounded-2xl px-4 transition-colors",
                  isMobile ? "py-3 sm:py-3.5 text-[15px] sm:text-[16px]" : "py-2.5 text-[15px]",
                  isItemBlocked
                    ? "opacity-40 cursor-not-allowed hover:bg-transparent text-slate-500"
                    : isActive
                      ? "bg-white/10 text-white font-bold shadow-xs"
                      : isMobile
                        ? "text-slate-200 font-medium hover:bg-white/5 hover:text-white"
                        : "text-slate-400 font-medium hover:bg-white/5 hover:text-slate-200"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-colors",
                      isItemBlocked
                        ? "text-slate-500"
                        : isActive
                          ? "text-white"
                          : isMobile
                            ? "text-slate-200"
                            : "text-slate-400"
                    )}
                  />
                  <span className="truncate">{item.title}</span>

                  {isItemBlocked ? (
                    <Lock className="ml-auto h-3.5 w-3.5 text-slate-500 shrink-0" />
                  ) : null}
                </>
              )}
            </NavLink>
          );
        })}

        {isGestor && !isSubscriptionBlocked && (
          <button
            type="button"
            onClick={() => {
              onLinkClick?.();
              openReferAndEarnDialog();
            }}
            className={cn(
              "w-full flex items-center gap-3.5 text-left rounded-2xl px-4 text-amber-400 font-semibold transition-colors hover:bg-white/5 hover:text-amber-300",
              isMobile ? "py-3 sm:py-3.5 text-[15px] sm:text-[16px]" : "py-2.5 text-[15px]"
            )}
          >
            <Gift className="h-5 w-5 shrink-0 text-amber-400" />
            <span className="truncate">Indique e Ganhe</span>
          </button>
        )}

        {isMobile && isEligibleToCustomize && !isSubscriptionBlocked && (
          <div className="pt-2 mt-2 border-t border-white/5 md:hidden">
            <button
              type="button"
              onClick={() => {
                onLinkClick?.();
                openPersonalizarMenuDialog();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>Personalizar atalhos do rodapé</span>
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
