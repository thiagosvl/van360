import { PLANO_ESSENCIAL, PLANO_PROFISSIONAL } from "@/constants";
import { Plano, SubPlano } from "@/types/plano";
import { CheckCircle2 } from "lucide-react";

interface PlanSummaryProps {
  plano: Plano;
  subPlano?: SubPlano;
  quantidadePersonalizada?: number;
  precoPersonalizado?: number;
}

export const isPlanoPagoNoAto = (plano: Plano, sub?: SubPlano) =>
  (plano.permite_cobrancas || sub) && plano.trial_days === 0;

export const PlanSummary = ({
  plano,
  subPlano,
  quantidadePersonalizada,
  precoPersonalizado,
}: PlanSummaryProps) => {
  const preco =
    quantidadePersonalizada && precoPersonalizado
      ? precoPersonalizado
      : subPlano
      ? subPlano.preco_promocional ?? subPlano.preco
      : plano.preco_promocional ?? plano.preco;

  // Texto auxiliar curto e direto para o resumo
  const getShortDescription = () => {
    // Plano Profissional: Removemos "por mês" para não quebrar linha no mobile
    if (plano.slug === PLANO_PROFISSIONAL) {
      const qtd = quantidadePersonalizada || subPlano?.franquia_cobrancas_mes;
      return `Cobrança automática para até ${qtd} passageiros`;
    }

    // Plano Essencial: Perfeito
    if (plano.slug === PLANO_ESSENCIAL)
      return `Gestão ilimitada + ${plano.trial_days} dias grátis`;

    return "Gestão escolar completa";
  };

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg px-3 py-3 mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between transition-all">
      {/* Lado Esquerdo: Nome e Detalhe */}
      <div className="flex items-start gap-3">
        {/* Ícone minimalista */}
        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 mt-0.5">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
        </div>

        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-gray-900 leading-tight">
            Plano {plano.nome}
          </h3>
          <p className="text-xs text-gray-500 font-medium mt-0.5 leading-snug">
            {getShortDescription()}
          </p>
        </div>
      </div>

      {/* Lado Direito: Preço */}
      {/* No mobile, colocamos um divisor sutil ou apenas alinhamos à direita se couber, 
          mas para 320px é melhor garantir que ele não esmague o texto */}
      <div className="flex items-baseline gap-1 self-end sm:self-auto pl-11 sm:pl-0">
        <span className="text-sm font-bold text-gray-900">
          {preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </span>
        <span className="text-[10px] text-gray-500 uppercase font-medium">
          /mês
        </span>
      </div>
    </div>
  );
};
