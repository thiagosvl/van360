import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormEnderecoFields } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAtualizarDadosPublicosRenovacao } from "@/hooks/api/useRenovacoes";
import { cepMask } from "@/utils/masks";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";
import {
  GraduationCap,
  MapPin,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { periodos } from "@/utils/formatters/periodo";
import { modalidades } from "@/utils/formatters/passenger";
import type { PublicRenovacaoResponse, AtualizarDadosPublicosPayload } from "@/types/renovacao";

interface EditarDadosPublicosRenovacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  responsavel?: PublicRenovacaoResponse["responsavel"];
  passageiro: PublicRenovacaoResponse["passageiro"];
  condicoes: PublicRenovacaoResponse["condicoes"];
  escolasDisponiveis?: Array<{ id: string; nome: string }>;
  onSuccess?: () => void;
}

const createEditarDadosPublicosSchema = (temEscolasDisponiveis: boolean) =>
  z.object({
    responsavel: z
      .object({
        cep: z.string().optional(),
        logradouro: z.string().optional(),
        numero: z.string().optional(),
        complemento: z.string().optional(),
        bairro: z.string().optional(),
        cidade: z.string().optional(),
        estado: z.string().optional(),
        referencia: z.string().optional(),
      })
      .superRefine((data, ctx) => {
        const cepClean = (data.cep || "").replace(/\D/g, "");
        if (cepClean.length > 0 && cepClean.length < 8) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CEP deve conter 8 dígitos",
            path: ["cep"],
          });
        }
        const temEndereco = Boolean(data.logradouro?.trim() || cepClean.length === 8);
        if (temEndereco && (!data.numero || data.numero.trim() === "")) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Informe o número do endereço",
            path: ["numero"],
          });
        }
      }),
    passageiro: z.object({
      escola_id: temEscolasDisponiveis
        ? z.string().min(1, "Selecione a escola")
        : z.string().optional(),
      periodo: z.string().min(1, "Selecione o turno"),
      modalidade: z.string().min(1, "Selecione a modalidade"),
      turma: z.string().optional(),
      sala: z.string().optional(),
      nome_professor: z.string().optional(),
      observacoes: z.string().optional(),
    }),
  });

type EditarDadosPublicosFormValues = z.infer<ReturnType<typeof createEditarDadosPublicosSchema>>;

export function EditarDadosPublicosRenovacaoDialog({
  isOpen,
  onClose,
  token,
  responsavel,
  passageiro,
  condicoes,
  escolasDisponiveis = [],
  onSuccess,
}: EditarDadosPublicosRenovacaoDialogProps) {
  const { mutateAsync: salvarDados, isPending } = useAtualizarDadosPublicosRenovacao(token);

  const schema = createEditarDadosPublicosSchema(escolasDisponiveis.length > 0);

  const form = useForm<EditarDadosPublicosFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      responsavel: {
        cep: "",
        logradouro: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        referencia: "",
      },
      passageiro: {
        escola_id: "",
        periodo: "",
        modalidade: "",
        turma: "",
        sala: "",
        nome_professor: "",
        observacoes: "",
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
      const initialEscolaId =
        condicoes.escola.novo_id ||
        condicoes.escola.atual_id ||
        escolasDisponiveis.find((e) => e.nome === condicoes.escola.novo)?.id ||
        "";

      form.reset({
        responsavel: {
          cep: cepMask(responsavel?.cep || ""),
          logradouro: responsavel?.logradouro || "",
          numero: responsavel?.numero || "",
          complemento: responsavel?.complemento || "",
          bairro: responsavel?.bairro || "",
          cidade: responsavel?.cidade || "",
          estado: responsavel?.estado || "",
          referencia: responsavel?.referencia || "",
        },
        passageiro: {
          escola_id: initialEscolaId,
          periodo: condicoes.periodo.novo || condicoes.periodo.atual || "",
          modalidade: condicoes.modalidade.novo || condicoes.modalidade.atual || "",
          turma: condicoes.turma?.novo || passageiro.turma || "",
          sala: condicoes.sala?.novo || passageiro.sala || "",
          nome_professor: condicoes.nome_professor?.novo || passageiro.nome_professor || "",
          observacoes: passageiro.observacoes || "",
        },
      });
    }
  }, [isOpen, responsavel, passageiro, condicoes, escolasDisponiveis, form]);

  const handleSubmit = async (values: EditarDadosPublicosFormValues) => {
    try {
      const payload: AtualizarDadosPublicosPayload = {
        responsavel: {
          cep: values.responsavel.cep ? values.responsavel.cep.replace(/\D/g, "") : undefined,
          logradouro: values.responsavel.logradouro?.trim() || undefined,
          numero: values.responsavel.numero?.trim() || undefined,
          complemento: values.responsavel.complemento?.trim() || undefined,
          bairro: values.responsavel.bairro?.trim() || undefined,
          cidade: values.responsavel.cidade?.trim() || undefined,
          estado: values.responsavel.estado?.trim() || undefined,
          referencia: values.responsavel.referencia?.trim() || undefined,
        },
        passageiro: {
          escola_id: values.passageiro.escola_id || undefined,
          periodo: values.passageiro.periodo || undefined,
          modalidade: values.passageiro.modalidade || undefined,
          turma: values.passageiro.turma?.trim() || undefined,
          sala: values.passageiro.sala?.trim() || undefined,
          nome_professor: values.passageiro.nome_professor?.trim() || undefined,
          observacoes: values.passageiro.observacoes?.trim() || undefined,
        },
      };

      await salvarDados(payload);
      toast.success("Dados cadastrais atualizados com sucesso!");
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar dados. Tente novamente.";
      toast.error("Erro ao salvar", { description: msg });
    }
  };

  return (
    <BaseDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) safeCloseDialog(onClose);
      }}
      maxWidth="lg"
      description="Atualização de dados cadastrais para o novo ano letivo"
    >
      <BaseDialog.Header
        title="Atualizar Dados"
        onClose={() => safeCloseDialog(onClose)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <BaseDialog.Body className="space-y-8 max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
            <section className="space-y-4">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-foreground mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-muted/60 flex items-center justify-center text-muted-foreground border border-border shrink-0">
                  <GraduationCap className="w-4 h-4" />
                </div>
                Dados Escolares
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {escolasDisponiveis.length > 0 && (
                  <FormField
                    control={form.control}
                    name="passageiro.escola_id"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-3 space-y-1.5">
                        <FormLabel className="text-foreground font-medium text-xs">
                          Escola <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground shadow-none">
                              <SelectValue placeholder="Selecione a escola" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {escolasDisponiveis.map((escola) => (
                              <SelectItem key={escola.id} value={escola.id} className="text-xs sm:text-sm">
                                {escola.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="passageiro.periodo"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 sm:col-span-1">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Turno <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground shadow-none">
                            <SelectValue placeholder="Selecione o turno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {periodos.map((p) => (
                            <SelectItem key={p.value} value={p.value} className="text-xs sm:text-sm">
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passageiro.modalidade"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5 sm:col-span-2">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Modalidade <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        value={field.value || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground shadow-none">
                            <SelectValue placeholder="Selecione a modalidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {modalidades.map((m) => (
                            <SelectItem key={m.value} value={m.value} className="text-xs sm:text-sm">
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passageiro.turma"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Turma <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Ex: 3º Ano B"
                          className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground placeholder:text-muted-foreground shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passageiro.sala"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Sala <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Ex: Sala 04"
                          className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground placeholder:text-muted-foreground shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passageiro.nome_professor"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Professor(a) <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Ex: Profa. Juliana"
                          className="h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground placeholder:text-muted-foreground shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passageiro.observacoes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-3 space-y-1.5">
                      <FormLabel className="text-foreground font-medium text-xs">
                        Observações Adicionais <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Digite observações importantes sobre o aluno..."
                          className="min-h-[90px] rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground placeholder:text-muted-foreground resize-none shadow-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-foreground mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-muted/60 flex items-center justify-center text-muted-foreground border border-border shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                Endereço Principal <span className="text-muted-foreground font-normal text-xs sm:text-sm">(opcional)</span>
              </div>

              <FormEnderecoFields namePrefix="responsavel." isExternal={true} required={false} />
            </section>
          </BaseDialog.Body>

          <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-border">
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
            />
            <BaseDialog.Action
              label="Salvar Dados"
              variant="primary"
              type="submit"
              isLoading={isPending}
              disabled={isPending}
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
