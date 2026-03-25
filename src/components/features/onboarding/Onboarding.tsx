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
    color: "from-[#1a3a5c] to-[#2a4a6c]",
  },
  {
    title: "Contratos Digitais",
    description: "Crie, envie e acompanhe a assinatura eletrônica dos seus contratos direto pelo app de forma segura.",
    icon: FileText,
    color: "from-[#1a3a5c] to-[#2a4a6c]",
  },
  {
    title: "Frota e Clientes",
    description: "Organize passageiros, escolas e veículos em um só lugar. Dados acessíveis de onde você estiver.",
    icon: Users,
    color: "from-[#1a3a5c] to-[#2a4a6c]",
  },
  {
    title: "Controle de Gastos",
    description: "Registre despesas com manutenção, combustível e outros custos para saber o lucro real da sua van.",
    icon: Wrench,
    color: "from-[#1a3a5c] to-[#2a4a6c]",
  },
  {
    title: "Visão do Negócio",
    description: "Relatórios estratégicos para você entender o desempenho financeiro e tomar as melhores decisões.",
    icon: BarChart3,
    color: "from-[#1a3a5c] to-[#2a4a6c]",
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
    <div className="fixed inset-0 z-[100] bg-[#F8FAFB] flex items-center justify-center">
      {/* Container Responsivo Centrado */}
      <div className="w-full max-w-lg h-full bg-[#F8FAFB] relative flex flex-col items-center justify-between p-6 overflow-hidden">
        
        <div className="w-full flex justify-end absolute top-6 right-6 z-10">
          <Button 
            variant="ghost" 
            onClick={onComplete} 
            className="text-[10px] font-black uppercase tracking-widest text-[#1a3a5c]/60 hover:text-[#1a3a5c] hover:bg-transparent"
          >
            Pular
          </Button>
        </div>

        <div className="flex-1 w-full flex flex-col justify-center mt-12 overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {slides.map((slide, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 px-4">
                <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                  <div className={cn(
                    "w-32 h-32 rounded-[2rem] bg-gradient-to-br flex items-center justify-center shadow-2xl shadow-[#1a3a5c]/10",
                    slide.color
                  )}>
                    <slide.icon className="w-14 h-14 text-white" />
                  </div>
                  
                  <div className="space-y-4 max-w-sm">
                    <h2 className="text-xl font-black uppercase tracking-tight text-[#1a3a5c] px-4">
                      {slide.title}
                    </h2>
                    <p className="text-[13px] text-[#1a3a5c]/60 leading-relaxed font-medium px-6">
                      {slide.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-xs space-y-10 pb-12">
          {/* Indicators */}
          <div className="flex justify-center gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  index === selectedIndex ? "w-8 bg-[#1a3a5c]" : "w-2 bg-[#1a3a5c]/10"
                )}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext} 
            className="w-full h-11 text-[10px] font-black uppercase tracking-widest rounded-xl shadow-sm active:scale-95 transition-all bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white"
          >
            {selectedIndex === slides.length - 1 ? "Começar Agora" : "Próximo"}
            {selectedIndex !== slides.length - 1 && <ChevronRight className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      </div>
    </div>
  );
};
