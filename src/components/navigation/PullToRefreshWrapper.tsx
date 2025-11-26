import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

const PULL_THRESHOLD = 60; // Reduzido para 60px (gatilho mais rápido)
const MAX_PULL = 130; // Máximo reduzido

export function PullToRefreshWrapper({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const y = useMotionValue(0);
  
  // Transforma a distância puxada em rotação e opacidade
  const rotate = useTransform(y, [0, PULL_THRESHOLD], [0, 180]);
  const opacity = useTransform(y, [0, 20, PULL_THRESHOLD], [0, 0, 1]);
  const scale = useTransform(y, [0, PULL_THRESHOLD], [0, 1]);
  
  // Centraliza o loader no espaço vazio
  // y/2 é o centro do espaço. -20px compensa metade da altura do loader (~40px)
  // Isso garante que o loader fique visualmente no meio da área branca criada
  const translateY = useTransform(y, (latest) => latest / 2 - 20);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (window.scrollY > 0 || isRefreshing) return;
      
      const startY = e.touches[0].clientY;
      let isPulling = false;

      const handleTouchMove = (e: TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 0 && window.scrollY <= 0) {
          // Fator 0.8: Mais leve de puxar
          const resistance = Math.min(diff * 0.8, MAX_PULL);
          
          if (resistance > 0) {
            isPulling = true;
            if (e.cancelable) {
               e.preventDefault(); 
            }
            y.set(resistance);
          }
        }
      };

      const handleTouchEnd = async () => {
        const currentY = y.get();
        
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);

        if (currentY >= PULL_THRESHOLD) {
          setIsRefreshing(true);
          // Mantém o loader visível durante o refresh
          animate(y, PULL_THRESHOLD, { type: "spring", stiffness: 300, damping: 30 });
          
          try {
            await onRefresh();
          } finally {
            setIsRefreshing(false);
            animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
          }
        } else {
          animate(y, 0, { type: "spring", stiffness: 300, damping: 30 });
        }
      };

      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [isRefreshing, onRefresh, y, isMobile]);

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      {/* Indicador de Refresh */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-10 flex justify-center items-start pointer-events-none"
        style={{ y: translateY, opacity, scale }}
      >
        <div className="p-2 bg-white rounded-full shadow-md border border-gray-100 flex items-center justify-center">
          <motion.div
            style={{ rotate }}
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: "linear" } : {}}
          >
            <Loader2 className={`w-6 h-6 ${isRefreshing ? "text-primary" : "text-gray-400"}`} />
          </motion.div>
        </div>
      </motion.div>

      {/* Conteúdo */}
      <motion.div
        style={{ y }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
}