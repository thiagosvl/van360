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
          "bg-white rounded-2xl shadow-xs border border-slate-100 relative p-4 sm:p-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2",
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
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="w-5 h-5 text-emerald-600 shrink-0" />
            <h3 className="font-bold text-[#1a3a5c] text-[15px] sm:text-[16px] tracking-tight leading-tight">
              Chega de cobrar os pais! Deixa com a gente.
            </h3>
          </div>
          <p className="text-xs text-slate-500 font-normal mt-1 leading-snug">
            Você não precisa mais cobrar os pais um por um. O Van360 faz isso automático.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="group bg-slate-50/70 hover:bg-emerald-50/20 border border-slate-100 hover:border-emerald-100/70 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-semibold text-slate-800 text-[13px] leading-tight">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-500 leading-snug mb-3">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={item.action}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-white hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-200 text-[11px] font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-98 cursor-pointer mt-auto"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  <span>Ver exemplo</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
