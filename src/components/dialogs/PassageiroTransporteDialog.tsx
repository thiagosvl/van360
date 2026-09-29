import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { FormEnderecoFields } from "@/components/forms/FormEnderecoFields";
import { cn } from "@/lib/utils";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { ParentescoResponsavel } from "@/types/enums";
import {
  Bus,
  Car,
  Clock,
  Compass,
  Calendar as CalendarIcon,
  CalendarDays,
  X,
  User,
  Phone,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ptBR } from "date-fns/locale";
import { modalidades, parentescos } from "@/utils/formatters";
import { convertDateBrToISO, formatDateToBR } from "@/utils/formatters/date";
import { parseLocalDate } from "@/utils/dateUtils";
import { phoneMask } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { useVeiculos } from "@/hooks/api/useVeiculos";
import { useSession } from "@/hooks/business/useSession";
import { useProfile } from "@/hooks/business/useProfile";
import { useLayout } from "@/contexts/LayoutContext";
import { toast } from "@/utils/notifications/toast";
import { safeCloseDialog } from "@/hooks";

const passageiroTransporteSchema = z
  .object({
    veiculo_id: z.string().optional().nullable(),
    modalidade: z.string().optional().nullable(),
    data_inicio_transporte: z.string().optional().nullable(),
    data_fim_transporte: z.string().optional().nullable(),
    horario_entrada: z.string().optional().nullable(),
    horario_saida: z.string().optional().nullable(),
    nome_responsavel: z.string().optional(),
    telefone_responsavel: z.string().optional(),
    parentesco_responsavel: z.string().optional(),
    cep: z.string().optional().nullable(),
    logradouro: z.string().optional().nullable(),
    numero: z.string().optional().nullable(),
    complemento: z.string().optional().nullable(),
    bairro: z.string().optional().nullable(),
    cidade: z.string().optional().nullable(),
    estado: z.string().optional().nullable(),
    referencia: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const hasAddress = Boolean(
      (data.logradouro && data.logradouro.trim().length > 0) ||
      (data.numero && data.numero.trim().length > 0) ||
      (data.bairro && data.bairro.trim().length > 0) ||
      (data.cep && data.cep.trim().length > 0)
    );

    if (hasAddress) {
      if (!data.logradouro || data.logradouro.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a rua ou avenida",
          path: ["logradouro"],
        });
      }
      if (!data.numero || data.numero.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o número",
          path: ["numero"],
        });
      }
      if (!data.bairro || data.bairro.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe o bairro",
          path: ["bairro"],
        });
      }
      if (!data.cidade || data.cidade.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Informe a cidade",
          path: ["cidade"],
        });
      }
      if (!data.estado || data.estado.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selecione o estado",
          path: ["estado"],
        });
      }

      if (data.telefone_responsavel !== undefined) {
        const digits = data.telefone_responsavel.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 11) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o WhatsApp do responsável com DDD",
            path: ["telefone_responsavel"],
          });
        }
        if (!data.nome_responsavel || data.nome_responsavel.trim().length < 2) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o nome do responsável",
            path: ["nome_responsavel"],
          });
        }
      }
    }
  });

type PassageiroTransporteFormData = z.infer<typeof passageiroTransporteSchema>;

export interface PassageiroTransporteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiro: Passageiro | Partial<Passageiro> | null;
  onSuccess?: () => void;
}

export function PassageiroTransporteDialog({
  isOpen,
  onClose,
  passageiro,
  onSuccess,
}: PassageiroTransporteDialogProps) {
  const { user } = useSession();
  const { donoContaId } = useProfile(user?.id);
  const usuarioId = donoContaId || user?.id || "";
  const { openVeiculoFormDialog } = useLayout();
  const updatePassageiro = useUpdatePassageiro();
  const isSaving = updatePassageiro.isPending;

  const [openCalendarInicio, setOpenCalendarInicio] = useState(false);
  const [openCalendarFim, setOpenCalendarFim] = useState(false);

  const { data: veiculosData, isLoading: isLoadingVeiculos } = useVeiculos(
    { usuarioId },
    { enabled: isOpen && !!usuarioId }
  );

  const rawList = veiculosData?.list || [];
  const [newVeiculo, setNewVeiculo] = useState<Veiculo | null>(null);

  const veiculosList = useMemo(() => {
    if (!newVeiculo) return rawList;
    const exists = rawList.find((v) => v.id === newVeiculo.id);
    if (exists) return rawList;
    return [...rawList, newVeiculo];
  }, [rawList, newVeiculo]);

  const hasExistingResponsible = Boolean(passageiro?.responsavel_principal?.telefone);

  const form = useForm<PassageiroTransporteFormData>({
    resolver: zodResolver(passageiroTransporteSchema),
    defaultValues: {
      veiculo_id: "",
      modalidade: "",
      data_inicio_transporte: "",
      data_fim_transporte: "",
      horario_entrada: "",
      horario_saida: "",
      nome_responsavel: "",
      telefone_responsavel: "",
      parentesco_responsavel: ParentescoResponsavel.MAE,
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      referencia: "",
    },
  });

  useEffect(() => {
    if (isOpen && passageiro) {
      const resp = passageiro.responsavel_principal;
      form.reset({
        veiculo_id: passageiro.veiculo_id || passageiro.veiculo?.id || "",
        modalidade: passageiro.modalidade || "",
        data_inicio_transporte: passageiro.data_inicio_transporte ? formatDateToBR(passageiro.data_inicio_transporte) : "",
        data_fim_transporte: passageiro.data_fim_transporte ? formatDateToBR(passageiro.data_fim_transporte) : "",
        horario_entrada: passageiro.horario_entrada ? passageiro.horario_entrada.slice(0, 5) : "",
        horario_saida: passageiro.horario_saida ? passageiro.horario_saida.slice(0, 5) : "",
        nome_responsavel: resp?.nome || "",
        telefone_responsavel: resp?.telefone ? phoneMask(resp.telefone) : "",
        parentesco_responsavel: resp?.parentesco || ParentescoResponsavel.MAE,
        cep: resp?.cep || "",
        logradouro: resp?.logradouro || "",
        numero: resp?.numero || "",
        complemento: resp?.complemento || "",
        bairro: resp?.bairro || "",
        cidade: resp?.cidade || "",
        estado: resp?.estado || "",
        referencia: resp?.referencia || "",
      });
      setNewVeiculo(null);
    }
  }, [isOpen, passageiro, form]);

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const handleAddNewVehicle = () => {
    openVeiculoFormDialog({
      onSuccess: (veiculoCriado: Veiculo) => {
        if (veiculoCriado?.id) {
          setNewVeiculo(veiculoCriado);
          form.setValue("veiculo_id", veiculoCriado.id, { shouldValidate: true });
        }
      },
    });
  };

  const onSubmit = async (data: PassageiroTransporteFormData) => {
    if (!passageiro?.id) return;

    try {
      const payload: Record<string, unknown> = {
        veiculo_id: data.veiculo_id || null,
        modalidade: data.modalidade || null,
        data_inicio_transporte: data.data_inicio_transporte ? convertDateBrToISO(data.data_inicio_transporte) : null,
        data_fim_transporte: data.data_fim_transporte ? convertDateBrToISO(data.data_fim_transporte) : null,
        horario_entrada: data.horario_entrada || null,
        horario_saida: data.horario_saida || null,
      };

      const hasAddressInput = Boolean(
        data.logradouro && data.logradouro.trim().length > 0
      );

      if (hasAddressInput || data.telefone_responsavel) {
        const respPayload: Record<string, unknown> = {
          ...(passageiro.responsavel_principal || {}),
        };

        if (data.logradouro) respPayload.logradouro = data.logradouro.trim();
        if (data.numero) respPayload.numero = data.numero.trim();
        if (data.bairro) respPayload.bairro = data.bairro.trim();
        if (data.cidade) respPayload.cidade = data.cidade.trim();
        if (data.estado) respPayload.estado = data.estado;
        if (data.cep) respPayload.cep = data.cep.replace(/\D/g, "");
        if (data.complemento) respPayload.complemento = data.complemento.trim();
        if (data.referencia) respPayload.referencia = data.referencia.trim();

        if (!hasExistingResponsible && data.telefone_responsavel) {
          respPayload.nome = data.nome_responsavel?.trim() || "Responsável";
          respPayload.telefone = data.telefone_responsavel.replace(/\D/g, "");
          respPayload.parentesco = data.parentesco_responsavel || ParentescoResponsavel.MAE;
        }

        payload.responsavel_principal = respPayload;
      }

      await updatePassageiro.mutateAsync({
        id: passageiro.id,
        data: payload,
        showToast: false,
      });

      toast.success("Dados de transporte atualizados com sucesso!");
      onSuccess?.();
      handleClose();
    } catch {
      toast.error("Erro ao atualizar os dados de transporte.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && handleClose()} maxWidth="xl">
      <BaseDialog.Header
        title="Editar Transporte e Endereço"
        icon={<Bus className="w-5 h-5 text-[#1a3a5c]" />}
        onClose={handleClose}
      />

      <BaseDialog.Body>
        <Banner
          variant="info"
          description={`Atualize os dados de rota, veículo e endereço de ${passageiro?.nome || "aluno"}.`}
          className="mb-4"
        />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Car className="w-4 h-4 text-[#1a3a5c]" />
                <h4 className="text-sm font-bold text-[#1a3a5c]">Veículo e Modalidade</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="veiculo_id"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Veículo
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
                                "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                fieldState.error && "border-red-500"
                              )}
                            >
                              <SelectValue placeholder={isLoadingVeiculos ? "Carregando veículos..." : "Selecione o veículo"} />
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
                  name="modalidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Modalidade
                      </FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <div className="relative">
                            <Compass className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left">
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
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#1a3a5c]" />
                <h4 className="text-sm font-bold text-[#1a3a5c]">Período e Horários</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="data_inicio_transporte"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Início do Transporte
                      </FormLabel>
                      <Popover open={openCalendarInicio} onOpenChange={setOpenCalendarInicio}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative group">
                              <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 text-left font-normal hover:bg-slate-100 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  !field.value && "text-muted-foreground",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                {field.value ? field.value : "dd/mm/aaaa"}
                              </Button>
                              {field.value && (
                                <div
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Término do Transporte
                      </FormLabel>
                      <Popover open={openCalendarFim} onOpenChange={setOpenCalendarFim}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <div className="relative group">
                              <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full pl-12 pr-10 h-12 rounded-xl bg-slate-50 border-slate-200 text-left font-normal hover:bg-slate-100 justify-start focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                  !field.value && "text-muted-foreground",
                                  fieldState.error && "border-red-500"
                                )}
                              >
                                {field.value ? field.value : "dd/mm/aaaa"}
                              </Button>
                              {field.value && (
                                <div
                                  className="absolute right-3 top-3.5 text-gray-400 hover:text-slate-600 cursor-pointer z-10 flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    field.onChange("");
                                  }}
                                >
                                  <X className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="horario_entrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Horário de Entrada
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 pointer-events-none" />
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Horário de Saída
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 pointer-events-none" />
                          <Input
                            type="time"
                            {...field}
                            value={field.value || ""}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-[#1a3a5c]" />
                <h4 className="text-sm font-bold text-[#1a3a5c]">Endereço Principal</h4>
              </div>

              {!hasExistingResponsible && (
                <div className="space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-xs text-slate-600 font-medium">
                    Informe quem é o responsável para vincular este endereço:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="nome_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1 text-xs">
                            Nome do Responsável
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="Nome completo"
                                {...field}
                                value={field.value || ""}
                                className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone_responsavel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-700 font-semibold ml-1 text-xs">
                            WhatsApp do Responsável
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="(11) 99999-9999"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(phoneMask(e.target.value))}
                                className="pl-10 h-10 rounded-xl bg-white border-slate-200 text-sm"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <FormEnderecoFields required={false} />
            </div>
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={handleClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label="Salvar"
          onClick={form.handleSubmit(onSubmit)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
