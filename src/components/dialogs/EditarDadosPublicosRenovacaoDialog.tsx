import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormEnderecoFields } from "@/components/forms/FormEnderecoFields";
import { BaseDialog } from "@/components/ui/BaseDialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Save,
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
      setSala(passageiro.sala || "");
      setNomeProfessor(condicoes.nome_professor?.novo || passageiro.nome_professor || "");
      setObservacoes(passageiro.observacoes || "");
    }
  }, [isOpen, responsavel, passageiro, condicoes, enderecoForm]);

  const handleSalvar = async () => {
    try {
      const endValues = enderecoForm.getValues();
      await salvarDados({
        responsavel: {
          nome: nomeResp.trim() || undefined,
          telefone: telefoneResp.replace(/\D/g, "") || undefined,
          cpf: cpfResp.replace(/\D/g, "") || undefined,
          email: emailResp.trim() || undefined,
          parentesco: parentescoResp.trim() || undefined,
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
        icon={<User className="w-5 h-5 text-emerald-700" />}
        onClose={() => safeCloseDialog(onClose)}
      />

      <BaseDialog.Body className="space-y-6 max-h-[70vh] overflow-y-auto px-4 py-4 sm:px-6">
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dados do Responsável
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-medium text-slate-600">Nome Completo</Label>
              <Input
                value={nomeResp}
                onChange={(e) => setNomeResp(e.target.value)}
                placeholder="Seu nome completo"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">WhatsApp / Celular</Label>
              <div className="relative">
                <Input
                  value={telefoneResp}
                  onChange={(e) => setTelefoneResp(phoneMask(e.target.value))}
                  placeholder="(00) 00000-0000"
                  className="h-9 text-xs pl-8"
                />
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">CPF</Label>
              <Input
                value={cpfResp}
                onChange={(e) => setCpfResp(cpfMask(e.target.value))}
                placeholder="000.000.000-00"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">E-mail</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={emailResp}
                  onChange={(e) => setEmailResp(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="h-9 text-xs pl-8"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600">Grau de Parentesco</Label>
              <Select value={parentescoResp} onValueChange={setParentescoResp}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mãe">Mãe</SelectItem>
                  <SelectItem value="Pai">Pai</SelectItem>
                  <SelectItem value="Responsável Legal">Responsável Legal</SelectItem>
                  <SelectItem value="Avô / Avó">Avô / Avó</SelectItem>
                  <SelectItem value="Tio / Tia">Tio / Tia</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Endereço Residencial (Embarque / Desembarque)
            </span>
          </div>

          <Form {...enderecoForm}>
            <FormEnderecoFields isExternal={true} />
          </Form>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dados Escolares e Cuidados do Aluno
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs font-medium text-slate-600">Turma / Série Nova</Label>
              <Input
                value={turma}
                onChange={(e) => setTurma(e.target.value)}
                placeholder="Ex: 3º Ano B"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs font-medium text-slate-600">Sala (se souber)</Label>
              <Input
                value={sala}
                onChange={(e) => setSala(e.target.value)}
                placeholder="Ex: Sala 04"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <Label className="text-xs font-medium text-slate-600">Professor(a) (se souber)</Label>
              <Input
                value={nomeProfessor}
                onChange={(e) => setNomeProfessor(e.target.value)}
                placeholder="Ex: Profa. Juliana"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <div className="flex items-center gap-1.5 mb-1">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                <Label className="text-xs font-medium text-slate-600">
                  Observações de Saúde, Alergias ou Cuidados Especiais
                </Label>
              </div>
              <Textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Alergia a picada de inseto, remédios em uso, restrições..."
                className="text-xs resize-none h-18"
              />
            </div>
          </div>
        </div>
      </BaseDialog.Body>

      <BaseDialog.Footer className="flex gap-2">
        <BaseDialog.Action
          variant="outline"
          label="Cancelar"
          onClick={() => safeCloseDialog(onClose)}
          disabled={isPending}
        />
        <BaseDialog.Action
          variant="primary"
          label="Salvar Alterações"
          onClick={handleSalvar}
          isLoading={isPending}
          icon={<Save className="w-4 h-4" />}
          className="bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/20"
        />
      </BaseDialog.Footer>
    </BaseDialog>
  );
}
