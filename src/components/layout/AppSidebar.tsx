import { cn } from "@/lib/utils";
import { pagesItems, bottomNavHrefs } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { detectPlatform, isNativeApp, PLAY_STORE_URL, PLAY_STORE_BADGE_URL } from "@/utils/detectPlatform";
import { Smartphone } from "lucide-react";

interface AppSidebarProps {
  role: "motorista";
  onLinkClick?: () => void;
  excludeBottomNavItems?: boolean;
}

export function AppSidebar({ onLinkClick, excludeBottomNavItems }: AppSidebarProps) {
  const platform = detectPlatform();
  const isNative = isNativeApp();

  const itemsToRender = excludeBottomNavItems
    ? pagesItems.filter((item) => !(bottomNavHrefs as string[]).includes(item.href))
    : pagesItems;

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1 md:space-y-1">
        {itemsToRender.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onLinkClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-1.5 text-sm font-semibold transition-colors md:py-1.5",
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

      {/* Bloco de Download / Plataforma */}
      {!isNative && (
        <div className="mt-auto px-4 pb-4">

          {/* Desktop (Minimalista e objetivo) */}
          {platform === "desktop" && (
            <div className="flex flex-col items-center gap-2 border-t border-slate-100 pt-3">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-[1.03] transition-transform"
              >
                <img src={PLAY_STORE_BADGE_URL} alt="Google Play" className="h-12 object-contain drop-shadow-sm" />
              </a>
              <p className="text-[10px] text-slate-400 font-medium text-center leading-tight">
                Também funciona no iPhone via navegador.
              </p>
            </div>
          )}

          {/* Mobile Web (Completo e Rico) */}
          {(platform === "android-web" || platform === "ios-web") && (
            <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-4 flex flex-col items-center gap-3">

              {/* Android Web */}
              {platform === "android-web" && (
                <div className="flex flex-col items-center text-center w-full">
                  <p className="text-[13px] font-bold text-[#1a3a5c] mb-1">Baixe o App Van360!</p>
                  <p className="text-[11px] text-slate-500 mb-3 leading-tight">
                    Tenha uma experiência ainda mais rápida no dia a dia.
                  </p>
                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:scale-[1.03] transition-transform w-full flex justify-center"
                  >
                    <img src={PLAY_STORE_BADGE_URL} alt="Google Play" className="h-14 object-contain drop-shadow-sm" />
                  </a>
                </div>
              )}

              {/* iOS Web */}
              {platform === "ios-web" && (
                <div className="flex flex-col items-center text-center w-full py-1">
                  <div className="w-10 h-10 rounded-full bg-[#1a3a5c]/5 flex items-center justify-center mb-2">
                    <Smartphone className="w-5 h-5 text-[#1a3a5c]" />
                  </div>
                  <p className="text-[13px] font-bold text-[#1a3a5c] mb-1">App nativo em breve</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Aguarde novidades para a App Store.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
