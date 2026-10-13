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
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { phoneMask } from "@/utils/masks";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#0a0a0a] animate-spin" />
          <p className="text-sm font-medium text-[#737373]">Carregando informações do passeio...</p>
        </div>
      </div>
    );
  }

  if (error || !passeio) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 sm:p-8 rounded-[24px] border border-[#e5e5e5] text-center space-y-4 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]">
          <div className="h-12 w-12 rounded-[18px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center mx-auto border border-[#e5e5e5]">
            <Ticket className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-[#0a0a0a] tracking-tight">Passeio Não Encontrado</h2>
          <p className="text-sm text-[#737373] leading-relaxed">
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
    toast.success("Chave PIX copiada para a área de transferência!");
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
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col justify-start items-center py-4 sm:py-10 px-3 sm:px-6 relative">
      <div className="w-full max-w-lg space-y-3 sm:space-y-4">
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                <Ticket className="h-3 w-3 text-[#737373]" />
                Inscrição para Passeio
              </span>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight leading-tight pt-1">
                {passeio.titulo}
              </h1>
              {passeio.motorista_nome && (
                <p className="text-xs text-[#737373]">
                  Organizado por <strong className="text-[#0a0a0a] font-medium">{passeio.motorista_nome}</strong>
                </p>
              )}
            </div>

            {passeio.valor_por_pessoa ? (
              <div className="self-start sm:self-auto shrink-0 text-left sm:text-right px-3 py-2 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5]">
                <span className="text-[10px] uppercase font-medium text-[#737373] tracking-wider block">
                  Valor
                </span>
                <span className="text-lg sm:text-xl font-semibold text-[#0a0a0a] leading-none block mt-0.5">
                  {formatCurrency(Number(passeio.valor_por_pessoa))}
                </span>
              </div>
            ) : null}
          </div>

          <div className="divide-y divide-[#e5e5e5] rounded-[18px] border border-[#e5e5e5] bg-[#fafafa] p-3.5 sm:p-4 text-xs space-y-2.5">
            <div className="flex items-start gap-2.5 pb-2.5">
              <MapPin className="h-4 w-4 text-[#737373] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-medium text-[#737373] block tracking-wider">Destino</span>
                <span className="font-semibold text-[#0a0a0a] text-sm leading-snug break-words">{passeio.destino}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 py-2.5">
              <Calendar className="h-4 w-4 text-[#737373] shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] uppercase font-medium text-[#737373] block tracking-wider">Data e Horário</span>
                <span className="font-semibold text-[#0a0a0a] text-sm leading-snug">{dataFormatada}</span>
              </div>
            </div>

            {passeio.origem && (
              <div className="flex items-start gap-2.5 pt-2.5">
                <MapPin className="h-4 w-4 text-[#737373] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-medium text-[#737373] block tracking-wider">Ponto de Encontro</span>
                  <span className="font-semibold text-[#0a0a0a] text-sm leading-snug break-words">{passeio.origem}</span>
                </div>
              </div>
            )}
          </div>

          {passeio.chave_pix && (
            <div className="p-3.5 sm:p-4 rounded-[18px] bg-[#fafafa] border border-[#e5e5e5] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#0a0a0a] flex items-center gap-1.5 truncate">
                  <QrCode className="h-4 w-4 text-[#737373] shrink-0" />
                  Chave PIX
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copiarChavePix}
                  className="h-7 px-2.5 text-xs font-medium gap-1 rounded-[18px] border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] shrink-0"
                >
                  <Copy className="h-3 w-3 text-[#737373]" />
                  <span>Copiar</span>
                </Button>
              </div>
              <div className="p-2.5 bg-white rounded-[12px] border border-[#e5e5e5] font-mono text-xs text-[#0a0a0a] select-all break-all">
                {passeio.chave_pix}
              </div>
            </div>
          )}

          {passeio.observacoes && (
            <div className="text-xs text-[#737373] bg-[#fafafa] p-3.5 sm:p-4 rounded-[18px] border border-[#e5e5e5] leading-relaxed break-words">
              <strong className="text-[#0a0a0a] block mb-1">Informações Adicionais:</strong>
              {passeio.observacoes}
            </div>
          )}

          <div className="pt-1">
            {isEsgotado && !inscritoComSucesso ? (
              <Banner
                variant="warning"
                title="Inscrições Encerradas"
                description="As vagas para este passeio foram esgotadas. Em caso de dúvidas, contate o organizador."
              />
            ) : inscritoComSucesso ? (
              <div className="rounded-[24px] border border-[#e5e5e5] bg-white p-5 sm:p-6 text-center space-y-3.5">
                <div className="h-12 w-12 bg-[#f5f5f5] text-[#0a0a0a] rounded-[18px] flex items-center justify-center mx-auto border border-[#e5e5e5]">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#0a0a0a] tracking-tight">Presença Confirmada!</h2>
                  <p className="text-xs sm:text-sm text-[#737373] mt-1">
                    A vaga de <strong className="text-[#0a0a0a] font-medium">{nome}</strong> foi registrada com sucesso.
                  </p>
                </div>
                {passeio.chave_pix && (
                  <p className="text-xs text-[#737373] max-w-sm mx-auto leading-relaxed pt-1">
                    Realize o pagamento utilizando a chave PIX acima e envie o comprovante ao organizador.
                  </p>
                )}
                {passeio.motorista_telefone && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={() => {
                        const msg = `Olá! Confirmei a presença de *${nome}* no passeio *${passeio.titulo}*. Segue o comprovante de pagamento:`;
                        const url = buildWhatsAppUrl(passeio.motorista_telefone, msg);
                        window.open(url, "_blank");
                      }}
                      className="w-full h-11 rounded-[18px] text-xs sm:text-sm font-semibold bg-[#25D366] hover:bg-[#20b858] text-white gap-2 border-none shadow-xs transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
                      <span>Enviar Comprovante pelo WhatsApp</span>
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <div className="border-t border-[#e5e5e5] pt-5 flex items-center justify-between gap-2">
                  <div className="space-y-1">
                    <h2 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
                      Confirmar Presença
                    </h2>
                    <p className="text-xs text-[#737373]">
                      Informe os dados abaixo para reservar o assento.
                    </p>
                  </div>
                  {isDevEnv() && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleFillMock}
                      title="Preencher com dados fictícios (Dev)"
                      className="h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5] shrink-0"
                    >
                      <Wand2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#0a0a0a] block">
                      Nome do Participante (Aluno) <span className="text-[#e7000b]">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: Lucas Gabriel da Silva"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                      />
                    </div>
                    {hasSubmitted && !nome.trim() && (
                      <span className="text-[11px] text-[#e7000b] block mt-1">Nome é obrigatório</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 py-1 px-1 cursor-pointer select-none">
                    <Checkbox
                      id="proprioResponsavel"
                      checked={isProprioResponsavel}
                      onCheckedChange={(checked) => setIsProprioResponsavel(!!checked)}
                      className="rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <label
                      htmlFor="proprioResponsavel"
                      className="text-xs font-medium text-[#0a0a0a] cursor-pointer select-none leading-none"
                    >
                      Eu mesmo sou o participante (maior de idade)
                    </label>
                  </div>

                  {!isProprioResponsavel && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-[#0a0a0a] block">
                        Nome do Pai / Mãe ou Responsável <span className="text-[#e7000b]">*</span>
                      </label>
                      <div className="relative">
                        <Contact className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                        <Input
                          value={responsavelNome}
                          onChange={(e) => setResponsavelNome(e.target.value)}
                          placeholder="Ex: Mariana Silva (Mãe)"
                          className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                        />
                      </div>
                      {hasSubmitted && !responsavelNome.trim() && (
                        <span className="text-[11px] text-[#e7000b] block mt-1">Nome do responsável é obrigatório</span>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#0a0a0a] block">
                      WhatsApp / Telefone para Contato <span className="text-[#e7000b]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        value={telefone}
                        onChange={(e) => setTelefone(phoneMask(e.target.value))}
                        placeholder="(11) 98765-4321"
                        maxLength={15}
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                      />
                    </div>
                    {hasSubmitted && (!telefone.trim() || telefone.replace(/\D/g, "").length < 10) && (
                      <span className="text-[11px] text-[#e7000b] block mt-1">Telefone válido com DDD é obrigatório</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#0a0a0a] block">
                      Endereço / Ponto de Embarque <span className="text-[#737373] font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        value={endereco}
                        onChange={(e) => setEndereco(e.target.value)}
                        placeholder="Ex: Rua das Flores, 120"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-[#0a0a0a] block">
                      Observações ou Restrições <span className="text-[#737373] font-normal">(Opcional)</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
                      <Input
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Ex: Alérgico a amendoim, leva autorização"
                        className="pl-10 h-10 rounded-[18px] bg-[#f5f5f5] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-sm text-[#0a0a0a]"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={inscreverMutation.isPending}
                      className="w-full h-10 rounded-[18px] bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs sm:text-sm border-none shadow-xs transition-all active:scale-[0.98]"
                    >
                      {inscreverMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Confirmando presença...</span>
                        </div>
                      ) : (
                        <span>Confirmar Presença no Passeio</span>
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
