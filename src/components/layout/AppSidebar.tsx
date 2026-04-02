import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/constants";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface AppSidebarProps {
  role: "motorista";
  onLinkClick?: () => void;
}

export function AppSidebar({ onLinkClick }: AppSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {pagesItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-2.5",
                isActive
                  ? "bg-[#1a3a5c] text-white shadow-[0_12px_35px_-25px_rgba(26,58,92,0.7)]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#1a3a5c]"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-base",
                    isActive ? "bg-white/20 text-white" : "hover:text-[#1a3a5c]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-inherit"
                    )}
                  />
                </span>
                <span>{item.title}</span>

                {(item as any).badge !== undefined &&
                  (item as any).badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#1a3a5c]/10 text-[10px] font-bold text-[#1a3a5c]">
                      {(item as any).badge}
                    </span>
                  )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Canal de Suporte (Design Integrado) */}
      <div className="hidden sm:block mt-auto">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#1a3a5c]/20 hover:shadow-md">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-500/5 transition-transform group-hover:scale-110" />
          
          <div className="relative flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <WhatsAppIcon className="h-5 w-5" />
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Canal de Suporte</h4>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Fale com nossa equipe para dúvidas ou sugestões de melhoria.
              </p>
            </div>

            <button
              onClick={() => {
                window.open(getWhatsAppUrl(), "_blank");
                onLinkClick?.();
              }}
              className="mt-1 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 hover:text-[#1a3a5c]"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                (11) 96250-8068
              </span>
              <ExternalLink className="h-3 w-3 opacity-40" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
