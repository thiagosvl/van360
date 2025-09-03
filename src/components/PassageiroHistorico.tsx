import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign } from "lucide-react";
import ManualPaymentDialog from "./ManualPaymentDialog";

interface Cobranca {
  id: string;
  mes: number;
  ano: number;
  valor: number;
  status: string;
  data_vencimento: string;
  data_pagamento?: string;
  tipo_pagamento?: string;
}

interface PassageiroHistoricoProps {
  passageiroId: string;
  passageiroNome: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PassageiroHistorico({
  passageiroId,
  passageiroNome,
  isOpen,
  onClose,
}: PassageiroHistoricoProps) {
  const [cobrancas, setCobrancas] = useState<Cobranca[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedCobranca, setSelectedCobranca] = useState<Cobranca | null>(null);
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
    if (status === 'pago') return 'bg-green-100 text-green-800';
    
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    return vencimento < hoje ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800';
  };

  const getStatusText = (status: string, dataVencimento: string) => {
    if (status === 'pago') return 'Pago';
    
    const vencimento = new Date(dataVencimento);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    if (vencimento < hoje) {
      const diffTime = hoje.getTime() - vencimento.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `Atrasou há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    }
    
    return 'A vencer';
  };

  const getMesNome = (mes: number) => {
    return new Date(2024, mes - 1).toLocaleDateString('pt-BR', { month: 'long' });
  };

  const reenviarCobranca = async (cobrancaId: string) => {
    try {
      await supabase
        .from("cobrancas")
        .update({ enviado_em: new Date().toISOString() })
        .eq("id", cobrancaId);

      toast({
        title: "Cobrança reenviada com sucesso para o responsável",
      });
    } catch (error) {
      console.error("Erro ao reenviar cobrança:", error);
      toast({
        title: "Erro",
        description: "Erro ao reenviar cobrança",
        variant: "destructive",
      });
    }
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico de Pagamentos - {passageiroNome}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Carregando histórico...</div>
          ) : cobrancas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma cobrança encontrada
            </div>
          ) : (
            cobrancas.map((cobranca) => (
              <div
                key={cobranca.id}
                className="p-4 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">
                      {getMesNome(cobranca.mes)} {cobranca.ano}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Vencimento: {new Date(cobranca.data_vencimento).toLocaleDateString('pt-BR')}
                    </p>
                    {cobranca.data_pagamento && (
                      <p className="text-sm text-muted-foreground">
                        Pago em: {new Date(cobranca.data_pagamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {cobranca.tipo_pagamento && (
                      <p className="text-sm text-muted-foreground">
                        Forma: {cobranca.tipo_pagamento}
                      </p>
                    )}
                  </div>
                  <div className="text-right space-y-2">
                    <p className="font-semibold">
                      {cobranca.valor.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </p>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        getStatusColor(cobranca.status, cobranca.data_vencimento)
                      }`}>
                        {getStatusText(cobranca.status, cobranca.data_vencimento)}
                      </span>
                      {cobranca.status !== 'pago' && (
                        <div className="flex flex-col gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => reenviarCobranca(cobranca.id)}
                            className="text-xs px-2 py-1 h-auto"
                          >
                            Reenviar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => openPaymentDialog(cobranca)}
                            className="text-xs px-2 py-1 h-auto gap-1"
                          >
                            <DollarSign className="w-3 h-3" />
                            Pagar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

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
      </DialogContent>
    </Dialog>
  );
}