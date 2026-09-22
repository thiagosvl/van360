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
    <div className={cn("min-h-screen bg-surface max-w-6xl mx-auto space-y-3 sm:space-y-4 pb-28 sm:pb-32 px-2 sm:px-6 pt-2 sm:pt-4", isSaving && "pointer-events-none select-none")}>
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleBack}
          className="h-8 px-3 rounded-xl border-slate-200 text-[#1a3a5c] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar</span>
        </Button>

        <span className="text-[11px] sm:text-xs text-slate-500 font-medium">
          {isLoading
            ? "Carregando..."
            : `Exibindo ${passageiros.length} de ${totalOriginal} alunos`}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative flex-grow group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search
                className={cn(
                  "h-4 w-4 transition-colors",
                  searchTerm
                    ? "text-amber-500"
                    : "text-gray-400 group-focus-within:text-[#1a3a5c]"
                )}
              />
            </div>
            <Input
              type="search"
              placeholder="Buscar por aluno ou turma..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-100/50 h-12 md:h-14 pl-11 pr-10 rounded-2xl shadow-sm font-medium text-sm md:text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#1a3a5c]/30 transition-all border-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "bg-white border-slate-100 text-[#1a3a5c] font-bold text-xs md:text-sm gap-1.5 md:gap-2 h-12 md:h-14 rounded-2xl px-3.5 md:px-5 shadow-sm hover:bg-gray-50 shrink-0 sm:hidden",
              hasActiveDropdownFilters && "bg-[#1a3a5c] text-white hover:bg-[#1a3a5c]/90 border-transparent shadow-none"
            )}
          >
            <Filter className={cn("h-4 w-4", hasActiveDropdownFilters && "text-amber-400")} />
            <span>Filtros</span>
            {activeDropdownCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-[#1a3a5c] text-[10px] font-bold flex items-center justify-center">
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
            icon={<Car className="w-3.5 h-3.5 shrink-0" />}
            triggerClassName="bg-white border-slate-100 shadow-sm"
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
            icon={<School className="w-3.5 h-3.5 shrink-0" />}
            triggerClassName="bg-white border-slate-100 shadow-sm"
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
            icon={<Clock className="w-3.5 h-3.5 shrink-0" />}
            triggerClassName="bg-white border-slate-100 shadow-sm"
            options={[
              { label: "Todos Períodos", value: FilterDefaults.TODOS },
              ...(periodos?.map((p) => ({ label: p.label, value: p.value })) || []),
            ]}
          />
        </div>

        {hasActiveFilters && (
          <div className="flex justify-end pt-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-[11px] font-bold text-slate-500 hover:text-slate-800"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Limpar Filtros
            </Button>
          </div>
        )}
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
