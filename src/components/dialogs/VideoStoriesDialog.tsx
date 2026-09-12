import { useEffect, useRef, useState, useCallback } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Play, Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { safeCloseDialog } from "@/hooks";

export interface VideoStoriesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videos: string[];
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  onCtaClick?: () => void;
  showCta?: boolean;
  loop?: boolean;
}

export function VideoStoriesDialog({
  open,
  onOpenChange,
  videos = [],
  title,
  ctaText,
  ctaLink,
  onCtaClick,
  showCta = true,
  loop = false,
}: VideoStoriesDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const activeVideos = videos.length > 0 ? videos : [];

  const handleClose = useCallback(() => {
    safeCloseDialog(() => onOpenChange(false));
  }, [onOpenChange]);

  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || video.ended || !video.duration) {
      animationFrameRef.current = null;
      return;
    }

    const currentPercent = (video.currentTime / video.duration) * 100;
    setProgress(currentPercent);
    animationFrameRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < activeVideos.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    } else if (loop) {
      setCurrentIndex(0);
      setProgress(0);
    } else {
      setIsPlaying(false);
    }
  }, [currentIndex, activeVideos.length, loop]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setProgress(0);
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
    }
  }, [currentIndex]);

  const togglePlay = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleBarClick = (targetIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (targetIndex !== currentIndex) {
      setCurrentIndex(targetIndex);
      setProgress(0);
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setProgress(0);
      setIsPlaying(true);
      setIsMuted(false);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [open]);

  useEffect(() => {
    const video = videoRef.current;
    if (!open || !video) return;

    setProgress(0);
    video.src = activeVideos[currentIndex] || "";
    video.load();
    video.play().catch(() => {});
    setIsPlaying(true);
  }, [currentIndex, open, activeVideos]);

  const handleVideoPlay = () => {
    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const handleVideoPause = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") {
        handleClose();
      } else if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose, togglePlay, handleNext, handlePrev]);

  if (!open || activeVideos.length === 0) return null;

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-0 md:p-8"
          onClick={handleClose}
        >
          <DialogPrimitive.Content
            aria-describedby={undefined}
            onClick={(e) => e.stopPropagation()}
            onPointerDownOutside={handleClose}
            onEscapeKeyDown={handleClose}
            className="relative w-full h-full md:max-w-[420px] md:h-auto md:aspect-[9/16] bg-black md:rounded-[2rem] overflow-hidden shadow-2xl flex flex-col justify-center border border-white/10 outline-none select-none"
          >
            <DialogPrimitive.Title className="sr-only">
              {title || "Histórias em Vídeo"}
            </DialogPrimitive.Title>

            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent z-40 pointer-events-none" />

            <div className="absolute top-0 left-0 right-0 p-4 pt-5 z-50 pointer-events-none flex flex-col gap-3">
              {activeVideos.length > 0 && (
                <div className="flex gap-1.5 w-full pointer-events-auto">
                  {activeVideos.map((_, index) => {
                    let barWidth = "0%";
                    if (index < currentIndex) barWidth = "100%";
                    else if (index === currentIndex) barWidth = `${progress}%`;

                    return (
                      <div
                        key={index}
                        onClick={(e) => handleBarClick(index, e)}
                        className="h-3 flex items-center flex-1 cursor-pointer"
                      >
                        <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden backdrop-blur-sm pointer-events-none">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-75 ease-linear"
                            style={{ width: barWidth }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex justify-between items-center w-full">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 pointer-events-auto active:scale-95"
                  aria-label={isMuted ? "Ativar som" : "Desativar som"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {title && (
                  <span className="text-white/90 text-xs font-semibold truncate max-w-[200px] px-2 drop-shadow">
                    {title}
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleClose}
                  className="bg-black/30 hover:bg-black/60 text-white rounded-full p-2.5 backdrop-blur-md transition-all border border-white/10 pointer-events-auto active:scale-95"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="absolute inset-0 z-40 flex touch-manipulation">
              <div
                className="w-[30%] h-full cursor-pointer flex items-center justify-start group/navleft"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
              >
                {activeVideos.length > 1 && (
                  <div className="hidden md:flex ml-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm items-center justify-center text-white/50 group-hover/navleft:bg-black/50 group-hover/navleft:text-white transition-all border border-white/5">
                    <ChevronLeft className="w-6 h-6 mr-1" />
                  </div>
                )}
              </div>

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
                      className="bg-black/50 backdrop-blur-md rounded-full p-5 text-white shadow-xl border border-white/10 pointer-events-none"
                    >
                      <Play className="w-10 h-10 ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div
                className="w-[30%] h-full cursor-pointer flex items-center justify-end group/navright"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
              >
                {activeVideos.length > 1 && (
                  <div className="hidden md:flex mr-4 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm items-center justify-center text-white/50 group-hover/navright:bg-black/50 group-hover/navright:text-white transition-all border border-white/5">
                    <ChevronRight className="w-6 h-6 ml-1" />
                  </div>
                )}
              </div>
            </div>

            <video
              ref={videoRef}
              playsInline
              muted={isMuted}
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
              onEnded={handleNext}
              className="w-full h-full object-contain bg-black pointer-events-none"
            />

            {showCta && (ctaText || ctaLink || onCtaClick) && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/90 to-transparent z-40 pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 z-50 flex flex-col px-6 pb-6 pointer-events-none">
                  {onCtaClick ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCtaClick();
                      }}
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,.4)] transition-all text-center text-[0.95rem] active:scale-[0.98] pointer-events-auto flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {ctaText || "Continuar"}
                    </button>
                  ) : ctaLink ? (
                    <a
                      href={ctaLink}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full bg-[#f59e0b] hover:bg-[#d97706] text-[#1a1a1a] font-bold py-4 rounded-xl shadow-[0_4px_20px_rgba(245,158,11,.4)] transition-all text-center text-[0.95rem] active:scale-[0.98] pointer-events-auto flex items-center justify-center gap-2"
                    >
                      {ctaText || "Continuar"}
                    </a>
                  ) : null}
                </div>
              </>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
