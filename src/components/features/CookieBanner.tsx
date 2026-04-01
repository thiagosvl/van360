import { useEffect } from "react";

interface CookieBannerProps {
  isPending: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCustomize: () => void;
}

export function CookieBanner({ isPending, onAccept, onReject, onCustomize }: CookieBannerProps) {
  useEffect(() => {
    if (!isPending) {
      document.body.style.paddingBottom = "";
      return;
    }

    const apply = () => {
      document.body.style.paddingBottom = window.innerWidth < 640 ? "68px" : "56px";
    };

    apply();
    window.addEventListener("resize", apply);

    return () => {
      window.removeEventListener("resize", apply);
      document.body.style.paddingBottom = "";
    };
  }, [isPending]);

  if (!isPending) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#1a3a5c] border-t border-white/10 shadow-[0_-4px_24px_rgba(0,0,0,.3)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8">
          <p className="text-[12px] sm:text-[14px] text-white/80 leading-snug sm:flex-1">
            Este site usa cookies para melhorar sua experiência.
          </p>
          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onReject}
              className="text-[11px] sm:text-[13px] text-white/35 hover:text-white/60 transition-colors"
            >
              Recusar
            </button>
            <button
              onClick={onCustomize}
              className="text-[11px] sm:text-[13px] text-white/35 hover:text-white/60 transition-colors"
            >
              Personalizar
            </button>
            <button
              onClick={onAccept}
              className="text-[14px] sm:text-[14px] font-bold px-5 sm:px-6 py-2 sm:py-2 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] transition-all shadow-[0_2px_8px_rgba(245,158,11,.3)]"
            >
              Aceitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
