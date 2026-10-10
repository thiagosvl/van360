import { MoneyInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
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
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateGasto,
  useUpdateGasto,
  useVeiculos,
  useGastoCategorias,
  useCreateGastoCategoria,
  useProfile,
  useSession,
  safeCloseDialog,
} from "@/hooks";
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
  ChevronDown,
  Tag,
  TrendingDown,
  Wand2,
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
  veiculos: { id: string; placa: string; modelo?: string | null }[];
  usuarioId?: string;
  onSuccess?: () => void;
}

import { usePermissions } from "@/hooks/business/usePermissions";

export default function GastoFormDialog({
  isOpen,
  onClose,
  gastoToEdit,
  veiculos: veiculosProp,
  usuarioId: usuarioIdProp,
  onSuccess,
}: GastoFormDialogProps) {
  const { can, isSubConta } = usePermissions();
  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const usuarioId = usuarioIdProp || profile?.id || "";

  const [openCalendar, setOpenCalendar] = useState(false);
  const createGasto = useCreateGasto();
  const updateGasto = useUpdateGasto();

  const [isAddingNewCat, setIsAddingNewCat] = useState(false);

  const { data: veiculosData, isLoading: isLoadingVeiculos } = useVeiculos({ usuarioId }, {
    enabled: isOpen && veiculosProp.length === 0 && !!usuarioId && (can("veiculos.gerenciar") || can("gastos.visualizar"))
  });

  const { data: categoriasData, isLoading: isLoadingCategorias } = useGastoCategorias({
    enabled: isOpen && !!usuarioId
  });

  const createCategoriaMutation = useCreateGastoCategoria();

  const veiculos = veiculosProp.length > 0 ? veiculosProp : (veiculosData?.list || []);

  const defaultVeiculoId = profile?.veiculo_id || (profile as any)?.veiculo?.id || (veiculos.length === 1 ? veiculos[0].id : "");

  const isActionLoading = createGasto.isPending || updateGasto.isPending || createCategoriaMutation.isPending;

  const form = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema),
    defaultValues: {
      valor: "",
      categoria: "",
      descricao: "",
      veiculo_id: defaultVeiculoId || "",
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
          veiculo_id: gastoToEdit.veiculo_id || defaultVeiculoId || "",
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
          veiculo_id: defaultVeiculoId || "",
          parcelado: false,
          parcelas: 2,
          tipo_calculo_parcela: GastoTipoCalculoParcela.TOTAL,
          escopo: undefined,
        });
      }
    }
  }, [isOpen, gastoToEdit, form, defaultVeiculoId]);

  useEffect(() => {
    if (isOpen && defaultVeiculoId && defaultVeiculoId !== "none") {
      const currentVal = form.getValues("veiculo_id");
      if (!currentVal || currentVal === "none") {
        form.setValue("veiculo_id", defaultVeiculoId);
      }
    }
  }, [isOpen, defaultVeiculoId, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleSubmit = async (data: GastoFormData) => {
    if (!usuarioId) return;

    if (gastoToEdit?.parcelamento_id && !data.escopo) {
      form.setError("escopo", { type: "custom", message: "Selecione uma das opções acima." });
      toast.error("validacao.formularioComErros");
      return;
    }

    const successCallback = () => {
      handleClose();
      if (onSuccess) onSuccess();
    };

    const formattedData = {
      ...data,
      valor: moneyToNumber(data.valor),
      veiculo_id: data.veiculo_id && data.veiculo_id !== "none" ? data.veiculo_id : null,
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
    <BaseDialog open={isOpen} onOpenChange={(val) => !val && handleClose()} lockClose={isActionLoading}>
      <BaseDialog.Header
        title={gastoToEdit ? "Editar Gasto" : "Registrar Gasto"}
        icon={<TrendingDown className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-all active:scale-95 shadow-none"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body className="space-y-4">
        <Form {...form}>
          <form
            id="gasto-form"
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="valor"
              render={({ field }) => (
                <MoneyInput
                  field={field}
                  required
                  label="Valor"
                  labelClassName="text-[#0a0a0a] font-medium text-xs"
                  inputClassName="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] transition-all"
                />
              )}
            />

            {!gastoToEdit && moneyToNumber(form.watch("valor") || 0) > 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Tipo de Lançamento <span className="text-[#e7000b]">*</span>
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
                      <TabsList className="grid w-full grid-cols-2 min-h-[38px] sm:min-h-[42px] bg-[#f5f5f5] p-1 rounded-[22px] border border-[#e5e5e5]">
                        <TabsTrigger
                          value="unico"
                          className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
                        >
                          Único
                        </TabsTrigger>
                        <TabsTrigger
                          value="parcelado"
                          className="rounded-[18px] px-4 py-2 text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-[#0a0a0a] data-[state=active]:shadow-xs text-[#737373] hover:text-[#0a0a0a] hover:bg-white/50 cursor-pointer"
                        >
                          Parcelado
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>

                {form.watch("parcelado") && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="parcelas"
                        render={({ field }) => (
                          <FormItem className="space-y-1.5">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Quantidade de parcelas <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={String(field.value || 2)}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              >
                                {Array.from({ length: 35 }, (_, i) => i + 2).map((num) => (
                                  <option key={num} value={String(num)}>
                                    {num}x
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("data") && (
                        <div className="flex flex-col justify-end pb-1 px-1">
                          <span className="text-[#737373] font-medium text-xs flex items-center gap-1.5 flex-wrap italic">
                            Período: {obterTextoPeriodo(form.watch("data"), form.watch("parcelas") || 2)}
                          </span>
                        </div>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name="tipo_calculo_parcela"
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-1.5 mb-4">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Como serão as parcelas? <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="grid grid-cols-1 gap-2">
                              <button
                                type="button"
                                onClick={() => field.onChange(GastoTipoCalculoParcela.TOTAL)}
                                className={cn(
                                  "w-full text-left p-3.5 rounded-[18px] border transition-all cursor-pointer flex flex-col gap-1",
                                  field.value === GastoTipoCalculoParcela.TOTAL
                                    ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                                    : fieldState.error
                                      ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                                      : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                    field.value === GastoTipoCalculoParcela.TOTAL
                                      ? "border-[#0a0a0a] bg-[#0a0a0a]"
                                      : fieldState.error
                                        ? "border-[#e7000b]/60 bg-white"
                                        : "border-[#e5e5e5] bg-white"
                                  )}>
                                    {field.value === GastoTipoCalculoParcela.TOTAL && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="font-semibold text-sm text-[#0a0a0a]">
                                    {form.watch("parcelas")} parcelas de R$ {(
                                      moneyToNumber(form.watch("valor") || "0") / (form.watch("parcelas") || 2)
                                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </span>
                                </div>

                                <div className="pl-6 text-xs text-[#737373] font-normal">
                                  Total: {form.watch("valor") || "R$ 0,00"}
                                </div>
                              </button>

                              <button
                                type="button"
                                onClick={() => field.onChange(GastoTipoCalculoParcela.PARCELA)}
                                className={cn(
                                  "w-full text-left p-3.5 rounded-[18px] border transition-all cursor-pointer flex flex-col gap-1",
                                  field.value === GastoTipoCalculoParcela.PARCELA
                                    ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                                    : fieldState.error
                                      ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                                      : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                                )}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                    field.value === GastoTipoCalculoParcela.PARCELA
                                      ? "border-[#0a0a0a] bg-[#0a0a0a]"
                                      : fieldState.error
                                        ? "border-[#e7000b]/60 bg-white"
                                        : "border-[#e5e5e5] bg-white"
                                  )}>
                                    {field.value === GastoTipoCalculoParcela.PARCELA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                  </div>
                                  <span className="font-semibold text-sm text-[#0a0a0a]">
                                    {form.watch("parcelas")} parcelas de {form.watch("valor") || "R$ 0,00"}
                                  </span>
                                </div>

                                <div className="pl-6 text-xs text-[#737373] font-normal">
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
                <FormItem className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Categoria <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    {!isAddingNewCat && (
                      <button
                        type="button"
                        className="text-xs font-medium text-primary hover:text-primary-hover hover:underline cursor-pointer"
                        onClick={() => setIsAddingNewCat(true)}
                      >
                        + Nova Categoria
                      </button>
                    )}
                  </div>

                  {isAddingNewCat ? (
                    <div className="bg-[#fafafa] border border-[#e5e5e5] rounded-[18px] p-4 shadow-none transition-all animate-in fade-in slide-in-from-top-1 duration-200">
                      <GastoCategoriaForm
                        onSubmit={async ({ nome, cor }) => {
                          const novaCat = await createCategoriaMutation.mutateAsync({
                            nome,
                            cor: cor || "slate",
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
                    <FormControl>
                      <NativeSelect
                        value={field.value || ""}
                        onChange={field.onChange}
                        icon={<Tag className="h-4 w-4 text-[#737373]" />}
                        error={!!fieldState.error}
                      >
                        <option value="">Selecionar</option>
                        {isLoadingCategorias ? (
                          <option disabled value="">Carregando...</option>
                        ) : (
                          categoriasData?.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                              {cat.nome}
                            </option>
                          ))
                        )}
                      </NativeSelect>
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="data"
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Data <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <Popover
                      open={openCalendar}
                      onOpenChange={setOpenCalendar}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="relative">
                            <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none z-10" />
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full pl-10 pr-3.5 h-10 sm:h-11 text-sm rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-[#0a0a0a] focus:bg-white focus:border-[#0a0a0a] hover:bg-[#fafafa] justify-between font-normal transition-all shadow-none",
                                !field.value && "text-[#737373]",
                                fieldState.error && "border-[#e7000b]"
                              )}
                              aria-invalid={!!fieldState.error}
                            >
                              <span className={cn("truncate", !field.value && "text-[#737373]")}>
                                {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50 shrink-0 text-[#737373]" />
                            </Button>
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 rounded-[24px] border border-[#e5e5e5] bg-white shadow-lg">
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
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Veículo
                    </FormLabel>
                    <FormControl>
                      <NativeSelect
                        disabled={isLoadingVeiculos || isSubConta}
                        value={field.value || ""}
                        onChange={(e) => {
                          if (!isSubConta) {
                            field.onChange(e.target.value);
                          }
                        }}
                        icon={<Bus className="h-4 w-4 text-[#737373]" />}
                      >
                        <option value="">
                          {isLoadingVeiculos ? "Carregando veículos..." : "Não especificar"}
                        </option>
                        {veiculos.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.modelo ? `${v.modelo} (${formatarPlacaExibicao(v.placa)})` : formatarPlacaExibicao(v.placa)}
                          </option>
                        ))}
                      </NativeSelect>
                    </FormControl>
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
                    <FormItem className="space-y-2 border-t border-[#e5e5e5] pt-4">
                      <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                        Aplicar alterações em: <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => field.onChange(GastoEscopoAcao.UNICA)}
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                              field.value === GastoEscopoAcao.UNICA
                                ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                                : fieldState.error
                                  ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                                  : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                              field.value === GastoEscopoAcao.UNICA
                                ? "border-[#0a0a0a] bg-[#0a0a0a]"
                                : fieldState.error
                                  ? "border-[#e7000b]/60 bg-white"
                                  : "border-[#e5e5e5] bg-white"
                            )}>
                              {field.value === GastoEscopoAcao.UNICA && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <span className="font-semibold text-[#0a0a0a] block">{detalhesEdicao.unica.titulo}</span>
                              <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhesEdicao.unica.descricao}</span>
                            </div>
                          </button>

                          {detalhesEdicao.futuras && (
                            <button
                              type="button"
                              onClick={() => field.onChange(GastoEscopoAcao.FUTURAS)}
                              className={cn(
                                "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                                field.value === GastoEscopoAcao.FUTURAS
                                  ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                                  : fieldState.error
                                    ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                                    : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                                field.value === GastoEscopoAcao.FUTURAS
                                  ? "border-[#0a0a0a] bg-[#0a0a0a]"
                                  : fieldState.error
                                    ? "border-[#e7000b]/60 bg-white"
                                    : "border-[#e5e5e5] bg-white"
                              )}>
                                {field.value === GastoEscopoAcao.FUTURAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                              <div>
                                <span className="font-semibold text-[#0a0a0a] block">{detalhesEdicao.futuras.titulo}</span>
                                <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhesEdicao.futuras.descricao}</span>
                              </div>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => field.onChange(GastoEscopoAcao.TODAS)}
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-[18px] border text-left transition-all text-sm font-medium cursor-pointer",
                              field.value === GastoEscopoAcao.TODAS
                                ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a] bg-[#fafafa] shadow-xs"
                                : fieldState.error
                                  ? "border-[#e7000b]/40 bg-red-50/20 text-[#0a0a0a] hover:bg-red-50/40"
                                  : "border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa]"
                            )}
                          >
                            <div className={cn(
                              "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                              field.value === GastoEscopoAcao.TODAS
                                ? "border-[#0a0a0a] bg-[#0a0a0a]"
                                : fieldState.error
                                  ? "border-[#e7000b]/60 bg-white"
                                  : "border-[#e5e5e5] bg-white"
                            )}>
                              {field.value === GastoEscopoAcao.TODAS && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <span className="font-semibold text-[#0a0a0a] block">{detalhesEdicao.todas.titulo}</span>
                              <span className="text-xs text-[#737373] font-normal leading-relaxed block">{detalhesEdicao.todas.descricao}</span>
                            </div>
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs text-[#e7000b] font-medium mt-1.5 ml-1" />
                    </FormItem>
                  )}
                />
              );
            })()}

            <FormField
              control={form.control}
              name="descricao"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Observação
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Detalhes do gasto (opcional)"
                      className="min-h-[80px] p-3.5 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] transition-all resize-none"
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
          onClick={handleClose}
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
