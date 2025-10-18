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
        className={`transition-all duration-300 hover:scale-[1.03] hover:shadow-xl h-full ${bg} border-2 border-transparent hover:border-gray-20`}
      >
        <CardContent className="p-5 flex flex-col justify-center items-center text-center space-y-3 h-full">
          <Icon className={`h-10 w-10 mb-2 ${color}`} />

          <div className="text-center">
            <p className="text-xl font-extrabold text-foreground leading-snug">
              {title}
            </p>

            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
        </CardContent>
      </Card>
    </NavLink>
  );
};

const Inicio = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { profile } = useAuth();

  const ACCESS_CARDS_DATA = [
    {
      title: "Cobranças",
      description:
        "Visualize e gerencie as cobranças, registre pagamentos e envie notificações.",
      href: "/cobrancas",
      icon: CreditCard,
      color: "text-blue-700",
      bg: "bg-blue-100",
    },
    {
      title: "Passageiros",
      description:
        "Cadastre, edite e ative/desative passageiros e responsáveis.",
      href: "/passageiros",
      icon: Users,
      color: "text-green-700",
      bg: "bg-green-100",
    },
    {
      title: "Relatórios",
      description: "Visualize faturamento, inadimplência e projeções mensais.",
      href: "/relatorios",
      icon: LayoutDashboard,
      color: "text-yellow-700",
      bg: "bg-yellow-100",
    },
    {
      title: "Configurações",
      description:
        "Ajuste notificações, preferências de cobrança e dados do motorista.",
      href: "/configuracoes",
      icon: Settings,
      color: "text-purple-700",
      bg: "bg-purple-100",
    },
    {
      title: "Escolas",
      description: "Gerencie a lista de escolas atendidas e seus detalhes.",
      href: "/escolas",
      icon: GraduationCap,
      color: "text-stone-700",
      bg: "bg-stone-200",
    },
    {
      title: "Gastos",
      description:
        "Registre despesas operacionais e visualize o balanço financeiro.",
      href: "/gastos",
      icon: Wallet,
      color: "text-red-700",
      bg: "bg-red-100",
    },
  ];

  useEffect(() => {
    setPageTitle(
      profile.id ? `Olá, ${profile.nome.split(" ")[0]}` : "Carregando..."
    );
    setPageSubtitle("");
  }, [setPageTitle, setPageSubtitle]);

  const pullToRefreshReload = async () => {
    console.log("Atualizando dados da tela inicial...");
  };

  const accessCardsWithSubtitles = ACCESS_CARDS_DATA.map((card) => ({
    ...card,
    subtitle: card.description,
  }));

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-8">
        <QuickStartCard />

        <section>
          <h2 className="text-xl font-semibold mb-4">Acessos Rápidos</h2>

          <div className="overflow-x-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 -mx-4">
              {accessCardsWithSubtitles.map((card) => (
                <div key={card.href} className="px-4 pb-4">
                  <AccessCard {...card} />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </PullToRefreshWrapper>
  );
};

export default Inicio;
