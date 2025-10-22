import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
import { useToast } from "@/hooks/use-toast";
import { veiculoService } from "@/services/veiculoService";
import { Veiculo } from "@/types/veiculo";
import {
  aplicarMascaraPlaca,
  limparPlaca,
  validarPlaca,
} from "@/utils/placaUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
  chassi: z.string().optional(),
  prefixo: z.string().optional(),
  ano_fabricacao: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{4}$/.test(val), "Ano inválido"),
  ano_modelo: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]{4}$/.test(val), "Ano inválido"),
  renavam: z.string().optional(),
  teg: z.boolean().optional(),
  modalidade: z.string().optional(),
  capacidade: z
    .string()
    .optional()
    .refine((val) => !val || /^[0-9]+$/.test(val), "Somente números"),
  cor: z.string().optional(),
  ativo: z.boolean().optional(),
});

type VeiculoFormData = z.infer<typeof veiculoSchema>;

interface VeiculoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingVeiculo?: Veiculo | null;
  onSuccess: (veiculo: Veiculo) => void;
}

export default function VeiculoFormDialog({
  isOpen,
  onClose,
  editingVeiculo = null,
  onSuccess,
}: VeiculoFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<VeiculoFormData>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      placa: editingVeiculo?.placa
        ? aplicarMascaraPlaca(editingVeiculo?.placa)
        : "",
      marca: editingVeiculo?.marca || "",
      modelo: editingVeiculo?.modelo || "",
      ano_fabricacao: editingVeiculo?.ano_fabricacao?.toString() || "",
      ano_modelo: editingVeiculo?.ano_modelo?.toString() || "",
      capacidade: editingVeiculo?.capacidade?.toString() || "",
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
        ano_fabricacao: "",
        ano_modelo: "",
        capacidade: "",
        ativo: true,
      });
  }, [isOpen]);

  const onFormError = (errors: any) => {
    toast({
      title: "Corrija os erros no formulário.",
      variant: "destructive",
    });
  };

  const handleSubmit = async (data: VeiculoFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        placa: limparPlaca(data.placa),
        capacidade: data.capacidade ? parseInt(data.capacidade) : null,
      };
      const veiculoSalvo = await veiculoService.saveVeiculo(
        payload,
        editingVeiculo
      );
      toast({
        title: `Veículo ${
          editingVeiculo ? "atualizado" : "cadastrado"
        } com sucesso.`,
      });
      onSuccess(veiculoSalvo);
      onClose();
    } catch (error: any) {
      if (error.message.includes("passageiros ativos")) {
        toast({
          title: "Não é possível desativar.",
          description: error.message,
          variant: "destructive",
        });
      } else if (error && error.code == "23505") {
        toast({
          title: "Erro ao salvar veículo",
          description: "Essa placa já foi cadastrada no sistema.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Erro ao salvar escola", variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-3xl max-h-[95vh] overflow-y-auto bg-white"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {editingVeiculo ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit, onFormError)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <FormField
                name="placa"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Placa *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        maxLength={8}
                        onChange={(e) => {
                          const masked = aplicarMascaraPlaca(e.target.value);
                          field.onChange(masked);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="marca"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Fiat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="modelo"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ducato Minibus" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="capacidade"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="col-span-2 md:col-span-1">
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="ano_modelo"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Modelo</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="ano_fabricacao"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Fabricação</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {editingVeiculo && (
                <FormField
                  name="ativo"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <FormLabel>Ativo</FormLabel>
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
