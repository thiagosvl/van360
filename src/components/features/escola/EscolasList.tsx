import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEscolaActions } from "@/hooks/ui/useEscolaActions";
import { Escola } from "@/types/escola";
import { Eye, Users2 } from "lucide-react";
import { NavigateFunction } from "react-router-dom";

interface EscolasListProps {
  escolas: (Escola & { passageiros_ativos_count?: number })[];
  navigate: NavigateFunction;
  onEdit: (escola: Escola) => void;
  onToggleAtivo: (escola: Escola) => void;
  onDelete: (escola: Escola) => void;
}

export function EscolasList({
  escolas,
  navigate,
  onEdit,
  onToggleAtivo,
  onDelete,
}: EscolasListProps) {
  return (
    <ResponsiveDataList
      data={escolas}
      mobileContainerClassName="space-y-3"
      mobileItemRenderer={(escola, index) => {
        const actions = useEscolaActions({
          escola,
          navigate,
          onEdit,
          onToggleAtivo,
          onDelete,
        });

        return (
          <MobileActionItem
            key={escola.id}
            actions={actions as any}
            showHint={index === 0}
          >
            <div
              onClick={() => onEdit(escola)}
              className="bg-white rounded-xl shadow-sm border border-gray-100 pt-3 pb-2 px-4 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 text-sm">
                    {escola.nome}
                  </p>
                </div>
                <Eye className="h-4 w-4 text-gray-300 absolute right-4 top-3" />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <div className="shrink-0">
                  <StatusBadge status={escola.ativo} />
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Passageiros
                  </span>
                  <p className="text-xs text-gray-600 font-medium flex gap-1">
                    <Users2 className="w-4 h-4" />
                    {escola.passageiros_ativos_count ?? 0} ativos
                  </p>
                </div>
              </div>
            </div>
          </MobileActionItem>
        );
      }}
    >
      <div className="rounded-2xl md:rounded-[28px] border border-gray-100 overflow-hidden bg-white shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50/50">
            <tr className="border-b border-gray-100">
              <th className="py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">
                Escola
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Quantidade Passageiros
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {escolas.map((escola) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const actions = useEscolaActions({
                escola,
                navigate,
                onEdit,
                onToggleAtivo,
                onDelete,
              });

              return (
                <tr
                  key={escola.id}
                  className="hover:bg-gray-50/80 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                  onClick={() => onEdit(escola)}
                >
                  <td className="py-4 pl-6 align-middle">
                    <span className="font-bold text-gray-900 text-sm">
                      {escola.nome}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-muted-foreground">
                        {escola.passageiros_ativos_count || 0} ativos
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <StatusBadge
                      status={escola.ativo}
                      trueLabel="Ativa"
                      falseLabel="Desativada"
                    />
                  </td>
                  <td className="px-6 py-4 text-right align-middle">
                    <ActionsDropdown actions={actions} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </ResponsiveDataList>
  );
}
