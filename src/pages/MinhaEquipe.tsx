import { MinhaEquipeTab } from "@/components/features/configuracoes/MinhaEquipeTab";
import { usePermissions } from "@/hooks/business/usePermissions";
import { ShieldAlert } from "lucide-react";

export default function MinhaEquipe() {
  const { can } = usePermissions();

  const hasAccess = can("equipe.gerenciar_monitores") || can("equipe.gerenciar_todos");

  if (!hasAccess) {
    return (
      <div className="p-8 text-center border border-slate-200 rounded-2xl bg-white space-y-3 my-6">
        <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="text-base font-bold text-slate-900 font-headline">Acesso Restrito</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Você não possui permissão para visualizar ou gerenciar a equipe da frota.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MinhaEquipeTab />
    </div>
  );
}
