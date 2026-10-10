import { useState, useEffect } from "react";
import { BaseDialog } from "@/components/ui/BaseDialog";
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
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { PhoneInput } from "@/components/forms/PhoneInput";
import { MoneyInput } from "@/components/forms/MoneyInput";
import { usePassageiros, useSession, useProfile, safeCloseDialog } from "@/hooks";
import {
  useParticipantePasseioForm,
  type ParticipantePasseioFormData,
} from "@/hooks/form/useParticipantePasseioForm";
import { useAdicionarParticipanteMutation } from "@/hooks/api/useFretamentosApi";
import type { FretamentoDetalhes } from "@/services/api/fretamento.api";
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
  ChevronsUpDown,
  Check,
  X,
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
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: passageirosData } = usePassageiros({ usuarioId: profile?.id });
  const passageiros = passageirosData?.list || [];
  const adicionarMutation = useAdicionarParticipanteMutation();

  const valorPadrao = Number(fretamento?.valor_por_pessoa || 0);
  const form = useParticipantePasseioForm({ valorPadrao });

  const isProprioResponsavel = form.watch("is_proprio_responsavel");
  const selectedPassageiroId = form.watch("passageiro_id");
  const alunoSelecionado = passageiros.find((p) => p.id === selectedPassageiroId) || null;

  useEffect(() => {
    if (isOpen) {
      setBuscaAluno("");
      setIsComboboxOpen(false);
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

  const alunosFiltrados = passageiros.filter((p) => {
    if (!buscaAluno.trim()) return true;
    const termo = buscaAluno.toLowerCase();
    const nomeAluno = (p.nome || "").toLowerCase();
    const resp = p.responsavel_principal || p.responsaveis?.[0];
    const nomeResp = (resp?.nome || "").toLowerCase();
    return nomeAluno.includes(termo) || nomeResp.includes(termo);
  });

  const selecionarAluno = (passageiroId: string) => {
    const aluno = passageiros.find((p) => p.id === passageiroId);
    if (!aluno) return;

    const resp = aluno.responsavel_principal || aluno.responsaveis?.[0];
    const enderecoFormatado = resp ? formatarEnderecoParcialRota(resp) : "";

    form.setValue("passageiro_id", aluno.id || null);
    form.setValue("nome", aluno.nome, { shouldValidate: true });
    form.setValue("is_proprio_responsavel", false);
    form.setValue("responsavel_nome", resp?.nome || "");
    form.setValue("telefone", resp?.telefone || "");
    form.setValue("endereco", enderecoFormatado);
    setIsComboboxOpen(false);
    setBuscaAluno("");
  };

  const limparAlunoSelecionado = () => {
    form.setValue("passageiro_id", null);
    form.setValue("nome", "");
    form.setValue("responsavel_nome", "");
    form.setValue("telefone", "");
    form.setValue("endereco", "");
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

      <div className="grid grid-cols-2 gap-1.5 border-b border-[#e5e5e5] bg-[#fafafa] p-2.5 sm:px-6 sm:py-3">
        <button
          type="button"
          onClick={() => {
            setOrigemAba("base");
            limparAlunoSelecionado();
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[18px] text-xs font-medium transition-all cursor-pointer ${
            origemAba === "base"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-transparent text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"
          }`}
        >
          <UserCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Aluno Cadastrado</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setOrigemAba("avulso");
            limparAlunoSelecionado();
          }}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-[18px] text-xs font-medium transition-all cursor-pointer ${
            origemAba === "avulso"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-transparent text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Outro Participante</span>
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-4 p-5 sm:p-6 overflow-y-auto bg-[#ffffff]">
            {origemAba === "base" && (
              <div className="space-y-1.5">
                <FormLabel className="text-[#0a0a0a] font-medium text-xs block">
                  Aluno <span className="text-[#e7000b]">*</span>
                </FormLabel>

                <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                  <PopoverAnchor asChild>
                    {alunoSelecionado ? (
                      <div className="flex items-center justify-between p-3 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] transition-all">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-semibold shadow-xs">
                            {alunoSelecionado.nome?.charAt(0).toUpperCase() || "A"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-semibold text-[#0a0a0a] truncate leading-tight">
                              {alunoSelecionado.nome}
                            </p>
                            {(alunoSelecionado.responsavel_principal?.nome || alunoSelecionado.responsaveis?.[0]?.nome) && (
                              <p className="text-[11px] text-[#737373] truncate mt-0.5">
                                Resp: {alunoSelecionado.responsavel_principal?.nome || alunoSelecionado.responsaveis?.[0]?.nome}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsComboboxOpen(true)}
                            className="h-8 px-2.5 rounded-[14px] text-xs font-medium text-[#0a0a0a] hover:bg-white border border-transparent hover:border-[#e5e5e5] transition-all cursor-pointer"
                          >
                            Trocar
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={limparAlunoSelecionado}
                            className="h-8 w-8 rounded-full text-[#737373] hover:text-[#e7000b] hover:bg-white transition-all cursor-pointer"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsComboboxOpen(true)}
                        className="w-full h-10 px-3.5 rounded-[18px] bg-[#f5f5f5] hover:bg-white border border-[#e5e5e5] focus:border-[#0a0a0a] text-left flex items-center justify-between transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-[#737373] truncate">
                          <Search className="h-4 w-4 text-[#737373] shrink-0" />
                          <span>Selecione ou busque o aluno...</span>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 text-[#737373] shrink-0" />
                      </button>
                    )}
                  </PopoverAnchor>

                  <PopoverContent
                    align="start"
                    side="bottom"
                    sideOffset={6}
                    className="w-[var(--radix-popover-trigger-width)] min-w-[300px] p-0 rounded-[20px] border border-[#e5e5e5] bg-white shadow-xl z-[10000] overflow-hidden"
                  >
                    <div className="flex items-center px-3.5 py-2.5 border-b border-[#e5e5e5] bg-[#fafafa]">
                      <Search className="h-4 w-4 text-[#737373] mr-2 shrink-0" />
                      <input
                        autoFocus
                        placeholder="Buscar por nome do aluno ou responsável..."
                        value={buscaAluno}
                        onChange={(e) => setBuscaAluno(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#0a0a0a] placeholder:text-[#737373] outline-none"
                      />
                      {buscaAluno && (
                        <button
                          type="button"
                          onClick={() => setBuscaAluno("")}
                          className="text-[#737373] hover:text-[#0a0a0a] p-0.5"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 overscroll-contain">
                      {alunosFiltrados.length === 0 ? (
                        <div className="py-6 px-3 text-center text-xs text-[#737373]">
                          Nenhum aluno encontrado.
                        </div>
                      ) : (
                        alunosFiltrados.map((aluno) => {
                          if (!aluno.id) return null;
                          const isSelected = aluno.id === selectedPassageiroId;
                          const respNome = aluno.responsavel_principal?.nome || aluno.responsaveis?.[0]?.nome;
                          const escolaNome = aluno.escola?.nome || aluno.escola_nome;

                          return (
                            <button
                              key={aluno.id}
                              type="button"
                              onClick={() => selecionarAluno(aluno.id)}
                              className={`w-full p-2.5 rounded-[12px] text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                isSelected ? "bg-[#f5f5f5]" : "hover:bg-[#fafafa]"
                              }`}
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
                              {isSelected && <Check className="h-4 w-4 text-[#0a0a0a] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
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
                    O participante é o próprio responsável / Maior de idade
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
