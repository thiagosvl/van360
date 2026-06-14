import { useState, useMemo } from 'react';

export type CostCategory = 'infra' | 'fiscal' | 'juridico' | 'outro';
export type CostPeriod = 'mensal' | 'anual';

export interface FixedCost {
  id: string;
  name: string;
  val: number;
  period: CostPeriod;
  cat: CostCategory;
}

export const CATEGORY_LABELS: Record<CostCategory, string> = {
  infra: 'Infraestrutura',
  fiscal: 'Fiscal',
  juridico: 'Jurídico',
  outro: 'Outro',
};

const INITIAL_COSTS: FixedCost[] = [
  { id: '1', name: 'VPS', val: 75, period: 'mensal', cat: 'infra' },
  { id: '2', name: 'Domínio', val: 39.60, period: 'anual', cat: 'infra' },
  { id: '3', name: 'Contabilidade', val: 195, period: 'mensal', cat: 'fiscal' },
  { id: '4', name: 'Emissor NFS-e', val: 49, period: 'mensal', cat: 'fiscal' },
  { id: '5', name: 'e-CNPJ A1', val: 200, period: 'anual', cat: 'fiscal' },
];

const STORAGE_KEY = '@van360:calculator_scenario';

const INITIAL_BASE_STATE = {
  nN: 15, nF: 5, anualPct: 0, pN: 39.90, pA: 399.00, pF: 24.90,
  churn: 3, pixPct: 70, tPix: 1.19, tCard: 3.49, tImp: 6, cac: 50,
};

const INITIAL_ADDON_STATE = {
  nc: 10, pass: 63, paiPct: 30, preco: 3.90, tImp: 6,
  splitTipo: 'fixo' as 'fixo' | 'pct', splitFixo: 1.55, splitPct: 1.5, churn: 5,
};

const INITIAL_CONSOLIDATED_STATE = { growPct: 5, addonPct: 50 };

export function useAdminCalculator() {
  const [baseState, setBaseState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).baseState || INITIAL_BASE_STATE : INITIAL_BASE_STATE;
  });

  const [addonState, setAddonState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).addonState || INITIAL_ADDON_STATE : INITIAL_ADDON_STATE;
  });

  const [consolidatedState, setConsolidatedState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).consolidatedState || INITIAL_CONSOLIDATED_STATE : INITIAL_CONSOLIDATED_STATE;
  });

  const [costs, setCosts] = useState<FixedCost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).costs || INITIAL_COSTS : INITIAL_COSTS;
  });

  const saveScenario = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ baseState, addonState, consolidatedState, costs }));
  };

  const clearScenario = () => {
    localStorage.removeItem(STORAGE_KEY);
    setBaseState(INITIAL_BASE_STATE);
    setAddonState(INITIAL_ADDON_STATE);
    setConsolidatedState(INITIAL_CONSOLIDATED_STATE);
    setCosts(INITIAL_COSTS);
  };

  const updateBase = (key: keyof typeof baseState, value: number) => {
    setBaseState(prev => ({ ...prev, [key]: value }));
  };

  const updateAddon = (key: keyof typeof addonState, value: any) => {
    setAddonState(prev => ({ ...prev, [key]: value }));
  };

  const updateConsolidated = (key: keyof typeof consolidatedState, value: number) => {
    setConsolidatedState(prev => ({ ...prev, [key]: value }));
  };

  const addCost = () => {
    setCosts(prev => [
      ...prev,
      { id: Date.now().toString(), name: 'Novo custo', val: 0, period: 'mensal', cat: 'outro' }
    ]);
  };

  const updateCost = (id: string, field: keyof FixedCost, value: any) => {
    setCosts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeCost = (id: string) => {
    setCosts(prev => prev.filter(c => c.id !== id));
  };

  // --- CALCULATIONS ---

  const fixosData = useMemo(() => {
    const totalFixos = costs.reduce((s, c) => s + (c.period === 'anual' ? (c.val || 0) / 12 : (c.val || 0)), 0);
    const totalFixosAnual = costs.reduce((s, c) => s + (c.period === 'anual' ? (c.val || 0) : (c.val || 0) * 12), 0);
    return { totalFixos, totalFixosAnual };
  }, [costs]);

  const baseCalculations = useMemo(() => {
    const { nN, nF, anualPct, pN, pA, pF, pixPct, tPix, tCard, tImp } = baseState;
    const { totalFixos } = fixosData;

    const pctAnual = anualPct / 100;
    const pctPix = pixPct / 100;
    const txPix = tPix / 100;
    const txCard = tCard / 100;
    const txImp = tImp / 100;
    const pAmes = pA / 12;

    const nNAnual = Math.round(nN * pctAnual);
    const nNMes = nN - nNAnual;
    const totalCond = nN + nF;

    const recNMes = nNMes * pN;
    const recNAnual = nNAnual * pAmes;
    const recF = nF * pF;
    const bruta = recNMes + recNAnual + recF;

    const fpix = bruta * pctPix * txPix;
    const fcard = bruta * (1 - pctPix) * txCard;
    const imp = bruta * txImp; // Imposto Simples Nacional incide sobre o Bruto
    const custos = totalFixos + fpix + fcard + imp;
    const lucro = bruta - custos;
    const margem = bruta > 0 ? (lucro / bruta) * 100 : 0;

    const ticketMedio = totalCond > 0 ? bruta / totalCond : 0;
    const liqMedio = ticketMedio * (1 - pctPix * txPix - (1 - pctPix) * txCard - txImp);
    const beInt = liqMedio > 0 ? Math.ceil(totalFixos / liqMedio) : 999;

    const txChurn = baseState.churn / 100;
    const ltv = txChurn > 0 ? liqMedio / txChurn : 0; // LTV correto baseado em Margem de Contribuição Líquida
    const ltvToCac = baseState.cac > 0 ? ltv / baseState.cac : 0;

    return {
      nNMes, nNAnual, totalCond, ticketMedio,
      recNMes, recNAnual, recF, bruta,
      fpix, fcard, imp, custos, lucro, margem, beInt, pAmes,
      ltv, ltvToCac, cac: baseState.cac
    };
  }, [baseState, fixosData]);

  const addonCalculations = useMemo(() => {
    const { nc, pass, paiPct, preco, tImp, splitTipo, splitFixo, splitPct } = addonState;
    const txImp = tImp / 100;
    const txPai = paiPct / 100;
    const txSplit = splitPct / 100;

    const totalPass = nc * pass;
    const brutaTotal = totalPass * preco;
    const splitCust = splitTipo === 'fixo' ? totalPass * splitFixo : brutaTotal * txSplit;
    const imp = (brutaTotal - splitCust) * txImp;
    const lucro = brutaTotal - splitCust - imp;
    const margem = brutaTotal > 0 ? (lucro / brutaTotal) * 100 : 0;

    const rb1 = pass * preco;
    const sc1 = splitTipo === 'fixo' ? pass * splitFixo : rb1 * txSplit;
    const imp1 = (rb1 - sc1) * txImp;
    const ll1 = rb1 - sc1 - imp1;
    const mpp = pass > 0 ? ll1 / pass : 0;
    const condAbs = Math.round(pass * (1 - txPai));

    return {
      totalPass, brutaTotal, splitCust, imp, lucro, margem,
      rb1, sc1, imp1, ll1, mpp, condAbs
    };
  }, [addonState]);

  const consolidatedCalculations = useMemo(() => {
    const { totalCond } = baseCalculations;
    const { bruta: brutaBase, fpix, fcard, imp: impBase, lucro: lucroBase } = baseCalculations;
    const { brutaTotal: brutaAddon, splitCust, imp: impAddon, lucro: lucroAddon } = addonCalculations;
    const { totalFixos } = fixosData;

    const brutaTotal = brutaBase + brutaAddon;
    const custosTotal = totalFixos + fpix + fcard + impBase + splitCust + impAddon;
    const lucroTotal = brutaTotal - custosTotal;
    const margem = brutaTotal > 0 ? (lucroTotal / brutaTotal) * 100 : 0;
    const rpc = totalCond > 0 ? lucroTotal / totalCond : 0;
    const arpu = totalCond > 0 ? brutaTotal / totalCond : 0;

    const bBarPct = brutaTotal > 0 ? Math.max(0, Math.min(100, (brutaBase / brutaTotal) * 100)) : 50;

    return {
      brutaBase, brutaAddon, brutaTotal,
      custosTotal, lucroTotal, margem, rpc, arpu,
      bBarPct, lucroBase, lucroAddon,
      fpix, fcard, impBase, impAddon, splitCust
    };
  }, [baseCalculations, addonCalculations, fixosData]);

  // --- CHART PROJECTIONS ---

  const baseChartData = useMemo(() => {
    const data = [];
    const { nN, nF, anualPct, pN, pA, pF, churn, pixPct, tPix, tCard, tImp } = baseState;
    const { totalFixos } = fixosData;
    const { growPct } = consolidatedState;

    const pAmes = pA / 12;
    const pctAnual = anualPct / 100;
    const txChurn = churn / 100;
    const txGrow = growPct / 100;
    const pctPix = pixPct / 100;
    const txPix = tPix / 100;
    const txCard = tCard / 100;
    const txImp = tImp / 100;

    let curN = nN;
    let curNF = nF;
    for (let m = 1; m <= 12; m++) {
      const newClients = Math.round((curN + curNF) * txGrow);
      curN = Math.max(0, curN - Math.round(curN * txChurn) + newClients);
      curNF = Math.max(0, curNF - Math.round(curNF * txChurn)); // Fundadores also churn, but don't grow
      
      const nA = Math.round(curN * pctAnual);
      const nM = curN - nA;
      const b = nM * pN + nA * pAmes + curNF * pF;
      const fp = b * pctPix * txPix;
      const fc = b * (1 - pctPix) * txCard;
      const li = b - fp - fc - (b * txImp) - totalFixos;
      
      data.push({
        month: `M${m}`,
        lucro: Math.round(li)
      });
    }
    return data;
  }, [baseState, fixosData, consolidatedState.growPct]);

  const consolidatedChartData = useMemo(() => {
    const data = [];
    const { nN, nF, anualPct, pN, pA, pF, churn, pixPct, tPix, tCard, tImp } = baseState;
    const { totalFixos } = fixosData;
    const { growPct, addonPct } = consolidatedState;
    const { nc, pass, preco, tImp: tImpA, splitTipo, splitFixo, splitPct, churn: addonChurn } = addonState;

    const pAmes = pA / 12;
    const pctAnual = anualPct / 100;
    const txChurn = churn / 100;
    const txGrow = growPct / 100;
    const txAddonChurn = addonChurn / 100;
    const pctPix = pixPct / 100;
    const txPix = tPix / 100;
    const txCard = tCard / 100;
    const txImpB = tImp / 100;
    const txImpA = tImpA / 100;
    const txAddon = addonPct / 100;
    const txSplit = splitPct / 100;

    let curN = nN;
    let curNF = nF;
    let curA = nc;

    for (let m = 1; m <= 12; m++) {
      const newClients = Math.round((curN + curNF) * txGrow);
      curN = Math.max(0, curN - Math.round(curN * txChurn) + newClients);
      curNF = Math.max(0, curNF - Math.round(curNF * txChurn));
      curA = Math.max(0, curA - Math.round(curA * txAddonChurn) + Math.round(newClients * txAddon));
      
      const nAn = Math.round(curN * pctAnual);
      const nM = curN - nAn;
      const b = nM * pN + nAn * pAmes + curNF * pF;
      const fp = b * pctPix * txPix;
      const fc = b * (1 - pctPix) * txCard;
      const lB = b - fp - fc - (b * txImpB) - totalFixos;
      
      const tP = curA * pass;
      const bA = tP * preco;
      const sc = splitTipo === 'fixo' ? tP * splitFixo : bA * txSplit;
      const lA = bA - sc - (bA - sc) * txImpA; // FIXED IMP FOR ADDON IN PROJECTION
      
      data.push({
        month: `M${m}`,
        base: Math.round(lB),
        addon: Math.round(lA)
      });
    }
    return data;
  }, [baseState, fixosData, consolidatedState, addonState]);

  const churnSensitivity = useMemo(() => {
    // Calculates total profit at month 12 with current churn vs (churn - 1%)
    const { nN, nF, anualPct, pN, pA, pF, churn, pixPct, tPix, tCard, tImp } = baseState;
    const { totalFixos } = fixosData;
    const { growPct, addonPct } = consolidatedState;
    const { nc, pass, preco, tImp: tImpA, splitTipo, splitFixo, splitPct, churn: addonChurn } = addonState;

    const calcMonth12Profit = (txChurn: number, txAddonChurn: number) => {
      let curN = nN;
      let curNF = nF;
      let curA = nc;
      let totalProfit12M = 0;

      for (let m = 1; m <= 12; m++) {
        const newClients = Math.round((curN + curNF) * (growPct/100));
        curN = Math.max(0, curN - Math.round(curN * txChurn) + newClients);
        curNF = Math.max(0, curNF - Math.round(curNF * txChurn));
        curA = Math.max(0, curA - Math.round(curA * txAddonChurn) + Math.round(newClients * (addonPct/100)));
        
        const b = (curN - Math.round(curN * (anualPct/100))) * pN + Math.round(curN * (anualPct/100)) * (pA/12) + curNF * pF;
        const fp = b * (pixPct/100) * (tPix/100);
        const fc = b * (1 - (pixPct/100)) * (tCard/100);
        const lB = b - fp - fc - (b * (tImp/100)) - totalFixos;
        
        const bA = curA * pass * preco;
        const sc = splitTipo === 'fixo' ? curA * pass * splitFixo : bA * (splitPct/100);
        const lA = bA - sc - (bA - sc) * (tImpA/100);
        
        totalProfit12M += (lB + lA);
      }
      return totalProfit12M;
    };

    const currentProfit = calcMonth12Profit(churn / 100, addonChurn / 100);
    const improvedChurn = Math.max(0, churn - 1);
    const improvedProfit = calcMonth12Profit(improvedChurn / 100, addonChurn / 100); // Assuming addon churn stays the same or we could lower it too
    const difference = improvedProfit - currentProfit;

    return {
      currentProfit,
      improvedProfit,
      difference,
      improvedChurn
    };
  }, [baseState, fixosData, consolidatedState, addonState]);

  return {
    baseState,
    addonState,
    consolidatedState,
    costs,
    updateBase,
    updateAddon,
    updateConsolidated,
    addCost,
    updateCost,
    removeCost,
    fixosData,
    baseCalculations,
    addonCalculations,
    consolidatedCalculations,
    baseChartData,
    consolidatedChartData,
    churnSensitivity,
    saveScenario,
    clearScenario
  };
}
