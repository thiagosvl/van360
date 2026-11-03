import { useState, useMemo, useEffect } from 'react';
import { useAdminCalculatorBaseline } from '@/hooks/api/adminHooks';

export type CostCategory = 'infra' | 'fiscal' | 'mensageria' | 'outro';
export type CostPeriod = 'mensal' | 'anual';

export interface FixedCost {
  id: string;
  name: string;
  val: number;
  period: CostPeriod;
  cat: CostCategory;
  active: boolean;
}

export const CATEGORY_LABELS: Record<CostCategory, string> = {
  infra: 'Infraestrutura & Nuvem',
  fiscal: 'Fiscal & Contábil',
  mensageria: 'Mensageria & E-mail',
  outro: 'Outro',
};

export interface CalculatorInsight {
  id: string;
  tipo: 'sucesso' | 'alerta' | 'info' | 'estrategia';
  titulo: string;
  descricao: string;
}

export interface SimulationState {
  nCondutores: number;
  anualPct: number;
  vitalicioCount: number;
  pagantesBaseCount: number;
  pMensal: number;
  pAnual: number;
  mediaPassageiros: number;
  inadimplenciaPct: number;
  wabaUnitarioBrl: number;
  pixPct: number;
  taxaPix: number;
  taxaCard: number;
  taxaImposto: number;
  churnPct: number;
  cac: number;
  growPct: number;
  simularCobrancaAuto: boolean;
  pctAlunosCobrancaAuto: number;
  spreadUnitarioCobranca: number;
}

export interface CalculatedMetrics {
  totalCondutores: number;
  condutoresVitalicios: number;
  condutoresBasePagantes: number;
  condutoresNovos: number;
  condutoresNovosMensal: number;
  condutoresNovosAnual: number;
  condutoresPagantes: number;
  ticketMedioPorPagante: number;
  pAnualMensalizado: number;
  receitaBaseMrr: number;
  receitaFundadores: number;
  receitaNovosMensal: number;
  receitaNovosAnual: number;
  receitaAssinaturas: number;
  receitaSpreadCobranca: number;
  receitaBrutaMensal: number;
  custoGateway: number;
  impostoSimples: number;
  totalAlunos: number;
  totalAlunosCobrancaAuto: number;
  totalMsgsWaba: number;
  msgsD0: number;
  msgsD3: number;
  msgsContrato: number;
  custoWabaMensal: number;
  custoWabaD0: number;
  custoWabaD3: number;
  custoWabaContrato: number;
  custoWabaPorCondutor: number;
  custoWabaPorAluno: number;
  pctWabaSobreReceita: number;
  custosVariaveisTotais: number;
  margemContribuicao: number;
  margemContribuicaoPct: number;
  custosOperacionaisTotais: number;
  lucroLiquidoMensal: number;
  margemLiquidaPct: number;
  breakEvenCondutores: number;
  custoMedioPorCondutor: number;
  custoMedioPorAluno: number;
  lucroMedioPorCondutor: number;
  ltv: number;
  ltvToCac: number;
  totalFixos: number;
  insights: CalculatorInsight[];
}

export interface ProjectionMonthData {
  mes: string;
  condutores: number;
  alunos: number;
  receitaBruta: number;
  custosTotais: number;
  lucroLiquido: number;
  receitaAcumulada: number;
}

const INITIAL_COSTS: FixedCost[] = [
  { id: '1', name: 'VPS Backend (Docker / Redis)', val: 75, period: 'mensal', cat: 'infra', active: true },
  { id: '2', name: 'Google Workspace (contato@)', val: 40, period: 'mensal', cat: 'infra', active: true },
  { id: '3', name: 'Domínio van360.com.br', val: 40, period: 'anual', cat: 'infra', active: true },
  { id: '4', name: 'Resend Pro (50k e-mails/mês)', val: 112, period: 'mensal', cat: 'mensageria', active: false },
  { id: '5', name: 'Supabase Pro (Backups diários / PITR)', val: 140, period: 'mensal', cat: 'infra', active: false },
  { id: '6', name: 'Contabilidade Online PJ', val: 150, period: 'mensal', cat: 'fiscal', active: false },
  { id: '7', name: 'Certificado Digital e-CNPJ A1', val: 200, period: 'anual', cat: 'fiscal', active: false },
];

const STORAGE_KEY = '@van360:calculator_scenario_v3';

const INITIAL_SIMULATION_STATE: SimulationState = {
  nCondutores: 51,
  anualPct: 10,
  vitalicioCount: 3,
  pagantesBaseCount: 48,
  pMensal: 39.9,
  pAnual: 390.0,
  mediaPassageiros: 46,
  inadimplenciaPct: 42.5,
  wabaUnitarioBrl: 0.038,
  pixPct: 77,
  taxaPix: 1.19,
  taxaCard: 3.49,
  taxaImposto: 6.0,
  churnPct: 3.0,
  cac: 50.0,
  growPct: 5.0,
  simularCobrancaAuto: true,
  pctAlunosCobrancaAuto: 10,
  spreadUnitarioCobranca: 0.65,
};

export function useAdminCalculator() {
  const { data: baseline, isLoading: isBaselineLoading } = useAdminCalculatorBaseline();

  const [simState, setSimState] = useState<SimulationState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.simState || INITIAL_SIMULATION_STATE;
      } catch {
        return INITIAL_SIMULATION_STATE;
      }
    }
    return INITIAL_SIMULATION_STATE;
  });

  const [costs, setCosts] = useState<FixedCost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.costs || INITIAL_COSTS;
      } catch {
        return INITIAL_COSTS;
      }
    }
    return INITIAL_COSTS;
  });

  useEffect(() => {
    if (baseline && !localStorage.getItem(STORAGE_KEY)) {
      setSimState(prev => ({
        ...prev,
        nCondutores: baseline.motoristas.ativos || 51,
        vitalicioCount: baseline.motoristas.vitalicio ?? 3,
        pagantesBaseCount: baseline.motoristas.pagantes ?? 48,
        mediaPassageiros: baseline.passageiros.mediaPorMotorista || 46,
        inadimplenciaPct: baseline.waba.taxaAtrasoD3Pct || 42.5,
        pixPct: baseline.gateway.pctPix || 77,
        taxaPix: baseline.gateway.taxaPix || 1.19,
        taxaCard: baseline.gateway.taxaCartao || 3.49,
        taxaImposto: baseline.gateway.impostoSimples || 6.0,
      }));
    }
  }, [baseline]);

  const saveScenario = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ simState, costs }));
  };

  const clearScenario = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSimState({
      ...INITIAL_SIMULATION_STATE,
      nCondutores: baseline?.motoristas.ativos || 51,
      vitalicioCount: baseline?.motoristas.vitalicio ?? 3,
      pagantesBaseCount: baseline?.motoristas.pagantes ?? 48,
      mediaPassageiros: baseline?.passageiros.mediaPorMotorista || 46,
      inadimplenciaPct: baseline?.waba.taxaAtrasoD3Pct || 42.5,
      pixPct: baseline?.gateway.pctPix || 77,
    });
    setCosts(INITIAL_COSTS);
  };

  const applyBaselineScenario = () => {
    setSimState(prev => ({
      ...prev,
      nCondutores: baseline?.motoristas.ativos || 51,
      vitalicioCount: baseline?.motoristas.vitalicio ?? 3,
      pagantesBaseCount: baseline?.motoristas.pagantes ?? 48,
      mediaPassageiros: baseline?.passageiros.mediaPorMotorista || 46,
      inadimplenciaPct: baseline?.waba.taxaAtrasoD3Pct || 42.5,
      pixPct: baseline?.gateway.pctPix || 77,
      taxaPix: baseline?.gateway.taxaPix || 1.19,
      taxaCard: baseline?.gateway.taxaCartao || 3.49,
      taxaImposto: baseline?.gateway.impostoSimples || 6.0,
    }));
  };

  const applyPreset = (preset: 'atual' | 'crescimento' | 'escala') => {
    if (preset === 'atual') {
      applyBaselineScenario();
      setCosts(prev => prev.map(c => ({
        ...c,
        active: ['1', '2', '3'].includes(c.id),
      })));
    } else if (preset === 'crescimento') {
      setSimState(prev => ({
        ...prev,
        nCondutores: Math.max(70, (baseline?.motoristas.ativos || 51) + 20),
        pMensal: 39.90,
        pAnual: 390.0,
        anualPct: 20,
        simularCobrancaAuto: true,
        pctAlunosCobrancaAuto: 30,
      }));
      setCosts(prev => prev.map(c => ({
        ...c,
        active: ['1', '2', '3', '4'].includes(c.id),
      })));
    } else if (preset === 'escala') {
      setSimState(prev => ({
        ...prev,
        nCondutores: 120,
        pMensal: 39.90,
        pAnual: 390.0,
        anualPct: 30,
        simularCobrancaAuto: true,
        pctAlunosCobrancaAuto: 50,
      }));
      setCosts(prev => prev.map(c => ({
        ...c,
        active: true,
      })));
    }
  };

  const updateSim = <K extends keyof SimulationState>(key: K, value: SimulationState[K]) => {
    setSimState(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'pMensal') {
        next.pAnual = Number((Number(value) * 10).toFixed(2));
      }
      return next;
    });
  };

  const addCost = () => {
    setCosts(prev => [
      ...prev,
      { id: Date.now().toString(), name: 'Novo custo', val: 0, period: 'mensal', cat: 'outro', active: true }
    ]);
  };

  const updateCost = (id: string, field: keyof FixedCost, value: FixedCost[keyof FixedCost]) => {
    setCosts(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const toggleCostActive = (id: string) => {
    setCosts(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const removeCost = (id: string) => {
    setCosts(prev => prev.filter(c => c.id !== id));
  };

  const fixosData = useMemo(() => {
    const activeCosts = costs.filter(c => c.active);
    const totalFixos = activeCosts.reduce((s, c) => s + (c.period === 'anual' ? (c.val || 0) / 12 : (c.val || 0)), 0);
    const totalFixosAnual = activeCosts.reduce((s, c) => s + (c.period === 'anual' ? (c.val || 0) : (c.val || 0) * 12), 0);
    
    const byCategory: Record<CostCategory, number> = {
      infra: 0,
      fiscal: 0,
      mensageria: 0,
      outro: 0,
    };
    for (const c of activeCosts) {
      const mVal = c.period === 'anual' ? (c.val || 0) / 12 : (c.val || 0);
      byCategory[c.cat] = (byCategory[c.cat] || 0) + mVal;
    }

    return { totalFixos, totalFixosAnual, totalCadastrado: costs.length, totalAtivos: activeCosts.length, byCategory };
  }, [costs]);

  const calculations = useMemo<CalculatedMetrics>(() => {
    const {
      nCondutores,
      anualPct,
      vitalicioCount,
      pagantesBaseCount,
      pMensal,
      pAnual,
      mediaPassageiros,
      inadimplenciaPct,
      wabaUnitarioBrl,
      pixPct,
      taxaPix,
      taxaCard,
      taxaImposto,
      churnPct,
      cac,
      simularCobrancaAuto,
      pctAlunosCobrancaAuto,
      spreadUnitarioCobranca,
    } = simState;

    const { totalFixos } = fixosData;

    const totalCondutores = Math.max(1, nCondutores);
    const condutoresVitalicios = Math.min(totalCondutores, Math.max(0, vitalicioCount));
    const condutoresBasePagantes = Math.min(
      Math.max(0, totalCondutores - condutoresVitalicios),
      Math.max(0, pagantesBaseCount)
    );
    const condutoresNovos = Math.max(0, totalCondutores - condutoresVitalicios - condutoresBasePagantes);

    const pctAnual = anualPct / 100;
    const condutoresNovosAnual = Math.round(condutoresNovos * pctAnual);
    const condutoresNovosMensal = condutoresNovos - condutoresNovosAnual;

    const pAnualMensalizado = pAnual / 12;

    const receitaBaseMrr = baseline?.receita?.mrrReal ?? 1899.80;
    const receitaNovosMensal = condutoresNovosMensal * pMensal;
    const receitaNovosAnual = condutoresNovosAnual * pAnualMensalizado;
    const receitaAssinaturas = receitaBaseMrr + receitaNovosMensal + receitaNovosAnual;

    const totalAlunos = (baseline?.passageiros?.notificaveis || 811) + (condutoresNovos * mediaPassageiros);

    let receitaSpreadCobranca = 0;
    let totalAlunosCobrancaAuto = 0;
    if (simularCobrancaAuto) {
      totalAlunosCobrancaAuto = Math.round(totalAlunos * (pctAlunosCobrancaAuto / 100));
      receitaSpreadCobranca = totalAlunosCobrancaAuto * spreadUnitarioCobranca;
    }

    const receitaBrutaMensal = receitaAssinaturas + receitaSpreadCobranca;

    const pctPix = pixPct / 100;
    const txPix = taxaPix / 100;
    const txCard = taxaCard / 100;
    const custoGateway = receitaAssinaturas * (pctPix * txPix + (1 - pctPix) * txCard);
    const impostoSimples = receitaBrutaMensal * (taxaImposto / 100);

    const msgsD0 = totalAlunos;
    const msgsD3 = Math.round(totalAlunos * (inadimplenciaPct / 100));
    const msgsContrato = Math.round(totalAlunos / 12);

    const totalMsgsWaba = msgsD0 + msgsD3 + msgsContrato;
    const custoWabaMensal = totalMsgsWaba * wabaUnitarioBrl;
    const custoWabaD0 = msgsD0 * wabaUnitarioBrl;
    const custoWabaD3 = msgsD3 * wabaUnitarioBrl;
    const custoWabaContrato = msgsContrato * wabaUnitarioBrl;

    const custoWabaPorCondutor = totalCondutores > 0 ? custoWabaMensal / totalCondutores : 0;
    const custoWabaPorAluno = totalAlunos > 0 ? custoWabaMensal / totalAlunos : 0;
    const pctWabaSobreReceita = receitaBrutaMensal > 0 ? (custoWabaMensal / receitaBrutaMensal) * 100 : 0;

    const custosVariaveisTotais = custoGateway + impostoSimples + custoWabaMensal;
    const margemContribuicao = receitaBrutaMensal - custosVariaveisTotais;
    const margemContribuicaoPct = receitaBrutaMensal > 0 ? (margemContribuicao / receitaBrutaMensal) * 100 : 0;

    const custosOperacionaisTotais = totalFixos + custosVariaveisTotais;
    const lucroLiquidoMensal = receitaBrutaMensal - custosOperacionaisTotais;
    const margemLiquidaPct = receitaBrutaMensal > 0 ? (lucroLiquidoMensal / receitaBrutaMensal) * 100 : 0;

    const condutoresPagantes = totalCondutores - condutoresVitalicios;
    const ticketMedioPorPagante = condutoresPagantes > 0 ? receitaAssinaturas / condutoresPagantes : 0;
    const margemContribuicaoPorCondutor = totalCondutores > 0 ? margemContribuicao / totalCondutores : 0;

    const custoMedioPorCondutor = totalCondutores > 0 ? custosOperacionaisTotais / totalCondutores : 0;
    const custoMedioPorAluno = totalAlunos > 0 ? custosOperacionaisTotais / totalAlunos : 0;
    const lucroMedioPorCondutor = totalCondutores > 0 ? lucroLiquidoMensal / totalCondutores : 0;

    const breakEvenCondutores = margemContribuicaoPorCondutor > 0
      ? Math.ceil(totalFixos / margemContribuicaoPorCondutor)
      : 6;

    const txChurn = (churnPct || 3) / 100;
    const ltv = txChurn > 0 ? margemContribuicaoPorCondutor / txChurn : 0;
    const ltvToCac = cac > 0 ? ltv / cac : 0;

    const insights: CalculatorInsight[] = [];

    if (margemLiquidaPct >= 60) {
      insights.push({
        id: 'margem-alta',
        tipo: 'sucesso',
        titulo: `Excelente Margem Líquida (${margemLiquidaPct.toFixed(1)}%)`,
        descricao: `Operação altamente lucrativa. Para cada R$ 100 faturados, sobram R$ ${lucroLiquidoMensal > 0 ? margemLiquidaPct.toFixed(2) : '0'} limpos após custos fixos, WABA, gateway e impostos.`,
      });
    }

    if (simularCobrancaAuto && receitaSpreadCobranca > 0) {
      insights.push({
        id: 'spread-cobranca',
        tipo: 'estrategia',
        titulo: `Receita Extra de Baixa Automática: +R$ ${receitaSpreadCobranca.toFixed(2)}/mês`,
        descricao: `O spread de R$ 0,65 sobre ${totalAlunosCobrancaAuto} cobranças com baixa automática cobre grande parte dos custos variáveis da operação.`,
      });
    }

    insights.push({
      id: 'custo-waba-relativo',
      tipo: 'info',
      titulo: `WABA Sustentável: R$ ${custoWabaPorAluno.toFixed(3)} por aluno/mês`,
      descricao: `Mesmo considerando a taxa real de atraso no D+3 (${inadimplenciaPct.toFixed(1)}%), o impacto no faturamento total é de apenas ${pctWabaSobreReceita.toFixed(1)}%.`,
    });

    return {
      totalCondutores,
      condutoresVitalicios,
      condutoresBasePagantes,
      condutoresNovos,
      condutoresNovosMensal,
      condutoresNovosAnual,
      condutoresPagantes,
      ticketMedioPorPagante,
      pAnualMensalizado,
      receitaBaseMrr,
      receitaFundadores: receitaBaseMrr,
      receitaNovosMensal,
      receitaNovosAnual,
      receitaAssinaturas,
      receitaSpreadCobranca,
      receitaBrutaMensal,
      custoGateway,
      impostoSimples,
      totalAlunos,
      totalAlunosCobrancaAuto,
      totalMsgsWaba,
      msgsD0,
      msgsD3,
      msgsContrato,
      custoWabaMensal,
      custoWabaD0,
      custoWabaD3,
      custoWabaContrato,
      custoWabaPorCondutor,
      custoWabaPorAluno,
      pctWabaSobreReceita,
      custosVariaveisTotais,
      margemContribuicao,
      margemContribuicaoPct,
      custosOperacionaisTotais,
      lucroLiquidoMensal,
      margemLiquidaPct,
      breakEvenCondutores,
      custoMedioPorCondutor,
      custoMedioPorAluno,
      lucroMedioPorCondutor,
      ltv,
      ltvToCac,
      totalFixos,
      insights,
    };
  }, [simState, fixosData, baseline]);

  const projectionChartData = useMemo<ProjectionMonthData[]>(() => {
    const data: ProjectionMonthData[] = [];
    const { growPct, churnPct, pMensal, pAnual, pixPct, taxaPix, taxaCard, taxaImposto, mediaPassageiros, inadimplenciaPct, wabaUnitarioBrl, simularCobrancaAuto, pctAlunosCobrancaAuto, spreadUnitarioCobranca } = simState;
    const { totalFixos } = fixosData;

    const pAmes = pAnual / 12;
    const pctAnual = (simState.anualPct || 10) / 100;
    const txChurn = (churnPct || 3) / 100;
    const txGrow = (growPct || 5) / 100;
    const pctPix = pixPct / 100;
    const txPix = taxaPix / 100;
    const txCard = taxaCard / 100;
    const txImp = taxaImposto / 100;

    let curCondutores = simState.nCondutores;
    let receitaAcumulada = 0;

    for (let m = 1; m <= 12; m++) {
      const novosAdicionados = Math.round(curCondutores * txGrow);
      curCondutores = Math.max(baseline?.motoristas.ativos || 51, curCondutores - Math.round(curCondutores * txChurn) + novosAdicionados);

      const condutoresPagantes = Math.max(1, curCondutores - simState.vitalicioCount);
      const nAnual = Math.round(condutoresPagantes * pctAnual);
      const nMensal = condutoresPagantes - nAnual;
      let bruta = nMensal * pMensal + nAnual * pAmes;

      const alunos = curCondutores * mediaPassageiros;
      if (simularCobrancaAuto) {
        const alunosAuto = Math.round(alunos * (pctAlunosCobrancaAuto / 100));
        bruta += alunosAuto * spreadUnitarioCobranca;
      }

      const cGateway = bruta * (pctPix * txPix + (1 - pctPix) * txCard);
      const cImposto = bruta * txImp;

      const msgs = alunos + Math.round(alunos * (inadimplenciaPct / 100)) + Math.round(alunos / 12);
      const cWaba = msgs * wabaUnitarioBrl;

      const cTotais = totalFixos + cGateway + cImposto + cWaba;
      const lucro = bruta - cTotais;
      receitaAcumulada += bruta;

      data.push({
        mes: `Mês ${m}`,
        condutores: curCondutores,
        alunos: alunos,
        receitaBruta: Math.round(bruta),
        custosTotais: Math.round(cTotais),
        lucroLiquido: Math.round(lucro),
        receitaAcumulada: Math.round(receitaAcumulada),
      });
    }

    return data;
  }, [simState, fixosData, baseline]);

  return {
    baseline,
    isBaselineLoading,
    simState,
    updateSim,
    applyBaselineScenario,
    applyPreset,
    costs,
    addCost,
    updateCost,
    toggleCostActive,
    removeCost,
    fixosData,
    calculations,
    projectionChartData,
    saveScenario,
    clearScenario,
  };
}
