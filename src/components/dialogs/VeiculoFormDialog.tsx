import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
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
import { useCreateVeiculo, useUpdateVeiculo } from "@/hooks";
import { useProfile } from "@/hooks/business/useProfile";
import { useSession } from "@/hooks/business/useSession";
import { Veiculo } from "@/types/veiculo";
import { updateQuickStartStepWithRollback } from "@/utils/domain/quickstart/quickStartUtils";
import {
  aplicarMascaraPlaca,
  validarPlaca,
} from "@/utils/domain/veiculo/placaUtils";
import { toast } from "@/utils/notifications/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, Hash, Loader2, Tag, X } from "lucide-react";
import { useEffect } from "react";
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
  onSuccess: (veiculo: Veiculo) => void;
  profile?: any; // Passar profile como prop para evitar chamadas duplicadas de useProfile
}

export default function VeiculoFormDialog({
  isOpen,
  onClose,
  editingVeiculo = null,
  onSuccess,
  profile: profileProp,
}: VeiculoFormDialogProps) {
  const { user } = useSession();
  // Só chamar useProfile se não receber profile como prop e o dialog estiver aberto
  const { profile: profileFromHook } = useProfile(
    profileProp ? undefined : isOpen ? user?.id : undefined
  );
  const profile = profileProp || profileFromHook;

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
    if (!isOpen)
      form.reset({
        placa: "",
        marca: "",
        modelo: "",
        ativo: true,
      });
  }, [isOpen]);

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
            onSuccess(veiculoSalvo);
            onClose();
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
            onClose();
          },
        }
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md bg-white rounded-3xl border-0 shadow-2xl overflow-hidden p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        hideCloseButton
      >
        <div className="bg-blue-600 p-6 text-center relative">
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <div className="mx-auto bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
            <Car className="w-6 h-6 text-white" />
          </div>
          <DialogTitle className="text-2xl font-bold text-white">
            {editingVeiculo ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
          <p className="text-blue-100 text-sm mt-1">
            Preencha os dados do veículo abaixo
          </p>
        </div>

        <div className="p-6 pt-2">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit, onFormError)}
              className="space-y-4"
            >
              <FormField
                name="placa"
                control={form.control}
                render={({ field }) => (
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
                          className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all uppercase"
                          onChange={(e) => {
                            const masked = aplicarMascaraPlaca(e.target.value);
                            field.onChange(masked);
                          }}
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
                  render={({ field }) => (
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
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
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
                  render={({ field }) => (
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
                            className="pl-12 h-12 rounded-xl bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
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
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-5 w-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <FormLabel className="flex-1 cursor-pointer font-medium text-gray-700 m-0 mt-0">
                        Veículo Ativo
                      </FormLabel>
                    </FormItem>
                  )}
                />
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl text-gray-600 hover:bg-gray-100 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                      Salvando...
                    </>
                  ) : (
                    "Salvar Veículo"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
