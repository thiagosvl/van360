import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormEnderecoFields } from "@/components/forms";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Banner } from "@/components/ui/Banner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAtualizarDadosPublicosRenovacao } from "@/hooks/api/useRenovacoes";
import { cepMask, cpfMask } from "@/utils/masks";
import { isValidCPF } from "@/utils/validators";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";
import {
  Contact,
  GraduationCap,
  Hash,
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
  onlyCpfForContract?: boolean;
  requireCpf?: boolean;
  onSuccess?: (updatedData?: PublicRenovacaoResponse) => void | Promise<void>;
}

const createEditarDadosPublicosSchema = (
  temEscolasDisponiveis: boolean,
  onlyCpfForContract: boolean,
  requireCpf: boolean
) =>
  z.object({
    responsavel: z
      .object({
        cpf: z.string().optional(),
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
        const cpfDigits = (data.cpf || "").replace(/\D/g, "");
        if (onlyCpfForContract || requireCpf) {
          if (cpfDigits.length !== 11 || !isValidCPF(cpfDigits)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Informe um CPF válido do responsável",
              path: ["cpf"],
            });
          }
        } else if (cpfDigits.length > 0 && (cpfDigits.length !== 11 || !isValidCPF(cpfDigits))) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "CPF inválido",
            path: ["cpf"],
          });
        }

        if (onlyCpfForContract) return;

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
      escola_id: !onlyCpfForContract && temEscolasDisponiveis
        ? z.string().min(1, "Selecione a escola")
        : z.string().optional(),
      periodo: !onlyCpfForContract
        ? z.string().min(1, "Selecione o turno")
        : z.string().optional(),
      modalidade: !onlyCpfForContract
        ? z.string().min(1, "Selecione a modalidade")
        : z.string().optional(),
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
  onlyCpfForContract = false,
  requireCpf = false,
  onSuccess,
}: EditarDadosPublicosRenovacaoDialogProps) {
  const { mutateAsync: salvarDados, isPending } = useAtualizarDadosPublicosRenovacao(token);

  const schema = createEditarDadosPublicosSchema(
    escolasDisponiveis.length > 0,
    onlyCpfForContract,
    requireCpf
  );

  const form = useForm<EditarDadosPublicosFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      responsavel: {
        cpf: "",
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
          cpf: cpfMask(responsavel?.cpf || ""),
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
          observacoes: passageiro.observacoes || "",
        },
      });
    }
  }, [isOpen, responsavel, passageiro, condicoes, escolasDisponiveis, form]);

  const handleSubmit = async (values: EditarDadosPublicosFormValues) => {
    try {
      const cpfClean = values.responsavel.cpf ? values.responsavel.cpf.replace(/\D/g, "") : undefined;
      const payload: AtualizarDadosPublicosPayload = onlyCpfForContract
        ? {
            responsavel: {
              cpf: cpfClean,
            },
          }
        : {
            responsavel: {
              cpf: cpfClean,
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
              observacoes: values.passageiro.observacoes?.trim() || undefined,
            },
          };

      const updatedData = await salvarDados(payload);
      if (!onlyCpfForContract) {
        toast.success("Dados cadastrais atualizados com sucesso!");
      }
      safeCloseDialog(onClose);
      await onSuccess?.(updatedData);
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
      maxWidth={onlyCpfForContract ? "md" : "lg"}
      description="Atualização de dados cadastrais para o novo ano letivo"
    >
      <BaseDialog.Header
        title={onlyCpfForContract ? "Dados do Contrato" : "Atualizar Dados"}
        onClose={() => safeCloseDialog(onClose)}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <BaseDialog.Body className="space-y-6 max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
            {(onlyCpfForContract || requireCpf) && (
              <Banner
                variant="warning"
                title="CPF necessário para o contrato"
                description="Informe o CPF do responsável financeiro para emitir e assinar o contrato digital."
                className="rounded-[18px]"
              />
            )}

            <section className="space-y-4">
              <div className="flex items-center gap-2.5 text-base sm:text-lg font-semibold text-foreground">
                <div className="w-8 h-8 rounded-[10px] bg-muted/60 flex items-center justify-center text-muted-foreground border border-border shrink-0">
                  <Contact className="w-4 h-4" />
                </div>
                Responsável Financeiro
              </div>

              <FormField
                control={form.control}
                name="responsavel.cpf"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-foreground font-medium text-xs">
                      CPF do Responsável{" "}
                      {onlyCpfForContract || requireCpf ? (
                        <span className="text-destructive">*</span>
                      ) : (
                        <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          {...field}
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(cpfMask(e.target.value))}
                          className="pl-10 h-10 sm:h-11 rounded-[18px] bg-muted/60 border-border focus:bg-white focus:border-foreground text-sm text-foreground placeholder:text-muted-foreground shadow-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            {!onlyCpfForContract && (
              <>
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
                      name="passageiro.observacoes"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-3 space-y-1.5">
                          <FormLabel className="text-foreground font-medium text-xs">
                            Observações <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
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
              </>
            )}
          </BaseDialog.Body>

          <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-border">
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
            />
            <BaseDialog.Action
              label={onlyCpfForContract ? "Continuar" : "Salvar Dados"}
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
