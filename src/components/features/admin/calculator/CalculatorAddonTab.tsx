import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Users, DollarSign, Puzzle, TrendingUp, Percent } from "lucide-react";

export function CalculatorAddonTab({ calcHook }: { calcHook: any }) {
  const { addonState, updateAddon, addonCalculations } = calcHook;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const {
    totalPass, brutaTotal, splitCust, imp, lucro, margem,
    rb1, sc1, imp1, ll1, mpp, condAbs
  } = addonCalculations;

  const isProfit = lucro >= 0;

  const cardStyle = "bg-white/80 backdrop-blur-md border-slate-200/60 shadow-sm hover:shadow-md transition-shadow duration-300";

  return (
    <div className="space-y-8">
      {/* Hero KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className={`${cardStyle} border-l-4 border-l-primary`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Passageiros (Recorrentes)</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><Users className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{totalPass.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Nas rotas ativas</span>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className={`${cardStyle} border-l-4 border-l-primary`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receita Bruta (Add-on)</span>
                <div className="p-1.5 bg-primary/10 text-primary rounded-md"><DollarSign className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(brutaTotal)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Faturamento total</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className={`${cardStyle} border-l-4 border-l-orange-500`}>
            <CardContent className="p-5 flex flex-col justify-center">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Custo Split Pag.</span>
                <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md"><Percent className="w-4 h-4" /></div>
              </div>
              <span className="text-2xl lg:text-3xl font-black text-slate-800 tracking-tight">{formatCurrency(splitCust)}</span>
              <span className="text-xs text-slate-500 mt-2 font-medium">Repassado ao Gateway</span>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
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
              <span className="text-xs text-slate-500 mt-2 font-medium">Margem {margem.toFixed(1)}%</span>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settings */}
        <div className="space-y-6">
          <Card className={cardStyle}>
            <CardHeader className="pb-4 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><Puzzle className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Motor do Add-on</CardTitle>
                  <CardDescription>Taxa por passageiro rastreado.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Condutores c/ Add-on Ativo</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{addonState.nc}</span>
                  </div>
                  <Slider value={[addonState.nc]} min={0} max={200} step={1} onValueChange={(v) => updateAddon('nc', v[0])} className="py-1" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">Média de passageiros (por condutor)</span>
                    <span className="font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">{addonState.pass}</span>
                  </div>
                  <Slider value={[addonState.pass]} min={0} max={150} step={1} onValueChange={(v) => updateAddon('pass', v[0])} className="py-1" />
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full" />

              <div className="flex justify-between items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Preço do Add-on (R$/pass.)</span>
                <AdminMoneyInput className="w-[130px] font-semibold" value={addonState.preco} onChange={(v) => updateAddon('preco', v)} />
              </div>
            </CardContent>
          </Card>

          <Card className={cardStyle}>
            <CardHeader className="pb-4 border-b border-slate-100/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 text-primary rounded-lg"><DollarSign className="w-5 h-5" /></div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-800">Split & Impostos</CardTitle>
                  <CardDescription>Configurações de custo e churn.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase">Custo do Gateway (Split)</label>
                  <Select value={addonState.splitTipo} onValueChange={(val) => updateAddon('splitTipo', val)}>
                    <SelectTrigger className="w-full h-9 bg-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixo">Taxa Fixa (R$)</SelectItem>
                      <SelectItem value="pct">Percentual (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {addonState.splitTipo === 'fixo' ? (
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-slate-600">Valor fixo (R$)</span>
                    <AdminMoneyInput className="w-[120px] bg-white text-sm" value={addonState.splitFixo} onChange={(v) => updateAddon('splitFixo', v)} />
                  </div>
                ) : (
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-slate-600">Percentual (%)</span>
                    <Input type="number" className="w-[100px] bg-white text-sm" value={addonState.splitPct} onChange={e => updateAddon('splitPct', parseFloat(e.target.value) || 0)} />
                  </div>
                )}
                
                <div className="h-px bg-slate-100 w-full" />
                
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Imposto receita (%)</span>
                    <span className="text-[10px] text-slate-400">incide pós-split</span>
                  </div>
                  <Input type="number" className="w-[100px] bg-white text-sm" value={addonState.tImp} onChange={e => updateAddon('tImp', parseFloat(e.target.value) || 0)} />
                </div>
                
                <div className="flex justify-between items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-600">Churn do Add-on (%)</span>
                    <span className="text-[10px] text-slate-400">taxa de cancelamento</span>
                  </div>
                  <Input type="number" className="w-[100px] bg-white text-sm" value={addonState.churn} onChange={e => updateAddon('churn', parseFloat(e.target.value) || 0)} />
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={cardStyle}>
            <CardHeader className="pb-3 border-b border-slate-100/50">
              <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" /> Economics Mensais (Global)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm p-5 bg-gradient-to-b from-transparent to-slate-50/50 rounded-b-xl">
              <div className="flex justify-between py-1.5 font-medium">
                <span className="text-slate-800">Receita Bruta Add-on</span>
                <span className="text-slate-900">{formatCurrency(brutaTotal)}</span>
              </div>
              
              <div className="my-1 border-t border-dashed border-slate-200" />
              
              <div className="flex justify-between py-1 text-slate-500">
                <span>Custo de Gateway (Split)</span>
                <span className="text-rose-600 font-medium">-{formatCurrency(splitCust)}</span>
              </div>
              <div className="flex justify-between py-1 text-slate-500">
                <span>Imposto ({addonState.tImp.toFixed(1)}%)</span>
                <span className="text-rose-600 font-medium">-{formatCurrency(imp)}</span>
              </div>
              
              <div className="my-1 border-t border-slate-200" />
              
              <div className="flex justify-between items-center py-2">
                <span className="font-black text-base text-slate-800">Lucro Líquido Add-on</span>
                <span className={`font-black text-lg ${lucro >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                  {formatCurrency(lucro)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className={`${cardStyle} bg-gradient-to-br from-primary/5 to-slate-50/50 border-primary/20`}>
            <CardHeader className="pb-3 border-b border-primary/10">
              <CardTitle className="text-sm font-bold text-primary uppercase tracking-wider">
                Unit Economics (1 Condutor)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm p-5">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/80 p-3 rounded-lg border border-primary/20 shadow-sm">
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase">Receita Gerada</span>
                  <span className="block text-lg font-bold text-primary">{formatCurrency(rb1)}</span>
                </div>
                <div className="bg-white/80 p-3 rounded-lg border border-primary/20 shadow-sm">
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase">Lucro Incremental</span>
                  <span className="block text-lg font-bold text-emerald-600">{formatCurrency(ll1)}</span>
                </div>
              </div>
              
              <div className="flex justify-between py-1 text-primary/80 font-medium">
                <span>Margem por passageiro:</span>
                <span className="font-bold text-primary">{formatCurrency(mpp)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
