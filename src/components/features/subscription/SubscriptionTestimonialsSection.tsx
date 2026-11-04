import { useState, useRef, useEffect } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface VideoTestimonial {
  name: string;
  city: string;
  videoUrl: string;
}

export const VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    name: "Tia Verinha",
    city: "Gravataí, RS",
    videoUrl: "https://pub-6302b932ae5749838fec8c6031c88963.r2.dev/videos/depoimento-verinha.mp4",
  },
  {
    name: "Tio Ricardo",
    city: "Santa Maria, DF",
    videoUrl: "https://pub-6302b932ae5749838fec8c6031c88963.r2.dev/videos/depoimento-ricardo.mp4",
  },
  {
    name: "Tio Flávio",
    city: "Americana, SP",
    videoUrl: "https://pub-6302b932ae5749838fec8c6031c88963.r2.dev/videos/depoimento-flavio.mp4",
  },
];

interface SubscriptionTestimonialsSectionProps {
  className?: string;
}

export function SubscriptionTestimonialsSection({
  className,
}: SubscriptionTestimonialsSectionProps) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeDot, setActiveDot] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleTogglePlay = (index: number) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (activeIdx !== index) {
      videoRefs.current.forEach((v, i) => {
        if (v && i !== index) {
          v.pause();
          v.currentTime = 0;
        }
      });

      video.muted = isMuted;
      video.play().catch(() => {});
      setActiveIdx(index);
      setIsPlaying(true);
      return;
    }

    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleMute = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const video = videoRefs.current[index];
    if (video) {
      video.muted = nextMuted;
    }
  };

  const handleTimeUpdate = (index: number) => {
    if (activeIdx !== index) return;
    const video = videoRefs.current[index];
    if (video && video.duration) {
      setProgress((video.currentTime / video.duration) * 100);
    }
  };

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const cardWidth = el.offsetWidth * 0.75;
    const newIdx = Math.round(el.scrollLeft / cardWidth);
    if (newIdx !== activeDot && newIdx >= 0 && newIdx < VIDEO_TESTIMONIALS.length) {
      setActiveDot(newIdx);
    }
  };

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((v) => {
        if (v) v.pause();
      });
    };
  }, []);

  return (
    <div
      className={cn(
        "bg-white rounded-[24px] p-5 sm:p-7 border border-[#e5e5e5] shadow-xs space-y-5 sm:space-y-6 w-full overflow-hidden",
        className
      )}
    >
      <div className="text-center space-y-1.5 max-w-md mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-amber-100 border border-amber-200/80 px-3 py-0.5 rounded-full text-amber-800 font-bold text-[11px] uppercase tracking-wider">
          Depoimentos Reais
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#0a0a0a] tracking-tight">
          Ouça quem já usa o Van360 no dia a dia
        </h3>
        <p className="text-xs sm:text-[13px] text-[#737373] leading-relaxed">
          Motoristas escolares de diferentes cidades contando como ficou a rotina.
        </p>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex md:grid md:grid-cols-3 gap-3.5 sm:gap-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory hide-scrollbar -mx-2 px-2 md:mx-0 md:px-0 pb-1"
        >
          {VIDEO_TESTIMONIALS.map((item, i) => {
            const isActive = activeIdx === i;
            const isCurrentlyPlaying = isActive && isPlaying;
            const isCurrentlyPaused = isActive && !isPlaying;

            return (
              <div
                key={item.videoUrl}
                className="snap-center shrink-0 w-[78%] sm:w-[50%] md:w-auto"
              >
                <div
                  onClick={() => handleTogglePlay(i)}
                  className="relative aspect-[9/14] sm:aspect-[9/15] rounded-[20px] overflow-hidden bg-slate-900 border border-[#e5e5e5] shadow-xs group cursor-pointer touch-manipulation select-none"
                >
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={`${item.videoUrl}#t=0.5`}
                    playsInline
                    preload="metadata"
                    onTimeUpdate={() => handleTimeUpdate(i)}
                    onPlay={() => {
                      setActiveIdx(i);
                      setIsPlaying(true);
                    }}
                    onPause={() => {
                      if (activeIdx === i) setIsPlaying(false);
                    }}
                    onEnded={() => {
                      if (activeIdx === i) {
                        setIsPlaying(false);
                        setActiveIdx(null);
                        setProgress(0);
                      }
                    }}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  {isActive && (
                    <button
                      type="button"
                      onClick={(e) => handleToggleMute(e, i)}
                      className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/50 backdrop-blur-xs text-white border border-white/20 flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all cursor-pointer"
                      aria-label={isMuted ? "Ativar som" : "Desativar som"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                  )}

                  {!isActive && (
                    <div className="absolute top-3 right-3 z-20">
                      <span className="text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                        Vídeo
                      </span>
                    </div>
                  )}

                  {(!isActive || isCurrentlyPaused) && (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 bg-gradient-to-t from-black/85 via-black/25 to-black/10 transition-opacity">
                      <div className="w-full" />

                      <div className="w-13 h-13 rounded-full bg-white text-primary flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-transform pl-0.5">
                        <Play className="w-6 h-6 fill-primary text-primary" />
                      </div>

                      <div className="w-full text-left">
                        <p className="text-sm font-bold text-white leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-white/80 mt-0.5">
                          {item.city}
                        </p>
                      </div>
                    </div>
                  )}

                  {isCurrentlyPlaying && (
                    <div className="absolute bottom-3 left-4 right-4 z-20 pointer-events-none transition-opacity">
                      <div className="flex items-center justify-between text-white/90 text-xs font-semibold drop-shadow-md mb-1.5">
                        <span>{item.name}</span>
                        <span className="text-[11px] text-white/75">{item.city}</span>
                      </div>
                      <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-xs">
                        <div
                          className="h-full bg-white rounded-full transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex md:hidden items-center justify-center gap-1.5 pt-3">
          {VIDEO_TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const el = scrollContainerRef.current;
                if (!el) return;
                const cardWidth = el.offsetWidth * 0.78;
                el.scrollTo({ left: i * cardWidth, behavior: "smooth" });
                setActiveDot(i);
              }}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                activeDot === i ? "w-5 bg-amber-500" : "w-1.5 bg-[#e5e5e5]"
              )}
              aria-label={`Ir para depoimento ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
