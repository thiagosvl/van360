import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO,
    ASSINATURA_USUARIO_STATUS_ATIVA,
    ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO,
    ASSINATURA_USUARIO_STATUS_SUSPENSA,
    ASSINATURA_USUARIO_STATUS_TRIAL,
    PLANO_COMPLETO,
    PLANO_GRATUITO
} from "@/constants";
import {
    Hourglass,
    LucideAlertTriangle,
    LucideCheckCircle,
    LucideXCircle,
    Receipt,
} from "lucide-react";

interface AssinaturaStatusCardProps {
  plano: any;
  assinatura: any;
  cobrancas: any[];
  navigate: (path: string) => void;
  handleAbandonCancelSubscriptionClick: () => void;
  onPagarClick: (cobranca: any) => void;
}

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export function AssinaturaStatusCard({
  plano,
  assinatura,
  cobrancas,
  navigate,
  handleAbandonCancelSubscriptionClick,
  onPagarClick,
}: AssinaturaStatusCardProps) {
  // Determinar status e flags
  const isTrial = assinatura?.status === ASSINATURA_USUARIO_STATUS_TRIAL;
  const isAtiva = assinatura?.status === ASSINATURA_USUARIO_STATUS_ATIVA;
  const isSuspensa = assinatura?.status === ASSINATURA_USUARIO_STATUS_SUSPENSA;
  const isPendentePagamento =
    assinatura?.status === ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO;
  const isSolicitacaoCancelamento = assinatura?.cancelamento_manual != null;
  const isFreePlan = plano?.slug === PLANO_GRATUITO;

  // Calcular dias restantes de trial
  const trialDaysLeft =
    isTrial && assinatura?.trial_end_at
      ? Math.ceil(
          (new Date(assinatura.trial_end_at).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  // Encontrar cobrança pendente
  const cobrancaPendente = cobrancas?.find(
    (c) => c.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO
  );
  const cobrancaValor =
    cobrancaPendente?.valor || assinatura?.preco_aplicado || 0;

  // Configuração do Card
  let statusProps = {
    icone: Receipt,
    titulo: `Plano ${plano?.nome || "Desconhecido"}`,
    descricao: "",
    cor: "gray",
    acao: null as { texto: string; onClick: () => void } | null,
    acaoTrocarPlano: null as { texto: string; onClick: () => void } | null,
  };

  // Lógica de Status
  if (isFreePlan) {
    statusProps = {
      icone: Receipt,
      titulo: `Plano ${plano.nome}`,
      descricao:
        "Escolha um plano e tenha acesso a passageiros ilimitados, cobranças automáticas e muito mais!",
      cor: "gray",
      acao: {
        texto: "Quero mais funcionalidades",
        onClick: () => navigate("/planos"),
      },
      acaoTrocarPlano: null,
    };
  } else if (isTrial) {
    if (trialDaysLeft <= 0) {
      statusProps = {
        icone: LucideAlertTriangle,
        titulo: `Plano ${plano.nome} - Fim do teste grátis`,
        descricao:
          "Para continuar utilizando, ative o seu plano agora mesmo e tenha acesso a várias funcionalidades.",
        cor: "yellow",
        acao: {
          texto: "Ativar meu plano",
          onClick: () => onPagarClick(cobrancaPendente),
        },
        acaoTrocarPlano: {
          texto: "Ver Planos",
          onClick: () => navigate("/planos"),
        },
      };
    } else {
      statusProps = {
        icone: LucideAlertTriangle,
        titulo: `Plano ${plano.nome} (teste grátis)`,
        descricao: `Teste grátis por mais ${trialDaysLeft} dia${
          trialDaysLeft === 1 ? "" : "s"
        }. Aproveite passageiros ilimitados durante o teste! Para continuar após o período, ative o seu plano agora mesmo.`,
        cor: "yellow",
        acao: {
          texto: "Ativar meu plano",
          onClick: () => onPagarClick(cobrancaPendente),
        },
        acaoTrocarPlano: {
          texto: "Ver Planos",
          onClick: () => navigate("/planos"),
        },
      };
    }
  } else if (isSolicitacaoCancelamento) {
    statusProps = {
      icone: Hourglass,
      titulo: "Em processo de cancelamento",
      descricao: `A sua assinatura do plano ${
        plano.nome
      } será cancelada no dia ${formatDate(
        assinatura.vigencia_fim
      )}, conforme solicitado por você.`,
      cor: "yellow",
      acao: {
        texto: "Desistir do Cancelamento",
        onClick: handleAbandonCancelSubscriptionClick,
      },
      acaoTrocarPlano: null,
    };
  } else if (isPendentePagamento) {
    statusProps = {
      icone: LucideXCircle,
      titulo: "Pagamento pendente",
      descricao: `Regularize o pagamento de ${formatCurrency(
        cobrancaValor
      )} para voltar a utilizar o plano ${plano.nome}.`,
      cor: "red",
      acao: {
        texto: "Realizar pagamento",
        onClick: () => onPagarClick(cobrancaPendente),
      },
      acaoTrocarPlano: {
        texto: "Ver Planos",
        onClick: () => navigate("/planos"),
      },
    };
  } else if (isSuspensa) {
    statusProps = {
      icone: LucideXCircle,
      titulo: "Assinatura Suspensa",
      descricao:
        "Seu acesso foi bloqueado devido a falta de pagamento. Reative agora ou contrate outro plano.",
      cor: "red",
      acao: {
        texto: "Reativar meu plano",
        onClick: () => onPagarClick(cobrancaPendente),
      },
      acaoTrocarPlano: {
        texto: "Ver Planos",
        onClick: () => navigate("/planos"),
      },
    };
  } else if (isAtiva) {
    statusProps = {
      icone: LucideCheckCircle,
      titulo: `Plano ${plano.nome}`,
      descricao: `Assinatura válida até ${formatDate(
        assinatura.vigencia_fim
      )}. A próxima fatura estará disponível dias antes do vencimento.`,
      cor: "green",
      acao: null,
      acaoTrocarPlano: {
        texto: "Aumentar Meu Limite",
        onClick: () => navigate(`/planos?slug=${PLANO_COMPLETO}`),
      },
    };
    
    // Se for plano Completo, o botão de "Aumentar Limite" não faz sentido se já é o máximo,
    // mas o layout original tinha. Vou manter condicionalmente se não for completo.
    if (plano.slug === PLANO_COMPLETO) {
         statusProps.acaoTrocarPlano = {
            texto: "Aumentar Meu Limite", // Mantendo conforme o original, talvez para upsell de franquia extra futura?
            onClick: () => navigate(`/planos?slug=${PLANO_COMPLETO}`),
         }
    } else {
        statusProps.acaoTrocarPlano = {
            texto: "Ver Planos",
            onClick: () => navigate("/planos"),
        }
    }
  }

  // Estilos baseados na cor
  const colorClasses: Record<string, string> = {
    red: "bg-red-50 border-red-600 text-red-800",
    blue: "bg-blue-50 border-blue-600 text-blue-800",
    green: "bg-green-50 border-green-600 text-green-800",
    yellow: "bg-yellow-50 border-yellow-600 text-yellow-800",
    gray: "bg-gray-50 border-gray-200 text-gray-800",
  };

  const buttonClasses: Record<string, string> = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
    gray: "bg-primary hover:bg-blue-700",
  };

  const Icon = statusProps.icone;

  return (
    <Card
      className={`border-l-4 ${
        colorClasses[statusProps.cor] || colorClasses.gray
      } shadow-xl md:p-2`}
    >
      <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
        <Icon className="w-8 h-8 flex-shrink-0" />
        <div className="flex-grow">
          <CardTitle className="text-xl font-bold">
            {statusProps.titulo}
          </CardTitle>
          <CardDescription className="text-sm mt-2">
            {statusProps.descricao}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4 px-4 md:px-6">
        {statusProps.acao && (
          <Button
            className={`w-full mt-3 font-semibold shadow-md ${
              buttonClasses[statusProps.cor] || buttonClasses.gray
            }`}
            onClick={statusProps.acao.onClick}
          >
            {statusProps.acao.texto}
          </Button>
        )}
        {statusProps.acaoTrocarPlano && (
          <Button
            className={`w-full mt-3 font-semibold shadow-md bg-blue-600 hover:bg-blue-700`}
            onClick={statusProps.acaoTrocarPlano.onClick}
          >
            {statusProps.acaoTrocarPlano.texto}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
