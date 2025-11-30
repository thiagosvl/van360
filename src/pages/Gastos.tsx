// React
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

// Third-party
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { z } from "zod";

// Components - Alerts

import { MoneyInput } from "@/components/forms";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";

// Components - UI
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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

// Hooks
import { useLayout } from "@/contexts/LayoutContext";
import {
    useCreateGasto,
    useDeleteGasto,
    useGastos,
    useUpdateGasto,
} from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";

// Utils
import { cn } from "@/lib/utils";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { enablePageActions } from "@/utils/domain/pages/pagesUtils";
import { moneyMask } from "@/utils/masks";
import { toast } from "@/utils/notifications/toast";

// Types
import { Gasto } from "@/types/gasto";

// Icons
import { PremiumBanner } from "@/components/alerts/PremiumBanner";
import { BlurredValue } from "@/components/common/BlurredValue";
import { DateNavigation } from "@/components/common/DateNavigation";
import { KPICard } from "@/components/common/KPICard";
import { GastosList } from "@/components/features/financeiro/GastosList";
import { GastosToolbar } from "@/components/features/financeiro/GastosToolbar";
import {
    CalendarIcon,
    FileText,
    Lock,
    Tag,
    TrendingDown,
    TrendingUp,
    X,
} from "lucide-react";

const gastoSchema = z.object({
  valor: z.string().min(1, "O valor é obrigatório."),
  data: z.date({ required_error: "A data é obrigatória." }),
  categoria: z.string().min(1, "A categoria é obrigatória."),
  descricao: z.string().optional(),
});

type GastoFormData = z.infer<typeof gastoSchema>;

const categoriasGastos = [
  "Salário",
  "Combustível",
  "Manutenção",
  "Vistorias",
  "Documentação",
  "Outros",
];

const MOCK_DATA_NO_ACCESS = {
  totalGasto: 0,
  principalCategoriaData: {
    name: "Combustível",
    value: 0,
    percentage: 45,
  },
  mediaDiaria: 0,
  gastos: [
    {
      id: "mock-1",
      valor: 0,
      data: new Date().toISOString(),
      categoria: "Combustível",
      descricao: "Abastecimento Semanal",
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "mock-2",
      valor: 0,
      data: new Date().toISOString(),
      categoria: "Manutenção",
      descricao: "Troca de Óleo",
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
    {
      id: "mock-3",
      valor: 0,
      data: new Date().toISOString(),
      categoria: "Salário",
      descricao: "Pagamento Monitora",
      created_at: new Date().toISOString(),
      usuario_id: "mock",
    },
  ] as Gasto[],
};

export default function Gastos() {
  const { setPageTitle } = useLayout();
  const [openCalendar, setOpenCalendar] = useState(false);
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();
  const deleteGasto = useDeleteGasto();

  const isActionLoading =
    createGasto.isPending || updateGasto.isPending || deleteGasto.isPending;
  const [mesFilter, setMesFilter] = useState(new Date().getMonth() + 1);
  const [anoFilter, setAnoFilter] = useState(new Date().getFullYear());
  const [categoriaFilter, setCategoriaFilter] = useState("todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGasto, setEditingGasto] = useState<Gasto | null>(null);
  const { user } = useSession();
  const { profile, plano } = useProfile(user?.id);
  const [enabledPageActions, setEnabledPageActions] = useState(false);

  // Verificar permissão antes de fazer requisição
  useEffect(() => {
    if (!profile?.id) return;
    setEnabledPageActions(enablePageActions("/gastos", plano));
  }, [profile?.id, plano]);
  
  const {
    data: gastos = [],
    isLoading: isGastosLoading,
    isFetching: isGastosFetching,
    refetch: refetchGastos,
  } = useGastos(
    {
      usuarioId: profile?.id,
      mes: mesFilter,
      ano: anoFilter,
      categoria: categoriaFilter !== "todas" ? categoriaFilter : undefined,
    },
    {
      enabled: !!profile?.id && enabledPageActions,
      onError: () => toast.error("gasto.erro.carregar"),
    }
  );

  const form = useForm<GastoFormData>({ resolver: zodResolver(gastoSchema) });

  const gastosFiltrados = useMemo(() => {
    if (!searchTerm) return gastos;
    const lowerSearch = searchTerm.toLowerCase();
    return gastos.filter(
      (g) =>
        g.descricao?.toLowerCase().includes(lowerSearch) ||
        g.categoria.toLowerCase().includes(lowerSearch)
    );
  }, [gastos, searchTerm]);

  const { totalGasto, principalCategoriaData, mediaDiaria } = useMemo(() => {
    // Garantir que gastos seja um array válido
    const gastosArray = Array.isArray(gastos) ? gastos : [];
    
    const total = gastosArray.reduce((sum, g) => {
      const valor = Number(g?.valor) || 0;
      return sum + (isNaN(valor) ? 0 : valor);
    }, 0);

    const gastosPorCategoria = gastosArray.reduce((acc, gasto) => {
      if (!gasto?.categoria) return acc;
      if (!acc[gasto.categoria]) {
        acc[gasto.categoria] = { total: 0, count: 0 };
      }
      const valor = Number(gasto.valor) || 0;
      acc[gasto.categoria].total += isNaN(valor) ? 0 : valor;
      acc[gasto.categoria].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const principal =
      gastosArray.length > 0 && Object.keys(gastosPorCategoria).length > 0
        ? Object.entries(gastosPorCategoria).reduce((a, b) =>
            a[1].total > b[1].total ? a : b
          )
        : null;

    // Calculate Daily Average
    const now = new Date();
    let daysPassed = 1;

    if (
      anoFilter < now.getFullYear() ||
      (anoFilter === now.getFullYear() && mesFilter < now.getMonth() + 1)
    ) {
      // Past month: use total days in month
      daysPassed = new Date(anoFilter, mesFilter, 0).getDate();
    } else if (
      anoFilter === now.getFullYear() &&
      mesFilter === now.getMonth() + 1
    ) {
      // Current month: use current day
      daysPassed = now.getDate();
    } else {
      // Future month: 1 (avoid division by zero, though no expenses should exist)
      daysPassed = 1;
    }

    const media = total > 0 && daysPassed > 0 ? total / daysPassed : 0;
    const topCatPercentage = principal && total > 0 
      ? (principal[1].total / total) * 100 
      : 0;

    return {
      totalGasto: isNaN(total) ? 0 : total,
      principalCategoriaData: principal
        ? {
            name: principal[0] || "-",
            value: isNaN(principal[1].total) ? 0 : principal[1].total,
            percentage: isNaN(topCatPercentage) ? 0 : topCatPercentage,
          }
        : null,
      mediaDiaria: isNaN(media) ? 0 : media,
    };
  }, [gastos, mesFilter, anoFilter]);

  // Use mock data if access is restricted
  const displayData = enabledPageActions
    ? {
        totalGasto,
        principalCategoriaData,
        mediaDiaria,
        gastosFiltrados,
      }
    : {
        totalGasto: MOCK_DATA_NO_ACCESS.totalGasto,
        principalCategoriaData: MOCK_DATA_NO_ACCESS.principalCategoriaData,
        mediaDiaria: MOCK_DATA_NO_ACCESS.mediaDiaria,
        gastosFiltrados: MOCK_DATA_NO_ACCESS.gastos,
      };

  useEffect(() => {
    setPageTitle("Controle de Gastos");
  }, [setPageTitle]);

  const handleNavigation = useCallback((newMes: number, newAno: number) => {
    setMesFilter(newMes);
    setAnoFilter(newAno);
  }, []);

  const handleSubmit = useCallback(
    async (data: GastoFormData) => {
      if (!profile?.id) return;

      if (editingGasto) {
        updateGasto.mutate(
          { id: editingGasto.id, data },
          {
            onSuccess: () => {
              safeCloseDialog(() => setIsDialogOpen(false));
            },
          }
        );
      } else {
        createGasto.mutate(
          { usuarioId: profile.id, data },
          {
            onSuccess: () => {
              safeCloseDialog(() => setIsDialogOpen(false));
            },
          }
        );
      }
    },
    [profile?.id, editingGasto, updateGasto, createGasto]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      deleteGasto.mutate(id);
    },
    [deleteGasto]
  );

  const openDialog = useCallback(
    (gasto: Gasto | null = null) => {
      setEditingGasto(gasto);
      if (gasto) {
        const valorEmCentavos = Math.round(Number(gasto.valor) * 100);
        form.reset({
          valor: moneyMask(String(valorEmCentavos)),
          data: new Date(new Date(gasto.data).valueOf() + 1000 * 3600 * 24),
          categoria: gasto.categoria,
          descricao: gasto.descricao || "",
        });
      } else {
        form.reset({
          valor: "",
          data: undefined,
          categoria: "",
          descricao: "",
        });
      }
      setIsDialogOpen(true);
    },
    [form]
  );

  const pullToRefreshReload = async () => {
    await refetchGastos();
  };

  const loading = isGastosLoading || isGastosFetching;

  return (
    <>
      <PullToRefreshWrapper onRefresh={pullToRefreshReload}>
        <div>
          {!enabledPageActions && (
            <PremiumBanner
              title="Controle seus gastos"
              description="Tenha visibilidade total das despesas do seu negócio e saiba exatamente para onde está indo seu dinheiro."
              ctaText="Liberar Controle de Gastos"
              variant="orange"
              className="mb-6"
            />
          )}

          <div className="space-y-6 md:space-y-8">
            {/* 1. Header & Navigation */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <DateNavigation
                mes={mesFilter}
                ano={anoFilter}
                onNavigate={handleNavigation}
                disabled={!enabledPageActions}
              />
            </div>

            {/* 2. KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <KPICard
                title="Gasto Total"
                value={
                  <BlurredValue
                    value={displayData.totalGasto}
                    visible={enabledPageActions}
                    type="currency"
                  />
                }
                count={displayData.gastosFiltrados.length}
                icon={TrendingDown}
                bgClass="bg-red-50"
                colorClass="text-red-600"
                countLabel="Lançamento"
                className="col-span-2 md:col-span-1"
                countVisible={enabledPageActions}
              />

              <div className="bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px]">
                <div className="h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 bg-orange-50">
                  <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Categoria
                  </p>
                  <p className="font-bold text-gray-900 leading-tight max-w-[140px]">
                    <BlurredValue
                      value={displayData.principalCategoriaData?.name}
                      visible={enabledPageActions}
                      type="text"
                      className={cn(
                        enabledPageActions
                          ? displayData.principalCategoriaData?.name?.length >=
                            12
                            ? "text-xs sm:text-lg"
                            : "text-base sm:text-lg"
                          : "text-sm"
                      )}
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    {displayData.principalCategoriaData ? (
                      <BlurredValue
                        value={displayData.principalCategoriaData.percentage}
                        visible={enabledPageActions}
                        type="percent"
                      />
                    ) : (
                      "0% do total"
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4 flex-1 min-w-[140px]">
                <div className="h-5 w-5 sm:h-10 sm:w-10 rounded-xl flex items-center justify-center shrink-0 bg-blue-50">
                  <CalendarIcon className="h-3 w-3 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Média Diária
                  </p>
                  <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    <BlurredValue
                      value={displayData.mediaDiaria}
                      visible={enabledPageActions}
                      type="currency"
                    />
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                    <BlurredValue
                      value="por dia"
                      visible={enabledPageActions}
                      type="text"
                    />
                  </p>
                </div>
              </div>
            </div>

            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="p-0">
                {/* Toolbar is here now */}
              </CardHeader>

              <CardContent className="px-0">
                <GastosToolbar
                  categoriaFilter={categoriaFilter}
                  onCategoriaChange={setCategoriaFilter}
                  onRegistrarGasto={() => openDialog()}
                  categorias={categoriasGastos}
                  disabled={!enabledPageActions}
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                />

                {!enabledPageActions ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="bg-orange-100 rounded-full p-4 mb-4">
                      <Lock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Acesso Restrito
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 max-w-md">
                      Esta funcionalidade está disponível apenas nos planos Essencial ou Completo. Troque de plano para visualizar e gerenciar seus gastos.
                    </p>
                    <Button
                      onClick={() => window.location.href = "/planos?plano=essencial"}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      Ver Planos
                    </Button>
                  </div>
                ) : loading ? (
                  <Skeleton className="h-40 w-full" />
                ) : gastosFiltrados.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed border-gray-200">
                    <FileText className="w-12 h-12 mb-4 text-gray-300" />
                    <p>
                      {searchTerm
                        ? `Nenhum gasto encontrado para "${searchTerm}"`
                        : "Nenhum gasto registrado no mês indicado"}
                    </p>
                  </div>
                ) : (
                  <GastosList
                    gastos={gastosFiltrados}
                    onEdit={openDialog}
                    onDelete={handleDelete}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent
              onOpenAutoFocus={(e) => e.preventDefault()}
              className="w-[90vw] sm:w-full sm:max-w-md max-h-[95vh] flex flex-col overflow-hidden bg-blue-600 rounded-3xl border-0 shadow-2xl p-0"
              hideCloseButton
            >
              <div className="bg-blue-600 p-4 text-center relative shrink-0">
                <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Close</span>
                </DialogClose>

                <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold text-white">
                  {editingGasto ? "Editar Gasto" : "Registrar Gasto"}
                </DialogTitle>
              </div>

              <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium ml-1">
                            Categoria <span className="text-red-500">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <div className="relative">
                                <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                <SelectTrigger
                                  className={cn(
                                    "pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all",
                                    fieldState.error &&
                                      "border-red-500"
                                  )}
                                  aria-invalid={!!fieldState.error}
                                >
                                  <SelectValue placeholder="Selecione a categoria" />
                                </SelectTrigger>
                              </div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="data"
                        render={({ field, fieldState }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-gray-700 font-medium ml-1">
                              Data <span className="text-red-500">*</span>
                            </FormLabel>
                            <Popover
                              open={openCalendar}
                              onOpenChange={setOpenCalendar}
                            >
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className={cn(
                                        "w-full pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
                                        !field.value && "text-muted-foreground",
                                        fieldState.error &&
                                          "border-red-500 ring-red-500"
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      {field.value ? (
                                        format(field.value, "dd/MM/yyyy")
                                      ) : (
                                        <span className="text-gray-500">
                                          Selecione
                                        </span>
                                      )}
                                    </Button>
                                  </div>
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
                      <FormField
                        control={form.control}
                        name="valor"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            required
                            label="Valor"
                            className="flex flex-col"
                            inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                          />
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="descricao"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium ml-1">
                            Descrição
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Detalhes do gasto (opcional)"
                              className="min-h-[100px] rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all resize-none"
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          safeCloseDialog(() => setIsDialogOpen(false))
                        }
                        className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                        disabled={isActionLoading}
                      >
                        {isActionLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Gasto"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PullToRefreshWrapper>
      <LoadingOverlay active={isActionLoading} text="Aguarde..." />
    </>
  );
}
