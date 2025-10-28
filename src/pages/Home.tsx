import { QuickStartCard } from "@/components/QuickStartCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { supabase } from "@/integrations/supabase/client";

import LatePaymentsAlert from "@/components/LatePaymentsAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { Cobranca } from "@/types/cobranca";
import { meses } from "@/utils/formatters";
import {
  Car,
  CheckCircle,
  Copy,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LinkIcon,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

const AccessCard = ({
  title,
  href,
  icon: Icon,
  color,
}: (typeof ACCESS_CARDS_DATA)[0] & { subtitle: string }) => {
  return (
    <Card
      className={`shadow-md h-full bg-white border border-gray-200 rounded-xl p-5 lg:p-10 xl:p-12`}
    >
      <CardContent className="p-0 flex flex-col justify-center items-center text-center h-full">
        <Icon
          className={`h-8 w-8 text-primary lg:h-10 lg:w-10 xl:h-12 xl:w-12`}
        />{" "}
      </CardContent>
    </Card>
  );
};

const Home = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { user, loading: isSessionLoading } = useSession();
  const { profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const isAuthLoading = isSessionLoading || isProfileLoading;
  const { toast } = useToast();
  const [latePayments, setLatePayments] = useState<Cobranca[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [loadingFinances, setLoadingFinances] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const ACCESS_CARDS_DATA = [
    {
      title: "Passageiros",
      description:
        "Cadastre, edite e ative/desative passageiros e responsáveis.",
      href: "/passageiros",
      icon: Users,
    },
    {
      title: "Cobranças",
      description:
        "Visualize e gerencie as cobranças, registre pagamentos e envie notificações.",
      href: "/cobrancas",
      icon: CreditCard,
    },
    {
      title: "Escolas",
      description: "Gerencie a lista de escolas atendidas e seus detalhes.",
      href: "/escolas",
      icon: GraduationCap,
    },
    {
      title: "Veículos",
      description: "Gerencie a lista de veículos.",
      href: "/veiculos",
      icon: Car,
    },
    // {
    //   title: "Gastos",
    //   description:
    //     "Registre despesas operacionais e visualize o balanço financeiro.",
    //   href: "/gastos",
    //   icon: Wallet,
    // },
    {
      title: "Relatórios",
      description: "Visualize faturamento, inadimplência e projeções mensais.",
      href: "/relatorios",
      icon: LayoutDashboard,
    },
    // {
    //   title: "Configurações",
    //   description:
    //     "Ajuste notificações, preferências de cobrança e dados do condutor.",
    //   href: "/configuracoes",
    //   icon: Settings,
    // },
  ];

  const BASE_DOMAIN =
    import.meta.env.VITE_PUBLIC_APP_DOMAIN || window.location.origin;

  useEffect(() => {
    if (profile?.nome) {
      setPageTitle(`Olá, ${profile.nome.split(" ")[0]}`);
    } else {
      setPageTitle("Carregando...");
    }
    setPageSubtitle("");
  }, [profile?.nome, setPageTitle, setPageSubtitle]);

  useEffect(() => {
    if (profile?.id) {
      fetchLatePayments();
    }
  }, [profile?.id]);

  const fetchLatePayments = async () => {
    if (!profile?.id) {
      setLoadingFinances(false);
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();
    setMesAtual(mes);
    setAnoAtual(ano);

    try {
      setLoadingFinances(true);
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select(`*`)
        .eq("mes", mes)
        .eq("usuario_id", profile.id)
        .eq("ano", ano);

      const cobrancas = cobrancasMes || ([] as Cobranca[]);

      const cobrancasAtrasadasList = cobrancas.filter((c: Cobranca) => {
        if (c.status === "pago") return false;
        const vencimento = new Date(c.data_vencimento + "T00:00:00");
        return vencimento < hoje;
      });

      setCobrancas(cobrancas);
      setLatePayments(cobrancasAtrasadasList);
    } catch (error) {
      console.error("Erro ao buscar cobranças para Alerta:", error);
    } finally {
      setLoadingFinances(false);
    }
  };

  const handleCopyLink = () => {
    const linkToCopy = `${BASE_DOMAIN}/cadastro-passageiro/${profile?.id}`;

    try {
      navigator.clipboard.writeText(linkToCopy);

      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao copiar link:", error);
      toast({
        title: "Falha ao copiar.",
        description: "Tente copiar o link manualmente.",
        variant: "destructive",
      });
    }
  };

  const pullToRefreshReload = async () => {
    console.log("Atualizando dados da tela inicial...");
  };

  const paginasAOcultarNoPlanoGratis = ["/configuracoes", "/gastos"];

  const accessCardsWithSubtitles = ACCESS_CARDS_DATA.filter((card) => {
    return !paginasAOcultarNoPlanoGratis.includes(card.href);
  }).map((card) => ({
    ...card,
    subtitle: card.description,
  }));

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    console.warn("Perfil não carregado — redirecionando para login.");
    return null;
  }

  return (
    <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
      <div className="space-y-8">
        {/* Quick Start */}
        <QuickStartCard />

        {/* Cobranças Pendentes */}
        {loadingFinances ? (
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="">
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : latePayments.length > 0 ? (
          <LatePaymentsAlert
            mes={mesAtual}
            ano={anoAtual}
            latePayments={latePayments}
          />
        ) : (
          cobrancas.length > 0 && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div className="text-sm font-medium text-green-800">
                Tudo em dia! Não há cobranças pendentes em {meses[mesAtual - 1]}
                .
              </div>
            </div>
          )
        )}

        {/* Link Cadastro Rapido */}
        <section>
          <Card className="p-5 bg-blue-50 border-blue-200">
            <CardContent className="p-0 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <LinkIcon className="h-6 w-6 text-blue-700 shrink-0" />
                <div>
                  <p className="text-lg font-bold text-blue-700 leading-snug">
                    Link de Cadastro Rápido
                  </p>
                  <p className="text-sm text-blue-900 mt-1">
                    Copie o link e envie ao responsável do passageiro para que
                    ele inicie o cadastro.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                title={isCopied ? "Copiado!" : "Copiar"}
                className="text-blue-700 border-blue-300 hover:bg-blue-100 shrink-0 transition-colors duration-200"
                onClick={handleCopyLink}
              >
                {isCopied ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}

                {isCopied ? "Copiado!" : "Copiar Link"}
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Acessos Rápidos */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Acessos Rápidos</h2>

          <div
            className={`grid grid-cols-3 sm:grid-cols-5 gap-x-4 gap-y-6 lg:gap-6`}
          >
            {accessCardsWithSubtitles.map((card) => (
              <NavLink
                key={card.href}
                to={card.href}
                className="col-span-1"
                title={card.title}
              >
                <div
                  key={card.href}
                  className="flex flex-col items-center text-center transition-all duration-200 hover:scale-[1.05]"
                >
                  <AccessCard {...card} />
                  <p className="text-xs font-medium text-foreground mt-1.5 leading-snug md:text-md lg:text-lg xl:text-xl">
                    {card.title}
                  </p>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      </div>
    </PullToRefreshWrapper>
  );
};

export default Home;
