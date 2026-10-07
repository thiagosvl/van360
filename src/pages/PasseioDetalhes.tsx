import { useParams, useNavigate } from "react-router-dom";
import {
  useFretamentoDetalhesQuery,
  useAtualizarStatusParticipanteMutation,
  useRemoverParticipanteMutation,
} from "@/hooks/api/useFretamentosApi";
import { usePasseioDetalhesCalculations } from "@/hooks/business/useFretamentoCalculations";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Banner } from "@/components/ui/Banner";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/formatters/currency";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  Ticket,
  Users,
  DollarSign,
  Share2,
  Copy,
  Plus,
  Phone,
  CheckCircle2,
  Clock,
  Trash2,
  Car,
  MapPin,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { FretamentoParticipante } from "@/services/api/fretamento.api";

export default function PasseioDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { openAdicionarParticipantePasseioDialog, openConfirmationDialog } = useLayout();

  const { data: detalhes, isLoading, refetch } = useFretamentoDetalhesQuery(id || "");
  const statusMutation = useAtualizarStatusParticipanteMutation();
  const removerMutation = useRemoverParticipanteMutation();

  const calculados = usePasseioDetalhesCalculations(detalhes);

  if (isLoading || !calculados) {
    return (
      <div className="min-h-screen bg-surface max-w-5xl mx-auto p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-40 bg-slate-200 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const linkPublico = calculados.slug_publico
    ? `${window.location.origin}/passeio/${calculados.slug_publico}`
    : null;

  const copiarLink = () => {
    if (!linkPublico) return;
    navigator.clipboard.writeText(linkPublico);
    toast.success("Link do passeio copiado para a área de transferência!");
  };

  const compartilharWhatsApp = () => {
    if (!linkPublico) return;
    const dataFormatada = new Date(calculados.data_inicio).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const valorFormatado = formatCurrency(Number(calculados.valor_por_pessoa || 0));

    const texto = `Olá pais e responsáveis! No dia ${dataFormatada} realizaremos nosso passeio: *${calculados.titulo}*.\n\n` +
      `Local: ${calculados.destino}\n` +
      `Valor por participante: ${valorFormatado}\n` +
      (calculados.vagasRestantes !== null ? `Vagas limitadas: restam apenas ${calculados.vagasRestantes} vagas!\n\n` : "\n") +
      `Para confirmar a presença do seu filho, acesse o link abaixo:\n${linkPublico}`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  const handleToggleStatusPagamento = async (p: FretamentoParticipante) => {
    const novoStatus = p.status_pagamento === "pago" ? "pendente" : "pago";
    try {
      await statusMutation.mutateAsync({
        fretamentoId: calculados.id,
        participanteId: p.id,
        payload: {
          status_pagamento: novoStatus,
          tipo_pagamento: novoStatus === "pago" ? "PIX" : null,
        },
      });
      toast.success(
        novoStatus === "pago"
          ? `Pagamento de ${p.nome} confirmado!`
          : `Pagamento de ${p.nome} marcado como pendente.`
      );
    } catch {
      toast.error("Erro ao atualizar status do pagamento.");
    }
  };

  const handleConfirmarRemocao = (p: FretamentoParticipante) => {
    openConfirmationDialog({
      title: "Remover Participante",
      description: `Deseja remover ${p.nome} da lista deste passeio?`,
      confirmText: "Sim, remover",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await removerMutation.mutateAsync({
            fretamentoId: calculados.id,
            participanteId: p.id,
          });
          toast.success(`${p.nome} removido do passeio.`);
        } catch {
          toast.error("Erro ao remover participante.");
        }
      },
    });
  };

  const dataFormatada = new Date(calculados.data_inicio).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-surface max-w-5xl mx-auto space-y-6 pb-24 px-4 sm:px-6 pt-4">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.CHARTERS)}
          className="text-slate-600 hover:text-slate-900 gap-1.5 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Fretamentos e Passeios
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 font-bold hover:bg-emerald-100">
                <Ticket className="h-3.5 w-3.5 mr-1" />
                Passeio Coletivo
              </Badge>
              {calculados.isLotado && (
                <Badge variant="destructive" className="font-bold">
                  Vagas Esgotadas
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {calculados.titulo}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                {calculados.destino}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {dataFormatada}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={copiarLink}
              variant="outline"
              size="sm"
              className="text-xs font-bold gap-1.5 h-9"
            >
              <Copy className="h-3.5 w-3.5" />
              Copiar Link
            </Button>
            <Button
              onClick={compartilharWhatsApp}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9 shadow-xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              WhatsApp dos Pais
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-slate-400" />
              Ocupação de Vagas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-slate-800">{calculados.vagas_ocupadas}</span>
              <span className="text-xs text-slate-500">
                {calculados.vagas_totais !== null ? `de ${calculados.vagas_totais} vagas` : "confirmados"}
              </span>
            </div>
            {calculados.vagasRestantes !== null && (
              <span className="text-[11px] text-emerald-700 font-semibold block">
                {calculados.vagasRestantes === 0 ? "Lotação completa" : `${calculados.vagasRestantes} vagas restantes`}
              </span>
            )}
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Total Arrecadado
            </span>
            <span className="text-xl font-black text-emerald-700 block">
              {formatCurrency(calculados.totalPagoParticipantes)}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {calculados.participantesPagosCount} pagamento(s) confirmado(s)
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-orange-500" />
              Pendente a Receber
            </span>
            <span className="text-xl font-black text-orange-600 block">
              {formatCurrency(calculados.totalPendenteParticipantes)}
            </span>
            <span className="text-[11px] text-slate-500 block">
              {calculados.participantesPendentesCount} pagamento(s) em aberto
            </span>
          </div>
        </div>

        {calculados.veiculos.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs text-slate-600">
            <Car className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">Vans designadas:</span>
            <div className="flex flex-wrap gap-1.5">
              {calculados.veiculos.map((v) => (
                <Badge key={v.id} variant="outline" className="text-slate-700 bg-white">
                  {v.placa} {v.modelo ? `(${v.modelo})` : ""}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lista de Participantes</h3>
            <p className="text-xs text-slate-500">
              Gerencie presenças e clique no status para alternar entre pendente e pago.
            </p>
          </div>

          <Button
            onClick={() =>
              openAdicionarParticipantePasseioDialog({
                fretamento: detalhes,
                onSuccess: () => refetch(),
              })
            }
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Adicionar Participante
          </Button>
        </div>

        {calculados.participantes.length === 0 ? (
          <Banner
            variant="info"
            title="Nenhum participante confirmado ainda"
            description="Compartilhe o link com os pais no WhatsApp ou clique em 'Adicionar Participante' para incluir os primeiros inscritos."
          />
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
            {calculados.participantes.map((p) => {
              const isPago = p.status_pagamento === "pago";
              return (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.nome}</span>
                      {p.passageiro_id ? (
                        <Badge variant="outline" className="text-[10px] bg-[#1a3a5c]/10 text-[#1a3a5c] border-[#1a3a5c]/20">
                          Aluno da Van
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200">
                          Convidado
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {p.responsavel_nome && !p.is_proprio_responsavel && (
                        <span>Resp: <strong className="text-slate-700">{p.responsavel_nome}</strong></span>
                      )}
                      {p.telefone && (
                        <a
                          href={`https://api.whatsapp.com/send?phone=55${p.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-emerald-600 hover:underline font-medium"
                        >
                          <MessageCircle className="h-3 w-3" />
                          {p.telefone}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="font-bold text-slate-800 text-sm">
                      {formatCurrency(Number(p.valor || 0))}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleStatusPagamento(p)}
                      disabled={statusMutation.isPending}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isPago
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-orange-100 text-orange-800 hover:bg-orange-200"
                      }`}
                    >
                      {isPago ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Pago
                        </>
                      ) : (
                        <>
                          <Clock className="h-3 w-3" />
                          Pendente
                        </>
                      )}
                    </button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleConfirmarRemocao(p)}
                      className="h-8 w-8 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
