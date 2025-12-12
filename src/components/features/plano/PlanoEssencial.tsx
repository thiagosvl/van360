import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import DetalhesPlanoCard from "@/components/features/plano/DetalhesPlanoCard";
import FaturamentoCard from "@/components/features/plano/FaturamentoCard";
import GerenciarOpcoesCard from "@/components/features/plano/GerenciarOpcoesCard";
import ProgressBar from "@/components/features/plano/ProgressBar";
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
  PLANO_ESSENCIAL,
} from "@/constants";
import {
  Hourglass,
  LucideAlertTriangle,
  LucideCheckCircle,
  LucideXCircle,
} from "lucide-react";
import { useState } from "react";

const formatCurrency = (value: string | number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
};

const AlertCard = ({
  icone: Icon,
  titulo,
  descricao,
  cor,
  acao,
  acaoTrocarPlano,
}) => {
  const colorClasses = {
    red: "bg-red-50 border-red-600 text-red-800",
    blue: "bg-blue-50 border-blue-600 text-blue-800",
    yellow: "bg-yellow-50 border-yellow-600 text-yellow-800",
  };
  const buttonClasses = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    yellow: "bg-yellow-600 hover:bg-yellow-700",
  };

  return (
    <Card className={`border-l-4 ${colorClasses[cor]} shadow-xl md:p-2`}>
      <CardHeader className="flex flex-row items-center gap-4 p-4 md:p-6">
        <Icon className="w-8 h-8 flex-shrink-0" />
        <div className="flex-grow">
          <CardTitle className={`text-xl font-bold`}>{titulo}</CardTitle>
          <CardDescription className="text-sm mt-2">
            {descricao}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="sm:flex pt-0 pb-4 sm:space-x-4 px-4 md:px-6">
        {acao && (
          <Button
            className={`w-full mt-3 font-semibold shadow-md ${buttonClasses[cor]}`}
            onClick={acao.onClick}
          >
            {acao.texto}
          </Button>
        )}
        {acaoTrocarPlano && (
          <Button
            className={`w-full mt-3 font-semibold shadow-md ${buttonClasses["blue"]}`}
            onClick={acaoTrocarPlano.onClick}
          >
            Ver Planos
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

import { useLayout } from "@/contexts/LayoutContext";
import { useSession } from "@/hooks/business/useSession";

const PlanoEssencial = ({
  navigate,
  data,
  handleCancelSubscriptionClick,
  handleAbandonCancelSubscriptionClick,
  onPaymentSuccess,
}) => {
  const { openLimiteFranquiaDialog, openContextualUpsellDialog } = useLayout();
  const { user } = useSession();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<any>(null);

  const isTrial = data.assinatura?.status === ASSINATURA_USUARIO_STATUS_TRIAL;
  const isAtiva = data.assinatura?.status === ASSINATURA_USUARIO_STATUS_ATIVA;
  const isSuspensa =
    data.assinatura?.status === ASSINATURA_USUARIO_STATUS_SUSPENSA;
  const isPendentePagamento =
    data.assinatura?.status === ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO;
  const isSolicitacaoCancelamento =
    data.assinatura?.cancelamento_manual != null;

  const trialDaysLeft = isTrial
    ? Math.ceil(
        (new Date(data.assinatura.trial_end_at).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;
  
  const cobrancaPendente = data.cobrancas.find(
    (c) => c.status === ASSINATURA_COBRANCA_STATUS_PENDENTE_PAGAMENTO
  );
  const cobrancaValor =
    cobrancaPendente?.valor || data.assinatura?.preco_aplicado;

  const handlePagarClick = () => {
    if (cobrancaPendente) {
      setSelectedCobranca(cobrancaPendente);
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentModalOpen(false);
    setSelectedCobranca(null);
    if (onPaymentSuccess) {
      onPaymentSuccess();
    }
  };

  let statusProps;
  let titulo;
  let descricao;
  if (isTrial) {
    if (trialDaysLeft <= 0) {
      titulo = `Plano ${data.plano.nome} - Fim do teste grátis`;
      descricao =
        "Para continuar utilizando, ative o seu plano agora mesmo e tenha acesso a várias funcionalidades.";
    } else {
      titulo = `Plano ${data.plano.nome} (teste grátis)`;
      descricao = `Teste grátis por mais ${trialDaysLeft} dia${
        trialDaysLeft === 1 ? "" : "s"
      }. Aproveite passageiros ilimitados durante o teste! Para continuar após o período, ative o seu plano agora mesmo.`;
    }

    statusProps = {
      icone: LucideAlertTriangle,
      titulo,
      descricao,
      cor: "yellow",
      acao: {
        texto: `Ativar meu plano`,
        onClick: handlePagarClick,
      },
      acaoTrocarPlano: {
        onClick: () => openContextualUpsellDialog({ feature: "outros" }),
      },
    };
  } else if (isSolicitacaoCancelamento) {
    statusProps = {
      icone: Hourglass,
      titulo: `Em processo de cancelamento`,
      descricao: `A sua assinatura do plano ${
        data.plano.nome
      } será cancelada no dia ${formatDate(
        data.assinatura.vigencia_fim
      )}, conforme solicitado por você.`,
      cor: "yellow",
      acao: {
        texto: "Desistir do Cancelamento",
        onClick: () => handleAbandonCancelSubscriptionClick(),
      },
      acaoTrocarPlano: null,
    };
  } else if (isPendentePagamento) {
    statusProps = {
      icone: LucideXCircle,
      titulo: `Pagamento pendente`,
      descricao: `Regularize o pagamento de ${formatCurrency(
        cobrancaValor
      )} para voltar a utilizar o plano ${data.plano.nome}.`,
      cor: "red",
      acao: {
        texto: "Realizar pagamento",
        onClick: handlePagarClick,
      },
      acaoTrocarPlano: {
        onClick: () => openContextualUpsellDialog({ feature: "outros" }),
      },
    };
  } else if (isAtiva) {
    statusProps = {
      icone: LucideCheckCircle,
      titulo: `Plano ${data.plano.nome}`,
      descricao: `Assinatura válida até ${formatDate(
        data.assinatura.vigencia_fim
      )}. A próxima fatura estará disponível dias antes do vencimento.`,
      cor: "blue",
      acao: null,
      acaoTrocarPlano: {
        onClick: () => openContextualUpsellDialog({ feature: "outros" }),
      },
    };
  } else if (isSuspensa) {
    statusProps = {
      icone: LucideXCircle,
      titulo: "Assinatura Suspensa",
      descricao: `Seu acesso foi bloqueado devido a falta de pagamento. Reative agora ou contrate outro plano.`,
      cor: "red",
      acao: {
        texto: "Reativar meu plano",
        onClick: handlePagarClick,
      },
      acaoTrocarPlano: {
        onClick: () => openContextualUpsellDialog({ feature: "outros" }),
      },
    };
  } else {
    statusProps = {
      icone: LucideXCircle,
      titulo: "Status Desconhecido",
      descricao:
        "O status de sua assinatura não está claro. Contate o suporte.",
      cor: "red",
      acao: null,
    };
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <AlertCard {...statusProps} />
        <FaturamentoCard
          plano={data.plano}
          cobrancas={data.cobrancas}
          navigate={navigate}
          onPaymentSuccess={onPaymentSuccess}
          usuarioId={user?.id}
          onPrecisaSelecaoManual={() => {}}
        />
        <DetalhesPlanoCard plano={data.plano} assinatura={data.assinatura} />
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg p-6 space-y-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Cobranças Automáticas
          </CardTitle>
          <p className="text-sm text-gray-500">
            Seu plano não oferece. <br />
            <br />
            Contrate o <b>Plano Completo</b> agora para utilizar as
            cobranças automáticas.
          </p>
          <Button
            variant="default"
            className="w-full bg-primary hover:bg-blue-700"
            onClick={() => openLimiteFranquiaDialog({
                title: "Cobranças Automáticas",
                description: "Automatize suas cobranças com o Plano Completo.",
                hideLimitInfo: true,
            })}
            title="Planos"
          >
            Quero Cobranças Automáticas
          </Button>
        </Card>

        <Card className="shadow-lg p-6 space-y-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Passageiros
          </CardTitle>
          <ProgressBar
            label="Qtd. de Passageiros"
            current={data.passageirosAtivos}
            max={
              [PLANO_ESSENCIAL, PLANO_COMPLETO].includes(data.plano.slug)
                ? null // Essencial sempre ilimitado (trial e ativo)
                : data.limitePassageiros
            }
            primaryColor="blue"
          />
          <div className=" space-y-4">
            {isTrial ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Durante o teste grátis, você tem passageiros ilimitados!
                  <br />
                  Ative o seu plano para continuar aproveitando todos os benefícios.
                </span>
                <Button
                  variant="default"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => openContextualUpsellDialog({ feature: "outros" })}
                  title="Planos"
                >
                  Ativar Meu Plano
                </Button>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">
                  Seu plano oferece passageiros ilimitados.
                </span>
              </>
            )}
          </div>
        </Card>

        <GerenciarOpcoesCard
          handleAbandonCancelSubscriptionClick={
            handleAbandonCancelSubscriptionClick
          }
          handleCancelSubscriptionClick={handleCancelSubscriptionClick}
          plano={data.plano}
          assinatura={data.assinatura}
          navigate={navigate}
        />
      </div>

      {selectedCobranca && (
        <PagamentoAssinaturaDialog
          isOpen={paymentModalOpen}
          onClose={() => {
            setPaymentModalOpen(false);
            setSelectedCobranca(null);
          }}
          cobrancaId={selectedCobranca.id}
          valor={Number(selectedCobranca.valor)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};
export default PlanoEssencial;
