import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { UnifiedEmptyState } from "@/components/empty";
import { ListSkeleton } from "@/components/skeletons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useContratoActions } from "@/hooks/ui/useContratoActions";
import { cn } from "@/lib/utils";
import { ContratoProvider, ContratoStatus, ContratoTab } from "@/types/enums";
import { formatShortName } from "@/utils/formatters";
import { formatNomeResponsavelExibicao } from "@/utils/formatters/name";
import { useAppPreferences } from "@/hooks";
import { Clock, Download, Eye, FileCheck2, FileSignature, FileText, FileX2, Loader2, User, Users } from "lucide-react";
import { memo } from "react";
import { ContratoListItem } from "@/types/contract";
import { Passageiro } from "@/types/passageiro";
import { isResponsavelIncompleto, obterUrlDocumentoContrato } from "@/utils/domain";
import { ContratoActionsMenu } from "./ContratoActionsMenu";
import { ContratoSummary } from "./ContratoSummary";

const getIconConfig = (isAssinado: boolean, isSemContrato: boolean) => {
  if (isAssinado) {
    return { icon: FileCheck2, className: "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]" };
  }
  if (isSemContrato) {
    return { icon: FileX2, className: "bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]" };
  }
  return { icon: Clock, className: "bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]" };
};

interface ContratosListProps {
  data: ContratoListItem[];
  isLoading: boolean;
  activeTab: ContratoTab;
  busca: string;
  isDesativado?: boolean;
  isDownloading?: string | null;
  onVerPassageiro: (id: string) => void;
  onEnviarWhatsApp: (item: ContratoListItem) => void;
  onCompartilharWhatsApp?: (item: ContratoListItem) => void;
  onDownload?: (item: ContratoListItem) => void;
  onExcluir: (id: string) => void;
  onSubstituir: (id: string) => void;
  onGerarContrato: (passageiroId: string, item?: ContratoListItem) => void;
  onCompletarCadastro?: (passageiroId: string, item?: ContratoListItem) => void;
  onImportarContrato?: (passageiroId: string, passageiro?: Passageiro | ContratoListItem) => void;
  onVisualizarLink: (token: string) => void;
  onVisualizarFinal: (url: string) => void;
}

interface ContratoMobileCardProps {
  item: ContratoListItem;
  index: number;
  activeTab: ContratoTab;
  isDesativado?: boolean;
  isDownloading?: string | null;
  onVerPassageiro: (id: string) => void;
  onEnviarWhatsApp: (item: ContratoListItem) => void;
  onCompartilharWhatsApp?: (item: ContratoListItem) => void;
  onDownload?: (item: ContratoListItem) => void;
  onExcluir: (id: string) => void;
  onSubstituir: (id: string) => void;
  onGerarContrato: (passageiroId: string, item?: ContratoListItem) => void;
  onCompletarCadastro?: (passageiroId: string, item?: ContratoListItem) => void;
  onImportarContrato?: (passageiroId: string, passageiro?: Passageiro | ContratoListItem) => void;
  onVisualizarLink: (token: string) => void;
  onVisualizarFinal: (url: string) => void;
}

const ContratoMobileCard = memo(function ContratoMobileCard({
  item,
  index,
  isDesativado,
  isDownloading,
  onVerPassageiro,
  onEnviarWhatsApp,
  onCompartilharWhatsApp,
  onDownload,
  onExcluir,
  onSubstituir,
  onGerarContrato,
  onCompletarCadastro,
  onImportarContrato,
  onVisualizarLink,
  onVisualizarFinal,
}: ContratoMobileCardProps) {
  const actions = useContratoActions({
    item,
    tipo: item.tipo,
    status: item.status as ContratoStatus,
    isDesativado,
    onVerPassageiro,
    onEnviarWhatsApp: () => onEnviarWhatsApp(item),
    onCompartilharWhatsApp,
    onDownload,
    onExcluir,
    onSubstituir,
    onGerarContrato: (pId) => onGerarContrato(pId, item),
    onCompletarCadastro,
    onImportarContrato,
    onVisualizarLink,
    onVisualizarFinal,
  });

  const { formatoNomeResponsavel } = useAppPreferences();

  const isSemContrato = item.tipo === "passageiro";
  const isImportado = item?.provider === ContratoProvider.IMPORTADO;
  const status = item.status as ContratoStatus | null;
  const isAssinado = status === ContratoStatus.ASSINADO;
  const isPendente = status === ContratoStatus.PENDENTE;
  const hasContract = isPendente || isAssinado || !!item?.contrato_id;
  const nomeExibicao = item.passageiro?.nome || item.nome || "";
  const responsavelExibicao = item.passageiro?.responsavel_principal?.nome || item.responsavel_principal?.nome || "";
  const urlContrato = obterUrlDocumentoContrato(item);
  const respObj = item?.responsavel_principal || item?.passageiro?.responsavel_principal;
  const isMissingResponsible = isResponsavelIncompleto(respObj?.nome, respObj?.telefone);
  const passId = (item.tipo === "passageiro" ? item.id : item.passageiro_id) || item.id;

  const valor = Number(
    item.dados_contrato?.valorMensal ||
    item.valor_parcela ||
    item.valor_cobranca
  ) || 0;

  const iconConfig = getIconConfig(isAssinado, isSemContrato);

  const swipeActions = actions.map((action) => ({
    ...action,
    swipeColor: action.swipeColor || "bg-[#171717]",
  }));

  const renderHeader = () => <ContratoSummary item={item} />;

  return (
    <MobileActionItem actions={swipeActions} showHint={index === 0} showTrigger={false} className="bg-transparent" renderHeader={renderHeader}>
      <div className="bg-white p-3.5 sm:p-4 rounded-[20px] border border-[#e5e5e5] shadow-[0_1px_3px_rgba(0,0,0,0.05)] active:scale-[0.99] transition-all flex flex-col gap-2.5 relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn("w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0", iconConfig.className)}>
              <iconConfig.icon className="w-4 h-4" />
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[#0a0a0a] text-sm truncate leading-snug">
                {formatShortName(nomeExibicao, true)}
              </span>
              <span
                className={cn(
                  "text-xs text-[#737373] font-normal leading-snug",
                  formatoNomeResponsavel === "completo" ? "truncate" : "break-words line-clamp-1"
                )}
              >
                {formatNomeResponsavelExibicao(responsavelExibicao, formatoNomeResponsavel)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isImportado ? (
              <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                Importado
              </span>
            ) : isAssinado ? (
              <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-[#171717] text-[#fafafa]">
                Assinado
              </span>
            ) : isPendente ? (
              <span className="px-2 py-0.5 rounded-[18px] text-[10px] font-medium bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
                Pendente
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#e5e5e5] gap-2">
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-[#0a0a0a]">
              {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
            <span className="text-[11px] font-medium text-[#737373]">/mês</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!hasContract && (
              isMissingResponsible ? (
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompletarCadastro?.(passId, item);
                  }}
                  disabled={isDesativado}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Completar Cadastro</span>
                </Button>
              ) : onGerarContrato ? (
                <Button
                  type="button"
                  variant="tonal"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGerarContrato(passId, item);
                  }}
                  disabled={isDesativado}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Gerar Contrato</span>
                </Button>
              ) : null
            )}

            {urlContrato && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVisualizarFinal(urlContrato);
                  }}
                  className="h-8 px-3 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.98] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#737373]/50 text-xs font-medium gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-[#0a0a0a]" />
                  <span>Ver</span>
                </Button>

                {isAssinado && onDownload && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDownload(item);
                    }}
                    disabled={isDownloading === item.id}
                    className="h-8 px-2.5 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] active:scale-[0.98] text-[#0a0a0a] hover:text-[#0a0a0a] border border-transparent text-xs font-medium gap-1.5 transition-all shadow-none shrink-0 cursor-pointer"
                  >
                    {isDownloading === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#737373]" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-[#0a0a0a]" />
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </MobileActionItem>
  );
});

export const ContratosList = memo(function ContratosList({
  data,
  isLoading,
  activeTab,
  busca,
  isDesativado,
  isDownloading,
  ...actions
}: ContratosListProps) {
  const { formatoNomeResponsavel } = useAppPreferences();

  const getEmptyState = () => {
    if (busca) {
      return (
        <UnifiedEmptyState
          icon={FileText}
          title="Nenhum resultado"
          description="Nenhum contrato ou aluno encontrado com este termo."
        />
      );
    }

    const configs: Record<
      ContratoTab,
      { icon: typeof FileText; title: string; desc: string }
    > = {
      [ContratoTab.PENDENTES]: {
        icon: FileSignature,
        title: "Sem contratos pendentes",
        desc: "Todos os contratos gerados já foram assinados pelos responsáveis.",
      },
      [ContratoTab.SEM_CONTRATO]: {
        icon: Users,
        title: "Todos os alunos com contrato",
        desc: "Todos os alunos ativos já possuem contrato digital emitido ou assinado.",
      },
      [ContratoTab.ASSINADOS]: {
        icon: FileCheck2,
        title: "Nenhum contrato assinado",
        desc: "Os contratos assinados digitalmente ou importados aparecerão aqui.",
      },
    };

    const config = configs[activeTab] || configs[ContratoTab.SEM_CONTRATO];

    return (
      <UnifiedEmptyState
        icon={config.icon}
        title={config.title}
        description={config.desc}
      />
    );
  };

  return (
    <ResponsiveDataList
      data={data}
      isLoading={isLoading}
      loadingSkeleton={<ListSkeleton count={5} />}
      emptyState={getEmptyState()}
      mobileContainerClassName="space-y-2.5"
      mobileItemRenderer={(item, index) => (
        <ContratoMobileCard
          key={item.id}
          item={item}
          index={index}
          activeTab={activeTab}
          isDesativado={isDesativado}
          isDownloading={isDownloading}
          {...actions}
        />
      )}
    >
      <div className="rounded-[24px] border border-[#e5e5e5] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
        <Table>
          <TableHeader className="bg-[#fafafa]">
            <TableRow className="hover:bg-transparent border-b border-[#e5e5e5]">
              <TableHead className="px-6 py-4 text-left text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Aluno / Responsável
              </TableHead>
              <TableHead className="px-6 py-4 text-left text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Status
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Valor Mensal
              </TableHead>
              <TableHead className="px-6 py-4 text-right text-[12px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const nomePassageiro = item.passageiro?.nome || item.nome || "";
              const nomeResponsavel = item.passageiro?.responsavel_principal?.nome || item.responsavel_principal?.nome;

              const isSemContrato = item.tipo === "passageiro";
              const isImportado = item?.provider === ContratoProvider.IMPORTADO;
              const status = item.status as ContratoStatus | null;
              const isAssinado = status === ContratoStatus.ASSINADO;
              const isPendente = status === ContratoStatus.PENDENTE;
              const hasContract = isPendente || isAssinado || !!item?.contrato_id;

              const respObj = item?.responsavel_principal || item?.passageiro?.responsavel_principal;
              const respNome = respObj?.nome;
              const respTelefone = respObj?.telefone;
              const isMissingResponsible = isResponsavelIncompleto(respNome, respTelefone);
              const passId = (item.tipo === "passageiro" ? item.id : item.passageiro_id) || item.id;

              const iconConfig = getIconConfig(isAssinado, isSemContrato);
              const urlContrato = obterUrlDocumentoContrato(item);

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-[#fafafa]/80 border-b border-[#e5e5e5] last:border-b-0 transition-colors"
                >
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div className={cn("h-9 w-9 rounded-[10px] flex items-center justify-center shrink-0", iconConfig.className)}>
                        <iconConfig.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[#0a0a0a] text-sm truncate">
                          {formatShortName(nomePassageiro, true)}
                        </span>
                        <span
                          className={cn(
                            "text-xs text-[#737373] font-normal leading-tight",
                            formatoNomeResponsavel === "completo" ? "truncate max-w-[220px]" : "truncate"
                          )}
                        >
                          {formatNomeResponsavelExibicao(nomeResponsavel, formatoNomeResponsavel)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-4">
                    {isImportado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#f5f5f5] text-[#171717] border border-[#e5e5e5]">
                        Assinado (Importado)
                      </span>
                    ) : isAssinado ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#171717] text-[#fafafa]">
                        Assinado
                      </span>
                    ) : isPendente ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#f5f5f5] text-[#0a0a0a] border border-[#e5e5e5]">
                        Pendente
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-[18px] text-[11px] font-medium bg-[#f5f5f5] text-[#737373] border border-[#e5e5e5]">
                        {isMissingResponsible ? "Cadastro Incompleto" : "Sem Contrato"}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <span className="font-semibold text-[#0a0a0a] text-sm">
                      {(
                        Number(
                          item.dados_contrato?.valorMensal ||
                          item.valor_parcela ||
                          item.valor_cobranca,
                        ) || 0
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!hasContract && (
                        isMissingResponsible ? (
                          <Button
                            type="button"
                            variant="tonal"
                            size="sm"
                            onClick={() => actions.onCompletarCadastro?.(passId, item)}
                            disabled={isDesativado}
                            title="Completar dados e gerar contrato"
                          >
                            <User className="w-3.5 h-3.5" />
                            <span>Completar</span>
                          </Button>
                        ) : actions.onGerarContrato ? (
                          <Button
                            type="button"
                            variant="tonal"
                            size="sm"
                            onClick={() => actions.onGerarContrato?.(passId, item)}
                            disabled={isDesativado}
                            title="Gerar contrato"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Gerar Contrato</span>
                          </Button>
                        ) : null
                      )}

                      {urlContrato && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => actions.onVisualizarFinal(urlContrato)}
                            className="h-8 px-3 rounded-[18px] bg-white hover:bg-[#f5f5f5] active:scale-[0.98] text-[#0a0a0a] hover:text-[#0a0a0a] border border-[#e5e5e5] hover:border-[#737373]/50 text-xs font-medium gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                            title="Acessar contrato"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#0a0a0a]" />
                            <span>Visualizar</span>
                          </Button>

                          {isAssinado && actions.onDownload && (
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => actions.onDownload?.(item)}
                              disabled={isDownloading === item.id}
                              className="h-8 px-3 rounded-[18px] bg-[#f5f5f5] hover:bg-[#ebebeb] active:scale-[0.98] text-[#0a0a0a] hover:text-[#0a0a0a] border border-transparent text-xs font-medium gap-1.5 transition-all shadow-none shrink-0 cursor-pointer"
                              title="Download do contrato assinado"
                            >
                              {isDownloading === item.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#737373]" />
                              ) : (
                                <Download className="w-3.5 h-3.5 text-[#0a0a0a]" />
                              )}
                              <span>Download</span>
                            </Button>
                          )}
                        </>
                      )}

                      <ContratoActionsMenu
                        item={item}
                        tipo={item.tipo}
                        status={item.status}
                        isDesativado={isDesativado}
                        {...actions}
                        onEnviarWhatsApp={() => actions.onEnviarWhatsApp(item)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </ResponsiveDataList>
  );
});
