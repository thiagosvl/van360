import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Gasto } from "@/types/gasto";
import { formatDateToBR, meses, toLocalDateString } from "@/utils/formatters";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Edit,
  FileText,
  Loader2,
  MoreVertical,
  PieChart as PieChartIcon,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { z } from "zod";

const gastoSchema = z.object({
  descricao: z.string().min(1, "A descrição é obrigatória."),
  valor: z.string().min(1, "O valor é obrigatório."),
  data: z.date({ required_error: "A data é obrigatória." }),
  categoria: z.string().min(1, "A categoria é obrigatória."),
  notas: z.string().optional(),
});

type GastoFormData = z.infer<typeof gastoSchema>;

const categoriasGastos = [
  "Combustível",
  "Manutenção",
  "Impostos e Taxas",
  "Limpeza",
  "Seguro",
  "Alimentação",
  "Outros",
];
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent * 100 < 5) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="12px"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <ul className="flex flex-col gap-2 text-sm w-full max-w-[200px]">
      {payload.map((entry: any, index: number) => {
        const { color, value, payload: itemPayload } = entry;
        return (
          <li
            key={`item-${index}`}
            className="flex justify-between items-center gap-4 truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="truncate">{value}</span>
              <span className="text-muted-foreground text-xs">
                ({itemPayload.count})
              </span>
            </div>
            <span className="font-semibold whitespace-nowrap">
              {itemPayload.value.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </li>
        );
      })}
    </ul>
  );
};

export default function Gastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const { toast } = useToast();

  const currentYear = new Date().getFullYear();
  const anos = [
    { value: currentYear.toString(), label: currentYear.toString() },
    {
      value: (currentYear - 1).toString(),
      label: (currentYear - 1).toString(),
    },
  ];

  const form = useForm<GastoFormData>({ resolver: zodResolver(gastoSchema) });

  useEffect(() => {
    fetchGastos();
  }, [mesFilter, anoFilter]);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(anoFilter, mesFilter - 1, 1).toISOString();
      const lastDay = new Date(
        anoFilter,
        mesFilter,
        0,
        23,
        59,
        59
      ).toISOString();
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .eq("usuario_id", localStorage.getItem("app_user_id"))
        .gte("data", firstDay)
        .lte("data", lastDay)
        .order("data", { ascending: false });
      if (error) throw error;
      setGastos(data || []);
    } catch (error) {
      console.error("Erro ao buscar gastos:", error);
      toast({ title: "Erro ao carregar gastos.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const { totalGasto, principalCategoria, chartData } = useMemo(() => {
    const total = gastos.reduce((sum, g) => sum + Number(g.valor), 0);

    const gastosPorCategoria = gastos.reduce((acc, gasto) => {
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = { total: 0, count: 0 };
      }
      acc[gasto.categoria].total += Number(gasto.valor);
      acc[gasto.categoria].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const chart = Object.entries(gastosPorCategoria).map(
      ([name, { total, count }]) => ({
        name,
        value: total,
        count,
      })
    );

    const principal =
      gastos.length > 0
        ? Object.keys(gastosPorCategoria).reduce((a, b) =>
            gastosPorCategoria[a].total > gastosPorCategoria[b].total ? a : b
          )
        : "N/A";

    return {
      totalGasto: total,
      principalCategoria: principal,
      chartData: chart,
    };
  }, [gastos]);

  const handleSubmit = async (data: GastoFormData) => {
    try {
      const gastoData = {
        descricao: data.descricao,
        valor: moneyToNumber(data.valor),
        data: toLocalDateString(data.data),
        categoria: data.categoria,
        notas: data.notas,
        usuario_id: localStorage.getItem("app_user_id"),
      };
      if (editingGasto) {
        const { error } = await supabase
          .from("gastos")
          .update(gastoData)
          .eq("id", editingGasto.id);
        if (error) throw error;
        toast({ title: "Gasto atualizado com sucesso." });
      } else {
        const { error } = await supabase.from("gastos").insert([gastoData]);
        if (error) throw error;
        toast({ title: "Gasto adicionado com sucesso." });
      }
      fetchGastos();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar gasto:", error);
      toast({ title: "Erro ao salvar gasto.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("gastos").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Gasto excluído com sucesso." });
      fetchGastos();
    } catch (error) {
      console.error("Erro ao excluir gasto:", error);
      toast({ title: "Erro ao excluir gasto.", variant: "destructive" });
    }
  };

  const openDialog = (gasto: Gasto | null = null) => {
    setEditingGasto(gasto);
    if (gasto) {
      form.reset({
        descricao: gasto.descricao,
        valor: moneyMask((gasto.valor * 100).toString()),
        data: new Date(new Date(gasto.data).valueOf() + 1000 * 3600 * 24),
        categoria: gasto.categoria,
        notas: gasto.notas || "",
      });
    } else {
      form.reset({
        descricao: "",
        valor: "",
        data: undefined,
        categoria: "",
        notas: "",
      });
    }
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
          Controle de Gastos
        </h1>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar Gasto
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Mês</Label>
              <Select
                value={mesFilter.toString()}
                onValueChange={(value) => setMesFilter(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {meses.map((mes, index) => (
                    <SelectItem key={index} value={(index + 1).toString()}>
                      {mes}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Ano</Label>
              <Select
                value={anoFilter.toString()}
                onValueChange={(value) => setAnoFilter(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {anos.map((ano) => (
                    <SelectItem key={ano.value} value={ano.value}>
                      {ano.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="w-5 h-5" />
            Resumo do Mês
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">
                Total Gasto no Mês
              </div>
              <div className="text-3xl font-bold text-red-600">
                {totalGasto.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Principal Categoria
              </div>
              <div className="text-xl font-bold">{principalCategoria}</div>
            </div>
          </div>
          <div className="h-48 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  label={renderCustomizedLabel}
                  labelLine={false}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [
                    value.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }),
                    "Total",
                  ]}
                />
                <Legend
                  content={<CustomLegend />}
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ width: "auto" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Lista de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : gastos.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 text-gray-300" />
              <p>Nenhum gasto registrado no mês indicado</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block -mx-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="p-4 text-left text-xs font-medium text-gray-600">
                        Categoria
                      </th>
                      <th className="p-4 text-left text-xs font-medium text-gray-600">
                        Descrição
                      </th>
                      <th className="p-4 text-left text-xs font-medium text-gray-600">
                        Data
                      </th>
                      <th className="p-4 text-left text-xs font-medium text-gray-600">
                        Valor
                      </th>
                      <th className="p-4 text-center text-xs font-medium text-gray-600">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {gastos.map((gasto) => (
                      <tr key={gasto.id} className="hover:bg-muted/50">
                        <td className="p-4 align-top">
                          <Badge variant="outline">{gasto.categoria}</Badge>
                        </td>
                        <td className="p-4 align-top">
                          <div className="font-medium text-sm">
                            {gasto.descricao}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          {formatDateToBR(gasto.data)}
                        </td>
                        <td className="p-4 align-top">
                          {gasto.valor.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="p-4 text-center align-top">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDialog(gasto);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(gasto.id);
                                }}
                                className="text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden divide-y divide-gray-100 -mx-6">
                {gastos.map((gasto) => (
                  <div key={gasto.id} className="p-4 active:bg-muted/50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="pr-2">
                        <div className="font-semibold text-gray-800">
                          {gasto.categoria}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDialog(gasto);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(gasto.id);
                            }}
                            className="text-red-500 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="block text-xs text-muted-foreground">
                          Cadastrou em:{" "}
                        </span>
                        <span className="font-semibold">
                          {formatDateToBR(gasto.data)}
                        </span>
                      </div>
                      <span
                        className={`px-2 pr-0 py-1 rounded-full text-xs font-medium`}
                      >
                        <Badge variant="outline">{gasto.descricao}</Badge>
                      </span>
                    </div>
                    <div className="text-right text-muted-foreground text-sm mb-3">
                      {Number(gasto.valor).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>
              {editingGasto ? "Editar Gasto" : "Adicionar Gasto"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Categoria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {categoriasGastos.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="descricao"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Descrição *</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Valor *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) =>
                            field.onChange(moneyMask(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data *</FormLabel>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              if (date) {
                                field.onChange(date);
                                setOpenCalendar(false);
                              }
                            }}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="notas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="flex-1"
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
