import { Button } from "@/components/ui/button";
import { ActionSheet, ActionSheetItem } from "@/components/common/ActionSheet";
import { Input } from "@/components/ui/input";
import { AppTabNav } from "@/components/ui/AppTabNav";
import { cn } from "@/lib/utils";
import { ContratoTab } from "@/types/enums";
import { formatContratoStatus } from "@/utils/formatters/contrato";
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Search, MoreVertical, Loader2, FileText, CheckCircle2, PauseCircle, UploadCloud } from "lucide-react";
import { memo, useMemo, useState } from "react";

interface ContratosToolbarProps {
  busca: string;
  setBusca: (val: string) => void;
  activeTab: ContratoTab;
  countPendentes?: number;
  countSemContrato?: number;
  countAssinados?: number;
  anoLetivo?: number;
  onChangeAnoLetivo?: (ano: number) => void;
  isLoadingKPIs?: boolean;
  onOpenConfig: () => void;
  onOpenPreview: () => void;
  onImportarContrato?: () => void;
  isDesativado?: boolean;
  isContratoConfigurado?: boolean;
  onToggleContratos: (active: boolean) => void | Promise<void>;
  isToggling?: boolean;
  isPreviewLoading?: boolean;
}

export const ContratosToolbar = memo(function ContratosToolbar({
  busca,
  setBusca,
  activeTab,
  countPendentes,
  countSemContrato,
  countAssinados,
  anoLetivo,
  onChangeAnoLetivo,
  isLoadingKPIs = false,
  onOpenConfig,
  onOpenPreview,
  onImportarContrato,
  isDesativado = false,
  isContratoConfigurado = false,
  onToggleContratos,
  isToggling = false,
  isPreviewLoading = false,
}: ContratosToolbarProps) {
  const [openOptions, setOpenOptions] = useState(false);

  const contractActions: ActionSheetItem[] = useMemo(() => [
    ...(onImportarContrato
      ? [
        {
          label: "Importar Contrato Assinado",
          description: "Vincular contrato já assinado",
          icon: UploadCloud,
          onClick: onImportarContrato,
          disabled: isDesativado || isToggling,
        },
      ]
      : []),
    {
      label: "Ver Modelo de Contrato",
      icon: isPreviewLoading ? Loader2 : Eye,
      isLoading: isPreviewLoading,
      onClick: onOpenPreview,
      disabled: !isContratoConfigurado || isPreviewLoading,
    },
    {
      label: !isDesativado
        ? "Desativar Uso"
        : isContratoConfigurado
          ? "Reativar Uso"
          : "Ajustar e Começar a Usar",
      icon: isToggling
        ? Loader2
        : !isDesativado
          ? PauseCircle
          : CheckCircle2,
      isLoading: isToggling,
      onClick: () => onToggleContratos(isDesativado),
      disabled: isToggling,
      isDestructive: !isDesativado,
    },
  ], [
    onImportarContrato,
    isDesativado,
    isToggling,
    isPreviewLoading,
    onOpenPreview,
    isContratoConfigurado,
    onToggleContratos,
  ]);

  return (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      {/* Desktop (>= sm): Linha 1 com Abas de Status à esquerda e Seletor de Ano à direita */}
      <div className="hidden sm:flex sm:items-center justify-between gap-3">
        <AppTabNav
          activeTab={activeTab}
          items={[
            {
              value: ContratoTab.SEM_CONTRATO,
              label: formatContratoStatus(ContratoTab.SEM_CONTRATO),
              badge: countSemContrato,
              badgeLoading: isLoadingKPIs,
            },
            {
              value: ContratoTab.PENDENTES,
              label: "Pendentes",
              badge: countPendentes,
              badgeLoading: isLoadingKPIs,
            },
            {
              value: ContratoTab.ASSINADOS,
              label: "Assinados",
              badge: countAssinados,
              badgeLoading: isLoadingKPIs,
            },
          ]}
        />

        {anoLetivo && onChangeAnoLetivo && (
          <AnoLetivoSelect
            ano={anoLetivo}
            onChangeAno={onChangeAnoLetivo}
            className="shrink-0 h-10 sm:h-11"
          />
        )}
      </div>

      {/* Desktop (>= sm): Linha 2 com Campo de Busca amplo e Botões de Ação */}
      <div className="hidden sm:flex items-center gap-2.5 w-full">
        <div className="relative group flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a] group-hover:text-[#0a0a0a]" />
          <Input
            type="search"
            placeholder="Buscar aluno ou responsável..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 sm:h-11 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
          />
        </div>

        <Button
          type="button"
          onClick={onOpenConfig}
          disabled={isToggling}
          title="Configurar modelo de contrato, cláusulas e assinatura digital"
          className="inline-flex h-10 sm:h-11 px-4 rounded-[18px] bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-medium text-sm gap-2 shrink-0 transition-all shadow-xs border border-transparent cursor-pointer"
        >
          <FileText className="w-4 h-4 text-primary-foreground" />
          <span>Configurar</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          title="Mais opções de contratos"
          aria-label="Mais opções de contratos"
          onClick={() => setOpenOptions(true)}
          className={cn(
            "h-10 sm:h-11 w-10 sm:w-11 p-0 bg-white hover:bg-[#f5f5f5] hover:border-[#737373]/50 active:scale-[0.98] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] transition-all shrink-0 cursor-pointer shadow-xs",
            openOptions ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : ""
          )}
        >
          {isToggling ? (
            <Loader2 className="w-4 h-4 text-[#737373] animate-spin" />
          ) : (
            <MoreVertical className="w-4 h-4 text-[#0a0a0a]" />
          )}
        </Button>
      </div>

      {/* Mobile (< sm): Abas de Status com rolagem natural */}
      <div className="sm:hidden">
        <AppTabNav
          activeTab={activeTab}
          items={[
            {
              value: ContratoTab.SEM_CONTRATO,
              label: formatContratoStatus(ContratoTab.SEM_CONTRATO),
              badge: countSemContrato,
              badgeLoading: isLoadingKPIs,
            },
            {
              value: ContratoTab.PENDENTES,
              label: "Pendentes",
              badge: countPendentes,
              badgeLoading: isLoadingKPIs,
            },
            {
              value: ContratoTab.ASSINADOS,
              label: "Assinados",
              badge: countAssinados,
              badgeLoading: isLoadingKPIs,
            },
          ]}
        />
      </div>

      {/* Mobile (< sm): Controles em 2 linhas perfeitamente equilibradas */}
      <div className="flex flex-col gap-2.5 sm:hidden">
        {/* Linha 1 Mobile: Ano Letivo ocupa o espaço e Configurar fica ao lado */}
        <div className="flex items-center gap-2 w-full">
          {anoLetivo && onChangeAnoLetivo && (
            <div className="flex-1 min-w-0">
              <AnoLetivoSelect
                ano={anoLetivo}
                onChangeAno={onChangeAnoLetivo}
                className="w-full justify-between h-10"
              />
            </div>
          )}

          <Button
            type="button"
            onClick={onOpenConfig}
            disabled={isToggling}
            title="Configurar modelo de contrato, cláusulas e assinatura digital"
            className="h-10 px-3.5 rounded-[18px] bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground font-medium text-xs gap-1.5 shrink-0 transition-all shadow-xs border border-transparent cursor-pointer"
          >
            <FileText className="w-4 h-4 text-primary-foreground" />
            <span>Configurar</span>
          </Button>
        </div>

        {/* Linha 2 Mobile: Campo de busca amplo + Três pontinhos de ações */}
        <div className="flex items-center gap-2 w-full">
          <div className="relative group flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373] pointer-events-none transition-colors group-focus-within:text-[#0a0a0a] group-hover:text-[#0a0a0a]" />
            <Input
              type="search"
              placeholder="Buscar aluno ou responsável..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full bg-white text-[#0a0a0a] placeholder:text-[#737373] border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] rounded-[18px] h-10 pl-10 pr-4 text-sm font-normal transition-all shadow-none"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            title="Mais opções de contratos"
            aria-label="Mais opções de contratos"
            onClick={() => setOpenOptions(true)}
            className={cn(
              "h-10 w-10 p-0 bg-white hover:bg-[#f5f5f5] hover:border-[#737373]/50 active:scale-[0.98] text-[#0a0a0a] border border-[#e5e5e5] rounded-[18px] transition-all shrink-0 cursor-pointer shadow-xs",
              openOptions ? "border-[#0a0a0a] ring-1 ring-[#0a0a0a]" : ""
            )}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 text-[#737373] animate-spin" />
            ) : (
              <MoreVertical className="w-4 h-4 text-[#0a0a0a]" />
            )}
          </Button>
        </div>
      </div>

      <ActionSheet
        open={openOptions}
        onOpenChange={setOpenOptions}
        title="Opções de Contrato"
        description="Gerencie as diretrizes e modelos de contratos da sua operação."
        actions={contractActions}
      />
    </div>
  );
});
