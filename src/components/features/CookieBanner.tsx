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
      document.body.style.paddingBottom = window.innerWidth < 640 ? "56px" : "48px";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-1.5 sm:py-3 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-8">
          <p className="text-[11px] sm:text-[13px] text-white/65 leading-snug sm:flex-1">
            Este site usa cookies para melhorar sua experiência.
          </p>
          <div className="flex items-center justify-between sm:justify-start sm:gap-2">
            <button
              onClick={onReject}
              className="text-[11px] sm:text-[13px] text-white/45 hover:text-white/70 transition-colors underline underline-offset-2"
            >
              Recusar
            </button>
            <div className="flex items-center gap-3 sm:ml-6">
              <button
                onClick={onCustomize}
                className="text-[11px] sm:text-[13px] text-white/45 hover:text-white/70 transition-colors underline underline-offset-2"
              >
                Personalizar
              </button>
              <button
                onClick={onAccept}
                className="text-[11px] sm:text-[13px] font-bold px-3.5 sm:px-5 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] transition-all shadow-[0_2px_8px_rgba(245,158,11,.3)]"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
