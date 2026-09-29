import { useCallback, useMemo, useRef, useState } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { MoneyInput, FormEnderecoFields } from "@/components/forms";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { PrePassageiro } from "@/types/prePassageiro";
import { Passageiro } from "@/types/passageiro";
import { Button } from "@/components/ui/button";
import {
  Car,
  Clock,
  Compass,
  Contact,
  DollarSign,
  MapPin,
  Phone,
  School,
  Sun,
  User,
  UserCheck,
  CalendarDays,
  DoorClosed,
  ChevronDown,
  Wand2,
} from "lucide-react";
import {
  generos,
  modalidades,
  parentescos,
  periodos,
} from "@/utils/formatters";
import {
  getAnoCobrancaFimOptions,
  getAnoCobrancaInicioOptions,
  getAnoLetivoOptions,
  isCobrancaRetroativa,
  COBRANCA_BANNER_MESSAGES,
} from "@/utils/domain";
import { monthOptions } from "@/utils/dateUtils";
import { dateMask, cpfMask, phoneMask } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { isDevEnv } from "@/utils/detectPlatform";
import { useRevisarSolicitacaoViewModel } from "@/hooks/ui/useRevisarSolicitacaoViewModel";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface RevisarSolicitacaoDialogProps {
  isOpen: boolean;
  prePassageiro: PrePassageiro | null;
  onClose: () => void;
  onSuccess?: (passageiro: Passageiro) => void;
}

export function RevisarSolicitacaoDialog({
  isOpen,
  prePassageiro,
  onClose,
  onSuccess,
}: RevisarSolicitacaoDialogProps) {
  const {
    form,
    escolasList,
    veiculosList,
    isLoadingEscolas,
    isLoadingVeiculos,
    isSubmitting,
    handleAddNewSchool,
    handleAddNewVehicle,
    handleFillMock,
    onFormError: onVmFormError,
    onSubmit,
  } = useRevisarSolicitacaoViewModel({
    isOpen,
    prePassageiro,
    onClose,
    onSuccess,
  });

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const collapsibleRef = useRef<HTMLDivElement | null>(null);
  const [isDadosResponsavelOpen, setIsDadosResponsavelOpen] = useState(false);

  const onFormError = useCallback(
    (errors?: Record<string, unknown>) => {
      onVmFormError();

      const dadosPaiKeys = [
        "nome",
        "data_nascimento",
        "genero",
        "observacoes",
        "nome_responsavel",
        "parentesco_responsavel",
        "telefone_responsavel",
        "cpf_responsavel",
        "email_responsavel",
        "cep",
        "logradouro",
        "numero",
        "bairro",
        "cidade",
        "estado",
        "complemento",
        "referencia",
        "modalidade",
        "horario_entrada",
        "horario_saida",
        "periodo",
        "ano_letivo",
      ];

      if (errors && Object.keys(errors).some((key) => dadosPaiKeys.includes(key))) {
        setIsDadosResponsavelOpen(true);
      }
    },
    [onVmFormError]
  );

  const handleToggleDadosResponsavel = (nextOpen: boolean) => {
    setIsDadosResponsavelOpen(nextOpen);
    if (nextOpen) {
      setTimeout(() => {
        if (!bodyRef.current || !collapsibleRef.current) return;
        const container = bodyRef.current;
        const target = collapsibleRef.current;
        const containerRect = container.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const relativeTop = targetRect.top - containerRect.top + container.scrollTop;

        container.scrollTo({
          top: Math.max(0, relativeTop - 8),
          behavior: "smooth",
        });
      }, 120);
    }
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const isIsento = form.watch("isento");
  const mesInicio = form.watch("mes_inicio_cobranca");
  const anoInicio = form.watch("ano_inicio_cobranca");
  const anoLetivo = form.watch("ano_letivo");

  const anoLetivoOptions = getAnoLetivoOptions();
  const anoInicioOptions = getAnoCobrancaInicioOptions(anoLetivo || anoInicio);
  const anoFimOptions = getAnoCobrancaFimOptions(anoInicio);

  const isRetroativo = useMemo(() => isCobrancaRetroativa(mesInicio, anoInicio), [mesInicio, anoInicio]);

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="3xl">
      <BaseDialog.Header
        title="Revisar Cadastro"
        icon={<UserCheck className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={handleClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body containerRef={bodyRef}>

        <Form {...form}>
          <form id="revisar-solicitacao-form" onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-6">
            <div className="space-y-5">
              <div className="text-sm font-bold tracking-wide uppercase text-slate-500">
                Para você preencher
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-5">
                <div className="flex items-center gap-2.5 text-base font-bold text-[#1a3a5c]">
                  <DollarSign className="w-4 h-4 text-[#1a3a5c]" />
                  Parcelas
                </div>

                <FormField
                  control={form.control}
                  name="isento"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-xl bg-white border border-slate-200/80 p-4 shadow-2xs">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-slate-800 font-bold text-sm cursor-pointer">
                          Aluno Isento
                        </FormLabel>
                        <div className="text-xs text-slate-500 font-normal leading-relaxed">
                          Ative para filhos, parentes ou cortesias. Nenhuma cobrança ou parcela será gerada.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-[#1a3a5c]"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isIsento && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <FormField
                        control={form.control}
                        name="valor_cobranca"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Valor da Parcela"
                            required
                            labelClassName="text-slate-700 font-semibold ml-1"
                            inputClassName="pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5"
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dia_vencimento"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1">
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              Dia do Vencimento <span className="text-red-600">*</span>
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || undefined}>
                              <FormControl>
                                <div className="relative">
                                  <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                  <SelectTrigger
                                    className={cn(
                                      "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                      fieldState.error && "border-red-500"
                                    )}
                                    aria-invalid={!!fieldState.error}
                                  >
                                    <SelectValue placeholder="Selecione o dia" />
                                  </SelectTrigger>
                                </div>
                              </FormControl>
                              <SelectContent className="max-h-60 overflow-y-auto">
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    Dia {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="mes_inicio_cobranca"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-semibold ml-1">
                                  Início da Cobrança <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    form.trigger("mes_fim_cobranca");
                                  }}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                          fieldState.error && "border-red-500"
                                        )}
                                        aria-invalid={!!fieldState.error}
                                      >
                                        <SelectValue placeholder="Mês" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent className="max-h-60 overflow-y-auto">
                                    {monthOptions.map((m) => (
                                      <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <FormField
                            control={form.control}
                            name="ano_inicio_cobranca"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-semibold ml-1">
                                  Ano <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    form.setValue("ano_fim_cobranca", val);
                                    if (parseInt(val, 10) > new Date().getFullYear()) {
                                      form.setValue("mes_inicio_cobranca", "");
                                      form.setValue("mes_fim_cobranca", "");
                                    }
                                    form.trigger("mes_fim_cobranca");
                                  }}
                                  value={field.value || (anoInicioOptions[0] || "")}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base">
                                      <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {anoInicioOptions.map((y) => (
                                      <SelectItem key={y} value={y}>
                                        {y}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="mes_fim_cobranca"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-semibold ml-1">
                                  Término da Cobrança <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value || undefined}
                                >
                                  <FormControl>
                                    <div className="relative">
                                      <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                      <SelectTrigger
                                        className={cn(
                                          "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                          fieldState.error && "border-red-500"
                                        )}
                                        aria-invalid={!!fieldState.error}
                                      >
                                        <SelectValue placeholder="Mês" />
                                      </SelectTrigger>
                                    </div>
                                  </FormControl>
                                  <SelectContent className="max-h-60 overflow-y-auto">
                                    {monthOptions.map((m) => (
                                      <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="col-span-1">
                          <FormField
                            control={form.control}
                            name="ano_fim_cobranca"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-700 font-semibold ml-1">
                                  Ano <span className="text-red-600">*</span>
                                </FormLabel>
                                <Select
                                  onValueChange={(val) => {
                                    field.onChange(val);
                                    form.trigger("mes_fim_cobranca");
                                  }}
                                  value={field.value || (anoFimOptions[0] || "")}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base">
                                      <SelectValue placeholder="Ano" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {anoFimOptions.map((y) => (
                                      <SelectItem key={y} value={y}>
                                        {y}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {isRetroativo && (
                      <Banner
                        variant="warning"
                        description={COBRANCA_BANNER_MESSAGES.RETROATIVA}
                      />
                    )}
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-5">
                <div className="flex items-center gap-2.5 text-base font-bold text-[#1a3a5c]">
                  <Car className="w-4 h-4 text-[#1a3a5c]" />
                  Veículo e Escola
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <FormField
                    control={form.control}
                    name="veiculo_id"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Veículo <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={(val) => {
                            if (val === "add-new-vehicle") {
                              handleAddNewVehicle();
                              return;
                            }
                            field.onChange(val);
                          }}
                          disabled={isLoadingVeiculos}
                        >
                          <FormControl>
                            <div className="relative">
                              <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <SelectTrigger
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                <SelectValue placeholder={isLoadingVeiculos ? "Carregando..." : "Selecione o veículo"} />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {veiculosList.map((veiculo) => (
                              <SelectItem key={veiculo.id} value={veiculo.id}>
                                {formatarPlacaExibicao(veiculo.placa)} {veiculo.modelo ? `- ${veiculo.modelo}` : ""}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="add-new-vehicle"
                              className="font-semibold text-[#1a3a5c] cursor-pointer"
                            >
                              + Cadastrar Veículo
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="escola_id"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Escola <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          value={field.value || undefined}
                          onValueChange={(val) => {
                            if (val === "add-new-school") {
                              handleAddNewSchool();
                              return;
                            }
                            field.onChange(val);
                          }}
                          disabled={isLoadingEscolas}
                        >
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <SelectTrigger
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                <SelectValue placeholder={isLoadingEscolas ? "Carregando..." : "Selecione a escola"} />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent className="max-h-60 overflow-y-auto">
                            {escolasList.map((escola) => (
                              <SelectItem key={escola.id} value={escola.id}>
                                {escola.nome}
                              </SelectItem>
                            ))}
                            <SelectItem
                              value="add-new-school"
                              className="font-semibold text-[#1a3a5c] cursor-pointer"
                            >
                              + Cadastrar Escola
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Collapsible
              ref={collapsibleRef}
              open={isDadosResponsavelOpen}
              onOpenChange={handleToggleDadosResponsavel}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full p-5 flex items-center justify-between text-left hover:bg-slate-100/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold tracking-wide uppercase text-slate-700">
                      O que o pai preencheu
                    </div>
                    <div className="text-xs text-slate-500 font-normal">
                      Aluno, Turno, Responsável e Endereço para conferência
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-5 h-5 text-slate-400 transition-transform duration-200",
                      isDadosResponsavelOpen && "transform rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-5 pb-5 pt-1 space-y-6 border-t border-slate-200/60">
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2.5 text-base font-bold text-[#1a3a5c]">
                    <User className="w-4 h-4 text-[#1a3a5c]" />
                    Identificação do Aluno
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Nome do Aluno <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                placeholder="Digite o nome completo"
                                {...field}
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ano_letivo"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Ano Letivo <span className="text-red-600">*</span>
                          </FormLabel>
                          <div className="relative">
                            <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger
                                  className={cn(
                                    "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                    fieldState.error && "border-red-500"
                                  )}
                                >
                                  <SelectValue placeholder="Selecione o ano" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {anoLetivoOptions.map((ano) => (
                                  <SelectItem key={ano} value={ano}>
                                    {ano}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="periodo"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Período
                          </FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <div className="relative">
                                <Sun className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                                <SelectTrigger
                                  className={cn(
                                    "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                    fieldState.error && "border-red-500"
                                  )}
                                >
                                  <SelectValue placeholder="Selecione o período" />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent>
                              {periodos.map((tipo) => (
                                <SelectItem key={tipo.value} value={tipo.value}>
                                  {tipo.label}
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
                      name="modalidade"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Modalidade
                          </FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <div className="relative">
                                <Compass className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                                <SelectTrigger
                                  className={cn(
                                    "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                    fieldState.error && "border-red-500"
                                  )}
                                >
                                  <SelectValue placeholder="Selecione a modalidade" />
                                </SelectTrigger>
                              </div>
                            </FormControl>
                            <SelectContent>
                              {modalidades.map((m) => (
                                <SelectItem key={m.value} value={m.value}>
                                  {m.label}
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
                      name="data_nascimento"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Data de Nascimento
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="dd/mm/aaaa"
                              maxLength={10}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(dateMask(e.target.value))}
                              className={cn(
                                "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                fieldState.error && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="genero"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Gênero
                          </FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                <SelectValue placeholder="Selecione o gênero" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {generos.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
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
                      name="turma"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Turma
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                placeholder="Ex: 5º Ano A"
                                {...field}
                                value={field.value || ""}
                                className="pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sala"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Sala
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DoorClosed className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                placeholder="Ex: 12"
                                {...field}
                                value={field.value || ""}
                                className="pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nome_professor"
                      render={({ field }) => (
                        <FormItem className="col-span-1 sm:col-span-2">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Professor(a)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCheck className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                placeholder="Ex: Cláudia"
                                {...field}
                                value={field.value || ""}
                                className="pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="horario_entrada"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Horário de Entrada
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ""}
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="horario_saida"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Horário de Saída
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ""}
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_inicio_transporte"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Início do Transporte
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="dd/mm/aaaa"
                              maxLength={10}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(dateMask(e.target.value))}
                              className={cn(
                                "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                fieldState.error && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_fim_transporte"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Término do Transporte
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="dd/mm/aaaa"
                              maxLength={10}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(dateMask(e.target.value))}
                              className={cn(
                                "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                fieldState.error && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="observacoes"
                      render={({ field }) => (
                        <FormItem className="col-span-1 sm:col-span-2">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Cuidados e Observações
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Alergias, recomendações médicas ou observações gerais..."
                              {...field}
                              value={field.value || ""}
                              className="min-h-[90px] rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-slate-200/60" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-base font-bold text-[#1a3a5c]">
                    <Contact className="w-4 h-4 text-[#1a3a5c]" />
                    Responsável Financeiro
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Nome do Responsável <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                placeholder="Nome completo do responsável"
                                {...field}
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentesco_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Parentesco do Responsável
                          </FormLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                className={cn(
                                  "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                <SelectValue placeholder="Selecione o parentesco" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parentescos.map((p) => (
                                <SelectItem key={p.value} value={p.value}>
                                  {p.label}
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
                      name="telefone_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            Telefone (WhatsApp) <span className="text-red-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                {...field}
                                onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  fieldState.error && "border-red-500"
                                )}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            CPF do Responsável
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="000.000.000-00"
                              maxLength={14}
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(cpfMask(e.target.value))}
                              className={cn(
                                "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                fieldState.error && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1 sm:col-span-2">
                          <FormLabel className="text-slate-700 font-semibold ml-1">
                            E-mail do Responsável
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="exemplo@email.com"
                              {...field}
                              value={field.value || ""}
                              className={cn(
                                "h-12 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                fieldState.error && "border-red-500"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-slate-200/60" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-base font-bold text-[#1a3a5c]">
                    <MapPin className="w-4 h-4 text-[#1a3a5c]" />
                    Endereço Principal
                  </div>

                  <FormEnderecoFields required={false} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer className="justify-end gap-3">
        <BaseDialog.Action
          type="button"
          label="Cancelar"
          variant="secondary"
          onClick={handleClose}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          type="button"
          onClick={form.handleSubmit(onSubmit, onFormError)}
          label="Confirmar"
          variant="primary"
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}

export default RevisarSolicitacaoDialog;
