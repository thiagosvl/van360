import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Share2,
  Settings,
  ChevronRight,
  Calculator,
  ShieldAlert,
  Terminal,
  FileText,
  Bell,
  Radio,
  Receipt,
  ArrowUpRight,
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
    title: "Faturas",
    href: ROUTES.PRIVATE.ADMIN.INVOICES,
    icon: Receipt,
  },
  {
    title: "Repasses Pix",
    href: ROUTES.PRIVATE.ADMIN.REPASSES,
    icon: ArrowUpRight,
  },
  {
    title: "Histórico de Atividades",
    href: ROUTES.PRIVATE.ADMIN.ACTIVITY_HISTORY,
    icon: Terminal,
  },
  {
    title: "Notificações",
    href: ROUTES.PRIVATE.ADMIN.NOTIFICATIONS,
    icon: Bell,
  },
  {
    title: "Radar de Usuários",
    href: ROUTES.PRIVATE.ADMIN.USERS_RADAR,
    icon: Radio,
  },
  {
    title: "Indicações",
    href: ROUTES.PRIVATE.ADMIN.REFERRALS,
    icon: Share2,
  },
  {
    title: "Configurações",
    href: ROUTES.PRIVATE.ADMIN.SETTINGS,
    icon: Settings,
  },
  /* {
    title: "Evolution",
    href: ROUTES.PRIVATE.ADMIN.EVOLUTION_INSTANCES,
    icon: MessageSquare,
  }, */
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
    <aside className="w-72 text-sidebar-foreground flex flex-col h-full overflow-y-auto pt-[var(--safe-area-top)] pb-[var(--safe-area-bottom)] bg-sidebar border-r border-sidebar-border [scrollbar-width:thin]">
      <div className="py-6 px-4 border-b border-sidebar-border/60 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/assets/logo-van360.webp"
            alt="VAN360"
            className="h-10 sm:h-11 w-auto select-none brightness-0 invert object-contain"
          />

          <div className="flex items-center justify-center">
            {isDevEnv() ? (
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                DEV
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Produção
              </div>
            )}
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-4 w-4 transition-transform group-hover:scale-105", isActive ? "text-primary-foreground" : "text-sidebar-foreground/60")} />
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-80" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
