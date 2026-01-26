import { Car, ChartArea, CreditCard, GraduationCap, LayoutDashboard, Receipt, TrendingDown, Users } from "lucide-react";

const pagesItems = [
    {
        title: "Início",
        href: "/inicio",
        icon: LayoutDashboard,
    },
    {
        title: "Cobranças",
        href: "/cobrancas",
        icon: CreditCard,
    },
    {
        title: "Passageiros",
        href: "/passageiros",
        icon: Users,
    },
    {
        title: "Escolas",
        href: "/escolas",
        icon: GraduationCap,
    },
    {
        title: "Veículos",
        href: "/veiculos",
        icon: Car,
    },
    {
        title: "Gastos",
        href: "/gastos",
        icon: TrendingDown,
    },
    {
        title: "Relatórios",
        href: "/relatorios",
        icon: ChartArea,
    },
    {
        title: "Minha Assinatura",
        href: "/assinatura",
        icon: Receipt,
    },
];

export { pagesItems };

