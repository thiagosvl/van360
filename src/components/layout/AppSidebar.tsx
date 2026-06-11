import { cn } from "@/lib/utils";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";

interface AppSidebarProps {
  role: "motorista";
  onLinkClick?: () => void;
}

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {pagesItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-2.5",
                isActive
                  ? "bg-[#1a3a5c] text-white shadow-[0_12px_35px_-25px_rgba(26,58,92,0.7)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#1a3a5c]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-base",
                    isActive ? "bg-white/20 text-white" : "hover:text-[#1a3a5c]"
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

                {(item as any).badge !== undefined &&
                  (item as any).badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1a3a5c]/10 text-[10px] font-bold text-[#1a3a5c]">
                      {(item as any).badge}
                    </span>
                  )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
