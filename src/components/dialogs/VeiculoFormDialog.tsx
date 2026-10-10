import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
import { Usuario } from "@/types/usuario";
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
            className="h-9 w-9 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#eeeeee] transition-all active:scale-95 shadow-none"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <Form {...form}>
          <form
            id="veiculo-form"
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-4 pb-4"
          >
            <FormField
              name="placa"
              control={form.control}
              render={({ field, fieldState }) => (
                <FormItem className="space-y-1.5">
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                    Placa <span className="text-[#e7000b]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Hash className={cn(
                        "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                        fieldState.error ? "text-[#e7000b]" : "text-[#737373]"
                      )} />
                      <Input
                        {...field}
                        maxLength={8}
                        placeholder="Ex: ABC-1234"
                        className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all uppercase"
                        onChange={(e) => {
                          const masked = aplicarMascaraPlaca(e.target.value);
                          field.onChange(masked);
                        }}
                        aria-invalid={!!fieldState.error}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs text-[#e7000b]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                name="marca"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Marca <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Tag className={cn(
                          "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                          fieldState.error ? "text-[#e7000b]" : "text-[#737373]"
                        )} />
                        <Input
                          placeholder="Ex: Fiat"
                          {...field}
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-[#e7000b]" />
                  </FormItem>
                )}
              />
              <FormField
                name="modelo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                      Modelo <span className="text-[#e7000b]">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Car className={cn(
                          "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
                          fieldState.error ? "text-[#e7000b]" : "text-[#737373]"
                        )} />
                        <Input
                          placeholder="Ex: Ducato"
                          {...field}
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] text-sm text-[#0a0a0a] placeholder:text-[#737373] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] transition-all"
                          aria-invalid={!!fieldState.error}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-[#e7000b]" />
                  </FormItem>
                )}
              />
            </div>

            {editingVeiculo && (
              <FormField
                name="ativo"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] p-3.5 sm:p-4">
                    <div className="space-y-0.5 pr-4">
                      <FormLabel className="text-[#0a0a0a] font-medium text-xs sm:text-sm cursor-pointer block">
                        Veículo Ativo
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={!!field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary"
                        aria-label="Veículo Ativo"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            {allowBatchCreation && !editingVeiculo && (
              <div className="flex items-center gap-3 p-3.5 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5]">
                <Checkbox
                  id="keepOpen"
                  checked={keepOpen}
                  onCheckedChange={(checked) =>
                    setKeepOpen(checked as boolean)
                  }
                  className="h-4 w-4 rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-[#0a0a0a] data-[state=checked]:border-[#0a0a0a]"
                />
                <label
                  htmlFor="keepOpen"
                  className="flex-1 cursor-pointer font-medium text-[#0a0a0a] m-0 text-xs sm:text-sm"
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
          onClick={() => safeCloseDialog(onClose)}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label={editingVeiculo ? "Atualizar" : "Salvar"}
          type="submit"
          onClick={form.handleSubmit(handleSubmit, onFormError)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
