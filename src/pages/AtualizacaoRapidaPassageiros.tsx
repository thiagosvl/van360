import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListSkeleton } from "@/components/skeletons";
import { UnifiedEmptyState } from "@/components/empty/UnifiedEmptyState";
import { useAtualizacaoRapidaViewModel } from "@/hooks/ui/useAtualizacaoRapidaViewModel";
import { FilterDefaults } from "@/types/enums";
import { periodos } from "@/utils/formatters/periodo";
import { ArrowLeft, Car, Clock, Filter, RotateCcw, School, Search, Users2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLayout, safeCloseDialog } from "@/hooks";
import { AtualizacaoRapidaTable } from "@/components/features/passageiro/atualizacao-rapida/AtualizacaoRapidaTable";
import { AtualizacaoRapidaStickyBar } from "@/components/features/passageiro/atualizacao-rapida/AtualizacaoRapidaStickyBar";
import { DataTableFilterSelect } from "@/components/features/common/DataTableFilterSelect";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/business/usePermissions";
import { AccessRestrictedState } from "@/components/ui/AccessRestrictedState";
import { PERMISSIONS } from "@/config/permissions";

export default function AtualizacaoRapidaPassageiros() {
  const { can } = usePermissions();
  const navigate = useNavigate();
  const { openConfirmationDialog, closeConfirmationDialog } = useLayout();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    passageiros,
    totalOriginal,
    isLoading,
    isSaving,
    searchTerm,
    setSearchTerm,
    selectedEscola,
    setSelectedEscola,
    selectedVeiculo,
    setSelectedVeiculo,
    selectedPeriodo,
    setSelectedPeriodo,
    apenasSemValor,
    setApenasSemValor,
    totalSemValor,
    clearFilters,
    hasActiveFilters,
    escolas,
    veiculos,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isAllSelected,
    passageirosMap,
    business,
    saveChanges,
  } = useAtualizacaoRapidaViewModel();

  if (!can(PERMISSIONS.PASSAGEIROS_GERENCIAR)) {
    return <AccessRestrictedState moduleName="Edição em Lote" />;
  }

  const activeDropdownCount =
    (selectedEscola !== FilterDefaults.TODAS ? 1 : 0) +
    (selectedVeiculo !== FilterDefaults.TODOS ? 1 : 0) +
    (selectedPeriodo !== FilterDefaults.TODOS ? 1 : 0);
  const hasActiveDropdownFilters = activeDropdownCount > 0;

  const handleBack = () => {
    if (business.dirtyCount > 0) {
      openConfirmationDialog({
        title: "Descartar alterações?",
        description: `Você possui ${business.dirtyCount} aluno(s) com alterações não salvas. Se sair agora, as modificações serão perdidas.`,
        confirmText: "Descartar e Sair",
        cancelText: "Continuar Editando",
        variant: "destructive",
        onConfirm: () => {
          safeCloseDialog(closeConfirmationDialog);
          navigate("/alunos");
        },
        onCancel: () => {
          safeCloseDialog(closeConfirmationDialog);
        },
      });
    } else {
      navigate("/alunos");
    }
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-28 sm:pb-32 pt-1 sm:pt-2", isSaving && "pointer-events-none select-none")}>
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-9 px-3.5 rounded-[18px] border-[#e5e5e5] bg-white text-[#0a0a0a] hover:bg-[#fafafa] font-medium text-xs flex items-center gap-1.5 shadow-none"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#737373]" />
          <span>Voltar</span>
        </Button>

        <span className="text-xs font-medium text-[#737373] uppercase tracking-[0.05em]">
          {isLoading
            ? "Carregando..."
            : `${passageiros.length} DE ${totalOriginal} ${totalOriginal === 1 ? "ALUNO" : "ALUNOS"}`}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none">
              <Search
                className={cn(
                  "h-4 w-4 transition-colors",
                  searchTerm ? "text-[#0a0a0a]" : "text-[#737373]"
                )}
              />
            </div>
            <Input
              type="search"
              placeholder="Buscar por nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#e5e5e5] hover:border-[#737373]/60 focus:border-[#0a0a0a] focus:ring-1 focus:ring-[#0a0a0a] h-10 sm:h-11 pl-10 pr-10 rounded-[18px] text-sm font-normal text-[#0a0a0a] placeholder:text-[#737373] shadow-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0a0a0a] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "bg-white border-[#e5e5e5] text-[#0a0a0a] font-medium text-xs gap-1.5 h-10 rounded-[18px] px-3.5 shadow-none hover:bg-[#fafafa] shrink-0 sm:hidden",
              hasActiveDropdownFilters && "border-[#0a0a0a]"
            )}
          >
            <Filter className={cn("h-4 w-4", hasActiveDropdownFilters ? "text-[#0a0a0a]" : "text-[#737373]")} />
            <span>Filtros</span>
            {activeDropdownCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {activeDropdownCount}
              </span>
            )}
          </Button>
        </div>

        <div className={cn("grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3", !isFilterOpen && "hidden sm:grid")}>
          <DataTableFilterSelect
            label="Veículo"
            placeholder="Todos Veículos"
            value={selectedVeiculo}
            onValueChange={setSelectedVeiculo}
            icon={<Car className="w-4 h-4 shrink-0" />}
            options={[
              { label: "Todos Veículos", value: FilterDefaults.TODOS },
              ...(veiculos?.map((v) => ({ label: `${v.modelo} - ${v.placa}`, value: v.id })) || []),
            ]}
          />

          <DataTableFilterSelect
            label="Escola"
            placeholder="Todas Escolas"
            value={selectedEscola}
            onValueChange={setSelectedEscola}
            icon={<School className="w-4 h-4 shrink-0" />}
            options={[
              { label: "Todas Escolas", value: FilterDefaults.TODAS },
              ...(escolas?.map((e) => ({ label: e.nome, value: e.id })) || []),
            ]}
          />

          <DataTableFilterSelect
            label="Período"
            placeholder="Todos Períodos"
            value={selectedPeriodo}
            onValueChange={setSelectedPeriodo}
            icon={<Clock className="w-4 h-4 shrink-0" />}
            options={[
              { label: "Todos Períodos", value: FilterDefaults.TODOS },
              ...(periodos?.map((p) => ({ label: p.label, value: p.value })) || []),
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
          {totalSemValor > 0 ? (
            <button
              type="button"
              onClick={() => setApenasSemValor(!apenasSemValor)}
              className={cn(
                "h-8 px-3 rounded-[18px] text-xs font-medium transition-all flex items-center gap-1.5 border shrink-0",
                apenasSemValor
                  ? "bg-amber-500/10 text-amber-800 border-amber-300"
                  : "bg-white text-[#737373] border-[#e5e5e5] hover:text-[#0a0a0a] hover:bg-[#fafafa]"
              )}
            >
              <span>Sem valor definido</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded-[18px] text-[10px] font-semibold",
                apenasSemValor ? "bg-amber-200 text-amber-900" : "bg-[#f5f5f5] text-[#737373]"
              )}>
                {totalSemValor}
              </span>
            </button>
          ) : (
            <div />
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2.5 rounded-[18px] text-xs font-medium text-[#737373] hover:text-[#0a0a0a] hover:bg-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-[#737373]" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <ListSkeleton count={8} />
      ) : passageiros.length === 0 ? (
        <UnifiedEmptyState
          icon={Users2}
          title="Nenhum aluno encontrado"
          description={hasActiveFilters ? "Não encontramos alunos com os filtros aplicados." : "Nenhum aluno cadastrado."}
          action={hasActiveFilters ? {
            label: "Limpar Filtros",
            onClick: clearFilters,
          } : undefined}
        />
      ) : (
        <AtualizacaoRapidaTable
          passageiros={passageiros}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          isAllSelected={isAllSelected}
          onToggleSelectAll={toggleSelectAll}
          onUpdateField={business.updateField}
          getEffectiveValue={business.getEffectiveValue}
          isDirty={business.isDirty}
          escolas={escolas}
          veiculos={veiculos}
        />
      )}

      <AtualizacaoRapidaStickyBar
        dirtyCount={business.dirtyCount}
        isSaving={isSaving}
        onSave={saveChanges}
        onDiscard={business.discardChanges}
        selectedCount={selectedIds.size}
        onClearSelection={clearSelection}
        escolas={escolas}
        veiculos={veiculos}
        onApplyBulk={(field, val) => business.applyBulk(Array.from(selectedIds), field, val, passageirosMap)}
      />
    </div>
  );
}
