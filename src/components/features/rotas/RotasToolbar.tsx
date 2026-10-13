import { AppTabNav } from "@/components/ui/AppTabNav";

interface RotasToolbarProps {
  activeTab?: string;
  countMinhasRotas?: number;
  countHistorico?: number;
}

export function RotasToolbar({
  activeTab,
  countMinhasRotas,
  countHistorico,
}: RotasToolbarProps = {}) {
  return (
    <AppTabNav
      activeTab={activeTab}
      items={[
        {
          value: "minhas-rotas",
          label: "Minhas Rotas",
          badge: countMinhasRotas,
        },
        {
          value: "historico",
          label: "Histórico",
          badge: countHistorico,
        },
      ]}
    />
  );
}
