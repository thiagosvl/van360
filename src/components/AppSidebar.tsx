import {
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const adminItems = [
  // ... (conteúdo do array adminItems permanece o mesmo)
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Usuários", href: "/admin/usuarios", icon: Users },
  { title: "Configurações", href: "/admin/configuracoes", icon: Settings },
];

const motoristaItems = [
  // ... (conteúdo do array motoristaItems permanece o mesmo)
  { title: "Início", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mensalidades", href: "/mensalidades", icon: CreditCard },
  { title: "Passageiros", href: "/passageiros", icon: Users },
  { title: "Escolas", href: "/escolas", icon: GraduationCap },
  { title: "Gastos", href: "/gastos", icon: Wallet },
  { title: "Configurações", href: "/configuracoes", icon: Settings },
];

// 1. Definir as props que o componente vai receber, incluindo a nova função
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
          // 2. Adicionar o onClick para chamar a função que fecha o menu
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