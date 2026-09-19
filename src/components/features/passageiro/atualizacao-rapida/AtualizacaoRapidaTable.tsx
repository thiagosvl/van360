import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { periodos } from "@/utils/formatters/periodo";
import { formatShortName } from "@/utils/formatters/name";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { ExternalLink, ChevronDown } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AtualizacaoRapidaEditableField =
  | "escola_id"
  | "veiculo_id"
  | "turma"
  | "periodo"
  | "valor_cobranca"
  | "dia_vencimento"
  | "ativo";

interface AtualizacaoRapidaTableProps {
  passageiros: Passageiro[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  isAllSelected?: boolean;
  onToggleSelectAll?: () => void;
  onUpdateField: (
    passageiroId: string,
    field: AtualizacaoRapidaEditableField,
    value: unknown,
    original: Passageiro
  ) => void;
  getEffectiveValue: <K extends AtualizacaoRapidaEditableField>(
    passageiro: Passageiro,
    field: K
  ) => unknown;
  isDirty: (id: string) => boolean;
  escolas: Escola[];
  veiculos: Veiculo[];
}

export const AtualizacaoRapidaTable = memo(function AtualizacaoRapidaTable({
  passageiros,
  selectedIds,
  onToggleSelect,
  isAllSelected = false,
  onToggleSelectAll,
  onUpdateField,
  getEffectiveValue,
  isDirty,
  escolas,
  veiculos,
}: AtualizacaoRapidaTableProps) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[650px] sm:min-w-[880px]">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 w-8 sm:w-10 text-center">
                {onToggleSelectAll ? (
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Selecionar todos os alunos"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border-slate-300 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c]"
                  />
                ) : (
                  "#"
                )}
              </th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 w-28 sm:min-w-[200px]">Aluno</th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 w-32 sm:min-w-[160px]">Veículo</th>
              <th className="py-2 sm:py-3 px-2 sm:px-3 w-32 sm:min-w-[170px]">Escola</th>
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 w-24 sm:w-32">Período</th>
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 w-20 sm:w-28">Turma</th>
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 w-28 sm:w-32 min-w-[115px]">Valor</th>
              <th className="py-2 sm:py-3 px-1.5 sm:px-3 w-24 sm:w-28">Vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {passageiros.map((p) => {
              const pId = p.id || "";
              const dirty = isDirty(pId);
              const isSelected = selectedIds.has(pId);

              const effectiveEscolaId = String(getEffectiveValue(p, "escola_id") || "");
              const effectiveVeiculoId = String(getEffectiveValue(p, "veiculo_id") || "");
              const effectivePeriodo = String(getEffectiveValue(p, "periodo") || "none");
              const effectiveTurma = String(getEffectiveValue(p, "turma") || "");
              const rawValor = getEffectiveValue(p, "valor_cobranca");
              const effectiveValor = rawValor !== null && rawValor !== undefined && rawValor !== "" ? Number(rawValor) : undefined;
              const rawVencimento = getEffectiveValue(p, "dia_vencimento");
              const effectiveVencimento = rawVencimento !== null && rawVencimento !== undefined && rawVencimento !== "" ? String(rawVencimento) : "none";

              return (
                <tr
                  key={pId}
                  className={cn(
                    "transition-colors group",
                    isSelected
                      ? "bg-blue-50/80 hover:bg-blue-50"
                      : dirty
                      ? "bg-amber-50/20 hover:bg-amber-50/40"
                      : "hover:bg-slate-50/60"
                  )}
                >
                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 text-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelect(pId)}
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-md border-slate-300 data-[state=checked]:bg-[#1a3a5c] data-[state=checked]:border-[#1a3a5c]"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-3">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block leading-tight text-xs sm:text-xs">
                          <span className="sm:hidden">{formatShortName(p.nome, true)}</span>
                          <span className="hidden sm:inline">{p.nome}</span>
                        </span>
                        {dirty && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                            Alterado
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/alunos/${pId}`}
                        target="_blank"
                        title="Ver carteirinha do aluno"
                        className="opacity-0 group-hover:opacity-100 hidden sm:inline-flex text-slate-400 hover:text-[#1a3a5c] p-1 rounded hover:bg-slate-200/50 transition-all shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-3">
                    <div className="relative">
                      <select
                        value={effectiveVeiculoId}
                        onChange={(e) => onUpdateField(pId, "veiculo_id", e.target.value, p)}
                        className="w-full h-7 sm:h-8 pl-1.5 pr-5 sm:pl-2 sm:pr-6 text-[11px] sm:text-xs bg-white border border-slate-200 rounded-md sm:rounded-lg font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] focus:border-[#1a3a5c]"
                      >
                        {!effectiveVeiculoId && <option value="" disabled>Selecione</option>}
                        {(veiculos || []).map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.modelo} - {v.placa}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-3">
                    <div className="relative">
                      <select
                        value={effectiveEscolaId}
                        onChange={(e) => onUpdateField(pId, "escola_id", e.target.value, p)}
                        className="w-full h-7 sm:h-8 pl-1.5 pr-5 sm:pl-2 sm:pr-6 text-[11px] sm:text-xs bg-white border border-slate-200 rounded-md sm:rounded-lg font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] focus:border-[#1a3a5c]"
                      >
                        {!effectiveEscolaId && <option value="" disabled>Selecione</option>}
                        {(escolas || []).map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.nome}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3">
                    <div className="relative">
                      <select
                        value={effectivePeriodo}
                        onChange={(e) => onUpdateField(pId, "periodo", e.target.value === "none" ? null : e.target.value, p)}
                        className="w-full h-7 sm:h-8 pl-1.5 pr-5 sm:pl-2 sm:pr-6 text-[11px] sm:text-xs bg-white border border-slate-200 rounded-md sm:rounded-lg font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] focus:border-[#1a3a5c]"
                      >
                        <option value="none">Nenhum</option>
                        {periodos.map((per) => (
                          <option key={per.value} value={per.value}>
                            {per.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3">
                    <Input
                      value={effectiveTurma}
                      onChange={(e) => onUpdateField(pId, "turma", e.target.value || null, p)}
                      placeholder="Ex: 3º B"
                      className="h-7 sm:h-8 px-1.5 sm:px-2 text-[11px] sm:text-xs bg-white rounded-md sm:rounded-lg border-slate-200"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3">
                    <Input
                      value={effectiveValor !== undefined && effectiveValor !== null ? moneyMask(effectiveValor) : ""}
                      onChange={(e) => {
                        const formatted = moneyMask(e.target.value);
                        const numeric = moneyToNumber(formatted);
                        onUpdateField(pId, "valor_cobranca", numeric > 0 ? numeric : null, p);
                      }}
                      className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs sm:text-sm bg-white rounded-md sm:rounded-lg border-slate-200 font-semibold text-emerald-700 min-w-[100px] w-full"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3">
                    <div className="relative">
                      <select
                        value={effectiveVencimento}
                        onChange={(e) => onUpdateField(pId, "dia_vencimento", e.target.value === "none" ? null : Number(e.target.value), p)}
                        className="w-full h-7 sm:h-8 pl-1.5 pr-5 sm:pl-2 sm:pr-6 text-[11px] sm:text-xs bg-white border border-slate-200 rounded-md sm:rounded-lg font-medium text-slate-800 appearance-none focus:outline-none focus:ring-1 focus:ring-[#1a3a5c] focus:border-[#1a3a5c]"
                      >
                        <option value="none">Nenhum</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                          <option key={d} value={String(d)}>
                            Dia {d}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export const AtualizacaoRapidaDesktopTable = AtualizacaoRapidaTable;
