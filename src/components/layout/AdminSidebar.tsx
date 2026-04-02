import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Bus,
  School,
  Wallet,
  History,
  Settings,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

const adminNavItems = [
  {
    title: "Dashboard",
    href: ROUTES.PRIVATE.ADMIN.DASHBOARD,
    icon: LayoutDashboard,
  },
];

export function AdminSidebar() {
  return (
    <aside className="w-72 bg-[#1a3a5c] text-white flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Logo Area */}
      <div className="p-8 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-[#1a3a5c] font-black text-xl">V</span>
          </div>
          <div>
            <h1 className="font-headline font-black text-lg tracking-tighter leading-none">VAN360</h1>
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Painel Admin</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300",
                isActive
                  ? "bg-white text-[#1a3a5c] shadow-xl shadow-black/20 translate-x-2"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", isActive ? "text-[#1a3a5c]" : "text-white/40")} />
                <span className="flex-1">{item.title}</span>
                {isActive && <ChevronRight className="h-4 w-4 opacity-50" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Info Context */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-slate-400 border-2 border-white/20 overflow-hidden">
              {/* Avatar Placeholder */}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Administrador</p>
              <p className="text-[10px] text-white/40 truncate">contato@van360.com.br</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
