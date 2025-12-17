import { usePlanos } from "@/hooks/api/usePlanos";
import { useMemo } from "react";

export interface UpgradeOption {
  id: string;
  label: string;
  quantidade: number;
  tipo: "fixo" | "tier" | "cover_all";
  recomendado?: boolean;
  descricao?: string;
  isCustom?: boolean;
}

export interface ProrataResult {
  valorHoje: number;
  diasRestantes: number;
}

interface UseUpgradeFranquiaProps {
  franquiaContratada: number;
  totalPassageiros: number;
  dataVencimento?: Date | string;
  valorAtualMensal?: number;
}

export function useUpgradeFranquia({
  franquiaContratada,
  totalPassageiros,
  dataVencimento,
  valorAtualMensal = 0,
}: UseUpgradeFranquiaProps) {
  
  // Buscar planos do backend para ter os tiers dinâmicos
  const { data: planosData } = usePlanos({ ativo: "true" }, { enabled: true });
  
  // --- Lógica de Opções ---
  const options = useMemo(() => {
    const opts: UpgradeOption[] = [];
    const subPlanos: any[] = (planosData as any)?.sub || [];

    // Ordenar subplanos por franquia crescrente
    const sortedTiers = [...subPlanos].sort((a, b) => a.franquia_cobrancas_mes - b.franquia_cobrancas_mes);

    // Se não há tiers carregados, retornar vazio por enquanto
    if (sortedTiers.length === 0) return [];

    const minTier = sortedTiers[0].franquia_cobrancas_mes;
    /**
     * ESTRATÉGIA DE TIERS (RÍGIDA)
     * Para planos Profissionais (Automação), não vendemos "vagas soltas". 
     * Vendemos pacotes: 15, 30, 45, etc.
     */
    
    // 1. Identificar o "Próximo Degrau" (Tier imediatamente superior à franquia atual)
    // Se franquia atual é 0 (Free), próximo é 15. Se é 15, próximo é 30.
    const nextTier = sortedTiers.find(t => t.franquia_cobrancas_mes > franquiaContratada);
    
    // 2. Identificar o "Tier Ideal" (Que cobre o TOTAL de passageiros do usuário)
    // Se o usuário tem 28 alunos, o ideal é 30.
    const fittingTier = sortedTiers.find(t => t.franquia_cobrancas_mes >= totalPassageiros);

    // --- Montagem das Opções ---

    // Opção 1: O Recomendado (Ideal)
    // Se o fittingTier existe, ele é a melhor oferta.
    if (fittingTier) {
        // Se o tier ideal for o mesmo que o contratado (ex: tem 15, usa 12, mas quer ver opções),
        // ou se for igual ao próximo (ex: tem 0, usa 6, ideal é 15), ok.
        
        opts.push({
            id: fittingTier.id,
            label: `Pacote ${fittingTier.franquia_cobrancas_mes} Vagas`,
            quantidade: fittingTier.franquia_cobrancas_mes,
            tipo: "tier",
            recomendado: true,
            descricao: totalPassageiros <= fittingTier.franquia_cobrancas_mes 
                ? "Atende perfeitamente sua frota atual"
                : "Melhor opção para seu tamanho"
        });
    }

    // Opção 2: O Próximo Degrau (Se for diferente do Ideal)
    // Ex: Usuário tem 0 contratados, mas 40 alunos.
    // Ideal: 45. Próximo: 15.
    // As vezes o usuário não quer pular direto pro 45 ($$$), quer ir pro 15 e testar.
    if (nextTier && (!fittingTier || nextTier.id !== fittingTier.id)) {
        opts.push({
            id: nextTier.id,
            label: `Pacote ${nextTier.franquia_cobrancas_mes} Vagas`,
            quantidade: nextTier.franquia_cobrancas_mes,
            tipo: "tier",
            recomendado: false,
            descricao: "Comece com este pacote"
        });
    }

    // Caso Especial: Usuário Gigante (Maior que o maior tier)
    // Se não achou fittingTier (porque total > maxTier), oferecemos "Sob Medida"
    // Mas SÓ se tivermos tiers carregados (evitar mostrar Sob Medida porque loading falhou)
    if (!fittingTier && totalPassageiros > 0 && sortedTiers.length > 0) {
        const maxTier = sortedTiers[sortedTiers.length - 1]; // Maior de todos
        
        // Se já está no máximo, ou se precisa de mais
        // Check safety: Se totalPassageiros realmente é maior que o maxTier
        if (maxTier && totalPassageiros > maxTier.franquia_cobrancas_mes) { 
             opts.push({
                id: "custom_enterprise",
                label: "Plano Sob Medida",
                quantidade: totalPassageiros, // Ou maxTier + X
                tipo: "cover_all",
                descricao: "Fale com nosso time",
                isCustom: true,
                recomendado: true
            });
        }
    }

    // Ordenar: Menor -> Maior
    return opts.sort((a, b) => a.quantidade - b.quantidade);
  }, [franquiaContratada, totalPassageiros, planosData]);


  // --- Lógica de Cálculo Financeiro (Prorata) ---
  const calculateProrata = (novoValorMensal: number): ProrataResult => {
    // Se o valor atual é zero (Plano Gratuito ou Trial), cobra o valor cheio imediatamente
    // Efetivamente inicia um novo ciclo de faturamento
    if (valorAtualMensal <= 0) {
      return {
        valorHoje: novoValorMensal,
        diasRestantes: 30
      };
    }

    const hoje = new Date();
    let diasRestantes = 30; // Default

    if (dataVencimento) {
      const vencimento = new Date(dataVencimento);
      const diffTime = vencimento.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      diasRestantes = diffDays;
    }

    // Sync com Backend: Clamp entre 0 e 30 dias
    if (diasRestantes < 0) diasRestantes = 0;
    if (diasRestantes > 30) diasRestantes = 30;

    const diferencaMensal = Math.max(0, novoValorMensal - valorAtualMensal); 

    // Prorata
    // valorHoje = (diferencaMensal / 30) * diasRestantes
    const valorHoje = (diferencaMensal / 30) * diasRestantes;

    return {
      valorHoje: Math.round(valorHoje * 100) / 100,
      diasRestantes
    };
  };

  return {
    options,
    calculateProrata,
  };
}
