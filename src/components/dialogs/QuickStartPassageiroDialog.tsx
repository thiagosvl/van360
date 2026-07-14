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
import { usePassageiroQuickStartForm } from "@/hooks/form/usePassageiroQuickStartForm";
import { MoneyInput, PhoneInput } from "@/components/forms";
import { Car, Rocket, School, User, CalendarDays, Wand2, Info } from "lucide-react";
import { useEscolasWithFilters, useVeiculosWithFilters } from "@/hooks";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useLayout } from "@/contexts/LayoutContext";
import { Passageiro } from "@/types/passageiro";
import { formatarPlacaExibicao } from "@/utils/domain";
import { monthOptions } from "@/utils/dateUtils";

interface QuickStartPassageiroDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (passageiro?: Passageiro) => void;
  usuarioId?: string;
}

export function QuickStartPassageiroDialog({
  isOpen,
  onClose,
  onSuccess,
  usuarioId,
}: QuickStartPassageiroDialogProps) {
  const { form, isSubmitting, handleSubmit, onFormError, handleFillMock } = usePassageiroQuickStartForm({
    onSuccess: (passageiro) => {
      onSuccess?.(passageiro);
      onClose();
    },
    usuarioId,
  });

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
        escola_id: "",
        veiculo_id: "",
      });
    }
  }, [isOpen, form]);

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      maxWidth="lg"
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
            onClick={() => handleFillMock(escolasList, veiculosList)}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-5 w-5" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-5 py-2 px-1"
          >
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-2 flex items-center gap-4 shadow-sm">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100/50 text-[#1a3a5c] shrink-0 border border-blue-200/50">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                Esses são apenas os dados essenciais. Você poderá completar o cadastro depois acessando a carteirinha digital.
              </p>
            </div>

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
                    label="WhatsApp Responsável"
                    required
                    labelClassName="text-slate-700 font-semibold ml-1"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  />
                )}
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mes_inicio_cobranca"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Mês Início Cobrança <span className="text-red-600">*</span>
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
                      Mês Término Cobrança <span className="text-red-600">*</span>
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
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={onClose}
          disabled={isSubmitting}
        />
        <BaseDialog.Action
          label="Cadastrar"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
