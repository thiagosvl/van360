import { cn } from "@/lib/utils";
import { pagesItems, bottomNavHrefs } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { Gift } from "lucide-react";
import { useLayout } from "@/contexts/LayoutContext";
import { UserType } from "@/types/enums";

interface AppSidebarProps {
  role: UserType.MOTORISTA | "motorista";
  onLinkClick?: () => void;
  excludeBottomNavItems?: boolean;
}

export function AppSidebar({ onLinkClick, excludeBottomNavItems }: AppSidebarProps) {
  const { openReferAndEarnDialog } = useLayout();

  const isMobile = !!excludeBottomNavItems;

  const itemsToRender = isMobile
    ? pagesItems.filter((item) => !(bottomNavHrefs as string[]).includes(item.href))
    : pagesItems;

  return (
    <div className="flex h-full flex-col justify-between">
      <nav className={isMobile ? "space-y-2 py-2" : "space-y-1 py-1"}>
        {itemsToRender.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3.5 rounded-2xl px-4 transition-colors",
                isMobile ? "py-3 sm:py-3.5 text-[15px] sm:text-[16px]" : "py-2.5 text-[15px]",
                isActive
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
                    isActive ? "text-white" : isMobile ? "text-slate-200" : "text-slate-400"
                  )}
                />
                <span className="truncate">{item.title}</span>

                {(item as any).badge !== undefined && (item as any).badge > 0 && (
                  <span className="ml-auto flex h-5 min-w-5 px-1.5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                    {(item as any).badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}

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
      </nav>
    </div>
  );
}
