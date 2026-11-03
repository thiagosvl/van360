import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorAutoBillingCardProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorAutoBillingCard({ calcHook }: CalculatorAutoBillingCardProps) {
  const { simState, updateSim, calculations, formatCurrency, formatPercent } = calcHook;

  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";

  return (
    <Card className={cardStyle}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground font-semibold">
                Cobrança com Baixa Automática (Gateway de Alunos)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Simule o ganho de spread (R$ 0,65 por transação) sobre a conciliação bancária dos passageiros.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Habilitar no Cálculo</span>
            <Switch
              checked={simState.simularCobrancaAuto}
              onCheckedChange={(val) => updateSim("simularCobrancaAuto", val)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-5">
        {simState.simularCobrancaAuto ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800">
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Taxa ao Motorista</span>
                <span className="text-lg font-bold text-white">R$ 2,50</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Por boleto/Pix liquidado</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Custo Provedor (Efí/Woovi)</span>
                <span className="text-lg font-bold text-slate-400">R$ 1,85</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Taxa de liquidação</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-1">Spread Líquido Van360</span>
                <span className="text-lg font-black text-emerald-400">R$ 0,65</span>
                <span className="text-[10px] text-emerald-400/80 block mt-0.5">Margem limpa por aluno</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-medium">Adesão de Alunos na Baixa Automática</span>
                <span className="text-emerald-400 font-bold">{simState.pctAlunosCobrancaAuto}% ({calculations.totalAlunosCobrancaAuto} alunos)</span>
              </div>
              <Slider
                value={[simState.pctAlunosCobrancaAuto]}
                min={0}
                max={100}
                step={5}
                onValueChange={([val]) => updateSim("pctAlunosCobrancaAuto", val)}
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Apenas Pix pessoal)</span>
                <span>50%</span>
                <span>100% (Todos os alunos integrados)</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Receita Adicional de Gateway</span>
                  <span className="text-[11px] text-slate-300">
                    {calculations.totalAlunosCobrancaAuto} alunos cobrados via baixa automática todo mês
                  </span>
                </div>
              </div>
              <div className="text-right sm:shrink-0">
                <span className="text-xl font-black text-emerald-400">
                  +{formatCurrency(calculations.receitaSpreadCobranca)}
                </span>
                <span className="text-[10px] text-slate-400 block">/mês de margem líquida extra</span>
              </div>
            </div>
          </>
        ) : (
          <div className="p-4 bg-slate-950/40 rounded-xl border border-dashed border-slate-800 text-center">
            <p className="text-xs text-slate-400">
              Simulação de baixa automática desativada. As métricas consideram apenas a receita das mensalidades de software (SaaS).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
