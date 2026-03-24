import { cn } from "@/lib/utils";
import { 
  CreditCard, 
  GraduationCap, 
  LayoutDashboard, 
  Menu, 
  Users 
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

import { useLayout } from "@/contexts/LayoutContext";

export function BottomNavbar() {
  const { setIsMobileMenuOpen } = useLayout();
  
  const navItems = [
    {
      title: "Início",
      href: ROUTES.PRIVATE.MOTORISTA.HOME,
      icon: LayoutDashboard,
    },
    {
      title: "Passageiros",
      href: ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
      icon: Users,
    },
    {
      title: "Mensalidades",
      href: ROUTES.PRIVATE.MOTORISTA.BILLING,
      icon: CreditCard,
    },
    {
      title: "Escolas",
      href: ROUTES.PRIVATE.MOTORISTA.SCHOOLS,
      icon: GraduationCap,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-100 bg-white/80 px-2 pb-safe backdrop-blur-lg md:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 transition-colors px-3 py-1 rounded-xl",
              isActive ? "text-blue-600" : "text-slate-400"
            )
          }
        >
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.title}</span>
        </NavLink>
      ))}
      
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="flex flex-col items-center justify-center gap-1 px-3 py-1 text-slate-400"
      >
        <Menu className="h-5 w-5" />
        <span className="text-[10px] font-medium">Mais</span>
      </button>
    </nav>
  );
}
