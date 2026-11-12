import { AppTabNav } from "@/components/ui/AppTabNav";
import { AnoLetivoSelect } from "@/components/common/AnoLetivoSelect";
import { TAB_MINHAS_ROTAS, TAB_HISTORICO } from "@/hooks/ui/useRotasViewModel";

interface RotasToolbarProps {
  activeTab?: string;
  countMinhasRotas?: number;
  countHistorico?: number;
  anoLetivo?: number;
  onChangeAnoLetivo?: (ano: number) => void;
  isLoadingAno?: boolean;
}

export function RotasToolbar({
  activeTab,
  countMinhasRotas,
  countHistorico,
  anoLetivo,
  onChangeAnoLetivo,
  isLoadingAno = false,
}: RotasToolbarProps = {}) {
  const showAnoSelect = typeof anoLetivo === "number" && Boolean(onChangeAnoLetivo);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <AppTabNav
        activeTab={activeTab}
        items={[
          {
            value: TAB_MINHAS_ROTAS,
            label: "Minhas Rotas",
            badge: countMinhasRotas,
          },
          {
            value: TAB_HISTORICO,
            label: "Histórico",
            badge: countHistorico,
          },
        ]}
      />

      {showAnoSelect && anoLetivo && onChangeAnoLetivo && (
        <AnoLetivoSelect
          ano={anoLetivo}
          onChangeAno={onChangeAnoLetivo}
          isLoading={isLoadingAno}
          className="w-full sm:w-auto justify-between sm:justify-start h-10 sm:h-11"
        />
      )}
    </div>
  );
}
