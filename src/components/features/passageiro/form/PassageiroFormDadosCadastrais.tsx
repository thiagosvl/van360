import { Banner } from "@/components/ui/Banner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { cn } from "@/lib/utils";
import { Usuario } from "@/types/usuario";
import {
  usePassageiroFormDadosCadastraisViewModel,
} from "@/hooks";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { generos, modalidades, periodos } from "@/utils/formatters";
import { getAnoLetivoOptions } from "@/utils/domain/anoLetivo";
import { dateMask } from "@/utils/masks";
import { AlertTriangle, Car, Clock, Compass, DoorClosed, School, Sun, User, UserCheck, CalendarIcon, CalendarDays, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate } from "@/utils/dateUtils";

import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import { Switch } from "@/components/ui/switch";

interface PassageiroFormDadosCadastraisProps {
  profile: Usuario | null | undefined;
  escolas: Escola[];
  veiculos: Veiculo[];
  hideVeiculo?: boolean;
  hideAtivo?: boolean;
  isExternal?: boolean;
}

export function PassageiroFormDadosCadastrais({
  escolas,
  veiculos,
  hideVeiculo = false,
  hideAtivo = false,
  isExternal = false,
}: PassageiroFormDadosCadastraisProps) {
  const {
    veiculosDisplay,
    escolasDisplay,
    handleAddNewVehicle,
    handleAddNewSchool,
  } = usePassageiroFormDadosCadastraisViewModel({ escolas, veiculos, isExternal });

  const form = useFormContext();
  const [openCalendarInicio, setOpenCalendarInicio] = useState(false);
  const [openCalendarFim, setOpenCalendarFim] = useState(false);
  const anoLetivoOptions = getAnoLetivoOptions();

  return (
    <div className="space-y-8">
      {/* Seção 1: Dados Pessoais */}
      <section id="section-identificacao" className="space-y-4">
        <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
          <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
            <User className="w-4 h-4" />
          </div>
          Identificação
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <FormField
            control={form.control}
            name="nome"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
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
                        "pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]",
                        fieldState.error && "border-[#e7000b]"
                      )}
                      aria-invalid={!!fieldState.error}
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
              <FormItem className="col-span-1 space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Ano Letivo <span className="text-[#e7000b]">*</span>
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    value={field.value || ""}
                    icon={<CalendarDays className="h-4 w-4" />}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
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
            name="data_nascimento"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Data de Nascimento {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      maxLength={10}
                      {...field}
                      onChange={(e) => {
                        field.onChange(dateMask(e.target.value));
                      }}
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
                      aria-invalid={!!fieldState.error}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="genero"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Gênero {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    icon={<User className="h-4 w-4" />}
                    value={field.value || ""}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
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
        </div>

        {!hideAtivo && (
          <div className="mt-2">
            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5 sm:p-4">
                  <div className="space-y-0.5 pr-4">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer flex items-center gap-2">
                      Aluno Ativo
                    </FormLabel>
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
          </div>
        )}
      </section>

      {!isExternal && <hr className="border-[#e5e5e5]" />}

      {/* Seção 2: Escola e Período */}
      <section id="section-escola-transporte" className="space-y-4">
        <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-[#0a0a0a] mb-4">
          <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
            <Car className="w-4 h-4" />
          </div>
          Escola e Transporte
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {!hideVeiculo && (
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
                      icon={<Car className="h-4 w-4" />}
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "add-new-vehicle") {
                          handleAddNewVehicle();
                          return;
                        }
                        field.onChange(value);
                      }}
                      error={!!fieldState.error}
                    >
                      <option value="" disabled hidden>Selecionar</option>
                      {veiculosDisplay.map((veiculo) => (
                        <option key={veiculo.id} value={veiculo.id}>
                          {formatarPlacaExibicao(veiculo.placa)}
                        </option>
                      ))}
                      <option value="add-new-vehicle">+ Cadastrar Veículo</option>
                    </NativeSelect>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="escola_id"
            render={({ field, fieldState }) => (
              <FormItem className={cn("col-span-1", hideVeiculo && !isExternal && "sm:col-span-2", "space-y-1.5")}>
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Escola <span className={cn("text-[#e7000b]", isExternal && "hidden")}>*</span>
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    icon={<School className="h-4 w-4" />}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "add-new-school") {
                        handleAddNewSchool();
                        return;
                      }
                      field.onChange(value);
                    }}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
                    {escolasDisplay.map((escola) => (
                      <option key={escola.id} value={escola.id}>
                        {escola.nome}
                      </option>
                    ))}
                    {isExternal ? (
                      <option value="none">Nenhuma das opções acima</option>
                    ) : (
                      <option value="add-new-school">+ Cadastrar Escola</option>
                    )}
                  </NativeSelect>
                </FormControl>
                {isExternal && field.value === "none" && (
                  <Banner
                    variant="warning"
                    description="Escola não listada? Continue o cadastro. O condutor será avisado para ajustar depois."
                    className="mt-3"
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modalidade"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Modalidade {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    icon={<Compass className="h-4 w-4" />}
                    value={field.value || ""}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
                    {modalidades.map((option) => (
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
            name="periodo"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                  Período {isExternal && <span className="text-[#e7000b]">*</span>}
                </FormLabel>
                <FormControl>
                  <NativeSelect
                    {...field}
                    icon={<Sun className="h-4 w-4" />}
                    value={field.value || ""}
                    error={!!fieldState.error}
                  >
                    <option value="" disabled hidden>Selecionar</option>
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
            name="turma"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
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
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
                      aria-invalid={!!fieldState.error}
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
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
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
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a]"
                      aria-invalid={!!fieldState.error}
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
            render={({ field, fieldState }) => (
              <FormItem className={cn("col-span-1", !isExternal && "sm:col-span-2", "space-y-1.5")}>
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
                      className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none"
                      aria-invalid={!!fieldState.error}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isExternal && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField
              control={form.control}
              name="data_inicio_transporte"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-1 space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Início do Transporte
                  </FormLabel>
                  <Popover open={openCalendarInicio} onOpenChange={setOpenCalendarInicio}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="relative group">
                          <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white justify-start focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none",
                              !field.value && "text-[#737373]",
                              fieldState.error && "border-red-500"
                            )}
                          >
                            {field.value ? field.value : "dd/mm/aaaa"}
                          </Button>
                          {field.value && (
                            <div
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex"
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                field.onChange("");
                                if (form.getValues("data_fim_transporte")) {
                                  form.trigger("data_fim_transporte");
                                }
                              }}
                            >
                              <X className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseLocalDate(convertDateBrToISO(field.value)) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(formatDateToBR(date));
                            setOpenCalendarInicio(false);
                          } else {
                            field.onChange("");
                          }
                          if (form.getValues("data_fim_transporte")) {
                            form.trigger("data_fim_transporte");
                          }
                        }}
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
              name="data_fim_transporte"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-1 space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Término do Transporte
                  </FormLabel>
                  <Popover open={openCalendarFim} onOpenChange={setOpenCalendarFim}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <div className="relative group">
                          <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] z-10 pointer-events-none" />
                          <Button
                            type="button"
                            variant="outline"
                            className={cn(
                              "w-full pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-left font-normal hover:bg-white justify-start focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none",
                              !field.value && "text-[#737373]",
                              fieldState.error && "border-red-500"
                            )}
                          >
                            {field.value ? field.value : "dd/mm/aaaa"}
                          </Button>
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
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 rounded-[20px] sm:rounded-[24px] border-[#e5e5e5] bg-white shadow-xl" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? parseLocalDate(convertDateBrToISO(field.value)) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(formatDateToBR(date));
                            setOpenCalendarFim(false);
                          } else {
                            field.onChange("");
                          }
                        }}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="horario_entrada"
            render={({ field, fieldState }) => (
              <FormItem className="col-span-1 space-y-1.5">
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
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        if (form.getValues("horario_saida")) {
                          form.trigger("horario_saida");
                        }
                      }}
                      className="pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none"
                      aria-invalid={!!fieldState.error}
                    />
                    {field.value && (
                      <div
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] cursor-pointer z-10 flex"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          field.onChange("");
                          if (form.getValues("horario_saida")) {
                            form.trigger("horario_saida");
                          }
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
              <FormItem className="col-span-1 space-y-1.5">
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
                      onChange={(e) => field.onChange(e.target.value)}
                      className="pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a] shadow-none"
                      aria-invalid={!!fieldState.error}
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
        </div>
      </section>
    </div>
  );
}
