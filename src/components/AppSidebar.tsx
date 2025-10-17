import {
  ChartArea,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const adminItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
  { title: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

const motoristaItems = [
  { title: "Início", href: "/inicio", icon: LayoutDashboard },
  { title: "Mensalidades", href: "/mensalidades", icon: CreditCard },
  { title: "Passageiros e Pré-Cadastros", href: "/passageiros", icon: Users },
  { title: "Relatórios", href: "/relatorios", icon: ChartArea },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
  { title: "Escolas", href: "/escolas", icon: GraduationCap },
  { title: "Gastos", href: "/gastos", icon: Wallet },
];

interface AppSidebarProps {
  role: "admin" | "motorista";
  onLinkClick: () => void;
}

export function AppSidebar({ role, onLinkClick }: AppSidebarProps) {
  const menuItems = role === "admin" ? adminItems : motoristaItems;

  return (
    <nav className="flex flex-col gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          onClick={onLinkClick}
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