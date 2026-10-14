import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePublicRenovacao, useResponderPublicRenovacao } from "@/hooks/api/useRenovacoes";
import { useLayout } from "@/contexts/LayoutContext";
import { formatCurrency } from "@/utils/formatters";
import { formatDateToBR } from "@/utils/formatters/date";
import { Button } from "@/components/ui/button";
import { Banner } from "@/components/ui/Banner";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import {
  CheckCircle2,
  FileSignature,
  School,
  Calendar,
  CreditCard,
  Clock,
  Car,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Edit3,
  HeartPulse,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

export default function PublicRenovacaoPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { openEditarDadosPublicosRenovacaoDialog } = useLayout();

  const { data, isLoading, error, refetch } = usePublicRenovacao(token);
  const { mutateAsync: responder, isPending: isResponding } = useResponderPublicRenovacao(token);

  const [confirmRecusaOpen, setConfirmRecusaOpen] = useState(false);
  const [contractData, setContractData] = useState<{ token_acesso: string; link_assinatura: string } | null>(null);

  const handleConfirmar = async () => {
    try {
      const response = await responder({
        status: "confirmado",
      });
      if (response?.contrato?.token_acesso) {
        toast.success("Renovação confirmada! Abrindo contrato para assinatura...");
        navigate(`/assinar/${response.contrato.token_acesso}`);
        return;
      }
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
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-[24px] border border-[#e5e5e5] shadow-xs max-w-sm w-full text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#0a0a0a] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-[#737373]">Carregando proposta de renovação...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Banner
            variant="danger"
            title="Proposta Não Encontrada"
            description="Este link de renovação pode ter expirado ou não existe. Entre em contato diretamente com o responsável pelo transporte escolar."
            className="rounded-[18px]"
          />
        </div>
      </div>
    );
  }

  const { motorista, passageiro, responsavel, condicoes, status, ano_destino, contrato } = data;
  const isConfirmed = status === "confirmado";
  const isRecused = status === "recusado";
  const isContratoAssinado = Boolean(contrato?.status === "assinado");
  const activeContractToken = isContratoAssinado
    ? null
    : (contractData?.token_acesso || (contrato?.status === "pendente" ? contrato?.token_acesso : null));
  const signedContractToken = isContratoAssinado ? contrato?.token_acesso : null;
  const temContratoDigital = Boolean(contrato?.usar_contratos || activeContractToken || isContratoAssinado);
  const temCondicoesAlteradas = Boolean(
    condicoes?.valor?.alterado ||
    condicoes?.dia_vencimento?.alterado ||
    condicoes?.escola?.alterado ||
    condicoes?.periodo?.alterado ||
    condicoes?.modalidade?.alterado
  );

  const motoristaWhatsappUrl = motorista.telefone
    ? `https://wa.me/55${motorista.telefone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Olá! Estou visualizando a proposta de renovação de ${passageiro.nome} para ${ano_destino} e gostaria de falar com você.`
    )}`
    : null;

  const enderecoFormatado = [
    responsavel?.logradouro ? `${responsavel.logradouro}${responsavel.numero ? `, ${responsavel.numero}` : ""}` : null,
    responsavel?.complemento || null,
    responsavel?.bairro || null,
    responsavel?.cidade && responsavel?.estado ? `${responsavel.cidade} - ${responsavel.estado}` : (responsavel?.cidade || null),
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#f5f5f5] py-6 sm:py-10 px-3.5 sm:px-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
          {motorista.logo_url ? (
            <img
              src={motorista.logo_url}
              alt={motorista.apelido || motorista.nome}
              className="w-12 h-12 rounded-[14px] object-cover border border-[#e5e5e5] shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-[14px] bg-[#fafafa] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
              <Car className="w-6 h-6" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#737373] block">
              Transporte Escolar
            </span>
            <h1 className="text-base sm:text-lg font-semibold text-[#0a0a0a] truncate leading-tight mt-0.5">
              {motorista.apelido || motorista.nome}
            </h1>
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-full bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5] font-semibold text-base">
                {passageiro.nome.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                  Ano Letivo {ano_destino}
                </span>
                <h2 className="text-base sm:text-lg font-semibold text-[#0a0a0a] truncate mt-1">
                  {passageiro.nome}
                </h2>
                {responsavel?.nome && (
                  <p className="text-xs text-[#737373] truncate mt-0.5 font-normal">
                    Responsável: <span className="font-medium text-[#0a0a0a]">{responsavel.nome}</span>
                  </p>
                )}
              </div>
            </div>

            {!isConfirmed && !isRecused && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  openEditarDadosPublicosRenovacaoDialog({
                    token: token || "",
                    responsavel,
                    passageiro,
                    condicoes,
                    onSuccess: () => refetch(),
                  })
                }
                className="h-9 px-3 text-xs font-medium gap-1.5 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] shadow-none shrink-0 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#737373]" />
                <span>Atualizar Dados</span>
              </Button>
            )}
          </div>

          <div className="bg-[#fafafa] rounded-[18px] p-3.5 border border-[#e5e5e5] space-y-2.5 text-xs">
            <div className="flex items-start gap-2.5 text-[#737373]">
              <MapPin className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[#0a0a0a] block">Endereço de Embarque:</span>
                <span className="text-[#737373] block leading-relaxed font-normal">
                  {enderecoFormatado || "Endereço não informado"}
                </span>
                {responsavel?.referencia && (
                  <span className="text-[#737373] italic block mt-0.5">
                    Ref: {responsavel.referencia}
                  </span>
                )}
              </div>
            </div>

            {(condicoes.turma?.novo || passageiro.turma || condicoes.sala?.novo || passageiro.sala || condicoes.nome_professor?.novo || passageiro.nome_professor) && (
              <div className="flex items-start gap-2.5 text-[#737373] pt-2 border-t border-[#e5e5e5]">
                <GraduationCap className="w-4 h-4 text-[#0a0a0a] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="font-semibold text-[#0a0a0a] block">Sala e Turma:</span>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-[#737373] font-normal">
                    {(condicoes.turma?.novo || passageiro.turma) && (
                      <span>Turma: <strong className="text-[#0a0a0a] font-medium">{condicoes.turma?.novo || passageiro.turma}</strong></span>
                    )}
                    {(condicoes.sala?.novo || passageiro.sala) && (
                      <span>Sala: <strong className="text-[#0a0a0a] font-medium">{condicoes.sala?.novo || passageiro.sala}</strong></span>
                    )}
                    {(condicoes.nome_professor?.novo || passageiro.nome_professor) && (
                      <span>Prof.: <strong className="text-[#0a0a0a] font-medium">{condicoes.nome_professor?.novo || passageiro.nome_professor}</strong></span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {passageiro.observacoes && (
              <div className="flex items-start gap-2.5 text-[#737373] pt-2 border-t border-[#e5e5e5]">
                <HeartPulse className="w-4 h-4 text-[#e7000b] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-[#0a0a0a] block">Cuidados Especiais / Saúde:</span>
                  <span className="text-[#737373] block font-normal leading-relaxed">{passageiro.observacoes}</span>
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
            className="rounded-[18px]"
          />
        )}

        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0a0a0a]" />
            Condições para o Ano Letivo {ano_destino}
          </h3>

          <div className="divide-y divide-[#e5e5e5] space-y-3 pt-1">
            <div className="flex items-center justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] font-normal block">Mensalidade</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">
                    {condicoes.qtd_parcelas ? `${condicoes.qtd_parcelas} parcelas mensais` : "Parcela mensal"}
                  </span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.valor.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-[#e7000b] text-xs sm:text-sm font-normal">
                      {formatCurrency(condicoes.valor.atual)}
                    </span>
                    <span className="text-[#0a0a0a] font-semibold text-sm sm:text-base">
                      {formatCurrency(condicoes.valor.novo)}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0a0a0a] text-sm sm:text-base">
                    {formatCurrency(condicoes.valor.novo)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] font-normal block">Vencimento</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">Dia todo mês</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.dia_vencimento.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-[#e7000b] text-xs sm:text-sm font-normal">
                      Dia {condicoes.dia_vencimento.atual}
                    </span>
                    <span className="text-[#0a0a0a] font-semibold text-sm sm:text-base">
                      Dia {condicoes.dia_vencimento.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0a0a0a] text-sm sm:text-base">
                    Dia {condicoes.dia_vencimento.novo || 10}
                  </span>
                )}
              </div>
            </div>

            {(condicoes.data_inicio_cobranca || condicoes.data_fim_cobranca) && (
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[#737373] font-normal block">Período de Cobrança</span>
                    <span className="text-xs text-[#0a0a0a] font-medium">1ª à última parcela</span>
                  </div>
                </div>

                <div className="text-right text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                  {condicoes.data_inicio_cobranca ? formatDateToBR(condicoes.data_inicio_cobranca) : "Fev"}
                  {" até "}
                  {condicoes.data_fim_cobranca ? formatDateToBR(condicoes.data_fim_cobranca) : "Dez"}
                </div>
              </div>
            )}

            {(condicoes.data_inicio_transporte || condicoes.data_fim_transporte) && (
              <div className="flex items-center justify-between pt-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs text-[#737373] font-normal block">Período do Transporte</span>
                    <span className="text-xs text-[#0a0a0a] font-medium">Início e fim das aulas</span>
                  </div>
                </div>

                <div className="text-right text-xs sm:text-sm font-semibold text-[#0a0a0a]">
                  {condicoes.data_inicio_transporte ? formatDateToBR(condicoes.data_inicio_transporte) : `01/02/${ano_destino}`}
                  {" até "}
                  {condicoes.data_fim_transporte ? formatDateToBR(condicoes.data_fim_transporte) : `15/12/${ano_destino}`}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#737373] flex items-center gap-1.5">
            <School className="w-4 h-4 text-[#0a0a0a]" />
            Escola e Turno
          </h3>

          <div className="divide-y divide-[#e5e5e5] space-y-3 pt-1">
            <div className="flex items-start justify-between pt-3 first:pt-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] font-normal block">Escola</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">Unidade de destino</span>
                </div>
              </div>

              <div className="text-right max-w-[55%]">
                {condicoes.escola.alterado ? (
                  <div>
                    {condicoes.escola.atual && (
                      <span className="line-through text-[#e7000b] text-xs font-normal block truncate">
                        {condicoes.escola.atual}
                      </span>
                    )}
                    <span className="text-[#0a0a0a] font-semibold text-xs sm:text-sm block">
                      {condicoes.escola.novo || "Não informada"}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm block">
                    {condicoes.escola.novo || "Não informada"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] font-normal block">Turno</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">Horário escolar</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.periodo.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-[#e7000b] text-xs sm:text-sm font-normal capitalize">
                      {condicoes.periodo.atual}
                    </span>
                    <span className="text-[#0a0a0a] font-semibold text-xs sm:text-sm capitalize">
                      {condicoes.periodo.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm capitalize">
                    {condicoes.periodo.novo || "Não informado"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] text-[#0a0a0a] flex items-center justify-center shrink-0 border border-[#e5e5e5]">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs text-[#737373] font-normal block">Modalidade</span>
                  <span className="text-xs text-[#0a0a0a] font-medium">Itinerário</span>
                </div>
              </div>

              <div className="text-right">
                {condicoes.modalidade.alterado ? (
                  <div className="flex items-baseline justify-end gap-1.5 flex-wrap">
                    <span className="line-through text-[#e7000b] text-xs sm:text-sm font-normal">
                      {condicoes.modalidade.atual}
                    </span>
                    <span className="text-[#0a0a0a] font-semibold text-xs sm:text-sm">
                      {condicoes.modalidade.novo}
                    </span>
                  </div>
                ) : (
                  <span className="font-semibold text-[#0a0a0a] text-xs sm:text-sm">
                    {condicoes.modalidade.novo || "Ida e Volta"}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {data.concluido ? (
          <Banner
            variant="neutral"
            title="Ciclo de Renovação Concluído"
            description={`As renovações para o ano letivo de ${ano_destino} foram finalizadas pelo motorista. Entre em contato diretamente pelo WhatsApp para dúvidas.`}
            className="rounded-[18px]"
          />
        ) : isConfirmed ? (
          <div className="space-y-3">
            <Banner
              variant="success"
              title={`Vaga Confirmada para ${ano_destino}!`}
              description={`A vaga de ${passageiro.nome} está garantida para o ano letivo de ${ano_destino}. Caso precise alterar alguma informação, fale diretamente com o motorista.`}
              className="rounded-[18px]"
            />

            {activeContractToken && (
              <div className="bg-[#fafafa] rounded-[24px] p-5 border border-[#e5e5e5] space-y-3">
                <div className="flex items-center gap-2 text-[#0a0a0a] font-semibold text-sm">
                  <FileSignature className="w-4 h-4 text-primary" />
                  Contrato Digital de Prestação de Serviços
                </div>
                <p className="text-xs text-[#737373] font-normal">
                  O contrato referente ao ano de {ano_destino} está pronto para assinatura digital pelo celular com validade jurídica.
                </p>
                <Button
                  onClick={() => navigate(`/assinar/${activeContractToken}`)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-11 rounded-[18px] gap-2 shadow-xs cursor-pointer"
                >
                  <span>Assinar Contrato Digital Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isContratoAssinado && (
              <div className="space-y-3 pt-1">
                <Banner
                  variant="neutral"
                  title="Contrato Digital Assinado"
                  description={`O contrato para o ano letivo de ${ano_destino} já foi formalizado e assinado digitalmente.`}
                  className="rounded-[18px]"
                />
                {signedContractToken && (
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/assinar/${signedContractToken}`)}
                    className="w-full h-11 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm gap-2 shadow-none cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4 text-primary" />
                    <span>Visualizar Contrato Assinado</span>
                  </Button>
                )}
              </div>
            )}

            {motoristaWhatsappUrl && (
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm gap-2 shadow-none cursor-pointer"
              >
                <a href={motoristaWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
                  Falar com Motorista no WhatsApp
                </a>
              </Button>
            )}
          </div>
        ) : isRecused ? (
          <div className="space-y-3">
            <Banner
              variant="neutral"
              title="Vaga Não Renovada"
              description={`Você informou que não utilizará o transporte em ${ano_destino}. Caso tenha mudado de ideia e queira verificar a disponibilidade de vaga, fale diretamente com o motorista.`}
              className="rounded-[18px]"
            />

            {motoristaWhatsappUrl && (
              <Button
                asChild
                variant="outline"
                className="w-full h-11 rounded-[18px] border border-[#e5e5e5] bg-white hover:bg-[#fafafa] text-[#0a0a0a] font-medium text-xs sm:text-sm gap-2 shadow-none cursor-pointer"
              >
                <a href={motoristaWhatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon className="w-4 h-4 fill-current text-emerald-600" />
                  Falar com Motorista no WhatsApp
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] p-5 sm:p-6 shadow-xs space-y-4">
            <Button
              onClick={handleConfirmar}
              disabled={isResponding}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-12 rounded-[18px] text-sm sm:text-base shadow-xs gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{temContratoDigital ? "Confirmar e Assinar Contrato" : `Confirmar Renovação para ${ano_destino}`}</span>
            </Button>

            {!confirmRecusaOpen ? (
              <button
                type="button"
                onClick={() => setConfirmRecusaOpen(true)}
                className="w-full text-center py-2 text-xs font-normal text-[#737373] hover:text-[#e7000b] transition-colors cursor-pointer"
              >
                Não vou renovar para {ano_destino}
              </button>
            ) : (
              <Banner
                variant="warning"
                title={`Tem certeza que não deseja renovar a vaga de ${passageiro.nome}?`}
                description="Ao confirmar a saída, a vaga será disponibilizada para outros alunos."
                action={{
                  label: "Confirmar Saída",
                  onClick: handleRecusar,
                  disabled: isResponding,
                  className: "bg-[#e7000b] hover:bg-[#c4000a] text-white",
                }}
                className="rounded-[18px]"
              >
                <div className="pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmRecusaOpen(false)}
                    className="h-8 text-xs font-medium rounded-[14px] border border-[#e5e5e5] bg-white"
                  >
                    Voltar
                  </Button>
                </div>
              </Banner>
            )}
          </div>
        )}

        <div className="text-center py-4">
          <p className="text-xs text-[#737373]">
            Van360 • Plataforma de Gestão de Transporte Escolar
          </p>
        </div>
      </div>
    </div>
  );
}
