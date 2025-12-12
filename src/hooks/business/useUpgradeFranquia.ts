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
    const isContracting = franquiaContratada === 0;

    /**
     * MODO CONTRATAÇÃO (Sem franquia anterior)
     */
    if (isContracting) {
        // Cenario 1: Total Passageiros <= Menor Tier
        // Exibir apenas a opção do Menor Tier
        if (totalPassageiros <= minTier) {
            const tier = sortedTiers[0];
            opts.push({
                id: tier.id, // ID real do plano
                label: `${tier.franquia_cobrancas_mes} Passageiros`,
                quantidade: tier.franquia_cobrancas_mes,
                tipo: "tier",
                recomendado: true,
                descricao: "Plano inicial ideal"
            });
        }
        // Cenario 2: Total Passageiros > Menor Tier
        else {
            // Opção A: Próximo Tier que atende
            const fittingTier = sortedTiers.find(t => t.franquia_cobrancas_mes >= totalPassageiros);
            
            // Opção B: Customizado (Para toda a frota)
            // Só adiciona se o fittingTier não for EXATAMENTE a mesma quantidade
            const customQuantity = totalPassageiros;
            const isExactMatch = fittingTier && fittingTier.franquia_cobrancas_mes === customQuantity;

            if (fittingTier) {
                 opts.push({
                    id: fittingTier.id,
                    label: `Ir para ${fittingTier.franquia_cobrancas_mes} Passageiros`,
                    quantidade: fittingTier.franquia_cobrancas_mes,
                    tipo: "tier",
                    recomendado: true,
                    descricao: "Melhor custo-benefício"
                 });
            }

            if (!isExactMatch) {
                 opts.push({
                    id: "custom_contract",
                    label: "Para toda a frota",
                    quantidade: customQuantity,
                    tipo: "cover_all",
                    descricao: `${customQuantity} passageiros`,
                    isCustom: true
                 });
            }
        }
    } 
    /**
     * MODO UPGRADE (Já tem franquia)
     * Lógica baseada em 3 Escopos: Mínimo, Estratégico (Tier) e Preciso (Total)
     */
    else {
        
        // 1. Escopo Mínimo: Resolver o bloqueio atual (+1 ou +Seleção)
        // Se estamos ativando via lista, assumimos +1 se a seleção não for passada (ToDo: passar seleção)
        // Por padrão, consideramos que o usuário quer ativar "o que falta" ou "mais um".
        // Mas para simplificar, se ele clicou em "Upgrade", ele quer no mínimo +1.
        // Se houver uma flag de "seleção manual", usaríamos ela. Aqui assumimos +1 step.
        const step = 1; 
        const targetMin = franquiaContratada + step;

        // 2. Escopo Total: Resolver toda a frota cadastrada
        const targetTotal = totalPassageiros;
        
        // --- Geração de Candidatos ---

        // Candidato A: Opção Mínima (Custom ou Tier)
        // Verifica se targetMin coincide com algum Tier
        const tierMin = sortedTiers.find(t => t.franquia_cobrancas_mes === targetMin);
        const optMin: UpgradeOption = {
            id: tierMin ? tierMin.id : `custom_min_${targetMin}`,
            label: tierMin ? `Ir para ${tierMin.franquia_cobrancas_mes} Passageiros` : `Liberar +${step} Passageiro`,
            quantidade: targetMin,
            tipo: (tierMin ? "tier" : "fixo") as UpgradeOption["tipo"],
            descricao: tierMin ? "Melhor custo-benefício" : "Resolve sua necessidade imediata",
            isCustom: !tierMin,
            recomendado: false
        };

        // Candidato B: Opção Estratégica (Primeiro Tier que cobre o TOTAL)
        const tierStrategic = sortedTiers.find(t => t.franquia_cobrancas_mes >= targetTotal);
        // Se o tier estratégico for IGUAL ao Mínimo (ex: Total=5, Min=5), usamos a lógica do Mínimo mas mudamos label? 
        // Não, mantemos separado para lógica de filtro.
        
        // Candidato C: Opção Precisa (Custom Total)
        // Apenas se targetTotal > targetMin (se for igual, o Mínimo já cobre tudo).
        const optTotal: UpgradeOption | null = (targetTotal > targetMin) ? {
            id: "cover_all",
            label: "Para toda a frota",
            quantidade: targetTotal,
            tipo: "cover_all",
            descricao: `${targetTotal} vagas necessárias`,
            isCustom: true
        } : null;

        // --- Filtragem e Montagem Final ---
        
        // Adiciona Mínimo (Sempre)
        // A menos que o usuário já tenha tudo coberto? (Já verificado fora)
        opts.push(optMin);

        // Adiciona Estratégico (Se existir e for diferente do Mínimo)
        if (tierStrategic) {
             // Se Tier Estratégico for diferente do Mínimo
             if (tierStrategic.franquia_cobrancas_mes !== optMin.quantidade) {
                 opts.push({
                     id: tierStrategic.id,
                     label: `Ir para ${tierStrategic.franquia_cobrancas_mes} Passageiros`,
                     quantidade: tierStrategic.franquia_cobrancas_mes,
                     tipo: "tier",
                     descricao: "Cobre toda sua frota com folga",
                     recomendado: true
                 });
             } else {
                 // Se for igual, atualizamos o Mínimo para parecer mais premium/recomendado
                 const minIndex = opts.findIndex(o => o.quantidade === optMin.quantidade);
                 if (opts[minIndex]) {
                     opts[minIndex].tipo = "tier";
                     opts[minIndex].label = `Ir para ${tierStrategic.franquia_cobrancas_mes} Passageiros`;
                     opts[minIndex].descricao = "Cobre toda sua frota (Recomendado)";
                     opts[minIndex].recomendado = true;
                     opts[minIndex].isCustom = false;
                     // Mapear ID real do tier
                     if (!opts[minIndex].id.startsWith("custom")) {
                         opts[minIndex].id = tierStrategic.id;
                     }
                 }
             }
        }

        // Adiciona Preciso/Total (Se existir, e for diferente do Tier Estratégico e do Mínimo)
        if (optTotal) {
            const strategicQty = tierStrategic ? tierStrategic.franquia_cobrancas_mes : -1;
            
            // Só exibe se NÃO for igual ao Tier Estratégico (Redundância Tier > Custom)
            // E também já garantimos que é > min via check anterior.
            if (optTotal.quantidade !== strategicQty) {
                opts.push(optTotal);
            }
        }
    }

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
