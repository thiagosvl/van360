import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WhatsAppShowcaseEmulator } from "@/components/features/demonstracoes/WhatsAppShowcaseEmulator";
import { cn } from "@/lib/utils";

interface DemonstracoesWhatsAppCardProps {
  profile?: {
    nome?: string | null;
    apelido?: string | null;
  } | null;
  onDismiss: () => void;
  className?: string;
}

export function DemonstracoesWhatsAppCard({
  profile,
  onDismiss,
  className,
}: DemonstracoesWhatsAppCardProps) {
  const driverDisplayName = profile?.apelido?.trim() || profile?.nome?.trim() || undefined;

  return (
    <section className="px-1">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-xs border border-slate-200/80 relative p-3.5 sm:p-5 xl:p-6 transition-all duration-300 animate-in fade-in slide-in-from-top-2",
          className
        )}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5 w-6 h-6 rounded-full bg-white border border-slate-200/90 shadow-xs flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all active:scale-90 z-20 cursor-pointer"
          aria-label="Ocultar demonstrações"
          title="Ocultar demonstrações"
        >
          <X className="h-3.5 w-3.5" />
        </button>

        <div className="mb-4">
          <h3 className="font-bold text-[#1a3a5c] text-[15.5px] sm:text-[17px] tracking-tight leading-tight flex items-center gap-2">
            <WhatsAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-[#25D366] shrink-0" />
            <span>Veja o que os pais recebem no WhatsApp</span>
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-snug">
            <span className="xl:hidden">Alterne entre as opções abaixo para conferir as mensagens prontas.</span>
            <span className="hidden xl:inline">Confira abaixo os modelos de mensagens automáticas enviadas aos pais.</span>
          </p>
        </div>

        <WhatsAppShowcaseEmulator driverName={driverDisplayName} />
      </div>
    </section>
  );
}
