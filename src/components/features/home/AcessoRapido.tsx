import { Link } from "react-router-dom";
import {
  UserPlus,
  Receipt,
  Users2,
  TrendingDown,
  FileText,
  GraduationCap,
  Car,
  Rocket,
  ChartArea,
  Route,
  LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { usePermissions } from "@/hooks/business/usePermissions";
import { PERMISSIONS } from "@/config/permissions";

interface AcessoRapidoProps {
  onCadastrarPassageiro: () => void;
  onRegistrarGasto: () => void;
}

enum AcessoRapidoItemKey {
  CADASTRAR_ALUNO = "cadastrar_aluno",
  REGISTRAR_GASTO = "registrar_gasto",
  ROTAS = "rotas",
  EQUIPE = "equipe",
  GASTOS = "gastos",
  CONTRATOS = "contratos",
  RELATORIOS = "relatorios",
  ESCOLAS = "escolas",
  VEICULOS = "veiculos",
  ASSINATURA = "assinatura",
}

interface AcessoRapidoItem {
  id: AcessoRapidoItemKey;
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  show: boolean;
  isAction?: boolean;
}

export const AcessoRapido = ({
  onCadastrarPassageiro,
  onRegistrarGasto,
}: AcessoRapidoProps) => {
  const { can, isMotoristaAuxiliar, isMonitor } = usePermissions();

  if (isMonitor || isMotoristaAuxiliar) {
    return null;
  }

  const getItems = (): AcessoRapidoItem[] => {
    if (isMotoristaAuxiliar) {
      return [
        {
          id: AcessoRapidoItemKey.EQUIPE,
          label: "Minha Equipe",
          icon: Users2,
          to: ROUTES.PRIVATE.MOTORISTA.TEAM,
          show: can(PERMISSIONS.EQUIPE_GERENCIAR_MONITORES),
        },
      ].filter((item) => item.show);
    }

    return [
      {
        id: AcessoRapidoItemKey.CADASTRAR_ALUNO,
        label: "Cadastrar Aluno",
        icon: UserPlus,
        onClick: onCadastrarPassageiro,
        show: can(PERMISSIONS.PASSAGEIROS_GERENCIAR),
        isAction: true,
      },
      {
        id: AcessoRapidoItemKey.REGISTRAR_GASTO,
        label: "Registrar Gasto",
        icon: Receipt,
        onClick: onRegistrarGasto,
        show: can(PERMISSIONS.GASTOS_CRIAR),
        isAction: true,
      },
      {
        id: AcessoRapidoItemKey.ROTAS,
        label: "Rotas",
        icon: Route,
        to: ROUTES.PRIVATE.MOTORISTA.ROUTES,
        show: can(PERMISSIONS.ROTAS_VISUALIZAR),
      },
      {
        id: AcessoRapidoItemKey.RELATORIOS,
        label: "Relatórios",
        icon: ChartArea,
        to: ROUTES.PRIVATE.MOTORISTA.REPORTS,
        show: can(PERMISSIONS.RELATORIOS_VISUALIZAR),
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
        id: AcessoRapidoItemKey.VEICULOS,
        label: "Veículos",
        icon: Car,
        to: ROUTES.PRIVATE.MOTORISTA.VEHICLES,
        show: can(PERMISSIONS.VEICULOS_GERENCIAR),
      },
      {
        id: AcessoRapidoItemKey.ESCOLAS,
        label: "Escolas",
        icon: GraduationCap,
        to: ROUTES.PRIVATE.MOTORISTA.SCHOOLS,
        show: can(PERMISSIONS.ESCOLAS_GERENCIAR) || can(PERMISSIONS.ESCOLAS_VISUALIZAR),
      },
      {
        id: AcessoRapidoItemKey.EQUIPE,
        label: "Minha Equipe",
        icon: Users2,
        to: ROUTES.PRIVATE.MOTORISTA.TEAM,
        show: can(PERMISSIONS.EQUIPE_GERENCIAR_MONITORES),
      },
      {
        id: AcessoRapidoItemKey.ASSINATURA,
        label: "Assinatura",
        icon: Rocket,
        to: ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION,
        show: can(PERMISSIONS.ASSINATURA_GERENCIAR),
      },
    ].filter((item) => item.show);
  };

  const items = getItems();

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="px-1">
      <div className="mb-3.5 px-0.5">
        <h2 className="text-lg font-semibold text-[#0a0a0a] tracking-tight">
          Acesso Rápido
        </h2>
        <p className="text-xs text-[#737373] mt-0.5">
          Ações mais comuns e navegação no app
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-3 sm:p-5 lg:p-6 shadow-xs">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-10 gap-1.5 sm:gap-2.5">
          {items.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <div
                  className={
                    item.isAction
                      ? "w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 min-[390px]:w-13 min-[390px]:h-13 rounded-[14px] min-[360px]:rounded-[16px] min-[390px]:rounded-[18px] bg-blue-50 text-blue-600 border border-blue-100/80 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors flex items-center justify-center shrink-0 shadow-2xs"
                      : "w-11 h-11 min-[360px]:w-12 min-[360px]:h-12 min-[390px]:w-13 min-[390px]:h-13 rounded-[14px] min-[360px]:rounded-[16px] min-[390px]:rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] group-hover:bg-primary/10 group-hover:text-primary transition-colors flex items-center justify-center shrink-0"
                  }
                >
                  <Icon className="w-5 h-5 min-[390px]:w-5.5 min-[390px]:h-5.5 stroke-[1.75]" />
                </div>
                <span className="text-[10px] min-[360px]:text-[11px] min-[390px]:text-xs font-medium text-[#171717] group-hover:text-primary transition-colors leading-tight line-clamp-2 text-center w-full px-0.5 min-h-[26px] min-[360px]:min-h-[28px] min-[390px]:min-h-[30px] flex items-center justify-center">
                  {item.label}
                </span>
              </>
            );

            const className = "flex flex-col items-center justify-center p-1 min-[360px]:p-1.5 min-[390px]:p-2 rounded-[18px] text-center gap-1.5 min-[360px]:gap-2 transition-all hover:bg-[#f5f5f5] active:scale-95 group cursor-pointer w-full";

            if (item.to) {
              return (
                <Link key={item.id} to={item.to} className={className}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={item.id} type="button" onClick={item.onClick} className={className}>
                {content}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
