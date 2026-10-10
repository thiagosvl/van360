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
import { NativeSelect } from "@/components/ui/native-select";
import { UserType } from "@/types/enums";
import { phoneMask, cpfCnpjMask } from "@/utils/masks";
import { isValidCpfCnpj } from "@/utils/validators";
import { mockGenerator } from "@/utils/mocks/generator";
import { toast } from "@/utils/notifications/toast";
import { User, Mail, Phone, Lock, Car, FileText, Wand2, Eye, EyeOff } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api/client";
import { safeCloseDialog } from "@/hooks";
import type { MembroEquipe, VeiculoMembro } from "@/types/equipe";

const monitorSchema = z
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

type MonitorFormData = z.infer<typeof monitorSchema>;

interface MonitorFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editingMembro?: MembroEquipe | null;
  veiculos: VeiculoMembro[];
  onSuccess?: () => void;
}

export function MonitorFormDialog({
  isOpen,
  onClose,
  editingMembro = null,
  veiculos = [],
  onSuccess,
}: MonitorFormDialogProps) {
  const queryClient = useQueryClient();
  const [showSenha, setShowSenha] = useState(true);

  const form = useForm<MonitorFormData>({
    resolver: zodResolver(monitorSchema),
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

  const handleApiError = (err: unknown, defaultMsg: string) => {
    const errorResponse = err as { response?: { data?: { field?: string; message?: string; error?: string } }; message?: string };
    const respData = errorResponse.response?.data;
    const errorMsg = (respData?.message || respData?.error || errorResponse.message || "").toLowerCase();

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

    if (hasFieldError) {
      toast.error("Corrija os dados apontados para continuar");
    } else {
      toast.error(respData?.message || respData?.error || defaultMsg);
    }
  };

  const handleClose = () => {
    safeCloseDialog(onClose);
  };

  const createMutation = useMutation({
    mutationFn: async (values: MonitorFormData) => {
      const payload = {
        nome: values.nome,
        apelido: values.apelido,
        razao_social: values.razao_social,
        cpf: values.cpf.replace(/\D/g, ""),
        email: values.email,
        telefone: values.telefone.replace(/\D/g, ""),
        veiculo_id: values.veiculo_id,
        senha: values.senha,
        tipo: UserType.MONITOR,
      };
      const response = await apiClient.post("/motoristas-equipe", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Monitor cadastrado com sucesso!", { description: "As credenciais de acesso foram enviadas por e-mail." });
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err) => {
      handleApiError(err, "Erro ao cadastrar monitor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: MonitorFormData) => {
      if (!editingMembro) return;
      const payload = {
        nome: values.nome,
        apelido: values.apelido,
        razao_social: values.razao_social,
        cpf: values.cpf.replace(/\D/g, ""),
        telefone: values.telefone.replace(/\D/g, ""),
        veiculo_id: values.veiculo_id,
        tipo: UserType.MONITOR,
      };
      const response = await apiClient.put(`/motoristas-equipe/${editingMembro.id}`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Monitor atualizado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
      if (onSuccess) onSuccess();
      handleClose();
    },
    onError: (err) => {
      handleApiError(err, "Erro ao atualizar monitor");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleFillMock = () => {
    const nome = mockGenerator.name();
    const cpf = mockGenerator.cpf();
    const email = mockGenerator.email(nome);
    const telefone = "(11) 88888-8888";
    const veiculo_id = veiculos.length > 0 ? veiculos[0].id : "";

    form.reset({
      nome,
      apelido: "Tia Maria",
      razao_social: "",
      cpf: cpfCnpjMask(cpf),
      email,
      telefone: phoneMask(telefone),
      veiculo_id,
      senha: "Ogaiht+1",
    });
  };

  const handleSubmit = (data: MonitorFormData) => {
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
    <BaseDialog open={isOpen} onOpenChange={handleClose} lockClose={isSaving} maxWidth="lg">
      <BaseDialog.Header
        title={editingMembro ? "Editar Monitor" : "Novo Monitor"}
        onClose={handleClose}
        hideCloseButton={isSaving}
        leftAction={isDevEnv() && !editingMembro && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[14px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ebebeb] transition-all shadow-xs"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <BaseDialog.Body>
        <div className="space-y-4 pb-2">
          <Banner
            variant="info"
            title="Acesso do Monitor"
            description="Esta conta possui acesso restrito às operações do veículo atribuído, de acordo com o nível do perfil."
            className="rounded-[18px]"
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        Nome Completo <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                            placeholder="Ex: Maria Souza"
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
                  name="apelido"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        Nome do Transporte / Apelido
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                            placeholder="Ex: Tia Maria"
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
                  name="cpf"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        CPF ou CNPJ <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(cpfCnpjMask(e.target.value))}
                            className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                            placeholder="000.000.000-00"
                            aria-invalid={!!fieldState.error}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {isCnpj && (
                  <FormField
                    control={form.control}
                    name="razao_social"
                    render={({ field, fieldState, formState }) => (
                      <FormItem className="animate-in fade-in slide-in-from-top-1 duration-200">
                        <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                          Razão Social <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                            <Input
                              {...field}
                              placeholder="Digite a razão social da empresa"
                              className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                              aria-invalid={
                                !!fieldState.error ||
                                (isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                        {isCnpj && (!field.value || field.value.trim() === "") && Object.keys(formState.errors).length > 0 && !fieldState.error && (
                          <p className="text-[0.8rem] font-medium text-[#e7000b] mt-1.5 ml-1">
                            Razão social é obrigatória para CNPJ
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        WhatsApp <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            onChange={(e) => field.onChange(phoneMask(e.target.value))}
                            className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                            placeholder="(11) 99999-9999"
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
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        E-mail <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            {...field}
                            type="email"
                            disabled={!!editingMembro}
                            className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] disabled:opacity-60"
                            placeholder="maria@email.com"
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
                  name="veiculo_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                        Veículo Atribuído <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <NativeSelect
                          value={field.value || ""}
                          onChange={field.onChange}
                          icon={<Car className="h-4 w-4 text-[#737373]" />}
                        >
                          <option value="">Selecionar</option>
                          {veiculos.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.modelo} ({v.placa})
                            </option>
                          ))}
                        </NativeSelect>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!editingMembro && (
                  <FormField
                    control={form.control}
                    name="senha"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-xs sm:text-[13px] font-medium text-[#737373] ml-1">
                          Senha Inicial <span className="text-[#e7000b]">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                            <Input
                              {...field}
                              type={showSenha ? "text" : "password"}
                              className="pl-10 pr-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] hover:border-[#737373]/50 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373]"
                              placeholder="••••••••"
                              aria-invalid={!!fieldState.error}
                            />
                            <button
                              type="button"
                              onClick={() => setShowSenha(!showSenha)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
                              tabIndex={-1}
                            >
                              {showSenha ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
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
          onClick={handleClose}
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
