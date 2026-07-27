import { BaseDialog } from "@/components/ui/BaseDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePassageiroQuickStartForm } from "@/hooks/form/usePassageiroQuickStartForm";
import { MoneyInput, PhoneInput } from "@/components/forms";
import { Car, Rocket, School, User, CalendarDays, Wand2, Info, DollarSign, Zap, FileText, Loader2 } from "lucide-react";
import { useEscolasWithFilters, useVeiculosWithFilters, usePassageiroFormViewModel, useProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain";
import { monthOptions } from "@/utils/dateUtils";
import { PassageiroFormModes } from "@/types/enums";
import { PassageiroFormDadosCadastrais } from "../features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormResponsavel } from "../features/passageiro/form/PassageiroFormResponsavel";
import { PassageiroFormFinanceiro } from "../features/passageiro/form/PassageiroFormFinanceiro";
import { PassageiroFormEndereco } from "../features/passageiro/form/PassageiroFormEndereco";

interface QuickStartPassageiroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (passageiro?: Passageiro) => void;
  usuarioId?: string;
  isOnboarding?: boolean;
}

export function QuickStartPassageiroDialog({
  isOpen,
  onClose,
  onSuccess,
  usuarioId,
  isOnboarding,
}: QuickStartPassageiroDialogProps) {
  const [activeTab, setActiveTab] = useState<"rapido" | "completo">("rapido");
  const { profile } = useProfile(usuarioId);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("rapido");
    }
  }, [isOpen]);

  const { form, isSubmitting, handleSubmit, onFormError, handleFillMock } = usePassageiroQuickStartForm({
    onSuccess: (passageiro, keepOpen) => {
      onSuccess?.(passageiro);
      if (keepOpen) {
        form.reset({
          nome: "",
          nome_responsavel: "",
          telefone_responsavel: "",
          valor_cobranca: "",
          dia_vencimento: "",
          escola_id: form.getValues("escola_id"),
          veiculo_id: form.getValues("veiculo_id"),
          mes_inicio_cobranca: "",
          mes_fim_cobranca: "",
        });
      } else {
        onClose();
      }
    },
    usuarioId,
    isOnboarding,
  });

  const fullFormViewModel = usePassageiroFormViewModel({
    isOpen: isOpen && !isOnboarding,
    onClose,
    editingPassageiro: null,
    mode: PassageiroFormModes.CREATE,
    onSuccess: (createdPassageiro) => {
      onSuccess?.(createdPassageiro);
      onClose();
    },
    profile: profile || (usuarioId ? ({ id: usuarioId } as any) : null),
  });

  const handleTabChange = (newTab: "rapido" | "completo") => {
    if (newTab === activeTab) return;

    if (newTab === "completo") {
      const quickValues = form.getValues();
      const fullValues = fullFormViewModel.form.getValues();

      fullFormViewModel.form.reset({
        ...fullValues,
        nome: quickValues.nome || fullValues.nome,
        nome_responsavel: quickValues.nome_responsavel || fullValues.nome_responsavel,
        telefone_responsavel: quickValues.telefone_responsavel || fullValues.telefone_responsavel,
        escola_id: quickValues.escola_id || fullValues.escola_id,
        veiculo_id: quickValues.veiculo_id || fullValues.veiculo_id,
        valor_cobranca: quickValues.valor_cobranca || fullValues.valor_cobranca,
        dia_vencimento: quickValues.dia_vencimento || fullValues.dia_vencimento,
        mes_inicio_cobranca: quickValues.mes_inicio_cobranca || fullValues.mes_inicio_cobranca,
        mes_fim_cobranca: quickValues.mes_fim_cobranca || fullValues.mes_fim_cobranca,
      });
    } else if (newTab === "rapido") {
      const fullValues = fullFormViewModel.form.getValues();
      const quickValues = form.getValues();

      form.reset({
        ...quickValues,
        nome: fullValues.nome || quickValues.nome,
        nome_responsavel: fullValues.nome_responsavel || quickValues.nome_responsavel,
        telefone_responsavel: fullValues.telefone_responsavel || quickValues.telefone_responsavel,
        escola_id: fullValues.escola_id || quickValues.escola_id,
        veiculo_id: fullValues.veiculo_id || quickValues.veiculo_id,
        valor_cobranca: fullValues.valor_cobranca || quickValues.valor_cobranca,
        dia_vencimento: fullValues.dia_vencimento || quickValues.dia_vencimento,
        mes_inicio_cobranca: fullValues.mes_inicio_cobranca || quickValues.mes_inicio_cobranca,
        mes_fim_cobranca: fullValues.mes_fim_cobranca || quickValues.mes_fim_cobranca,
      });
    }

    setActiveTab(newTab);
  };

  const { data: escolasList = [] } = useEscolasWithFilters(usuarioId, { ativo: "true" }, { enabled: isOpen }) as { data: import("@/types/escola").Escola[] };
  const { data: veiculosList = [] } = useVeiculosWithFilters(usuarioId, { ativo: "true" }, { enabled: isOpen }) as { data: import("@/types/veiculo").Veiculo[] };
  const { openEscolaFormDialog, openVeiculoFormDialog } = useLayout();

  useEffect(() => {
    if (isOpen) {
      form.reset({
        nome: "",
        nome_responsavel: "",
        telefone_responsavel: "",
        valor_cobranca: "",
        dia_vencimento: "",
        escola_id: escolasList?.length === 1 ? escolasList[0].id : "",
        veiculo_id: veiculosList?.length === 1 ? veiculosList[0].id : "",
        mes_inicio_cobranca: "",
        mes_fim_cobranca: "",
      });
    }
  }, [isOpen, form, isOnboarding]);

  useEffect(() => {
    if (isOpen && escolasList?.length === 1 && !form.getValues("escola_id")) {
      form.setValue("escola_id", escolasList[0].id, { shouldValidate: true });
    }
  }, [isOpen, escolasList, form]);

  useEffect(() => {
    if (isOpen && veiculosList?.length === 1 && !form.getValues("veiculo_id")) {
      form.setValue("veiculo_id", veiculosList[0].id, { shouldValidate: true });
    }
  }, [isOpen, veiculosList, form]);

  const showTabs = !isOnboarding;
  const isCompleto = showTabs && activeTab === "completo";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth={isCompleto ? "2xl" : "lg"}
    >
      <BaseDialog.Header
        title="Cadastro de Passageiro"
        icon={<Rocket className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
            onClick={isCompleto ? fullFormViewModel.handleFillMock : () => handleFillMock(escolasList, veiculosList)}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        {showTabs && (
          <Tabs value={activeTab} onValueChange={(val) => handleTabChange(val as "rapido" | "completo")} className="w-full mb-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1 block">
                Tipo de Cadastro
              </label>
              <TabsList className="grid grid-cols-2 w-full p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 h-auto">
                <TabsTrigger
                  value="rapido"
                  className="rounded-xl py-2 px-3 text-xs font-bold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Rápido</span>
                  <span className="hidden sm:inline">Cadastro Rápido</span>
                </TabsTrigger>
                <TabsTrigger
                  value="completo"
                  className="rounded-xl py-2 px-3 text-xs font-bold data-[state=active]:bg-[#1a3a5c] data-[state=active]:text-white data-[state=active]:shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">Completo</span>
                  <span className="hidden sm:inline">Cadastro Completo</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        )}

        {isCompleto ? (
          fullFormViewModel.refreshing ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <Form {...fullFormViewModel.form}>
              <form
                onSubmit={fullFormViewModel.form.handleSubmit(fullFormViewModel.handleSubmit, fullFormViewModel.onFormError)}
                className="space-y-8 pb-6"
              >
                <section>
                  <PassageiroFormDadosCadastrais
                    profile={profile}
                    escolas={fullFormViewModel.escolas}
                    veiculos={fullFormViewModel.veiculos}
                  />
                </section>

                <hr className="border-slate-100" />

                <section>
                  <PassageiroFormResponsavel isSearching={fullFormViewModel.isSearchingResponsavel} />
                </section>

                <hr className="border-slate-100" />

                <section>
                  <PassageiroFormFinanceiro
                    editingPassageiro={null}
                  />
                </section>

                <hr className="border-slate-100" />

                <section>
                  <PassageiroFormEndereco />
                </section>
              </form>
            </Form>
          )
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => handleSubmit(data, false), onFormError)}
              className="space-y-8 pb-6"
            >
              <div className="space-y-5">
                {!isOnboarding && (
                  <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    Identificação
                  </div>
                )}

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Nome Completo <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              placeholder="Digite o nome completo"
                              {...field}
                              className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                              aria-invalid={!!fieldState.error}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isOnboarding && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nome_responsavel"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FormLabel className="text-slate-700 font-semibold ml-1">
                              Nome do Responsável <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                                <Input
                                  placeholder="Ex: Maria Silva"
                                  {...field}
                                  className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
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
                        name="telefone_responsavel"
                        render={({ field }) => (
                          <PhoneInput
                            field={field}
                            label="Telefone Responsável"
                            required
                            labelClassName="text-slate-700 font-semibold ml-1"
                            inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                          />
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>

              {!isOnboarding && <hr className="border-slate-100" />}

              <div className="space-y-5">
                {!isOnboarding && (
                  <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    Transporte e Escola
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="escola_id"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Escola <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            if (val === "add-new-school") {
                              openEscolaFormDialog({
                                onSuccess: (escola) => {
                                  if (escola?.id) {
                                    form.setValue("escola_id", escola.id, { shouldValidate: true });
                                  }
                                }
                              });
                            } else {
                              field.onChange(val);
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <SelectTrigger
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {escolasList.map((e) => (
                              <SelectItem key={e.id} value={e.id}>{e.nome}</SelectItem>
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

                  <FormField
                    control={form.control}
                    name="veiculo_id"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Veículo <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={(val) => {
                            if (val === "add-new-vehicle") {
                              openVeiculoFormDialog({
                                onSuccess: (veiculo) => {
                                  if (veiculo?.id) {
                                    form.setValue("veiculo_id", veiculo.id, { shouldValidate: true });
                                  }
                                }
                              });
                            } else {
                              field.onChange(val);
                            }
                          }}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <div className="relative">
                              <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                              <SelectTrigger
                                className={cn(
                                  "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500"
                                )}
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {veiculosList.map((v) => (
                              <SelectItem key={v.id} value={v.id}>{formatarPlacaExibicao(v.placa)}</SelectItem>
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
                </div>
              </div>

              {!isOnboarding && (
                <>
                  <hr className="border-slate-100" />

                  <section className="space-y-5">
                    <div className="flex items-center gap-3 text-lg font-bold text-[#1a3a5c] mb-5">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#1a3a5c] border border-slate-200/80 shadow-sm flex-shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      Financeiro e Vencimento
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="valor_cobranca"
                          render={({ field }) => (
                            <MoneyInput
                              field={field}
                              label="Valor"
                              required
                              labelClassName="text-slate-700 font-semibold ml-1"
                              inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5"
                            />
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="dia_vencimento"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-semibold ml-1">
                                Dia do Vencimento <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                        fieldState.error && "border-red-500",
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="mes_inicio_cobranca"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-semibold ml-1">
                                Mês de Início da Cobrança <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                        fieldState.error && "border-red-500",
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o mês" />
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

                        <FormField
                          control={form.control}
                          name="mes_fim_cobranca"
                          render={({ field, fieldState }) => (
                            <FormItem>
                              <FormLabel className="text-slate-700 font-semibold ml-1">
                                Mês de Término da Cobrança <span className="text-red-600">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <div className="relative">
                                    <CalendarDays className="absolute left-4 top-3.5 h-5 w-5 text-gray-400 z-10" />
                                    <SelectTrigger
                                      className={cn(
                                        "pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                                        fieldState.error && "border-red-500",
                                      )}
                                      aria-invalid={!!fieldState.error}
                                    >
                                      <SelectValue placeholder="Selecione o mês" />
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
                    </div>
                  </section>
                </>
              )}

              {isOnboarding && (
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4 shadow-sm mt-4">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100/50 text-[#1a3a5c] shrink-0 border border-blue-200/50">
                    <Info className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    Esses são apenas os dados essenciais. Você poderá completar o cadastro depois acessando a carteirinha digital.
                  </p>
                </div>
              )}
            </form>
          </Form>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={onClose}
          disabled={isCompleto ? fullFormViewModel.isSubmitting : isSubmitting}
        />
        <BaseDialog.Action
          label="Cadastrar"
          onClick={
            isCompleto
              ? fullFormViewModel.form.handleSubmit(fullFormViewModel.handleSubmit, fullFormViewModel.onFormError)
              : form.handleSubmit((data) => handleSubmit(data, false), onFormError)
          }
          isLoading={isCompleto ? fullFormViewModel.isSubmitting : isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
