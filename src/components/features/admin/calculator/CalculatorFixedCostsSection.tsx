import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";
import { Server, Plus, Trash2 } from "lucide-react";
import { CATEGORY_LABELS, CostCategory, CostPeriod } from "@/hooks/business/admin/useAdminCalculator";
import { AdminCalculatorUIHook } from "@/hooks/ui/admin/useAdminCalculatorUI";

interface CalculatorFixedCostsSectionProps {
  calcHook: AdminCalculatorUIHook;
}

export function CalculatorFixedCostsSection({ calcHook }: CalculatorFixedCostsSectionProps) {
  const { costs, addCost, updateCost, toggleCostActive, removeCost, fixosData, formatCurrency } = calcHook;
  const cardStyle = "bg-card border border-border shadow-xs text-foreground rounded-xl";

  return (
    <Card className={cardStyle}>
      <CardHeader className="p-5 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground font-semibold">
                Custos Fixos Operacionais
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Ative ou desative despesas para simular o impacto no ponto de equilíbrio.
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs border-slate-700 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 shrink-0"
            onClick={addCost}
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Adicionar Custo
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-5 pt-3 space-y-4">
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {costs.map((cost) => (
            <div
              key={cost.id}
              className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                cost.active
                  ? "bg-slate-950/60 border-slate-800"
                  : "bg-slate-950/20 border-slate-800/40 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Switch
                  checked={cost.active}
                  onCheckedChange={() => toggleCostActive(cost.id)}
                />
                <div className="flex-1 min-w-0">
                  <Input
                    value={cost.name}
                    onChange={(e) => updateCost(cost.id, "name", e.target.value)}
                    className="h-7 text-xs bg-transparent border-0 px-1 font-medium text-white focus-visible:ring-1 focus-visible:ring-primary truncate"
                  />
                  <span className="text-[10px] text-slate-400 block px-1">
                    {CATEGORY_LABELS[cost.cat] || "Geral"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="w-24">
                  <AdminMoneyInput
                    value={cost.val}
                    onChange={(val) => updateCost(cost.id, "val", val)}
                    className="h-7 text-xs bg-slate-900 border-slate-700 text-right font-medium"
                  />
                </div>
                <Select
                  value={cost.period}
                  onValueChange={(val) => updateCost(cost.id, "period", val as CostPeriod)}
                >
                  <SelectTrigger className="h-7 w-20 text-[11px] bg-slate-900 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal" className="text-xs">/mês</SelectItem>
                    <SelectItem value="anual" className="text-xs">/ano</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  onClick={() => removeCost(cost.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">
            Total Custos Fixos Ativos ({fixosData.totalAtivos} de {fixosData.totalCadastrado})
          </span>
          <span className="text-sm font-black text-orange-400">
            {formatCurrency(fixosData.totalFixos)} <span className="text-[11px] text-slate-400 font-normal">/mês</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
