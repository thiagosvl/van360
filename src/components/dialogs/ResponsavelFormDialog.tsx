import { FormEnderecoFields, PhoneInput } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { isDevEnv } from "@/utils/detectPlatform";
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
import { Contact, Hash, MapPin, User, Wand2, MessageSquare, FileText, Mail } from "lucide-react";
import { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "sonner";
import {
  useCreateResponsavelAdicional,
  useUpdateResponsavelAdicional,
  useSetPrincipalResponsavel,
  useBuscarResponsavel,
} from "@/hooks";
import {
  useAddResponsavelResponsavelMutation,
  useUpdateResponsavelResponsavelMutation,
  useSetPrincipalResponsavelResponsavelMutation,
} from "@/hooks/api/useResponsavelAuthApi";
import { useResponsavelAuth } from "@/contexts/ResponsavelAuthContext";
import { STORAGE_KEYS } from "@/constants";

const responsavelSchema = z.object({
  nome: z.string().min(1, "Campo obrigatório").min(2, "Deve ter pelo menos 2 caracteres"),
  telefone: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => !val || val.replace(/\D/g, "").length >= 10, {
      message: "Telefone inválido",
    }),
  cpf: z
    .string()
    .min(1, "Campo obrigatório")
    .refine((val) => !val || isValidCPF(val), {
      message: "CPF inválido",
    }),
  email: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "E-mail inválido",
    }),
  parentesco: z.nativeEnum(ParentescoResponsavel, { errorMap: () => ({ message: "Campo obrigatório" }) }),
  logradouro: z.string().optional().nullable().or(z.literal("")),
  numero: z.string().optional().nullable().or(z.literal("")),
  bairro: z.string().optional().nullable().or(z.literal("")),
  cidade: z.string().optional().nullable().or(z.literal("")),
  estado: z.string().optional().nullable().or(z.literal("")),
  cep: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine((val) => !val || isValidCEPFormat(val), {
      message: "Formato inválido (00000-000)",
    }),
  referencia: z.string().optional().nullable().or(z.literal("")),
  complemento: z.string().optional().nullable().or(z.literal("")),
  tornar_principal: z.boolean().optional().default(false),
});

type ResponsavelFormData = z.infer<typeof responsavelSchema>;

interface ResponsavelFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  passageiroId: string;
  editingResponsavel?: PassageiroResponsavel | null;
  onSuccess?: () => void;
  isResponsavelPortal?: boolean;
}

export default function ResponsavelFormDialog({
  isOpen,
  onClose,
  passageiroId,
  editingResponsavel,
  onSuccess,
  isResponsavelPortal = false,
}: ResponsavelFormDialogProps) {
  const { token } = useResponsavelAuth();
  const createResponsavel = useCreateResponsavelAdicional();
  const updateResponsavel = useUpdateResponsavelAdicional();
  const setPrincipal = useSetPrincipalResponsavel();

  const addResponsavelResponsavel = useAddResponsavelResponsavelMutation();
  const updateResponsavelResponsavel = useUpdateResponsavelResponsavelMutation();
  const setPrincipalResponsavel = useSetPrincipalResponsavelResponsavelMutation();

  const alertRef = useRef<HTMLDivElement>(null);

  const isSubmitting =
    createResponsavel.isPending ||
    updateResponsavel.isPending ||
    setPrincipal.isPending ||
    addResponsavelResponsavel.isPending ||
    updateResponsavelResponsavel.isPending ||
    setPrincipalResponsavel.isPending;

  const searchedTermsSet = useRef<Set<string>>(new Set());

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
      email: mockGenerator.email("thiago"),
      parentesco: randomParentesco,
      cep: cepMask(mockAddress.cep),
      logradouro: mockAddress.logradouro,
      numero: mockAddress.numero,
      bairro: mockAddress.bairro,
      cidade: mockAddress.cidade,
      estado: mockAddress.estado,
      referencia: mockAddress.referencia || "",
      complemento: mockAddress.complemento || "",
      tornar_principal: false,
    });
  };

  const form = useForm<ResponsavelFormData>({
    resolver: zodResolver(responsavelSchema),
    defaultValues: {
      nome: "",
      telefone: "",
      cpf: "",
      email: "",
      parentesco: "" as ParentescoResponsavel,
      logradouro: "",
      numero: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      referencia: "",
      complemento: "",
      tornar_principal: false,
    },
  });

  const { mutateAsync: lookupResponsavel } = useBuscarResponsavel();

  const handleSearchResponsavel = useCallback(async (term: string) => {
    if (editingResponsavel) return;
    const pureTerm = String(term || "").replace(/\D/g, "");
    if (pureTerm.length !== 11) return;
    if (searchedTermsSet.current.has(pureTerm)) return;

    try {
      searchedTermsSet.current.add(pureTerm);
      const responsavel = await lookupResponsavel({ term: pureTerm });

      if (responsavel) {
        if (responsavel.cpf) {
          searchedTermsSet.current.add(String(responsavel.cpf).replace(/\D/g, ""));
        }
        if (responsavel.telefone) {
          searchedTermsSet.current.add(String(responsavel.telefone).replace(/\D/g, ""));
        }

        if (responsavel.nome) {
          form.setValue("nome", responsavel.nome, { shouldValidate: true });
        }
        if (responsavel.telefone) {
          form.setValue("telefone", phoneMask(responsavel.telefone), { shouldValidate: true });
        }
        if (responsavel.cpf) {
          form.setValue("cpf", cpfMask(responsavel.cpf), { shouldValidate: true });
        }
        if (responsavel.email) {
          form.setValue("email", responsavel.email, { shouldValidate: true });
        }
        if (responsavel.parentesco) {
          form.setValue("parentesco", responsavel.parentesco as ParentescoResponsavel, { shouldValidate: true });
        }
        if (responsavel.logradouro) form.setValue("logradouro", responsavel.logradouro);
        if (responsavel.numero) form.setValue("numero", responsavel.numero);
        if (responsavel.bairro) form.setValue("bairro", responsavel.bairro);
        if (responsavel.cidade) form.setValue("cidade", responsavel.cidade);
        if (responsavel.estado) form.setValue("estado", responsavel.estado);
        if (responsavel.cep) form.setValue("cep", cepMask(responsavel.cep));
        if (responsavel.referencia) form.setValue("referencia", responsavel.referencia);
        if (responsavel.complemento) form.setValue("complemento", responsavel.complemento);

        toast.info("Dados do responsável encontrados e preenchidos automaticamente!", {
          id: "lookup-responsavel-found"
        });
      }
    } catch {
    }
  }, [editingResponsavel, lookupResponsavel, form]);

  useEffect(() => {
    if (!isOpen) {
      searchedTermsSet.current.clear();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (editingResponsavel) {
        form.reset({
          nome: editingResponsavel.nome,
          telefone: phoneMask(editingResponsavel.telefone),
          cpf: cpfMask(editingResponsavel.cpf),
          email: editingResponsavel.email || "",
          parentesco: editingResponsavel.parentesco,
          logradouro: editingResponsavel.logradouro || "",
          numero: editingResponsavel.numero || "",
          bairro: editingResponsavel.bairro || "",
          cidade: editingResponsavel.cidade || "",
          estado: editingResponsavel.estado || "",
          cep: editingResponsavel.cep ? cepMask(editingResponsavel.cep) : "",
          referencia: editingResponsavel.referencia || "",
          complemento: editingResponsavel.complemento || "",
          tornar_principal: false,
        });
      } else {
        form.reset({
          nome: "",
          telefone: "",
          cpf: "",
          email: "",
          parentesco: "" as ParentescoResponsavel,
          logradouro: "",
          numero: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          referencia: "",
          complemento: "",
          tornar_principal: false,
        });
      }
    }
  }, [isOpen, editingResponsavel, form]);

  const cpfValue = form.watch("cpf");
  const telefoneValue = form.watch("telefone");

  useEffect(() => {
    const pureCpf = cpfValue ? String(cpfValue).replace(/\D/g, "") : "";
    if (pureCpf && pureCpf.length === 11) {
      handleSearchResponsavel(pureCpf);
    }
  }, [cpfValue, handleSearchResponsavel]);

  useEffect(() => {
    const purePhone = telefoneValue ? String(telefoneValue).replace(/\D/g, "") : "";
    if (purePhone && purePhone.length === 11) {
      handleSearchResponsavel(purePhone);
    }
  }, [telefoneValue, handleSearchResponsavel]);

  const tornarPrincipalValue = form.watch("tornar_principal");
  useEffect(() => {
    if (tornarPrincipalValue && alertRef.current) {
      setTimeout(() => {
        alertRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 150);
    }
  }, [tornarPrincipalValue]);

  const handleSubmit = async (data: ResponsavelFormData) => {
    const payload = {
      nome: data.nome,
      telefone: String(data.telefone || "").replace(/\D/g, ""),
      cpf: String(data.cpf || "").replace(/\D/g, ""),
      email: data.email || null,
      parentesco: data.parentesco as ParentescoResponsavel,
      logradouro: data.logradouro || null,
      numero: data.numero || null,
      bairro: data.bairro || null,
      cidade: data.cidade || null,
      estado: data.estado || null,
      cep: data.cep ? String(data.cep).replace(/\D/g, "") : null,
      referencia: data.referencia || null,
      complemento: data.complemento || null,
    };

    const successCallback = () => {
      onClose();
      if (onSuccess) onSuccess();
    };

    try {
      if (isResponsavelPortal) {
        const authToken = token || localStorage.getItem(STORAGE_KEYS.RESPONSAVEL_TOKEN) || "";
        if (editingResponsavel && editingResponsavel.id) {
          await updateResponsavelResponsavel.mutateAsync({
            passageiroId,
            responsavelId: editingResponsavel.id,
            payload,
            token: authToken,
          });

          if (data.tornar_principal) {
            await setPrincipalResponsavel.mutateAsync({
              passageiroId,
              responsavelId: editingResponsavel.id,
              token: authToken,
            });
          }
        } else {
          const response = await addResponsavelResponsavel.mutateAsync({
            passageiroId,
            payload,
            token: authToken,
          });

          if (data.tornar_principal && response?.id) {
            await setPrincipalResponsavel.mutateAsync({
              passageiroId,
              responsavelId: response.id,
              token: authToken,
            });
          }
        }
        successCallback();
      } else {
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

          if (data.tornar_principal && response?.id) {
            await setPrincipal.mutateAsync({
              passageiroId,
              responsavelId: response.id,
            });
          }
          successCallback();
        }
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
        leftAction={isDevEnv() && (
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
            className="space-y-4 mt-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="col-span-1 sm:col-span-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field, fieldState }) => (
                    <FormItem className="flex flex-col space-y-2">
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Nome <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            placeholder="Digite o nome completo"
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <PhoneInput
                    field={field}
                    label="Telefone (WhatsApp)"
                    required
                    labelClassName="text-slate-700 font-semibold ml-1"
                    inputClassName="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 text-base"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col space-y-2">
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
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base"
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
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col space-y-2">
                    <FormLabel className="text-slate-700 font-semibold ml-1">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                        <Input
                          {...field}
                          type="email"
                          value={field.value || ""}
                          placeholder="email@exemplo.com.br"
                          className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-base"
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
                  <FormItem className="flex flex-col space-y-2">
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
                            "h-12 rounded-xl bg-slate-50 border-slate-200 text-base focus:border-[#1a3a5c]",
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

            <section className="space-y-3">
              <div className="flex items-center gap-3 text-base font-semibold text-slate-800 mb-3">
                <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[#1a3a5c] border border-slate-200 shadow-sm flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                Endereço do Responsável
              </div>
              <FormEnderecoFields required={false} />
            </section>

            <FormField
              control={form.control}
              name="tornar_principal"
              render={({ field }) => (
                <div className="space-y-3" ref={alertRef}>
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

                  {field.value && (
                    <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-4 animate-in slide-in-from-top-2 fade-in duration-200">
                      <p className="text-xs font-bold text-slate-800 mb-3">
                        Ao salvar, as seguintes informações serão atualizadas:
                      </p>

                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100/20">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">Notificações WhatsApp</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Lembretes e avisos irão apenas para este contato.</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-blue-100/50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-200/20">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">Contratos e Documentos</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Serão gerados com os dados deste novo responsável.</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg bg-[#1a3a5c]/5 flex items-center justify-center text-[#1a3a5c] shrink-0 border border-[#1a3a5c]/10">
                            <MapPin className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-slate-700 leading-none mb-0.5">Endereço Principal</p>
                            <p className="text-[10px] text-slate-500 leading-tight">Utilizado como padrão para as rotas do passageiro.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
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
