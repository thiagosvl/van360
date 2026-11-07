import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminPeriodFilter } from "@/components/ui/AdminPeriodFilter";
import { SubscriptionInvoiceStatus, CheckoutPaymentMethod } from "@/types/enums";

const STATUS_FILTERS = [
  { value: "open", label: "Em Aberto" },
  { value: "hoje", label: "Vencem Hoje" },
  { value: "vencidas", label: "Vencidas" },
  { value: "", label: "Todas" },
  { value: SubscriptionInvoiceStatus.PAID, label: "Pagas" },
  { value: SubscriptionInvoiceStatus.FAILED, label: "Falhas" },
  { value: SubscriptionInvoiceStatus.CANCELED, label: "Canceladas" },
];

interface AdminInvoicesFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  metodoFilter: string;
  onMetodoFilterChange: (val: string) => void;
  tipoFilter: string;
  onTipoFilterChange: (val: string) => void;
  dataInicio: string;
  dataFim: string;
  onPeriodChange: (start: string, end: string) => void;
}

export function AdminInvoicesFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  metodoFilter,
  onMetodoFilterChange,
  tipoFilter,
  onTipoFilterChange,
  dataInicio,
  dataFim,
  onPeriodChange,
}: AdminInvoicesFiltersProps) {
  return (
    <Card className="border border-border bg-card shadow-xs rounded-3xl overflow-hidden">
      <CardContent className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por motorista, apelido, telefone ou email..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-9 h-9 w-full rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus-visible:ring-0 focus:border-primary transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value}
                variant={statusFilter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => onStatusFilterChange(f.value)}
                className={`rounded-lg text-xs font-medium whitespace-nowrap h-9 px-3 transition-all ${
                  statusFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-border/40">
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
            <Select
              value={metodoFilter || "all"}
              onValueChange={(val) => onMetodoFilterChange(val === "all" ? "" : val)}
            >
              <SelectTrigger className="h-9 w-full sm:w-[160px] bg-background border border-border text-foreground text-sm rounded-lg focus-visible:ring-0">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">Todos os Métodos</SelectItem>
                <SelectItem value={CheckoutPaymentMethod.PIX}>Pix</SelectItem>
                <SelectItem value={CheckoutPaymentMethod.CREDIT_CARD}>Cartão de Crédito</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={tipoFilter || "all"}
              onValueChange={(val) => onTipoFilterChange(val === "all" ? "" : val)}
            >
              <SelectTrigger className="h-9 w-full sm:w-[170px] bg-background border border-border text-foreground text-sm rounded-lg focus-visible:ring-0">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="conversao_trial">Conversão Trial (Manual)</SelectItem>
                <SelectItem value="renovacao">Renovação de Assinatura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-auto">
            <AdminPeriodFilter
              defaultPreset="tudo"
              startDate={dataInicio}
              endDate={dataFim}
              onChange={onPeriodChange}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
