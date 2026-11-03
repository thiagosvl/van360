import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { DollarSign } from "lucide-react";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorFiscalGatewaySectionProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorFiscalGatewaySection({ calcHook }: CalculatorFiscalGatewaySectionProps) {
  const { simState, updateSim, calculations, formatCurrency } = calcHook;
  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";
  const { custoGateway, impostoSimples } = calculations;

  return (
    <Card className={cardStyle}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base text-foreground font-semibold">
              Parâmetros Fiscais & Gateway SaaS
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Taxas de recebimento da assinatura do motorista e imposto Simples Nacional.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">Taxas de Gateway</span>
            <span className="text-lg font-bold text-white">{formatCurrency(custoGateway)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Pix 1,19% · Cartão 3,49%</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-semibold block mb-0.5">Imposto Simples ({simState.taxaImposto}%)</span>
            <span className="text-lg font-bold text-orange-400">{formatCurrency(impostoSimples)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Sobre receita faturada</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Divisão de Pagamentos: Pix vs Cartão</span>
            <span className="text-white font-bold">{simState.pixPct}% Pix / {100 - simState.pixPct}% Cartão</span>
          </div>
          <Slider
            value={[simState.pixPct]}
            min={0}
            max={100}
            step={5}
            onValueChange={([val]) => updateSim("pixPct", val)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Alíquota de Imposto (Simples Nacional)</span>
            <span className="text-orange-400 font-bold">{simState.taxaImposto}%</span>
          </div>
          <Slider
            value={[simState.taxaImposto]}
            min={0}
            max={15}
            step={0.5}
            onValueChange={([val]) => updateSim("taxaImposto", val)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
