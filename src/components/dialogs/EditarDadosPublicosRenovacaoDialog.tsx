import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormEnderecoFields } from "@/components/forms/FormEnderecoFields";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { useAtualizarDadosPublicosRenovacao } from "@/hooks/api/useRenovacoes";
import { phoneMask, cpfMask, cepMask } from "@/utils/masks";
import { safeCloseDialog } from "@/utils/dialogUtils";
import { toast } from "sonner";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  HeartPulse,
} from "lucide-react";
import { PublicRenovacaoResponse } from "@/types/renovacao";

interface EditarDadosPublicosRenovacaoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  responsavel?: PublicRenovacaoResponse["responsavel"];
  passageiro: PublicRenovacaoResponse["passageiro"];
  condicoes: PublicRenovacaoResponse["condicoes"];
  onSuccess?: () => void;
}

interface EnderecoFormValues {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  referencia: string;
}

export function EditarDadosPublicosRenovacaoDialog({
  isOpen,
  onClose,
  token,
  responsavel,
  passageiro,
  condicoes,
  onSuccess,
}: EditarDadosPublicosRenovacaoDialogProps) {
  const { mutateAsync: salvarDados, isPending } = useAtualizarDadosPublicosRenovacao(token);

  const [nomeResp, setNomeResp] = useState("");
  const [telefoneResp, setTelefoneResp] = useState("");
  const [cpfResp, setCpfResp] = useState("");
  const [emailResp, setEmailResp] = useState("");
  const [parentescoResp, setParentescoResp] = useState("");

  const enderecoForm = useForm<EnderecoFormValues>({
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      referencia: "",
    },
  });

  const [turma, setTurma] = useState("");
  const [sala, setSala] = useState("");
  const [nomeProfessor, setNomeProfessor] = useState("");
  const [observacoes, setObservacoes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNomeResp(responsavel?.nome || "");
      setTelefoneResp(phoneMask(responsavel?.telefone || ""));
      setCpfResp(cpfMask(responsavel?.cpf || ""));
      setEmailResp(responsavel?.email || "");
      setParentescoResp(responsavel?.parentesco || "Mãe");

      enderecoForm.reset({
        cep: cepMask(responsavel?.cep || ""),
        logradouro: responsavel?.logradouro || "",
        numero: responsavel?.numero || "",
        complemento: responsavel?.complemento || "",
        bairro: responsavel?.bairro || "",
        cidade: responsavel?.cidade || "",
        estado: responsavel?.estado || "",
        referencia: responsavel?.referencia || "",
      });

      setTurma(condicoes.turma?.novo || passageiro.turma || "");
      setSala(condicoes.sala?.novo || passageiro.sala || "");
      setNomeProfessor(condicoes.nome_professor?.novo || passageiro.nome_professor || "");
      setObservacoes(passageiro.observacoes || "");
    }
  }, [isOpen, responsavel, passageiro, condicoes, enderecoForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomeResp.trim()) {
      toast.error("O nome do responsável é obrigatório.");
      return;
    }

    try {
      const endValues = enderecoForm.getValues();

      await salvarDados({
        responsavel: {
          nome: nomeResp.trim(),
          telefone: telefoneResp.replace(/\D/g, "") || undefined,
          cpf: cpfResp.replace(/\D/g, "") || undefined,
          email: emailResp.trim() || undefined,
          parentesco: parentescoResp || undefined,
          cep: endValues.cep ? endValues.cep.replace(/\D/g, "") : undefined,
          logradouro: endValues.logradouro ? endValues.logradouro.trim() : undefined,
          numero: endValues.numero ? endValues.numero.trim() : undefined,
          complemento: endValues.complemento ? endValues.complemento.trim() : undefined,
          bairro: endValues.bairro ? endValues.bairro.trim() : undefined,
          cidade: endValues.cidade ? endValues.cidade.trim() : undefined,
          estado: endValues.estado ? endValues.estado.trim() : undefined,
          referencia: endValues.referencia ? endValues.referencia.trim() : undefined,
        },
        passageiro: {
          turma: turma.trim() || undefined,
          sala: sala.trim() || undefined,
          nome_professor: nomeProfessor.trim() || undefined,
          observacoes: observacoes.trim() || undefined,
        },
      });

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
        title="Atualizar Meus Dados"
        subtitle="Mantenha seus contatos e endereço sincronizados com o motorista"
        icon={<User className="w-5 h-5 text-[#0a0a0a]" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
        <BaseDialog.Body className="space-y-6 max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
              <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                <User className="w-4 h-4" />
              </div>
              Dados do Responsável
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  Nome Completo <span className="text-[#e7000b]">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={nomeResp}
                    onChange={(e) => setNomeResp(e.target.value)}
                    placeholder="Seu nome completo"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">
                  WhatsApp / Celular <span className="text-[#e7000b]">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    value={telefoneResp}
                    onChange={(e) => setTelefoneResp(phoneMask(e.target.value))}
                    placeholder="(00) 00000-0000"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">CPF</Label>
                <Input
                  value={cpfResp}
                  onChange={(e) => setCpfResp(cpfMask(e.target.value))}
                  placeholder="000.000.000-00"
                  className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                  <Input
                    type="email"
                    value={emailResp}
                    onChange={(e) => setEmailResp(e.target.value)}
                    placeholder="seuemail@exemplo.com"
                    className="pl-10 h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[#0a0a0a] font-medium text-xs">Grau de Parentesco</Label>
                <NativeSelect
                  value={parentescoResp}
                  onChange={(e) => setParentescoResp(e.target.value)}
                >
                  <option value="Mãe">Mãe</option>
                  <option value="Pai">Pai</option>
                  <option value="Responsável Legal">Responsável Legal</option>
                  <option value="Avô / Avó">Avô / Avó</option>
                  <option value="Tio / Tia">Tio / Tia</option>
                  <option value="Outro">Outro</option>
                </NativeSelect>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#e5e5e5]">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
              <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              Endereço Residencial (Embarque / Desembarque)
            </div>

            <Form {...enderecoForm}>
              <FormEnderecoFields isExternal={true} />
            </Form>
          </div>

          <div className="space-y-4 pt-2 border-t border-[#e5e5e5]">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-semibold text-[#0a0a0a]">
              <div className="w-8 h-8 rounded-[10px] bg-[#f5f5f5] flex items-center justify-center text-[#737373] border border-[#e5e5e5] shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              Dados Escolares e Cuidados do Aluno
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-[#0a0a0a] font-medium text-xs">Turma / Série Nova</Label>
                <Input
                  value={turma}
                  onChange={(e) => setTurma(e.target.value)}
                  placeholder="Ex: 3º Ano B"
                  className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-[#0a0a0a] font-medium text-xs">Sala (se souber)</Label>
                <Input
                  value={sala}
                  onChange={(e) => setSala(e.target.value)}
                  placeholder="Ex: Sala 04"
                  className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-1">
                <Label className="text-[#0a0a0a] font-medium text-xs">Professor(a) (se souber)</Label>
                <Input
                  value={nomeProfessor}
                  onChange={(e) => setNomeProfessor(e.target.value)}
                  placeholder="Ex: Profa. Juliana"
                  className="h-10 sm:h-11 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none w-full"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <HeartPulse className="w-3.5 h-3.5 text-[#e7000b]" />
                  <Label className="text-[#0a0a0a] font-medium text-xs">
                    Observações de Saúde, Alergias ou Cuidados Especiais
                  </Label>
                </div>
                <Textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Descreva se o aluno necessita de algum cuidado especial durante o transporte..."
                  className="rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] text-sm text-[#0a0a0a] placeholder:text-[#737373] shadow-none min-h-[80px]"
                />
              </div>
            </div>
          </div>
        </BaseDialog.Body>

        <BaseDialog.Footer className="flex items-center justify-end gap-2.5 p-4 sm:p-5 border-t border-[#e5e5e5]">
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
    </BaseDialog>
  );
}
