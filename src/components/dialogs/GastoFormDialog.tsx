import { MoneyInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateGasto, useUpdateGasto, useVeiculos, useGastoCategorias, useCreateGastoCategoria } from "@/hooks";
import { cn } from "@/lib/utils";
import { Gasto } from "@/types/gasto";
import { GastoEscopoAcao, GastoTipoCalculoParcela } from "@/types/enums";
import { GastoCategoriaForm } from "@/components/features/financeiro/GastoCategoriaForm";
import { parseLocalDate } from "@/utils/dateUtils";
import { obterTextoPeriodo, obterDetalhesEdicaoParcelas, formatarPlacaExibicao } from "@/utils/domain";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bus,
  CalendarIcon,
  Tag,
  TrendingDown,
  Wand2,
  CalendarRange,
  Calculator,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const gastoSchema = z.object({
  valor: z.string().min(1, "O valor é obrigatório."),
  data: z.date({ required_error: "A data é obrigatória." }),
  categoria: z.string().min(1, "A categoria é obrigatória."),
  descricao: z.string().optional(),
  veiculo_id: z.string().optional(),
  parcelado: z.boolean().optional(),
  parcelas: z.number().int().min(2).max(36).optional(),
  tipo_calculo_parcela: z.nativeEnum(GastoTipoCalculoParcela).optional(),
  escopo: z.nativeEnum(GastoEscopoAcao).optional(),
}).refine((data) => {
  if (data.parcelado && !data.tipo_calculo_parcela) {
    return false;
  }
  return true;
}, {
  message: "Selecione uma das opções acima.",
  path: ["tipo_calculo_parcela"],
});

type GastoFormData = z.infer<typeof gastoSchema>;

interface GastoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  gastoToEdit?: Gasto | null;
  veiculos: { id: string; placa: string }[];
  usuarioId?: string;
  onSuccess?: () => void;
}

export default function GastoFormDialog({
  isOpen,
  onClose,
  gastoToEdit,
  veiculos: veiculosProp,
  usuarioId,
  onSuccess,
}: GastoFormDialogProps) {
  const [openCalendar, setOpenCalendar] = useState(false);
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();

  const [isAddingNewCat, setIsAddingNewCat] = useState(false);

  const { data: veiculosData } = useVeiculos({ usuarioId }, {
    enabled: isOpen && veiculosProp.length === 0 && !!usuarioId
  });

  const { data: categoriasData, isLoading: isLoadingCategorias } = useGastoCategorias({
    enabled: isOpen && !!usuarioId
  });

  const createCategoriaMutation = useCreateGastoCategoria();

  const veiculos = veiculosProp.length > 0 ? veiculosProp : (veiculosData?.list || []);

  const isActionLoading = createGasto.isPending || updateGasto.isPending || createCategoriaMutation.isPending;

  const form = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      valor: "",
      categoria: "",
      descricao: "",
      veiculo_id: "none",
      parcelado: false,
      parcelas: 2,
      tipo_calculo_parcela: GastoTipoCalculoParcela.TOTAL,
      escopo: GastoEscopoAcao.UNICA,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (gastoToEdit) {
        const valorEmCentavos = Math.round(Number(gastoToEdit.valor) * 100);
        const descLimpa = gastoToEdit.descricao ? gastoToEdit.descricao.replace(/\s+\d+\/\d+$/, '').trim() : "";
        form.reset({
          valor: moneyMask(String(valorEmCentavos)),
          data: parseLocalDate(gastoToEdit.data),
          categoria: gastoToEdit.categoria,
          descricao: descLimpa,
          veiculo_id: gastoToEdit.veiculo_id || "none",
          parcelado: false,
          parcelas: 2,
          tipo_calculo_parcela: GastoTipoCalculoParcela.TOTAL,
          escopo: undefined,
        });
      } else {
        form.reset({
          valor: "",
          data: undefined,
          categoria: "",
          descricao: "",
          veiculo_id: "none",
          parcelado: false,
          parcelas: 2,
          tipo_calculo_parcela: GastoTipoCalculoParcela.TOTAL,
          escopo: undefined,
        });
      }
    }
  }, [isOpen, gastoToEdit, form]);

  const handleSubmit = async (data: GastoFormData) => {
    if (!usuarioId) return;

    if (gastoToEdit?.parcelamento_id && !data.escopo) {
      form.setError("escopo", { type: "custom", message: "Selecione uma das opções acima." });
      toast.error("validacao.formularioComErros");
      return;
    }

    const successCallback = () => {
      onClose();
      if (onSuccess) onSuccess();
    };

    const formattedData = {
      ...data,
      valor: moneyToNumber(data.valor),
      veiculo_id: data.veiculo_id === "none" || !data.veiculo_id ? null : data.veiculo_id,
      parcelado: data.parcelado || false,
      parcelas: data.parcelado ? Number(data.parcelas) : undefined,
      tipo_calculo_parcela: data.parcelado ? data.tipo_calculo_parcela : undefined,
      data: data.data ? data.data.toISOString() : undefined,
    };

    if (gastoToEdit) {
      updateGasto.mutate(
        { id: gastoToEdit.id, data: formattedData, escopo: data.escopo },
        { onSuccess: successCallback }
      );
    } else {
      createGasto.mutate(
        { usuarioId, data: formattedData },
        { onSuccess: successCallback }
      );
    }
  };

  const onFormError = () => {
    toast.error("validacao.formularioComErros");
  };

  const handleFillMock = () => {
    let veiculoId = "none";
    if (veiculos.length > 0) {
      veiculoId = veiculos[Math.floor(Math.random() * veiculos.length)].id;
    }
    const mockData = mockGenerator.gasto({ veiculo_id: veiculoId });

    let categoriaMock: string = mockData.categoria;
    if (categoriasData && categoriasData.length > 0) {
      categoriaMock = categoriasData[Math.floor(Math.random() * categoriasData.length)].slug;
    }

    form.reset({
      valor: mockData.valor,
      data: mockData.data,
      categoria: categoriaMock,
      descricao: mockData.descricao,
      veiculo_id: mockData.veiculo_id,
    });
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isActionLoading}>
      <BaseDialog.Header
        title={gastoToEdit ? "Editar Gasto" : "Registrar Gasto"}
        icon={<TrendingDown className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            id="gasto-form"
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4 mt-2"
          >
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  required
                  label="Valor"
                  className="flex flex-col"
                  labelClassName="text-slate-700 font-semibold ml-1"
                  inputClassName="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                />
              )}
            />

            {!gastoToEdit && moneyToNumber(form.watch("valor") || 0) > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Tipo de Lançamento <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <Tabs
                      value={form.watch("parcelado") ? "parcelado" : "unico"}
                      onValueChange={(val) => {
                        const isParcelado = val === "parcelado";
                        form.setValue("parcelado", isParcelado);
                        if (isParcelado) {
                          form.setValue("parcelas", 2);
                          form.setValue("tipo_calculo_parcela", undefined);
                        } else {
                          form.setValue("parcelas", undefined);
                          form.setValue("tipo_calculo_parcela", undefined);
                        }
                      }}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100/80 p-1 rounded-xl">
                        <TabsTrigger
                          value="unico"
                          className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                          Único
                        </TabsTrigger>
                        <TabsTrigger
                          value="parcelado"
                          className="rounded-lg text-xs font-semibold transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                          Parcelado
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>

                {form.watch("parcelado") && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parcelas"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel className="text-slate-700 font-semibold text-xs ml-1">
                              Quantidade de parcelas <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select
                              value={String(field.value || 2)}
                              onValueChange={(val) => field.onChange(Number(val))}
                            >
                              <FormControl>
                                <SelectTrigger className="h-10 rounded-xl bg-gray-50 border-gray-200 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500">
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-56">
                                {Array.from({ length: 35 }, (_, i) => i + 2).map((num) => (
                                  <SelectItem key={num} value={String(num)}>
                                    {num}x
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("data") && (
                        <div className="flex flex-col justify-end pb-1 px-1">
                          <span className="text-slate-500 font-medium text-xs flex items-center gap-1.5 flex-wrap italic">
                            Período: {obterTextoPeriodo(form.watch("data"), form.watch("parcelas") || 2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="tipo_calculo_parcela"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2 mb-4">
                          <FormLabel className="text-slate-800 font-bold text-xs ml-1">
                            Como serão as parcelas? <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 gap-2">
                              {/* Card 1: VALOR DIVIDIDO (DIVIDIR) */}
                              <button
                                type="button"
                                onClick={() => field.onChange(GastoTipoCalculoParcela.TOTAL)}
                                className={cn(
                                  "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1",
                                  field.value === GastoTipoCalculoParcela.TOTAL
                                    ? "border-[#1a3a5c] bg-blue-50/70 ring-1 ring-[#1a3a5c]/30 shadow-xs"
                                    : fieldState.error
                                    ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                                    : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                    field.value === GastoTipoCalculoParcela.TOTAL
                                      ? "border-[#1a3a5c] bg-[#1a3a5c]"
                                      : fieldState.error
                                      ? "border-red-400 bg-white"
                                      : "border-slate-300 bg-white"
                                  )}>
                                    {field.value === GastoTipoCalculoParcela.TOTAL && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="font-bold text-sm text-[#1a3a5c]">
                                    {form.watch("parcelas")} parcelas de R$ {(
                                      moneyToNumber(form.watch("valor") || "0") / (form.watch("parcelas") || 2)
                                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>

                                <div className="pl-6 text-xs text-slate-500 font-medium">
                                  Total: {form.watch("valor") || "R$ 0,00"}
                                </div>
                              </button>

                              {/* Card 2: VALOR MULTIPLICADO (PARCELA) */}
                              <button
                                type="button"
                                onClick={() => field.onChange(GastoTipoCalculoParcela.PARCELA)}
                                className={cn(
                                  "w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1",
                                  field.value === GastoTipoCalculoParcela.PARCELA
                                    ? "border-[#1a3a5c] bg-blue-50/70 ring-1 ring-[#1a3a5c]/30 shadow-xs"
                                    : fieldState.error
                                    ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                                    : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                    field.value === GastoTipoCalculoParcela.PARCELA
                                      ? "border-[#1a3a5c] bg-[#1a3a5c]"
                                      : fieldState.error
                                      ? "border-red-400 bg-white"
                                      : "border-slate-300 bg-white"
                                  )}>
                                    {field.value === GastoTipoCalculoParcela.PARCELA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="font-bold text-sm text-[#1a3a5c]">
                                    {form.watch("parcelas")} parcelas de {form.watch("valor") || "R$ 0,00"}
                                  </span>
                                </div>

                                <div className="pl-6 text-xs text-slate-500 font-medium">
                                  Total: R$ {(
                                    moneyToNumber(form.watch("valor") || "0") * (form.watch("parcelas") || 2)
                                  ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="categoria"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <FormLabel className="text-slate-700 font-semibold">
                      Categoria <span className="text-red-600">*</span>
                    </FormLabel>
                    {!isAddingNewCat && (
                      <Button
                        type="button"
                        variant="link"
                        className="h-auto p-0 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                        onClick={() => setIsAddingNewCat(true)}
                      >
                        + Nova Categoria
                      </Button>
                    )}
                  </div>

                  {isAddingNewCat ? (
                    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 shadow-sm transition-all animate-in fade-in slide-in-from-top-1 duration-200">
                      <GastoCategoriaForm
                        onSubmit={async ({ nome, cor }) => {
                          const novaCat = await createCategoriaMutation.mutateAsync({
                            nome,
                            cor,
                            icone: "Tag"
                          });
                          field.onChange(novaCat.slug);
                          setIsAddingNewCat(false);
                        }}
                        onCancel={() => setIsAddingNewCat(false)}
                        isPending={createCategoriaMutation.isPending}
                        submitLabel="Salvar"
                        autoFocus={true}
                      />
                    </div>
                  ) : (
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
                              fieldState.error && "border-red-500"
                            )}
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent className="max-h-60 overflow-y-auto">
                        {isLoadingCategorias ? (
                          <div className="p-4 text-center text-sm text-slate-400">Carregando...</div>
                        ) : (
                          categoriasData?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug}>
                              {cat.nome}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Data <span className="text-red-600">*</span>
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
                                "w-full pl-12 h-12 text-base rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all text-left font-normal hover:bg-gray-100 justify-start",
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
                                  Selecione a data
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
                name="veiculo_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Veículo
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <div className="relative">
                          <Bus className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                          <SelectTrigger className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all">
                            <SelectValue placeholder="Selecione um veículo" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">
                          Não especificar
                        </SelectItem>
                        {veiculos.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {formatarPlacaExibicao(v.placa)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {gastoToEdit?.parcelamento_id && (() => {
              const detalhesEdicao = obterDetalhesEdicaoParcelas(gastoToEdit.numero_parcela, gastoToEdit.total_parcelas);
              return (
                <FormField
                  control={form.control}
                  name="escopo"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-2 border-t border-slate-100 pt-4">
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Aplicar alterações em: <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-2">
                          {/* Opção 1: Somente esta parcela */}
                          <button
                            type="button"
                            onClick={() => field.onChange(GastoEscopoAcao.UNICA)}
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                              field.value === GastoEscopoAcao.UNICA
                                ? "border-[#1a3a5c] bg-blue-50/70 text-[#1a3a5c] shadow-xs ring-1 ring-[#1a3a5c]/30"
                                : fieldState.error
                                ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                                : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                              field.value === GastoEscopoAcao.UNICA
                                ? "border-[#1a3a5c] bg-[#1a3a5c]"
                                : fieldState.error
                                ? "border-red-400 bg-white"
                                : "border-slate-300 bg-white"
                            )}>
                              {field.value === GastoEscopoAcao.UNICA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <span className="font-semibold block">{detalhesEdicao.unica.titulo}</span>
                              <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhesEdicao.unica.descricao}</span>
                            </div>
                          </button>

                          {/* Opção 2: Esta e as próximas parcelas */}
                          {detalhesEdicao.futuras && (
                            <button
                              type="button"
                              onClick={() => field.onChange(GastoEscopoAcao.FUTURAS)}
                              className={cn(
                                "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                                field.value === GastoEscopoAcao.FUTURAS
                                  ? "border-[#1a3a5c] bg-blue-50/70 text-[#1a3a5c] shadow-xs ring-1 ring-[#1a3a5c]/30"
                                  : fieldState.error
                                  ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                                  : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                field.value === GastoEscopoAcao.FUTURAS
                                  ? "border-[#1a3a5c] bg-[#1a3a5c]"
                                  : fieldState.error
                                  ? "border-red-400 bg-white"
                                  : "border-slate-300 bg-white"
                              )}>
                                {field.value === GastoEscopoAcao.FUTURAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div>
                                <span className="font-semibold block">{detalhesEdicao.futuras.titulo}</span>
                                <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhesEdicao.futuras.descricao}</span>
                              </div>
                            </button>
                          )}

                          {/* Opção 3: Todas as parcelas */}
                          <button
                            type="button"
                            onClick={() => field.onChange(GastoEscopoAcao.TODAS)}
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all text-sm font-medium cursor-pointer",
                              field.value === GastoEscopoAcao.TODAS
                                ? "border-[#1a3a5c] bg-blue-50/70 text-[#1a3a5c] shadow-xs ring-1 ring-[#1a3a5c]/30"
                                : fieldState.error
                                ? "border-red-400 bg-red-50/20 text-slate-700 hover:bg-red-50/40 ring-1 ring-red-400/30"
                                : "border-gray-200 bg-gray-50 text-slate-700 hover:bg-gray-100/80"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                              field.value === GastoEscopoAcao.TODAS
                                ? "border-[#1a3a5c] bg-[#1a3a5c]"
                                : fieldState.error
                                ? "border-red-400 bg-white"
                                : "border-slate-300 bg-white"
                            )}>
                              {field.value === GastoEscopoAcao.TODAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <span className="font-semibold block">{detalhesEdicao.todas.titulo}</span>
                              <span className="text-xs text-slate-500 font-normal leading-relaxed block">{detalhesEdicao.todas.descricao}</span>
                            </div>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-red-500 font-medium mt-1.5 ml-1" />
                    </FormItem>
                  )}
                />
              );
            })()}

            <FormField
              control={form.control}
              name="descricao"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Observação
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
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isActionLoading}
        />
        <BaseDialog.Action
          label="Salvar"
          type="submit"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isActionLoading}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
