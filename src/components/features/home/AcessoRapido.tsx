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
  User,
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
  EQUIPE = "equipe",
  GASTOS = "gastos",
  CONTRATOS = "contratos",
  RELATORIOS = "relatorios",
  ESCOLAS = "escolas",
  VEICULOS = "veiculos",
  CONTA = "conta",
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
        {
          id: AcessoRapidoItemKey.CONTA,
          label: "Conta",
          icon: User,
          to: ROUTES.PRIVATE.MOTORISTA.ACCOUNT,
          show: true,
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
        id: AcessoRapidoItemKey.CONTA,
        label: "Conta",
        icon: User,
        to: ROUTES.PRIVATE.MOTORISTA.ACCOUNT,
        show: true,
      },
      {
        id: AcessoRapidoItemKey.ASSINATURA,
        label: "Assinatura do App",
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
      <div className="mb-4">
        <h2 className="text-[17px] sm:text-lg font-bold text-[#1a3a5c]">
          Acesso Rápido
        </h2>
        <p className="text-[12px] sm:text-[13px] text-slate-400 mt-0.5">
          Ações mais comuns e navegação do sistema.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-slate-100">
          {items.map((item) => {
            const Icon = item.icon;
            const itemContent = (
              <>
                {item.isAction ? (
                  <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-[#1a3a5c] flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                    <Icon className="w-5 h-5 stroke-[2]" />
                  </div>
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center mb-1.5">
                    <Icon className="w-6 h-6 text-slate-600 group-hover:text-[#1a3a5c] group-hover:scale-110 transition-all stroke-[1.75]" />
                  </div>
                )}
                <span
                  className={
                    item.isAction
                      ? "text-[12px] sm:text-[13px] font-bold text-[#1a3a5c] leading-tight"
                      : "text-[12px] sm:text-[13px] font-medium text-slate-700 group-hover:text-[#1a3a5c] transition-colors leading-tight"
                  }
                >
                  {item.label}
                </span>
              </>
            );

            const itemClassName = `flex flex-col items-center justify-center p-4 sm:p-5 text-center transition-colors group cursor-pointer border-r border-b border-slate-100 ${
              item.isAction
                ? "bg-[#f4f8fd] hover:bg-[#eaf2fc] active:bg-[#dfeaf8]"
                : "bg-white hover:bg-slate-50/80 active:bg-slate-100"
            }`;

            if (item.to) {
              return (
                <Link
                  key={item.id}
                  to={item.to}
                  className={itemClassName}
                >
                  {itemContent}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className={itemClassName}
              >
                {itemContent}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
