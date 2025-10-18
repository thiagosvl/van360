import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const PULL_THRESHOLD = 100;
const MAX_PULL_DISTANCE = 150;

export function PullToRefreshWrapper({
  onRefresh,
  children,
}: {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);
  const startY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const isScrollAtTop = useCallback(() => {
    return containerRef.current ? containerRef.current.scrollTop === 0 : true;
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    if (isRefreshing) return;

    if (isScrollAtTop()) {
      startY.current = e.touches[0].clientY;
      containerRef.current?.classList.remove(
        "transition-transform",
        "duration-300"
      );
    } else {
      startY.current = 0;
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (startY.current === 0 || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    let distance = currentY - startY.current;

    if (distance < 0) {
      return;
    }

    distance = Math.min(distance, MAX_PULL_DISTANCE);

    if (distance > 0) {
      e.preventDefault();
      e.stopPropagation();
    }

    setPullDistance(distance);
    setCanRefresh(distance >= PULL_THRESHOLD);
  };

  const handleTouchEnd = useCallback(async () => {
    containerRef.current?.classList.add("transition-transform", "duration-300");

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD * 0.7);

      try {
        await onRefresh();
      } catch (error) {
        console.error("Erro durante a atualização:", error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }

    startY.current = 0;
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener("touchstart", handleTouchStart as any, {
      passive: false,
    });
    element.addEventListener("touchmove", handleTouchMove as any, {
      passive: false,
    });
    element.addEventListener("touchend", handleTouchEnd as any, {
      passive: true,
    });

    return () => {
      element.removeEventListener("touchstart", handleTouchStart as any);
      element.removeEventListener("touchmove", handleTouchMove as any);
      element.removeEventListener("touchend", handleTouchEnd as any);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const indicatorOpacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
  const indicatorScale = Math.min(pullDistance / PULL_THRESHOLD, 1) * 0.8 + 0.2;
  const indicatorOffset = pullDistance * 0.4;

  const finalOpacity = isRefreshing ? 1 : indicatorOpacity;
  const finalScale = isRefreshing ? 1 : indicatorScale;

  const indicatorContent = (() => {
    if (isRefreshing) {
      return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
    }

    if (pullDistance > 0) {
      return (
        <div className="flex flex-col items-center">
          <Loader2
            className={`h-6 w-6 text-gray-400 transition-transform duration-100 ${
              canRefresh ? "rotate-180" : ""
            }`}
          />
          <span className="text-xs text-gray-500 mt-1">
            {canRefresh ? "Solte para atualizar" : "Puxe para atualizar"}
          </span>
        </div>
      );
    }
    return null;
  })();

  return (
    <div className="relative h-full overflow-y-auto" ref={containerRef}>
      <div
        className="absolute w-full flex justify-center items-center"
        style={{
          top: 0,
          transform: `translateY(${indicatorOffset}px)`,
          transition: isRefreshing ? "transform 0.3s ease-out" : "none",
        }}
      >
        <div
          className="flex justify-center items-center"
          style={{
            opacity: finalOpacity,
            transform: `scale(${finalScale})`,
          }}
        >
          {indicatorContent}
        </div>
      </div>

      <div
        className="touch-action-pan-y"
        style={{ transform: `translateY(${pullDistance}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
