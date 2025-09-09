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
];

export function AppSidebar({ role }: { role: "admin" | "motorista" }) {
  const menuItems = role === "admin" ? adminItems : motoristaItems;

  return (
    <div className="flex h-full flex-col">
      <div className="p-6">
        <h2 className="text-lg font-semibold">Sistema Transporte</h2>
      </div>

      <nav className="flex-1 space-y-1 px-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
