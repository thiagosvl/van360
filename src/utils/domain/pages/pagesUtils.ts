import { Car, ChartArea, CreditCard, FileText, GraduationCap, LayoutDashboard, TrendingDown, Users, Rocket, Cake } from "lucide-react";
import { ROUTES } from "@/constants/routes";

const pagesItems = [
    {
        title: "Início",
        href: ROUTES.PRIVATE.MOTORISTA.HOME,
        icon: LayoutDashboard,
    },
    {
        title: "Mensalidades",
        href: ROUTES.PRIVATE.MOTORISTA.BILLING,
        icon: CreditCard,
    },
    {
        title: "Passageiros",
        href: ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
        icon: Users,
    },
    {
        title: "Contratos",
        href: ROUTES.PRIVATE.MOTORISTA.CONTRACTS,
        icon: FileText,
    },
    {
        title: "Escolas",
        href: ROUTES.PRIVATE.MOTORISTA.SCHOOLS,
        icon: GraduationCap,
    },
    {
        title: "Veículos",
        href: ROUTES.PRIVATE.MOTORISTA.VEHICLES,
        icon: Car,
    },
    {
        title: "Gastos",
        href: ROUTES.PRIVATE.MOTORISTA.EXPENSES,
        icon: TrendingDown,
    },
    {
        title: "Aniversários",
        href: ROUTES.PRIVATE.MOTORISTA.BIRTHDAYS,
        icon: Cake,
    },
    {
        title: "Relatórios",
        href: ROUTES.PRIVATE.MOTORISTA.REPORTS,
        icon: ChartArea,
    },
    {
        title: "Assinatura",
        href: ROUTES.PRIVATE.MOTORISTA.SUBSCRIPTION,
        icon: Rocket,
    },
];

// Centraliza a configuração dos itens que aparecem no rodapé mobile
const bottomNavHrefs = [
    ROUTES.PRIVATE.MOTORISTA.HOME,
    ROUTES.PRIVATE.MOTORISTA.PASSENGERS,
    ROUTES.PRIVATE.MOTORISTA.BILLING,
    ROUTES.PRIVATE.MOTORISTA.CONTRACTS,
];

export { pagesItems, bottomNavHrefs };
