import { PLANO_COMPLETO, PLANO_ESSENCIAL, PLANO_GRATUITO } from "@/constants";
import { Car, ChartArea, CreditCard, GraduationCap, LayoutDashboard, Receipt, Users, Wallet } from "lucide-react";

const checkPagesAvailability = (availablePlans: string[] | undefined, plano: any) => {
    if (!availablePlans) return false;
    if (!plano) return false;

    return availablePlans.includes(plano.slug);
};

const enablePageActions = (href, plano) => {
    const pageItem = pagesItems.filter((item) => item.href == href);

    if (!pageItem.length) {
        return false;
    }

    const available = checkPagesAvailability(pageItem[0].availablePlans, plano) && plano.isValidPlan;

    return available;
}

const pagesItems = [
    {
        title: "Início",
        href: "/inicio",
        icon: LayoutDashboard,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO]
    },
    {
        title: "Cobranças",
        href: "/cobrancas",
        icon: CreditCard,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Passageiros",
        href: "/passageiros",
        icon: Users,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Escolas",
        href: "/escolas",
        icon: GraduationCap,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Veículos",
        href: "/veiculos",
        icon: Car,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Gastos",
        href: "/gastos",
        icon: Wallet,
        availablePlans: [PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Relatórios",
        href: "/relatorios",
        icon: ChartArea,
        availablePlans: [PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
    {
        title: "Minha Assinatura",
        href: "/assinatura",
        icon: Receipt,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_COMPLETO],
    },
];

export { checkPagesAvailability, enablePageActions, pagesItems };

