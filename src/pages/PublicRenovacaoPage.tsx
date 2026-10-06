import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicRenovacao, useResponderPublicRenovacao } from "@/hooks/api/useRenovacoes";
import { formatCurrency } from "@/utils/formatters";
import { formatDateToBR } from "@/utils/formatters/date";
import { phoneMask } from "@/utils/masks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Banner } from "@/components/ui/Banner";
import { EditarDadosPublicosRenovacaoDialog } from "@/components/dialogs/EditarDadosPublicosRenovacaoDialog";
import {
  CheckCircle2,
  FileSignature,
  School,
  Calendar,
  CreditCard,
  Clock,
  Car,
  User,
  ShieldCheck,
  ArrowRight,
  Phone,
  MapPin,
  Edit3,
  MessageCircle,
  HeartPulse,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function PublicRenovacaoPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = usePublicRenovacao(token);
  const { mutateAsync: responder, isPending: isResponding } = useResponderPublicRenovacao(token);

  const [confirmRecusaOpen, setConfirmRecusaOpen] = useState(false);
  const [modalEdicaoOpen, setModalEdicaoOpen] = useState(false);
  const [observacoesPais, setObservacoesPais] = useState("");
  const [contractData, setContractData] = useState<{ token_acesso: string; link_assinatura: string } | null>(null);

  const handleConfirmar = async () => {
    try {
      const response = await responder({
        status: "confirmado",
        observacoes_pais: observacoesPais.trim() || undefined,
      });
      if (response?.contrato) {
        setContractData({
          token_acesso: response.contrato.token_acesso,
          link_assinatura: response.contrato.link_assinatura,
        });
      }
      toast.success("Renovação confirmada com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente ou fale com o motorista.";
      toast.error("Erro ao confirmar renovação", { description: msg });
    }
  };

  const handleRecusar = async () => {
    try {
      await responder({
        status: "recusado",
        observacoes_pais: observacoesPais.trim() || undefined,
      });
      setConfirmRecusaOpen(false);
      toast.info("Resposta registrada. A vaga não será renovada.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tente novamente ou fale com o motorista.";
      toast.error("Erro ao registrar resposta", { description: msg });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Carregando proposta de renovação...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Banner
            variant="danger"
            title="Proposta Não Encontrada"
            description="Este link de renovação pode ter expirado ou não existe. Entre em contato diretamente com o responsável pelo transporte escolar."
          />
        </div>
      </div>
    );
  }

  const { motorista, passageiro, responsavel, condicoes, status, ano_destino, contrato } = data;
  const isConfirmed = status === "confirmado";
  const isRecused = status === "recusado";
  const activeContractToken = contractData?.token_acesso || contrato?.token_acesso;
  const temCondicoesAlteradas = Boolean(
    condicoes?.valor?.alterado ||
    condicoes?.dia_vencimento?.alterado ||
    condicoes?.escola?.alterado ||
    condicoes?.periodo?.alterado ||
    condicoes?.modalidade?.alterado
  );

  const motoristaWhatsappUrl = motorista.telefone
    ? `https://wa.me/55${motorista.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Olá! Estou visualizando a proposta de renovação de ${passageiro.nome} para ${ano_destino} e gostaria de tirar uma dúvida sobre escola ou turno.`
      )}`
    : null;

  const enderecoFormatado = [
    responsavel?.logradouro ? `${responsavel.logradouro}${responsavel.numero ? `, ${responsavel.numero}` : ""}` : null,
    responsavel?.complemento || null,
    responsavel?.bairro || null,
    responsavel?.cidade && responsavel?.estado ? `${responsavel.cidade} - ${responsavel.estado}` : (responsavel?.cidade || null),
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-3 sm:px-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-sm flex items-center gap-3.5">
          {motorista.logo_url ? (
            <img
              src={motorista.logo_url}
              alt={motorista.apelido || motorista.nome}
              className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
              <Car className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 block">
              Transporte Escolar
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
              {motorista.apelido || motorista.nome}
            </h1>
            {motorista.telefone && (
              <a
                href={`tel:${motorista.telefone.replace(/\D/g, "")}`}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-700 transition-colors mt-0.5"
              >
                <Phone className="w-3 h-3 text-slate-400" />
                {phoneMask(motorista.telefone)}
              </a>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 font-bold text-base">
                {passageiro.nome.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Ano Letivo {ano_destino}
                </span>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-1">
                  {passageiro.nome}
                </h2>
                {responsavel?.nome && (
                  <p className="text-xs text-slate-500 truncate">
                    {responsavel.parentesco || "Responsável"}: <span className="font-medium text-slate-700">{responsavel.nome}</span>
                  </p>
                )}
              </div>
            </div>

            {!isConfirmed && !isRecused && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setModalEdicaoOpen(true)}
                className="h-8 px-2.5 text-xs font-semibold gap-1 text-emerald-800 border-emerald-200 hover:bg-emerald-50 shrink-0"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Editar Dados
              </Button>
            )}
          </div>

          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
            <div className="flex items-start gap-2 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-slate-700 block">Endereço de Embarque:</span>
                <span className="text-slate-600 block leading-relaxed">
                  {enderecoFormatado || "Endereço não informado"}
                </span>
                {responsavel?.referencia && (
                  <span className="text-slate-400 italic block mt-0.5">
                    Ref: {responsavel.referencia}
                  </span>
                )}
              </div>
            </div>

            {(condicoes.turma?.novo || passageiro.turma || passageiro.sala || condicoes.nome_professor?.novo || passageiro.nome_professor) && (
              <div className="flex items-start gap-2 text-slate-600 pt-1.5 border-t border-slate-200/60">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-semibold text-slate-700 block">Dados da Sala / Turma:</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-600">
                    {(condicoes.turma?.novo || passageiro.turma) && (
                      <span>Turma: <strong>{condicoes.turma?.novo || passageiro.turma}</strong></span>
                    )}
                    {passageiro.sala && (
                      <span>Sala: <strong>{passageiro.sala}</strong></span>
                    )}
                    {(condicoes.nome_professor?.novo || passageiro.nome_professor) && (
                      <span>Prof.: <strong>{condicoes.nome_professor?.novo || passageiro.nome_professor}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {passageiro.observacoes && (
              <div className="flex items-start gap-2 text-slate-600 pt-1.5 border-t border-slate-200/60">
                <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-700 block">Cuidados Especiais / Saúde:</span>
                  <span className="text-slate-600 block">{passageiro.observacoes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {temCondicoesAlteradas && !isConfirmed && !isRecused && (
          <Banner
            variant="warning"
            title="Condições Atualizadas"
            description={`Os valores ou detalhes para ${ano_destino} foram atualizados. Por favor, confira as condições abaixo e confirme a sua resposta.`}
          />
        )}

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Condições Contratuais e Financeiras para {ano_destino}
          </h3>

          <div className="divide-y divide-slate-100 space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Mensalidade</span>
                  <span className="text-xs text-slate-400">
                    {condicoes.qtd_parcelas ? `${condicoes.qtd_parcelas} parcelas mensais` : "Parcela mensal"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.valor.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-red-500 text-xs sm:text-sm font-semibold">
                      {formatCurrency(condicoes.valor.atual)}
                    </span>
                    <span className="text-emerald-700 font-bold text-sm sm:text-base">
                      {formatCurrency(condicoes.valor.novo)}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    {formatCurrency(condicoes.valor.novo)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Vencimento</span>
                  <span className="text-xs text-slate-400">Dia todo mês</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.dia_vencimento.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-red-500 text-xs sm:text-sm font-semibold">
                      Dia {condicoes.dia_vencimento.atual}
                    </span>
                    <span className="text-emerald-700 font-bold text-sm sm:text-base">
                      Dia {condicoes.dia_vencimento.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-bold text-slate-900 text-sm sm:text-base">
                    Dia {condicoes.dia_vencimento.novo || 10}
                  </span>
                )}
              </div>
            </div>

            {(condicoes.data_inicio_cobranca || condicoes.data_fim_cobranca) && (
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Período de Cobrança</span>
                    <span className="text-xs text-slate-400">1ª à última parcela</span>
                  </div>
                </div>

                <div className="text-right text-xs sm:text-sm font-semibold text-slate-800">
                  {condicoes.data_inicio_cobranca ? formatDateToBR(condicoes.data_inicio_cobranca) : "Fev"}
                  {" até "}
                  {condicoes.data_fim_cobranca ? formatDateToBR(condicoes.data_fim_cobranca) : "Dez"}
                </div>
              </div>
            )}

            {(condicoes.data_inicio_transporte || condicoes.data_fim_transporte) && (
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-medium block">Período do Transporte</span>
                    <span className="text-xs text-slate-400">Início e fim das aulas</span>
                  </div>
                </div>

                <div className="text-right text-xs sm:text-sm font-semibold text-slate-800">
                  {condicoes.data_inicio_transporte ? formatDateToBR(condicoes.data_inicio_transporte) : `01/02/${ano_destino}`}
                  {" até "}
                  {condicoes.data_fim_transporte ? formatDateToBR(condicoes.data_fim_transporte) : `15/12/${ano_destino}`}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-3.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <School className="w-4 h-4 text-emerald-600" />
            Escola, Turno e Itinerário
          </h3>

          <div className="divide-y divide-slate-100 space-y-3 pt-1">
            <div className="flex items-start justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Escola</span>
                  <span className="text-xs text-slate-400">Unidade de destino</span>
                </div>
              </div>

              <div className="text-right max-w-[55%]">
                {condicoes.escola.alterado ? (
                  <div>
                    {condicoes.escola.atual && (
                      <span className="line-through text-red-500 text-xs font-semibold block truncate">
                        {condicoes.escola.atual}
                      </span>
                    )}
                    <span className="text-emerald-700 font-bold text-xs sm:text-sm block">
                      {condicoes.escola.novo || "Não informada"}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm block">
                    {condicoes.escola.novo || "Não informada"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Turno</span>
                  <span className="text-xs text-slate-400">Horário escolar</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.periodo.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-red-500 text-xs sm:text-sm font-semibold capitalize">
                      {condicoes.periodo.atual}
                    </span>
                    <span className="text-emerald-700 font-bold text-xs sm:text-sm capitalize">
                      {condicoes.periodo.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm capitalize">
                    {condicoes.periodo.novo || "Não informado"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium block">Modalidade</span>
                  <span className="text-xs text-slate-400">Itinerário</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.modalidade.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-red-500 text-xs sm:text-sm font-semibold">
                      {condicoes.modalidade.atual}
                    </span>
                    <span className="text-emerald-700 font-bold text-xs sm:text-sm">
                      {condicoes.modalidade.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {condicoes.modalidade.novo || "Ida e Volta"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {motoristaWhatsappUrl && !isConfirmed && !isRecused && (
          <Banner
            variant="info"
            title="Precisa mudar de escola ou de turno?"
            description="A escola e o turno afetam o trajeto e a disponibilidade de horário da van. Caso vá mudar de escola ou de período, converse previamente com o motorista pelo WhatsApp."
            action={{
              label: "Falar pelo WhatsApp",
              onClick: () => window.open(motoristaWhatsappUrl, "_blank"),
            }}
          />
        )}

        {isConfirmed ? (
          <div className="space-y-3">
            <Banner
              variant="success"
              title={`Vaga Confirmada para ${ano_destino}!`}
              description={`A vaga de ${passageiro.nome} está garantida para o ano letivo de ${ano_destino}. O motorista foi notificado.`}
            />

            {data.observacoes_pais && (
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-1">
                <span className="font-semibold text-slate-700 block">Seu recado enviado ao motorista:</span>
                <p className="text-slate-600 italic">"{data.observacoes_pais}"</p>
              </div>
            )}

            {activeContractToken && (
              <div className="bg-emerald-50/70 rounded-2xl p-4 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-xs sm:text-sm">
                  <FileSignature className="w-4 h-4 text-emerald-700" />
                  Contrato Digital de Prestação de Serviços
                </div>
                <p className="text-xs text-emerald-800">
                  O contrato referente ao ano de {ano_destino} está disponível para assinatura digital rápida pelo celular.
                </p>
                <Button
                  onClick={() => navigate(`/assinar/${activeContractToken}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-11 rounded-xl gap-2 shadow-sm"
                >
                  Assinar Contrato Digital Agora
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        ) : isRecused ? (
          <Banner
            variant="neutral"
            title="Vaga Não Renovada"
            description={`Você informou que não utilizará o transporte em ${ano_destino}. A vaga de ${passageiro.nome} foi liberada.`}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                Algum recado ou observação para o motorista? (opcional)
              </label>
              <Textarea
                value={observacoesPais}
                onChange={(e) => setObservacoesPais(e.target.value)}
                placeholder="Ex: Mudaremos para o 4º andar em fevereiro, previsão de início das aulas dia 05..."
                className="text-xs resize-none h-16"
              />
            </div>

            <Button
              onClick={handleConfirmar}
              disabled={isResponding}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold h-12 rounded-xl text-sm sm:text-base shadow-sm gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirmar Renovação para {ano_destino}
            </Button>

            {!confirmRecusaOpen ? (
              <button
                type="button"
                onClick={() => setConfirmRecusaOpen(true)}
                className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors"
              >
                Não vou renovar para {ano_destino}
              </button>
            ) : (
              <Banner
                variant="warning"
                title={`Tem certeza que não deseja renovar a vaga de ${passageiro.nome}?`}
                description="Ao confirmar a saída, a vaga será disponibilizada para novos passageiros."
                action={{
                  label: "Confirmar Saída",
                  onClick: handleRecusar,
                  disabled: isResponding,
                  className: "bg-red-600 hover:bg-red-700",
                }}
              >
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmRecusaOpen(false)}
                    className="h-8 text-xs font-semibold rounded-lg"
                  >
                    Voltar
                  </Button>
                </div>
              </Banner>
            )}
          </div>
        )}

        <div className="text-center py-4">
          <p className="text-xs text-slate-400">
            Van360 • Plataforma de Gestão de Transporte Escolar
          </p>
        </div>
      </div>

      {modalEdicaoOpen && (
        <EditarDadosPublicosRenovacaoDialog
          isOpen={modalEdicaoOpen}
          onClose={() => setModalEdicaoOpen(false)}
          token={token || ""}
          responsavel={responsavel}
          passageiro={passageiro}
          condicoes={condicoes}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
