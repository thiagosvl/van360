import { cn } from "@/lib/utils";
import {
    motion,
    PanInfo,
    useAnimation,
    useMotionValue,
    useTransform,
} from "framer-motion";
import { ReactNode, useEffect, useState } from "react";

interface SwipeAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color: string; // Tailwind bg color class (e.g., 'bg-red-500')
}

interface SwipeableItemProps {
  children: ReactNode;
  rightActions?: SwipeAction[];
  leftActions?: SwipeAction[]; // Future proofing
  className?: string;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  threshold?: number;
  showHint?: boolean;
}

const ACTION_WIDTH = 70; // Width of each action button

export function SwipeableItem({
  children,
  rightActions = [],
  leftActions = [],
  className,
  onSwipeStart,
  onSwipeEnd,
  threshold = 50,
  showHint = false,
}: SwipeableItemProps) {
  const x = useMotionValue(0);
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);

  // Calculate total width of actions
  const rightWidth = rightActions.length * ACTION_WIDTH;
  const leftWidth = leftActions.length * ACTION_WIDTH;

  // Background color interpolation based on drag direction (optional polish)
  const bgOpacity = useTransform(x, [-rightWidth, 0, leftWidth], [1, 0, 1]);

  useEffect(() => {
    if (showHint) {
      // Subtle bounce animation to indicate swipeability
      const sequence = async () => {
        await controls.start({
          x: -30,
          transition: { duration: 0.3, ease: "easeOut" },
        });
        await controls.start({
          x: 0,
          transition: { duration: 0.5, type: "spring", bounce: 0.5 },
        });
      };
      // Delay slightly so user sees it after load
      const timer = setTimeout(() => sequence(), 600);
      return () => clearTimeout(timer);
    }
  }, [showHint, controls]);

  const handleDragEnd = async (
    _: any,
    info: PanInfo
  ) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    onSwipeEnd?.();

    // Swipe Left (Show Right Actions)
    if (rightActions.length > 0) {
      if (offset < -threshold || velocity < -500) {
        await controls.start({ x: -rightWidth });
        setIsOpen(true);
        return;
      }
    }

    // Swipe Right (Show Left Actions)
    if (leftActions.length > 0) {
      if (offset > threshold || velocity > 500) {
        await controls.start({ x: leftWidth });
        setIsOpen(true);
        return;
      }
    }

    // Reset
    await controls.start({ x: 0 });
    setIsOpen(false);
  };

  const close = async () => {
    await controls.start({ x: 0 });
    setIsOpen(false);
  };

  return (
    <div 
      className={cn("relative overflow-hidden touch-pan-y isolate", className)}
      style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden" }}
    >
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex z-0">
        {/* Left Actions (revealed when dragging right) */}
        <div
          className="flex mr-auto h-full"
          style={{ width: leftWidth, display: leftActions.length ? "flex" : "none" }}
        >
          {leftActions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                close();
              }}
              className={cn(
                "h-full flex flex-col items-center justify-center text-white px-2 transition-opacity",
                action.color
              )}
              style={{ width: ACTION_WIDTH }}
            >
              <div className="mb-1">{action.icon}</div>
              <span className="text-[10px] font-medium leading-tight text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>

        {/* Right Actions (revealed when dragging left) */}
        <div
          className="flex ml-auto h-full"
          style={{ width: rightWidth, display: rightActions.length ? "flex" : "none" }}
        >
          {rightActions.map((action, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
                close();
              }}
              className={cn(
                "h-full flex flex-col items-center justify-center text-white px-2 transition-opacity active:opacity-80",
                action.color
              )}
              style={{ width: ACTION_WIDTH }}
            >
              <div className="mb-1">{action.icon}</div>
              <span className="text-[10px] font-medium leading-tight text-center">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{
          left: -rightWidth,
          right: leftWidth,
        }}
        dragElastic={0.1} // Resistance when pulling past limits
        onDragStart={onSwipeStart}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ 
          x, 
          background: "white",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden"
        }}
        className="relative z-10 bg-white transform-gpu will-change-transform"
        whileTap={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
