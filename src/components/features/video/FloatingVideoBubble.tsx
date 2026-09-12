import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "@/contexts/LayoutContext";
import { TRIAL_DURATION_DAYS } from "@/constants";

export interface FloatingVideoBubbleProps {
  previewUrl: string;
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
}

export function FloatingVideoBubble({
  previewUrl,
  videoUrls = [],
  fullUrl,
  tooltipText = "Veja como funciona",
  positionClasses = "fixed bottom-6 left-6 z-50",
  showCta = true,
  ctaText = `Testar grátis por ${TRIAL_DURATION_DAYS} dias`,
  ctaLink = "/cadastro",
  loop = false,
  requireScrollOnMobile = true,
  title,
  onCtaClick,
}: FloatingVideoBubbleProps) {
  const { openVideoStoriesDialog } = useLayout();
  const activeVideos = videoUrls.length > 0 ? videoUrls : fullUrl ? [fullUrl] : [];

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

  const handleOpen = () => {
    if (isDragging.current || activeVideos.length === 0) return;

    openVideoStoriesDialog({
      videos: activeVideos,
      title,
      ctaText,
      ctaLink,
      showCta,
      loop,
      onCtaClick,
    });
  };

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
          onTap={handleOpen}
          className={`${positionClasses} flex items-center cursor-grab active:cursor-grabbing select-none`}
          style={{ zIndex: 50 }}
        >
          <div
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
            className={`z-10 transition-[max-width,opacity,margin] duration-300 ease-out flex items-center overflow-hidden ${
              showTooltip ? "max-w-[200px] opacity-100 -ml-6" : "max-w-0 opacity-0 -ml-16"
            }`}
          >
            <div className="bg-black/90 cursor-pointer text-white text-[10px] sm:text-[11px] uppercase font-bold pl-10 pr-5 py-3 rounded-r-full whitespace-nowrap shadow-xl tracking-widest border-y-2 border-r-2 border-white/10">
              {tooltipText}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
