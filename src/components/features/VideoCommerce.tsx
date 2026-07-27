import { useState, useEffect, useRef } from 'react';
import { X, Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface VideoCommerceProps {
  previewUrl: string;
  videoUrls?: string[]; // Suporte para múltiplos vídeos (Stories)
  fullUrl?: string; // Mantido por compatibilidade
  tooltipText?: string;
  positionClasses?: string;
  showCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
  loop?: boolean;
  requireScrollOnMobile?: boolean;
}

export function VideoCommerce({
  previewUrl,
  videoUrls = [],
  fullUrl,
  tooltipText = "Veja como funciona",
  positionClasses = "fixed bottom-6 left-6 z-50",
  showCta = true,
  ctaText = "Testar grátis por 15 dias",
  ctaLink = "/cadastro",
  loop = false,
  requireScrollOnMobile = true
}: VideoCommerceProps) {
  // Tratar fallback para compatibilidade: se não passar array, cria array com 1 vídeo
  const activeVideos = videoUrls.length > 0 ? videoUrls : (fullUrl ? [fullUrl] : []);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const isDragging = useRef(false);

  // Custom Player State
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasShownTooltip = useRef(false);

  useEffect(() => {
    if (isVisible && !hasShownTooltip.current) {
      const timer = setTimeout(() => {
        setShowTooltip(true);
        hasShownTooltip.current = true;
      }, 100); // 100ms após a bolinha
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  // Lógica para mostrar apenas após o scroll inicial no Mobile
  useEffect(() => {
    const checkVisibility = () => {
      // Se não precisa de scroll no mobile ou for tablet/desktop (>= 640px), mostra sempre
      if (!requireScrollOnMobile || window.innerWidth >= 640) {
        setIsVisible(true);
        return;
      }

      // No mobile, mostra o widget apenas se o usuário rolou mais de 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', checkVisibility, { passive: true });
    window.addEventListener('resize', checkVisibility, { passive: true });
    
    checkVisibility(); // Checagem inicial
    
    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  }, []);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeVideos.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Último vídeo acabou
      if (loop) {
        setCurrentIndex(0); // Reinicia todo o ciclo de stories
      } else {
        setIsPlaying(false); // Pausa no final
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      // Se estiver no primeiro e voltar, zera o progresso do atual
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
      }
    }
  };

  // Reseta estado sempre que o modal abre ou avança um vídeo
  useEffect(() => {
    if (isOpen) {
      setProgress(0);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [currentIndex, isOpen]);

  // Quando o modal abre do zero, sempre reinicia no primeiro vídeo
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  return (
    <>
      {/* Widget Flutuante Arrastável */}
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
            onTap={() => {
              if (!isDragging.current) {
                setIsOpen(true);
              }
            }}
            className={`${positionClasses} flex items-center cursor-grab active:cursor-grabbing`}
            style={{ zIndex: 50 }}
          >
            {/* Bolinha do Vídeo */}
            <div
              className="relative rounded-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)] border-4 border-white transition-transform hover:scale-105 group w-[72px] h-[72px] sm:w-[84px] sm:h-[84px] flex-shrink-0 z-20 bg-black cursor-pointer"
              aria-label="Abrir vídeo"
            >
              <div className="absolute inset-0 bg-[#f59e0b] rounded-full animate-ping opacity-20 z-0 pointer-events-none"></div>

              <video
                src={previewUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover relative z-10 pointer-events-none"
              />
            </div>

            {/* Legenda (Saindo de trás para a direita) */}
            <div
              className={`
                z-10 transition-[max-width,opacity,margin] duration-300 ease-out flex items-center overflow-hidden
                ${showTooltip ? 'max-w-[200px] opacity-100 -ml-6' : 'max-w-0 opacity-0 -ml-16'}
              `}
            >
              <div
                className="bg-black/90 cursor-pointer text-white text-[10px] sm:text-[11px] uppercase font-bold pl-10 pr-5 py-3 rounded-r-full whitespace-nowrap shadow-xl tracking-widest border-y-2 border-r-2 border-white/10"
              >
                {tooltipText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal - Full Video */}
      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-0 md:p-8"
              onClick={() => setIsOpen(false)} // Fecha ao clicar fora (backdrop)
            >
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()} // Previne fechar ao clicar no player
                className="relative w-full h-full md:max-w-[420px] md:h-auto md:aspect-[9/16] bg-black md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col justify-center border border-white/10 group"
              >
                {/* Top Gradient for Stories Bars and Close/Mute */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none"></div>

                {/* Header Actions (Close & Mute) + Stories Bars */}
                <div className="absolute top-0 left-0 right-0 p-4 pt-5 z-50 pointer-events-none flex flex-col gap-3">
                  
                  {/* Barras de Progresso (Stories) */}
                  {activeVideos.length > 0 && (
                    <div className="flex gap-1.5 w-full">
                      {activeVideos.map((_, index) => {
                        let barWidth = "0%";
                        if (index < currentIndex) barWidth = "100%"; // Já passou
                        else if (index === currentIndex) barWidth = `${progress}%`; // Atual

                        return (
                          <div key={index} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                            <div 
                              className="h-full bg-white transition-all duration-100 ease-linear rounded-full"
                              style={{ width: barWidth }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex justify-between items-center w-full">
                    <button
                      onClick={toggleMute}
                      className="bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 pointer-events-auto active:scale-95"
                      aria-label="Alternar som"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => setIsOpen(false)}
                      className="bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 pointer-events-auto active:scale-95"
                      aria-label="Fechar"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Navigation Tap Zones (Esquerda / Pause / Direita) */}
                <div className="absolute inset-0 z-40 flex touch-manipulation">
                  {/* Tap Esquerda (Voltar) */}
                  <div 
                    className="w-[30%] h-full cursor-pointer flex items-center justify-start group/navleft"
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  >
                    {currentIndex > 0 && (
                      <div className="hidden md:flex ml-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm items-center justify-center text-white/50 group-hover/navleft:bg-black/50 group-hover/navleft:text-white transition-all border border-white/5">
                        <ChevronLeft className="w-6 h-6 mr-1" />
                      </div>
                    )}
                  </div>
                  
                  {/* Tap Centro (Play/Pause) */}
                  <div 
                    className="w-[40%] h-full cursor-pointer flex items-center justify-center"
                    onClick={togglePlay}
                  >
                    <AnimatePresence>
                      {!isPlaying && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ type: "spring", damping: 20 }}
                          className="bg-black/50 backdrop-blur-md rounded-full p-5 text-white shadow-xl border border-white/10"
                        >
                          <Play className="w-10 h-10 ml-1" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Tap Direita (Avançar) */}
                  <div 
                    className="w-[30%] h-full cursor-pointer flex items-center justify-end group/navright"
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                  >
                    {currentIndex < activeVideos.length - 1 && (
                      <div className="hidden md:flex mr-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm items-center justify-center text-white/50 group-hover/navright:bg-black/50 group-hover/navright:text-white transition-all border border-white/5">
                        <ChevronRight className="w-6 h-6 ml-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Element */}
                {activeVideos.length > 0 && (
                  <video
                    ref={videoRef}
                    src={activeVideos[currentIndex]}
                    autoPlay
                    playsInline
                    loop={false}
                    muted={isMuted}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleNext}
                    className="w-full h-full object-contain bg-black"
                  />
                )}

                {/* Bottom Gradient to highlight CTA and Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 to-transparent z-40 pointer-events-none"></div>

                {/* CTA Area */}
                <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col px-6 pb-6 pointer-events-none">
                  {showCta && (
                    <a
                      href={ctaLink}
                      onClick={(e) => e.stopPropagation()} // Let link work
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,.4)] transition-all text-center text-[0.95rem] active:scale-[0.98] pointer-events-auto flex items-center justify-center gap-2"
                    >
                      {ctaText}
                    </a>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
