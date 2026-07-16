import { FormEnderecoFields, PhoneInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { phoneSchema } from "@/schemas/common";
import { ParentescoResponsavel } from "@/types/enums";
import { PassageiroResponsavel } from "@/types/passageiro";
import { parentescos } from "@/utils/formatters";
import { cepMask, cpfMask, phoneMask } from "@/utils/masks";
import { isValidCEPFormat, isValidCPF } from "@/utils/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { Contact, Hash, MapPin, User, Wand2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { mockGenerator } from "@/utils/mocks/generator";
import {
  useCreateResponsavelAdicional,
  useUpdateResponsavelAdicional,
  useSetPrincipalResponsavel,
} from "@/hooks";

const responsavelSchema = z.object({
  nome: z.string().min(2, "Deve ter pelo menos 2 caracteres"),
  telefone: phoneSchema,
  cpf: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => !val || isValidCPF(val), {
      message: "CPF inválido",
    }),
  parentesco: z.nativeEnum(ParentescoResponsavel, { errorMap: () => ({ message: "Campo obrigatório" }) }),
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine((val) => isValidCEPFormat(val), {
      message: "Formato inválido (00000-000)",
    }),
  logradouro: z.string().min(1, "Logradouro é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  bairro: z.string().min(1, "Bairro é obrigatório"),
  cidade: z.string().min(1, "Cidade é obrigatório"),
  estado: z.string().min(1, "Estado é obrigatório"),
  referencia: z.string().optional().nullable().or(z.literal("")),
  tornar_principal: z.boolean().optional().default(false),
});

type ResponsavelFormData = z.infer<typeof responsavelSchema>;

interface ResponsavelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  editingResponsavel: PassageiroResponsavel | null;
  onSuccess?: () => void;
}

export default function ResponsavelFormDialog({
  isOpen,
  onClose,
  passageiroId,
  editingResponsavel,
  onSuccess,
}: ResponsavelFormDialogProps) {
  const createResponsavel = useCreateResponsavelAdicional();
  const updateResponsavel = useUpdateResponsavelAdicional();
  const setPrincipal = useSetPrincipalResponsavel();

  const isSubmitting = createResponsavel.isPending || updateResponsavel.isPending || setPrincipal.isPending;

  const handleFillMock = () => {
    const mockName = mockGenerator.name();
    const mockAddress = mockGenerator.address();
    const parentescosList: ParentescoResponsavel[] = [
      ParentescoResponsavel.PAI,
      ParentescoResponsavel.MAE,
      ParentescoResponsavel.AVO,
      ParentescoResponsavel.TIO,
      ParentescoResponsavel.OUTRO,
    ];
    const randomParentesco = parentescosList[Math.floor(Math.random() * parentescosList.length)];

    form.reset({
      nome: mockName,
      telefone: mockGenerator.phone(),
      cpf: mockGenerator.cpf(),
      parentesco: randomParentesco,
      cep: cepMask(mockAddress.cep),
      logradouro: mockAddress.logradouro,
      numero: mockAddress.numero,
      bairro: mockAddress.bairro,
      cidade: mockAddress.cidade,
      estado: mockAddress.estado,
      referencia: mockAddress.referencia || "",
      tornar_principal: false,
    });
  };

  const form = useForm<ResponsavelFormData>({
    resolver: zodResolver(responsavelSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      cpf: "",
      parentesco: "" as ParentescoResponsavel,
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      tornar_principal: false,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingResponsavel) {
        form.reset({
          nome: editingResponsavel.nome,
          telefone: phoneMask(editingResponsavel.telefone),
          cpf: cpfMask(editingResponsavel.cpf),
          parentesco: editingResponsavel.parentesco,
          logradouro: editingResponsavel.logradouro || "",
          numero: editingResponsavel.numero || "",
          bairro: editingResponsavel.bairro || "",
          cidade: editingResponsavel.cidade || "",
          estado: editingResponsavel.estado || "",
          cep: editingResponsavel.cep ? cepMask(editingResponsavel.cep) : "",
          referencia: editingResponsavel.referencia || "",
          tornar_principal: false,
        });
      } else {
        form.reset({
          nome: "",
          telefone: "",
          cpf: "",
          parentesco: "" as ParentescoResponsavel,
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          referencia: "",
          tornar_principal: false,
        });
      }
    }
  }, [isOpen, editingResponsavel, form]);

  const handleSubmit = async (data: ResponsavelFormData) => {
    const payload = {
      nome: data.nome,
      telefone: data.telefone.replace(/\D/g, ""),
      cpf: data.cpf.replace(/\D/g, ""),
      parentesco: data.parentesco as ParentescoResponsavel,
      logradouro: data.logradouro || null,
      numero: data.numero || null,
      bairro: data.bairro || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep?.replace(/\D/g, "") || null,
      referencia: data.referencia || null,
    };

    const successCallback = () => {
      onClose();
      if (onSuccess) onSuccess();
    };

    try {
      if (editingResponsavel && editingResponsavel.id) {
        await updateResponsavel.mutateAsync({
          responsavelId: editingResponsavel.id,
          passageiroId,
          data: payload,
        });

        if (data.tornar_principal) {
          await setPrincipal.mutateAsync({
            passageiroId,
            responsavelId: editingResponsavel.id,
          });
        }
        successCallback();
      } else {
        const response = await createResponsavel.mutateAsync({
          passageiroId,
          data: payload,
        });

        // Backend should return the created object. Assuming it contains an `id` field.
        if (data.tornar_principal && response?.id) {
          await setPrincipal.mutateAsync({
            passageiroId,
            responsavelId: response.id,
          });
        }
        successCallback();
      }
    } catch (error) {
      console.error("Erro ao processar responsável:", error);
    }
  };

  const title = editingResponsavel ? "Editar Responsável" : "Adicionar Responsável";

  return (
    <BaseDialog
      maxWidth="2xl" open={isOpen} onOpenChange={onClose} lockClose={isSubmitting}>
      <BaseDialog.Header
        title={title}
        icon={<Contact className="w-5 h-5" />}
        onClose={onClose}
        leftAction={import.meta.env.DEV && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm border border-slate-100"
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
            id="responsavel-adicional-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8 pt-4 pb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Nome <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <Input
                          {...field}
                          placeholder="Nome completo do responsável"
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
                name="telefone"
                render={({ field }) => (
                  <PhoneInput
                    field={field}
                    label="WhatsApp"
                    required
                    labelClassName="text-slate-700 font-semibold ml-1"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      CPF <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          onChange={(e) => {
                            field.onChange(cpfMask(e.target.value));
                          }}
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
                name="parentesco"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      Parentesco <span className="text-red-600">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            "h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] focus:ring-[#1a3a5c]/5 text-base",
                            fieldState.error && "border-red-500"
                          )}
                        >
                          <SelectValue placeholder="Selecione o parentesco" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {parentescos.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <hr className="border-slate-100" />

            <section className="space-y-6">
              <div className="flex items-center gap-3 text-lg font-semibold text-slate-800 mb-6">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                Endereço do Responsável
              </div>
              <FormEnderecoFields required={true} />
            </section>

            <FormField
              control={form.control}
              name="tornar_principal"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-0">
                  <Checkbox
                    id="tornar_principal"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-5 w-5 rounded-md border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
                  />
                  <FormLabel
                    htmlFor="tornar_principal"
                    className="flex-1 cursor-pointer font-medium text-slate-700 m-0 mt-0"
                  >
                    Definir como responsável principal
                  </FormLabel>
                </FormItem>
              )}
            />
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
          label="Salvar"
          onClick={form.handleSubmit(handleSubmit)}
          isLoading={isSubmitting}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
