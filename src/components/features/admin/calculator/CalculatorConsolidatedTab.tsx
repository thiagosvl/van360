import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, Users, Target, Activity, Lightbulb, Layers, BadgeDollarSign } from "lucide-react";

export function CalculatorConsolidatedTab({ calcHook }: { calcHook: any }) {
  const {
    consolidatedState,
    updateConsolidated,
    fixosData,
    consolidatedCalculations,
    consolidatedChartData,
    baseCalculations
  } = calcHook;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const {
    brutaBase, brutaAddon, brutaTotal,
    custosTotal, lucroTotal, margem, rpc, arpu,
    bBarPct, lucroBase, lucroAddon,
    fpix, fcard, impBase, impAddon, splitCust
  } = consolidatedCalculations;
  
  const { churnSensitivity } = calcHook;

  const isProfit = lucroTotal >= 0;

  const cardStyle = "bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300";

  return (
    <div className="space-y-8">
      
      {/* 4 Metrics Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-primary`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Bruta Total</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><Layers className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(brutaTotal)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Assinatura + Add-on</span>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-orange-500`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custos Totais</span>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md"><Activity className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(custosTotal)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Todos os blocos consolidados</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 ${isProfit ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lucro Líquido Total</span>
                <div className={`p-1.5 rounded-md ${isProfit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <span className={`text-2xl lg:text-3xl font-black tracking-tight ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(lucroTotal)}
              </span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Margem global: {margem.toFixed(1)}%</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className={`${cardStyle} border-l-4 border-l-slate-500`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ticket Médio (ARPU)</span>
                <div className="p-1.5 bg-slate-50 text-slate-600 rounded-md"><BadgeDollarSign className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(arpu)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Faturamento médio por condutor</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Contribuição por Bloco */}
        <Card className={cardStyle}>
          <CardHeader className="pb-4 border-b border-slate-100/50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><Target className="w-5 h-5" /></div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800">Composição de Lucro</CardTitle>
                <CardDescription>Entenda a origem do resultado final.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Assinatura</div>
                <div className="text-2xl font-black text-primary">{formatCurrency(lucroBase)}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">
                  {brutaTotal > 0 ? (brutaBase / brutaTotal * 100).toFixed(1) : 0}% da receita
                </div>
              </div>
              <div className="bg-white/60 p-4 rounded-xl border border-slate-200/50 shadow-sm">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Add-on</div>
                <div className="text-2xl font-black text-orange-600">{formatCurrency(lucroAddon)}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">
                  {brutaTotal > 0 ? (brutaAddon / brutaTotal * 100).toFixed(1) : 0}% da receita
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Mix de Receita</span>
              </div>
              <div className="h-3 w-full rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${bBarPct}%` }} />
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${100 - bBarPct}%` }} />
              </div>
              <div className="flex gap-4 text-xs font-medium text-slate-600 mt-3 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[3px] bg-primary shadow-sm" />
                  <span>Assinatura ({bBarPct.toFixed(1)}%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-[3px] bg-orange-500 shadow-sm" />
                  <span>Add-on ({(100 - bBarPct).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento consolidado */}
        <Card className={cardStyle}>
          <CardHeader className="pb-3 border-b border-slate-100/50">
            <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">Demonstrativo de Resultado (DRE Mensal)</CardTitle>
            <CardDescription className="text-xs mt-1">Resumo consolidado de todas as entradas e saídas.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm p-5 bg-gradient-to-b from-transparent to-slate-50/50 rounded-b-xl">
            <div className="flex justify-between py-1 text-slate-600 font-medium">
              <span>Receita Assinatura</span>
              <span>{formatCurrency(brutaBase)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-600 font-medium">
              <span>Receita Add-on</span>
              <span>{formatCurrency(brutaAddon)}</span>
            </div>
            <div className="flex justify-between py-2 border-t font-bold text-slate-800">
              <span>Receita Bruta Total</span>
              <span>{formatCurrency(brutaTotal)}</span>
            </div>
            
            <div className="my-2 border-t border-dashed border-slate-200" />
            
            <div className="flex justify-between py-1 text-slate-500">
              <span>Gateways (Pix + Cartão)</span>
              <span className="text-rose-600 font-medium">-{formatCurrency(fpix + fcard)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-500">
              <span>Custo Split (Add-on)</span>
              <span className="text-rose-600 font-medium">-{formatCurrency(splitCust)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-500">
              <span>Impostos Unificados</span>
              <span className="text-rose-600 font-medium">-{formatCurrency(impBase + impAddon)}</span>
            </div>
            <div className="flex justify-between py-1 text-slate-500">
              <span>Custos Operacionais Fixos</span>
              <span className="text-rose-600 font-medium">-{formatCurrency(fixosData.totalFixos)}</span>
            </div>
            <div className="my-1 border-t border-slate-200" />
            <div className="flex justify-between py-2 font-black text-lg">
              <span className="text-slate-800">Lucro Líquido Total</span>
              <span className={isProfit ? "text-emerald-600" : "text-rose-600"}>
                {formatCurrency(lucroTotal)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensibilidade do Churn (Hero Panel) */}
      <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
        <Card className={`${cardStyle} bg-primary border-none overflow-hidden relative shadow-xl`}>
          {/* Decorative background circles */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-40 -bottom-20 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
          
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 justify-between items-center">
              <div className="space-y-2 flex-1">
                <BadgeDollarSign className="w-8 h-8 text-primary-foreground/80 mb-4" />
                <h3 className="text-xl font-black text-primary-foreground tracking-tight">O Poder da Retenção (12 Meses)</h3>
                <p className="text-primary-foreground/80 text-sm max-w-md">
                  Reduzir o churn é a alavanca de crescimento mais barata de um SaaS. Veja o impacto financeiro projetado ao reduzir o cancelamento em apenas 1%.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-[2] w-full">
                <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/10">
                  <p className="text-xs font-medium text-primary-foreground/80 uppercase tracking-wider mb-2">Lucro Projetado (Atual)</p>
                  <p className="text-3xl font-black text-white">{formatCurrency(churnSensitivity.currentProfit)}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-md p-5 rounded-xl border border-emerald-400/30 shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]">
                  <p className="text-xs font-medium text-emerald-200 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Lucro com Cancelamento a {churnSensitivity.improvedChurn}%
                  </p>
                  <p className="text-3xl font-black text-emerald-400 mb-1">{formatCurrency(churnSensitivity.improvedProfit)}</p>
                  <p className="text-xs font-bold text-emerald-300">Ganho adicional de +{formatCurrency(churnSensitivity.difference)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Projeção */}
      <Card className={cardStyle}>
        <CardHeader className="pb-6 border-b border-slate-100/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Projeção Consolidada (12 Meses)</CardTitle>
              <CardDescription>Evolução do Lucro Líquido empilhando os dois blocos de receita.</CardDescription>
            </div>
            <div className="flex gap-6 items-center">
              <div className="space-y-1.5 w-40">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Cresc. base</span>
                  <span className="text-primary">+{consolidatedState.growPct}%/mês</span>
                </div>
                <Slider value={[consolidatedState.growPct]} min={0} max={30} step={1} onValueChange={(v) => updateConsolidated('growPct', v[0])} />
              </div>
              <div className="space-y-1.5 w-40">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Adesão ao Add-on</span>
                  <span className="text-primary">{consolidatedState.addonPct}%</span>
                </div>
                <Slider value={[consolidatedState.addonPct]} min={0} max={100} step={5} onValueChange={(v) => updateConsolidated('addonPct', v[0])} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consolidatedChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3a5c" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1a3a5c" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAddon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} tickFormatter={(val) => `R$${val}`} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 500 }} />
                <Area type="monotone" dataKey="base" name="Lucro Assinatura" stackId="1" stroke="#1a3a5c" strokeWidth={3} fill="url(#colorBase)" activeDot={{ r: 6, strokeWidth: 0 }} />
                <Area type="monotone" dataKey="addon" name="Lucro Add-on" stackId="1" stroke="#f97316" strokeWidth={3} fill="url(#colorAddon)" activeDot={{ r: 6, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Diagnóstico da Operação */}
      <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <Card className={`${cardStyle} border-l-4 border-l-amber-500 overflow-hidden relative`}>
          <div className="absolute right-0 top-0 w-32 h-32 bg-amber-100/40 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          <CardHeader className="pb-3 border-b border-slate-100/50 relative z-10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><Lightbulb className="w-5 h-5" /></div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Diagnóstico Inteligente</CardTitle>
                <CardDescription>O que estes números significam para o seu negócio na prática.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* LTV/CAC Diagnostic */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${baseCalculations.ltvToCac >= 3 ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  Eficiência de Vendas (LTV : CAC)
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {baseCalculations.ltvToCac >= 3 
                    ? `Sua máquina de aquisição é muito saudável! Para cada R$ 1 gasto em marketing (CAC), o cliente deixa R$ ${baseCalculations.ltvToCac.toFixed(1)} de lucro bruto (LTV) ao longo do tempo.` 
                    : `Cuidado: O mercado ideal recomenda que o cliente deixe pelo menos 3x mais lucro (LTV) do que o custo de aquisição (CAC). Atualmente está em ${baseCalculations.ltvToCac.toFixed(1)}x. Considere reduzir o CAC (marketing) ou diminuir o cancelamento (Churn) para segurar o cliente mais tempo.`}
                </p>
              </div>

              {/* Margem Diagnostic */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${!isProfit ? 'bg-rose-500' : baseCalculations.margem >= 20 ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  Saúde Financeira e Margem
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {!isProfit 
                    ? `Prejuízo no fluxo atual. O lucro de assinaturas não consegue pagar os Custos Fixos (R$ ${fixosData.totalFixos.toFixed(2)}). Você precisaria chegar a ${baseCalculations.beInt} motoristas para empatar (Break-even).` 
                    : baseCalculations.margem >= 20 
                      ? `Sua operação base tem uma excelente rentabilidade de ${baseCalculations.margem.toFixed(1)}%. Ela tem fôlego suficiente para absorver surpresas e investir em crescimento agressivo.`
                      : `Sua margem base de ${baseCalculations.margem.toFixed(1)}% está apertada. É um negócio sustentável no momento, mas qualquer solavanco nos custos fixos ou queda brusca de clientes pode te levar ao vermelho.`}
                </p>
              </div>

              {/* Add-on Diagnostic */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${bBarPct < 100 ? 'bg-orange-500' : 'bg-slate-300'}`}></span>
                  Poder do Add-on (Taxas)
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {bBarPct < 100 
                    ? `O Add-on é uma máquina oculta. Mesmo com apenas ${(100 - bBarPct).toFixed(1)}% da receita bruta vindo dele, o Add-on tem um potencial gigante porque as taxas são transacionais. Se você incentivar a adesão dos motoristas e passageiros, esse número ultrapassa facilmente a receita da assinatura mensal.` 
                    : `Você não está extraindo dinheiro do Add-on. Com isso, todo o seu faturamento depende unicamente de convencer os motoristas a pagarem a assinatura, deixando dinheiro na mesa nas transações diárias dos passageiros.`}
                </p>
              </div>

            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}
