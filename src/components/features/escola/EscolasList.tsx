import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEscolaActions } from "@/hooks/ui/useEscolaActions";
import { cn } from "@/lib/utils";
import { Escola } from "@/types/escola";
import { GraduationCap, Users2 } from "lucide-react";
import { memo, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { EscolaActionsMenu } from "./EscolaActionsMenu";
import { EscolaSummary } from "./EscolaSummary";

interface EscolasListProps {
  escolas: (Escola & { passageiros_ativos_count?: number })[];
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}

const EscolaMobileCard = memo(function EscolaMobileCard({
  escola,
  index,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: { escola: Escola & { passageiros_ativos_count?: number }; index: number } & EscolasListProps) {
  const actions = useEscolaActions({
    escola,
    navigate,
    onEdit,
    onToggleAtivo,
    onDelete,
  });

  const renderHeader = () => <EscolaSummary escola={escola} />;

  return (
    <MobileActionItem
      key={escola.id}
      actions={actions as any}
      showHint={index === 0}
      className="bg-transparent"
      renderHeader={renderHeader}
    >
      <div
        className="bg-white p-3 rounded-xl shadow-diff-shadow flex items-center gap-3 active:scale-[0.98] transition-all duration-150 border border-gray-100/50"
      >
        <div className={cn(
          "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center",
          escola.ativo ? "bg-[#1a3a5c]" : "bg-slate-400"
        )}>
          <GraduationCap className="h-5 w-5 text-white" />
        </div>

        <div className="flex-grow min-w-0 pr-10">
          <p className="font-headline font-bold text-[#1a3a5c] text-sm leading-tight">
            {escola.nome}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0 absolute right-12 top-1/2 -translate-y-1/2">
          <StatusBadge
            status={escola.ativo}
          />
        </div>
      </div>
    </MobileActionItem>
  );
});

export function EscolasList({
  escolas,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: EscolasListProps) {
  const [openedEscola, setOpenedEscola] = useState<(Escola & { passageiros_ativos_count?: number }) | null>(null);

  return (
    <>
      <ResponsiveDataList
        data={escolas}
        mobileContainerClassName="space-y-3"
        mobileItemRenderer={(escola, index) => (
          <EscolaMobileCard
            key={escola.id}
            escola={escola}
            index={index}
            navigate={navigate}
            onEdit={onEdit}
            onToggleAtivo={onToggleAtivo}
            onDelete={onDelete}
            escolas={escolas}
          />
        )}
      >
        <div className="rounded-[28px] overflow-hidden bg-white shadow-diff-shadow border-none">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100/80">
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Escola
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Qtd. Passageiros
                </th>
                <th className="px-8 py-5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-8 py-5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {escolas.map((escola) => (
                <tr
                  key={escola.id}
                  onClick={() => setOpenedEscola(escola)}
                  className="group hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5 align-middle">
                    <div className="flex flex-col">
                      <p className="font-headline font-bold text-[#1a3a5c] text-sm tracking-tight">
                        {escola.nome}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-slate-400" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-[13px] font-semibold text-slate-700">
                          {escola.passageiros_ativos_count ?? 0}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          passageiros
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 align-middle">
                    <StatusBadge
                      status={escola.ativo}
                    />
                  </td>
                  <td className="px-8 py-5 text-right align-middle" onClick={(e) => e.stopPropagation()}>
                    <EscolaActionsMenu
                      escola={escola}
                      navigate={navigate}
                      onEdit={onEdit}
                      onToggleAtivo={onToggleAtivo}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ResponsiveDataList>

      {openedEscola && (
        <ActionSheetWrapper
          escola={openedEscola}
          open={!!openedEscola}
          onOpenChange={(open) => !open && setOpenedEscola(null)}
          navigate={navigate}
          onEdit={onEdit}
          onToggleAtivo={onToggleAtivo}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

function ActionSheetWrapper({
  escola,
  open,
  onOpenChange,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete
}: {
  escola: Escola & { passageiros_ativos_count?: number };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}) {
  const actions = useEscolaActions({
    escola,
    navigate,
    onEdit,
    onToggleAtivo,
    onDelete
  });

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      actions={actions.map(a => ({
        ...a as any,
        onClick: () => {
          onOpenChange(false);
          a.onClick();
        }
      }))}
    >
      <EscolaSummary escola={escola} />
    </ActionSheet>
  );
}
