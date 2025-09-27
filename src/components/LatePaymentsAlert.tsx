import ConfirmationDialog from "@/components/ConfirmationDialog"; // Corrigido para um caminho mais provável
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Cobranca } from "@/types/cobranca";
import {
  formatDateToBR,
  getStatusColor,
  getStatusText,
} from "@/utils/formatters";
import {
  AlertTriangle,
  BellOff,
  CheckCircle,
  MoreVertical,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// AJUSTE: Aumentado para um valor de produção mais realista
const ITENS_POR_PAGINA = 2;

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
  const navigate = useNavigate();
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    cobrancaId: string;
    nomePassageiro: string;
  }>({ open: false, cobrancaId: "", nomePassageiro: "" });

  const { toast } = useToast();

  const [visibleCount, setVisibleCount] = useState(ITENS_POR_PAGINA);

  const sortedLatePayments = useMemo(() => {
    return [...latePayments].sort(
      (a, b) =>
        new Date(a.data_vencimento).getTime() -
        new Date(b.data_vencimento).getTime()
    );
  }, [latePayments]);

  const visiblePayments = sortedLatePayments.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + ITENS_POR_PAGINA);
  };

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

  if (loading && totalCobrancas > 0) {
    return (
      <Card className="mb-6">
        <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (<div key={i} className="flex items-center justify-between p-3 border rounded"><div className="flex-1"><Skeleton className="h-4 w-32 mb-1" /><Skeleton className="h-3 w-24" /></div><div className="flex gap-2"><Skeleton className="h-8 w-8" /></div></div>))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalCobrancas === 0) return null;

  if (latePayments.length === 0) {
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    return (
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4"><CheckCircle className="h-5 w-5 text-green-600" /><div className="text-sm font-medium text-green-800">Todas as mensalidades de {monthNames[selectedMonth - 1]} estão em dia!</div></div>
    );
  }

  return (
    <>
      <Card className="mb-6 border-red-200 bg-red-50/50">
        <CardHeader className="flex-row items-center justify-between">
          <div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-red-600" /><CardTitle className="text-lg font-semibold text-gray-800">Mensalidades Pendentes</CardTitle></div>
          <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">{latePayments.length}</span>
        </CardHeader>

        <CardContent className="p-0 bg-white">
          <div className="w-full overflow-x-auto hidden md:block">
            <table className="w-full">
              {/* AJUSTE: Cabeçalho da tabela modernizado */}
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left text-xs font-medium text-gray-600">Passageiro</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-600">Valor</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-600">Vencimento</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-600">Status</th>
                  <th className="p-3 text-center text-xs font-medium text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visiblePayments.map((cobranca) => (
                  <tr key={cobranca.id} className="hover:bg-muted/50">
                    <td className="p-3 align-top">
                      <div className="font-medium text-sm text-gray-900">{cobranca.passageiros.nome}</div>
                      <div className="text-xs text-gray-500">{cobranca.passageiros.nome_responsavel || "-"}</div>
                      {/* AJUSTE: Paridade de Alertas Críticos (Desktop) */}
                      {cobranca.desativar_lembretes && cobranca.status !== "pago" && (
                        <div className="mt-2 flex items-center gap-2 text-xs p-2 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                          <BellOff className="h-4 w-4 shrink-0" /><span>Lembretes suspensos</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 align-top"><div className="text-sm text-gray-800">{Number(cobranca.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div></td>
                    <td className="p-3 align-top"><div className="text-sm text-gray-800">{formatDateToBR(cobranca.data_vencimento)}</div></td>
                    <td className="p-3 align-top"><span className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(cobranca.status, cobranca.data_vencimento)}`}>{getStatusText(cobranca.status, cobranca.data_vencimento)}</span></td>
                    <td className="p-3 text-center align-top">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate(`/passageiros/${cobranca.passageiros.id}/mensalidade/${cobranca.id}`)}>Mensalidade</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewHistory(cobranca.passageiro_id, cobranca.passageiros.nome, cobranca.passageiros.valor_mensalidade)}>Carteirinha Digital</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPayment(cobranca)}>Registrar Pagamento</DropdownMenuItem>
                          <DropdownMenuItem disabled={cobranca.origem === "manual"} onClick={() => handleReenviarClick(cobranca.id, cobranca.passageiros.nome)}>Reenviar Notificação</DropdownMenuItem>
                          <DropdownMenuItem disabled={cobranca.status === "pago" || cobranca.origem === "manual"} onClick={() => handleToggleLembretes(cobranca)}>{cobranca.desativar_lembretes ? "Ativar Lembretes" : "Desativar Lembretes"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {visiblePayments.map((cobranca) => (
                <div key={cobranca.id} className="p-4">
                  {/* AJUSTE: Otimização do Espaçamento Interno (Mobile) */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="pr-2"><div className="font-semibold text-gray-800">{cobranca.passageiros.nome}</div><div className="text-sm text-muted-foreground">Resp: {cobranca.passageiros.nome_responsavel || "-"}</div></div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => navigate(`/passageiros/${cobranca.passageiros.id}/mensalidade/${cobranca.id}`)}>Mensalidade</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onViewHistory(cobranca.passageiro_id, cobranca.passageiros.nome, cobranca.passageiros.valor_mensalidade)}>Carteirinha Digital</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onPayment(cobranca)}>Registrar Pagamento</DropdownMenuItem>
                          <DropdownMenuItem disabled={cobranca.origem === "manual"} onClick={() => handleReenviarClick(cobranca.id, cobranca.passageiros.nome)}>Reenviar Notificação</DropdownMenuItem>
                          <DropdownMenuItem disabled={cobranca.status === "pago" || cobranca.origem === "manual"} onClick={() => handleToggleLembretes(cobranca)}>{cobranca.desativar_lembretes ? "Ativar Lembretes" : "Desativar Lembretes"}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center"><span className="text-muted-foreground">Valor</span><span className="font-bold text-right text-gray-800">{Number(cobranca.valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div>
                      <div className="flex justify-between items-center"><span className="text-muted-foreground">Vencimento</span><span className="text-right">{formatDateToBR(cobranca.data_vencimento)}</span></div>
                    </div>

                    <div>
                      <span className={`px-2 py-1 inline-block rounded-full text-xs font-medium ${getStatusColor(cobranca.status, cobranca.data_vencimento)}`}>{getStatusText(cobranca.status, cobranca.data_vencimento)}</span>
                      {cobranca.desativar_lembretes && cobranca.status !== "pago" && (
                        <div className="mt-3 flex items-center gap-2 text-xs p-2 rounded-md bg-yellow-50 text-yellow-800 border border-yellow-200">
                          <BellOff className="h-4 w-4 shrink-0" /><span>Lembretes automáticos suspensos</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>

        {visibleCount < sortedLatePayments.length && (
          <CardFooter className="flex-col items-center py-4 bg-white border-t md:bg-transparent">
            <Button onClick={handleLoadMore} variant="outline" className="w-full md:w-auto">Carregar Mais</Button>
            <p className="text-xs text-muted-foreground mt-2">Exibindo {visibleCount} de {sortedLatePayments.length}</p>
          </CardFooter>
        )}
      </Card>

      <ConfirmationDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, cobrancaId: "", nomePassageiro: "" })} title="Reenviar Notificação" description="Deseja reenviar esta notificação para o responsável?" onConfirm={handleConfirmReenvio} />
    </>
  );
};

export default LatePaymentsAlert;