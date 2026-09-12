import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useLayout, VideoStoryItem } from "@/contexts/LayoutContext";
import { safeCloseDialog } from "@/hooks";
import { TRIAL_DURATION_DAYS } from "@/constants";

export interface FloatingVideoBubbleProps {
  previewUrl: string;
  videos?: (string | VideoStoryItem)[];
  videosData?: VideoStoryItem[];
  videoUrls?: string[];
  fullUrl?: string;
  tooltipText?: string;
  positionClasses?: string;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
  loop?: boolean;
  requireScrollOnMobile?: boolean;
  title?: string;
  onCtaClick?: () => void;
  dismissible?: boolean;
  storageKey?: string;
  onDismiss?: () => void;
  confirmDialogTitle?: string;
  confirmDialogDescription?: string;
  confirmDialogConfirmText?: string;
  confirmDialogCancelText?: string;
}

export function FloatingVideoBubble({
  previewUrl,
  videos = [],
  videosData,
  videoUrls = [],
  fullUrl,
  tooltipText = "Veja como funciona",
  positionClasses = "fixed bottom-6 left-6 z-50",
  showCta = true,
  ctaText = `Testar grátis por ${TRIAL_DURATION_DAYS} dias`,
  ctaLink = "/cadastro",
  loop = true,
  requireScrollOnMobile = true,
  title,
  onCtaClick,
  dismissible = true,
  storageKey,
  onDismiss,
  confirmDialogTitle = "Não exibir novamente?",
  confirmDialogDescription = "Este conteúdo em vídeo não será mais exibido nesta tela.",
  confirmDialogConfirmText = "Ocultar",
  confirmDialogCancelText = "Cancelar",
}: FloatingVideoBubbleProps) {
  const { openVideoStoriesDialog, openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const rawList = videosData || (videos.length > 0 ? videos : (videoUrls.length > 0 ? videoUrls : (fullUrl ? [fullUrl] : [])));

  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (!storageKey) return false;
    try {
      return localStorage.getItem(storageKey) === "true";
    } catch {
      return false;
    }
  });

  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isDragging = useRef(false);
  const hasShownTooltip = useRef(false);

  useEffect(() => {
    if (isVisible && !hasShownTooltip.current) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        hasShownTooltip.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  useEffect(() => {
    const checkVisibility = () => {
      if (!requireScrollOnMobile || window.innerWidth >= 640) {
        setIsVisible(true);
        return;
      }

      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });
    checkVisibility();

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
    };
  }, [requireScrollOnMobile]);

  const handleDismissClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    openConfirmationDialog({
      title: confirmDialogTitle,
      description: confirmDialogDescription,
      confirmText: confirmDialogConfirmText,
      cancelText: confirmDialogCancelText,
      allowClose: true,
      onConfirm: () => {
        safeCloseDialog(closeConfirmationDialog);
        setIsDismissed(true);
        if (storageKey) {
          try {
            localStorage.setItem(storageKey, "true");
          } catch {}
        }
        onDismiss?.();
      },
      onCancel: () => {
        safeCloseDialog(closeConfirmationDialog);
      },
    });
  };

  const handleOpen = () => {
    if (isDragging.current || rawList.length === 0) return;

    openVideoStoriesDialog({
      videos: rawList,
      title,
      ctaText,
      ctaLink,
      showCta,
      loop,
      onCtaClick,
    });
  };

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          drag
          dragMomentum={false}
          onDragStart={() => {
            isDragging.current = true;
          }}
          onDragEnd={() => {
            setTimeout(() => {
              isDragging.current = false;
            }, 150);
          }}
          className={`${positionClasses} flex items-center cursor-grab active:cursor-grabbing select-none`}
          style={{ zIndex: 50 }}
        >
          <div
            onClick={handleOpen}
            className="relative rounded-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-4 border-white transition-transform hover:scale-105 group w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] flex-shrink-0 z-20 bg-black cursor-pointer"
            aria-label="Abrir vídeo demonstrativo"
          >
            <div className="absolute inset-0 bg-[#f59e0b] rounded-full animate-ping opacity-20 z-0 pointer-events-none" />

            <video
              src={previewUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover relative z-10 pointer-events-none"
            />
          </div>

          <div
            className={`z-10 transition-[max-width,opacity,margin] duration-300 ease-out flex items-center ${
              showTooltip ? "max-w-[320px] opacity-100 -ml-6" : "max-w-0 opacity-0 -ml-16 pointer-events-none"
            }`}
          >
            <div className="relative">
              {dismissible && (
                <button
                  type="button"
                  onClick={handleDismissClick}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                  className="absolute -top-2 -right-1 z-30 bg-black/90 hover:bg-black text-white/80 hover:text-white rounded-full p-1 border border-white/20 shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  aria-label="Não exibir novamente"
                  title="Não exibir novamente"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div
                onClick={handleOpen}
                className="bg-black/90 cursor-pointer text-white text-[10px] sm:text-[11px] uppercase font-bold pl-10 pr-5 py-3 rounded-r-full whitespace-nowrap shadow-xl tracking-widest border-y-2 border-r-2 border-white/10 hover:bg-black transition-colors"
              >
                {tooltipText}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
