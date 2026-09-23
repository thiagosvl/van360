import { BellRing, Receipt, FileText, Eye, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
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
  const {
    openWhatsAppCobrancaPreviewDialog,
    openReciboPreviewDialog,
    openWhatsAppContratoPreviewDialog,
  } = useLayout();

  const driverDisplayName = profile?.apelido?.trim() || profile?.nome?.trim() || undefined;

  const handleOpenCobranca = () => {
    openWhatsAppCobrancaPreviewDialog({
      showPixSetupAction: true,
      driverName: driverDisplayName,
    });
  };

  const handleOpenRecibo = () => {
    openReciboPreviewDialog({
      driverName: driverDisplayName,
    });
  };

  const handleOpenContrato = () => {
    openWhatsAppContratoPreviewDialog({
      driverName: driverDisplayName,
    });
  };

  const items = [
    {
      id: "cobranca_automatica",
      title: "Cobrança Automática",
      description: "Cobramos os pais automaticamente pelo WhatsApp sem você precisar fazer nada.",
      icon: BellRing,
      action: handleOpenCobranca,
    },
    {
      id: "recibos",
      title: "Recibos no WhatsApp",
      description: "Envie o comprovante digital aos pais com um toque.",
      icon: Receipt,
      action: handleOpenRecibo,
    },
    {
      id: "contratos",
      title: "Contratos Digitais",
      description: "Gere contratos com assinatura online pelo celular e validade jurídica.",
      icon: FileText,
      action: handleOpenContrato,
    },
  ];

  return (
    <section className="px-1">
      <div
        className={cn(
          "bg-white rounded-2xl shadow-xs border border-slate-200/80 relative p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2",
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

        <div className="mb-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#008069] text-white text-[10.5px] font-bold tracking-wide uppercase shadow-xs mb-2.5">
            <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
            <span>Demonstrações Interativas</span>
          </div>

          <h3 className="font-bold text-[#1a3a5c] text-[16px] sm:text-[17px] tracking-tight leading-tight">
            Veja o que seus clientes recebem no WhatsApp
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-snug">
            Toque em cada modelo para ver a mensagem real enviada aos pais.
          </p>
        </div>

        <div
          className="flex overflow-x-auto scrollbar-none pb-2 pt-0.5 gap-2.5 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible touch-pan-x -mx-1 px-1 sm:mx-0 sm:px-0 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="w-[210px] shrink-0 sm:w-auto snap-start group bg-white border border-slate-200/90 hover:border-emerald-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-bold text-slate-800 text-[13px] min-[360px]:text-[13.5px] leading-tight">
                      {item.title}
                    </h4>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-snug mb-3">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={item.action}
                  className="w-full inline-flex items-center justify-center py-1.5 px-3 rounded-lg bg-white hover:bg-emerald-50/70 text-emerald-700 border border-emerald-600/80 hover:border-emerald-600 text-[11.5px] font-bold transition-all shadow-2xs active:scale-98 cursor-pointer mt-auto"
                >
                  <span>Ver demonstração</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
