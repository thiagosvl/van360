import { PlanCapacitySelector } from "@/components/common/PlanCapacitySelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLayout } from "@/contexts/LayoutContext";
import { usePlanUpgrade, useProfile, useSession, useUpgradeFranquia } from "@/hooks";
import { cn } from "@/lib/utils";
import { assinaturaCobrancaApi } from "@/services/api/assinatura-cobranca.api";
import { toast } from "@/utils/notifications/toast";
import { Check, CheckCircle2, ChevronLeft, ShieldAlert, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import PagamentoAssinaturaDialog from "./PagamentoAssinaturaDialog";

export interface SubscriptionExpiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogView = "OVERVIEW" | "SELECTION";

export function SubscriptionExpiredDialog({ open, onOpenChange }: SubscriptionExpiredDialogProps) {
  const { user } = useSession();
  const { profile, plano, refreshProfile, summary } = useProfile(user?.id);
  const { openPlanUpgradeDialog } = useLayout();
  
  const [view, setView] = useState<DialogView>("OVERVIEW");
  const [loadingPay, setLoadingPay] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState<string | number | null>(null);

  const {
    loading: hookLoading,
    pagamentoDialog,
    setPagamentoDialog,
    setIsPaymentVerified,
    handleUpgradeEssencial,
    handleUpgradeProfissional,
    handleClosePayment,
  } = usePlanUpgrade({
    onSuccess: () => onOpenChange(false),
  });

  const isLoading = hookLoading || loadingPay;

  // Reset view when dialog opens
  useEffect(() => {
    if (open) setView("OVERVIEW");
  }, [open]);

  const assinatura = profile?.assinatura || profile?.assinaturas_usuarios?.[0];
  const isProfissional = plano?.is_profissional;
  const isInTrial = plano?.is_trial_ativo;
  const isTrialExpired = isInTrial && !plano?.is_trial_valido;
  
  const passageirosAtivos = summary?.contadores?.passageiros?.ativos || 0;

  // Hooks para cálculo de franquia (caso escolha Profissional)
  const { options: franchiseOptions } = useUpgradeFranquia({
    franquiaContratada: 0, // No Trial/Essential, assumimos que ele está começando do zero
    totalPassageiros: passageirosAtivos,
    valorAtualMensal: 0
  });

  // Seletor automático do recomendado
  useEffect(() => {
    if (view === "SELECTION" && !selectedTierId && franchiseOptions.length > 0) {
        const recommended = franchiseOptions.find(o => o.recomendado) || franchiseOptions[0];
        setSelectedTierId(recommended.id);
    }
  }, [view, franchiseOptions, selectedTierId]);

  const planoNome = plano?.nome || "Plano Essencial";
  const valorAtual = (assinatura?.preco_aplicado || assinatura?.valor || 0) || (planoNome === "Plano Essencial" ? 29.90 : 59.90);

  const title = isTrialExpired ? "Seu período de teste expirou!" : "Sua assinatura expirou!";
  
  const handleRenewProfessional = async () => {
      const pendingInvoiceId = profile?.flags?.ultima_fatura_id;
      const targetPlanoId = assinatura?.plano_id || profile?.plano?.id;

      if (pendingInvoiceId) {
          try {
              setLoadingPay(true);
              const cobranca = await assinaturaCobrancaApi.getAssinaturaCobranca(pendingInvoiceId);
              
              setPagamentoDialog({
                  isOpen: true,
                  cobrancaId: cobranca.id,
                  valor: Number(cobranca.valor),
                  nomePlano: planoNome,
                  context: "upgrade",
                  initialData: {
                      qrCodePayload: cobranca.qr_code_payload,
                      location: "", 
                      gateway_txid: "",
                      cobrancaId: cobranca.id
                  }
              });
          } catch (err) {
              console.error("Erro ao buscar cobranca", err);
              toast.error("Não foi possível recuperar a cobrança pendente.");
          } finally {
              setLoadingPay(false);
          }
          return;
      }

      // Se não tem fatura, tenta gerar uma nova pro mesmo plano
      if (targetPlanoId) {
          handleUpgradeProfissional(targetPlanoId);
      } else {
          toast.error("Plano não identificado para renovação.");
      }
  };

  const handleSelectEssential = () => {
      handleUpgradeEssencial();
  };

  const handleConfirmProfessionalSelection = () => {
      if (!selectedTierId) return;
      handleUpgradeProfissional(String(selectedTierId));
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "transition-all duration-300 overflow-hidden p-0 border-none shadow-2xl",
        view === "OVERVIEW" && !isProfissional ? "max-w-2xl" : "max-w-md"
      )}>
        <div className="bg-white">
          {/* Header Contextual */}
          <div className="p-6 pb-0 flex items-center justify-between border-b border-gray-50 bg-gray-50/50">
             {view === "SELECTION" && (
                <button 
                  onClick={() => setView("OVERVIEW")}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </button>
             )}
             <div className="flex-1 text-center py-2">
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-1 inline-block">
                    {isTrialExpired ? "Trial Encerrado" : "Regularização"}
                </span>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">{title}</h2>
             </div>
             {view === "SELECTION" && <div className="w-9" />}
          </div>

          <div className="p-6">
            {view === "OVERVIEW" && (
                <div className="space-y-6">
                  {isProfissional ? (
                    /* CENÁRIO PROFISSIONAL: Resumo e Pagamento Direto */
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                        <div className="text-center space-y-2 px-4">
                            <p className="text-sm text-gray-500">
                                Sua automação está pausada. Regularize agora para retomar o envio de cobranças e notificações de motorista.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-violet-50 to-white p-6 rounded-2xl border border-violet-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-12 h-12 text-violet-600" />
                            </div>
                            <p className="text-[10px] font-bold text-violet-500 uppercase tracking-wider mb-2">Sua Assinatura Atual</p>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-black text-violet-900">{planoNome}</p>
                                    <p className="text-sm text-violet-600 font-medium">Franquia de {summary?.usuario?.plano?.limites?.franquia_cobranca_max || "..."} Passageiros</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-gray-900">
                                        R$ {Number(valorAtual).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Valor da Renovação</p>
                                </div>
                            </div>
                        </div>

                        <Button 
                            size="lg" 
                            className="w-full h-14 text-lg font-bold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-200" 
                            onClick={handleRenewProfessional}
                            disabled={isLoading}
                        >
                            {isLoading ? "Processando..." : "Regularizar Agora com PIX"}
                        </Button>
                    </div>
                  ) : (
                    /* CENÁRIO ESSENCIAL/TRIAL: Duas Colunas (A Escolha) */
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <p className="text-center text-sm text-gray-500 mb-8 max-w-lg mx-auto leading-relaxed">
                            {isTrialExpired 
                                ? "O Van360 é o braço direito do motorista. Escolha como quer continuar crescendo com a maior eficiência do mercado."
                                : "Obrigado por utilizar o sistema! Escolha o melhor plano para o seu momento atual."
                            }
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Card Essencial */}
                            <div className="border border-gray-100 p-6 rounded-2xl bg-white hover:border-gray-200 transition-all flex flex-col group">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Plano Essencial</h3>
                                <p className="text-xs text-gray-500 mb-4">O básico bem feito</p>
                                
                                <div className="text-2xl font-black text-gray-900 mb-6">
                                    R$ 29,90 <span className="text-xs font-medium text-gray-400">/mês</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {[
                                        "Controle de Passageiros",
                                        "Gestão de Escolas e Veículos",
                                        "Controle de Gastos",
                                        "Suporte via Email"
                                    ].map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                                            <Check className="w-3.5 h-3.5 text-gray-300" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button 
                                    variant="outline" 
                                    className="w-full h-11 border-gray-200 text-gray-600 hover:bg-gray-50"
                                    onClick={handleSelectEssential}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Processando..." : "Ficar no Essencial"}
                                </Button>
                            </div>

                            {/* Card Profissional */}
                            <div className="border-2 border-violet-500 p-6 rounded-2xl bg-violet-600 shadow-xl shadow-violet-200 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20">
                                    <Sparkles className="w-3 h-3 text-violet-100" />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Recomendado</span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-white mb-1">Plano Profissional</h3>
                                <p className="text-xs text-violet-200 mb-4">Liberdade e Automação</p>
                                
                                <div className="text-2xl font-black text-white mb-6">
                                    R$ 59,90 <span className="text-xs font-medium text-violet-300">/mês</span>
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {[
                                        "Cobranças Automáticas WhatsApp",
                                        "Lembretes de Pagamento",
                                        "Geração de Relatórios",
                                        "Contratos Automáticos PDF"
                                    ].map(f => (
                                        <li key={f} className="flex items-center gap-2 text-xs text-white font-medium">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-violet-300 fill-violet-700" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <Button 
                                    className="w-full h-11 bg-white text-violet-700 hover:bg-violet-50 font-bold border-none"
                                    onClick={() => setView("SELECTION")}
                                    disabled={isLoading}
                                >
                                    Ativar Profissional
                                </Button>
                            </div>
                        </div>
                    </div>
                  )}
                </div>
            )}

            {view === "SELECTION" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                        <h4 className="text-base font-bold text-gray-900 leading-tight">Escolha sua Capacidade</h4>
                        <p className="text-xs text-gray-500">De quantas vagas você precisa automatizar hoje? Você pode alterar a qualquer momento.</p>
                    </div>

                    <div className="py-2">
                        <PlanCapacitySelector
                            options={franchiseOptions.map(o => ({
                                id: o.id,
                                quantity: o.quantidade,
                                label: o.label
                            }))}
                            selectedOptionId={selectedTierId}
                            onSelectOption={(id) => setSelectedTierId(id || null)}
                            customQuantity={""}
                            onCustomQuantityChange={() => {}} // Não habilitado aqui para simplificar o fluxo de erro
                            minCustomQuantity={5}
                            maxCustomQuantity={150}
                        />
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                        <div className="text-xs text-gray-500 font-medium">Valor Estimado</div>
                        <div className="text-2xl font-black text-gray-900">
                           {(() => {
                                const selected = franchiseOptions.find(o => o.id === selectedTierId);
                                const priceVal = selected?.quantidade === 5 ? 59.90 : (selected?.quantidade === 8 ? 69.90 : 79.90); // Fallback hardcoded if price preview not available
                                return `R$ ${priceVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                           })()}
                        </div>
                    </div>

                    <Button 
                        size="lg"
                        className="w-full h-12 text-base font-bold bg-violet-600 hover:bg-violet-700"
                        onClick={handleConfirmProfessionalSelection}
                        disabled={isLoading || !selectedTierId}
                    >
                        {isLoading ? "Gerando Fatura..." : "Confirmar e Pagar PIX"}
                    </Button>
                </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-gray-400 bg-gray-50/50 py-3 rounded-xl border border-dashed border-gray-100 italic">
                <ShieldAlert className="w-3.5 h-3.5" />
                <p>Seus dados permanecem seguros por 90 dias em ambiente restrito.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {pagamentoDialog?.isOpen && (
        <PagamentoAssinaturaDialog
          isOpen={pagamentoDialog.isOpen}
          onClose={() => handleClosePayment()}
          cobrancaId={pagamentoDialog.cobrancaId}
          valor={pagamentoDialog.valor}
          nomePlano={pagamentoDialog.nomePlano}
          onPaymentVerified={() => {
             setIsPaymentVerified(true);
             handleClosePayment(true, {
                 title: "Bem-vindo de volta!",
                 description: "Seu pagamento foi confirmado. Acesso total reestabelecido com sucesso."
             });
             onOpenChange(false);
          }}
          initialData={pagamentoDialog.initialData}
        />
    )}
    </>
  );
}
