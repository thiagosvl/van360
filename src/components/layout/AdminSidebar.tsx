import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronRight,
  Calculator,
  ShieldAlert,
  Terminal,
  MessageSquare,
  FileText
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

const adminNavItems = [
  {
    title: "Dashboard",
    href: ROUTES.PRIVATE.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Usuários",
    href: ROUTES.PRIVATE.ADMIN.USERS,
    icon: Users,
  },
  {
    title: "Histórico de Atividades",
    href: ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY,
    icon: Terminal,
  },
  {
    title: "Configurações",
    href: ROUTES.PRIVATE.ADMIN.SETTINGS,
    icon: Settings,
  },
  {
    title: "WhatsApp",
    href: ROUTES.PRIVATE.ADMIN.WHATSAPP_INSTANCES,
    icon: MessageSquare,
  },
  {
    title: "Blog",
    href: ROUTES.PRIVATE.ADMIN.BLOG,
    icon: FileText,
  },
  {
    title: "Tentativas de Login",
    href: ROUTES.PRIVATE.ADMIN.LOGIN_ATTEMPTS,
    icon: ShieldAlert,
  },
  {
    title: "Calculadora",
    href: ROUTES.PRIVATE.ADMIN.CALCULATOR,
    icon: Calculator,
  },
];

interface AdminSidebarProps {
  onLinkClick?: () => void;
}

export function AdminSidebar({ onLinkClick }: AdminSidebarProps) {
  return (
    <aside className="w-72 text-slate-100 flex flex-col h-[100dvh] sticky top-0 overflow-y-auto pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)] bg-[#0d1424] border-r border-slate-800/80">
      {/* Logo Area */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">V</span>
          </div>
          <div>
            <h1 className="font-headline font-black text-lg tracking-tighter leading-none text-white">VAN360 - {import.meta.env.DEV ? "DEV" : "PROD"}</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Painel Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 translate-x-2"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-slate-400")} />
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-70" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Info Context */}
      <div className="p-4 mt-auto">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center font-black text-xs text-white">
              A
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">Administrador</p>
              <p className="text-[10px] text-slate-400 truncate">contato@van360.com.br</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
