import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";
import { motion } from "framer-motion";
import {
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  Database,
  MessageSquare,
  Server,
  Plus,
  Trash2,
  Sparkles,
  Zap,
} from "lucide-react";
import { CATEGORY_LABELS, CostCategory, CostPeriod } from "@/hooks/business/admin/useAdminCalculator";

export function CalculatorBaseTab({ calcHook }: { calcHook: any }) {
  const {
    baseline,
    isBaselineLoading,
    simState,
    updateSim,
    applyPreset,
    costs,
    addCost,
    updateCost,
    toggleCostActive,
    removeCost,
    fixosData,
    calculations,
  } = calcHook;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const {
    totalCondutores,
    condutoresVitalicios,
    condutoresFundadores,
    condutoresNovos,
    condutoresNovosMensal,
    condutoresNovosAnual,
    receitaBrutaMensal,
    custosOperacionaisTotais,
    lucroLiquidoMensal,
    margemLiquidaPct,
    breakEvenCondutores,
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
    pAnualMensalizado,
  } = calculations;

  const isProfit = lucroLiquidoMensal >= 0;
  const cardStyle = "bg-[#131b2e] border border-slate-800/80 shadow-2xl text-slate-100 rounded-[1.5rem]";

  return (
    <div className="space-y-8">
      {/* 1. Baseline Vivo (Dados Reais do Banco) */}
      <div className="bg-slate-900/90 border border-blue-500/30 rounded-[1.5rem] p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-black text-lg text-white">Baseline Real da Produção</h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px]">
                  Online & Sincronizado
                </Badge>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Métricas reais sincronizadas com o banco de dados.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
              onClick={() => applyPreset("atual")}
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-blue-400" />
              Cenário Atual Real
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
              onClick={() => applyPreset("crescimento")}
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Crescimento (35 vans)
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-800 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 text-xs"
              onClick={() => applyPreset("escala")}
            >
              <TrendingUp className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Escala (100 vans)
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Motoristas Ativos
            </span>
            <span className="text-xl font-black text-white">
              {isBaselineLoading ? "..." : baseline?.motoristas.ativos ?? 5}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {baseline?.motoristas.pagantes ?? 4} Pagantes ({baseline?.motoristas.anual ?? 2}A/{baseline?.motoristas.mensal ?? 2}M) · {baseline?.motoristas.vitalicio ?? 1} Vit.
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Passageiros
            </span>
            <span className="text-xl font-black text-white">
              {isBaselineLoading ? "..." : baseline?.passageiros.notificaveis ?? 259}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              {baseline?.passageiros.total ?? 268} totais ({baseline?.passageiros.ativos ?? 266} ativos)
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Média Alunos/Van
            </span>
            <span className="text-xl font-black text-white">
              {isBaselineLoading ? "..." : `${baseline?.passageiros.mediaPorMotorista ?? 67} alunos`}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">Vans em rota ativa</span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Msgs WABA (Mês)
            </span>
            <span className="text-xl font-black text-blue-400">
              {isBaselineLoading ? "..." : baseline?.waba.totalMensagensMes ?? 74}
            </span>
            <span className="text-[10px] text-slate-400 block mt-1">
              ≈ {formatCurrency(baseline?.waba.custoEstimadoBrl ?? 2.81)}
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Taxa Pix / Cartão
            </span>
            <span className="text-xl font-black text-white">1,19% / 3,49%</span>
            <span className="text-[10px] text-slate-400 block mt-1">
              Pix: {baseline?.gateway.pctPix ?? 50}% · Cartão: {baseline?.gateway.pctCartao ?? 50}%
            </span>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Custos Fixos Atuais
            </span>
            <span className="text-xl font-black text-orange-400">{formatCurrency(fixosData.totalFixos)}</span>
            <span className="text-[10px] text-slate-400 block mt-1">VPS + Google + Domínio</span>
          </div>
        </div>
      </div>

      {/* 2. Hero KPIs da Simulação */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-blue-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Receita Bruta Simulada</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md border border-blue-500/20">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(receitaBrutaMensal)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                {totalCondutores} condutores · {totalAlunos} passageiros
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-orange-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Custos Operacionais</span>
                <div className="p-1.5 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {formatCurrency(custosOperacionaisTotais)}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">
                Fixos ({formatCurrency(fixosData.totalFixos)}) + WABA + Gateway
              </span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 ${isProfit ? "border-l-emerald-500" : "border-l-red-500"}`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lucro Líquido Projetado</span>
                <div
                  className={`p-1.5 rounded-md border ${
                    isProfit
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className={`text-2xl lg:text-3xl font-black tracking-tight ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(lucroLiquidoMensal)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant={isProfit ? "default" : "destructive"}
                  className={isProfit ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : ""}
                >
                  {margemLiquidaPct.toFixed(1)}% margem líquida
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${cardStyle} border-l-4 border-l-slate-500`}>
            <CardContent className="p-5 flex flex-col justify-center text-left">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ponto de Equilíbrio</span>
                <div className="p-1.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-white tracking-tight">
                {breakEvenCondutores < 500 ? `${breakEvenCondutores} motoristas` : "—"}
              </span>
              <span className="text-xs text-slate-400 mt-2 font-medium">Necessários para cobrir os custos fixos</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 3. Controles da Simulação */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco A: Condutores & Precificação */}
        <Card className={cardStyle}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold text-white">Escala de Condutores & Preço</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Projeção de base de assinantes e regra de 2 meses grátis no plano anual.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">Total de Condutores Simulados</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    value={simState.nCondutores}
                    onChange={(e) => updateSim("nCondutores", Math.max(1, Number(e.target.value) || 1))}
                    className="w-20 h-8 bg-slate-900 border-slate-700 text-white font-black text-center text-xs"
                  />
                  <span className="text-xs text-slate-400 font-semibold">motoristas</span>
                </div>
              </div>
              <Slider
                value={[simState.nCondutores]}
                min={1}
                max={200}
                step={1}
                onValueChange={([val]) => updateSim("nCondutores", val)}
              />
              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                <span>{condutoresVitalicios} Vitalício · {condutoresFundadores} Fundadores</span>
                <span className="text-blue-400 font-semibold">
                  {condutoresNovos} Novos Pagantes ({condutoresNovosAnual} Anual / {condutoresNovosMensal} Mensal)
                </span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">Divisão do Plano Anual (10x)</span>
                <span className="text-sm font-black text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {simState.anualPct}% Anual / {100 - simState.anualPct}% Mensal
                </span>
              </div>
              <Slider
                value={[simState.anualPct]}
                min={0}
                max={100}
                step={5}
                onValueChange={([val]) => updateSim("anualPct", val)}
              />
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Preço Mensal Sugerido
                </label>
                <div className="flex gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 text-xs border-slate-800 ${simState.pMensal === 39.9 ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-300'}`}
                    onClick={() => updateSim("pMensal", 39.9)}
                  >
                    R$ 39,90
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 text-xs border-slate-800 ${simState.pMensal === 45.0 ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-300'}`}
                    onClick={() => updateSim("pMensal", 45.0)}
                  >
                    R$ 45,00
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`h-7 px-2 text-xs border-slate-800 ${simState.pMensal === 49.9 ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-300'}`}
                    onClick={() => updateSim("pMensal", 49.9)}
                  >
                    R$ 49,90
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <AdminMoneyInput
                    value={simState.pMensal}
                    onChange={(val) => updateSim("pMensal", val)}
                    className="bg-slate-900 border-slate-800 text-white font-bold"
                  />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-slate-200 font-bold text-sm flex flex-col justify-center">
                  <span>{formatCurrency(simState.pAnual)} <span className="text-[10px] text-slate-400">/ ano</span></span>
                  <span className="text-[10px] text-emerald-400 font-normal">
                    {formatCurrency(pAnualMensalizado)}/mês (2 meses grátis)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">
                  Condutores Fundadores (R$ 25)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={simState.fundadorCount}
                  onChange={(e) => updateSim("fundadorCount", Math.max(0, Number(e.target.value) || 0))}
                  className="bg-slate-900 border-slate-800 text-white font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Condutores Vitalícios (R$ 0)</label>
                <Input
                  type="number"
                  min={0}
                  value={simState.vitalicioCount}
                  onChange={(e) => updateSim("vitalicioCount", Math.max(0, Number(e.target.value) || 0))}
                  className="bg-slate-900 border-slate-800 text-white font-medium"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bloco B: Passageiros, Mensageria & WABA */}
        <Card className={cardStyle}>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold text-white">Passageiros & Custos WABA</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Disparos de cobrança D-0, D+3 e comprovante de pagamento no WhatsApp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">Média de Passageiros por Motorista</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={5}
                    max={150}
                    value={simState.mediaPassageiros}
                    onChange={(e) => updateSim("mediaPassageiros", Math.max(5, Number(e.target.value) || 5))}
                    className="w-20 h-8 bg-slate-900 border-slate-700 text-white font-black text-center text-xs"
                  />
                  <span className="text-xs text-slate-400 font-semibold">alunos/van</span>
                </div>
              </div>
              <Slider
                value={[simState.mediaPassageiros]}
                min={10}
                max={120}
                step={1}
                onValueChange={([val]) => updateSim("mediaPassageiros", val)}
              />
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                Total projetado: <strong className="text-white">{simState.nCondutores} vans × {simState.mediaPassageiros} alunos = {totalAlunos.toLocaleString("pt-BR")} passageiros</strong> na base ativa.
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-300">Inadimplência estimada após D+3</span>
                <span className="text-sm font-black text-white bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  {simState.inadimplenciaPct}% dos alunos
                </span>
              </div>
              <Slider
                value={[simState.inadimplenciaPct]}
                min={0}
                max={100}
                step={5}
                onValueChange={([val]) => updateSim("inadimplenciaPct", val)}
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Pais que atrasam além de 3 dias e recebem a 2ª cobrança WABA.
              </span>
            </div>

            {/* Toggle Comprovante WABA com Alto Contraste */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Enviar Comprovante de Pagamento via WABA</span>
                  {simState.toggleReciboWaba ? (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px]">Ativado no WhatsApp</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-600 text-[10px]">
                      Apenas Push & E-mail (Grátis)
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dispara +1 mensagem WABA (R$ 0,038) quando o motorista dá baixa na parcela.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={simState.toggleReciboWaba}
                  onCheckedChange={(checked) => updateSim("toggleReciboWaba", checked)}
                  className="data-[state=unchecked]:bg-slate-700 data-[state=unchecked]:border-slate-500 data-[state=checked]:bg-blue-600 border border-slate-600 [&>span]:bg-white shadow-md"
                />
              </div>
            </div>

            {/* Resumo do WABA */}
            <div className="space-y-2 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Volume WABA/mês</span>
                  <span className="text-base font-black text-white">{totalMsgsWaba.toLocaleString("pt-BR")} msgs</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Custo WABA Total</span>
                  <span className="text-base font-black text-orange-400">{formatCurrency(custoWabaMensal)}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Custo por Motorista</span>
                  <span className="text-base font-black text-emerald-400">{formatCurrency(custoWabaPorCondutor)}/mês</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <span>D-0: <strong className="text-slate-200">{msgsD0} ({formatCurrency(custoWabaD0)})</strong></span>
                <span>D+3: <strong className="text-slate-200">{msgsD3} ({formatCurrency(custoWabaD3)})</strong></span>
                <span>Recibos: <strong className="text-slate-200">{msgsRecibo} ({formatCurrency(custoWabaRecibo)})</strong></span>
                <span>Contratos: <strong className="text-slate-200">{msgsContrato} ({formatCurrency(custoWabaContrato)})</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Tabela de Custos Fixos & Degraus de Escala com Alto Contraste */}
      <Card className={cardStyle}>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-400" />
              <CardTitle className="text-base font-bold text-white">Custos Fixos & Degraus de Infraestrutura</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Ative ou desative serviços para simular o momento de upgrade para planos pagos (Resend Pro, Supabase Pro, Contabilidade).
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-semibold text-slate-400 block">Total Fixo Ativo</span>
              <span className="text-sm font-black text-white">{formatCurrency(fixosData.totalFixos)}/mês</span>
            </div>
            <Button size="sm" onClick={addCost} className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Custo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2 w-28">Status</th>
                  <th className="pb-3">Descrição do Serviço / Infra</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Período</th>
                  <th className="pb-3">Valor (R$)</th>
                  <th className="pb-3 text-right pr-2">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {costs.map((cost: any) => (
                  <tr key={cost.id} className={`transition-colors ${cost.active ? "bg-slate-900/40" : "bg-slate-950/40 opacity-50"}`}>
                    <td className="py-3 pl-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cost.active}
                          onCheckedChange={() => toggleCostActive(cost.id)}
                          className="data-[state=unchecked]:bg-slate-700 data-[state=unchecked]:border-slate-500 data-[state=checked]:bg-blue-600 border border-slate-600 [&>span]:bg-white shadow-md"
                        />
                        <span className={`text-[11px] font-bold ${cost.active ? "text-emerald-400" : "text-slate-500"}`}>
                          {cost.active ? "Ativo" : "Off"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Input
                        value={cost.name}
                        onChange={(e) => updateCost(cost.id, "name", e.target.value)}
                        className="bg-slate-900 border-slate-700 text-white h-9 text-xs"
                      />
                    </td>
                    <td className="py-3 pr-4 w-48">
                      <Select
                        value={cost.cat}
                        onValueChange={(val: CostCategory) => updateCost(cost.id, "cat", val)}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="infra">{CATEGORY_LABELS.infra}</SelectItem>
                          <SelectItem value="fiscal">{CATEGORY_LABELS.fiscal}</SelectItem>
                          <SelectItem value="mensageria">{CATEGORY_LABELS.mensageria}</SelectItem>
                          <SelectItem value="outro">{CATEGORY_LABELS.outro}</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 pr-4 w-36">
                      <Select
                        value={cost.period}
                        onValueChange={(val: CostPeriod) => updateCost(cost.id, "period", val)}
                      >
                        <SelectTrigger className="bg-slate-900 border-slate-700 text-white h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="anual">Anual (diluído)</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-3 pr-4 w-40">
                      <AdminMoneyInput
                        value={cost.val}
                        onChange={(val) => updateCost(cost.id, "val", val)}
                        className="bg-slate-900 border-slate-700 text-white h-9 text-xs font-bold"
                      />
                    </td>
                    <td className="py-3 text-right pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCost(cost.id)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
