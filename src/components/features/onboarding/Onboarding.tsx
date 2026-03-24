import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import { BarChart3, ChevronRight, CreditCard, FileText, Users, Wrench } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    title: "Gestão de Mensalidades",
    description: "Controle total sobre vencimentos, pagamentos e cobranças automáticas. Acabe com a inadimplência.",
    icon: CreditCard,
    color: "from-emerald-500 to-teal-700",
  },
  {
    title: "Contratos Digitais",
    description: "Crie, envie e acompanhe a assinatura eletrônica dos seus contratos direto pelo app de forma segura.",
    icon: FileText,
    color: "from-indigo-600 to-blue-700",
  },
  {
    title: "Frota e Clientes",
    description: "Organize passageiros, escolas e veículos em um só lugar. Dados acessíveis de onde você estiver.",
    icon: Users,
    color: "from-blue-500 to-indigo-600",
  },
  {
    title: "Controle de Gastos",
    description: "Registre despesas com manutenção, combustível e outros custos para saber o lucro real da sua van.",
    icon: Wrench,
    color: "from-orange-500 to-amber-700",
  },
  {
    title: "Visão do Negócio",
    description: "Relatórios estratégicos para você entender o desempenho financeiro e tomar as melhores decisões.",
    icon: BarChart3,
    color: "from-slate-700 to-slate-900",
  },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const handleNext = () => {
    if (!emblaApi) return;
    if (selectedIndex === slides.length - 1) {
      onComplete();
    } else {
      emblaApi.scrollNext();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4 md:p-8">
      {/* Container Responsivo Centrado */}
      <div className="w-full max-w-lg h-full max-h-[800px] bg-card md:rounded-[2.5rem] md:shadow-2xl md:border relative flex flex-col items-center justify-between p-6 md:p-10 overflow-hidden">
        
        <div className="w-full flex justify-end absolute top-6 right-6 z-10">
          <Button variant="ghost" onClick={onComplete} className="text-muted-foreground font-medium hover:bg-transparent px-2">
            Pular
          </Button>
        </div>

        <div className="flex-1 w-full flex flex-col justify-center mt-12 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                <div className="flex flex-col items-center text-center space-y-6 md:space-y-10 animate-in fade-in zoom-in-95 duration-500">
                  <div className={cn(
                    "w-32 h-32 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2.25rem] bg-gradient-to-br flex items-center justify-center shadow-2xl shadow-primary/20",
                    slide.color
                  )}>
                    <slide.icon className="w-16 h-16 md:w-22 md:h-22 text-white drop-shadow-md" />
                  </div>
                  
                  <div className="space-y-3 md:space-y-5 max-w-sm">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-[1.1]">
                      {slide.title}
                    </h2>
                    <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-2">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm space-y-10 md:space-y-12 pb-6 md:pb-8">
          {/* Indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  index === selectedIndex ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/20"
                )}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext} 
            className="w-full h-14 md:h-16 text-base md:text-lg font-bold rounded-2xl md:rounded-[1.25rem] shadow-lg active:scale-95 transition-all bg-primary hover:bg-primary/90"
          >
            {selectedIndex === slides.length - 1 ? "Começar Agora" : "Próximo"}
            {selectedIndex !== slides.length - 1 && <ChevronRight className="ml-2 h-5 w-5 md:h-6 md:w-6" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
