import { QuickStartCard } from "@/components/QuickStartCard";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/hooks/PullToRefreshWrapper";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

import LatePaymentsAlert from "@/components/LatePaymentsAlert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
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
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
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
        className={`transition-all duration-300 hover:scale-[1.03] hover:shadow-md h-full ${bg} border-2 border-transparent hover:border-gray-20`}
      >
        <CardContent className="p-5 flex flex-col justify-center items-center text-center space-y-3 h-full">
          <Icon className={`h-10 w-10 mb-2 ${color}`} />

          <div className="text-center">
            <p className="text-xl font-bold text-foreground leading-snug">
              {title}
            </p>
          </div>
        </CardContent>
      </Card>
    </NavLink>
  );
};

const Inicio = () => {
  const { setPageTitle, setPageSubtitle } = useLayout();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [latePayments, setLatePayments] = useState<Cobranca[]>([]);
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [loadingFinances, setLoadingFinances] = useState(true);

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
      title: "Veículos",
      description: "Gerencie a lista de veículos.",
      href: "/veiculos",
      icon: Car,
      color: "text-orange-700",
      bg: "bg-orange-100",
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
        "Ajuste notificações, preferências de cobrança e dados do condutor.",
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

  const BASE_DOMAIN =
    import.meta.env.VITE_PUBLIC_APP_DOMAIN || window.location.origin;

  useEffect(() => {
    setPageTitle(
      profile.id ? `Olá, ${profile.nome.split(" ")[0]}` : "Carregando..."
    );
    setPageSubtitle("");
  }, [setPageTitle, setPageSubtitle]);

  useEffect(() => {
    if (profile && profile.id) {
      fetchLatePayments();
    }
  }, []);

  const fetchLatePayments = async () => {
    const currentUserId = profile?.id || localStorage.getItem("app_user_id");
    if (!currentUserId || !profile) {
      setLoadingFinances(false);
      return;
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const mes = new Date().getMonth() + 1;
    const ano = new Date().getFullYear();
    setMesAtual(mes);
    setAnoAtual(ano);

    setLoadingFinances(true);
    try {
      const { data: cobrancasMes } = await supabase
        .from("cobrancas")
        .select(`*`)
        .eq("mes", mes)
        .eq("usuario_id", currentUserId)
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
    const linkToCopy = `${BASE_DOMAIN}/cadastro-passageiro/${profile.id}`;
    try {
      navigator.clipboard.writeText(linkToCopy);
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

  const accessCardsWithSubtitles = ACCESS_CARDS_DATA.map((card) => ({
    ...card,
    subtitle: card.description,
  }));

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
                title="Copiar"
                className="text-blue-700 border-blue-300 hover:bg-blue-100 shrink-0"
                onClick={handleCopyLink}
              >
                <Copy className="h-4 w-4 mr-2" /> Copiar Link
              </Button>
            </CardContent>
          </Card>
        </section>
        {/* Acessos Rápidos */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Acessos Rápidos</h2>

          <div className="overflow-x-hidden">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 -mx-4">
              {accessCardsWithSubtitles.map((card) => (
                <div key={card.href} className="px-2 pb-4">
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
