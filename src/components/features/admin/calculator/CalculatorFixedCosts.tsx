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
    <div className="space-y-6">
      <div className="space-y-4">
        {Object.entries(CATEGORY_LABELS).map(([catKey, catLabel]) => {
          const categoryCosts = groupedCosts[catKey as CostCategory] || [];
          if (categoryCosts.length === 0) return null;

          return (
            <div key={catKey} className="space-y-2">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{catLabel}</h4>
              <div className="space-y-2">
                {categoryCosts.map((cost) => (
                  <div key={cost.id} className="grid grid-cols-[1fr_auto] sm:grid-cols-[2fr_1.5fr_1.5fr_1.5fr_auto] gap-2 items-center">
                    <Input
                      value={cost.name}
                      onChange={(e) => updateCost(cost.id, 'name', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Nome"
                    />
                    <Select
                      value={cost.cat}
                      onValueChange={(val) => updateCost(cost.id, 'cat', val)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={cost.period}
                      onValueChange={(val) => updateCost(cost.id, 'period', val)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                    <AdminMoneyInput
                      value={cost.val || 0}
                      onChange={(v) => updateCost(cost.id, 'val', v)}
                      className="h-9 text-sm text-right"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-muted-foreground hover:text-destructive shrink-0"
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

      <Button variant="outline" size="sm" onClick={addCost} className="w-full sm:w-auto">
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Custo
      </Button>

      <div className="pt-4 border-t space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total mensal (fixos)</span>
          <span className="font-medium text-foreground">{formatCurrency(totalFixos)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Total anual projetado (fixos)</span>
          <span className="font-medium text-foreground">{formatCurrency(totalFixosAnual)}</span>
        </div>
      </div>
    </div>
  );
}
