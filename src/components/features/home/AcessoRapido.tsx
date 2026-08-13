import { Link } from "react-router-dom";
import {
  UserPlus,
  Receipt,
  ChevronRight,
  Users2,
  TrendingDown,
  FileText,
  GraduationCap,
  Car,
  Settings,
  Rocket,
  ChartArea,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/config/permissions";

interface AcessoRapidoProps {
  onCadastrarPassageiro: () => void;
  onRegistrarGasto: () => void;
}

enum AcessoRapidoItemKey {
  EQUIPE = "equipe",
  GASTOS = "gastos",
  CONTRATOS = "contratos",
  RELATORIOS = "relatorios",
  ESCOLAS = "escolas",
  VEICULOS = "veiculos",
  CONFIGURACOES = "configuracoes",
  ASSINATURA = "assinatura",
}

export const AcessoRapido = ({
  onCadastrarPassageiro,
  onRegistrarGasto,
}: AcessoRapidoProps) => {
  const { can, isMotoristaAuxiliar, isMonitor } = usePermissions();

  // Para monitor, NÃO exibimos o Acesso Rápido
  if (isMonitor) {
    return null;
  }

  const getSecondaryItems = () => {
    // Perfil MOTORISTA AUXILIAR
    if (isMotoristaAuxiliar) {
      return [
        {
          id: AcessoRapidoItemKey.EQUIPE,
          label: "Minha Equipe",
          icon: Users2,
          to: ROUTES.PRIVATE.MOTORISTA.TEAM,
          show: can(PERMISSIONS.EQUIPE_GERENCIAR_MONITORES),
        },
        {
          id: AcessoRapidoItemKey.CONFIGURACOES,
          label: "Configurações",
          icon: Settings,
          to: ROUTES.PRIVATE.MOTORISTA.SETTINGS,
          show: true,
        },
      ].filter((item) => item.show);
    }

    // Perfil MOTORISTA (Gestor Principal / Padrão)
    return [
      {
        id: AcessoRapidoItemKey.EQUIPE,
        label: "Minha Equipe",
        icon: Users2,
        to: ROUTES.PRIVATE.MOTORISTA.TEAM,
        show: can(PERMISSIONS.EQUIPE_GERENCIAR_MONITORES),
      },
      {
        id: AcessoRapidoItemKey.GASTOS,
        label: "Gastos",
        icon: TrendingDown,
        to: ROUTES.PRIVATE.MOTORISTA.EXPENSES,
        show: can(PERMISSIONS.GASTOS_VISUALIZAR),
      },
      {
        id: AcessoRapidoItemKey.CONTRATOS,
        label: "Contratos",
        icon: FileText,
        to: ROUTES.PRIVATE.MOTORISTA.CONTRACTS,
        show: can(PERMISSIONS.CONTRATOS_GERENCIAR),
      },
      {
        id: AcessoRapidoItemKey.RELATORIOS,
        label: "Relatórios",
        icon: ChartArea,
        to: ROUTES.PRIVATE.MOTORISTA.REPORTS,
        show: can(PERMISSIONS.RELATORIOS_VISUALIZAR),
      },
      {
        id: AcessoRapidoItemKey.ESCOLAS,
        label: "Escolas",
        icon: GraduationCap,
        to: ROUTES.PRIVATE.MOTORISTA.SCHOOLS,
        show: can(PERMISSIONS.ESCOLAS_GERENCIAR) || can(PERMISSIONS.ESCOLAS_VISUALIZAR),
      },
      {
        id: AcessoRapidoItemKey.VEICULOS,
        label: "Veículos",
        icon: Car,
        to: ROUTES.PRIVATE.MOTORISTA.VEHICLES,
        show: can(PERMISSIONS.VEICULOS_GERENCIAR),
      },
      {
        id: AcessoRapidoItemKey.CONFIGURACOES,
        label: "Configurações",
        icon: Settings,
        to: ROUTES.PRIVATE.MOTORISTA.SETTINGS,
        show: true,
      },
      {
        id: AcessoRapidoItemKey.ASSINATURA,
        label: "Minha Assinatura",
        icon: Rocket,
        to: ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION,
        show: can(PERMISSIONS.ASSINATURA_GERENCIAR),
      },
    ].filter((item) => item.show);
  };

  const secondaryItems = getSecondaryItems();

  // Apenas Motorista Principal visualiza os cards de ação rápida superior
  const showPrimaryCards = !isMotoristaAuxiliar;
  const showCadastrarPassageiro = showPrimaryCards && can(PERMISSIONS.PASSAGEIROS_GERENCIAR);
  const showRegistrarGasto = showPrimaryCards && can(PERMISSIONS.GASTOS_CRIAR);

  return (
    <section className="mt-6 px-1">
      <div className="mb-4">
        <h2 className="text-[17px] sm:text-lg font-bold text-[#1a3a5c]">
          Acesso Rápido
        </h2>
        <p className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5">
          Ações mais comuns e navegação do sistema.
        </p>
      </div>

      {/* Ações Principais (Cards em Destaque) */}
      {(showCadastrarPassageiro || showRegistrarGasto) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          {showCadastrarPassageiro && (
            <button
              type="button"
              onClick={onCadastrarPassageiro}
              className="group relative flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 border-l-[4px] border-l-[#1a3a5c] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none text-left w-full active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e8f2ff] text-[#1a3a5c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1a3a5c] leading-snug">
                    Cadastrar Passageiro
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">
                    Adicionar novo cliente
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}

          {showRegistrarGasto && (
            <button
              type="button"
              onClick={onRegistrarGasto}
              className="group relative flex items-center justify-between p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-100 border-l-[4px] border-l-[#1a3a5c] shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none text-left w-full active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#e8f2ff] text-[#1a3a5c] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-[14px] sm:text-[15px] font-bold text-[#1a3a5c] leading-snug">
                    Registrar Gasto
                  </h3>
                  <p className="text-[11px] sm:text-[12px] text-slate-400 mt-0.5">
                    Combustível, manutenção, etc.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          )}
        </div>
      )}

      {/* Grade de Navegação Secundária */}
      {secondaryItems.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 border-slate-100">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className="flex flex-col items-center justify-center p-4 sm:p-5 text-center hover:bg-slate-50/80 active:bg-slate-100 transition-colors group cursor-pointer border-r border-b border-slate-100"
                >
                  <Icon className="w-6 h-6 text-[#1a3a5c] mb-2 group-hover:scale-110 transition-transform stroke-[1.75]" />
                  <span className="text-[12px] sm:text-[13px] font-semibold text-[#1a3a5c] leading-tight">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
