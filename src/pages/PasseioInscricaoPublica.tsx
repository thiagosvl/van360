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
import { formatCurrency } from "@/utils/formatters/currency";
import { phoneMask } from "@/utils/masks";
import {
  Ticket,
  MapPin,
  Calendar,
  Users,
  QrCode,
  Copy,
  CheckCircle2,
  Phone,
  User,
  Contact,
  FileText,
  Sparkles,
  Loader2,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#e8ecf1] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-[#1a3a5c] animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Carregando informações do passeio...</p>
        </div>
      </div>
    );
  }

  if (error || !passeio) {
    return (
      <div className="min-h-screen bg-[#e8ecf1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-[2rem] border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Ticket className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Passeio Não Encontrado</h2>
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
      toast.error("Erro ao confirmar inscrição. Verifique se ainda há vagas disponíveis.");
    }
  };

  const dataFormatada = new Date(passeio.data_inicio).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-[#e8ecf1] flex flex-col justify-start items-center py-6 px-4 sm:px-6 lg:px-8 relative overflow-hidden pt-[max(1rem,var(--safe-area-top))] pb-[max(6rem,var(--safe-area-bottom))]">
      <div className="w-full max-w-2xl relative z-10 space-y-6">
        <div className="bg-slate-50 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-200">
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#1a3a5c]/10 text-[#1a3a5c] border border-[#1a3a5c]/20 flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5" />
                Passeio & Evento
              </span>

              {passeio.vagas_disponiveis !== null && (
                <span className="text-xs font-bold text-slate-500">
                  {passeio.vagas_disponiveis > 0 ? `${passeio.vagas_disponiveis} vagas restantes` : "Esgotado"}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1a3a5c]">
                {passeio.titulo}
              </h1>
              {passeio.motorista_nome && (
                <p className="text-sm text-slate-500 mt-1">
                  Organizado por: <strong className="text-slate-800">{passeio.motorista_nome}</strong>
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3 border-y border-slate-200/80 text-xs">
              <div className="flex items-center gap-2.5 text-slate-700">
                <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Destino</span>
                  <span className="font-semibold text-slate-800">{passeio.destino}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-slate-700">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Data e Horário</span>
                  <span className="font-semibold text-slate-800">{dataFormatada}</span>
                </div>
              </div>

              {passeio.origem && (
                <div className="flex items-center gap-2.5 text-slate-700 sm:col-span-2">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ponto de Encontro</span>
                    <span className="font-semibold text-slate-800">{passeio.origem}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Valor por Participante</span>
                <span className="text-xl sm:text-2xl font-black text-emerald-800">
                  {formatCurrency(Number(passeio.valor_por_pessoa || 0))}
                </span>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Vagas</span>
                <span className="text-xl sm:text-2xl font-black text-slate-800">
                  {passeio.vagas_disponiveis !== null ? `${passeio.vagas_disponiveis}` : "Abertas"}
                </span>
              </div>
            </div>

            {passeio.chave_pix && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-emerald-600" />
                    Chave PIX para Pagamento
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copiarChavePix}
                    className="h-7 text-[11px] font-bold gap-1 rounded-xl"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar PIX
                  </Button>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-800 break-all select-all">
                  {passeio.chave_pix}
                </div>
              </div>
            )}

            {passeio.observacoes && (
              <div className="text-xs text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
                <strong className="text-slate-800 block mb-1">Informações Adicionais:</strong>
                {passeio.observacoes}
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 pt-2 sm:pt-2">
            {isEsgotado && !inscritoComSucesso ? (
              <Banner
                variant="warning"
                title="Vagas Esgotadas"
                description="Todas as vagas para este passeio já foram preenchidas. Entre em contato diretamente com o organizador para a lista de espera."
              />
            ) : inscritoComSucesso ? (
              <div className="bg-white rounded-[2rem] border border-emerald-200 p-8 text-center space-y-4 shadow-xs animate-in zoom-in-95 duration-200">
                <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">Presença Confirmada!</h2>
                  <p className="text-sm text-slate-600 mt-2">
                    A vaga de <strong className="text-slate-800">{nome}</strong> foi registrada no passeio com sucesso.
                  </p>
                </div>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Caso o pagamento seja via PIX, utilize a chave informada acima e envie o comprovante ao organizador do transporte.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="border-t border-slate-200 pt-5">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="h-5 w-5 text-[#1a3a5c]" />
                    Confirmar Participação
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preencha os dados abaixo com o visual simplificado do Van360.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <StitchField
                    icon={User}
                    label="Nome do Participante / Aluno"
                    required
                    error={hasSubmitted && !nome.trim()}
                  >
                    <Input
                      placeholder="Digite o nome completo"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setIsProprioResponsavel(!isProprioResponsavel)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setIsProprioResponsavel(!isProprioResponsavel);
                      }
                    }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/80 transition-colors cursor-pointer select-none shadow-xs"
                  >
                    <Checkbox
                      checked={isProprioResponsavel}
                      onCheckedChange={(checked) => setIsProprioResponsavel(!!checked)}
                      className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700">
                      O participante é maior de idade / O próprio responsável
                    </span>
                  </div>

                  {!isProprioResponsavel && (
                    <StitchField
                      icon={Contact}
                      label="Nome do Responsável"
                      required
                      error={hasSubmitted && !responsavelNome.trim()}
                    >
                      <Input
                        placeholder="Digite o nome do responsável"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                      />
                    </StitchField>
                  )}

                  <StitchField
                    icon={Phone}
                    label="Telefone (WhatsApp)"
                    required
                    error={hasSubmitted && (!telefone.trim() || telefone.replace(/\D/g, "").length < 10)}
                  >
                    <Input
                      type="tel"
                      inputMode="numeric"
                      placeholder="(00) 00000-0000"
                      value={telefone}
                      maxLength={15}
                      onChange={(e) => setTelefone(phoneMask(e.target.value))}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <StitchField icon={MapPin} label="Endereço / Local de Embarque (Opcional)">
                    <Input
                      placeholder="Rua, número ou ponto de referência"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <StitchField icon={FileText} label="Observações ou Restrições (Opcional)">
                    <Input
                      placeholder="Alergias, restrições alimentares ou recomendações"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      className="h-7 p-0 rounded-none bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-[15px] font-semibold text-slate-700 shadow-none placeholder:text-slate-400 placeholder:font-normal w-full"
                    />
                  </StitchField>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={inscreverMutation.isPending}
                      className="w-full h-14 rounded-2xl bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-bold text-base shadow-lg shadow-[#1a3a5c]/20 hover:shadow-[#1a3a5c]/30 transition-all active:scale-[0.98]"
                    >
                      {inscreverMutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Confirmando Vaga...
                        </>
                      ) : (
                        "Confirmar Minha Vaga no Passeio"
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
