import { useState, useEffect, Suspense, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useFretamentoDetalhesQuery,
  useAtualizarFretamentoMutation,
} from "@/hooks/api/useFretamentosApi";
import { usePasseioDetalhesCalculations } from "@/hooks/business/useFretamentoCalculations";
import { useLayout } from "@/contexts/LayoutContext";
import { PullToRefreshWrapper } from "@/components/navigation/PullToRefreshWrapper";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AppTabNav, type AppTabItem } from "@/components/ui/AppTabNav";
import { PasseioKpiCards } from "@/components/features/fretamento/PasseioKpiCards";
import { PasseioParticipantesSection } from "@/components/features/fretamento/PasseioParticipantesSection";
import { PasseioGastosSection } from "@/components/features/fretamento/PasseioGastosSection";
import { formatCurrency, formatDateTime } from "@/utils/formatters";
import { formatarPlacaExibicao } from "@/utils/domain";
import { buildWhatsAppUrl } from "@/utils/whatsappTemplates";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  Ticket,
  Users,
  Copy,
  Car,
  MapPin,
  Calendar,
  CheckCircle2,
  RotateCcw,
  Pencil,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

type PasseioTab = "participantes" | "despesas";

export default function PasseioDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    openConfirmationDialog,
    openPasseioFormDialog,
    setPageTitle,
  } = useLayout();

  const [activeTab, setActiveTab] = useState<PasseioTab>("participantes");
  const { data: detalhes, isLoading, refetch } = useFretamentoDetalhesQuery(id || "");
  const atualizarMutation = useAtualizarFretamentoMutation();

  const calculados = usePasseioDetalhesCalculations(detalhes);

  useEffect(() => {
    setPageTitle("Passeio");
  }, [setPageTitle]);

  const tabItems: AppTabItem<PasseioTab>[] = useMemo(
    () => [
      {
        value: "participantes",
        label: "Participantes",
        icon: <Users className="h-4 w-4" />,
        badge: calculados?.participantes.length ?? 0,
      },
      {
        value: "despesas",
        label: "Despesas",
        icon: <TrendingDown className="h-4 w-4" />,
        badge: (calculados?.gastos || []).length,
      },
    ],
    [calculados?.participantes.length, calculados?.gastos]
  );

  if (isLoading || !calculados || !detalhes) {
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

    const texto =
      `Olá pais e responsáveis! No dia ${dataFormatada} realizaremos nosso passeio: *${calculados.titulo}*.\n\n` +
      `Local: ${calculados.destino}\n` +
      `Valor por participante: ${valorFormatado}\n` +
      (calculados.vagasRestantes !== null
        ? `Vagas limitadas: restam apenas ${calculados.vagasRestantes} vagas!\n\n`
        : "\n") +
      `Para confirmar a presença do seu filho, acesse o link abaixo:\n${linkPublico}`;

    const url = buildWhatsAppUrl(null, texto);
    window.open(url, "_blank");
  };

  const handleConfirmarConclusao = () => {
    const temSaldo = calculados.totalPendenteParticipantes > 0;

    openConfirmationDialog({
      title: "Concluir Passeio",
      description: temSaldo
        ? `Este passeio ainda possui valores pendentes de participantes (${formatCurrency(calculados.totalPendenteParticipantes)}). Deseja marcar como concluído mesmo assim? Ele será movido para as viagens concluídas.`
        : "Deseja marcar este passeio como concluído? Ele será movido para as viagens concluídas.",
      confirmText: "Sim, concluir",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        try {
          await atualizarMutation.mutateAsync({
            id: calculados.id,
            payload: { status: "concluido" },
          });
          toast.success("Passeio marcado como concluído.");
        } catch {
          toast.error("Erro ao atualizar status do passeio.");
        }
      },
    });
  };

  const handleConfirmarReabertura = () => {
    openConfirmationDialog({
      title: "Reabrir Passeio",
      description: "Deseja reabrir este passeio? Ele voltará para a lista de viagens em andamento.",
      confirmText: "Sim, reabrir",
      cancelText: "Cancelar",
      variant: "default",
      onConfirm: async () => {
        try {
          await atualizarMutation.mutateAsync({
            id: calculados.id,
            payload: { status: "confirmado" },
          });
          toast.success("Passeio reaberto com sucesso.");
        } catch {
          toast.error("Erro ao reabrir passeio.");
        }
      },
    });
  };

  const dataFormatadaCabecalho = formatDateTime(calculados.data_inicio);

  return (
    <PullToRefreshWrapper onRefresh={async () => { await refetch(); }}>
      <div className="w-full max-w-6xl mx-auto space-y-6 pb-24 pt-1 sm:pt-2">
        {/* Barra superior de ações */}
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

          <div className="flex items-center gap-2">
            {calculados.status === "concluido" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmarReabertura}
                className="h-8 sm:h-9 px-3 rounded-[18px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] hover:bg-white hover:border-[#0a0a0a] gap-1.5 transition-all active:scale-[0.98]"
              >
                <RotateCcw className="h-3.5 w-3.5 text-[#737373]" />
                <span className="hidden sm:inline">Reabrir Passeio</span>
                <span className="sm:hidden">Reabrir</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfirmarConclusao}
                className="h-8 sm:h-9 px-3 rounded-[18px] text-xs font-medium text-[#0a0a0a] border-[#e5e5e5] hover:bg-white hover:border-[#0a0a0a] gap-1.5 transition-all active:scale-[0.98]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#0a0a0a]" />
                <span className="hidden sm:inline">Concluir Passeio</span>
                <span className="sm:hidden">Concluir</span>
              </Button>
            )}

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
        </div>

        {/* Card Principal de Informações */}
        <div className="bg-white rounded-[24px] border border-[#e5e5e5] p-4 sm:p-6 shadow-[0_0_0_1px_rgba(23,23,23,0.05),0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)] space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                <Ticket className="h-3 w-3 text-[#737373]" />
                Passeio Coletivo
              </span>
              {calculados.status === "concluido" ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                  <CheckCircle2 className="h-3 w-3 text-[#0a0a0a]" />
                  Concluído
                </span>
              ) : calculados.status === "cancelado" ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-white text-[#e7000b] border border-[#e7000b]/40">
                  Cancelado
                </span>
              ) : null}
              {calculados.isLotado && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-white text-[#e7000b] border border-[#e7000b]/40">
                  Vagas Esgotadas
                </span>
              )}
              {calculados.valor_por_pessoa ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] sm:text-xs font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
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
                    {formatarPlacaExibicao(v.placa)} {v.modelo ? `(${v.modelo})` : ""}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* KPIs do Topo com scroll lateral touch no mobile */}
        <PasseioKpiCards calculados={calculados} />

        {/* Navegação por Abas */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as PasseioTab)}
          className="w-full space-y-4"
        >
          <AppTabNav
            items={tabItems}
            activeTab={activeTab}
            layout="auto"
          />

          <TabsContent value="participantes" className="outline-none mt-0">
            <Suspense fallback={<Skeleton className="h-64 w-full rounded-[24px]" />}>
              <PasseioParticipantesSection
                calculados={calculados}
                detalhes={detalhes}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="despesas" className="outline-none mt-0">
            <Suspense fallback={<Skeleton className="h-64 w-full rounded-[24px]" />}>
              <PasseioGastosSection
                calculados={calculados}
              />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </PullToRefreshWrapper>
  );
}
