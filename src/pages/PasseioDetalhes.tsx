import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useFretamentoDetalhesQuery,
  useAtualizarStatusParticipanteMutation,
  useRemoverParticipanteMutation,
} from "@/hooks/api/useFretamentosApi";
import { usePasseioDetalhesCalculations } from "@/hooks/business/useFretamentoCalculations";
import { useLayout } from "@/contexts/LayoutContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banner } from "@/components/ui/Banner";
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
  Pencil,
  Search,
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
    openPasseioFormDialog,
  } = useLayout();

  const [busca, setBusca] = useState("");
  const { data: detalhes, isLoading, refetch } = useFretamentoDetalhesQuery(id || "");
  const statusMutation = useAtualizarStatusParticipanteMutation();
  const removerMutation = useRemoverParticipanteMutation();

  const calculados = usePasseioDetalhesCalculations(detalhes);

  if (isLoading || !calculados) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 pt-1 sm:pt-2">
        <div className="h-8 w-48 bg-[#e5e5e5] animate-pulse rounded-[18px]" />
        <div className="h-44 bg-white border border-[#e5e5e5] animate-pulse rounded-[24px]" />
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

  const participantesFiltrados = calculados.participantes.filter((p) => {
    if (!busca.trim()) return true;
    const termo = busca.toLowerCase();
    return (
      p.nome.toLowerCase().includes(termo) ||
      (p.responsavel_nome && p.responsavel_nome.toLowerCase().includes(termo)) ||
      (p.telefone && p.telefone.includes(termo))
    );
  });

  const dataFormatadaCabecalho = formatDateTime(calculados.data_inicio);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 pt-1 sm:pt-2">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.PRIVATE.MOTORISTA.CHARTERS)}
          className="text-[#737373] hover:text-[#0a0a0a] hover:bg-white gap-1.5 -ml-2 font-medium text-xs h-8 sm:h-9 rounded-[18px] border border-transparent hover:border-[#e5e5e5] transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            openPasseioFormDialog({
              editingItem: detalhes,
              onSuccess: () => refetch(),
            })
          }
          className="h-8 sm:h-9 rounded-[18px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] hover:bg-white hover:border-[#0a0a0a] gap-1.5 transition-all active:scale-[0.98]"
        >
          <Pencil className="h-3.5 w-3.5 text-[#737373]" />
          <span>Editar Passeio</span>
        </Button>
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
              <Ticket className="h-3 w-3 text-[#737373]" />
              Passeio Coletivo
            </span>
            {calculados.isLotado && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-white text-[#e7000b] border border-[#e7000b]/40">
                Vagas Esgotadas
              </span>
            )}
            {calculados.valor_por_pessoa ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-white text-[#0a0a0a] border border-[#e5e5e5]">
                {formatCurrency(Number(calculados.valor_por_pessoa))} / pessoa
              </span>
            ) : null}
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0a0a0a] tracking-tight leading-tight">
            {calculados.titulo}
          </h1>

          <div className="flex flex-col sm:flex-row sm:items-center gap-x-5 gap-y-1 text-xs text-[#737373] pt-0.5">
            <span className="flex items-center gap-1.5 font-medium text-[#0a0a0a] truncate">
              <MapPin className="h-3.5 w-3.5 text-[#737373] shrink-0" />
              <span className="truncate">{calculados.destino}</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium text-[#0a0a0a] truncate">
              <Calendar className="h-3.5 w-3.5 text-[#737373] shrink-0" />
              <span className="truncate">{dataFormatadaCabecalho}</span>
            </span>
          </div>
        </div>

        <div className="bg-[#fafafa] rounded-[18px] border border-[#e5e5e5] p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#e5e5e5] text-center gap-2 sm:gap-0">
          <div className="px-2 py-1.5 sm:py-0">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#737373] block">
              Vagas
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mt-0.5">
              {calculados.vagas_ocupadas}
              <span className="text-xs font-normal text-[#737373] ml-1">
                /{calculados.vagas_totais ?? "∞"}
              </span>
            </div>
            <span className="text-[11px] text-[#737373] block mt-0.5 truncate">
              {calculados.vagasRestantes !== null
                ? (calculados.vagasRestantes === 0 ? "Lotado" : `${calculados.vagasRestantes} livres`)
                : "Abertas"}
            </span>
          </div>

          <div className="px-2 py-1.5 sm:py-0">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#737373] block">
              Arrecadado
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mt-0.5 truncate">
              {formatCurrency(calculados.totalPagoParticipantes)}
            </div>
            <span className="text-[11px] text-[#737373] block mt-0.5 truncate">
              {calculados.participantesPagosCount} pago(s)
            </span>
          </div>

          <div className="px-2 py-1.5 sm:py-0">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#737373] block">
              A Receber
            </span>
            <div className="text-xl sm:text-2xl font-bold text-[#0a0a0a] tracking-tight mt-0.5 truncate">
              {formatCurrency(calculados.totalPendenteParticipantes)}
            </div>
            <span className="text-[11px] text-[#737373] block mt-0.5 truncate">
              {calculados.participantesPendentesCount} aberto(s)
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          <Button
            onClick={copiarLink}
            variant="outline"
            className="w-full sm:flex-1 h-10 rounded-[18px] text-xs sm:text-sm font-medium text-[#0a0a0a] border-[#e5e5e5] hover:bg-[#fafafa] gap-2 transition-all active:scale-[0.98]"
          >
            <Copy className="h-4 w-4 text-[#737373]" />
            <span>Copiar Link</span>
          </Button>

          <Button
            onClick={compartilharWhatsApp}
            className="w-full sm:flex-1 h-10 rounded-[18px] text-xs sm:text-sm font-semibold bg-[#25D366] hover:bg-[#20b858] text-white gap-2 border-none shadow-xs transition-all active:scale-[0.98] cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 fill-white shrink-0" />
            <span>Enviar no WhatsApp</span>
          </Button>
        </div>

        {calculados.veiculos.length > 0 && (
          <div className="flex items-center gap-2 pt-2 text-xs text-[#737373] border-t border-[#e5e5e5]">
            <Car className="h-3.5 w-3.5 text-[#737373] shrink-0" />
            <span className="font-medium text-[11px]">Vans:</span>
            <div className="flex flex-wrap gap-1.5">
              {calculados.veiculos.map((v) => (
                <span
                  key={v.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5]"
                >
                  {v.placa} {v.modelo ? `(${v.modelo})` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">Participantes</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Confirmações de presença e pagamentos.
            </p>
          </div>

          <Button
            onClick={() =>
              openAdicionarParticipantePasseioDialog({
                fretamento: detalhes,
                onSuccess: () => refetch(),
              })
            }
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs h-9 sm:h-10 px-4 rounded-[18px] gap-2 border-none shadow-xs transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Participante</span>
          </Button>
        </div>

        {calculados.participantes.length > 0 && (
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none" />
            <Input
              placeholder="Buscar participante por nome, responsável ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
            />
          </div>
        )}

        {calculados.participantes.length === 0 ? (
          <Banner
            variant="info"
            title="Nenhum participante confirmado ainda"
            description="Compartilhe o link do passeio no WhatsApp ou clique em 'Adicionar Participante' para incluir os primeiros inscritos."
          />
        ) : participantesFiltrados.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#737373] bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
            Nenhum participante encontrado para &quot;{busca}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5] rounded-[18px] overflow-hidden bg-white">
            {participantesFiltrados.map((p) => {
              const valorTotal = Number(p.valor || 0);
              const valorPago = Number(p.valor_pago ?? (p.status_pagamento === "pago" ? p.valor : 0));
              const isPago = p.status_pagamento === "pago" || (valorTotal > 0 && valorPago >= valorTotal);
              const isParcial = p.status_pagamento === "parcial" || (valorPago > 0 && valorPago < valorTotal);
              const saldoDevedor = Math.max(0, valorTotal - valorPago);

              return (
                <div
                  key={p.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-[#0a0a0a] text-sm">{p.nome}</span>
                      {p.passageiro_id ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                          Aluno da Van
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-white text-[#737373] border border-[#e5e5e5]">
                          Não é Aluno
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#737373]">
                      {p.responsavel_nome && !p.is_proprio_responsavel && (
                        <span className="truncate">Resp: <strong className="text-[#0a0a0a] font-medium">{p.responsavel_nome}</strong></span>
                      )}
                      {p.telefone && (
                        <a
                          href={buildWhatsAppUrl(p.telefone)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[#737373] hover:text-[#25D366] font-medium transition-colors"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 fill-[#25D366] shrink-0" />
                          <span>{formatarTelefone(p.telefone)}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#e5e5e5]">
                    <div className="text-left sm:text-right mr-1">
                      <span className="font-semibold text-[#0a0a0a] text-sm block leading-none">
                        {isParcial
                          ? `${formatCurrency(valorPago)} / ${formatCurrency(valorTotal)}`
                          : formatCurrency(valorTotal)}
                      </span>
                      {isParcial && (
                        <span className="text-[10px] sm:text-[11px] text-[#737373] font-medium mt-0.5 block">
                          Resta {formatCurrency(saldoDevedor)}
                        </span>
                      )}
                    </div>

                    {isPago ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-[18px] text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0a0a0a]" />
                        Quitado
                      </span>
                    ) : isParcial ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-[18px] text-xs font-medium bg-[#fafafa] text-[#0a0a0a] border border-[#e5e5e5]">
                        <Clock className="h-3.5 w-3.5 text-[#737373]" />
                        Sinal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:py-1 rounded-[18px] text-xs font-medium bg-white text-[#737373] border border-[#e5e5e5]">
                        <Clock className="h-3.5 w-3.5 text-[#737373]" />
                        Pendente
                      </span>
                    )}

                    {!isPago && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenRegistrarPagamento(p)}
                        className="bg-primary hover:bg-primary-hover text-primary-foreground font-medium text-xs h-8 sm:h-9 px-2.5 sm:px-3 rounded-[18px] gap-1 border-none shadow-xs transition-all active:scale-[0.98]"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Pgto</span>
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-[18px] text-[#737373] hover:text-[#0a0a0a] hover:bg-[#f5f5f5]"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-[18px] border-[#e5e5e5] p-1.5">
                        <DropdownMenuItem
                          onClick={() => handleOpenRegistrarPagamento(p)}
                          className="rounded-[10px] text-xs font-medium cursor-pointer"
                        >
                          <DollarSign className="h-3.5 w-3.5 mr-2 text-[#737373]" />
                          {isPago ? "Editar Pagamento" : "Informar Pagamento / Sinal"}
                        </DropdownMenuItem>
                        {(isPago || isParcial) && (
                          <DropdownMenuItem
                            onClick={() => handleMarcarComoPendente(p)}
                            className="rounded-[10px] text-xs font-medium cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-2 text-[#737373]" />
                            Marcar como Pendente
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleConfirmarRemocao(p)}
                          className="rounded-[10px] text-xs font-medium text-[#e7000b] focus:text-[#e7000b] cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
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
