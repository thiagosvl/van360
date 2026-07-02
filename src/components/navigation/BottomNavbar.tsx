import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { useLocation, NavLink } from "react-router-dom";
import { pagesItems, bottomNavHrefs } from "@/utils/domain/pages/pagesUtils";

import { useLayout } from "@/contexts/LayoutContext";

export function BottomNavbar() {
  const { setIsMobileMenuOpen } = useLayout();
  const location = useLocation();

  const navItems = bottomNavHrefs
    .map(href => pagesItems.find(item => item.href === href))
    .filter(Boolean) as typeof pagesItems;
  const isMoreActive = !navItems.some(item => location.pathname === item.href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[calc(4rem+var(--safe-area-bottom))] items-center justify-around border-t border-gray-100 bg-white/80 px-2 pb-[var(--safe-area-bottom)] backdrop-blur-lg md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 transition-colors px-2 py-1 rounded-xl",
              isActive ? "text-[#1a3a5c]" : "text-slate-400"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.title}</span>
        </NavLink>
      ))}

      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className={cn(
          "flex flex-col items-center justify-center gap-1 pl-2 py-1 transition-colors",
          isMoreActive ? "text-[#1a3a5c]" : "text-slate-400"
        )}
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium">Mais</span>
      </button>
    </nav>
  );
}
