import { BaseDialog } from "@/components/ui/BaseDialog";
import { safeCloseDialog } from "@/hooks";
import { useLayout } from "@/contexts/LayoutContext";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import {
  Bus,
  BellRing,
  Receipt,
  FileText,
  BadgeDollarSign,
  TrendingDown,
  Route,
  ChartArea,
  Sparkles,
  Eye,
  Cake,
  Smartphone,
} from "lucide-react";

export interface ShowcaseTransporteEscolarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToRegister?: () => void;
}

export function ShowcaseTransporteEscolarDialog({
  isOpen,
  onClose,
  onNavigateToRegister,
}: ShowcaseTransporteEscolarDialogProps) {
  const navigate = useNavigate();
  const {
    openWhatsAppCobrancaPreviewDialog,
    openReciboPreviewDialog,
    openWhatsAppContratoPreviewDialog,
  } = useLayout();

  const handleOpenCobranca = () => {
    openWhatsAppCobrancaPreviewDialog({
      showPixSetupAction: false,
      driverName: "Tio da Van",
    });
  };

  const handleOpenRecibo = () => {
    openReciboPreviewDialog({
      driverName: "Tio da Van",
    });
  };

  const handleOpenContrato = () => {
    openWhatsAppContratoPreviewDialog({
      driverName: "Tio da Van",
    });
  };

  const handleRegisterClick = () => {
    safeCloseDialog(() => {
      onClose();
      if (onNavigateToRegister) {
        onNavigateToRegister();
      } else {
        navigate(ROUTES.PUBLIC.REGISTER, { state: { fromSplash: true } });
      }
    });
  };

  const demoItems = [
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

  const moreFeatures = [
    {
      id: "parcelas",
      title: "Parcelas & Pagamentos",
      description: "Registre pagamentos e saiba quem ainda não pagou e quanto tem para receber.",
      icon: BadgeDollarSign,
    },
    {
      id: "gastos",
      title: "Gastos da Van",
      description: "Controle despesas como combustível, manutenção e mais.",
      icon: TrendingDown,
    },
    {
      id: "rotas",
      title: "Rotas & Chamada",
      description: "Organize paradas e faça a chamada dos alunos na palma da mão.",
      icon: Route,
    },
    {
      id: "lucro",
      title: "Lucro Real da Van",
      description: "Relatórios completos para acompanhar o lucro real do seu transporte.",
      icon: ChartArea,
    },
    {
      id: "app_pais",
      title: "Aplicativo dos Pais",
      description: "Acessar a carteirinha do aluno, ver recibos, registrar ausências e acompanhar a van.",
      icon: Smartphone,
    },
    {
      id: "aniversariantes",
      title: "Aniversariantes",
      description: "Acompanhe os aniversários do mês para parabenizar seus alunos.",
      icon: Cake,
    },
    {
      id: "muito_mais",
      title: "E muito mais...",
      description: "Gestão de equipe, relatórios completos e controle total.",
      icon: Sparkles,
    },
  ];

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && safeCloseDialog(onClose)}
      maxWidth="md"
    >
      <BaseDialog.Header
        title="Transporte Escolar"
        subtitle="Veja o que o Van360 faz pela sua van"
        icon={<Bus className="w-5 h-5 text-[#15469C]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="p-4 sm:p-5 space-y-4 bg-slate-50/40 overflow-y-auto">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {demoItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="group bg-white border border-slate-200/80 hover:border-emerald-200/90 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-bold text-slate-800 text-[13px] leading-tight">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-[11.5px] text-slate-600 leading-snug mb-3">
                      {item.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={item.action}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 text-[11px] font-bold transition-all active:scale-98 cursor-pointer mt-auto"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Ver demonstração</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-[13px] font-bold text-[#1a3a5c] tracking-tight mb-2.5">
            Mais recursos para sua van
          </h4>

          <div
            className="flex gap-2.5 overflow-x-auto scrollbar-none pb-2 pt-0.5 px-0.5 touch-pan-x"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {moreFeatures.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="w-[210px] shrink-0 flex flex-col justify-between p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h5 className="text-[12.5px] font-bold text-slate-800 tracking-tight leading-tight">
                        {item.title}
                      </h5>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Criar conta grátis"
          variant="primary"
          icon={<Sparkles className="w-4 h-4 mr-1.5" />}
          onClick={handleRegisterClick}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default ShowcaseTransporteEscolarDialog;
