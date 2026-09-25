import { useState } from "react";
import { Star, Smile, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: string;
  logo?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Tio Rodrigo & Tia Paula",
    role: "Curitiba, PR • 260 alunos",
    quote:
      "Desde o mês passado já reduzi a inadimplência de 3 pais. Foram quase 700 reais que talvez eu nem fosse receber, mas o app cobrou os pais sozinho.",
    rating: "5/5",
    logo: "/assets/depoimentos/tio-rodrigo-tia-paula.png",
  },
  {
    name: "Tio Beto",
    role: "São Paulo, SP • 60 alunos",
    quote:
      "Os pais assinam o contrato direto pelo link no celular. Agora não preciso mais imprimir e levar o contrato de porta em porta dos pais.",
    rating: "5/5",
    logo: "/assets/depoimentos/tio-beto.png",
  },
  {
    name: "Escolar Tio Saulo",
    role: "Belo Horizonte, MG • 320 alunos",
    quote:
      "Deixei minhas planilhas de lado de vez. O app me mostra na hora quem já pagou o mês e quem está pendente com total clareza.",
    rating: "5/5",
    logo: "/assets/depoimentos/escolar-tio-saulo.png",
  },
  {
    name: "Tia Lu Kids",
    role: "Rio de Janeiro, RJ • 90 alunos",
    quote:
      "O suporte é rápido de verdade e o melhor é não precisar mais ficar cobrando os pais. O app avisa todo mundo certinho no WhatsApp.",
    rating: "5/5",
    logo: "/assets/depoimentos/tia-lu-kids.png",
  },
  {
    name: "Rota Alegre Transporte Escolar",
    role: "Brasília, DF • 110 alunos",
    quote:
      "Na saída da escola, poder fazer a chamada pelo app é muito mais prático do que no papel. Em um minuto já sei certinho quem embarcou.",
    rating: "5/5",
    logo: "/assets/depoimentos/rota-alegre-transporte-escolar.png",
  },
];

interface QuemUsaRecomendaCardProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

export function QuemUsaRecomendaCard({
  className,
  title = "Quem usa, recomenda",
  subtitle = "Veja o que motoristas de van de todo o Brasil dizem sobre o Van360:",
}: QuemUsaRecomendaCardProps) {
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchDeltaX, setTouchDeltaX] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const minSwipeDistance = 35;

  const handlePrevTestimonial = () => {
    setSlideDirection("prev");
    setActiveTestimonialIdx((prev) => (prev === 0 ? TESTIMONIALS.length - 1 : prev - 1));
  };

  const handleNextTestimonial = () => {
    setSlideDirection("next");
    setActiveTestimonialIdx((prev) => (prev === TESTIMONIALS.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setIsSwiping(true);
    setTouchDeltaX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const currentX = e.targetTouches[0].clientX;
    const diff = currentX - touchStartX;
    const resisted = Math.sign(diff) * Math.min(65, Math.abs(diff) * 0.6);
    setTouchDeltaX(resisted);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null) {
      if (touchDeltaX < -minSwipeDistance) {
        handleNextTestimonial();
      } else if (touchDeltaX > minSwipeDistance) {
        handlePrevTestimonial();
      }
    }
    setIsSwiping(false);
    setTouchDeltaX(0);
    setTouchStartX(null);
  };

  const currentTestimonial = TESTIMONIALS[activeTestimonialIdx];

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={cn(
        "bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-2xs space-y-3.5 select-none touch-pan-y w-full overflow-hidden",
        className
      )}
    >
      <div className="space-y-3">
        <div className="text-center space-y-0.5 pb-0.5">
          <h3 className="text-sm sm:text-base font-bold text-[#002444] tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11.5px] sm:text-xs text-slate-500 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => {
                const numRating = parseInt(currentTestimonial.rating.split("/")[0]) || 5;
                const isFilled = i < numRating;
                return (
                  <Star
                    key={i}
                    className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4",
                      isFilled ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-300"
                    )}
                  />
                );
              })}
            </div>
            <span className="text-xs font-bold text-slate-700 ml-1.5">
              {currentTestimonial.rating}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevTestimonial();
              }}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextTestimonial();
              }}
              className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          transform: `translateX(${touchDeltaX}px)`,
          transition: isSwiping ? "none" : "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
        }}
        className="space-y-3.5"
      >
        <div
          key={activeTestimonialIdx}
          className={cn(
            "space-y-3.5",
            slideDirection === "next"
              ? "animate-in fade-in slide-in-from-right-4 duration-300"
              : "animate-in fade-in slide-in-from-left-4 duration-300"
          )}
        >
          <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed min-h-[44px] sm:min-h-[38px] flex items-center">
            &quot;{currentTestimonial.quote}&quot;
          </p>

          <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-50 border border-slate-200/80 text-[#002444] flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              {currentTestimonial.logo ? (
                <img
                  src={currentTestimonial.logo}
                  alt={currentTestimonial.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <Smile className="w-5 h-5 text-[#002444]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="text-xs sm:text-sm font-bold text-[#002444]">
                {currentTestimonial.name}
              </h5>
              <p className="text-[11px] text-slate-500">
                {currentTestimonial.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pt-0.5">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setSlideDirection(i > activeTestimonialIdx ? "next" : "prev");
              setActiveTestimonialIdx(i);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
              activeTestimonialIdx === i ? "w-5 bg-[#002444]" : "w-1.5 bg-slate-200"
            )}
            aria-label={`Ir para depoimento ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
