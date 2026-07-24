import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { FixedCost, CATEGORY_LABELS, CostCategory } from "@/hooks/business/admin/useAdminCalculator";
import { AdminMoneyInput } from "@/components/ui/admin-money-input";

interface CalculatorFixedCostsProps {
  costs: FixedCost[];
  addCost: () => void;
  updateCost: (id: string, field: keyof FixedCost, value: any) => void;
  removeCost: (id: string) => void;
  totalFixos: number;
  totalFixosAnual: number;
}

export function CalculatorFixedCosts({
  costs,
  addCost,
  updateCost,
  removeCost,
  totalFixos,
  totalFixosAnual
}: CalculatorFixedCostsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const groupedCosts = costs.reduce((acc, cost) => {
    if (!acc[cost.cat]) acc[cost.cat] = [];
    acc[cost.cat].push(cost);
    return acc;
  }, {} as Record<string, FixedCost[]>);

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-4">
        {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
          const categoryCosts = groupedCosts[catKey as CostCategory] || [];
          if (categoryCosts.length === 0) return null;

          return (
            <div key={catKey} className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{catLabel}</h4>
              <div className="space-y-2">
                {categoryCosts.map((cost) => (
                  <div key={cost.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_auto] gap-2 items-center">
                    <Input
                      value={cost.name}
                      onChange={(e) => updateCost(cost.id, 'name', e.target.value)}
                      className="h-9 text-sm bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      placeholder="Nome"
                    />
                    <Select
                      value={cost.cat}
                      onValueChange={(val) => updateCost(cost.id, 'cat', val)}
                    >
                      <SelectTrigger className="h-9 text-sm bg-slate-900 border-slate-800 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={cost.period}
                      onValueChange={(val) => updateCost(cost.id, 'period', val)}
                    >
                      <SelectTrigger className="h-9 text-sm bg-slate-900 border-slate-800 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <AdminMoneyInput
                      value={cost.val || 0}
                      onChange={(v) => updateCost(cost.id, 'val', v)}
                      className="h-9 text-sm text-right bg-slate-900 border-slate-800 text-slate-100"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-slate-400 hover:text-red-400 hover:bg-red-500/10 shrink-0"
                      onClick={() => removeCost(cost.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={addCost}
        className="w-full sm:w-auto border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Custo
      </Button>

      <div className="pt-4 border-t border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Total mensal (fixos)</span>
          <span className="font-bold text-white">{formatCurrency(totalFixos)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Total anual projetado (fixos)</span>
          <span className="font-bold text-white">{formatCurrency(totalFixosAnual)}</span>
        </div>
      </div>
    </div>
  );
}
