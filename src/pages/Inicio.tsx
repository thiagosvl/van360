import { QuickStartCard } from "@/components/QuickStartCard";
import { Card, CardContent } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useAuth } from "@/hooks/useAuth";
import {
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect } from "react";
import { NavLink } from "react-router-dom";

// --- Componente: Cards de Acesso Rápido ---
const AccessCard = ({
  title,
  subtitle,
  href,
  icon: Icon,
  color,
  bg,
}: (typeof ACCESS_CARDS_DATA)[0] & { subtitle: string }) => {
  return (
    <NavLink to={href} className="col-span-1">
      <Card
        // Ajuste: Transição mais suave e hover mais nítido
        className={`transition-all duration-300 hover:scale-[1.03] hover:shadow-xl h-full ${bg} border-2 border-transparent hover:border-gray-20`}
      >
        {/* Adicionado padding extra para 'respirar' e alinhamento melhorado */}
        <CardContent className="p-5 flex flex-col justify-center items-center text-center space-y-3 h-full">
          {/* Ajuste: Ícone maior e mais impactante */}
          <Icon className={`h-10 w-10 mb-2 ${color}`} />

          <div className="text-center">
            {/* Ajuste: Título mais compacto (menos leading) */}
            <p className="text-base font-bold text-foreground leading-tight">
              {title}
            </p>

            {/* Ajuste: Subtítulo mais sutil */}
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </NavLink>
  );
};

// --- Componente Principal: Início ---
const Inicio = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { profile } = useAuth();

  // --- 2. Dados Estáticos para Acessos Rápidos (na ordem do menu) ---
  const ACCESS_CARDS_DATA = [
    {
      title: "Mensalidades",
      href: "/mensalidades",
      icon: CreditCard,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Passageiros",
      href: "/passageiros",
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "Relatórios",
      href: "/relatorios",
      icon: LayoutDashboard,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      title: "Escolas",
      href: "/escolas",
      icon: GraduationCap,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      title: "Gastos",
      href: "/gastos",
      icon: Wallet,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
  ];

  useEffect(() => {
    setPageTitle(profile.id ? `Olá, ${profile.nome.split(' ')[0]}` : "Carregando...");
    setPageSubtitle("")
  }, [setPageTitle, setPageSubtitle]);

  const pullToRefreshReload = async () => {
    console.log("Atualizando dados da tela inicial...");
  };

  const accessCardsWithSubtitles = ACCESS_CARDS_DATA.map((card) => ({
    ...card,
    subtitle: `Acesse o módulo de ${card.title.toLowerCase()}.`,
  }));

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-8">
        <QuickStartCard />

        <section>
          <h2 className="text-xl font-semibold mb-4">Acessos Rápidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {accessCardsWithSubtitles.map((card) => (
              <AccessCard key={card.href} {...card} />
            ))}
          </div>
        </section>
      </div>
    </PullToRefreshWrapper>
  );
};

export default Inicio;
