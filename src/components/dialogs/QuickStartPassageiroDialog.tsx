import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { isDevEnv } from "@/utils/detectPlatform";
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
import { Checkbox } from "@/components/ui/checkbox";
import { usePassageiroQuickStartForm } from "@/hooks/form/usePassageiroQuickStartForm";
import { Car, Rocket, School, User, CalendarDays, Wand2, Zap, FileText, Loader2 } from "lucide-react";
import { useEscolasWithFilters, useVeiculosWithFilters, usePassageiroFormViewModel, useProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Passageiro } from "@/types/passageiro";
import { Usuario } from "@/types/usuario";
import { Escola } from "@/types/escola";
import { Veiculo } from "@/types/veiculo";
import {
  formatarPlacaExibicao,
  getDefaultAnoLetivo,
  getAnoLetivoOptions,
} from "@/utils/domain";
import { PassageiroFormModes } from "@/types/enums";
import { PassageiroFormDadosCadastrais } from "../features/passageiro/form/PassageiroFormDadosCadastrais";
import { PassageiroFormResponsavel } from "../features/passageiro/form/PassageiroFormResponsavel";
import { PassageiroFormFinanceiro } from "../features/passageiro/form/PassageiroFormFinanceiro";
import { PassageiroFormEndereco } from "../features/passageiro/form/PassageiroFormEndereco";

interface QuickStartPassageiroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (passageiro?: Passageiro, keepOpen?: boolean) => void;
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
  const [keepOpen, setKeepOpen] = useState(false);
  const createdCountRef = useRef(0);
  const lastCreatedPassageiroRef = useRef<Passageiro | null>(null);
  const { profile } = useProfile(usuarioId);

  useEffect(() => {
    if (isOpen) {
      setActiveTab("rapido");
      setKeepOpen(false);
      createdCountRef.current = 0;
      lastCreatedPassageiroRef.current = null;
    }
  }, [isOpen]);

  const { form, isSubmitting, handleSubmit, onFormError, handleFillMock } = usePassageiroQuickStartForm({
    onSuccess: (passageiro, wasKeepOpen) => {
      createdCountRef.current += 1;
      if (passageiro) {
        lastCreatedPassageiroRef.current = passageiro;
      }
      onSuccess?.(passageiro, wasKeepOpen);
      if (!wasKeepOpen) {
        onClose();
      } else {
        setKeepOpen(false);
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
      createdCountRef.current += 1;
      onSuccess?.(createdPassageiro, false);
      onClose();
    },
    profile: profile || (usuarioId ? ({ id: usuarioId } as Partial<Usuario> as Usuario) : null),
  });

  const handleTabChange = (newTab: "rapido" | "completo") => {
    if (newTab === activeTab) return;

    if (newTab === "completo") {
      const quickValues = form.getValues();
      const fullValues = fullFormViewModel.form.getValues();

      fullFormViewModel.form.reset({
        ...fullValues,
        nome: quickValues.nome || fullValues.nome,
        escola_id: quickValues.escola_id || fullValues.escola_id,
        veiculo_id: quickValues.veiculo_id || fullValues.veiculo_id,
        ano_letivo: quickValues.ano_letivo || fullValues.ano_letivo,
      });
    } else if (newTab === "rapido") {
      const fullValues = fullFormViewModel.form.getValues();
      const quickValues = form.getValues();

      form.reset({
        ...quickValues,
        nome: fullValues.nome || quickValues.nome,
        escola_id: fullValues.escola_id || quickValues.escola_id,
        veiculo_id: fullValues.veiculo_id || quickValues.veiculo_id,
        ano_letivo: fullValues.ano_letivo || quickValues.ano_letivo || getDefaultAnoLetivo(),
      });
    }

    setActiveTab(newTab);
  };

  const { data: escolasList = [] } = useEscolasWithFilters(usuarioId, { ativo: "true" }, { enabled: isOpen }) as { data: import("@/types/escola").Escola[] };
  const { data: veiculosList = [] } = useVeiculosWithFilters(usuarioId, { ativo: "true" }, { enabled: isOpen }) as { data: import("@/types/veiculo").Veiculo[] };
  const { openEscolaFormDialog, openVeiculoFormDialog } = useLayout();

  const [newVeiculo, setNewVeiculo] = useState<Veiculo | null>(null);
  const [newEscola, setNewEscola] = useState<Escola | null>(null);

  const veiculosDisplay = useMemo(() => {
    if (!newVeiculo) return veiculosList;
    const exists = veiculosList.find((v) => v.id === newVeiculo.id);
    if (exists) return veiculosList;
    return [...veiculosList, newVeiculo];
  }, [veiculosList, newVeiculo]);

  const escolasDisplay = useMemo(() => {
    if (!newEscola) return escolasList;
    const exists = escolasList.find((e) => e.id === newEscola.id);
    if (exists) return escolasList;
    return [...escolasList, newEscola];
  }, [escolasList, newEscola]);

  useEffect(() => {
    const currentId = form.getValues("veiculo_id");
    if (newVeiculo && newVeiculo.id && currentId !== newVeiculo.id) {
      form.setValue("veiculo_id", newVeiculo.id, { shouldValidate: true });
    }
  }, [newVeiculo, form]);

  useEffect(() => {
    const currentId = form.getValues("escola_id");
    if (newEscola && newEscola.id && currentId !== newEscola.id) {
      form.setValue("escola_id", newEscola.id, { shouldValidate: true });
    }
  }, [newEscola, form]);

  useEffect(() => {
    if (isOpen) {
      form.reset({
        ano_letivo: getDefaultAnoLetivo(),
        nome: "",
        escola_id: escolasList?.length === 1 ? escolasList[0].id : "",
        veiculo_id: veiculosList?.length === 1 ? veiculosList[0].id : "",
      });
      setNewEscola(null);
      setNewVeiculo(null);
    }
  }, [isOpen]);

  const anoLetivoOptions = getAnoLetivoOptions();

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

  const handleCloseDialog = () => {
    if (isOnboarding && createdCountRef.current > 0 && lastCreatedPassageiroRef.current) {
      onSuccess?.(lastCreatedPassageiroRef.current, false);
    }
    onClose();
  };

  const showTabs = !isOnboarding || createdCountRef.current > 0;
  const isCompleto = showTabs && activeTab === "completo";

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && handleCloseDialog()}
      maxWidth={isCompleto ? "2xl" : "2xl"}
    >
      <BaseDialog.Header
        title="Cadastro de Aluno"
        icon={<Rocket className="w-5 h-5" />}
        onClose={handleCloseDialog}
        leftAction={isDevEnv() && (
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
                <Banner
                  variant="info"
                  description="Seus dados estão 100% seguros e privados. Ficam salvos apenas para a organização da sua van."
                  className="mb-4"
                />
                <section>
                  <PassageiroFormDadosCadastrais
                    profile={profile}
                    escolas={fullFormViewModel.escolas}
                    veiculos={fullFormViewModel.veiculos}
                    hideAtivo={true}
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
              onSubmit={form.handleSubmit((data) => handleSubmit(data, keepOpen), onFormError)}
              className="pb-6 space-y-4"
            >
              <FormField
                control={form.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Nome do Aluno <span className="text-red-600">*</span>
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
                            allowBatchCreation: false,
                            onSuccess: (escola) => {
                              if (escola?.id) {
                                setNewEscola(escola);
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
                            <SelectValue placeholder="Selecione a escola" />
                          </SelectTrigger>
                        </div>
                      </FormControl>
                      <SelectContent>
                        {escolasDisplay.map((e) => (
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

              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-3">
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
                                allowBatchCreation: false,
                                onSuccess: (veiculo) => {
                                  if (veiculo?.id) {
                                    setNewVeiculo(veiculo);
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
                            {veiculosDisplay.map((v) => (
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

                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="ano_letivo"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Ano Letivo <span className="text-red-600">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                          <FormControl>
                            <div className="relative">
                              <CalendarDays className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                              <SelectTrigger
                                className={cn(
                                  "pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base text-left",
                                  fieldState.error && "border-red-500",
                                )}
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Ano" />
                              </SelectTrigger>
                            </div>
                          </FormControl>
                          <SelectContent>
                            {anoLetivoOptions.map((y) => (
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

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Checkbox
                  id="keepOpenPassageiro"
                  checked={keepOpen}
                  onCheckedChange={(checked) => setKeepOpen(checked as boolean)}
                  className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c]"
                />
                <label
                  htmlFor="keepOpenPassageiro"
                  className="flex-1 cursor-pointer font-medium text-slate-700 m-0 text-sm"
                >
                  Cadastrar outro em seguida
                </label>
              </div>

              <Banner
                variant="info"
                description="Valor da parcela, vencimento e responsáveis podem ser preenchidos depois na carteirinha do aluno."
              />
            </form>
          </Form>
        )}
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label={createdCountRef.current > 0 ? "Concluir" : "Cancelar"}
          onClick={handleCloseDialog}
          disabled={isCompleto ? fullFormViewModel.isSubmitting : isSubmitting}
        />
        <BaseDialog.Action
          label="Confirmar"
          onClick={
            isCompleto
              ? fullFormViewModel.form.handleSubmit(fullFormViewModel.handleSubmit, fullFormViewModel.onFormError)
              : form.handleSubmit((data) => handleSubmit(data, keepOpen), onFormError)
          }
          isLoading={isCompleto ? fullFormViewModel.isSubmitting : isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
