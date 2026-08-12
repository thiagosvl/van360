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
import { isDevEnv } from "@/utils/detectPlatform";

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
    title: "Evolution",
    href: ROUTES.PRIVATE.ADMIN.EVOLUTION_INSTANCES,
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
      <div className="py-6 px-4 border-b border-slate-800/60 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/logo-van360.webp"
            alt="VAN360"
            className="h-10 sm:h-12 w-auto select-none brightness-0 invert object-contain"
          />

          <div className="flex items-center justify-center">
            {isDevEnv() ? (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Ambiente DEV
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Ambiente Produção
              </div>
            )}
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
    </aside>
  );
}
