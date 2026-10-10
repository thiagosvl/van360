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
import { NativeSelect } from "@/components/ui/native-select";
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
  X,
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
        icon={<UserCheck className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={handleClose}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] rounded-[18px] h-10 w-10 border border-[#e5e5e5] cursor-pointer"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body containerRef={bodyRef}>
        <Form {...form}>
          <form id="revisar-solicitacao-form" onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-5">
            <div className="space-y-4">
              <div className="text-xs font-semibold tracking-wider uppercase text-[#737373]">
                Para você preencher
              </div>

              <div className="rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                  <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  Parcelas
                </div>

                <FormField
                  control={form.control}
                  name="isento"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-white border border-[#e5e5e5] p-3.5 sm:p-4 shadow-2xs">
                      <div className="space-y-0.5 pr-4">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer">
                          Aluno Isento
                        </FormLabel>
                        <div className="text-xs text-[#737373] font-normal leading-relaxed">
                          Ative para filhos, parentes ou cortesias. Nenhuma cobrança ou parcela será gerada.
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={!!field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-primary"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {!isIsento && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <FormField
                        control={form.control}
                        name="valor_cobranca"
                        render={({ field }) => (
                          <MoneyInput
                            field={field}
                            label="Valor da Parcela"
                            required
                          />
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dia_vencimento"
                        render={({ field, fieldState }) => (
                          <FormItem className="col-span-1">
                            <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                              Dia do Vencimento <span className="text-[#e7000b]">*</span>
                            </FormLabel>
                            <FormControl>
                              <NativeSelect
                                value={field.value || ""}
                                onChange={field.onChange}
                                icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                error={!!fieldState.error}
                              >
                                <option value="">Selecionar</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                  <option key={day} value={day.toString()}>
                                    Dia {day}
                                  </option>
                                ))}
                              </NativeSelect>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <FormField
                            control={form.control}
                            name="mes_inicio_cobranca"
                            render={({ field, fieldState }) => (
                              <FormItem>
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                  Início da Cobrança <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    value={field.value || ""}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      form.trigger("mes_fim_cobranca");
                                    }}
                                    icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                    error={!!fieldState.error}
                                  >
                                    <option value="">Mês</option>
                                    {monthOptions.map((m) => (
                                      <option key={m.value} value={m.value}>
                                        {m.label}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </FormControl>
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
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                  Ano <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    value={field.value || (anoInicioOptions[0] || "")}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      field.onChange(val);
                                      form.setValue("ano_fim_cobranca", val);
                                      if (parseInt(val, 10) > new Date().getFullYear()) {
                                        form.setValue("mes_inicio_cobranca", "");
                                        form.setValue("mes_fim_cobranca", "");
                                      }
                                      form.trigger("mes_fim_cobranca");
                                    }}
                                  >
                                    {anoInicioOptions.map((y) => (
                                      <option key={y} value={y}>
                                        {y}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </FormControl>
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
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                  Término da Cobrança <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    value={field.value || ""}
                                    onChange={field.onChange}
                                    icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                                    error={!!fieldState.error}
                                  >
                                    <option value="">Mês</option>
                                    {monthOptions.map((m) => (
                                      <option key={m.value} value={m.value}>
                                        {m.label}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </FormControl>
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
                                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                                  Ano <span className="text-[#e7000b]">*</span>
                                </FormLabel>
                                <FormControl>
                                  <NativeSelect
                                    value={field.value || (anoFimOptions[0] || "")}
                                    onChange={(e) => {
                                      field.onChange(e.target.value);
                                      form.trigger("mes_fim_cobranca");
                                    }}
                                  >
                                    {anoFimOptions.map((y) => (
                                      <option key={y} value={y}>
                                        {y}
                                      </option>
                                    ))}
                                  </NativeSelect>
                                </FormControl>
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

              <div className="rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                  <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                    <Car className="w-4 h-4" />
                  </div>
                  Veículo e Escola
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <FormField
                    control={form.control}
                    name="veiculo_id"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Veículo <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "add-new-vehicle") {
                                handleAddNewVehicle();
                                return;
                              }
                              field.onChange(val);
                            }}
                            disabled={isLoadingVeiculos}
                            icon={<Car className="h-4 w-4 text-[#737373]" />}
                            error={!!fieldState.error}
                            className="bg-white"
                          >
                            <option value="">
                              {isLoadingVeiculos ? "Carregando..." : "Selecione o veículo"}
                            </option>
                            {veiculosList.map((veiculo) => (
                              <option key={veiculo.id} value={veiculo.id}>
                                {formatarPlacaExibicao(veiculo.placa)} {veiculo.modelo ? `- ${veiculo.modelo}` : ""}
                              </option>
                            ))}
                            <option value="add-new-vehicle">
                              + Cadastrar Veículo
                            </option>
                          </NativeSelect>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="escola_id"
                    render={({ field, fieldState }) => (
                      <FormItem className="col-span-1">
                        <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                          Escola <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <NativeSelect
                            value={field.value || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "add-new-school") {
                                handleAddNewSchool();
                                return;
                              }
                              field.onChange(val);
                            }}
                            disabled={isLoadingEscolas}
                            icon={<School className="h-4 w-4 text-[#737373]" />}
                            error={!!fieldState.error}
                            className="bg-white"
                          >
                            <option value="">
                              {isLoadingEscolas ? "Carregando..." : "Selecione a escola"}
                            </option>
                            {escolasList.map((escola) => (
                              <option key={escola.id} value={escola.id}>
                                {escola.nome}
                              </option>
                            ))}
                            <option value="add-new-school">
                              + Cadastrar Escola
                            </option>
                          </NativeSelect>
                        </FormControl>
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
              className="rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] bg-[#fafafa] overflow-hidden"
            >
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-[#f5f5f5] transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                      O que o pai preencheu
                    </div>
                    <div className="text-xs text-[#737373] font-normal">
                      Aluno, Turno, Responsável e Endereço para conferência
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-[#737373] transition-transform duration-200",
                      isDadosResponsavelOpen && "transform rotate-180"
                    )}
                  />
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 sm:px-5 pb-5 pt-1 space-y-5 border-t border-[#e5e5e5]">
                <div className="space-y-4 pt-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                    <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                      <User className="w-4 h-4" />
                    </div>
                    Identificação do Aluno
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Nome do Aluno <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                placeholder="Digite o nome completo"
                                {...field}
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                  fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Ano Letivo <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
                              icon={<CalendarDays className="h-4 w-4 text-[#737373]" />}
                              error={!!fieldState.error}
                              className="bg-white"
                            >
                              <option value="">Selecionar</option>
                              {anoLetivoOptions.map((ano) => (
                                <option key={ano} value={ano}>
                                  {ano}
                                </option>
                              ))}
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="periodo"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Período
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
                              icon={<Sun className="h-4 w-4 text-[#737373]" />}
                              error={!!fieldState.error}
                              className="bg-white"
                            >
                              <option value="">Selecionar</option>
                              {periodos.map((tipo) => (
                                <option key={tipo.value} value={tipo.value}>
                                  {tipo.label}
                                </option>
                              ))}
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="modalidade"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Modalidade
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
                              icon={<Compass className="h-4 w-4 text-[#737373]" />}
                              error={!!fieldState.error}
                              className="bg-white"
                            >
                              <option value="">Selecionar</option>
                              {modalidades.map((m) => (
                                <option key={m.value} value={m.value}>
                                  {m.label}
                                </option>
                              ))}
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="data_nascimento"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
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
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Gênero
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              value={field.value || ""}
                              onChange={field.onChange}
                              error={!!fieldState.error}
                              className="bg-white"
                            >
                              <option value="">Selecionar</option>
                              {generos.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="turma"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Turma
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                placeholder="Ex: 5º Ano A"
                                {...field}
                                value={field.value || ""}
                                className="pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Sala
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DoorClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                placeholder="Ex: 12"
                                {...field}
                                value={field.value || ""}
                                className="pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Professor(a)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                placeholder="Ex: Cláudia"
                                {...field}
                                value={field.value || ""}
                                className="pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Horário de Entrada
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ""}
                                className={cn(
                                  "pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                  fieldState.error && "border-[#e7000b]"
                                )}
                              />
                              {field.value && (
                                <div
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </div>
                              )}
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Horário de Saída
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                type="time"
                                {...field}
                                value={field.value || ""}
                                className={cn(
                                  "pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                  fieldState.error && "border-[#e7000b]"
                                )}
                              />
                              {field.value && (
                                <div
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </div>
                              )}
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
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
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
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
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Cuidados e Observações
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Alergias, recomendações médicas ou observações gerais..."
                              {...field}
                              value={field.value || ""}
                              className="min-h-[90px] rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-[#e5e5e5]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                    <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                      <Contact className="w-4 h-4" />
                    </div>
                    Responsável Financeiro
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Nome do Responsável <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                placeholder="Nome completo do responsável"
                                {...field}
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                  fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Parentesco do Responsável
                          </FormLabel>
                          <FormControl>
                            <NativeSelect
                              {...field}
                              value={field.value || ""}
                              onChange={field.onChange}
                              className={cn(
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
                              )}
                            >
                              <option value="">Selecionar</option>
                              {parentescos.map((p) => (
                                <option key={p.value} value={p.value}>
                                  {p.label}
                                </option>
                              ))}
                            </NativeSelect>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_responsavel"
                      render={({ field, fieldState }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            Telefone (WhatsApp) <span className="text-[#e7000b]">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                              <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="(00) 00000-0000"
                                maxLength={15}
                                {...field}
                                onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                className={cn(
                                  "pl-10 h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                  fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
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
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
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
                          <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                            E-mail do Responsável
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="exemplo@email.com"
                              {...field}
                              value={field.value || ""}
                              className={cn(
                                "h-10 sm:h-11 rounded-[18px] bg-white border border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                                fieldState.error && "border-[#e7000b]"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <hr className="border-[#e5e5e5]" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#0a0a0a]">
                    <div className="w-7 h-7 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373]">
                      <MapPin className="w-4 h-4" />
                    </div>
                    Endereço Principal
                  </div>

                  <FormEnderecoFields required={false} />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer className="justify-end gap-2.5">
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
