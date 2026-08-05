import { Car, ChartArea, FileText, GraduationCap, LayoutDashboard, TrendingDown, Users, Rocket, BadgeDollarSign, Route, Settings, Users2, Cake } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { PermissionKey } from "@/config/permissions";

export interface PageItem {
  title: string;
  href: string;
  icon: any;
  permission?: PermissionKey;
}

const pagesItems: PageItem[] = [
  {
    title: "Início",
    href: ROUTES.PRIVATE.MOTORISTA.HOME,
    icon: LayoutDashboard,
  },
  {
    title: "Contratos",
    href: ROUTES.PRIVATE.MOTORISTA.CONTRACTS,
    icon: FileText,
    permission: "contratos.gerenciar",
  },
  {
    title: "Rotas",
    href: ROUTES.PRIVATE.MOTORISTA.ROUTES,
    icon: Route,
    permission: "rotas.visualizar",
  },
  {
    title: "Minha Equipe",
    href: ROUTES.PRIVATE.MOTORISTA.TEAM,
    icon: Users2,
    permission: "equipe.gerenciar_monitores",
  },
  {
    title: "Parcelas",
    href: ROUTES.PRIVATE.MOTORISTA.BILLING,
    icon: BadgeDollarSign,
    permission: "cobrancas.gerenciar",
  },
  {
    title: "Passageiros",
    href: ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
    icon: Users,
    permission: "passageiros.visualizar",
  },
  {
    title: "Escolas",
    href: ROUTES.PRIVATE.MOTORISTA.SCHOOLS,
    icon: GraduationCap,
    permission: "escolas.visualizar",
  },
  {
    title: "Veículos",
    href: ROUTES.PRIVATE.MOTORISTA.VEHICLES,
    icon: Car,
    permission: "veiculos.gerenciar",
  },
  {
    title: "Gastos",
    href: ROUTES.PRIVATE.MOTORISTA.EXPENSES,
    icon: TrendingDown,
    permission: "gastos.visualizar",
  },
  {
    title: "Relatórios",
    href: ROUTES.PRIVATE.MOTORISTA.REPORTS,
    icon: ChartArea,
    permission: "relatorios.visualizar",
  },
  {
    title: "Aniversariantes",
    href: ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS,
    icon: Cake,
    permission: "aniversarios.visualizar",
  },
  {
    title: "Configurações",
    href: ROUTES.PRIVATE.MOTORISTA.SETTINGS,
    icon: Settings,
  },
  {
    title: "Minha Assinatura",
    href: ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION,
    icon: Rocket,
    permission: "assinatura.gerenciar",
  },
];

// Centraliza a configuração dos itens que aparecem no rodapé mobile
const bottomNavHrefs: string[] = [
  ROUTES.PRIVATE.MOTORISTA.HOME,
  ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
  ROUTES.PRIVATE.MOTORISTA.BILLING,
  ROUTES.PRIVATE.MOTORISTA.ROUTES,
];

export { pagesItems, bottomNavHrefs };
