import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, DollarSign, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

interface Passageiro {
  id: string;
  nome: string;
  nome_responsavel: string;
  valor_mensalidade: number;
  dia_vencimento: number;
}

interface Cobranca {
  id: string;
  passageiro_id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
  passageiros: Passageiro;
}

interface LatePaymentsAlertProps {
  latePayments: Cobranca[];
  loading: boolean;
  selectedMonth: number;
  selectedYear: number;
  onReenviarCobranca: (cobrancaId: string, nomePassageiro: string) => void;
  onPayment: (cobranca: Cobranca) => void;
}

const LatePaymentsAlert = ({ 
  latePayments, 
  loading, 
  selectedMonth,
  selectedYear,
  onReenviarCobranca, 
  onPayment 
}: LatePaymentsAlertProps) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cobrancaId: string;
    nomePassageiro: string;
  }>({ open: false, cobrancaId: "", nomePassageiro: "" });

  const handleReenviarClick = (cobrancaId: string, nomePassageiro: string) => {
    setConfirmDialog({ open: true, cobrancaId, nomePassageiro });
  };

  const handleConfirmReenvio = () => {
    onReenviarCobranca(confirmDialog.cobrancaId, confirmDialog.nomePassageiro);
    setConfirmDialog({ open: false, cobrancaId: "", nomePassageiro: "" });
  };

  if (loading) {
    return (
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Pagamentos em Atraso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white rounded border">
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

  if (latePayments.length === 0) {
    const monthNames = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="text-sm font-medium text-green-800">
          Todos os pagamentos de {monthNames[selectedMonth - 1]} {selectedYear} estão em dia!
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
            Pagamentos em Atraso ({latePayments.length})
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
                    Venc: {new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {Number(cobranca.valor).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      handleReenviarClick(cobranca.id, cobranca.passageiros.nome)
                    }
                    className="gap-1 flex-1 sm:flex-none"
                  >
                    <Send className="w-3 h-3" />
                    Reenviar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onPayment(cobranca)}
                    className="gap-1 flex-1 sm:flex-none"
                  >
                    <DollarSign className="w-3 h-3" />
                    Pagar
                  </Button>
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