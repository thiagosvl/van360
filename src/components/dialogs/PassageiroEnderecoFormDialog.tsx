import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
import { Form } from "@/components/ui/form";
import { FormEnderecoFields } from "@/components/forms";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUpdatePassageiro } from "@/hooks/api/usePassageiroMutations";
import { toast } from "@/utils/notifications/toast";
import { MapPin, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockGenerator } from "@/utils/mocks/generator";

const passageiroEnderecoSchema = z.object({
  cep: z.string().optional().nullable(),
  logradouro: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  numero: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  complemento: z.string().optional().nullable(),
  bairro: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  cidade: z.string({ required_error: "Campo obrigatório" }).min(1, "Campo obrigatório"),
  estado: z.string({ required_error: "Campo obrigatório" }).min(2, "Selecione o estado"),
  referencia: z.string().optional().nullable(),
});

type PassageiroEnderecoFormData = z.infer<typeof passageiroEnderecoSchema>;

interface PassageiroEnderecoFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  nomePassageiro: string;
  onSuccess: (addressData?: PassageiroEnderecoFormData) => void;
}

export default function PassageiroEnderecoFormDialog({
  isOpen,
  onClose,
  passageiroId,
  onSuccess,
}: PassageiroEnderecoFormDialogProps) {
  const updatePassageiro = useUpdatePassageiro();
  const isSaving = updatePassageiro.isPending;

  const form = useForm<PassageiroEnderecoFormData>({
    resolver: zodResolver(passageiroEnderecoSchema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      referencia: "",
    },
    mode: "onBlur",
  });

  const handleFillMock = () => {
    const mockData = mockGenerator.address();
    form.reset({
      cep: mockData.cep,
      logradouro: mockData.logradouro,
      numero: mockData.numero,
      complemento: mockData.complemento || "",
      bairro: mockData.bairro,
      cidade: mockData.cidade,
      estado: mockData.estado,
      referencia: mockData.referencia || "",
    });
  };

  const onSubmit = async (data: PassageiroEnderecoFormData) => {
    try {
      await updatePassageiro.mutateAsync({
        id: passageiroId,
        data: {
          logradouro: data.logradouro.trim(),
          numero: data.numero.trim(),
          bairro: data.bairro.trim(),
          cidade: data.cidade.trim(),
          estado: data.estado,
          cep: data.cep?.trim() || undefined,
          complemento: data.complemento?.trim() || undefined,
          referencia: data.referencia?.trim() || undefined,
        },
        showToast: false,
      });

      onSuccess(data);
      onClose();
    } catch (err) {
      toast.error("Erro ao salvar endereço do passageiro.");
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && onClose()} maxWidth="xl">
      <BaseDialog.Header
        title={`Incluir Endereço`}
        icon={<MapPin className="w-5 h-5" />}
        onClose={onClose}
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pb-4">
            <FormEnderecoFields required />
          </form>
        </Form>
      </BaseDialog.Body>
      <BaseDialog.Footer>
        <BaseDialog.Action
          variant="secondary"
          label="Cancelar"
          onClick={onClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label={isSaving ? "Salvando" : "Salvar"}
          onClick={form.handleSubmit(onSubmit)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
