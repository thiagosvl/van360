import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

interface LockOverlayProps {
  className?: string;
  /**
   * Optional absolute positioning values.
   * Can be number (interpreted as pixels usually, but here we pass to style directly so strictly string is safer for "1rem" etc, 
   * but if number we can assume pixels or just pass it).
   * User asked specifically for "right ser -1 ou +1".
   */
  top?: string | number;
  bottom?: string | number;
  right?: string | number;
  left?: string | number;
}

export const LockOverlay = ({ className, top, bottom, right, left }: LockOverlayProps) => {
  // If no positioning props are provided, default to bottom-2 right-2 via class
  const hasSpecificPosition = top !== undefined || bottom !== undefined || right !== undefined || left !== undefined;
  
  return (
    <div
      className={cn(
        "absolute h-6 w-6 bg-orange-100/50 rounded-full flex items-center justify-center z-10 pointer-events-none select-none",
        !hasSpecificPosition && "bottom-2 right-2",
        className
      )}
      style={{
        top,
        bottom,
        right,
        left,
      }}
    >
      <Lock className="h-4 w-4 text-orange-400 m-1.5 opacity-100" />
    </div>
  );
};
