import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/constants/routes";
import { useLayout } from "@/contexts/LayoutContext";
import { useCobranca } from "@/hooks/api/useCobranca";
import { usePassageiro } from "@/hooks/api/usePassageiro";
import { useDesfazerPagamento, useDeleteCobranca } from "@/hooks/api/useCobrancaMutations";
import { AtividadeEntidadeTipo, CobrancaStatus, CobrancaTipoPagamento } from "@/types/enums";
import { formatCurrency, formatDateToBR } from "@/utils/formatters";
import { Cobranca } from "@/types/cobranca";
import { toast } from "@/utils/notifications/toast";
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  DollarSign,
  Download,
  History,
  MoreVertical,
  QrCode,
  Receipt,
  RotateCcw,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Página de Detalhes da Cobrança (Versão Clean Slate)
 * 
 * Exibe informações detalhadas sobre uma mensalidade específica.
 * Permite editar, excluir e registrar pagamentos manuais.
 * 
 * Patterns:
 * - ViewModel Implicit Logic (Hooks de Negócio)
 * - Centralização de Diálogos (LayoutContext)
 * - SEO / Semântica HTML
 */

export default function PassageiroCobranca() {
  const { cobranca_id } = useParams<{ cobranca_id: string }>();
  const navigate = useNavigate();
  
  const {
    openConfirmationDialog,
    closeConfirmationDialog,
    openCobrancaEditDialog,
    openCobrancaDeleteDialog,
    openManualPaymentDialog,
    openCobrancaHistoryDialog,
    openReceiptDialog,
  } = useLayout();

  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: cobranca,
    isLoading: isCobrancaLoading,
    refetch,
  } = useCobranca(cobranca_id!, {
    enabled: !!cobranca_id,
  }) as any;

  const deleteCobrancaMutation = useDeleteCobranca();
  const desfazerPagamentoMutation = useDesfazerPagamento();

  // Atualiza o título da página
  useEffect(() => {
    if (cobranca?.passageiro?.nome) {
      document.title = `Mensalidade - ${cobranca.passageiro.nome}`;
    }
  }, [cobranca]);

  // Handlers
  const handleEditClick = () => {
    if (cobranca) {
      openCobrancaEditDialog({
        cobranca,
        onSuccess: () => refetch(),
      });
    }
  };

  const handleDeleteClick = () => {
    if (!cobranca) return;
    
    openCobrancaDeleteDialog({
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteCobrancaMutation.mutateAsync(cobranca_id!);
          toast.success("Mensalidade excluída com sucesso");
          navigate(-1);
        } catch (error) {
          toast.error("Erro ao excluir mensalidade");
        } finally {
          setIsDeleting(false);
        }
      },
      onEdit: handleEditClick
    });
  };

  const handleDesfazerPagamento = () => {
    openConfirmationDialog({
      title: "Desfazer Pagamento?",
      description: "O status da mensalidade voltará para 'A Receber'.",
      confirmText: "Sim, Desfazer",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await desfazerPagamentoMutation.mutateAsync(cobranca_id!);
          refetch();
          closeConfirmationDialog();
        } catch (error) {
          // Erro tratado no mutante
        }
      },
      onCancel: () => closeConfirmationDialog(),
    });
  };

  const statusInfo = useMemo(() => {
    if (!cobranca) return { label: "", color: "" };
    
    switch (cobranca.status) {
      case CobrancaStatus.PAGO:
        return { label: "Pago", color: "bg-green-100 text-green-700 border-green-200" };
      default:
        // Por enquanto CobrancaStatus só tem PAGO e PENDENTE nos enums
        // Se status estiver pendente, mas com vencimento passado, podemos inferir atraso no UI
        const isAtrasado = new Date(cobranca.data_vencimento) < new Date() && cobranca.status === CobrancaStatus.PENDENTE;
        if (isAtrasado) {
           return { label: "Atrasado", color: "bg-red-100 text-red-700 border-red-200" };
        }
        return { label: "A Receber", color: "bg-orange-100 text-orange-700 border-orange-200" };
    }
  }, [cobranca]);

  if (isCobrancaLoading) {
    return <CobrancaLoadingSkeleton />;
  }

  if (!cobranca) {
    return (
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium">Mensalidade não encontrada.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
      </div>
    );
  }

  return (
    <>
      <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
          {/* Header */}
          <header className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full h-10 w-10 bg-white shadow-sm border border-gray-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-lg font-bold text-gray-900">Detalhes do Pagamento</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 bg-white shadow-sm border border-gray-100"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-xl border-gray-100">
                <DropdownMenuItem onClick={handleEditClick} className="rounded-xl p-3 cursor-pointer">
                  <DollarSign className="w-4 h-4 mr-3 text-blue-600" />
                  Editar Valor/Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteClick} className="rounded-xl p-3 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                  <Trash2 className="w-4 h-4 mr-3" />
                  Excluir Mensalidade
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          {/* Valor Card */}
          <Card className="rounded-[2.5rem] overflow-hidden border-0 shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <CardContent className="p-8 text-center space-y-4">
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium uppercase tracking-wider opacity-80">
                  Valor da Mensalidade
                </p>
                <h2 className="text-5xl font-black tabular-nums tracking-tighter">
                  {formatCurrency(Number(cobranca.valor))}
                </h2>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Badge className={`${statusInfo.color} font-bold px-4 py-1.5 rounded-full border shadow-sm border-transparent`}>
                  {statusInfo.label}
                </Badge>
                {cobranca.tipo_pagamento && (
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    {cobranca.tipo_pagamento === CobrancaTipoPagamento.PIX ? "PIX" : "Manual"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passageiro */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden border">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Passageiro e Contato
                  </h3>
                </div>
                <div className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 leading-tight truncate">{cobranca.passageiro?.nome ?? "Passageiro"}</h4>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{cobranca.passageiro?.nome_responsavel ?? "Sem responsável"}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl h-10 w-10 bg-gray-50 hover:bg-blue-50 text-blue-600"
                    onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.PASSENGER_DETAILS.replace(":passageiro_id", cobranca.passageiro_id))}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Datas */}
            <Card className="rounded-3xl border-gray-100 shadow-sm overflow-hidden border">
              <CardContent className="p-0">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <h3 className="text-sm font-bold text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Datas Importantes
                  </h3>
                </div>
                <div className="p-5 flex divide-x divide-gray-100">
                  <div className="flex-1 pr-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Vencimento</p>
                    <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                      {formatDateToBR(cobranca.data_vencimento)}
                    </p>
                  </div>
                  <div className="flex-1 pl-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5">Pagamento</p>
                    <p className="text-base font-bold text-gray-900 italic">
                      {cobranca.data_pagamento ? formatDateToBR(cobranca.data_pagamento) : "Pendente"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cobranca.status !== CobrancaStatus.PAGO ? (
              <>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-500/20"
                  onClick={() => openManualPaymentDialog({
                    cobrancaId: cobranca_id!,
                    passageiroNome: cobranca.passageiro?.nome ?? "Passageiro",
                    responsavelNome: cobranca.passageiro?.nome_responsavel,
                    valorOriginal: Number(cobranca.valor),
                    status: cobranca.status,
                    dataVencimento: cobranca.data_vencimento,
                    onPaymentRecorded: () => refetch(),
                  })}
                >
                  <DollarSign className="w-5 h-5 mr-2" />
                  Registrar Pagamento
                </Button>
                
                <Button
                  variant="outline"
                  className="border-blue-200 text-blue-700 font-bold h-12 rounded-xl bg-blue-50/50 hover:bg-blue-100/50"
                  onClick={() => toast.info("Disponível na carteirinha em breve.")}
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Visualizar PIX
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => openReceiptDialog({ url: (cobranca as any).comprovante_url })}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  {(cobranca as any).comprovante_url ? (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Comprovante
                    </>
                  ) : (
                    <>
                      <Receipt className="w-5 h-5 mr-2" />
                      Sem Comprovante
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="border-red-100 text-red-600 font-bold h-12 rounded-xl bg-red-50/20 hover:bg-red-50/50"
                  onClick={handleDesfazerPagamento}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Estornar / Desfazer
                </Button>
              </>
            )}
          </div>

          {/* Histórico Simples */}
          <div className="pt-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openCobrancaHistoryDialog({ 
                cobrancaId: cobranca.id, 
                passageiroNome: cobranca.passageiro?.nome ?? "Passageiro" 
              })}
              className="text-gray-400 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest py-6"
            >
              <History className="w-4 h-4 mr-2" />
              Ver histórico completo de alterações
            </Button>
          </div>
        </div>
      </PullToRefreshWrapper>

      <LoadingOverlay active={isDeleting || desfazerPagamentoMutation.isPending} text="Aguarde..." />
    </>
  );
}

function CobrancaLoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
      <Skeleton className="h-56 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}
