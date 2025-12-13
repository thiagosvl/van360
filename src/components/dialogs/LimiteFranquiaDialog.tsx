import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useUpgradeFranquia } from "@/hooks/business/useUpgradeFranquia";
import { planoApi } from "@/services/api/plano.api";
import { usuarioApi } from "@/services/api/usuario.api";
import { toast } from "@/utils/notifications/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Rocket } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

interface LimiteFranquiaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  franquiaContratada: number;
  cobrancasEmUso: number;
  usuarioId?: string;
  totalPassageiros?: number;
  onUpgradeSuccess?: () => void;
  dataVencimento?: string;
  valorAtualMensal?: number;
  targetPassengerId?: string;
  // Customization Props
  title?: string;
  description?: string;
  hideLimitInfo?: boolean;
}

export default function LimiteFranquiaDialog({
  open,
  onOpenChange,
  franquiaContratada,
  cobrancasEmUso,
  usuarioId,
  totalPassageiros = 0,
  onUpgradeSuccess,
  dataVencimento,
  valorAtualMensal = 0,
  targetPassengerId,
  title,
  description,
  hideLimitInfo,
}: LimiteFranquiaDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { options, calculateProrata } = useUpgradeFranquia({
    franquiaContratada,
    totalPassageiros,
    dataVencimento,
    valorAtualMensal,
  });



  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    cobrancaId: string;
    valor: number;
    franquia: number;
  } | null>(null);

  // Seleciona a primeira opção por padrão
  useEffect(() => {
    if (open && options.length > 0 && !selectedOptionId) {
      setSelectedOptionId(options[0].id);
    }
  }, [open, options, selectedOptionId]);

  // Fix for potential body lock issue when opened from Drawer
  // Determines if we need to force cleanup pointer-events
  useEffect(() => {
    if (!open) {
      // Aumentando o tempo para garantir que rode APÓS as animações do Radix (approx 300ms)
      const timer = setTimeout(() => {
        document.body.style.removeProperty("pointer-events");
        document.body.style.removeProperty("overflow");
        // Força remoção do atributo data-scroll-locked se persistir
        if (document.body.hasAttribute("data-scroll-locked")) {
            document.body.removeAttribute("data-scroll-locked");
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const selectedOption = options.find(o => o.id === selectedOptionId);

  // Busca preço do backend (ignorando minimo do plano para permitir upgrades pequenos se necessário)
  const { data: pricePreview, isLoading: isLoadingPrice } = useQuery({
    queryKey: ["preco-preview", selectedOption?.quantidade],
    queryFn: async () => {
      if (!selectedOption) return null;
      return planoApi.calcularPrecoPreview(selectedOption.quantidade, true);
    },
    enabled: !!selectedOption && open,
    staleTime: 1000 * 60 * 5, // 5 min
  });

  const calculation = pricePreview ? {
      ...calculateProrata(pricePreview.preco),
      novoValorMensal: pricePreview.preco,
      novaFranquia: selectedOption?.quantidade || 0
  } : null;


  const createUpgradeMutation = useMutation({
    mutationFn: async () => {
      if (!usuarioId) throw new Error("Usuário não identificado");
      if (!selectedOption) throw new Error("Opção inválida");
      
        return usuarioApi.criarAssinaturaCompletoPersonalizado({
        usuario_id: usuarioId,
        quantidade: selectedOption.quantidade,
        targetPassengerId,
      });
    },
    onSuccess: (data) => {
      if (data.cobrancaId || data.cobranca_id) {
        setPaymentData({
          cobrancaId: data.cobrancaId || data.cobranca_id,
          valor: data.valor,
          franquia: selectedOption?.quantidade || 0,
        });
        setPaymentSuccess(false); // Reset
        setShowPayment(true);
      } else {
        toast.error("Erro ao gerar cobrança", {
          description: "Não foi possível gerar o pagamento. Tente novamente.",
        });
      }
    },
    onError: (error) => {
      toast.error("Erro ao processar", {
        description: "Não foi possível iniciar o upgrade. Tente novamente.",
      });
    },
  });

  const handlePagar = () => {
    if (!usuarioId) {
      toast.error("Erro de identificação", {
        description: "Não foi possível identificar o usuário. Recarregue a página.",
      });
      return;
    }
    createUpgradeMutation.mutate();
  };

  const handlePaymentVerified = () => {
      setPaymentSuccess(true);
      // Atualização de cache delegada ao componente PagamentoPixContent para evitar duplicidade
  };

  const handlePaymentSuccess = () => {
    handlePaymentVerified(); 
    setShowPayment(false);
    onOpenChange(false);

    toast.success("Upgrade realizado!", {
      description: `Sua franquia foi aumentada para ${paymentData?.franquia} passageiros.`,
    });

    if (onUpgradeSuccess) {
      onUpgradeSuccess();
    }
  };

  const handleClosePayment = () => {
    setShowPayment(false);
    // Se o pagamento foi confirmado, fecha o dialog principal também
    if (paymentSuccess) {
        onOpenChange(false);
        if (onUpgradeSuccess) onUpgradeSuccess();
    }
  };

  return (
    <>
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent 
            className="max-w-md p-0 overflow-hidden gap-0 border-0 rounded-3xl flex flex-col max-h-[90vh]"
            // @ts-ignore
            onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="bg-indigo-600 p-6 text-white shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <AlertDialogTitle className="text-xl font-bold text-white">
                {title || "Aumente sua capacidade"}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-indigo-100 text-sm leading-relaxed">
              {description || (
                <>
                  Você atingiu o limite de {franquiaContratada} passageiros no automático. 
                  Para continuar enviando cobranças para todos, aumente seu plano.
                </>
              )}
            </AlertDialogDescription>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-white">
            <RadioGroup
              value={selectedOptionId}
              onValueChange={setSelectedOptionId}
              className="grid gap-4"
            >
              {options.map((option) => (
                <Label
                  key={option.id}
                  htmlFor={option.id}
                  className={`relative flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {option.recomendado && (
                    <div className="absolute -top-3 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase tracking-wider">
                      Recomendado
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="border-indigo-600 text-indigo-600"
                    />
                    <div>
                      <div className="font-bold text-gray-900">
                        {option.label}
                      </div>
                      {option.descricao && (
                        <div className="text-xs text-gray-500">
                          {option.descricao}
                        </div>
                      )}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            <div className="mt-6 space-y-4">
              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Nova Capacidade:</span>
                  <span className="font-bold text-gray-900 text-lg">
                    {selectedOption?.quantidade || "-"} <span className="text-sm font-normal text-gray-500">passageiros</span>
                  </span>
                </div>
                
                <Separator className="bg-gray-200" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Pagar agora via PIX:</span>
                  <div className="text-right">
                    {isLoadingPrice ? (
                       <Loader2 className="h-4 w-4 animate-spin text-emerald-600 ml-auto" />
                    ) : (
                      <span className="font-bold text-emerald-600 text-xl">
                        {calculation ? calculation.valorHoje.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }) : "-"}
                      </span>
                    )}
                  </div>
                </div>
                
                 <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-gray-500">Nova Mensalidade:</span>
                  <span className="font-medium text-gray-600 text-sm">
                    {calculation ? calculation.novoValorMensal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }) : "-"}
                    <span className="text-[10px] font-normal text-gray-400">
                      /mês
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white border-t border-gray-100 shrink-0">
              <Button
                onClick={handlePagar}
                disabled={createUpgradeMutation.isPending || !calculation || isLoadingPrice}
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 text-lg mb-3 transition-all active:scale-[0.98]"
              >
                {createUpgradeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Aumentar Limite Agora"
                )}
              </Button>

              <AlertDialogFooter className="sm:justify-center">
                <Button
                  variant="ghost"
                  className="hover:bg-gray-50 text-gray-500 mt-0 h-auto py-2 font-normal"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Pequeno delay para evitar que o clique "vaze" e feche o dialog de baixo
                    setTimeout(() => onOpenChange(false), 50);
                  }}
                >
                  Agora não
                </Button>
              </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Pagamento Stacked (sobreposto) */}
      {showPayment && paymentData && (
        <PagamentoAssinaturaDialog
          isOpen={true} // Força open true pois é controlado condicionalmente
          onClose={handleClosePayment}
          cobrancaId={paymentData.cobrancaId}
          valor={paymentData.valor}
          onPaymentSuccess={handlePaymentSuccess}
          usuarioId={usuarioId}
          context="upgrade"
          nomePlano="Plano Completo Personalizado"
          quantidadeAlunos={paymentData.franquia}
          onIrParaAssinatura={handleClosePayment}
          onPaymentVerified={handlePaymentVerified}
        />
      )}
    </>
  );
}
