import { Switch } from "@/components/ui/switch";
import { usePassageiro, useUpdatePassageiro } from "@/hooks";
import { useSubscriptionStatus } from "@/hooks/api/useSubscription";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { Bot, Info } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { CobrancaStatus, SubscriptionStatus } from "@/types/enums";

interface CarteirinhaAutomacaoCobrancaProps {
  passageiro: Passageiro;
}

export const CarteirinhaAutomacaoCobranca = ({
  passageiro,
}: CarteirinhaAutomacaoCobrancaProps) => {
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { subscription, isLoading: isSubLoading } = useSubscriptionStatus(user?.id);
  const updatePassageiro = useUpdatePassageiro();

  const hasAddon = subscription?.status === SubscriptionStatus.ACTIVE || subscription?.status === SubscriptionStatus.TRIAL;

  const [isUpdating, setIsUpdating] = useState(false);

  // Fallback defaults se as config não existirem, baseando no uso do supabase
  const defaultServiceFee = 3.90; // Default service fee configurado na app original
  const motoristaFeeLocal = profile?.taxa_servico ? Number(profile.taxa_servico) : defaultServiceFee;

  // Has AddOn
  if (isSubLoading) return null;
  
  if (!hasAddon) {
    return null; // Não exibe o bloco se o add on de cobrança automática não estiver ativo
  }

  const handleToggleCobrancaAutomatica = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updatePassageiro.mutateAsync({
        id: passageiro.id!,
        data: {
          cobranca_automatica: checked,
          // Se desativar a cobrança automática, por consequencia "remover" o conceito de repasse até que seja ativado de novo
        },
      });
      toast.success(checked ? "Cobrança automática ATIVADA" : "Cobrança automática DESATIVADA");
    } catch (e) {
      toast.error("Erro ao atualizar a configuração de cobrança automática.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleRepasse = async (checked: boolean) => {
    setIsUpdating(true);
    try {
      await updatePassageiro.mutateAsync({
        id: passageiro.id!,
        data: {
          repasse_taxa_servico: checked,
        },
      });
      toast.success(checked ? "Repasse de taxa ATIVADO" : "Repasse de taxa DESATIVADO");
    } catch (e) {
      toast.error("Erro ao atualizar o repasse de taxa.");
    } finally {
      setIsUpdating(false);
    }
  };

  const valorMensalidade = Number(passageiro.valor_cobranca);
  
  // Calculando com repasse ativo:
  // Mensalidade pro responsável tem acréscimo da taxa do motorista
  const pagoComRepasse = valorMensalidade + motoristaFeeLocal;
  const recebeComRepasse = valorMensalidade; // Motorista recebe o valor base integral

  // Calculando com repasse inativo:
  // Mensalidade pro responsável é o valor base. A taxa de serviço sai do valor recebido
  const pagoSemRepasse = valorMensalidade;
  const recebeSemRepasse = valorMensalidade - motoristaFeeLocal;

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100/60 shadow-diff-shadow overflow-hidden p-5 mb-5 space-y-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-purple-50/80 flex items-center justify-center border border-purple-100/50">
          <Bot className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h3 className="text-sm font-headline font-black text-[#1a3a5c]">
            Automação de Pagamentos
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Configure regras de cobrança automática Pix.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {/* Toggle Cobrança Automática */}
        <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center justify-between border border-slate-100/50">
          <div className="mr-4">
            <span className="text-sm font-bold text-[#1a3a5c] block mb-0.5">
              Cobrança Automática
            </span>
            <span className="text-[10px] text-slate-500 leading-tight block">
              Gera a cobrança e envia notificação no WhatsApp automaticamente.
            </span>
          </div>
          <Switch
            checked={!!passageiro.cobranca_automatica}
            onCheckedChange={handleToggleCobrancaAutomatica}
            disabled={isUpdating}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {/* Repasse de Taxas (Condicional) */}
        {passageiro.cobranca_automatica && (
          <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex items-center justify-between mb-3">
              <div className="mr-4">
                <span className="text-sm font-bold text-[#1a3a5c] block mb-0.5">
                  Repassar Taxa de Serviço
                </span>
                <span className="text-[10px] text-slate-500 leading-tight block">
                  Adiciona o custo transacional ao valor pago pelo responsável.
                </span>
              </div>
              <Switch
                checked={!!passageiro.repasse_taxa_servico}
                onCheckedChange={handleToggleRepasse}
                disabled={isUpdating}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>

            {/* Explicação de valores dinâmicos */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <div className="flex items-start gap-2 mb-2">
                <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Resumo Financeiro
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                {passageiro.repasse_taxa_servico ? (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Pai paga:</span>
                      <span className="font-bold text-slate-600 line-through text-[10px] opacity-70">
                        {pagoSemRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <span className="font-black text-[#1a3a5c] text-sm">
                        {pagoComRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-slate-500">Você recebe:</span>
                      <span className="font-bold text-emerald-500/70 line-through text-[10px]">
                        {recebeSemRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                      <span className="font-black text-emerald-500 text-sm">
                        {recebeComRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-slate-500">Pai paga:</span>
                      <span className="font-black text-[#1a3a5c] text-sm">
                        {pagoSemRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                    <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-slate-500">Você recebe:</span>
                      <span className="font-black text-amber-500 text-sm">
                        {recebeSemRepasse.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
