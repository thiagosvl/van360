import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Send, RotateCcw, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";
import ManualPaymentDialog from "./ManualPaymentDialog";
import CobrancaRetroativaDialog from "./CobrancaRetroativaDialog";

interface Cobranca {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
  pagamento_manual?: boolean;
}

interface PassageiroHistoricoProps {
  passageiroId: string;
  passageiroNome: string;
  valorMensalidade: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function PassageiroHistorico({
  passageiroId,
  passageiroNome,
  valorMensalidade,
  isOpen,
  onClose,
}: PassageiroHistoricoProps) {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(
    null
  );
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cobrancaId: string;
    action: 'reenviar' | 'reverter';
  }>({ open: false, cobrancaId: "", action: 'reenviar' });
  const [retroativaDialogOpen, setRetroativaDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && passageiroId) {
      fetchHistorico();
    }
  }, [isOpen, passageiroId]);

  const fetchHistorico = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("cobrancas")
        .select("*")
        .eq("passageiro_id", passageiroId)
        .order("ano", { ascending: false })
        .order("mes", { ascending: false });

      if (error) throw error;
      setCobrancas(data || []);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string, dataVencimento: string) => {
    if (status === "pago") return "bg-green-100 text-green-800";

    const vencimento = new Date(dataVencimento + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    return vencimento < hoje
      ? "bg-red-100 text-red-800"
      : "bg-orange-100 text-orange-800";
  };

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === "pago") return "Pago";

    const vencimento = new Date(dataVencimento + "T00:00:00");
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diffTime = hoje.getTime() - vencimento.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (vencimento < hoje) {
      return `Venceu há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
    } else if (diffDays == 0) {
      return "Vence hoje";
    }

    return "A vencer";
  };

  const getMesNome = (mes: number) => {
    return new Date(2024, mes - 1).toLocaleDateString("pt-BR", {
      month: "long",
    });
  };

  const handleReenviarClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: 'reenviar' });
  };

  const handleReverterClick = (cobrancaId: string) => {
    setConfirmDialog({ open: true, cobrancaId, action: 'reverter' });
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.action === 'reenviar') {
        await supabase
          .from("cobrancas")
          .update({ enviado_em: new Date().toISOString() })
          .eq("id", confirmDialog.cobrancaId);

        toast({
          title: "Cobrança reenviada com sucesso para o responsável",
        });
      } else if (confirmDialog.action === 'reverter') {
        await supabase
          .from("cobrancas")
          .update({ 
            status: "pendente",
            data_pagamento: null,
            tipo_pagamento: null,
            pagamento_manual: false
          })
          .eq("id", confirmDialog.cobrancaId);

        toast({
          title: "Pagamento revertido com sucesso",
        });
        fetchHistorico();
      }
    } catch (error) {
      console.error("Erro ao executar ação:", error);
      toast({
        title: "Erro",
        description: "Erro ao executar ação",
        variant: "destructive",
      });
    }
    setConfirmDialog({ open: false, cobrancaId: "", action: 'reenviar' });
  };

  const openPaymentDialog = (cobranca: Cobranca) => {
    setSelectedCobranca(cobranca);
    setPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    fetchHistorico();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[80vh] overflow-y-auto"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Carteirinha Digital - {passageiroNome}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetroativaDialogOpen(true)}
              className="ml-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar cobrança retroativa
            </Button>
          </DialogTitle>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Cobranças</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Carregando histórico...</div>
            ) : cobrancas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma mensalidade encontrada
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-medium">Mês/Ano</th>
                      <th className="text-left p-3 text-sm font-medium">Valor</th>
                      <th className="text-left p-3 text-sm font-medium">Status</th>
                      <th className="text-left p-3 text-sm font-medium">Vencimento</th>
                      <th className="text-center p-3 text-sm font-medium">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobrancas.map((cobranca) => (
                      <tr key={cobranca.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <span className="font-medium text-sm">
                            {getMesNome(cobranca.mes)} {cobranca.ano}
                          </span>
                          {cobranca.data_pagamento && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Pago em: {new Date(cobranca.data_pagamento).toLocaleDateString("pt-BR")}
                            </div>
                          )}
                          {cobranca.tipo_pagamento && (
                            <div className="text-xs text-muted-foreground">
                              Forma: {cobranca.tipo_pagamento}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold">
                            {cobranca.valor.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                              cobranca.status,
                              cobranca.data_vencimento
                            )}`}
                          >
                            {getStatusText(cobranca.status, cobranca.data_vencimento)}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">
                            {new Date(cobranca.data_vencimento).toLocaleDateString("pt-BR")}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1 justify-center">
                            {cobranca.status !== "pago" ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReenviarClick(cobranca.id)}
                                  className="h-8 w-8 p-0"
                                  title="Reenviar Cobrança"
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => openPaymentDialog(cobranca)}
                                  className="h-8 w-8 p-0"
                                  title="Registrar Pagamento"
                                >
                                  <DollarSign className="w-3 h-3" />
                                </Button>
                              </>
                            ) : (
                              cobranca.pagamento_manual && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReverterClick(cobranca.id)}
                                  className="h-8 w-8 p-0"
                                  title="Reverter Pagamento"
                                >
                                  <RotateCcw className="w-3 h-3" />
                                </Button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedCobranca && (
          <ManualPaymentDialog
            isOpen={paymentDialogOpen}
            onClose={() => setPaymentDialogOpen(false)}
            cobrancaId={selectedCobranca.id}
            passageiroNome={passageiroNome}
            valorOriginal={Number(selectedCobranca.valor)}
            onPaymentRecorded={handlePaymentRecorded}
          />
        )}

        <CobrancaRetroativaDialog
          isOpen={retroativaDialogOpen}
          onClose={() => setRetroativaDialogOpen(false)}
          passageiroId={passageiroId}
          passageiroNome={passageiroNome}
          valorMensalidade={valorMensalidade}
          onCobrancaAdded={fetchHistorico}
        />

        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog({ open, cobrancaId: "", action: 'reenviar' })}
          title={confirmDialog.action === 'reenviar' ? "Reenviar Cobrança" : "Reverter Pagamento"}
          description={
            confirmDialog.action === 'reenviar' 
              ? "Deseja reenviar esta cobrança para o responsável?"
              : "Deseja reverter este pagamento? A cobrança voltará ao status pendente."
          }
          onConfirm={handleConfirmAction}
        />
      </DialogContent>
    </Dialog>
  );
}