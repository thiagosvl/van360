import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Tabs } from "@/components/ui/tabs";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { usePassageiros, useSession, useProfile, useDebounce, safeCloseDialog } from "@/hooks";
import {
  useParticipantePasseioForm,
  type ParticipantePasseioFormData,
} from "@/hooks/form/useParticipantePasseioForm";
import { useAdicionarParticipanteMutation } from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
import type { Passageiro } from "@/types/passageiro";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { formatarEnderecoParcialRota } from "@/utils/formatters";
import {
  UserPlus,
  UserCheck,
  Phone,
  MapPin,
  Search,
  User,
  Contact,
  Wand2,
  Check,
  X,
  Loader2,
  Plus,
} from "lucide-react";
import { isDevEnv } from "@/utils/detectPlatform";
import { mockGenerator } from "@/utils/mocks/generator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdicionarParticipantePasseioDialogProps {
  isOpen: boolean;
  onClose: () => void;
  fretamento: FretamentoDetalhes | null;
  onSuccess?: () => void;
}

export function AdicionarParticipantePasseioDialog({
  isOpen,
  onClose,
  fretamento,
  onSuccess,
}: AdicionarParticipantePasseioDialogProps) {
  const [origemAba, setOrigemAba] = useState<"base" | "avulso">("base");
  const [buscaAluno, setBuscaAluno] = useState("");
  const debouncedBusca = useDebounce(buscaAluno, 350);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Passageiro | null>(null);

  const { user } = useSession();
  const { profile } = useProfile(user?.id);

  const hasMinChars = debouncedBusca.trim().length >= 3;
  const { data: passageirosData, isLoading: isLoadingPassageiros } = usePassageiros(
    {
      usuarioId: profile?.id,
      search: hasMinChars ? debouncedBusca.trim() : undefined,
      status: "ativo",
      limit: 25,
    },
    {
      enabled: Boolean(isOpen && origemAba === "base" && profile?.id && hasMinChars),
    }
  );
  const passageiros = passageirosData?.list || [];
  const adicionarMutation = useAdicionarParticipanteMutation();

  const valorPadrao = Number(fretamento?.valor_por_pessoa || 0);
  const form = useParticipantePasseioForm({ valorPadrao });

  const isProprioResponsavel = form.watch("is_proprio_responsavel");

  useEffect(() => {
    if (isOpen) {
      setBuscaAluno("");
      setAlunoSelecionado(null);
      setOrigemAba("base");
      form.reset({
        passageiro_id: null,
        nome: "",
        is_proprio_responsavel: false,
        responsavel_nome: "",
        telefone: "",
        endereco: "",
        valor: valorPadrao ? moneyMask(valorPadrao) : "",
        observacoes: "",
      });
    }
  }, [isOpen, valorPadrao, form]);

  const handleFillMock = () => {
    setOrigemAba("avulso");
    setAlunoSelecionado(null);
    const nomeAluno = mockGenerator.name();
    const nomeResp = mockGenerator.name();
    const phone = mockGenerator.phone();
    form.setValue("passageiro_id", null);
    form.setValue("nome", nomeAluno, { shouldValidate: true });
    form.setValue("is_proprio_responsavel", false, { shouldValidate: true });
    form.setValue("responsavel_nome", nomeResp, { shouldValidate: true });
    form.setValue("telefone", phone, { shouldValidate: true });
    form.setValue("endereco", "Rua das Acácias, 240", { shouldValidate: true });
    form.setValue("valor", moneyMask(valorPadrao || 120), { shouldValidate: true });
    form.setValue("observacoes", "Participante confirmado via WhatsApp.", { shouldValidate: true });
  };

  if (!fretamento) return null;

  const selecionarAluno = (aluno: Passageiro) => {
    setAlunoSelecionado(aluno);
    const resp = aluno.responsavel_principal || aluno.responsaveis?.[0];
    const enderecoFormatado = resp ? formatarEnderecoParcialRota(resp) : "";

    form.setValue("passageiro_id", aluno.id || null);
    form.setValue("nome", aluno.nome, { shouldValidate: true });
    form.setValue("is_proprio_responsavel", false);
    form.setValue("responsavel_nome", resp?.nome || "");
    form.setValue("telefone", resp?.telefone || "");
    form.setValue("endereco", enderecoFormatado);
    setBuscaAluno("");
  };

  const limparAlunoSelecionado = () => {
    setAlunoSelecionado(null);
    form.setValue("passageiro_id", null);
    form.setValue("nome", "");
    form.setValue("responsavel_nome", "");
    form.setValue("telefone", "");
    form.setValue("endereco", "");
    setBuscaAluno("");
  };

  const handleTrocarAba = (novaAba: "base" | "avulso") => {
    setOrigemAba(novaAba);
    if (novaAba === "avulso") {
      limparAlunoSelecionado();
    }
  };

  const onSubmit = async (values: ParticipantePasseioFormData) => {
    if (origemAba === "base" && !values.passageiro_id) {
      toast.error("Por favor, selecione um aluno cadastrado.");
      return;
    }

    try {
      await adicionarMutation.mutateAsync({
        fretamentoId: fretamento.id,
        payload: {
          passageiro_id: values.passageiro_id || null,
          nome: values.nome,
          is_proprio_responsavel: values.is_proprio_responsavel,
          responsavel_nome: values.is_proprio_responsavel ? values.nome : values.responsavel_nome,
          telefone: values.telefone,
          endereco: values.endereco,
          valor: moneyToNumber(values.valor),
          observacoes: values.observacoes,
        },
      });

      toast.success(`${values.nome} adicionado(a) com sucesso!`);
      onSuccess?.();
      safeCloseDialog(onClose);
    } catch {
      toast.error("Erro ao adicionar participante. Verifique se as vagas não esgotaram.");
    }
  };

  const isSubmitting = adicionarMutation.isPending;

  return (
    <BaseDialog open={isOpen} onOpenChange={(open) => !open && safeCloseDialog(onClose)} maxWidth="lg">
      <BaseDialog.Header
        title="Adicionar Participante"
        subtitle={`Passeio: ${fretamento.titulo}`}
        icon={<UserPlus className="h-5 w-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-[18px] bg-[#f5f5f5] border border-[#e5e5e5] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#ffffff] transition-all"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <div className="p-3 sm:px-6 sm:py-3.5 bg-[#fafafa] border-b border-[#e5e5e5]">
        <Tabs
          value={origemAba}
          onValueChange={(val) => {
            setOrigemAba(val as "base" | "avulso");
            limparAlunoSelecionado();
          }}
          className="w-full"
        >
          <AppTabNav
            items={[
              {
                value: "base",
                label: "Aluno Cadastrado",
                icon: <UserCheck className="h-3.5 w-3.5" />,
              },
              {
                value: "avulso",
                label: "Outro Participante",
                icon: <UserPlus className="h-3.5 w-3.5" />,
              },
            ]}
            activeTab={origemAba}
            layout="fill"
            className="w-full bg-[#f0f0f0]"
            listClassName="w-full grid grid-cols-2"
            triggerClassName="w-full font-medium text-xs"
          />
        </Tabs>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto bg-[#ffffff]">
            {origemAba === "base" && (
              <div className="space-y-2">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs block">
                  Aluno Selecionado <span className="text-[#e7000b]">*</span>
                </FormLabel>

                {alunoSelecionado ? (
                  <div className="flex items-center justify-between p-3.5 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] transition-all">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
                        {alunoSelecionado.nome?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] truncate leading-tight">
                          {alunoSelecionado.nome}
                        </p>
                        {(alunoSelecionado.responsavel_principal?.nome || alunoSelecionado.responsaveis?.[0]?.nome || alunoSelecionado.escola?.nome) && (
                          <p className="text-[11px] text-[#737373] truncate mt-0.5">
                            {[
                              alunoSelecionado.responsavel_principal?.nome || alunoSelecionado.responsaveis?.[0]?.nome
                                ? `Resp: ${alunoSelecionado.responsavel_principal?.nome || alunoSelecionado.responsaveis?.[0]?.nome}`
                                : null,
                              alunoSelecionado.escola?.nome,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={limparAlunoSelecionado}
                        className="h-8 px-3 rounded-[14px] text-xs font-medium text-[#0a0a0a] hover:bg-white border border-[#e5e5e5] transition-all cursor-pointer"
                      >
                        Trocar Aluno
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        type="text"
                        inputMode="search"
                        placeholder="Buscar aluno por nome ou responsável (mín. 3 letras)..."
                        value={buscaAluno}
                        onChange={(e) => setBuscaAluno(e.target.value)}
                        className="pl-10 pr-9 h-11 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb]/60 focus:bg-white border-[#e5e5e5] focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] transition-all [&::-webkit-search-cancel-button]:hidden"
                        autoFocus
                      />
                      {buscaAluno && (
                        <button
                          type="button"
                          onClick={() => setBuscaAluno("")}
                          aria-label="Limpar busca"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] p-1 cursor-pointer transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!hasMinChars ? (
                      <div className="py-5 px-4 text-center text-xs text-[#737373] bg-[#fafafa] rounded-[18px] border border-dashed border-[#e5e5e5]">
                        <Search className="h-4 w-4 mx-auto mb-1 text-[#a3a3a3]" />
                        Digite pelo menos 3 caracteres para buscar alunos.
                      </div>
                    ) : isLoadingPassageiros ? (
                      <div className="flex items-center justify-center py-6 text-[#737373] gap-2 bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-xs font-medium">Buscando alunos...</span>
                      </div>
                    ) : passageiros.length === 0 ? (
                      <div className="py-6 px-4 text-center text-xs text-[#737373] bg-[#fafafa] rounded-[18px] border border-dashed border-[#e5e5e5]">
                        Nenhum aluno ativo encontrado para &quot;{debouncedBusca}&quot;.
                      </div>
                    ) : (
                      <div
                        className="max-h-52 overflow-y-auto space-y-1 p-1.5 border border-[#e5e5e5] rounded-[18px] bg-white divide-y divide-[#f5f5f5]"
                        onWheel={(e) => e.stopPropagation()}
                      >
                        {passageiros.map((aluno) => {
                          const respNome = aluno.responsavel_principal?.nome || aluno.responsaveis?.[0]?.nome;
                          const escolaNome = aluno.escola?.nome || aluno.escola_nome;

                          return (
                            <button
                              key={aluno.id}
                              type="button"
                              onClick={() => selecionarAluno(aluno)}
                              className="w-full p-2.5 rounded-[12px] text-left flex items-center justify-between gap-2 hover:bg-[#fafafa] transition-colors cursor-pointer pt-2"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs sm:text-sm font-semibold text-[#0a0a0a] truncate leading-tight">
                                  {aluno.nome}
                                </div>
                                {(respNome || escolaNome) && (
                                  <div className="text-[11px] text-[#737373] truncate mt-0.5">
                                    {[respNome ? `Resp: ${respNome}` : null, escolaNome].filter(Boolean).join(" • ")}
                                  </div>
                                )}
                              </div>
                              <Plus className="h-4 w-4 text-primary shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {origemAba === "avulso" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-[#0a0a0a] font-medium text-xs">
                        Nome do Participante <span className="text-[#e7000b]">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                          <Input
                            placeholder="Ex: Arthur Silva"
                            className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
                            aria-invalid={!!fieldState.error}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <MoneyInput
                      field={field}
                      label="Valor Cobrado"
                      required
                      labelClassName="text-[#0a0a0a] font-medium text-xs"
                      inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                    />
                  )}
                />
              </div>
            ) : (
              <FormField
                control={form.control}
                name="valor"
                render={({ field }) => (
                  <MoneyInput
                    field={field}
                    label="Valor Cobrado"
                    required
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                    inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                  />
                )}
              />
            )}

            <FormField
              control={form.control}
              name="is_proprio_responsavel"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-3 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-0 cursor-pointer select-none">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-medium text-[#0a0a0a] cursor-pointer m-0">
                    O participante é o próprio responsável
                  </FormLabel>
                </FormItem>
              )}
            />

            {!isProprioResponsavel && (
              <FormField
                control={form.control}
                name="responsavel_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Nome do Responsável</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Contact className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Ex: Mariana Silva"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
                          value={field.value || ""}
                          onChange={field.onChange}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <PhoneInput
                    field={field}
                    label="Telefone (WhatsApp)"
                    labelClassName="text-[#0a0a0a] font-medium text-xs"
                    inputClassName="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0a0a0a] font-medium text-xs">Endereço / Ponto de Embarque</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          placeholder="Rua, número ou ponto de encontro"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm"
                          value={field.value || ""}
                          onChange={field.onChange}
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
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#0a0a0a] font-medium text-xs">Observações ou Restrições</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Restrições alimentares, autorizações ou recomendações."
                      className="rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-[#ffffff] focus:border-[#0a0a0a] text-sm p-3 min-h-[80px]"
                      value={field.value || ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </BaseDialog.Body>

          <BaseDialog.Footer>
            <BaseDialog.Action
              label="Cancelar"
              variant="secondary"
              onClick={() => safeCloseDialog(onClose)}
              disabled={isSubmitting}
            />
            <BaseDialog.Action
              label="Adicionar Participante"
              variant="primary"
              onClick={form.handleSubmit(onSubmit)}
              isLoading={isSubmitting}
            />
          </BaseDialog.Footer>
        </form>
      </Form>
    </BaseDialog>
  );
}
