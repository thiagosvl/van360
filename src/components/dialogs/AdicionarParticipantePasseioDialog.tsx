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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { UserPlus, UserCheck, Phone, MapPin, Search, User, Contact, FileText, Wand2 } from "lucide-react";
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

  const { user } = useSession();
  const { profile } = useProfile(user?.id);
  const { data: passageirosData } = usePassageiros({ usuarioId: profile?.id });
  const passageiros = passageirosData?.list || [];
  const adicionarMutation = useAdicionarParticipanteMutation();

  const valorPadrao = Number(fretamento?.valor_por_pessoa || 0);
  const form = useParticipantePasseioForm({ valorPadrao });

  const isProprioResponsavel = form.watch("is_proprio_responsavel");

  useEffect(() => {
    if (isOpen) {
      setBuscaAluno("");
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
    form.setValue("nome", aluno.nome);
    form.setValue("is_proprio_responsavel", false);
    form.setValue("responsavel_nome", resp?.nome || "");
    form.setValue("telefone", resp?.telefone || "");
    form.setValue("endereco", enderecoFormatado);
  };

  const onSubmit = async (values: ParticipantePasseioFormData) => {
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
        icon={<UserPlus className="h-5 w-5 text-[#1a3a5c]" />}
        onClose={() => safeCloseDialog(onClose)}
        leftAction={isDevEnv() && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 transition-all active:scale-95 shadow-2xs"
            onClick={handleFillMock}
            title="Preencher com dados fictícios"
          >
            <Wand2 className="h-4 w-4" />
          </Button>
        )}
      />

      <div className="flex border-b border-slate-100 bg-slate-50/50 px-5 sm:px-6 pt-3 gap-2">
        <button
          type="button"
          onClick={() => {
            setOrigemAba("base");
            form.setValue("passageiro_id", null);
          }}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            origemAba === "base"
              ? "border-[#1a3a5c] text-[#1a3a5c]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Aluno da Minha Base
        </button>

        <button
          type="button"
          onClick={() => {
            setOrigemAba("avulso");
            form.setValue("passageiro_id", null);
          }}
          className={`flex items-center gap-2 pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            origemAba === "avulso"
              ? "border-[#1a3a5c] text-[#1a3a5c]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <UserPlus className="h-4 w-4" />
          Convidado / Participante Avulso
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <BaseDialog.Body className="space-y-3.5 p-5 sm:p-6 overflow-y-auto">
            {origemAba === "base" && (
              <div className="space-y-2 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/80">
                <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs block">
                  Buscar Aluno na Base de Cadastrados
                </FormLabel>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                  <Input
                    className="pl-10 h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] text-sm"
                    placeholder="Digite o nome do aluno ou responsável..."
                    value={buscaAluno}
                    onChange={(e) => setBuscaAluno(e.target.value)}
                  />
                </div>

                <Select
                  onValueChange={selecionarAluno}
                  value={form.watch("passageiro_id") || undefined}
                >
                  <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:border-[#1a3a5c] text-sm text-left">
                    <SelectValue placeholder="Selecione na lista de alunos..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {alunosFiltrados.slice(0, 50).map((aluno) => {
                      if (!aluno.id) return null;
                      const respNome = aluno.responsavel_principal?.nome || aluno.responsaveis?.[0]?.nome;
                      return (
                        <SelectItem key={aluno.id} value={aluno.id}>
                          <span className="font-bold text-slate-800">{aluno.nome}</span>
                          {respNome ? (
                            <span className="text-slate-400 text-xs ml-2">
                              (Resp: {respNome})
                            </span>
                          ) : null}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField
                control={form.control}
                name="nome"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">
                      Nome do Participante <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Arthur Silva"
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
                    labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                    inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm font-bold text-slate-800 transition-all"
                  />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_proprio_responsavel"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-0 cursor-pointer select-none">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="h-4 w-4 rounded border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
                    />
                  </FormControl>
                  <FormLabel className="text-xs font-semibold text-slate-700 cursor-pointer m-0">
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
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Nome do Responsável</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Contact className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Ex: Mariana Silva"
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
                    labelClassName="text-slate-700 font-semibold ml-0.5 text-xs"
                    inputClassName="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
                  />
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Endereço / Ponto de Embarque</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
                        <Input
                          placeholder="Rua, número ou ponto de encontro"
                          className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm transition-all"
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
                  <FormLabel className="text-slate-700 font-semibold ml-0.5 text-xs">Observações ou Restrições</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Restrições alimentares, autorizações ou recomendações."
                      className="rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#1a3a5c] focus:ring-2 focus:ring-[#1a3a5c]/10 text-sm p-3 min-h-[85px] transition-all"
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
