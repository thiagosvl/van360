import {
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const adminItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
  { title: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

const motoristaItems = [
  { title: "Início", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mensalidades", href: "/mensalidades", icon: CreditCard },
  { title: "Passageiros", href: "/passageiros", icon: Users },
  { title: "Escolas", href: "/escolas", icon: GraduationCap },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];

export function AppSidebar({ role }: { role: "admin" | "motorista" }) {
  const menuItems = role === "admin" ? adminItems : motoristaItems;

  return (
    <nav className="flex flex-col gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary/10 text-primary border-l-4 border-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`
          }
        >
          <item.icon className="mr-3 h-5 w-5" />
          <span>{item.title}</span>
        </NavLink>
      ))}
    </nav>
  );
}
