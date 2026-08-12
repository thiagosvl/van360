import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { isDevEnv } from "@/utils/detectPlatform";
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
import { UserType } from "@/types/enums";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { isValidCpfCnpj } from "@/utils/validators";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { User, Mail, Phone, Lock, Car, FileText, Wand2, Info, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";

const motoristaSchema = z
  .object({
    nome: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    apelido: z.string().optional(),
    razao_social: z.string().optional(),
    cpf: z
      .string()
      .min(11, "CPF/CNPJ é obrigatório")
      .refine((val) => isValidCpfCnpj(val), "CPF/CNPJ inválido"),
    email: z.string().email("E-mail inválido"),
    telefone: z.string().min(10, "Telefone inválido"),
    veiculo_id: z.string().min(1, "Selecione um veículo atribuído"),
    senha: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const isCnpj = data.cpf.replace(/\D/g, "").length > 11;
    if (isCnpj && (!data.razao_social || data.razao_social.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Razão social é obrigatória para CNPJ",
        path: ["razao_social"],
      });
    }
  });

type MotoristaFormData = z.infer<typeof motoristaSchema>;

interface MotoristaAuxiliarFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingMembro?: any | null;
  veiculos: any[];
  onSuccess?: () => void;
}

export function MotoristaAuxiliarFormDialog({
  isOpen,
  onClose,
  editingMembro = null,
  veiculos = [],
  onSuccess,
}: MotoristaAuxiliarFormDialogProps) {
  const queryClient = useQueryClient();
  const [showSenha, setShowSenha] = useState(true);

  const form = useForm<MotoristaFormData>({
    resolver: zodResolver(motoristaSchema),
    defaultValues: {
      nome: "",
      apelido: "",
      razao_social: "",
      cpf: "",
      email: "",
      telefone: "",
      veiculo_id: "",
      senha: "",
    },
  });

  const cpfValue = form.watch("cpf") || "";
  const isCnpj = cpfValue.replace(/\D/g, "").length > 11;

  useEffect(() => {
    if (isOpen) {
      setShowSenha(true);
      if (editingMembro) {
        form.reset({
          nome: editingMembro.nome || "",
          apelido: editingMembro.apelido || "",
          razao_social: editingMembro.razao_social || "",
          cpf: editingMembro.cpfcnpj ? cpfCnpjMask(editingMembro.cpfcnpj) : "",
          email: editingMembro.email || "",
          telefone: editingMembro.telefone ? phoneMask(editingMembro.telefone) : "",
          veiculo_id: editingMembro.veiculo_id || editingMembro.veiculos?.id || (veiculos.length === 1 ? veiculos[0].id : ""),
          senha: "",
        });
      } else {
        form.reset({
          nome: "",
          apelido: "",
          razao_social: "",
          cpf: "",
          email: "",
          telefone: "",
          veiculo_id: veiculos.length === 1 ? veiculos[0].id : "",
          senha: "",
        });
      }
    }
  }, [isOpen, editingMembro, veiculos, form]);

  const handleApiError = (err: any, defaultMsg: string) => {
    const respData = err.response?.data;
    const errorMsg = (respData?.message || respData?.error || err.message || "").toLowerCase();

    const isDuplicateEmail =
      respData?.field === "email" ||
      (errorMsg.includes("email") && (
        errorMsg.includes("cadastrad") ||
        errorMsg.includes("exist") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("já") ||
        errorMsg.includes("registered") ||
        errorMsg.includes("already")
      ));

    const isDuplicateCpf =
      respData?.field === "cpf" || respData?.field === "cpfcnpj" ||
      (errorMsg.includes("cpf") && (
        errorMsg.includes("cadastrad") ||
        errorMsg.includes("exist") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("já") ||
        errorMsg.includes("registered") ||
        errorMsg.includes("already")
      ));

    const isDuplicatePhone =
      respData?.field === "telefone" ||
      ((errorMsg.includes("telefone") || errorMsg.includes("phone") || errorMsg.includes("whatsapp")) && (
        errorMsg.includes("cadastrad") ||
        errorMsg.includes("exist") ||
        errorMsg.includes("duplicate") ||
        errorMsg.includes("já") ||
        errorMsg.includes("registered") ||
        errorMsg.includes("already")
      ));

    let hasFieldError = false;

    if (isDuplicateEmail) {
      form.setError("email", { message: "E-mail já cadastrado." });
      hasFieldError = true;
    }

    if (isDuplicateCpf) {
      form.setError("cpf", { message: "CPF/CNPJ já cadastrado." });
      hasFieldError = true;
    }

    if (isDuplicatePhone) {
      form.setError("telefone", { message: "Telefone já cadastrado." });
      hasFieldError = true;
    }

    if (respData?.field && !hasFieldError) {
      form.setError(respData.field as any, { message: respData.error || respData.message || "Valor inválido." });
      hasFieldError = true;
    }

    if (hasFieldError) {
      toast.error("validacao.formularioComErros");
    } else {
      const msg = respData?.message || respData?.error || err.message || defaultMsg;
      toast.error(msg);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (values: MotoristaFormData) => {
      const payload = {
        ...values,
        tipo: UserType.MOTORISTA_AUXILIAR,
        cpf: values.cpf.replace(/\D/g, ""),
        telefone: values.telefone.replace(/\D/g, ""),
      };
      const response = await apiClient.post("/motoristas-equipe", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Motorista cadastrado com sucesso!", { description: 'As credenciais de acesso foram enviadas por e-mail.' });
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      handleApiError(err, "Erro ao cadastrar motorista");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: MotoristaFormData) => {
      const payload = {
        nome: values.nome,
        apelido: values.apelido,
        razao_social: values.razao_social,
        cpf: values.cpf.replace(/\D/g, ""),
        telefone: values.telefone.replace(/\D/g, ""),
        veiculo_id: values.veiculo_id,
        tipo: UserType.MOTORISTA_AUXILIAR,
      };
      const response = await apiClient.put(`/motoristas-equipe/${editingMembro.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Motorista atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      handleApiError(err, "Erro ao atualizar motorista");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleFillMock = () => {
    const nome = mockGenerator.name();
    const cpf = mockGenerator.cpf();
    const email = mockGenerator.email(nome);
    const telefone = '(11) 88888-8888';
    const veiculo_id = veiculos.length > 0 ? veiculos[0].id : "";

    form.reset({
      nome,
      apelido: "Tio Carlinhos",
      razao_social: "",
      cpf: cpfCnpjMask(cpf),
      email,
      telefone: phoneMask(telefone),
      veiculo_id,
      senha: "Ogaiht+1",
    });
  };

  const handleSubmit = (data: MotoristaFormData) => {
    if (!editingMembro && (!data.senha || data.senha.length < 6)) {
      form.setError("senha", {
        type: "manual",
        message: "A senha inicial é obrigatória (mínimo 6 caracteres)",
      });
      return;
    }

    if (editingMembro) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isSaving} maxWidth="lg">
      <BaseDialog.Header
        title={editingMembro ? "Editar Motorista" : "Novo Motorista"}
        onClose={onClose}
        hideCloseButton={isSaving}
        leftAction={isDevEnv() && !editingMembro && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-xs"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <div className="space-y-4 pb-2">
          {/* Card explicativo de nivel de acesso do Motorista */}
          <Banner
            variant="info"
            title="Acesso do Motorista"
            description={
              <>
                Esta conta terá acesso para <strong>executar rotas e registrar gastos</strong> do veículo atribuído. O usuário não possui acesso a dados financeiros gerais, contratos ou passageiros de outros veículos.
              </>
            }
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Nome Completo */}
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
                            {...field}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                            placeholder="Ex: Carlos Silva"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 2. Apelido / Nome de Exibição */}
                <FormField
                  control={form.control}
                  name="apelido"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Apelido / Nome de Exibição
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                            placeholder="Ex: Carlinhos"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 3. CPF ou CNPJ */}
                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        CPF ou CNPJ <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                            placeholder="000.000.000-00"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 4. Razão Social (Exibida imediatamente após o CPF/CNPJ quando for CNPJ) */}
                {isCnpj && (
                  <FormField
                    control={form.control}
                    name="razao_social"
                    render={({ field, fieldState, formState }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Razão Social <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              placeholder="Digite a razão social da empresa"
                              className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                              aria-invalid={
                                !!fieldState.error ||
                                (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                          <p className="text-[0.8rem] font-medium text-red-500 mt-1.5 ml-1">
                            Razão social é obrigatória para CNPJ
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                {/* 5. WhatsApp / Telefone */}
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        WhatsApp <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(phoneMask(e.target.value))}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                            placeholder="(11) 99999-9999"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 6. E-mail */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        E-mail <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                          <Input
                            {...field}
                            type="email"
                            disabled={!!editingMembro}
                            className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm disabled:opacity-70"
                            placeholder="carlos@email.com"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 7. Veículo Atribuído */}
                <FormField
                  control={form.control}
                  name="veiculo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 font-semibold ml-1">
                        Veículo Atribuído <span className="text-red-600">*</span>
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <div className="relative">
                            <Car className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60 z-10" />
                            <SelectTrigger className="pl-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </div>
                        </FormControl>
                        <SelectContent>
                          {veiculos.map((v: any) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.modelo} ({v.placa})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 8. Senha Inicial */}
                {!editingMembro && (
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 font-semibold ml-1">
                          Senha Inicial <span className="text-red-600">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-400 opacity-60" />
                            <Input
                              {...field}
                              type={showSenha ? "text" : "password"}
                              className="pl-12 pr-12 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-[#1a3a5c] text-sm"
                              placeholder="••••••••"
                              aria-invalid={!!fieldState.error}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSenha(!showSenha)}
                              className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                              tabIndex={-1}
                            >
                              {showSenha ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer>
        <BaseDialog.Action
          label="Cancelar"
          variant="secondary"
          onClick={onClose}
          disabled={isSaving}
        />
        <BaseDialog.Action
          label={editingMembro ? "Salvar" : "Cadastrar"}
          variant="primary"
          onClick={form.handleSubmit(handleSubmit)}
          isLoading={isSaving}
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
