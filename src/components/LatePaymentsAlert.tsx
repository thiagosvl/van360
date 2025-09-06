import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Cobranca } from "@/types/cobranca";
import { formatDate, formatDateToBR } from "@/utils/formatters";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle,
  CreditCard,
  DollarSign,
  Send,
} from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

interface LatePaymentsAlertProps {
  latePayments: Cobranca[];
  loading: boolean;
  totalCobrancas: number;
  selectedMonth: number;
  onReenviarCobranca: (cobrancaId: string, nomePassageiro: string) => void;
  onPayment: (cobranca: Cobranca) => void;
  onViewHistory: (
    passageiroId: string,
    passageiroNome: string,
    valorMensalidade: number
  ) => void;
  onRefresh: () => void;
}

const LatePaymentsAlert = ({
  latePayments,
  loading,
  totalCobrancas,
  selectedMonth,
  onReenviarCobranca,
  onPayment,
  onViewHistory,
  onRefresh,
}: LatePaymentsAlertProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cobrancaId: string;
    nomePassageiro: string;
  }>({ open: false, cobrancaId: "", nomePassageiro: "" });

  const { toast } = useToast();

  const handleReenviarClick = (cobrancaId: string, nomePassageiro: string) => {
    setConfirmDialog({ open: true, cobrancaId, nomePassageiro });
  };

  const handleConfirmReenvio = () => {
    onReenviarCobranca(confirmDialog.cobrancaId, confirmDialog.nomePassageiro);
    setConfirmDialog({ open: false, cobrancaId: "", nomePassageiro: "" });
  };

  const handleToggleLembretes = async (cobranca: Cobranca) => {
    try {
      const novoStatus = !cobranca.desativar_lembretes;

      const { error } = await supabase
        .from("cobrancas")
        .update({ desativar_lembretes: novoStatus })
        .eq("id", cobranca.id);

      if (error) throw error;

      toast({
        title: `Lembretes ${
          novoStatus ? "desativados" : "ativados"
        } com sucesso.`,
      });

      onRefresh();
    } catch (err) {
      console.error("Erro ao alternar lembretes:", err);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status dos lembretes.",
        variant: "destructive",
      });
    }
  };

  const getStatusText = (dataVencimento: string) => {
    const vencimento = formatDate(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (vencimento < hoje) {
      const diffTime = hoje.getTime() - vencimento.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Venceu há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    }

    return "Vence hoje";
  };

  const getStatusColor = (dataVencimento: string) => {
    const vencimento = formatDate(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return vencimento < hoje
      ? "bg-red-100 text-red-800"
      : "bg-orange-100 text-orange-800";
  };

  if (loading && totalCobrancas > 0) {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Mensalidades em Atraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white rounded border"
              >
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalCobrancas === 0) {
    return null;
  }

  if (latePayments.length === 0) {
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="text-sm font-medium text-green-800">
          Todas as mensalidades de {monthNames[selectedMonth - 1]} estão em dia!
        </div>
      </div>
    );
  }

  return (
    <>
      <Card className="mb-6 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Mensalidades em Atraso
            <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded-full">
              {latePayments.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latePayments.map((cobranca) => (
              <div
                key={cobranca.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded border gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {cobranca.passageiros.nome}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Venc.: {formatDateToBR(cobranca.data_vencimento)}{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        cobranca.data_vencimento
                      )}`}
                    >
                      {getStatusText(cobranca.data_vencimento)}
                    </span>
                    {cobranca.desativar_lembretes &&
                      cobranca.status !== "pago" && (
                        <span className="text-xs text-muted-foreground mt-1">
                          Lembretes suspensos
                        </span>
                      )}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {Number(cobranca.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    title="Reenviar"
                    variant="outline"
                    onClick={() =>
                      handleReenviarClick(
                        cobranca.id,
                        cobranca.passageiros.nome
                      )
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Carteirinha"
                    onClick={() =>
                      onViewHistory(
                        cobranca.passageiro_id,
                        cobranca.passageiros.nome,
                        cobranca.passageiros.valor_mensalidade
                      )
                    }
                    className="h-8 w-8 p-0"
                  >
                    <CreditCard className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    title="Registrar Pagamento"
                    onClick={() => onPayment(cobranca)}
                    className="h-8 w-8 p-0"
                  >
                    <DollarSign className="w-3 h-3" />
                  </Button>
                  {cobranca.status !== "pago" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleLembretes(cobranca)}
                      className="h-8 w-8 p-0"
                      title={
                        cobranca.desativar_lembretes
                          ? "Ativar lembretes automáticos"
                          : "Desativar lembretes automáticos"
                      }
                    >
                      {cobranca.desativar_lembretes ? (
                        <BellOff className="w-3 h-3" />
                      ) : (
                        <Bell className="w-3 h-3" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, cobrancaId: "", nomePassageiro: "" })
        }
        title="Reenviar Cobrança"
        description="Deseja reenviar esta cobrança para o responsável?"
        onConfirm={handleConfirmReenvio}
      />
    </>
  );
};

export default LatePaymentsAlert;
