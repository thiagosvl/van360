import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogTitle
} from "@/components/ui/dialog";
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
import { safeCloseDialog } from "@/utils/dialogUtils";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import {
    aplicarMascaraPlaca,
    validarPlaca,
} from "@/utils/domain/veiculo/placaUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Hash, Loader2, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const veiculoSchema = z.object({
  placa: z
    .string({ required_error: "Campo obrigatório" })
    .min(7, "Campo obrigatório")
    .refine((val) => validarPlaca(val), "Placa inválida"),
  marca: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório"),
  modelo: z
    .string({ required_error: "Campo obrigatório" })
    .min(1, "Campo obrigatório"),
  ativo: z.boolean().optional(),
});

type VeiculoFormData = z.infer<typeof veiculoSchema>;

interface VeiculoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingVeiculo?: Veiculo | null;
  onSuccess: (veiculo: Veiculo, keepOpen?: boolean) => void;
  profile?: any;
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
    profileProp ? undefined : isOpen ? user?.id : undefined
  );
  const profile = profileProp || profileFromHook;

  const [keepOpen, setKeepOpen] = useState(false);

  const createVeiculo = useCreateVeiculo();
  const updateVeiculo = useUpdateVeiculo();

  const loading = createVeiculo.isPending || updateVeiculo.isPending;

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

    // Preparar rollback do QuickStart apenas para criações (não para edições)
    const shouldUpdateQuickStart = editingVeiculo == null;
    const quickStartRollback = shouldUpdateQuickStart
      ? updateQuickStartStepWithRollback("step_veiculos")
      : null;

    if (editingVeiculo == null) {
      // Criação de veículo
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
                safeCloseDialog(() => {
                    onClose();
                });
            }
          },
          onError: (error: any) => {
            // Reverter QuickStart em caso de erro
            if (quickStartRollback) {
              quickStartRollback.restore();
            }

            if (error?.response?.data?.error?.includes("duplicate key value")) {
              toast.error("veiculo.erro.criar", {
                description: "veiculo.erro.placaJaCadastrada",
              });
            }
          },
        }
      );
    } else {
      // Atualização de veículo
      updateVeiculo.mutate(
        { id: editingVeiculo.id, data },
        {
          onSuccess: (veiculoSalvo) => {
            onSuccess(veiculoSalvo);
            safeCloseDialog(onClose);
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => safeCloseDialog(onClose)}>
      <DialogContent
        className="w-full max-w-md p-0 gap-0 bg-gray-50 h-full max-h-screen sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden sm:rounded-3xl border-0 shadow-2xl"
        hideCloseButton
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="bg-blue-600 p-4 text-center relative shrink-0">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center mb-2 backdrop-blur-sm">
            <Car className="w-5 h-5 text-white" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {editingVeiculo ? "Editar Veículo" : "Cadastrar Veículo"}
          </DialogTitle>
        </div>

        <div className="p-4 sm:p-6 pt-2 bg-white flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-4"
            >
              <FormField
                name="placa"
                control={form.control}
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium ml-1">
                      Placa <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                        <Input
                          {...field}
                          maxLength={8}
                          placeholder="ABC-1234"
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all uppercase"
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
                      <FormLabel className="text-gray-700 font-medium ml-1">
                        Marca <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Tag className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Ex: Fiat"
                            {...field}
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                      <FormLabel className="text-gray-700 font-medium ml-1">
                        Modelo <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Car className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="Ex: Ducato"
                            {...field}
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
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
                    <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-0">
                      <Checkbox
                        id="ativo"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <FormLabel
                        htmlFor="ativo"
                        className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0"
                      >
                        Veículo Ativo
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}
              {allowBatchCreation && !editingVeiculo && (
                <div className="flex items-center gap-2 px-1 pt-4">
                    <Checkbox
                      id="keepOpen"
                      checked={keepOpen}
                      onCheckedChange={(checked) =>
                        setKeepOpen(checked as boolean)
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="keepOpen"
                      className="text-sm font-medium text-gray-600 cursor-pointer select-none"
                    >
                      Cadastrar outro em seguida
                    </label>
                  </div>
              )}
            </form>
          </Form>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0 grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => safeCloseDialog(onClose)}
            disabled={loading}
            className="w-full h-11 rounded-xl border-gray-200 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit, onFormError)}
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all hover:-translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
