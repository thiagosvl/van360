import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  usePasseioPublicoQuery,
  useInscreverPublicoMutation,
} from "@/hooks/api/useFretamentosApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Banner } from "@/components/ui/Banner";
import { StitchField } from "@/components/forms/StitchField";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { phoneMask } from "@/utils/masks";
import { isDevEnv } from "@/utils/detectPlatform";
import { mockGenerator } from "@/utils/mocks/generator";
import {
  Ticket,
  MapPin,
  Calendar,
  QrCode,
  Copy,
  CheckCircle2,
  Phone,
  User,
  Contact,
  FileText,
  Sparkles,
  Loader2,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

export default function PasseioInscricaoPublica() {
  const { slug } = useParams<{ slug: string }>();
  const { data: passeio, isLoading, error } = usePasseioPublicoQuery(slug || "");
  const inscreverMutation = useInscreverPublicoMutation();

  const [nome, setNome] = useState("");
  const [isProprioResponsavel, setIsProprioResponsavel] = useState(false);
  const [responsavelNome, setResponsavelNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [inscritoComSucesso, setInscritoComSucesso] = useState(false);

  const handleFillMock = () => {
    const nomeAluno = mockGenerator.name();
    const nomeResp = mockGenerator.name();
    const phone = mockGenerator.phone();
    setNome(nomeAluno);
    setIsProprioResponsavel(false);
    setResponsavelNome(nomeResp);
    setTelefone(phone);
    setEndereco("Rua das Acácias, 240");
    setObservacoes("Participante confirmado via link público.");
    setHasSubmitted(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#1a3a5c] animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Carregando informações do passeio...</p>
        </div>
      </div>
    );
  }

  if (error || !passeio) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200/80 text-center space-y-4 shadow-xs">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Ticket className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Passeio Não Encontrado</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Este link pode estar incorreto, cancelado ou expirado pelo organizador.
          </p>
        </div>
      </div>
    );
  }

  const isEsgotado = passeio.vagas_disponiveis !== null && passeio.vagas_disponiveis <= 0;

  const copiarChavePix = () => {
    if (!passeio.chave_pix) return;
    navigator.clipboard.writeText(passeio.chave_pix);
    toast.success("Chave PIX copiada!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    if (!nome.trim()) {
      toast.error("Por favor, informe o nome do participante.");
      return;
    }
    if (!isProprioResponsavel && !responsavelNome.trim()) {
      toast.error("Por favor, informe o nome do responsável.");
      return;
    }
    if (!telefone.trim() || telefone.replace(/\D/g, "").length < 10) {
      toast.error("Por favor, informe um telefone de contato válido com DDD.");
      return;
    }

    try {
      await inscreverMutation.mutateAsync({
        slug: slug || "",
        payload: {
          nome: nome.trim(),
          is_proprio_responsavel: isProprioResponsavel,
          responsavel_nome: isProprioResponsavel ? nome.trim() : responsavelNome.trim(),
          telefone: telefone.trim(),
          endereco: endereco.trim() || null,
          observacoes: observacoes.trim() || null,
        },
      });

      setInscritoComSucesso(true);
    } catch {
      toast.error("Erro ao confirmar inscrição. Tente novamente mais tarde.");
    }
  };

  const dataFormatada = formatDateTime(passeio.data_inicio);

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col justify-start items-center py-4 sm:py-8 px-3.5 sm:px-6 relative overflow-hidden">
      <div className="w-full max-w-lg relative z-10 space-y-3 sm:space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                {passeio.titulo}
              </h1>
              {passeio.motorista_nome && (
                <p className="text-xs text-slate-500">
                  Organizado por <strong className="text-slate-800 font-semibold">{passeio.motorista_nome}</strong>
                </p>
              )}
            </div>

            {passeio.valor_por_pessoa ? (
              <div className="shrink-0 text-right px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/90 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Valor
                </span>
                <span className="text-lg sm:text-xl font-bold text-slate-900 leading-none">
                  {formatCurrency(Number(passeio.valor_por_pessoa))}
                </span>
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs space-y-2.5">
            <div className="flex items-start gap-3 pb-2.5">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Destino</span>
                <span className="font-semibold text-slate-800 text-sm leading-snug">{passeio.destino}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 py-2.5">
              <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Data e Horário</span>
                <span className="font-semibold text-slate-800 text-sm leading-snug">{dataFormatada}</span>
              </div>
            </div>

            {passeio.origem && (
              <div className="flex items-start gap-3 pt-2.5">
                <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ponto de Encontro</span>
                  <span className="font-semibold text-slate-800 text-sm leading-snug">{passeio.origem}</span>
                </div>
              </div>
            )}
          </div>

          {passeio.chave_pix && (
            <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4 text-slate-400" />
                  Chave PIX para Pagamento
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copiarChavePix}
                  className="h-7 px-2.5 text-xs font-semibold gap-1.5 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs active:scale-95"
                >
                  <Copy className="h-3 w-3 text-slate-400" />
                  Copiar PIX
                </Button>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800 select-all break-all">
                {passeio.chave_pix}
              </div>
            </div>
          )}

          {passeio.observacoes && (
            <div className="text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
              <strong className="text-slate-800 block mb-1">Informações Adicionais:</strong>
              {passeio.observacoes}
            </div>
          )}

          <div className="pt-1">
            {isEsgotado && !inscritoComSucesso ? (
              <Banner
                variant="warning"
                title="Inscrições Encerradas"
                description="As inscrições para este passeio foram encerradas pelo organizador. Entre em contato diretamente caso tenha dúvidas."
              />
            ) : inscritoComSucesso ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center space-y-3 animate-in zoom-in-95 duration-200 shadow-xs">
                <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-emerald-100">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Inscrição Confirmada!</h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    A vaga de <strong className="text-slate-800">{nome}</strong> foi garantida com sucesso.
                  </p>
                </div>
                {passeio.chave_pix && (
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed pt-1">
                    Caso o pagamento seja via PIX, efetue a transferência utilizando a chave informada acima e envie o comprovante ao organizador.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-[#1a3a5c]" />
                      Confirmar Presença
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Informe os dados abaixo para garantir a participação no passeio.
                    </p>
                  </div>
                  {isDevEnv() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-[#1a3a5c] hover:bg-slate-100 rounded-full h-8 w-8 shrink-0 transition-all"
                      onClick={handleFillMock}
                      title="Preencher com dados fictícios"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <StitchField
                    icon={User}
                    label="Nome do Participante"
                    required
                    variant="muted"
                    error={hasSubmitted && !nome.trim()}
                  >
                    <Input
                      placeholder="Nome completo do participante"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] font-semibold text-slate-800 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <label
                    htmlFor="is-proprio-responsavel"
                    className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/90 bg-slate-50/80 hover:bg-slate-100/60 transition-colors cursor-pointer select-none shadow-2xs"
                  >
                    <Checkbox
                      id="is-proprio-responsavel"
                      checked={isProprioResponsavel}
                      onCheckedChange={(checked) => setIsProprioResponsavel(Boolean(checked))}
                      className="h-4 w-4 rounded border-slate-300 text-[#1a3a5c] focus:ring-[#1a3a5c]"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      O participante é o próprio responsável (maior de idade)
                    </span>
                  </label>

                  {!isProprioResponsavel && (
                    <StitchField
                      icon={Contact}
                      label="Nome do Responsável"
                      required
                      variant="muted"
                      error={hasSubmitted && !responsavelNome.trim()}
                    >
                      <Input
                        placeholder="Nome do pai, mãe ou responsável"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] font-semibold text-slate-800 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      />
                    </StitchField>
                  )}

                  <StitchField
                    icon={Phone}
                    label="Telefone (WhatsApp)"
                    required
                    variant="muted"
                    error={hasSubmitted && (!telefone.trim() || telefone.replace(/\D/g, "").length < 10)}
                  >
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      maxLength={15}
                      onChange={(e) => setTelefone(phoneMask(e.target.value))}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] font-semibold text-slate-800 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <StitchField
                    icon={MapPin}
                    label="Endereço / Ponto de Embarque (Opcional)"
                    variant="muted"
                  >
                    <Input
                      placeholder="Endereço ou ponto de referência para embarque"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] font-semibold text-slate-800 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <StitchField
                    icon={FileText}
                    label="Observações ou Restrições (Opcional)"
                    variant="muted"
                  >
                    <Input
                      placeholder="Ex: alergias, cuidados especiais ou recados"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] font-semibold text-slate-800 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={inscreverMutation.isPending}
                      className="w-full h-12 rounded-xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/95 text-white font-bold text-sm shadow-xs transition-all active:scale-[0.99]"
                    >
                      {inscreverMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Confirmando Participação...
                        </>
                      ) : (
                        "Confirmar Participação"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
