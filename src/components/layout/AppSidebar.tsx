import { cn } from "@/lib/utils";
import { pagesItems, bottomNavHrefs } from "@/utils/domain/pages/pagesUtils";
import { NavLink } from "react-router-dom";
import { detectPlatform, isNativeApp, PLAY_STORE_URL, PLAY_STORE_BADGE_URL } from "@/utils/detectPlatform";
import { Smartphone } from "lucide-react";
import { CompactReferAndEarnCard } from "@/components/features/subscription/CompactReferAndEarnCard";

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
                "flex items-center gap-3 rounded-xl px-4 py-2 text-[15px] transition-colors",
                isActive
                  ? "bg-white/10 text-white font-bold shadow-sm"
                  : "text-slate-400 font-medium hover:bg-white/5 hover:text-slate-200"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-lg shrink-0",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5",
                      isActive ? "text-white" : "text-slate-400"
                    )}
                  />
                </span>
                <span className="truncate">{item.title}</span>

                {(item as any).badge !== undefined &&
                  (item as any).badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                      {(item as any).badge}
                    </span>
                  )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bloco de Download / Plataforma / Indique e Ganhe */}
      {isNative || platform === "ios-web" ? (
        <div className="mt-auto px-4 pb-8 md:pb-4 pt-2">
          <CompactReferAndEarnCard />
        </div>
      ) : (
        <div className="mt-auto px-4 pb-2 md:pb-4">

          {/* Desktop (Minimalista e objetivo) */}
          {platform === "desktop" && (
            <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-3">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:scale-[1.03] transition-transform"
              >
                <img src={PLAY_STORE_BADGE_URL} alt="Google Play" className="h-12 object-contain drop-shadow-sm brightness-110" />
              </a>
              <p className="text-[10px] text-slate-400 font-medium text-center leading-tight">
                Também funciona no iPhone via navegador.
              </p>
            </div>
          )}

          {/* Android Web */}
          {platform === "android-web" && (
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center text-center w-full shadow-sm">
              <p className="text-[14px] font-bold text-[#0b1a2e] leading-tight mb-2">
                Baixe nosso aplicativo
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
        </div>
      )}
    </div>
  );
}
