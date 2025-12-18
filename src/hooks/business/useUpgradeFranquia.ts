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

    // --- Lógica Simplificada "Upsell-Oriented" ---
    
    // 1. Filtra opções oficiais de prateleira (Só mostra se atender a necessidade ATUAL do usuário)
    // Ex: Se tem 40 alunos, não mostramos o plano de 25. Mostramos 50, 90...
    const validTiers = sortedTiers.filter(t => t.franquia_cobrancas_mes >= totalPassageiros);

    // 2. Se existirem opções válidas (Upsell)
    if (validTiers.length > 0) {
        // Mapeia todas as opções superiores (Upsell)
        validTiers.forEach((tier, index) => {
             // A primeira opção válida é a Recomendada (Menor impacto financeiro que resolve o problema)
             const isRecommended = index === 0; 
             
             opts.push({
                id: tier.id,
                label: `Pacote ${tier.franquia_cobrancas_mes} Vagas`,
                quantidade: tier.franquia_cobrancas_mes,
                tipo: "tier",
                recomendado: isRecommended,
                descricao: isRecommended 
                    ? (tier.franquia_cobrancas_mes === totalPassageiros ? "Atende exatamente" : "Ideal para sua frota (com folga)")
                    : "Mais espaço para crescer"
            });
        });
    } else {
        // 3. Se NÃO existirem opções de prateleira (Usuário gigante > MaxTier)
        // Só ai mostramos a opção "Sob Medida"
        const maxTier = sortedTiers[sortedTiers.length - 1]; // Maior de todos (apenas referência)
        
        opts.push({
            id: "custom_enterprise",
            label: "Plano Sob Medida",
            quantidade: totalPassageiros, // Usa a quantidade exata
            tipo: "cover_all",
            descricao: "Fale com nosso time",
            isCustom: true,
            recomendado: true
        });
    }
    
    // Safety: Garantir flag isCustom se id não for oficial (só pra garantir o preço dinâmico se algo vazar)
    opts.forEach(opt => {
         const isOficial = subPlanos.some(sp => sp.id === opt.id);
         if (!isOficial) {
             opt.isCustom = true;
         }
    });

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
