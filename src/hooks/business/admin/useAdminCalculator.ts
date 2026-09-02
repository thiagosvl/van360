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
  fundadorCount: number;
  pFundador: number;
  pMensal: number;
  pAnual: number;
  mediaPassageiros: number;
  inadimplenciaPct: number;
  toggleReciboWaba: boolean;
  wabaUnitarioBrl: number;
  pixPct: number;
  taxaPix: number;
  taxaCard: number;
  taxaImposto: number;
  churnPct: number;
  cac: number;
  growPct: number;
}

export interface CalculatedMetrics {
  totalCondutores: number;
  condutoresVitalicios: number;
  condutoresFundadores: number;
  condutoresNovos: number;
  condutoresNovosMensal: number;
  condutoresNovosAnual: number;
  condutoresPagantes: number;
  ticketMedioPorPagante: number;
  pAnualMensalizado: number;
  receitaBrutaMensal: number;
  receitaNovosMensal: number;
  receitaNovosAnual: number;
  receitaFundadores: number;
  custoGateway: number;
  impostoSimples: number;
  totalAlunos: number;
  totalMsgsWaba: number;
  msgsD0: number;
  msgsD3: number;
  msgsRecibo: number;
  msgsContrato: number;
  custoWabaMensal: number;
  custoWabaD0: number;
  custoWabaD3: number;
  custoWabaRecibo: number;
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

const STORAGE_KEY = '@van360:calculator_scenario_v2';

const INITIAL_SIMULATION_STATE: SimulationState = {
  nCondutores: 5,
  anualPct: 40,
  vitalicioCount: 1,
  fundadorCount: 4,
  pFundador: 25.0,
  pMensal: 45.0,
  pAnual: 450.0,
  mediaPassageiros: 66,
  inadimplenciaPct: 25,
  toggleReciboWaba: false,
  wabaUnitarioBrl: 0.038,
  pixPct: 50,
  taxaPix: 1.19,
  taxaCard: 3.49,
  taxaImposto: 6.0,
  churnPct: 3.0,
  cac: 50.0,
  growPct: 5.0,
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
        nCondutores: baseline.motoristas.ativos || 5,
        vitalicioCount: baseline.motoristas.vitalicio ?? 1,
        fundadorCount: baseline.motoristas.pagantes ?? 4,
        mediaPassageiros: baseline.passageiros.mediaPorMotorista || 66,
        pixPct: baseline.gateway.pctPix || 50,
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
      nCondutores: baseline?.motoristas.ativos || 5,
      vitalicioCount: baseline?.motoristas.vitalicio ?? 1,
      fundadorCount: baseline?.motoristas.pagantes ?? 4,
      mediaPassageiros: baseline?.passageiros.mediaPorMotorista || 66,
    });
    setCosts(INITIAL_COSTS);
  };

  const applyBaselineScenario = () => {
    setSimState(prev => ({
      ...prev,
      nCondutores: baseline?.motoristas.ativos || 5,
      fundadorCount: baseline?.motoristas.pagantes ?? 4,
      vitalicioCount: baseline?.motoristas.vitalicio ?? 1,
      mediaPassageiros: baseline?.passageiros.mediaPorMotorista || 66,
      pixPct: baseline?.gateway.pctPix || 50,
      taxaPix: baseline?.gateway.taxaPix || 1.19,
      taxaCard: baseline?.gateway.taxaCartao || 3.49,
      taxaImposto: baseline?.gateway.impostoSimples || 6.0,
      toggleReciboWaba: false,
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
        nCondutores: 35,
        fundadorCount: baseline?.motoristas.pagantes ?? 4,
        vitalicioCount: baseline?.motoristas.vitalicio ?? 1,
        pMensal: 45.0,
        pAnual: 450.0,
        anualPct: 40,
        mediaPassageiros: baseline?.passageiros.mediaPorMotorista || 66,
        toggleReciboWaba: true,
      }));
      setCosts(prev => prev.map(c => ({
        ...c,
        active: ['1', '2', '3', '4', '5'].includes(c.id),
      })));
    } else if (preset === 'escala') {
      setSimState(prev => ({
        ...prev,
        nCondutores: 100,
        fundadorCount: baseline?.motoristas.pagantes ?? 4,
        vitalicioCount: baseline?.motoristas.vitalicio ?? 1,
        pMensal: 49.90,
        pAnual: 499.0,
        anualPct: 50,
        mediaPassageiros: 70,
        toggleReciboWaba: true,
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
      fundadorCount,
      pFundador,
      pMensal,
      pAnual,
      mediaPassageiros,
      inadimplenciaPct,
      toggleReciboWaba,
      wabaUnitarioBrl,
      pixPct,
      taxaPix,
      taxaCard,
      taxaImposto,
      churnPct,
      cac,
    } = simState;

    const { totalFixos } = fixosData;

    const totalCondutores = Math.max(1, nCondutores);
    const condutoresVitalicios = Math.min(totalCondutores, Math.max(0, vitalicioCount));
    const condutoresFundadores = Math.min(Math.max(0, totalCondutores - condutoresVitalicios), Math.max(0, fundadorCount));
    const condutoresNovos = Math.max(0, totalCondutores - condutoresVitalicios - condutoresFundadores);

    const pctAnual = anualPct / 100;
    const condutoresNovosAnual = Math.round(condutoresNovos * pctAnual);
    const condutoresNovosMensal = condutoresNovos - condutoresNovosAnual;

    const pAnualMensalizado = pAnual / 12;

    const receitaNovosMensal = condutoresNovosMensal * pMensal;
    const receitaNovosAnual = condutoresNovosAnual * pAnualMensalizado;

    const isBaselineScenario = condutoresNovos === 0 && condutoresFundadores === (baseline?.motoristas.pagantes ?? 4);
    const receitaFundadores = isBaselineScenario && baseline?.receita?.mrrReal
      ? baseline.receita.mrrReal
      : condutoresFundadores * pFundador;

    const receitaBrutaMensal = receitaNovosMensal + receitaNovosAnual + receitaFundadores;

    const pctPix = pixPct / 100;
    const txPix = taxaPix / 100;
    const txCard = taxaCard / 100;
    const custoGateway = receitaBrutaMensal * (pctPix * txPix + (1 - pctPix) * txCard);
    const impostoSimples = receitaBrutaMensal * (taxaImposto / 100);

    const totalAlunos = isBaselineScenario && baseline?.passageiros?.notificaveis
      ? baseline.passageiros.notificaveis
      : (baseline?.passageiros?.notificaveis || 261) + (condutoresNovos * mediaPassageiros);

    const msgsD0 = totalAlunos;
    const msgsD3 = Math.round(totalAlunos * (inadimplenciaPct / 100));
    const msgsRecibo = toggleReciboWaba ? totalAlunos : 0;
    const msgsContrato = Math.round(totalAlunos / 12);

    const totalMsgsWaba = msgsD0 + msgsD3 + msgsRecibo + msgsContrato;
    const custoWabaMensal = totalMsgsWaba * wabaUnitarioBrl;
    const custoWabaD0 = msgsD0 * wabaUnitarioBrl;
    const custoWabaD3 = msgsD3 * wabaUnitarioBrl;
    const custoWabaRecibo = msgsRecibo * wabaUnitarioBrl;
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
    const ticketMedioPorPagante = condutoresPagantes > 0 ? receitaBrutaMensal / condutoresPagantes : 0;
    const margemContribuicaoPorCondutor = totalCondutores > 0 ? margemContribuicao / totalCondutores : 0;

    const breakEvenCondutores = margemContribuicaoPorCondutor > 0
      ? Math.ceil(totalFixos / margemContribuicaoPorCondutor)
      : 999;

    const txChurn = (churnPct || 3) / 100;
    const ltv = txChurn > 0 ? margemContribuicaoPorCondutor / txChurn : 0;
    const ltvToCac = cac > 0 ? ltv / cac : 0;

    const insights: CalculatorInsight[] = [];

    if (margemLiquidaPct >= 60) {
      insights.push({
        id: 'margem-alta',
        tipo: 'sucesso',
        titulo: `Excelente Margem Líquida (${margemLiquidaPct.toFixed(1)}%)`,
        descricao: `Sua operação possui alta eficiência. Para cada R$ 100 faturados, sobram R$ ${lucroLiquidoMensal > 0 ? margemLiquidaPct.toFixed(2) : '0'} limpos após pagar infraestrutura, WABA, gateway e impostos.`,
      });
    } else if (margemLiquidaPct < 0) {
      insights.push({
        id: 'margem-negativa',
        tipo: 'alerta',
        titulo: 'Operação em Fase de Validação / Investimento',
        descricao: `A receita atual dos ${totalCondutores} motoristas (R$ ${receitaBrutaMensal.toFixed(2)}) cobre R$ ${margemContribuicao.toFixed(2)} da infraestrutura de R$ ${totalFixos.toFixed(2)}. Com mais ${Math.max(1, breakEvenCondutores - totalCondutores)} motoristas a R$ ${pMensal.toFixed(2)}, você atinge o Break-Even.`,
      });
    }

    if (totalAlunos >= 1000) {
      insights.push({
        id: 'alerta-resend',
        tipo: 'alerta',
        titulo: 'Atenção ao Limite de E-mails Diários (Resend)',
        descricao: `Com ${totalAlunos.toLocaleString('pt-BR')} passageiros, os disparos de e-mail no dia 10 ultrapassam o limite gratuito diário de 100 e-mails. Ative o 'Resend Pro' na tabela de custos para provisionar os R$ 112/mês.`,
      });
    }

    insights.push({
      id: 'custo-waba-relativo',
      tipo: 'info',
      titulo: `Impacto do WABA: ${pctWabaSobreReceita.toFixed(1)}% do Faturamento`,
      descricao: `O custo do WhatsApp é de apenas R$ ${custoWabaPorCondutor.toFixed(2)} por motorista/mês (ou R$ ${custoWabaPorAluno.toFixed(3)} por aluno). É uma despesa extremamente sustentável.`,
    });

    if (toggleReciboWaba) {
      insights.push({
        id: 'recibo-ativo',
        tipo: 'estrategia',
        titulo: 'Comprovante WhatsApp Ativado',
        descricao: `O envio do recibo adiciona R$ ${(custoWabaRecibo).toFixed(2)}/mês no total (+R$ ${(custoWabaRecibo / totalCondutores).toFixed(2)} por motorista). Reduz o suporte e aumenta a percepção de valor pelos pais.`,
      });
    } else {
      insights.push({
        id: 'recibo-inativo',
        tipo: 'info',
        titulo: 'Comprovante via Push no App & E-mail',
        descricao: `O recibo é entregue gratuitamente por Push e E-mail. Reativar no WhatsApp custaria apenas R$ ${(totalAlunos * wabaUnitarioBrl).toFixed(2)}/mês a mais para toda a base.`,
      });
    }

    return {
      totalCondutores,
      condutoresVitalicios,
      condutoresFundadores,
      condutoresNovos,
      condutoresNovosMensal,
      condutoresNovosAnual,
      condutoresPagantes,
      ticketMedioPorPagante,
      pAnualMensalizado,
      receitaBrutaMensal,
      receitaNovosMensal,
      receitaNovosAnual,
      receitaFundadores,
      custoGateway,
      impostoSimples,
      totalAlunos,
      totalMsgsWaba,
      msgsD0,
      msgsD3,
      msgsRecibo,
      msgsContrato,
      custoWabaMensal,
      custoWabaD0,
      custoWabaD3,
      custoWabaRecibo,
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
      ltv,
      ltvToCac,
      totalFixos,
      insights,
    };
  }, [simState, fixosData, baseline]);

  const projectionChartData = useMemo<ProjectionMonthData[]>(() => {
    const data: ProjectionMonthData[] = [];
    const { growPct, churnPct, pMensal, pAnual, pFundador, pixPct, taxaPix, taxaCard, taxaImposto, mediaPassageiros, inadimplenciaPct, toggleReciboWaba, wabaUnitarioBrl } = simState;
    const { totalFixos } = fixosData;

    const pAmes = pAnual / 12;
    const pctAnual = (simState.anualPct || 40) / 100;
    const txChurn = (churnPct || 3) / 100;
    const txGrow = (growPct || 5) / 100;
    const pctPix = pixPct / 100;
    const txPix = taxaPix / 100;
    const txCard = taxaCard / 100;
    const txImp = taxaImposto / 100;

    let curNovos = Math.max(0, simState.nCondutores - simState.vitalicioCount - simState.fundadorCount);
    let curFundadores = simState.fundadorCount;
    let receitaAcumulada = 0;

    for (let m = 1; m <= 12; m++) {
      const novosAdicionados = Math.round((curNovos + curFundadores) * txGrow);
      curNovos = Math.max(0, curNovos - Math.round(curNovos * txChurn) + novosAdicionados);
      curFundadores = Math.max(0, curFundadores - Math.round(curFundadores * txChurn));

      const nAnual = Math.round(curNovos * pctAnual);
      const nMensal = curNovos - nAnual;
      const bruta = nMensal * pMensal + nAnual * pAmes + curFundadores * pFundador;

      const cGateway = bruta * (pctPix * txPix + (1 - pctPix) * txCard);
      const cImposto = bruta * txImp;

      const totalCond = curNovos + curFundadores + simState.vitalicioCount;
      const alunos = (baseline?.passageiros?.notificaveis || 261) + (curNovos * mediaPassageiros);
      const msgs = alunos + Math.round(alunos * (inadimplenciaPct / 100)) + (toggleReciboWaba ? alunos : 0) + Math.round(alunos / 12);
      const cWaba = msgs * wabaUnitarioBrl;

      const cTotais = totalFixos + cGateway + cImposto + cWaba;
      const lucro = bruta - cTotais;
      receitaAcumulada += bruta;

      data.push({
        mes: `Mês ${m}`,
        condutores: totalCond,
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
