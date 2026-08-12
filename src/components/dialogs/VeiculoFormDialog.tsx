import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { BaseDialog } from "@/components/ui/BaseDialog";
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
import {
  useCreateVeiculo,
  useUpdateVeiculo,
} from "@/hooks/api/useVeiculoMutations";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Veiculo } from "@/types/veiculo";
import { cn } from "@/lib/utils";

import {
  aplicarMascaraPlaca,
  validarPlaca,
} from "@/utils/domain/veiculo/placaUtils";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Hash, Tag, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { safeCloseDialog } from "@/hooks";

import { veiculoSchema, VeiculoFormData } from "@/hooks/form/useVeiculoForm";

interface VeiculoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingVeiculo?: Veiculo | null;
  onSuccess: (veiculo: Veiculo, keepOpen?: boolean) => void;
  profile?: Usuario | null;
  allowBatchCreation?: boolean;
}

export default function VeiculoFormDialog({
  isOpen,
  onClose,
  editingVeiculo = null,
  onSuccess,
  profile: profileProp,
  allowBatchCreation = false,
}: VeiculoFormDialogProps) {
  const { user } = useSession();
  const { profile: profileFromHook } = useProfile(
    profileProp ? undefined : isOpen ? user?.id : undefined,
  );
  const profile = profileProp || profileFromHook;

  const [keepOpen, setKeepOpen] = useState(false);

  const createVeiculo = useCreateVeiculo();
  const updateVeiculo = useUpdateVeiculo();

  const isSaving = createVeiculo.isPending || updateVeiculo.isPending;

  const form = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      placa: editingVeiculo?.placa
        ? aplicarMascaraPlaca(editingVeiculo?.placa)
        : "",
      marca: editingVeiculo?.marca || "",
      modelo: editingVeiculo?.modelo || "",
      ativo: editingVeiculo?.ativo ?? true,
    },
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (editingVeiculo) {
        form.reset({
          placa: aplicarMascaraPlaca(editingVeiculo.placa),
          marca: editingVeiculo.marca,
          modelo: editingVeiculo.modelo,
          ativo: editingVeiculo.ativo,
        });
      } else {
        if (!keepOpen) {
          form.reset({
            placa: "",
            marca: "",
            modelo: "",
            ativo: true,
          });
        }
      }
    } else {
      setKeepOpen(false);
    }
  }, [isOpen, editingVeiculo, form]);

  const onFormError = (errors: any) => {
    toast.error("validacao.formularioComErros");
  };

  const handleFillMock = () => {
    const mockData = mockGenerator.veiculo();
    form.reset({
      placa: mockData.placa,
      marca: mockData.marca,
      modelo: mockData.modelo,
      ativo: mockData.ativo ?? true,
    });
  };

  const handleSubmit = async (data: VeiculoFormData) => {
    if (!profile?.id) return;

    if (
      editingVeiculo &&
      editingVeiculo.ativo &&
      data.ativo === false &&
      editingVeiculo.passageiros_ativos_count > 0
    ) {
      toast.error("veiculo.erro.desativar", {
        description: "veiculo.erro.desativarComPassageiros",
      });
      return;
    }

    if (editingVeiculo == null) {
      createVeiculo.mutate(
        { usuarioId: profile.id, data },
        {
          onSuccess: (veiculoSalvo) => {
            onSuccess(veiculoSalvo, keepOpen);

            if (keepOpen) {
              form.reset({
                placa: "",
                marca: "",
                modelo: "",
                ativo: true,
              });

              setTimeout(() => {
                form.setFocus("placa");
                setKeepOpen(false);
              }, 100);
            } else {
              onClose();
            }
          },
          onError: (error: any) => {
            if (error.response?.status === 409) {
              form.setError("placa", {
                type: "manual",
                message: "veiculo.erro.placaJaCadastrada",
              });
            } else {
              toast.error("veiculo.erro.criar", {
                description:
                  error?.response?.data?.error || "erro.generico",
              });
            }
          },
        },
      );
    } else {
      updateVeiculo.mutate(
        { id: editingVeiculo.id, data },
        {
          onSuccess: (veiculoSalvo) => {
            onSuccess(veiculoSalvo);
            onClose();
          },
          onError: (error: any) => {
            if (error.response?.status === 409) {
              form.setError("placa", {
                type: "manual",
                message: "veiculo.erro.placaJaCadastrada",
              });
            } else {
              toast.error("veiculo.erro.atualizar", {
                description:
                  error?.response?.data?.error || "erro.generico",
              });
            }
          },
        },
      );
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isSaving}>
      <BaseDialog.Header
        title={editingVeiculo ? "Editar Veículo" : "Novo Veículo"}
        onClose={() => safeCloseDialog(onClose)}
        hideCloseButton={isSaving}
        leftAction={isDevEnv() && (
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
            id="veiculo-form"
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4 pb-6"
          >
            <FormField
              name="placa"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-slate-700 font-semibold ml-1">
                    Placa <span className="text-red-600">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className={cn(
                        "absolute left-4 top-3.5 h-5 w-5 transition-colors",
                        fieldState.error ? "text-red-400" : "text-slate-400 opacity-60"
                      )} />
                      <Input
                        {...field}
                        maxLength={8}
                        placeholder="Ex: ABC-1234"
                        className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all uppercase"
                        onChange={(e) => {
                          const masked = aplicarMascaraPlaca(e.target.value);
                          field.onChange(masked);
                        }}
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
                name="marca"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Marca <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className={cn(
                          "absolute left-4 top-3.5 h-5 w-5 transition-colors",
                          fieldState.error ? "text-red-400" : "text-slate-400 opacity-60"
                        )} />
                        <Input
                          placeholder="Ex: Fiat"
                          {...field}
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="modelo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Modelo <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Car className={cn(
                          "absolute left-4 top-3.5 h-5 w-5 transition-colors",
                          fieldState.error ? "text-red-400" : "text-slate-400 opacity-60"
                        )} />
                        <Input
                          placeholder="Ex: Ducato"
                          {...field}
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base transition-all"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {editingVeiculo && (
              <FormField
                name="ativo"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0 transition-all hover:bg-slate-100/50">
                    <Checkbox
                      id="ativo"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <FormLabel
                      htmlFor="ativo"
                      className="flex-1 cursor-pointer font-medium text-slate-700 m-0 text-sm"
                    >
                      Veículo Ativo
                    </FormLabel>
                  </FormItem>
                )}
              />
            )}
            {allowBatchCreation && !editingVeiculo && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <Checkbox
                  id="keepOpen"
                  checked={keepOpen}
                  onCheckedChange={(checked) =>
                    setKeepOpen(checked as boolean)
                  }
                  className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="keepOpen"
                  className="flex-1 cursor-pointer font-medium text-slate-700 m-0 text-sm"
                >
                  Cadastrar outro em seguida
                </label>
              </div>
            )}
          </form>
        </Form>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label="Salvar"
          type="submit"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
