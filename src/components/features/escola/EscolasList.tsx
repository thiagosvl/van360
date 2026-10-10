import { ActionSheet } from "@/components/common/ActionSheet";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { safeCloseDialog } from "@/hooks/ui/useDialogClose";
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
      <div className={cn(
        "bg-white p-3.5 pr-8 rounded-[20px] border border-[#e5e5e5] shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-all",
        !escola.ativo && "opacity-60 bg-[#fafafa]/80"
      )}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={cn(
            "w-10 h-10 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0",
            !escola.ativo && "text-[#737373] opacity-60"
          )}>
            <GraduationCap className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-semibold text-sm leading-tight line-clamp-2",
              escola.ativo ? "text-[#0a0a0a]" : "text-[#737373]"
            )}>
              {escola.nome}
            </p>
            {escola.endereco && (
              <p className="text-xs text-[#737373] font-normal truncate mt-0.5">
                {escola.endereco}
              </p>
            )}
          </div>
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
        mobileContainerClassName="space-y-2.5"
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
        <div className="rounded-[24px] overflow-hidden bg-white border border-[#e5e5e5] shadow-xs">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#fafafa] border-b border-[#e5e5e5]">
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Nome da Escola
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Alunos Atendidos
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[11px] font-medium text-[#737373] uppercase tracking-[0.05em]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5]">
              {escolas.map((escola) => (
                <tr
                  key={escola.id}
                  onClick={() => setOpenedEscola(escola)}
                  className={cn(
                    "group transition-colors cursor-pointer",
                    escola.ativo 
                      ? "hover:bg-[#fafafa]/80" 
                      : "opacity-60 hover:opacity-90 bg-[#fafafa]/40"
                  )}
                >
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f5] border border-[#e5e5e5] flex items-center justify-center text-[#0a0a0a] shrink-0">
                        <GraduationCap className="w-4 h-4 text-[#0a0a0a]" />
                      </div>
                      <div className="flex flex-col">
                        <p className="font-semibold text-[#0a0a0a] text-sm tracking-tight">
                          {escola.nome}
                        </p>
                        {escola.endereco && (
                          <p className="text-xs text-[#737373] font-normal truncate max-w-md">
                            {escola.endereco}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-[#737373]" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-semibold text-[#0a0a0a]">
                          {escola.passageiros_ativos_count ?? 0}
                        </span>
                        <span className="text-xs font-normal text-[#737373]">
                          {(escola.passageiros_ativos_count ?? 0) === 1 ? "aluno" : "alunos"}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge status={escola.ativo} />
                  </td>
                  <td className="px-6 py-4 text-right align-middle" onClick={(e) => e.stopPropagation()}>
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
          onOpenChange={(open) => !open && safeCloseDialog(() => setOpenedEscola(null))}
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
  onDelete,
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
    onDelete,
  });

  return (
    <ActionSheet
      open={open}
      onOpenChange={onOpenChange}
      actions={actions.map((a) => ({
        ...a,
        onClick: () => {
          onOpenChange(false);
          a.onClick();
        },
      }))}
    >
      <EscolaSummary escola={escola} />
    </ActionSheet>
  );
}
