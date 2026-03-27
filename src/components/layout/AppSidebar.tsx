import { cn } from "@/lib/utils";
import { getWhatsAppUrl } from "@/constants";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { pagesItems } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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

      {/* Suporte em vez de Upsell (Clean Slate) */}
      <div className="hidden sm:block rounded-2xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 p-5 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
           <MessageCircle className="h-4 w-4" />
           <p className="text-sm font-bold">Precisa de Ajuda?</p>
        </div>
        <p className="text-xs text-white/90 leading-relaxed">
           Nossa equipe de suporte está disponível para tirar suas dúvidas e receber sugestões.
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            window.open(getWhatsAppUrl(), "_blank");
            onLinkClick?.();
          }}
          className="mt-4 w-full rounded-full border-white/30 bg-white/20 text-white hover:bg-white/30 font-bold transition-all"
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Falar no WhatsApp
        </Button>
      </div>
    </div>
  );
}
