import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banner } from "@/components/ui/Banner";
import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useLayout } from "@/contexts/LayoutContext";
import {
  useAtualizarStatusParticipanteMutation,
  useRemoverParticipanteMutation,
} from "@/hooks/api/useFretamentosApi";
import { formatCurrency, formatarTelefone } from "@/utils/formatters";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import {
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  DollarSign,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { FretamentoDetalhes, FretamentoParticipante } from "@/services/api/fretamento.api";
import type { FretamentoDetalhesCalculado } from "@/hooks/business/useFretamentoCalculations";

interface PasseioParticipantesSectionProps {
  calculados: FretamentoDetalhesCalculado;
  detalhes: FretamentoDetalhes;
}

export const PasseioParticipantesSection = memo(function PasseioParticipantesSection({
  calculados,
  detalhes,
}: PasseioParticipantesSectionProps) {
  const {
    openAdicionarParticipantePasseioDialog,
    openRegistrarPagamentoParticipanteDialog,
    openConfirmationDialog,
  } = useLayout();

  const [busca, setBusca] = useState("");
  const statusMutation = useAtualizarStatusParticipanteMutation();
  const removerMutation = useRemoverParticipanteMutation();

  const handleOpenRegistrarPagamento = (p: FretamentoParticipante) => {
    openRegistrarPagamentoParticipanteDialog({
      fretamentoId: calculados.id,
      passeioTitulo: calculados.titulo,
      participante: p,
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

  return (
    <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#0a0a0a] tracking-tight">
            Participantes
            {calculados.participantes.length > 0 && (
              <span className="text-xs font-normal text-[#737373] ml-2">
                ({calculados.participantes.length})
              </span>
            )}
          </h2>
        </div>

        <Button
          size="sm"
          onClick={() =>
            openAdicionarParticipantePasseioDialog({
              fretamento: detalhes,
            })
          }
          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs h-8 sm:h-9 px-3 sm:px-4 rounded-[18px] gap-1.5 shadow-xs transition-all active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Adicionar</span>
        </Button>
      </div>

      {calculados.participantes.length > 0 && (
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#737373] pointer-events-none group-focus-within:text-[#0a0a0a] transition-colors" />
          <Input
            type="text"
            inputMode="search"
            placeholder="Buscar participante por nome, responsável ou telefone..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={cn(
              "w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 text-sm font-normal transition-all shadow-none [&::-webkit-search-cancel-button]:hidden",
              busca ? "pr-10" : "pr-4"
            )}
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar busca"
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#737373] hover:text-[#0a0a0a] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {calculados.participantes.length === 0 ? (
        <Banner
          variant="info"
          title="Nenhum participante confirmado ainda"
          description="Compartilhe o link do passeio no WhatsApp ou clique em 'Adicionar' para incluir os primeiros inscritos."
        />
      ) : participantesFiltrados.length === 0 ? (
        <div className="p-6 text-center text-xs text-[#737373] bg-[#fafafa] rounded-[18px] border border-[#e5e5e5]">
          Nenhum participante encontrado para &quot;{busca}&quot;.
        </div>
      ) : (
        <div className="divide-y divide-[#e5e5e5] border border-[#e5e5e5] rounded-[18px] overflow-hidden bg-white">
          {participantesFiltrados.map((p) => {
            const valorTotal = Number(p.valor || 0);
            const valorPago = Number(
              p.valor_pago ?? (p.status_pagamento === "pago" ? p.valor : 0)
            );
            const isPago =
              p.status_pagamento === "pago" || (valorTotal > 0 && valorPago >= valorTotal);
            const isParcial =
              p.status_pagamento === "parcial" || (valorPago > 0 && valorPago < valorTotal);
            const saldoDevedor = Math.max(0, valorTotal - valorPago);

            const statusBadge = isPago ? (
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
            );

            const dropdownActions = [
              {
                label: isPago ? "Editar Pagamento" : "Informar Pagamento / Sinal",
                icon: <DollarSign className="h-4 w-4" />,
                onClick: () => handleOpenRegistrarPagamento(p),
              },
              ...((isPago || isParcial)
                ? [
                    {
                      label: "Marcar como Pendente",
                      icon: <RotateCcw className="h-4 w-4" />,
                      onClick: () => handleMarcarComoPendente(p),
                    },
                  ]
                : []),
              {
                label: "Remover do Passeio",
                icon: <Trash2 className="h-4 w-4" />,
                variant: "destructive" as const,
                isDestructive: true,
                onClick: () => handleConfirmarRemocao(p),
              },
            ];

            return (
              <div key={p.id} className="hover:bg-[#fafafa] transition-colors">
                {/* Mobile view (< sm) */}
                <div className="sm:hidden p-3.5 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[#0a0a0a] text-sm leading-tight truncate">
                          {p.nome}
                        </span>
                        {p.passageiro_id ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                            Aluno da Van
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#737373]">
                        {p.responsavel_nome && !p.is_proprio_responsavel && (
                          <span className="truncate">
                            Resp:{" "}
                            <strong className="text-[#0a0a0a] font-medium">
                              {p.responsavel_nome}
                            </strong>
                          </span>
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

                    <div className="flex items-center gap-1 shrink-0">
                      {statusBadge}
                      <ActionsDropdown
                        title={p.nome}
                        description={p.passageiro_id ? "Aluno vinculado" : "Participante avulso"}
                        actions={dropdownActions}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#0a0a0a] text-sm block leading-none">
                        {isParcial
                          ? `${formatCurrency(valorPago)} / ${formatCurrency(valorTotal)}`
                          : formatCurrency(valorTotal)}
                      </span>
                      {isParcial && (
                        <span className="text-[10px] text-[#737373] font-medium mt-0.5 block">
                          Resta {formatCurrency(saldoDevedor)}
                        </span>
                      )}
                    </div>

                    {!isPago && (
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => handleOpenRegistrarPagamento(p)}
                        className="h-8 px-3 text-xs font-semibold gap-1 shrink-0"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{isParcial ? "Completar" : "Registrar"}</span>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Desktop view (sm:flex) */}
                <div className="hidden sm:flex items-center justify-between p-4 gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0a0a0a] text-sm truncate">
                        {p.nome}
                      </span>
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

                    <div className="flex items-center gap-3 text-xs text-[#737373]">
                      {p.responsavel_nome && !p.is_proprio_responsavel && (
                        <span className="truncate">
                          Responsável:{" "}
                          <strong className="text-[#0a0a0a] font-medium">
                            {p.responsavel_nome}
                          </strong>
                        </span>
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

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="font-semibold text-[#0a0a0a] text-sm block leading-none">
                        {isParcial
                          ? `${formatCurrency(valorPago)} / ${formatCurrency(valorTotal)}`
                          : formatCurrency(valorTotal)}
                      </span>
                      {isParcial && (
                        <span className="text-[11px] text-[#737373] font-medium mt-0.5 block">
                          Resta {formatCurrency(saldoDevedor)}
                        </span>
                      )}
                    </div>

                    {statusBadge}

                    {!isPago && (
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => handleOpenRegistrarPagamento(p)}
                        className="h-8 px-3 text-xs font-semibold gap-1.5 shrink-0"
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{isParcial ? "Completar Pagamento" : "Registrar Pagamento"}</span>
                      </Button>
                    )}

                    <ActionsDropdown
                      title={p.nome}
                      description={p.passageiro_id ? "Aluno vinculado" : "Participante avulso"}
                      actions={dropdownActions}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
