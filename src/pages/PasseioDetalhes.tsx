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
import { formatCurrency, formatDateTime, formatarTelefone } from "@/utils/formatters";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  Ticket,
  Copy,
  Plus,
  Trash2,
  Car,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  MoreVertical,
  RotateCcw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import type { FretamentoParticipante } from "@/services/api/fretamento.api";

export default function PasseioDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    openAdicionarParticipantePasseioDialog,
    openRegistrarPagamentoParticipanteDialog,
    openConfirmationDialog,
  } = useLayout();

  const { data: detalhes, isLoading, refetch } = useFretamentoDetalhesQuery(id || "");
  const statusMutation = useAtualizarStatusParticipanteMutation();
  const removerMutation = useRemoverParticipanteMutation();

  const calculados = usePasseioDetalhesCalculations(detalhes);

  if (isLoading || !calculados) {
    return (
      <div className="min-h-screen bg-surface max-w-5xl mx-auto p-6 space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-36 bg-slate-200 animate-pulse rounded-2xl" />
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
    const dataFormatada = formatDateTime(calculados.data_inicio);
    const valorFormatado = formatCurrency(Number(calculados.valor_por_pessoa || 0));

    const texto = `Olá pais e responsáveis! No dia ${dataFormatada} realizaremos nosso passeio: *${calculados.titulo}*.\n\n` +
      `Local: ${calculados.destino}\n` +
      `Valor por participante: ${valorFormatado}\n` +
      (calculados.vagasRestantes !== null ? `Vagas limitadas: restam apenas ${calculados.vagasRestantes} vagas!\n\n` : "\n") +
      `Para confirmar a presença do seu filho, acesse o link abaixo:\n${linkPublico}`;

    const url = buildWhatsAppUrl(null, texto);
    window.open(url, "_blank");
  };

  const handleOpenRegistrarPagamento = (p: FretamentoParticipante) => {
    openRegistrarPagamentoParticipanteDialog({
      fretamentoId: calculados.id,
      passeioTitulo: calculados.titulo,
      participante: p,
      onSuccess: () => refetch(),
    });
  };

  const handleMarcarComoPendente = (p: FretamentoParticipante) => {
    openConfirmationDialog({
      title: "Desfazer Pagamento",
      description: `Deseja retornar o status do pagamento de "${p.nome}" para pendente?`,
      confirmText: "Sim, marcar pendente",
      cancelText: "Cancelar",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await statusMutation.mutateAsync({
            fretamentoId: calculados.id,
            participanteId: p.id,
            payload: {
              status_pagamento: "pendente",
              valor_pago: 0,
              tipo_pagamento: null,
            },
          });
          toast.success(`Pagamento de ${p.nome} retornado para pendente.`);
        } catch {
          toast.error("Erro ao atualizar status do pagamento.");
        }
      },
    });
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

  const dataFormatadaCabecalho = formatDateTime(calculados.data_inicio);

  return (
    <div className="min-h-screen bg-surface max-w-6xl mx-auto space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.CHARTERS)}
          className="text-slate-500 hover:text-slate-900 gap-1.5 -ml-2 font-medium text-xs h-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Fretamentos e Passeios
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 border border-slate-200/60 font-semibold text-xs py-0.5"
            >
              <Ticket className="h-3 w-3 mr-1" />
              Passeio Coletivo
            </Badge>
            {calculados.isLotado && (
              <Badge variant="destructive" className="font-semibold text-xs py-0.5">
                Vagas Esgotadas
              </Badge>
            )}
            {calculados.valor_por_pessoa ? (
              <Badge variant="outline" className="text-xs font-medium text-slate-700 bg-white border-slate-200 py-0.5">
                {formatCurrency(Number(calculados.valor_por_pessoa))} / pessoa
              </Badge>
            ) : null}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight pt-1">
            {calculados.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {calculados.destino}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              {dataFormatadaCabecalho}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/70 rounded-xl border border-slate-100 p-2.5 sm:p-3 text-center">
          <div className="px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Vagas</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
              {calculados.vagas_ocupadas}
              <span className="text-xs font-normal text-slate-400 ml-0.5">
                /{calculados.vagas_totais ?? "∞"}
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate block mt-0.5">
              {calculados.vagasRestantes !== null
                ? (calculados.vagasRestantes === 0 ? "Lotado" : `${calculados.vagasRestantes} livres`)
                : "Abertas"}
            </span>
          </div>

          <div className="px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Arrecadado</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatCurrency(calculados.totalPagoParticipantes)}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mt-0.5 truncate">
              {calculados.participantesPagosCount} pago(s)
            </span>
          </div>

          <div className="px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">A Receber</span>
            <div className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formatCurrency(calculados.totalPendenteParticipantes)}
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block mt-0.5 truncate">
              {calculados.participantesPendentesCount} aberto(s)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-0.5 w-full">
          <Button
            onClick={copiarLink}
            variant="outline"
            size="sm"
            className="flex-1 h-10 rounded-xl text-xs font-semibold text-slate-700 border-slate-200 hover:bg-slate-50 gap-1.5 shadow-2xs active:scale-95"
          >
            <Copy className="h-3.5 w-3.5 text-slate-400" />
            Copiar Link
          </Button>

          <Button
            onClick={compartilharWhatsApp}
            size="sm"
            className="flex-1 h-10 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20b858] text-white gap-2 shadow-xs transition-all active:scale-95"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            Enviar no WhatsApp
          </Button>
        </div>

        {calculados.veiculos.length > 0 && (
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-500">
            <Car className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-[11px]">Vans:</span>
            <div className="flex flex-wrap gap-1">
              {calculados.veiculos.map((v) => (
                <Badge key={v.id} variant="outline" className="text-[11px] py-0 px-2 font-normal text-slate-600 bg-white border-slate-200">
                  {v.placa} {v.modelo ? `(${v.modelo})` : ""}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Lista de Participantes</h3>
            <p className="text-xs text-slate-500">
              Gerencie participantes, pagamentos, adiantamentos e confirmações.
            </p>
          </div>

          <Button
            onClick={() =>
              openAdicionarParticipantePasseioDialog({
                fretamento: detalhes,
                onSuccess: () => refetch(),
              })
            }
            className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-semibold text-xs h-10 px-4 rounded-xl gap-1.5 shadow-xs"
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
              const valorTotal = Number(p.valor || 0);
              const valorPago = Number(p.valor_pago ?? (p.status_pagamento === "pago" ? p.valor : 0));
              const isPago = p.status_pagamento === "pago" || (valorTotal > 0 && valorPago >= valorTotal);
              const isParcial = p.status_pagamento === "parcial" || (valorPago > 0 && valorPago < valorTotal);
              const saldoDevedor = Math.max(0, valorTotal - valorPago);

              return (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{p.nome}</span>
                      {p.passageiro_id ? (
                        <Badge variant="outline" className="text-[10px] bg-[#1a3a5c]/10 text-[#1a3a5c] border-[#1a3a5c]/20 font-bold">
                          Aluno da Van
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 font-medium">
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
                          href={buildWhatsAppUrl(p.telefone)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-600 font-medium"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
                          {formatarTelefone(p.telefone)}
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <div className="text-left sm:text-right mr-1">
                      <span className="font-bold text-slate-900 text-sm block leading-none">
                        {isParcial
                          ? `${formatCurrency(valorPago)} / ${formatCurrency(valorTotal)}`
                          : formatCurrency(valorTotal)}
                      </span>
                      {isParcial && (
                        <span className="text-[10px] text-amber-700 font-medium mt-0.5 block">
                          Resta {formatCurrency(saldoDevedor)}
                        </span>
                      )}
                    </div>

                    {isPago ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs select-none"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Quitado
                      </Badge>
                    ) : isParcial ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-50/80 text-amber-700 border border-amber-200 font-semibold text-xs py-1 px-2.5 gap-1.5 shadow-2xs select-none"
                      >
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Sinal Pago
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-slate-50 text-slate-600 border border-slate-200 font-medium text-xs py-1 px-2.5 gap-1.5 select-none"
                      >
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Pendente
                      </Badge>
                    )}

                    {!isPago && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenRegistrarPagamento(p)}
                        className="bg-[#1a3a5c] hover:bg-[#1a3a5c]/90 text-white font-semibold text-xs h-8 px-3 rounded-lg gap-1.5 shadow-2xs transition-all active:scale-95"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Registrar Pgto
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-lg">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleOpenRegistrarPagamento(p)}>
                          <DollarSign className="h-4 w-4 mr-2 text-slate-600" />
                          {isPago ? "Editar Pagamento" : "Informar Pagamento / Sinal"}
                        </DropdownMenuItem>
                        {(isPago || isParcial) && (
                          <DropdownMenuItem onClick={() => handleMarcarComoPendente(p)}>
                            <RotateCcw className="h-4 w-4 mr-2 text-amber-600" />
                            Marcar como Pendente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleConfirmarRemocao(p)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover do Passeio
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
