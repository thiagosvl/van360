import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BaseDialog } from "@/components/ui/BaseDialog";
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
  editingMembro?: any | null;
  veiculos: any[];
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

    if (isDuplicateEmail) {
      form.setError("email", { message: "E-mail já cadastrado." });
      return;
    }

    if (isDuplicateCpf) {
      form.setError("cpf", { message: "CPF/CNPJ já cadastrado." });
      return;
    }

    if (isDuplicatePhone) {
      form.setError("telefone", { message: "Telefone já cadastrado." });
      return;
    }

    const msg = respData?.message || respData?.error || err.message || defaultMsg;
    toast.error(msg);
  };

  const createMutation = useMutation({
    mutationFn: async (values: MonitorFormData) => {
      const payload = {
        ...values,
        tipo: UserType.MONITOR,
        cpf: values.cpf.replace(/\D/g, ""),
        telefone: values.telefone.replace(/\D/g, ""),
      };
      const response = await apiClient.post("/motoristas-equipe", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Monitor cadastrado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["motoristas-equipe"] });
      if (onSuccess) onSuccess();
      onClose();
    },
    onError: (err: any) => {
      handleApiError(err, "Erro ao cadastrar monitor");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: MonitorFormData) => {
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
      onClose();
    },
    onError: (err: any) => {
      handleApiError(err, "Erro ao atualizar monitor");
    },
  });

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleFillMock = () => {
    const nome = mockGenerator.name();
    const cpf = mockGenerator.cpf();
    const email = mockGenerator.email(nome);
    const telefone = '(11) 99999-9999';
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
    <BaseDialog open={isOpen} onOpenChange={onClose} lockClose={isSaving} maxWidth="lg">
      <BaseDialog.Header
        title={editingMembro ? "Editar Monitor" : "Novo Monitor"}
        onClose={onClose}
        hideCloseButton={isSaving}
        leftAction={import.meta.env.DEV && !editingMembro && (
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
          {/* Card explicativo de nivel de acesso do Monitor */}
          <div className="p-4 bg-blue-50/80 border border-blue-100 rounded-2xl flex gap-3 text-left">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-blue-900 uppercase tracking-tight">
                Escopo de Acesso do Monitor
              </p>
              <p className="text-xs text-blue-800 leading-relaxed font-medium">
                O monitor terá acesso à <strong>prancheta digital de alunos</strong> nas rotas do veículo atribuído para registrar presença e embarque. O usuário não possui acesso a relatórios, gastos ou dados financeiros.
              </p>
            </div>
          </div>

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
                            placeholder="Ex: Maria Souza"
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
                            placeholder="Ex: Tia Maria"
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
                            placeholder="maria@email.com"
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
