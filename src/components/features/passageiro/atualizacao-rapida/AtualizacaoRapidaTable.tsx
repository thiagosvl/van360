import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Escola } from "@/types/escola";
import { Passageiro } from "@/types/passageiro";
import { Veiculo } from "@/types/veiculo";
import { periodos } from "@/utils/formatters/periodo";
import { formatShortName, formatFirstName } from "@/utils/formatters/name";
import { moneyMask, moneyToNumber } from "@/utils/masks";
import { formatarPlacaExibicao } from "@/utils/domain/veiculo/placaUtils";
import { ExternalLink } from "lucide-react";
import { NativeSelect } from "@/components/ui/native-select";
import { memo } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export type AtualizacaoRapidaEditableField =
  | "escola_id"
  | "veiculo_id"
  | "turma"
  | "sala"
  | "nome_professor"
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
    <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs min-w-[980px] sm:min-w-[1100px]">
          <thead>
            <tr className="bg-[#fafafa] border-b border-[#e5e5e5] text-[10px] sm:text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
              <th className="py-2.5 sm:py-3 px-1 sm:px-3 w-8 sm:w-12 text-center">
                {onToggleSelectAll ? (
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={onToggleSelectAll}
                      aria-label="Selecionar todos os alunos"
                      className="w-4 h-4 rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </div>
                ) : (
                  "#"
                )}
              </th>
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 w-32 sm:min-w-[210px]">Aluno</th>
              <th className="py-2.5 sm:py-3 px-1 sm:px-3 w-24 sm:w-28 min-w-[95px] sm:min-w-[110px]">Valor</th>
              <th className="py-2.5 sm:py-3 px-1 sm:px-3 w-18 sm:w-24 min-w-[68px] sm:min-w-[80px] text-center whitespace-nowrap">Venc.</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 w-32 sm:w-44 min-w-[130px] sm:min-w-[160px] whitespace-nowrap">Veículo</th>
              <th className="py-2.5 sm:py-3 px-2 sm:px-3 min-w-[160px] sm:min-w-[190px] whitespace-nowrap">Escola</th>
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 min-w-[125px] whitespace-nowrap">Período</th>
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 w-24 sm:w-28 min-w-[85px]">Turma</th>
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 w-20 sm:w-24 min-w-[75px]">Sala</th>
              <th className="py-2.5 sm:py-3 px-1.5 sm:px-3 w-32 sm:w-36 min-w-[120px]">Professor(a)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e5e5]">
            {passageiros.map((p) => {
              const pId = p.id || "";
              const dirty = isDirty(pId);
              const isSelected = selectedIds.has(pId);

              const effectiveEscolaId = String(getEffectiveValue(p, "escola_id") || "");
              const effectiveVeiculoId = String(getEffectiveValue(p, "veiculo_id") || "");
              const effectivePeriodo = String(getEffectiveValue(p, "periodo") || "none");
              const rawValor = getEffectiveValue(p, "valor_cobranca");
              const effectiveValor = rawValor !== null && rawValor !== undefined && rawValor !== "" ? Number(rawValor) : undefined;
              const rawVencimento = getEffectiveValue(p, "dia_vencimento");
              const effectiveVencimento = rawVencimento !== null && rawVencimento !== undefined && rawVencimento !== "" ? String(rawVencimento) : "none";
              const effectiveSala = String(getEffectiveValue(p, "sala") || "");
              const effectiveProfessor = String(getEffectiveValue(p, "nome_professor") || "");
              const effectiveTurma = String(getEffectiveValue(p, "turma") || "");

              return (
                <tr
                  key={pId}
                  className={cn(
                    "transition-colors group",
                    isSelected
                      ? "bg-primary/5 hover:bg-primary/10"
                      : dirty
                        ? "bg-amber-500/10 hover:bg-amber-500/15"
                        : "hover:bg-[#fafafa]"
                  )}
                >
                  <td className="py-1.5 sm:py-2.5 px-1 sm:px-3 text-center w-8 sm:w-12">
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelect(pId)}
                        className="w-4 h-4 rounded-[6px] border-[#e5e5e5] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 w-32 sm:min-w-[210px] max-w-[125px] sm:max-w-none">
                    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
                      <div className="min-w-0">
                        <span className="font-semibold text-[#0a0a0a] block leading-tight text-xs truncate">
                          {formatShortName(p.nome, true)}
                        </span>
                        <span className="text-[10px] text-[#737373] font-normal block truncate leading-tight mt-0.5">
                          {p.responsavel_principal?.nome ? formatFirstName(p.responsavel_principal.nome) : "Responsável não informado"}
                        </span>
                        {dirty && (
                          <span className="text-[9px] font-semibold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-[6px] mt-0.5 inline-block">
                            Alterado
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/alunos/${pId}`}
                        target="_blank"
                        title="Ver carteirinha do aluno"
                        className="opacity-0 group-hover:opacity-100 hidden sm:inline-flex text-[#737373] hover:text-[#0a0a0a] p-1 rounded-[8px] hover:bg-[#f5f5f5] transition-all shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1 sm:px-2 w-24 sm:w-28 min-w-[95px] sm:min-w-[110px]">
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="R$ 0,00"
                      value={effectiveValor !== undefined && effectiveValor !== null ? moneyMask(effectiveValor) : ""}
                      onKeyDown={(e) => {
                        if (e.ctrlKey || e.metaKey) return;
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const formatted = moneyMask(e.target.value);
                        const numeric = moneyToNumber(formatted);
                        onUpdateField(pId, "valor_cobranca", numeric > 0 ? numeric : null, p);
                      }}
                      className="h-8 sm:h-8.5 px-2 text-xs bg-[#f5f5f5] rounded-[14px] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] font-medium text-[#0a0a0a] tabular-nums tracking-tight w-full shadow-none hover:bg-white transition-all"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1 sm:px-2 w-18 sm:w-24 min-w-[68px] sm:min-w-[80px]">
                    <NativeSelect
                      value={effectiveVencimento}
                      onChange={(e) => onUpdateField(pId, "dia_vencimento", e.target.value === "none" ? null : Number(e.target.value), p)}
                      className="h-8 sm:h-8.5 pl-2 pr-6 text-xs text-center rounded-[14px]"
                    >
                      <option value="none">-</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={String(d)}>
                          {d}
                        </option>
                      ))}
                    </NativeSelect>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 w-32 sm:w-44 min-w-[130px] sm:min-w-[160px]">
                    <NativeSelect
                      value={effectiveVeiculoId}
                      onChange={(e) => onUpdateField(pId, "veiculo_id", e.target.value, p)}
                      className="min-w-[125px] sm:min-w-[150px] h-8 sm:h-8.5 pl-2.5 pr-6 sm:pl-3 sm:pr-7 text-xs rounded-[14px] truncate"
                    >
                      {!effectiveVeiculoId && <option value="" disabled>Selecione</option>}
                      {(veiculos || []).map((v) => (
                        <option key={v.id} value={v.id}>
                          {formatarPlacaExibicao(v.placa)} {v.modelo ? `- ${v.modelo}` : ""}
                        </option>
                      ))}
                    </NativeSelect>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-2 sm:px-3 min-w-[160px] sm:min-w-[190px]">
                    <NativeSelect
                      value={effectiveEscolaId}
                      onChange={(e) => onUpdateField(pId, "escola_id", e.target.value, p)}
                      className="min-w-[150px] h-8 sm:h-8.5 pl-2.5 pr-6 sm:pl-3 sm:pr-7 text-xs rounded-[14px] truncate"
                    >
                      {!effectiveEscolaId && <option value="" disabled>Selecione</option>}
                      {(escolas || []).map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nome}
                        </option>
                      ))}
                    </NativeSelect>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 min-w-[125px]">
                    <NativeSelect
                      value={effectivePeriodo}
                      onChange={(e) => onUpdateField(pId, "periodo", e.target.value === "none" ? null : e.target.value, p)}
                      className="min-w-[115px] h-8 sm:h-8.5 pl-2.5 pr-6 sm:pl-3 sm:pr-7 text-xs rounded-[14px] truncate"
                    >
                      <option value="none">Nenhum</option>
                      {periodos.map((per) => (
                        <option key={per.value} value={per.value}>
                          {per.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 w-24 sm:w-28 min-w-[85px]">
                    <Input
                      value={effectiveTurma}
                      onChange={(e) => onUpdateField(pId, "turma", e.target.value || null, p)}
                      placeholder="Ex: 3º B"
                      className="h-8 sm:h-8.5 px-2 text-xs bg-[#f5f5f5] rounded-[14px] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-[#0a0a0a] placeholder:text-[#737373] min-w-[75px] shadow-none hover:bg-white transition-all font-medium"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 w-20 sm:w-24 min-w-[75px]">
                    <Input
                      value={effectiveSala}
                      onChange={(e) => onUpdateField(pId, "sala", e.target.value || null, p)}
                      placeholder="Ex: 12"
                      className="h-8 sm:h-8.5 px-2 text-xs bg-[#f5f5f5] rounded-[14px] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-[#0a0a0a] placeholder:text-[#737373] min-w-[65px] shadow-none hover:bg-white transition-all font-medium"
                    />
                  </td>

                  <td className="py-1.5 sm:py-2.5 px-1.5 sm:px-3 w-32 sm:w-36 min-w-[120px]">
                    <Input
                      value={effectiveProfessor}
                      onChange={(e) => onUpdateField(pId, "nome_professor", e.target.value || null, p)}
                      placeholder="Ex: Cláudia"
                      className="h-8 sm:h-8.5 px-2 text-xs bg-[#f5f5f5] rounded-[14px] border-[#e5e5e5] focus:bg-white focus:border-[#0a0a0a] text-[#0a0a0a] placeholder:text-[#737373] min-w-[100px] shadow-none hover:bg-white transition-all font-medium"
                    />
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
