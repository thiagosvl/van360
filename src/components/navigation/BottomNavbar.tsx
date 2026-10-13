import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { ROUTES } from "@/constants/routes";

import { useSession } from "@/hooks/business/useSession";
import { useBottomNavPreferences } from "@/hooks/business/useBottomNavPreferences";

interface BottomNavbarProps {
  isSubscriptionBlocked?: boolean;
}

export function BottomNavbar({ isSubscriptionBlocked }: BottomNavbarProps = {}) {
  if (isSubscriptionBlocked) return null;

  const location = useLocation();
  const { user } = useSession();
  const { activeHrefs } = useBottomNavPreferences(user?.id);

  const navItems = activeHrefs
    .map(href => pagesItems.find(item => item.href === href))
    .filter(Boolean) as typeof pagesItems;

  const isMenuActive = location.pathname === ROUTES.PRIVATE.MOTORISTA.MENU || !navItems.some(item => location.pathname === item.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4rem+var(--safe-area-bottom))] items-center border-t border-[#e5e5e5] bg-white/95 px-1 pb-[var(--safe-area-bottom)] backdrop-blur-md md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex-1 flex flex-col items-center justify-center gap-1 min-[390px]:gap-1.5 py-1.5 transition-colors active:scale-95 cursor-pointer",
              isActive
                ? "text-[#0a0a0a]"
                : "text-[#737373] hover:text-[#0a0a0a]"
            )
          }
        >
          {({ isActive }) => (
            <>
              <item.icon className="h-5 w-5 min-[390px]:h-[22px] min-[390px]:w-[22px] shrink-0" />
              <span className={cn("text-[10px] min-[390px]:text-[11px] leading-tight", isActive ? "font-semibold" : "font-medium")}>
                {item.title}
              </span>
            </>
          )}
        </NavLink>
      ))}

      <NavLink
        to={ROUTES.PRIVATE.MOTORISTA.MENU}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-1 min-[390px]:gap-1.5 py-1.5 transition-colors active:scale-95 cursor-pointer",
          isMenuActive
            ? "text-[#0a0a0a]"
            : "text-[#737373] hover:text-[#0a0a0a]"
        )}
      >
        <LayoutGrid className="h-5 w-5 min-[390px]:h-[22px] min-[390px]:w-[22px] shrink-0" />
        <span className={cn("text-[10px] min-[390px]:text-[11px] leading-tight", isMenuActive ? "font-semibold" : "font-medium")}>
          Menu
        </span>
      </NavLink>
    </nav>
  );
}

