import { PLANO_ESSENCIAL, PLANO_GRATUITO, PLANO_PROFISSIONAL } from "@/constants";
import { hasPageAccess } from "@/utils/domain/plano/accessRules";
import { Car, ChartArea, CreditCard, GraduationCap, LayoutDashboard, Receipt, Users, Wallet } from "lucide-react";

/**
 * @deprecated Use hasPageAccess from accessRules instead
 * Mantido para compatibilidade com código existente
 */
const checkPagesAvailability = (availablePlans: string[] | undefined, plano: any) => {
    if (!availablePlans) return false;
    if (!plano) return false;

    return availablePlans.includes(plano.slug);
};

/**
 * Valida se o usuário tem acesso a ações de uma página específica
 * 
 * @param href - Caminho da página (ex: "/gastos")
 * @param plano - Dados do plano do usuário (retornado por useProfile)
 * @returns true se tem acesso, false caso contrário
 */
const enablePageActions = (href: string, plano: any, userRole?: string): boolean => {
    if (!plano) return false;
    
    // Usar a função centralizada de validação
    return hasPageAccess(href, plano, userRole);
}

const pagesItems = [
    {
        title: "Início",
        href: "/inicio",
        icon: LayoutDashboard,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL]
    },
    {
        title: "Cobranças",
        href: "/cobrancas",
        icon: CreditCard,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Passageiros",
        href: "/passageiros",
        icon: Users,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Escolas",
        href: "/escolas",
        icon: GraduationCap,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Veículos",
        href: "/veiculos",
        icon: Car,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Gastos",
        href: "/gastos",
        icon: Wallet,
        availablePlans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Relatórios",
        href: "/relatorios",
        icon: ChartArea,
        availablePlans: [PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
    {
        title: "Minha Assinatura",
        href: "/assinatura",
        icon: Receipt,
        availablePlans: [PLANO_GRATUITO, PLANO_ESSENCIAL, PLANO_PROFISSIONAL],
    },
];

export { checkPagesAvailability, enablePageActions, pagesItems };

