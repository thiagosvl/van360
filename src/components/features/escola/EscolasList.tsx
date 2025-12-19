import { ActionsDropdown } from "@/components/common/ActionsDropdown";
import { MobileActionItem } from "@/components/common/MobileActionItem";
import { ResponsiveDataList } from "@/components/common/ResponsiveDataList";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useEscolaActions } from "@/hooks/business/useEscolaActions";
import { Escola } from "@/types/escola";
import { Users2 } from "lucide-react";
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
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 active:scale-[0.99] transition-transform"
              onClick={() => onEdit(escola)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900 text-base mb-1">
                    {escola.nome}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-gray-500">{escola.endereco}</p>
                    {escola.telefone && (
                      <p className="text-sm text-gray-400">{escola.telefone}</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={escola.ativo} />
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                  <Users2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">
                    {escola.passageiros_ativos_count || 0} {escola.passageiros_ativos_count === 1 ? "passageiro" : "passageiros"}
                  </span>
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
                Endereço
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                Passageiros
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
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-500 font-medium">
                        {escola.endereco}
                      </span>
                      {escola.telefone && (
                        <span className="text-xs text-gray-400 mt-0.5">
                          {escola.telefone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5">
                      <Users2 className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-700">
                        {escola.passageiros_ativos_count || 0}
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
