import PagamentoAssinaturaDialog from "@/components/dialogs/PagamentoAssinaturaDialog";
import { SelecaoPassageirosDialog } from "@/components/dialogs/SelecaoPassageirosDialog";
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
  ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO,
  PLANO_COMPLETO,
} from "@/constants";
import { useGerarPixParaCobranca } from "@/hooks";
import { usuarioApi } from "@/services";
import { toast } from "@/utils/notifications/toast";
import { Hourglass, LucideCheckCircle, LucideXCircle } from "lucide-react";
import { useState } from "react";

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

const FRANQUIA_ALERT_PERCENT = 50;

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
    green: "bg-green-50 border-green-600 text-green-800",
    yellow: "bg-yellow-50 border-yellow-600 text-yellow-800",
  };
  const buttonClasses = {
    red: "bg-red-600 hover:bg-red-700",
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
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
      <CardContent className="pt-0 pb-4 px-4 md:px-6">
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
            Aumentar Meu Limite
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const PlanoCompleto = ({
  navigate,
  data,
  onPaymentSuccess,
  handleAbandonCancelSubscriptionClick,
  handleCancelSubscriptionClick,
  usuarioId,
}) => {
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<{
    id: string;
    valor: string | number;
  } | null>(null);
  const [selecaoPassageirosDialog, setSelecaoPassageirosDialog] = useState<{
    isOpen: boolean;
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  } | null>(null);

  const isAtiva = data.assinatura?.status === "ativa";
  const isSuspensa = data.assinatura?.status === "suspensa";
  const isPendentePagamento =
    data.assinatura?.status === ASSINATURA_USUARIO_STATUS_PENDENTE_PAGAMENTO;
  const isSolicitacaoCancelamento =
    data.assinatura?.cancelamento_manual != null;

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

  const gerarPix = useGerarPixParaCobranca();

  const handlePrecisaSelecaoManual = (data: {
    tipo: "upgrade" | "downgrade";
    franquia: number;
    cobrancaId: string;
  }) => {
    setSelecaoPassageirosDialog({
      isOpen: true,
      tipo: data.tipo,
      franquia: data.franquia,
      cobrancaId: data.cobrancaId,
    });
  };

  const usoFranquiaPercent =
    data.franquiaContratada > 0
      ? (data.cobrancasEmUso / data.franquiaContratada) * 100
      : 0;
  const isFranquiaAlert = usoFranquiaPercent < 100 && usoFranquiaPercent >= FRANQUIA_ALERT_PERCENT;

  let statusProps;
  if (isSolicitacaoCancelamento) {
    statusProps = {
      icone: Hourglass,
      titulo: `Em processo de cancelamento`,
      descricao: `A sua assinatura do plano ${
        data.plano.parent ? data.plano.parent.nome : data.plano.nome
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
    const nomePlano =
      data.plano?.parent?.nome || data.plano?.nome || "Completo";
    statusProps = {
      icone: LucideXCircle,
      titulo: `Pagamento pendente`,
      descricao: `Regularize o pagamento de ${formatCurrency(
        cobrancaValor
      )} para voltar a utilizar o plano ${nomePlano}.`,
      cor: "red",
      acao: {
        texto: "Realizar pagamento",
        onClick: handlePagarClick,
      },
      acaoTrocarPlano: {
        onClick: () => navigate(`/planos?slug=${PLANO_COMPLETO}`),
      },
    };
  } else if (isAtiva) {
    // Se o plano tem parent (é subplano), usa o nome do parent, senão usa o nome do plano
    const nomePlano =
      data.plano?.parent?.nome || data.plano?.nome || "Completo";
    statusProps = {
      icone: LucideCheckCircle,
      titulo: `Plano ${nomePlano}`,
      descricao: `Assinatura válida até ${formatDate(
        data.assinatura.vigencia_fim
      )}. A próxima fatura estará disponível dias antes do vencimento.`,
      cor: "green",
      acao: null,
      acaoTrocarPlano: {
        onClick: () => navigate(`/planos?slug=${PLANO_COMPLETO}`),
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
        onClick: () => navigate(`/planos?slug=${PLANO_COMPLETO}`),
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
          usuarioId={usuarioId}
          onPrecisaSelecaoManual={handlePrecisaSelecaoManual}
        />
        <DetalhesPlanoCard plano={data.plano} assinatura={data.assinatura} />
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg p-6 space-y-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Cobranças Automáticas
          </CardTitle>
          <ProgressBar
            label="Passageiros com cobrança automática"
            current={data.cobrancasEmUso}
            max={data.franquiaContratada}
            primaryColor="blue"
          />
          {isFranquiaAlert && (
            <div className="pt-2">
              <p className="text-xs text-orange-600 font-semibold items-center gap-1">
                <span>Recomendamos aumentar o seu limite.</span>
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            Você pode aumentar o seu limite a qualquer momento.
          </p>
          <Button
            variant="default"
            className="w-full bg-primary hover:bg-blue-700"
            onClick={() => navigate(`/planos?slug=${PLANO_COMPLETO}`)}
            title="Planos"
          >
            Aumentar Meu Limite
          </Button>
        </Card>

        <Card className="shadow-lg p-6 space-y-4">
          <CardTitle className="text-lg font-semibold text-gray-700">
            Passageiros
          </CardTitle>
          <ProgressBar
            label="Qtd. de Passageiros"
            current={data.passageirosAtivos}
            max={null}
            primaryColor="blue"
          />
          <div className="">
            <span className="text-sm text-muted-foreground">
              Seu plano oferece passageiros ilimitados.
            </span>
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
          usuarioId={usuarioId}
          onPrecisaSelecaoManual={handlePrecisaSelecaoManual}
        />
      )}

      {selecaoPassageirosDialog && usuarioId && (
        <SelecaoPassageirosDialog
          isOpen={selecaoPassageirosDialog.isOpen}
          usuarioId={usuarioId}
          tipo={selecaoPassageirosDialog.tipo}
          franquia={selecaoPassageirosDialog.franquia}
          onClose={() => setSelecaoPassageirosDialog(null)}
          onConfirm={async (passageiroIds) => {
            try {
              // Confirmar seleção de passageiros
              const resultado = await usuarioApi.confirmarSelecaoPassageiros(
                usuarioId,
                { 
                  passageiroIds, 
                  franquia: selecaoPassageirosDialog.franquia,
                  tipo: selecaoPassageirosDialog.tipo,
                }
              );
              
              setSelecaoPassageirosDialog(null);
              
              toast.success("assinatura.sucesso.atualizada", {
                description: `${resultado.ativados} passageiros ativados, ${resultado.desativados} desativados.`,
              });
              
              // Após seleção, gerar PIX para a cobrança
              if (selecaoPassageirosDialog.cobrancaId) {
                // Buscar valor da cobrança antes de abrir o dialog
                const cobrancaEncontrada = data.cobrancas.find(
                  (c: any) => c.id === selecaoPassageirosDialog.cobrancaId
                );
                
                gerarPix.mutate(selecaoPassageirosDialog.cobrancaId, {
                  onSuccess: (pixResult: any) => {
                    // Se ainda precisa seleção manual (não deveria acontecer, mas por segurança)
                    if (pixResult.precisaSelecaoManual) {
                      toast.error("assinatura.erro.processar", {
                        description: "Ainda é necessário selecionar passageiros. Tente novamente.",
                      });
                      return;
                    }
                    
                    // Abrir dialog de pagamento com PIX gerado
                    setSelectedCobranca({
                      id: selecaoPassageirosDialog.cobrancaId,
                      valor: cobrancaEncontrada?.valor || 0,
                    });
                    setPaymentModalOpen(true);
                  },
                  onError: (error: any) => {
                    toast.error("assinatura.erro.gerarPix", {
                      description: error.response?.data?.error || "Erro ao gerar PIX após seleção.",
                    });
                  },
                });
              }
            } catch (error: any) {
              toast.error("assinatura.erro.processar", {
                description: error.response?.data?.error || "Erro ao confirmar seleção.",
              });
            }
          }}
        />
      )}
    </div>
  );
};
export default PlanoCompleto;
