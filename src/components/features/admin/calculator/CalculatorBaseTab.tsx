import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalculatorFixedCosts } from "./CalculatorFixedCosts";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TrendingUp, Users, DollarSign, Target, Activity } from "lucide-react";

export function CalculatorBaseTab({ calcHook }: { calcHook: any }) {
  const {
    baseState,
    updateBase,
    costs,
    addCost,
    updateCost,
    removeCost,
    fixosData,
    baseCalculations,
    baseChartData,
    consolidatedState,
    updateConsolidated
  } = calcHook;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const {
    nNMes, nNAnual, totalCond, ticketMedio,
    recNMes, recNAnual, recF, bruta,
    fpix, fcard, imp, custos, lucro, margem, beInt, pAmes,
    ltv, ltvToCac
  } = baseCalculations;

  const isProfit = lucro >= 0;
  const breakEvenPct = beInt < 500 ? Math.min(100, (totalCond / beInt) * 100) : 100;

  const cardStyle = "bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300";

  return (
    <div className="space-y-8">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-primary`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Bruta</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><DollarSign className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(bruta)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">{totalCond} condutores ativos</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-orange-500`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custos Operacionais</span>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md"><Activity className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(custos)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Fixos + Variáveis + Impostos</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 ${isProfit ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido</span>
                <div className={`p-1.5 rounded-md ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className={`text-2xl lg:text-3xl font-black tracking-tight ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(lucro)}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={isProfit ? "default" : "destructive"} className={isProfit ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" : ""}>
                  {margem.toFixed(1)}% margem
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${cardStyle} border-l-4 border-l-slate-500`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ponto de Equilíbrio</span>
                <div className="p-1.5 bg-slate-50 text-slate-600 rounded-md"><Target className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{beInt < 500 ? beInt : '—'}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Condutores necessários</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Operação e Precificação */}
        <div className="space-y-6">
          <Card className={cardStyle}>
            <CardHeader className="pb-4 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Users className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Motor de Aquisição</CardTitle>
                  <CardDescription>Configure a base de clientes e preços.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Sliders */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Plano Normal (qtd)</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{baseState.nN}</span>
                  </div>
                  <Slider value={[baseState.nN]} min={0} max={200} step={1} onValueChange={(v) => updateBase('nN', v[0])} className="py-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Condições Especiais / Desconto (qtd)</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{baseState.nF}</span>
                  </div>
                  <Slider value={[baseState.nF]} min={0} max={50} step={1} onValueChange={(v) => updateBase('nF', v[0])} className="py-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">% Optantes pelo Plano Anual</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{baseState.anualPct}%</span>
                  </div>
                  <Slider value={[baseState.anualPct]} min={0} max={100} step={5} onValueChange={(v) => updateBase('anualPct', v[0])} className="py-1" />
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              {/* Inputs */}
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">Mensalidade Normal</span>
                  <AdminMoneyInput className="w-[130px] font-semibold" value={baseState.pN} onChange={(v) => updateBase('pN', v)} />
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700">Plano Anual</span>
                    <span className="text-[10px] text-slate-400 font-medium">≈ {formatCurrency(pAmes)}/mês eq.</span>
                  </div>
                  <AdminMoneyInput className="w-[130px] font-semibold" value={baseState.pA} onChange={(v) => updateBase('pA', v)} />
                </div>
                <div className="flex justify-between items-center gap-4">
                  <span className="text-sm font-medium text-slate-700">Preço Especial (Desconto)</span>
                  <AdminMoneyInput className="w-[130px] font-semibold" value={baseState.pF} onChange={(v) => updateBase('pF', v)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyle}>
            <CardHeader className="pb-4 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Taxas e Retenção</CardTitle>
                  <CardDescription>Configurações de churn e conversão.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Churn mensal (%)</span>
                    <span className="text-[10px] text-slate-400">Taxa de cancelamento</span>
                  </div>
                  <Input type="number" className="w-[100px] bg-white" value={baseState.churn} onChange={e => updateBase('churn', parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">CAC - Custo de Aquisição (R$)</span>
                    <span className="text-[10px] text-slate-400">Custo de marketing/vendas por novo cliente</span>
                  </div>
                  <AdminMoneyInput className="w-[120px] bg-white" value={baseState.cac} onChange={(v) => updateBase('cac', v)} />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">% pagando via Pix</span>
                    <span className="font-medium text-slate-700">{baseState.pixPct}%</span>
                  </div>
                  <Slider value={[baseState.pixPct]} min={0} max={100} step={5} onValueChange={(v) => updateBase('pixPct', v[0])} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Taxa Pix (%)</label>
                    <Input type="number" className="h-8 mt-1 bg-white text-xs" value={baseState.tPix} onChange={e => updateBase('tPix', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Taxa Cartão (%)</label>
                    <Input type="number" className="h-8 mt-1 bg-white text-xs" value={baseState.tCard} onChange={e => updateBase('tCard', parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Imposto (%)</label>
                    <Input type="number" className="h-8 mt-1 bg-white text-xs" value={baseState.tImp} onChange={e => updateBase('tImp', parseFloat(e.target.value) || 0)} />
                  </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cardStyle}>
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Fluxo Financeiro (Waterfall)
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Visão detalhada de como a receita se transforma em lucro.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm p-5 bg-gradient-to-b from-transparent to-slate-50/50 rounded-b-xl">
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-800">Receita Bruta Total</span>
                <span className="text-slate-900">{formatCurrency(bruta)}</span>
              </div>

              <div className="my-1 border-t border-dashed border-slate-200" />

              <div className="flex justify-between py-1 text-slate-500">
                <span>Imposto ({baseState.tImp.toFixed(1)}%)</span>
                <span className="text-rose-600 font-medium">-{formatCurrency(imp)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Taxas Gateway</span>
                <span className="text-rose-600 font-medium">-{formatCurrency(fpix + fcard)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Custos Fixos da Operação</span>
                <span className="text-rose-600 font-medium">-{formatCurrency(fixosData.totalFixos)}</span>
              </div>

              <div className="my-1 border-t border-slate-200" />

              <div className="flex justify-between py-2 font-black text-base">
                <span className="text-slate-800">Lucro Líquido Real</span>
                <span className={isProfit ? "text-emerald-600" : "text-rose-600"}>
                  {formatCurrency(lucro)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyle}>
            <CardHeader className="pb-4 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Activity className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Custos Fixos</CardTitle>
                  <CardDescription>Gerencie suas despesas mensais e anuais operacionais.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <CalculatorFixedCosts
                costs={costs}
                addCost={addCost}
                updateCost={updateCost}
                removeCost={removeCost}
                totalFixos={fixosData.totalFixos}
                totalFixosAnual={fixosData.totalFixosAnual}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LTV & Break-even Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className={`${cardStyle} bg-gradient-to-br from-primary/5 to-slate-50/80 border-primary/20`}>
            <CardContent className="p-6 flex flex-col justify-center h-full relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 text-primary">
                <Target className="w-32 h-32" />
              </div>
              <span className="text-xs font-bold text-primary uppercase mb-2 tracking-widest z-10">LTV - Lifetime Value</span>
              <span className="text-3xl font-black text-primary mb-1 z-10">{formatCurrency(ltv)}</span>
              <span className="text-xs text-primary/70 font-medium z-10">Lucro total que o cliente deixa ao longo do tempo</span>

              <div className="mt-4 pt-4 border-t border-primary/20 z-10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-primary">Proporção LTV : CAC</span>
                  <Badge variant="outline" className={`border-transparent text-white ${ltvToCac >= 3 ? 'bg-emerald-500' : 'bg-orange-500'}`}>
                    {ltvToCac.toFixed(1)}x
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyle}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Ponto de Equilíbrio (Break-even)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex justify-between items-end">
                <div>
                  <span className="text-2xl font-black text-slate-800">{totalCond}</span>
                  <span className="text-xs text-slate-500 ml-1 font-medium">ativos</span>
                </div>
                {isProfit ? (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold">Alcançado</Badge>
                ) : (
                  <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 font-bold">Faltam {beInt - totalCond}</Badge>
                )}
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-1000 ease-out ${isProfit ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-rose-400 to-rose-500'}`}
                  style={{ width: `${breakEvenPct}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>Zero</span>
                <span>{beInt < 500 ? `${beInt} para empatar` : '—'}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projeção Área */}
        <Card className={cardStyle}>
          <CardHeader className="pb-4 border-b border-slate-100/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Projeção Base (12 Meses)</CardTitle>
              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-medium">
                Cresc. Total Considerado
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={baseChartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorLucro" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPrej" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }} tickFormatter={(val) => `R$${val}`} axisLine={false} tickLine={false} dx={-10} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lucro"
                    stroke={isProfit ? "#10b981" : "#f43f5e"}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={isProfit ? "url(#colorLucro)" : "url(#colorPrej)"}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
