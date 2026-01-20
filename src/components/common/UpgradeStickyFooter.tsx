import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { useEffect, useState } from "react";

interface UpgradeStickyFooterProps {
  title: string;
  description: string;
  buttonText?: string;
  onAction: () => void;
  visible?: boolean;
  className?: string;
  storageKey: string;
}

export function UpgradeStickyFooter({
  title,
  description,
  buttonText = "Ver Planos",
  onAction,
  visible = true,
  className,
  storageKey,
}: UpgradeStickyFooterProps) {
  const [isVisible, setIsVisible] = useState(false);
  // Check storage on mount
  useEffect(() => {
    const isClosed = sessionStorage.getItem(storageKey);
    // Only show if passed 'visible' is true AND not closed in session
    if (visible && !isClosed) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [visible, storageKey]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey, "true");
  };

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 50) {
      // Dragged down enough to close
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0 }}
          dragElastic={{ top: 0, bottom: 0.2 }}
          onDragEnd={onDragEnd}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          dragSnapToOrigin={true}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className={cn(
            "fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-800 p-4 pt-2 max-[320px]:p-3 max-[320px]:pt-2 z-50 md:hidden safe-area-pb shadow-2xl rounded-t-2xl touch-none",
            className
          )}
        >
          {/* Drag Handle */}
          <div className="w-full flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full cursor-grab active:cursor-grabbing" />
          </div>

          <div className="flex items-center justify-between gap-4 max-[320px]:gap-2 pr-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight max-[320px]:text-xs">
                {title}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 max-[320px]:hidden">
                {description}
              </p>
            </div>
            <Button
              onClick={onAction}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold whitespace-nowrap shrink-0 max-[320px]:h-8 max-[320px]:text-xs max-[320px]:px-3"
            >
              {buttonText}
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
